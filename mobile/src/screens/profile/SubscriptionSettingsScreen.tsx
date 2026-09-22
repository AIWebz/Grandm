import React from "react";
import { View, Text, StyleSheet, ScrollView } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useSubscriptionStatus } from "../../hooks/useSubscriptionStatus";
import { useIAP } from "../../hooks/useIAP";
import { Card } from "../../components/Card";
import { PrimaryButton } from "../../components/PrimaryButton";
import { colors, typography, spacing } from "../../theme/theme";

const FEATURES = [
  "No ads",
  "Unlimited AI usage",
  "Advanced personalization",
  "Long-term memory",
  "Unlimited recipe generation",
  "Advanced meal planning",
  "Full Family Cookbook features",
  "Advanced household planning",
  "Voice conversations",
];

export function SubscriptionSettingsScreen() {
  const { status, refresh } = useSubscriptionStatus();
  const monthlyId = status?.products.monthly ?? "grandma_plus_monthly";
  const annualId = status?.products.annual ?? "grandma_plus_annual";
  const { purchase, restore, purchasing, error, available } = useIAP([monthlyId, annualId]);

  const isPlus = status?.tier === "PLUS";

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={{ padding: spacing.md }}>
        <Text style={[typography.hero, { textAlign: "center" }]}>Grandma+</Text>
        {isPlus ? (
          <Text style={[typography.body, styles.activeText]}>You're all set with Grandma+ ❤️</Text>
        ) : (
          <>
            <Card style={{ marginTop: spacing.md }}>
              {FEATURES.map((f) => (
                <Text key={f} style={[typography.body, styles.feature]}>
                  ✓ {f}
                </Text>
              ))}
            </Card>

            <Text style={[typography.subtitle, styles.priceLabel]}>
              ${status?.products.priceMonthlyUsd.toFixed(2) ?? "7.99"}/month, or save with the annual plan
            </Text>

            <PrimaryButton
              label={`Subscribe monthly - $${status?.products.priceMonthlyUsd.toFixed(2) ?? "7.99"}/mo`}
              onPress={async () => {
                await purchase(monthlyId);
                await refresh();
              }}
              loading={purchasing}
              style={{ marginTop: spacing.md }}
            />
            <PrimaryButton
              label="Subscribe annually (best value)"
              variant="secondary"
              onPress={async () => {
                await purchase(annualId);
                await refresh();
              }}
              loading={purchasing}
              style={{ marginTop: spacing.sm }}
            />
            {error && <Text style={styles.error}>{error}</Text>}
            {!available && <Text style={styles.note}>Purchases require the full app build (not this preview).</Text>}
          </>
        )}

        <PrimaryButton label="Restore purchases" variant="ghost" onPress={restore} style={{ marginTop: spacing.md }} />

        <Text style={styles.legal}>
          Payment is charged through your iOS App Store or Google Play account. Subscriptions renew automatically unless auto-renew is
          turned off at least 24 hours before the end of the current period. Manage or cancel anytime in your device's subscription
          settings.
        </Text>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.cream },
  activeText: { textAlign: "center", marginTop: spacing.lg },
  feature: { marginBottom: spacing.xs },
  priceLabel: { textAlign: "center", marginTop: spacing.lg },
  error: { color: colors.danger, textAlign: "center", marginTop: spacing.sm },
  note: { color: colors.brownMuted, textAlign: "center", marginTop: spacing.sm, fontSize: 12 },
  legal: { color: colors.brownMuted, fontSize: 11, marginTop: spacing.lg, textAlign: "center" },
});
