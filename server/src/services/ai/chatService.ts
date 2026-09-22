import Anthropic from "@anthropic-ai/sdk";
import { anthropic } from "./anthropicClient";
import { GRANDMA_TOOLS } from "./tools";
import { TOOL_HANDLERS, ToolInvocationResult } from "./toolHandlers";
import { buildSystemPrompt } from "./systemPrompt";
import { prisma } from "../../db/prisma";
import { env } from "../../config/env";
import { startOfDay, endOfDay } from "../../utils/dates";
import { PersonalityStyle } from "../../types/enums";

export interface ChatTurnResult {
  text: string;
  toolInvocations: ToolInvocationResult[];
}

async function loadUserContext(userId: string) {
  const user = await prisma.user.findUniqueOrThrow({ where: { id: userId } });
  const memoryFacts = user.memoryOptIn
    ? (await prisma.memoryFact.findMany({ where: { userId } })).map((f) => f.fact)
    : [];
  const todaysTasks = await prisma.task.findMany({
    where: { userId, dueDate: { gte: startOfDay(new Date()), lte: endOfDay(new Date()) } },
    orderBy: { createdAt: "asc" },
  });
  return { user, memoryFacts, todaysTasks };
}

/**
 * Runs one turn of the tool-calling loop: stream model output, and if it
 * requests a tool, execute it against Prisma, feed the result back, and
 * keep going until the model produces a final natural-language answer.
 * `onTextDelta` is called for every streamed text token so the HTTP route
 * can forward it to the client as it arrives (Section 18 streaming req).
 */
export async function runChatTurn(
  userId: string,
  history: { role: "user" | "assistant"; content: string }[],
  userMessage: string,
  onTextDelta: (delta: string) => void
): Promise<ChatTurnResult> {
  const { user, memoryFacts, todaysTasks } = await loadUserContext(userId);
  const system = buildSystemPrompt({
    preferredName: user.preferredName,
    personalityStyle: user.personalityStyle as PersonalityStyle,
    memoryFacts,
    todaysTasks: todaysTasks.map((t) => ({ title: t.title, completed: t.completed })),
  });

  const messages: Anthropic.MessageParam[] = [
    ...history.map((h) => ({ role: h.role, content: h.content } as Anthropic.MessageParam)),
    { role: "user", content: userMessage },
  ];

  const toolInvocations: ToolInvocationResult[] = [];
  let finalText = "";

  for (let iteration = 0; iteration < 5; iteration++) {
    const stream = anthropic.messages.stream({
      model: env.anthropicModel,
      max_tokens: 1024,
      system,
      messages,
      tools: GRANDMA_TOOLS,
    });

    stream.on("text", (delta) => {
      finalText += delta;
      onTextDelta(delta);
    });

    const finalMessage = await stream.finalMessage();

    if (finalMessage.stop_reason !== "tool_use") {
      break;
    }

    messages.push({ role: "assistant", content: finalMessage.content });

    const toolResults: Anthropic.ToolResultBlockParam[] = [];
    for (const block of finalMessage.content) {
      if (block.type !== "tool_use") continue;
      const handler = TOOL_HANDLERS[block.name];
      const invocation = handler
        ? await handler(userId, block.input)
        : { tool: block.name, input: block.input, result: { error: "Unknown tool" } };
      toolInvocations.push(invocation);
      toolResults.push({
        type: "tool_result",
        tool_use_id: block.id,
        content: JSON.stringify(invocation.result),
      });
    }
    messages.push({ role: "user", content: toolResults });
    // Loop again so the model can narrate a confirmation referencing the tool result.
  }

  await prisma.chatMessage.create({ data: { userId, role: "USER", content: userMessage } });
  await prisma.chatMessage.create({
    data: { userId, role: "ASSISTANT", content: finalText, toolInvocations: JSON.stringify(toolInvocations) },
  });

  return { text: finalText, toolInvocations };
}
