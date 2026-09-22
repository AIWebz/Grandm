import { useState } from "react";
import { api } from "../api/client";
import { useApiData } from "./useApiData";
import { useApiGate } from "./useApiGate";

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

const GATE_REASONS = {
  account: "Create a free account, then upgrade to Grandma+, to start Our Family Cookbook.",
  plus: "Our Family Cookbook - with sharing through Messages - is a Grandma+ feature.",
};

export function useAddFamilyCookbookRecipe() {
  const [saving, setSaving] = useState(false);
  const gate = useApiGate();

  const addManual = (input: { name: string; relatedPerson?: string; memoryStory?: string; ingredients: string[]; steps: string[] }) =>
    gate(async () => {
      setSaving(true);
      try {
        return await api.post<{ recipe: FamilyCookbookRecipe }>("/family-cookbook", input);
      } finally {
        setSaving(false);
      }
    }, GATE_REASONS);

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
    }, GATE_REASONS);

  return { addManual, digitize, saving };
}
