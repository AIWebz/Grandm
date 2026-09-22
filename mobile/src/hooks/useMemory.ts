import { api } from "../api/client";
import { useApiData } from "./useApiData";

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

  const setOptIn = async (enabled: boolean) => {
    await api.post("/memory/opt-in", { enabled });
    await state.refresh();
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
