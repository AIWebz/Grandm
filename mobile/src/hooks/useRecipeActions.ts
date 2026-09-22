import { useState } from "react";
import { api, ApiError } from "../api/client";
import { Ingredient } from "./useRecipes";
import { useAppStore } from "../state/appStore";

export function useScaledIngredients(recipeId: string) {
  const [ingredients, setIngredients] = useState<Ingredient[] | null>(null);
  const [loading, setLoading] = useState(false);

  const scale = async (servings: number) => {
    setLoading(true);
    try {
      const res = await api.get<{ servings: number; ingredients: Ingredient[] }>(`/recipes/${recipeId}/scale?servings=${servings}`);
      setIngredients(res.ingredients);
    } finally {
      setLoading(false);
    }
  };

  return { ingredients, scale, loading };
}

export function useSaveRecipe() {
  const requireFullAccount = useAppStore((s) => s.requireFullAccount);
  const [saving, setSaving] = useState(false);

  const save = async (recipeId: string) => {
    setSaving(true);
    try {
      await api.post(`/recipes/${recipeId}/save`);
      return true;
    } catch (e) {
      if (e instanceof ApiError && e.code === "ACCOUNT_REQUIRED") {
        requireFullAccount("Create a free account to save recipes to My Recipes.");
        return false;
      }
      throw e;
    } finally {
      setSaving(false);
    }
  };

  return { save, saving };
}

export function useRecipeToGroceryList() {
  const [adding, setAdding] = useState(false);
  const push = async (recipeId: string) => {
    setAdding(true);
    try {
      return await api.post<{ groceryList: any }>(`/recipes/${recipeId}/grocery-list`);
    } finally {
      setAdding(false);
    }
  };
  return { push, adding };
}

export function useRecipeQuestion() {
  const [answer, setAnswer] = useState<string | null>(null);
  const [asking, setAsking] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const ask = async (params: { recipeName: string; ingredients: Ingredient[]; currentStepText?: string; question: string }) => {
    setAsking(true);
    setError(null);
    setAnswer(null);
    try {
      const res = await api.post<{ answer: string }>("/chat/recipe-question", params);
      setAnswer(res.answer);
    } catch (e: any) {
      setError(e.message ?? "I'm having a little trouble hearing you right now - try again in a moment?");
    } finally {
      setAsking(false);
    }
  };

  return { ask, answer, asking, error };
}
