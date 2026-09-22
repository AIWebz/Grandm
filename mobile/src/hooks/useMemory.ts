import { api } from "../api/client";
import { useApiData } from "./useApiData";
import { useApiGate } from "./useApiGate";

export interface MemoryFact {
  id: string;
  category: string;
  fact: string;
}

export function useMemory() {
  const state = useApiData<{ memoryOptIn: boolean; facts: MemoryFact[] }>(
    () => api.get<{ memoryOptIn: boolean; facts: MemoryFact[] }>("/memory"),
    [],
    "memory"
  );

  const gate = useApiGate();

  const setOptIn = async (enabled: boolean) => {
    const result = await gate(() => api.post("/memory/opt-in", { enabled }), {
      plus: "Long-term memory - remembering favorites, dietary needs, and routines - is a Grandma+ feature.",
    });
    if (result) await state.refresh();
  };

  const updateFact = async (id: string, fact: string) => {
    await api.patch(`/memory/${id}`, { fact });
    await state.refresh();
  };

  const deleteFact = async (id: string) => {
    await api.delete(`/memory/${id}`);
    await state.refresh();
  };

  const forgetEverything = async () => {
    await api.delete("/memory");
    await state.refresh();
  };

  return {
    memoryOptIn: state.data?.memoryOptIn ?? false,
    facts: state.data?.facts ?? [],
    loading: state.loading,
    setOptIn,
    updateFact,
    deleteFact,
    forgetEverything,
  };
}
