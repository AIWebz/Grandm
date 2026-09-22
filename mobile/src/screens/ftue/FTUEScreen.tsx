import React from "react";
import { View, Text, StyleSheet } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { NativeStackScreenProps } from "@react-navigation/native-stack";
import { CommonActions } from "@react-navigation/native";
import { RootStackParamList } from "../../navigation/types";
import { useAuthStore } from "../../state/authStore";
import { markFTUESeen } from "../../utils/ftueFlag";
import { GrandmaAvatar } from "../../components/GrandmaAvatar";
import { colors, typography, spacing, radii, MIN_TOUCH_TARGET } from "../../theme/theme";
import { Pressable } from "react-native";

type Props = NativeStackScreenProps<RootStackParamList, "FTUE">;

const BUTTONS: { emoji: string; label: string; intent: string }[] = [
  { emoji: "🍲", label: "Make dinner", intent: "What should I make for dinner?" },
  { emoji: "🧹", label: "Get things done", intent: "My house is a mess, help me get started." },
  { emoji: "📅", label: "Plan my day", intent: "Can you help me plan my day?" },
  { emoji: "🛒", label: "Make a grocery list", intent: "I need to make a grocery list." },
  { emoji: "💬", label: "Just talk to Grandma", intent: "" },
];

/**
 * Section 17: skip the dashboard immediately after signup/onboarding.
 * Every button drops straight into a working chat flow with the intent
 * pre-loaded, so the user sees a real result before anything else.
 */
export function FTUEScreen({ navigation }: Props) {
  const name = useAuthStore((s) => s.user?.preferredName) ?? "there";

  const go = (intent: string) => {
    markFTUESeen();
    navigation.dispatch(
      CommonActions.reset({
        index: 0,
        routes: [{ name: "Main", params: { screen: "GrandmaTab", params: { prefilledIntent: intent } } as any }],
      })
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        <GrandmaAvatar size={88} animated mood="happy" />
        <Text style={[typography.hero, styles.headline]}>Hi, {name} ❤️</Text>
        <Text style={[typography.subtitle, styles.subtitle]}>What can Grandma help you with today?</Text>
        <View style={styles.buttons}>
          {BUTTONS.map((b) => (
            <Pressable
              key={b.label}
              onPress={() => go(b.intent)}
              accessibilityRole="button"
              accessibilityLabel={b.label}
              style={styles.button}
            >
              <Text style={styles.emoji}>{b.emoji}</Text>
              <Text style={[typography.body, { fontWeight: "600" }]}>{b.label}</Text>
            </Pressable>
          ))}
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.cream },
  content: { flex: 1, alignItems: "center", padding: spacing.lg, paddingTop: spacing.xxl },
  headline: { marginTop: spacing.md },
  subtitle: { marginTop: spacing.xs, marginBottom: spacing.lg, color: colors.brownMuted },
  buttons: { width: "100%" },
  button: {
    flexDirection: "row",
    alignItems: "center",
    minHeight: MIN_TOUCH_TARGET + 8,
    backgroundColor: colors.card,
    borderRadius: radii.md,
    paddingHorizontal: spacing.md,
    marginBottom: spacing.sm,
    borderWidth: 1,
    borderColor: colors.border,
  },
  emoji: { fontSize: 24, marginRight: spacing.md },
});
