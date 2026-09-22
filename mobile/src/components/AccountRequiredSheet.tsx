import React, { useState } from "react";
import { Modal, View, Text, TextInput, StyleSheet } from "react-native";
import { useAppStore } from "../state/appStore";
import { useAuthStore } from "../state/authStore";
import { colors, typography, spacing, radii } from "../theme/theme";
import { PrimaryButton } from "./PrimaryButton";
import { GrandmaAvatar } from "./GrandmaAvatar";
import { ApiError } from "../api/client";

/**
 * The deferred-signup prompt (docs/ARCHITECTURE.md). Shown when a guest
 * hits a durable-ownership action (save a recipe, Family Cookbook, push
 * notifications, purchase) - never before the user has seen real value.
 */
export function AccountRequiredSheet() {
  const { accountPromptVisible, accountPromptReason, dismissAccountPrompt } = useAppStore();
  const upgradeGuest = useAuthStore((s) => s.upgradeGuest);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const submit = async () => {
    setError(null);
    setLoading(true);
    try {
      await upgradeGuest(email, password);
      dismissAccountPrompt();
      setEmail("");
      setPassword("");
    } catch (e) {
      setError(e instanceof ApiError ? e.message : "Something went wrong - try again?");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal visible={accountPromptVisible} transparent animationType="slide" onRequestClose={dismissAccountPrompt}>
      <View style={styles.backdrop}>
        <View style={styles.sheet}>
          <GrandmaAvatar size={48} />
          <Text style={[typography.title, styles.title]}>Let's save that for you</Text>
          <Text style={[typography.body, styles.subtitle]}>
            {accountPromptReason ?? "Create a free account so this is here next time you open the app."}
          </Text>
          <TextInput
            style={styles.input}
            placeholder="Email"
            placeholderTextColor={colors.brownMuted}
            autoCapitalize="none"
            keyboardType="email-address"
            value={email}
            onChangeText={setEmail}
            accessibilityLabel="Email address"
          />
          <TextInput
            style={styles.input}
            placeholder="Password (8+ characters)"
            placeholderTextColor={colors.brownMuted}
            secureTextEntry
            value={password}
            onChangeText={setPassword}
            accessibilityLabel="Password"
          />
          {error && <Text style={styles.error}>{error}</Text>}
          <PrimaryButton label="Create account" onPress={submit} loading={loading} style={{ marginTop: spacing.md, width: "100%" }} />
          <PrimaryButton label="Not right now" onPress={dismissAccountPrompt} variant="ghost" style={{ width: "100%" }} />
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: { flex: 1, backgroundColor: "rgba(0,0,0,0.35)", justifyContent: "flex-end" },
  sheet: { backgroundColor: colors.cream, borderTopLeftRadius: radii.lg, borderTopRightRadius: radii.lg, padding: spacing.lg, alignItems: "center" },
  title: { marginTop: spacing.sm },
  subtitle: { textAlign: "center", color: colors.brownMuted, marginTop: spacing.xs, marginBottom: spacing.md },
  input: {
    width: "100%",
    minHeight: 48,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radii.sm,
    paddingHorizontal: spacing.md,
    marginBottom: spacing.sm,
    backgroundColor: colors.card,
    color: colors.brownText,
  },
  error: { color: colors.danger, marginBottom: spacing.sm },
});
