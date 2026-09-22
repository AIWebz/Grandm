import { useState } from "react";

/**
 * Web build of useIAP.ts. Native App Store/Play Store billing has no
 * browser equivalent, so this never requires react-native-iap - Stripe
 * Checkout (see useSubscriptionStatus / the paywall screen) is the billing
 * rail on web already, this hook just reports "unavailable" here.
 */
export function useIAP(_productIds: string[]) {
  const [error] = useState<string | null>(null);

  const purchase = async (_productId: string) => {
    // no-op on web: the paywall screen uses Stripe Checkout instead.
  };

  const restore = async () => {
    // no-op on web: the paywall screen uses Stripe Checkout instead.
  };

  return { available: false, purchase, restore, purchasing: false, error };
}
