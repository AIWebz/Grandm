import { useState } from "react";
import * as WebBrowser from "expo-web-browser";
import { api, ApiError } from "../api/client";

/**
 * Stripe Checkout via an in-app browser (Section 16: primary billing rail).
 * Unlike native IAP, this needs no dev-client/EAS build - it works in Expo
 * Go too, since it's just opening a URL. After the browser closes we can't
 * know instantly whether the webhook has already updated the server, so
 * callers should re-fetch subscription status a moment after `checkout()`
 * resolves (see SubscriptionSettingsScreen).
 */
export function useStripeCheckout() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const checkout = async (): Promise<boolean> => {
    setLoading(true);
    setError(null);
    try {
      const res = await api.post<{ url: string }>("/billing/checkout-session");
      const result = await WebBrowser.openAuthSessionAsync(res.url);
      return result.type === "success" || result.type === "dismiss";
    } catch (e) {
      setError(e instanceof ApiError ? e.message : "Something went wrong opening checkout.");
      return false;
    } finally {
      setLoading(false);
    }
  };

  const manageSubscription = async (): Promise<void> => {
    setLoading(true);
    setError(null);
    try {
      const res = await api.post<{ url: string }>("/billing/portal-session");
      await WebBrowser.openAuthSessionAsync(res.url);
    } catch (e) {
      setError(e instanceof ApiError ? e.message : "Something went wrong opening the billing portal.");
    } finally {
      setLoading(false);
    }
  };

  return { checkout, manageSubscription, loading, error };
}
