import React, { useEffect, useState } from "react";
import { View, Text, StyleSheet } from "react-native";
import { api } from "../api/client";
import { useSubscriptionStatus } from "../hooks/useSubscriptionStatus";
import { colors, typography, radii, spacing } from "../theme/theme";

interface AdConfig {
  provider: string;
  testMode: boolean;
  placements: { bannerScreens: string[] };
}

/**
 * Real placement rules enforced here: only renders on the free tier, only
 * on screens listed in server config (Section 15), and is a small banner -
 * never an interstitial mid-chat. Swapping in a real ad SDK means
 * replacing the placeholder view below with that SDK's banner component;
 * the gating logic (free tier + allowed screen) stays the same.
 */
export function AdSlot({ screen }: { screen: string }) {
  const { tier } = useSubscriptionStatus();
  const [config, setConfig] = useState<AdConfig | null>(null);

  useEffect(() => {
    api.get<AdConfig>("/config/ads").then(setConfig).catch(() => {});
  }, []);

  if (tier === "PLUS") return null; // Grandma+ removes ads entirely.
  if (!config?.placements.bannerScreens.includes(screen)) return null;

  return (
    <View style={styles.banner} accessibilityLabel="Advertisement" accessibilityRole="none">
      <Text style={typography.caption}>{config.testMode ? "Ad placeholder (test mode)" : "Advertisement"}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  banner: {
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
