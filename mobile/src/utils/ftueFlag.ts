import AsyncStorage from "@react-native-async-storage/async-storage";

const KEY = "grandma_seen_ftue";

export async function hasSeenFTUE(): Promise<boolean> {
  return (await AsyncStorage.getItem(KEY)) === "true";
}

export async function markFTUESeen(): Promise<void> {
  await AsyncStorage.setItem(KEY, "true");
}
