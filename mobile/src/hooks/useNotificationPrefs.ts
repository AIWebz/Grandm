import { api, ApiError } from "../api/client";
import { useApiData } from "./useApiData";
import { useAppStore } from "../state/appStore";

export interface NotificationPreferences {
  frequency: "OFF" | "LOW" | "NORMAL";
  taskReminders: boolean;
  mealTimePrompts: boolean;
  encouragement: boolean;
  pushToken: string | null;
  quietHoursStart: string | null;
  quietHoursEnd: string | null;
}

export function useNotificationPrefs() {
  const state = useApiData<{ preferences: NotificationPreferences }>(
    () => api.get<{ preferences: NotificationPreferences }>("/notifications/preferences"),
    [],
    "notification_prefs"
  );
  const requireFullAccount = useAppStore((s) => s.requireFullAccount);

  const update = async (patch: Partial<NotificationPreferences>) => {
    await api.patch("/notifications/preferences", patch);
    await state.refresh();
  };

  const registerToken = async (pushToken: string) => {
    try {
      await api.post("/notifications/register-token", { pushToken });
      await state.refresh();
    } catch (e) {
      if (e instanceof ApiError && e.code === "ACCOUNT_REQUIRED") {
        requireFullAccount("Create a free account to turn on notifications.");
        return;
      }
      throw e;
    }
  };

  return { preferences: state.data?.preferences, loading: state.loading, update, registerToken };
}
