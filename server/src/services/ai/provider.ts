import { env } from "../../config/env";
import { AiProvider } from "./types";
import { anthropicProvider } from "./providers/anthropicProvider";
import { ollamaProvider } from "./providers/ollamaProvider";
import { groqProvider } from "./providers/groqProvider";

export function getAiProvider(): AiProvider {
  if (env.aiProvider === "ollama") return ollamaProvider;
  if (env.aiProvider === "groq") return groqProvider;
  return anthropicProvider;
}

/**
 * Whether the configured provider is ready to actually serve a request.
 * Ollama is "configured" by definition (no key to check) - if the local
 * server isn't running, that surfaces as a normal request failure, handled
 * the same graceful way as any other AI_UNAVAILABLE case.
 */
export function isAiConfigured(): boolean {
  if (env.aiProvider === "ollama") return true;
  if (env.aiProvider === "groq") return Boolean(env.groqApiKey);
  return Boolean(env.anthropicApiKey);
}
