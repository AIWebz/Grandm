import { anthropic } from "./anthropicClient";
import { env } from "../../config/env";

const RECIPE_TOOL = {
  name: "emit_recipe",
  description: "Return the finished structured recipe.",
  input_schema: {
    type: "object",
    properties: {
      name: { type: "string" },
      category: { type: "string" },
      servings: { type: "number" },
      prepMinutes: { type: "number" },
      cookMinutes: { type: "number" },
      difficulty: { type: "string", enum: ["easy", "medium", "hard"] },
      dietaryTags: { type: "array", items: { type: "string" } },
      ingredients: {
        type: "array",
        items: { type: "object", properties: { name: { type: "string" }, quantity: { type: "string" }, unit: { type: "string" } }, required: ["name"] },
      },
      steps: {
        type: "array",
        items: { type: "object", properties: { text: { type: "string" }, tip: { type: "string" } }, required: ["text"] },
      },
      substitutions: { type: "array", items: { type: "string" } },
    },
    required: ["name", "ingredients", "steps"],
  },
} as const;

export interface GeneratedRecipe {
  name: string;
  category: string;
  servings: number;
  prepMinutes: number;
  cookMinutes: number;
  difficulty: string;
  dietaryTags: string[];
  ingredients: { name: string; quantity?: string; unit?: string }[];
  steps: { text: string; tip?: string }[];
  substitutions: string[];
}

export async function generateRecipe(prompt: string, dietary?: string[]): Promise<GeneratedRecipe> {
  const message = await anthropic.messages.create({
    model: env.anthropicModel,
    max_tokens: 1500,
    system:
      "You are Grandma AI generating a specific, cookable recipe. Sprinkle 1-3 short 'Grandma's Tips' into the `tip` field on relevant steps " +
      (dietary?.length ? `Respect these dietary constraints: ${dietary.join(", ")}.` : ""),
    tools: [RECIPE_TOOL],
    tool_choice: { type: "tool", name: "emit_recipe" },
    messages: [{ role: "user", content: prompt }],
  });

  const toolUse = message.content.find((b) => b.type === "tool_use");
  if (!toolUse || toolUse.type !== "tool_use") throw new Error("Model did not return a recipe");
  return toolUse.input as GeneratedRecipe;
}

/** Contextual "my sauce is too thick"-style Q&A, scoped to one recipe + step (Section 5). */
export async function answerRecipeQuestion(params: {
  recipeName: string;
  ingredients: { name: string; quantity?: string; unit?: string }[];
  currentStepText?: string;
  question: string;
}): Promise<string> {
  const message = await anthropic.messages.create({
    model: env.anthropicModel,
    max_tokens: 400,
    system:
      "You are Grandma AI helping someone actively cooking a specific recipe. Answer ONLY using the recipe context given - be specific and practical, in a warm grandmotherly voice, 2-4 sentences.",
    messages: [
      {
        role: "user",
        content: `Recipe: ${params.recipeName}\nIngredients: ${params.ingredients.map((i) => `${i.quantity ?? ""} ${i.unit ?? ""} ${i.name}`).join(", ")}\nCurrent step: ${params.currentStepText ?? "not specified"}\n\nQuestion: ${params.question}`,
      },
    ],
  });
  const block = message.content.find((b) => b.type === "text");
  return block && block.type === "text" ? block.text.trim() : "I'm not sure, sweetheart - can you tell me a bit more?";
}
