import { useEffect, useRef, useState } from "react";
import { useAdConfig, adUnitFor } from "./useAdConfig";
import { getMobileAdsModule } from "../utils/nativeAds";
import { api } from "../api/client";

const Ads = getMobileAdsModule();

/**
 * Rewarded ad unlocking one extra chat for the day (Section 15). The
 * SDK's onEarnedReward only fires after AdMob's own player confirms
 * completion; there's no additional server-side verification (AdMob SSV)
 * wired up here (see docs/ARCHITECTURE.md), so `POST /chat/usage/reward`
 * trusts this client signal but caps how many bonus chats it will grant
 * per day regardless.
 */
export function useRewardedAd() {
  const { data: config } = useAdConfig();
  const [loaded, setLoaded] = useState(false);
  const adRef = useRef<ReturnType<NonNullable<typeof Ads>["RewardedAd"]["createForAdRequest"]> | null>(null);

  const adUnitId = adUnitFor(config, "rewarded");
  const eligible = Boolean(Ads) && Boolean(adUnitId);

  useEffect(() => {
    if (!eligible || !Ads || !adUnitId) return;
    const { RewardedAd, RewardedAdEventType } = Ads;
    const ad = RewardedAd.createForAdRequest(adUnitId, { requestNonPersonalizedAdsOnly: false });
    adRef.current = ad;

    const unsubLoaded = ad.addAdEventListener(RewardedAdEventType.LOADED, () => setLoaded(true));
    ad.load();

    return () => {
      unsubLoaded();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [eligible, adUnitId]);

  /** Shows the ad; on confirmed completion, calls the server to grant the extra chat, then invokes onGranted. */
  const showForReward = (onGranted: (status: any) => void, onFailed?: (message: string) => void) => {
    if (!eligible || !loaded || !adRef.current || !Ads) {
      onFailed?.("Ads aren't available in this preview build.");
      return;
    }
    const { RewardedAdEventType } = Ads;
    const ad = adRef.current;
    const unsubEarned = ad.addAdEventListener(RewardedAdEventType.EARNED_REWARD, async () => {
      unsubEarned();
      try {
        const res = await api.post<{ granted: boolean; status: any }>("/chat/usage/reward");
        onGranted(res.status);
      } catch (e: any) {
        onFailed?.(e.message ?? "Something went wrong crediting that.");
      }
    });
    const unsubClosed = ad.addAdEventListener(Ads.AdEventType.CLOSED, () => {
      unsubClosed();
      setLoaded(false);
      ad.load();
    });
    ad.show();
  };

  return { showForReward, ready: loaded && eligible };
}
