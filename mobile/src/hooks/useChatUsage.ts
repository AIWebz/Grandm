import { api } from "../api/client";
import { useApiData } from "./useApiData";

export interface UsageStatus {
  used: number;
  cap: number;
  remaining: number;
  atCap: boolean;
  unlimited: boolean;
  rewardedUnlocksUsed: number;
  rewardedUnlocksRemaining: number;
}

export function useChatUsage(refreshKey: number) {
  return useApiData<UsageStatus>(() => api.get<UsageStatus>("/chat/usage"), [refreshKey]);
}
