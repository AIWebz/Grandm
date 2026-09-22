import { api } from "../api/client";
import { useApiData } from "./useApiData";

export interface Task {
  id: string;
  title: string;
  category: string;
  notes: string | null;
  dueDate: string | null;
  completed: boolean;
  recurrence: string;
  isFixed: boolean;
  source: string;
}

export function useTasks(params?: { date?: string; category?: string }) {
  const query = new URLSearchParams();
  if (params?.date) query.set("date", params.date);
  if (params?.category) query.set("category", params.category);
  const qs = query.toString();

  const state = useApiData<{ tasks: Task[] }>(
    () => api.get<{ tasks: Task[] }>(`/tasks${qs ? `?${qs}` : ""}`),
    [qs],
    `tasks_${qs}`
  );

  const toggleComplete = async (task: Task) => {
    await api.patch(`/tasks/${task.id}`, { completed: !task.completed });
    await state.refresh();
  };

  const createTask = async (input: { title: string; category?: string; dueDate?: string; recurrence?: string }) => {
    await api.post("/tasks", input);
    await state.refresh();
  };

  const deleteTask = async (id: string) => {
    await api.delete(`/tasks/${id}`);
    await state.refresh();
  };

  const rescheduleTask = async (id: string, dueDate: string) => {
    await api.patch(`/tasks/${id}`, { dueDate });
    await state.refresh();
  };

  return { ...state, tasks: state.data?.tasks ?? [], toggleComplete, createTask, deleteTask, rescheduleTask };
}
