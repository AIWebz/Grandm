import { ApiError } from "../api/client";
import { useAppStore } from "../state/appStore";

/**
 * Wraps an API call that might come back 403 ACCOUNT_REQUIRED or
 * PLUS_REQUIRED, surfacing the right prompt sheet instead of a raw error.
 * Returns null when gated (the sheet is already showing), rethrows
 * anything else.
 */
export function useApiGate() {
  const requireFullAccount = useAppStore((s) => s.requireFullAccount);
  const requirePlus = useAppStore((s) => s.requirePlus);

  return async function gate<T>(fn: () => Promise<T>, reasons: { account?: string; plus?: string }): Promise<T | null> {
    try {
      return await fn();
    } catch (e) {
      if (e instanceof ApiError && e.code === "ACCOUNT_REQUIRED") {
        requireFullAccount(reasons.account ?? "Create a free account to do this.");
        return null;
      }
      if (e instanceof ApiError && e.code === "PLUS_REQUIRED") {
        requirePlus(reasons.plus ?? reasons.account ?? "This is a Grandma+ feature.");
        return null;
      }
      throw e;
    }
  };
}
