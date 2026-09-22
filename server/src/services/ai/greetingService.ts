import { anthropic } from "./anthropicClient";
import { env } from "../../config/env";
import { prisma } from "../../db/prisma";
import { startOfDay, endOfDay } from "../../utils/dates";

/**
 * Home screen's varying greeting line (Section 3). Generated server-side
 * from the user's real task list only, so the model can never reference
 * tasks that don't exist - the tool list isn't even offered here.
 */
export async function generateHomeGreeting(userId: string): Promise<string> {
  const user = await prisma.user.findUniqueOrThrow({ where: { id: userId } });
  const tasks = await prisma.task.findMany({
    where: { userId, dueDate: { gte: startOfDay(new Date()), lte: endOfDay(new Date()) } },
  });
  const remaining = tasks.filter((t) => !t.completed);
  const name = user.preferredName ?? "there";

  if (!env.anthropicApiKey) {
    return remaining.length
      ? `Good to see you, ${name}. We've got ${remaining.length} thing${remaining.length === 1 ? "" : "s"} on the list today - let's take it one step at a time.`
      : `Good to see you, ${name}. Nothing pressing today - what a nice change of pace.`;
  }

  const taskSummary = tasks.length
    ? tasks.map((t) => `- ${t.title}${t.completed ? " (done)" : ""}`).join("\n")
    : "No tasks today.";

  const message = await anthropic.messages.create({
    model: env.anthropicModel,
    max_tokens: 120,
    system:
      "You write one short (1-2 sentence) warm, grandmotherly greeting line for a home screen. " +
      "Base it ONLY on the exact task list given - never invent tasks. Vary the wording naturally day to day. " +
      "Personality style: " + user.personalityStyle + ". Do not use markdown.",
    messages: [
      {
        role: "user",
        content: `User's preferred name: ${name}\nTime of day context: use "morning/afternoon/evening" tone appropriately.\nToday's tasks:\n${taskSummary}`,
      },
    ],
  });

  const block = message.content.find((b) => b.type === "text");
  return block && block.type === "text" ? block.text.trim() : `Good to see you, ${name}.`;
}
