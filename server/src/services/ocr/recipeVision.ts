import { anthropic } from "../ai/anthropicClient";
import { env } from "../../config/env";

const DIGITIZE_TOOL = {
  name: "emit_digitized_recipe",
  description: "Return the structured transcription of a handwritten recipe photo.",
  input_schema: {
    type: "object",
    properties: {
      name: { type: "string" },
      ingredients: { type: "array", items: { type: "string" }, description: "Preserve original wording as closely as possible" },
      steps: { type: "array", items: { type: "string" }, description: "Preserve original wording as closely as possible" },
      confidence: { type: "number", description: "0-1 overall transcription confidence" },
      uncertainPassages: { type: "array", items: { type: "string" }, description: "Phrases you weren't sure about" },
    },
    required: ["ingredients", "steps", "confidence"],
  },
} as const;

export interface DigitizedRecipe {
  name?: string;
  ingredients: string[];
  steps: string[];
  confidence: number;
  uncertainPassages: string[];
}

const LOW_CONFIDENCE_THRESHOLD = 0.75;

/**
 * Family Cookbook handwriting digitization (Section 6). Uses vision
 * tool-calling to extract structured ingredients/steps while preserving
 * original wording; low-confidence results are flagged with
 * `needsReview: true` rather than silently guessing, and the caller always
 * keeps the original photo attached alongside the digitized text.
 */
export async function digitizeHandwrittenRecipe(imageBase64: string, mediaType: string): Promise<DigitizedRecipe & { needsReview: boolean }> {
  const message = await anthropic.messages.create({
    model: env.anthropicVisionModel,
    max_tokens: 1500,
    system:
      "You transcribe photos of handwritten recipe cards into structured text. Preserve the original wording, spelling quirks, and phrasing as closely as possible - don't 'improve' or modernize the language. If any part is illegible or you're guessing, note it in uncertainPassages and lower your confidence score accordingly.",
    tools: [DIGITIZE_TOOL],
    tool_choice: { type: "tool", name: "emit_digitized_recipe" },
    messages: [
      {
        role: "user",
        content: [
          { type: "image", source: { type: "base64", media_type: mediaType as any, data: imageBase64 } },
          { type: "text", text: "Transcribe this handwritten recipe card." },
        ],
      },
    ],
  });

  const toolUse = message.content.find((b) => b.type === "tool_use");
  if (!toolUse || toolUse.type !== "tool_use") throw new Error("Model did not return a transcription");
  const parsed = toolUse.input as DigitizedRecipe;
  return { ...parsed, needsReview: parsed.confidence < LOW_CONFIDENCE_THRESHOLD };
}
