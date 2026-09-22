import { api, ApiError } from "../api/client";
import { useApiData } from "./useApiData";

export interface ScheduleEvent {
  id: string;
  title: string;
  startTime: string;
  endTime: string | null;
  isFixed: boolean;
}

export function useSchedule(dateIso: string) {
  const state = useApiData<{ events: ScheduleEvent[] }>(
    () => api.get<{ events: ScheduleEvent[] }>(`/schedule?from=${dateIso}&to=${dateIso}`),
    [dateIso],
    `schedule_${dateIso}`
  );

  const addEvent = async (title: string, startTime: string, endTime?: string) => {
    await api.post("/schedule", { title, startTime, endTime });
    await state.refresh();
  };

  const rescheduleEvent = async (id: string, startTime: string): Promise<boolean> => {
    try {
      await api.patch(`/schedule/${id}`, { startTime });
      await state.refresh();
      return true;
    } catch (e) {
      if (e instanceof ApiError && e.code === "FIXED") return false;
      throw e;
    }
  };

  const removeEvent = async (id: string) => {
    await api.delete(`/schedule/${id}`);
    await state.refresh();
  };

  return { ...state, events: state.data?.events ?? [], addEvent, rescheduleEvent, removeEvent };
}
