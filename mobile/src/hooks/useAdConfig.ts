import { Platform } from "react-native";
import { api } from "../api/client";
import { useApiData } from "./useApiData";

export interface AdConfig {
  provider: string;
  testMode: boolean;
  appId: { ios: string; android: string };
  adUnits: {
    banner: { ios: string; android: string };
    interstitial: { ios: string; android: string };
    rewarded: { ios: string; android: string };
  };
  placements: {
    bannerScreens: string[];
    interstitialAfter: string[];
    neverDuring: string[];
    rewardedUnlocks: string[];
  };
}

export function useAdConfig() {
  return useApiData<AdConfig>(() => api.get<AdConfig>("/config/ads"), [], "ad_config");
}

export function adUnitFor(config: AdConfig | null, kind: "banner" | "interstitial" | "rewarded"): string | null {
  if (!config) return null;
  return Platform.OS === "ios" ? config.adUnits[kind].ios : config.adUnits[kind].android;
}
