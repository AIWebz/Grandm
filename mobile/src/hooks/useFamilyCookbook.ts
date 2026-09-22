import { useState } from "react";
import { api, ApiError } from "../api/client";
import { useApiData } from "./useApiData";
import { useAppStore } from "../state/appStore";

export interface FamilyCookbookRecipe {
  id: string;
  name: string;
  relatedPerson: string | null;
  memoryStory: string | null;
  photoUrl: string | null;
  originalPhotoUrl: string | null;
  ingredients: string[];
  steps: string[];
  transcriptionConfidence: number | null;
  needsReview: boolean;
}

export function useFamilyCookbook() {
  return useApiData<{ recipes: FamilyCookbookRecipe[] }>(
    () => api.get<{ recipes: FamilyCookbookRecipe[] }>("/family-cookbook"),
    [],
    "family_cookbook"
  );
}

export function useFamilyCookbookDetail(recipeId: string) {
  return useApiData<{ recipe: FamilyCookbookRecipe }>(
    () => api.get<{ recipe: FamilyCookbookRecipe }>(`/family-cookbook/${recipeId}`),
    [recipeId]
  );
}

function useAccountGate() {
  const requireFullAccount = useAppStore((s) => s.requireFullAccount);
  return async <T,>(fn: () => Promise<T>, reason: string): Promise<T | null> => {
    try {
      return await fn();
    } catch (e) {
      if (e instanceof ApiError && e.code === "ACCOUNT_REQUIRED") {
        requireFullAccount(reason);
        return null;
      }
      throw e;
    }
  };
}

export function useAddFamilyCookbookRecipe() {
  const [saving, setSaving] = useState(false);
  const gate = useAccountGate();

  const addManual = (input: { name: string; relatedPerson?: string; memoryStory?: string; ingredients: string[]; steps: string[] }) =>
    gate(async () => {
      setSaving(true);
      try {
        return await api.post<{ recipe: FamilyCookbookRecipe }>("/family-cookbook", input);
      } finally {
        setSaving(false);
      }
    }, "Create a free account to start Our Family Cookbook.");

  const digitize = (photoUri: string, mimeType: string) =>
    gate(async () => {
      setSaving(true);
      try {
        const formData = new FormData();
        formData.append("photo", { uri: photoUri, name: "recipe.jpg", type: mimeType } as any);
        return await api.postForm<{ recipe: FamilyCookbookRecipe; uncertainPassages: string[] }>("/family-cookbook/digitize", formData);
      } finally {
        setSaving(false);
      }
    }, "Create a free account to digitize handwritten recipes.");

  return { addManual, digitize, saving };
}
