import { useEffect, useState } from "react";
import { Platform } from "react-native";
import { api } from "../api/client";

/**
 * StoreKit 2 / Play Billing purchase flow via react-native-iap. This is a
 * native module: it needs a custom dev client / EAS build to run (not
 * Expo Go), and real product ids configured in App Store Connect / Play
 * Console, which this sandbox doesn't have (docs/ARCHITECTURE.md). The
 * purchase + server-side validation call shape below is real; `available`
 * just reports whether the native module loaded on this runtime.
 */
export function useIAP(productIds: string[]) {
  const [available, setAvailable] = useState(false);
  const [purchasing, setPurchasing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  let IAP: typeof import("react-native-iap") | null = null;
  try {
    // eslint-disable-next-line @typescript-eslint/no-var-requires
    IAP = require("react-native-iap");
  } catch {
    IAP = null;
  }

  useEffect(() => {
    if (!IAP) return;
    let mounted = true;
    IAP.initConnection()
      .then(() => mounted && setAvailable(true))
      .catch(() => mounted && setAvailable(false));
    return () => {
      mounted = false;
      IAP?.endConnection();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const purchase = async (productId: string) => {
    if (!IAP || !available) {
      setError("In-app purchases need the full Grandma AI app build, not this preview.");
      return;
    }
    setPurchasing(true);
    setError(null);
    try {
      const result = await IAP.requestSubscription({ sku: productId });
      const receipt = (result as any)?.transactionReceipt;
      if (Platform.OS === "ios" && receipt) {
        await api.post("/subscriptions/validate/apple", { receiptData: receipt });
      } else if (Platform.OS === "android") {
        await api.post("/subscriptions/validate/google", {
          packageName: "com.grandmaai.app",
          productId,
          purchaseToken: (result as any)?.purchaseToken,
        });
      }
    } catch (e: any) {
      setError(e.message ?? "Something went wrong with the purchase.");
    } finally {
      setPurchasing(false);
    }
  };

  const restore = async () => {
    if (!IAP || !available) return;
    setPurchasing(true);
    try {
      await IAP.getAvailablePurchases();
      await api.post("/subscriptions/restore");
    } finally {
      setPurchasing(false);
    }
  };

  return { available, purchase, restore, purchasing, error };
}
