import { API_URL } from "./config";
import { useAuthStore } from "../state/authStore";

export interface ToolInvocation {
  tool: string;
  input: any;
  result: any;
  card?: { type: "task" | "grocery_list" | "recipe" | "reminder" | "schedule"; data: any };
}

export interface ChatStreamHandlers {
  onDelta: (text: string) => void;
  onDone: (final: { text: string; toolInvocations: ToolInvocation[] }) => void;
  onError: (message: string) => void;
}

/**
 * Streams the SSE chat response. React Native's fetch doesn't reliably
 * expose a readable stream body, so this uses XHR's `onprogress`, which
 * fires with the growing `responseText` as chunks arrive - the standard
 * approach for SSE on React Native (Section 18 streaming requirement).
 */
export function streamChatMessage(
  message: string,
  history: { role: "user" | "assistant"; content: string }[],
  handlers: ChatStreamHandlers
): () => void {
  const xhr = new XMLHttpRequest();
  let processedLength = 0;

  xhr.open("POST", `${API_URL}/chat/message`);
  xhr.setRequestHeader("Content-Type", "application/json");
  const token = useAuthStore.getState().token;
  if (token) xhr.setRequestHeader("Authorization", `Bearer ${token}`);

  const processChunk = (chunk: string) => {
    const frames = chunk.split("\n\n").filter(Boolean);
    for (const frame of frames) {
      const eventMatch = frame.match(/^event: (.+)$/m);
      const dataMatch = frame.match(/^data: (.+)$/m);
      if (!eventMatch || !dataMatch) continue;
      const event = eventMatch[1];
      let data: any;
      try {
        data = JSON.parse(dataMatch[1]);
      } catch {
        continue;
      }
      if (event === "delta") handlers.onDelta(data.text);
      else if (event === "done") handlers.onDone({ text: data.text, toolInvocations: data.toolInvocations ?? [] });
      else if (event === "error") handlers.onError(data.message);
    }
  };

  xhr.onprogress = () => {
    const newText = xhr.responseText.slice(processedLength);
    processedLength = xhr.responseText.length;
    if (newText) processChunk(newText);
  };

  xhr.onerror = () => handlers.onError("I'm having a little trouble hearing you right now - try again in a moment?");

  xhr.onload = () => {
    if (xhr.status === 402 || xhr.status === 503) {
      try {
        const body = JSON.parse(xhr.responseText);
        handlers.onError(body.message ?? "I'm having a little trouble hearing you right now - try again in a moment?");
      } catch {
        handlers.onError("I'm having a little trouble hearing you right now - try again in a moment?");
      }
    }
  };

  xhr.send(JSON.stringify({ message, history }));

  return () => xhr.abort();
}
