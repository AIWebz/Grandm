import { useState } from "react";
import { api } from "../api/client";
import { useApiData } from "./useApiData";

export interface Ingredient {
  name: string;
  quantity?: string;
  unit?: string;
}

export interface RecipeStep {
  text: string;
  tip?: string;
}

export interface Recipe {
  id: string;
  name: string;
  category: string;
  imageUrl: string | null;
  servings: number;
  prepMinutes: number;
  cookMinutes: number;
  difficulty: string;
  ingredients: Ingredient[];
  steps: RecipeStep[];
  substitutions: string[];
  dietaryTags: string[];
  isGenerated: boolean;
  savedByUsers: string[];
}

export const RECIPE_CATEGORIES = [
  "American classics",
  "Italian",
  "Mexican",
  "Southern",
  "Comfort food",
  "Baking",
  "Breakfast",
  "Dinner",
  "Desserts",
  "Family recipes",
];

export function useRecipes(filters: { category?: string; search?: string; difficulty?: string }) {
  const query = new URLSearchParams();
  if (filters.category) query.set("category", filters.category);
  if (filters.search) query.set("search", filters.search);
  if (filters.difficulty) query.set("difficulty", filters.difficulty);
  const qs = query.toString();

  return useApiData<{ recipes: Recipe[] }>(
    () => api.get<{ recipes: Recipe[] }>(`/recipes${qs ? `?${qs}` : ""}`),
    [qs],
    `recipes_${qs}`
  );
}

export function useRecipeDetail(recipeId: string) {
  return useApiData<{ recipe: Recipe }>(() => api.get<{ recipe: Recipe }>(`/recipes/${recipeId}`), [recipeId], `recipe_${recipeId}`);
}

export interface RecipeUsageStatus {
  used: number;
  cap: number;
  remaining: number;
  atCap: boolean;
  unlimited: boolean;
}

/** Free tier gets a small daily allowance of AI-generated recipes on top of the traditional catalog; Grandma+ is unlimited. */
export function useRecipeUsage(refreshKey: number) {
  return useApiData<RecipeUsageStatus>(() => api.get<RecipeUsageStatus>("/recipes/usage"), [refreshKey]);
}

export function useGenerateRecipe() {
  const [generating, setGenerating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [atCap, setAtCap] = useState(false);

  const generate = async (prompt: string, category?: string): Promise<Recipe | null> => {
    setGenerating(true);
    setError(null);
    setAtCap(false);
    try {
      const res = await api.post<{ recipe: Recipe }>("/recipes/generate", { prompt, category });
      return res.recipe;
    } catch (e: any) {
      if (e.code === "RECIPE_CAP_REACHED") setAtCap(true);
      setError(e.message ?? "I'm having a little trouble hearing you right now - try again in a moment?");
      return null;
    } finally {
      setGenerating(false);
    }
  };

  return { generate, generating, error, atCap };
}
