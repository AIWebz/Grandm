import React from "react";
import { View, Text, StyleSheet, Pressable, ScrollView } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { NativeStackScreenProps } from "@react-navigation/native-stack";
import { OnboardingStackParamList } from "../../navigation/types";
import { PrimaryButton } from "../../components/PrimaryButton";
import { useOnboardingStore, Interest } from "../../state/onboardingStore";
import { useCompleteOnboarding } from "../../hooks/useCompleteOnboarding";
import { colors, typography, spacing, radii, MIN_TOUCH_TARGET } from "../../theme/theme";

type Props = NativeStackScreenProps<OnboardingStackParamList, "Interests">;

const OPTIONS: { key: Interest; label: string; emoji: string }[] = [
  { key: "COOKING", label: "Cooking", emoji: "🍳" },
  { key: "CHORES", label: "Household chores", emoji: "🧹" },
  { key: "PLANNING", label: "Planning my day", emoji: "📅" },
  { key: "GROCERIES", label: "Grocery shopping", emoji: "🛒" },
  { key: "REMINDERS", label: "Reminders", emoji: "📝" },
  { key: "ENCOURAGEMENT", label: "A little encouragement", emoji: "❤️" },
  { key: "EVERYTHING", label: "Everything", emoji: "✨" },
];

export function InterestsScreen({ navigation }: Props) {
  const { interests, toggleInterest } = useOnboardingStore();
  const { complete } = useCompleteOnboarding();

  return (
    <SafeAreaView style={styles.container}>
      <PrimaryButton label="Skip for now" onPress={complete} variant="ghost" style={styles.skip} />
      <ScrollView contentContainerStyle={styles.content}>
        <Text style={[typography.title, styles.headline]}>What do you want help with?</Text>
        {OPTIONS.map((opt) => {
          const selected = interests.includes(opt.key);
          return (
            <Pressable
              key={opt.key}
              onPress={() => toggleInterest(opt.key)}
              accessibilityRole="checkbox"
              accessibilityState={{ checked: selected }}
              accessibilityLabel={opt.label}
              style={[styles.option, selected && styles.optionSelected]}
            >
              <Text style={styles.emoji}>{opt.emoji}</Text>
              <Text style={[typography.body, selected && { color: colors.coralDark, fontWeight: "600" }]}>{opt.label}</Text>
            </Pressable>
          );
        })}
      </ScrollView>
      <PrimaryButton label="Continue" onPress={() => navigation.navigate("Personality")} style={styles.button} />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.cream, paddingHorizontal: spacing.lg },
  skip: { alignSelf: "flex-end" },
  content: { paddingBottom: spacing.lg },
  headline: { marginBottom: spacing.lg, textAlign: "center" },
  option: {
    flexDirection: "row",
    alignItems: "center",
    minHeight: MIN_TOUCH_TARGET,
    padding: spacing.md,
    borderRadius: radii.md,
    borderWidth: 1.5,
    borderColor: colors.border,
    backgroundColor: colors.card,
    marginBottom: spacing.sm,
  },
  optionSelected: { borderColor: colors.coral, backgroundColor: "#FDEEEB" },
  emoji: { fontSize: 22, marginRight: spacing.sm },
  button: { marginVertical: spacing.lg },
});
