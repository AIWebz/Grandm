import { api } from "../api/client";
import { useApiData } from "./useApiData";

export interface HomeTask {
  id: string;
  title: string;
  category: string;
  completed: boolean;
}

export interface HomeData {
  preferredName: string | null;
  greeting: string;
  tasks: HomeTask[];
  progress: { completed: number; total: number };
}

export function useHome() {
  return useApiData<HomeData>(() => api.get<HomeData>("/home"), [], "home");
}
