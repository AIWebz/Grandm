import React from "react";
import { View, Text, StyleSheet, Pressable } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { NativeStackScreenProps } from "@react-navigation/native-stack";
import { OnboardingStackParamList } from "../../navigation/types";
import { PrimaryButton } from "../../components/PrimaryButton";
import { useOnboardingStore, PersonalityStyle } from "../../state/onboardingStore";
import { useCompleteOnboarding } from "../../hooks/useCompleteOnboarding";
import { colors, typography, spacing, radii, MIN_TOUCH_TARGET } from "../../theme/theme";

type Props = NativeStackScreenProps<OnboardingStackParamList, "Personality">;

const OPTIONS: { key: PersonalityStyle; label: string; blurb: string }[] = [
  { key: "WARM", label: "Warm & caring", blurb: "Gentle, doting, full of endearments" },
  { key: "FUNNY", label: "Funny & playful", blurb: "Light teasing, quick with a joke" },
  { key: "CALM", label: "Calm & gentle", blurb: "Slow, soothing, grounding" },
  { key: "PRACTICAL", label: "Practical & direct", blurb: "No-nonsense, gets to the point" },
];

export function PersonalityScreen({ navigation }: Props) {
  const { personalityStyle, setPersonalityStyle } = useOnboardingStore();
  const { complete, submitting } = useCompleteOnboarding();

  const finish = async () => {
    await complete();
    // RootNavigator watches user.onboardingCompleted and swaps to the FTUE screen automatically.
  };

  return (
    <SafeAreaView style={styles.container}>
      <PrimaryButton label="Skip for now" onPress={finish} variant="ghost" style={styles.skip} />
      <View style={styles.content}>
        <Text style={[typography.title, styles.headline]}>What kind of Grandma do you want?</Text>
        {OPTIONS.map((opt) => {
          const selected = personalityStyle === opt.key;
          return (
            <Pressable
              key={opt.key}
              onPress={() => setPersonalityStyle(opt.key)}
              accessibilityRole="radio"
              accessibilityState={{ selected }}
              accessibilityLabel={opt.label}
              style={[styles.option, selected && styles.optionSelected]}
            >
              <Text style={[typography.subtitle, selected && { color: colors.coralDark }]}>{opt.label}</Text>
              <Text style={[typography.caption]}>{opt.blurb}</Text>
            </Pressable>
          );
        })}
        <Text style={[typography.caption, styles.note]}>You can change this anytime in Settings - it changes tone only.</Text>
      </View>
      <PrimaryButton label="Get Started" onPress={finish} loading={submitting} style={styles.button} />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.cream, paddingHorizontal: spacing.lg, justifyContent: "space-between" },
  skip: { alignSelf: "flex-end" },
  content: { flex: 1, justifyContent: "center" },
  headline: { marginBottom: spacing.lg, textAlign: "center" },
  option: {
    minHeight: MIN_TOUCH_TARGET,
    padding: spacing.md,
    borderRadius: radii.md,
    borderWidth: 1.5,
    borderColor: colors.border,
    backgroundColor: colors.card,
    marginBottom: spacing.sm,
  },
  optionSelected: { borderColor: colors.coral, backgroundColor: "#FDEEEB" },
  note: { textAlign: "center", marginTop: spacing.sm },
  button: { marginBottom: spacing.lg },
});
