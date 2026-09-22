import { useEffect, useRef, useState } from "react";
import { useSubscriptionStatus } from "./useSubscriptionStatus";
import { useAdConfig, adUnitFor } from "./useAdConfig";
import { getMobileAdsModule } from "../utils/nativeAds";

const Ads = getMobileAdsModule();

/**
 * Interstitial ads for natural app transitions only - never mid-chat
 * (Section 15). Call `show()` from a transition point (leaving chat,
 * after saving a recipe); it silently no-ops for Grandma+ users, when the
 * native module isn't loaded, or when no ad is ready yet, so call sites
 * never need their own gating logic.
 */
export function useInterstitialAd() {
  const { tier } = useSubscriptionStatus();
  const { data: config } = useAdConfig();
  const [loaded, setLoaded] = useState(false);
  const adRef = useRef<ReturnType<NonNullable<typeof Ads>["InterstitialAd"]["createForAdRequest"]> | null>(null);

  const adUnitId = adUnitFor(config, "interstitial");
  const eligible = tier !== "PLUS" && Boolean(Ads) && Boolean(adUnitId);

  useEffect(() => {
    if (!eligible || !Ads || !adUnitId) return;
    const { InterstitialAd, AdEventType } = Ads;
    const ad = InterstitialAd.createForAdRequest(adUnitId, { requestNonPersonalizedAdsOnly: false });
    adRef.current = ad;

    const unsubLoaded = ad.addAdEventListener(AdEventType.LOADED, () => setLoaded(true));
    const unsubClosed = ad.addAdEventListener(AdEventType.CLOSED, () => {
      setLoaded(false);
      ad.load(); // pre-load the next one
    });
    ad.load();

    return () => {
      unsubLoaded();
      unsubClosed();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [eligible, adUnitId]);

  const show = () => {
    if (!eligible || !loaded || !adRef.current) return;
    adRef.current.show();
  };

  return { show, ready: loaded && eligible };
}
