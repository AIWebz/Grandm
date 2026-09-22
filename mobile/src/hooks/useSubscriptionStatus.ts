import { useApiData } from "./useApiData";
import { api } from "../api/client";

export interface SubscriptionStatus {
  tier: "FREE" | "PLUS";
  expiresAt: string | null;
  autoRenew: boolean;
  products: { monthly: string; annual: string; priceMonthlyUsd: number };
}

export function useSubscriptionStatus() {
  const { data, loading, error, refresh } = useApiData<SubscriptionStatus>(
    () => api.get<SubscriptionStatus>("/subscriptions/status"),
    [],
    "subscription_status"
  );
  return { tier: data?.tier ?? "FREE", status: data, loading, error, refresh };
}
