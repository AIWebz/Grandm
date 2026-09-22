import * as Notifications from "expo-notifications";
import { Platform } from "react-native";

/**
 * Requests OS-level notification permission (separate from the in-app
 * frequency/category controls - Section 11) and returns an Expo push
 * token, which the server's `expo` push adapter can send to directly.
 */
export async function registerForPushNotifications(): Promise<string | null> {
  // Web push needs a VAPID key + service worker Expo doesn't set up by
  // default (unlike iOS/Android, which just work via Expo's push service).
  if (Platform.OS === "web") return null;

  const { status: existingStatus } = await Notifications.getPermissionsAsync();
  let finalStatus = existingStatus;
  if (existingStatus !== "granted") {
    const { status } = await Notifications.requestPermissionsAsync();
    finalStatus = status;
  }
  if (finalStatus !== "granted") return null;

  if (Platform.OS === "android") {
    await Notifications.setNotificationChannelAsync("default", {
      name: "default",
      importance: Notifications.AndroidImportance.DEFAULT,
    });
  }

  const token = await Notifications.getExpoPushTokenAsync();
  return token.data;
}
