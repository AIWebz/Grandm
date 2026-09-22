import fetch from "node-fetch";
import { env } from "../../../config/env";
import { AiProvider, AiMessage, AiTool, ChatTurnParams, ChatTurnResult, AiToolCall } from "../types";

/**
 * Hosted, free-tier AI backend via Groq (https://console.groq.com), selected
 * with AI_PROVIDER=groq. Unlike Ollama (which needs a machine with several
 * GB of RAM to run a local model), Groq runs the model on their hardware
 * over a plain HTTPS API - the right choice for a small always-on backend
 * (e.g. Render's free web service) that doesn't have the resources to run
 * Ollama itself. Groq's API is OpenAI-compatible; one free API key from
 * console.groq.com is all that's needed, no credit card.
 */

interface GroqToolCall {
  id: string;
  type: "function";
  function: { name: string; arguments: string };
}

interface GroqMessage {
  role: "system" | "user" | "assistant" | "tool";
  content: string | Array<{ type: "text"; text: string } | { type: "image_url"; image_url: { url: string } }> | null;
  tool_calls?: GroqToolCall[];
  tool_call_id?: string;
}

function toGroqTools(tools: AiTool[]) {
  return tools.map((t) => ({
    type: "function" as const,
    function: { name: t.name, description: t.description, parameters: t.input_schema },
  }));
}

function toGroqMessages(system: string, messages: AiMessage[]): GroqMessage[] {
  const result: GroqMessage[] = [{ role: "system", content: system }];
  for (const m of messages) {
    if (m.role === "user") {
      result.push({ role: "user", content: m.content });
    } else if (m.role === "assistant") {
      result.push({
        role: "assistant",
        content: m.text || null,
        tool_calls: m.toolCalls?.map((c) => ({
          id: c.id,
          type: "function",
          function: { name: c.name, arguments: JSON.stringify(c.input) },
        })),
      });
    } else {
      result.push({ role: "tool", tool_call_id: m.toolCallId, content: m.content });
    }
  }
  return result;
}

async function groqRequest(body: Record<string, unknown>): Promise<any> {
  const response = await fetch("https://api.groq.com/openai/v1/chat/completions", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${env.groqApiKey}`,
    },
    body: JSON.stringify(body),
  });
  if (!response.ok) {
    const text = await response.text().catch(() => "");
    throw new Error(`Groq request failed (${response.status}): ${text || response.statusText}`);
  }
  return response.json();
}

function extractJson<T>(raw: string): T {
  try {
    return JSON.parse(raw) as T;
  } catch {
    const match = raw.match(/\{[\s\S]*\}/);
    if (match) return JSON.parse(match[0]) as T;
    throw new Error("Groq did not return valid JSON");
  }
}

/** Forces a single structured tool call, the same trick anthropicProvider uses - far more reliable than response_format:"json_object" for matching an exact shape. */
async function groqStructuredCall<T>(model: string, system: string, prompt: string, schema: Record<string, unknown>, extraContent?: Array<{ type: "text"; text: string } | { type: "image_url"; image_url: { url: string } }>): Promise<T> {
  const json = await groqRequest({
    model,
    messages: [
      { role: "system", content: system },
      { role: "user", content: extraContent ? [{ type: "text", text: prompt }, ...extraContent] : prompt },
    ],
    tools: [{ type: "function", function: { name: "emit_result", description: "Return the result in the exact structure requested.", parameters: schema } }],
    tool_choice: { type: "function", function: { name: "emit_result" } },
  });
  const call = json.choices?.[0]?.message?.tool_calls?.[0];
  if (!call) throw new Error("Groq did not return structured output");
  return extractJson<T>(call.function.arguments);
}

export const groqProvider: AiProvider = {
  async chatTurn({ system, messages, tools, onTextDelta }: ChatTurnParams): Promise<ChatTurnResult> {
    const response = await fetch("https://api.groq.com/openai/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${env.groqApiKey}`,
      },
      body: JSON.stringify({
        model: env.groqModel,
        messages: toGroqMessages(system, messages),
        tools: toGroqTools(tools),
        stream: true,
      }),
    });
    if (!response.ok || !response.body) {
      const text = await response.text().catch(() => "");
      throw new Error(`Groq request failed (${response.status}): ${text || response.statusText}`);
    }

    let text = "";
    // Streamed tool call fragments arrive by index and must be reassembled -
    // name/id show up once, `arguments` streams in as partial JSON text.
    const toolCallsByIndex = new Map<number, { id: string; name: string; arguments: string }>();
    let buffer = "";

    for await (const chunk of response.body as any as AsyncIterable<Buffer>) {
      buffer += chunk.toString("utf-8");
      const lines = buffer.split("\n");
      buffer = lines.pop() ?? "";
      for (const line of lines) {
        const trimmed = line.trim();
        if (!trimmed.startsWith("data:")) continue;
        const payload = trimmed.slice(5).trim();
        if (payload === "[DONE]") continue;
        const event = JSON.parse(payload);
        const delta = event.choices?.[0]?.delta;
        if (delta?.content) {
          text += delta.content;
          onTextDelta(delta.content);
        }
        for (const tc of delta?.tool_calls ?? []) {
          const existing = toolCallsByIndex.get(tc.index) ?? { id: "", name: "", arguments: "" };
          if (tc.id) existing.id = tc.id;
          if (tc.function?.name) existing.name = tc.function.name;
          if (tc.function?.arguments) existing.arguments += tc.function.arguments;
          toolCallsByIndex.set(tc.index, existing);
        }
      }
    }

    const toolCalls: AiToolCall[] = [...toolCallsByIndex.values()].map((c) => ({
      id: c.id,
      name: c.name,
      input: c.arguments ? extractJson(c.arguments) : {},
    }));

    return {
      assistantMessage: { role: "assistant", text, toolCalls: toolCalls.length ? toolCalls : undefined },
      stopReason: toolCalls.length ? "tool_use" : "end",
    };
  },

  async generateText(system, prompt, maxTokens = 400) {
    const json = await groqRequest({
      model: env.groqModel,
      messages: [
        { role: "system", content: system },
        { role: "user", content: prompt },
      ],
      max_tokens: maxTokens,
    });
    return (json.choices?.[0]?.message?.content ?? "").trim();
  },

  async generateStructured<T>(system: string, prompt: string, schema: Record<string, unknown>): Promise<T> {
    return groqStructuredCall<T>(env.groqModel, system, prompt, schema);
  },

  async generateStructuredFromImage<T>(system: string, prompt: string, imageBase64: string, mediaType: string, schema: Record<string, unknown>): Promise<T> {
    return groqStructuredCall<T>(env.groqVisionModel, system, prompt, schema, [
      { type: "image_url", image_url: { url: `data:${mediaType};base64,${imageBase64}` } },
    ]);
  },
};
