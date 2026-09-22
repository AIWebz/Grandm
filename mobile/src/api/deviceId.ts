import { getItem, setItem } from "./secureStorage";

const DEVICE_ID_KEY = "grandma_device_id";

function randomId(): string {
  return "dev_" + Math.random().toString(36).slice(2) + Date.now().toString(36);
}

/** Stable per-install id backing the silent guest account (docs/ARCHITECTURE.md). */
export async function getOrCreateDeviceId(): Promise<string> {
  const existing = await getItem(DEVICE_ID_KEY);
  if (existing) return existing;
  const id = randomId();
  await setItem(DEVICE_ID_KEY, id);
  return id;
}
