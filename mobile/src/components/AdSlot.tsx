import React from "react";
import { View, Text, StyleSheet } from "react-native";
import { useSubscriptionStatus } from "../hooks/useSubscriptionStatus";
import { useAdConfig, adUnitFor } from "../hooks/useAdConfig";
import { getMobileAdsModule } from "../utils/nativeAds";
import { colors, typography, radii, spacing } from "../theme/theme";

const Ads = getMobileAdsModule();

/**
 * Real banner placement (Section 15): only renders on the free tier, only
 * on screens the server's placement config lists, and is a small banner -
 * never an interstitial mid-chat. Uses Google's public test ad unit ids by
 * default (see server GET /config/ads), so it renders real test ads with
 * zero AdMob account setup; swap in production ids via server env vars.
 * Falls back to a labeled placeholder if the native ads module isn't
 * loaded (e.g. running in Expo Go instead of a dev-client/EAS build).
 */
export function AdSlot({ screen }: { screen: string }) {
  const { tier } = useSubscriptionStatus();
  const { data: config } = useAdConfig();

  if (tier === "PLUS") return null; // Grandma+ removes ads entirely.
  if (!config?.placements.bannerScreens.includes(screen)) return null;

  const adUnitId = adUnitFor(config, "banner");
  if (!Ads || !adUnitId) {
    return (
      <View style={styles.placeholder} accessibilityLabel="Advertisement" accessibilityRole="none">
        <Text style={typography.caption}>Ad placeholder (needs the full app build)</Text>
      </View>
    );
  }

  const { BannerAd, BannerAdSize } = Ads;
  return (
    <View style={styles.container} accessibilityLabel="Advertisement" accessibilityRole="none">
      <BannerAd unitId={adUnitId} size={BannerAdSize.ADAPTIVE_BANNER} requestOptions={{ requestNonPersonalizedAdsOnly: false }} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { alignItems: "center", marginVertical: spacing.sm },
  placeholder: {
    height: 50,
    borderRadius: radii.sm,
    borderWidth: 1,
    borderStyle: "dashed",
    borderColor: colors.border,
    alignItems: "center",
    justifyContent: "center",
    marginVertical: spacing.sm,
  },
});
