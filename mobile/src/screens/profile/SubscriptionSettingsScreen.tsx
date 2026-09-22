import React, { useState } from "react";
import { View, Text, StyleSheet, ScrollView } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useSubscriptionStatus } from "../../hooks/useSubscriptionStatus";
import { useStripeCheckout } from "../../hooks/useStripeCheckout";
import { useIAP } from "../../hooks/useIAP";
import { Card } from "../../components/Card";
import { PrimaryButton } from "../../components/PrimaryButton";
import { GrandmaAvatar } from "../../components/GrandmaAvatar";
import { colors, typography, spacing } from "../../theme/theme";

const FEATURES = [
  "No ads",
  "Unlimited recipes",
  "Grocery shopping list generation",
  "Long-term memory",
  "Shared Family Cookbook (share recipes through Messages)",
  "Advanced planning",
];

function sleep(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

export function SubscriptionSettingsScreen() {
  const { status, refresh } = useSubscriptionStatus();
  const { checkout, manageSubscription, loading: stripeLoading, error: stripeError } = useStripeCheckout();
  const monthlyId = status?.products.monthly ?? "grandma_plus_monthly";
  const { purchase, restore, purchasing, error: iapError, available: iapAvailable } = useIAP([monthlyId]);
  const [waitingForWebhook, setWaitingForWebhook] = useState(false);

  const isPlus = status?.tier === "PLUS";
  const price = (status?.products.priceMonthlyUsd ?? 14.99).toFixed(2);

  const subscribeWithStripe = async () => {
    const opened = await checkout();
    if (!opened) return;
    // The browser closing doesn't mean the webhook has landed yet - poll briefly rather than showing a stale FREE state.
    setWaitingForWebhook(true);
    for (let i = 0; i < 5; i++) {
      await sleep(1500);
      await refresh();
    }
    setWaitingForWebhook(false);
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={{ padding: spacing.md }}>
        <View style={{ alignItems: "center" }}>
          <GrandmaAvatar size={56} mood={isPlus ? "celebrating" : "happy"} />
        </View>
        <Text style={[typography.hero, { textAlign: "center", marginTop: spacing.sm }]}>Grandma+</Text>

        {isPlus ? (
          <>
            <Text style={[typography.body, styles.activeText]}>You're all set with Grandma+ ❤️</Text>
            <PrimaryButton label="Manage subscription" onPress={manageSubscription} loading={stripeLoading} style={{ marginTop: spacing.lg }} />
          </>
        ) : (
          <>
            <Card style={{ marginTop: spacing.md }}>
              <Text style={[typography.caption, { marginBottom: spacing.xs }]}>Everything in Free, plus:</Text>
              {FEATURES.map((f) => (
                <Text key={f} style={[typography.body, styles.feature]}>
                  ✓ {f}
                </Text>
              ))}
            </Card>

            <Text style={[typography.subtitle, styles.priceLabel]}>${price}/month</Text>

            <PrimaryButton
              label={waitingForWebhook ? "Confirming..." : `Subscribe - $${price}/mo`}
              onPress={subscribeWithStripe}
              loading={stripeLoading || waitingForWebhook}
              style={{ marginTop: spacing.md }}
            />
            {stripeError && <Text style={styles.error}>{stripeError}</Text>}

            {iapAvailable && (
              <PrimaryButton
                label="Or subscribe via App Store / Google Play"
                variant="ghost"
                onPress={async () => {
                  await purchase(monthlyId);
                  await refresh();
                }}
                loading={purchasing}
                style={{ marginTop: spacing.sm }}
              />
            )}
            {iapError && <Text style={styles.error}>{iapError}</Text>}
          </>
        )}

        <PrimaryButton label="Restore purchases" variant="ghost" onPress={isPlus ? refresh : restore} style={{ marginTop: spacing.md }} />

        <Text style={styles.legal}>
          Payments are processed securely by Stripe. Subscriptions renew automatically each month until canceled - manage or cancel
          anytime with "Manage subscription" above.
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
  legal: { color: colors.brownMuted, fontSize: 11, marginTop: spacing.lg, textAlign: "center" },
});
