import React from "react";
import { View, Text, TextInput, StyleSheet } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { NativeStackScreenProps } from "@react-navigation/native-stack";
import { OnboardingStackParamList } from "../../navigation/types";
import { PrimaryButton } from "../../components/PrimaryButton";
import { useOnboardingStore } from "../../state/onboardingStore";
import { useCompleteOnboarding } from "../../hooks/useCompleteOnboarding";
import { colors, typography, spacing, radii } from "../../theme/theme";

type Props = NativeStackScreenProps<OnboardingStackParamList, "Name">;

export function NameScreen({ navigation }: Props) {
  const { preferredName, setPreferredName } = useOnboardingStore();
  const { complete, submitting } = useCompleteOnboarding();

  return (
    <SafeAreaView style={styles.container}>
      <PrimaryButton label="Skip for now" onPress={complete} variant="ghost" style={styles.skip} />
      <View style={styles.content}>
        <Text style={[typography.title, styles.headline]}>What should Grandma call you?</Text>
        <TextInput
          style={styles.input}
          value={preferredName}
          onChangeText={setPreferredName}
          placeholder="Your name"
          placeholderTextColor={colors.brownMuted}
          autoFocus
          accessibilityLabel="Your preferred name"
          returnKeyType="next"
          onSubmitEditing={() => navigation.navigate("Interests")}
        />
      </View>
      <PrimaryButton
        label="Continue"
        onPress={() => navigation.navigate("Interests")}
        disabled={submitting}
        style={styles.button}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.cream, padding: spacing.lg, justifyContent: "space-between" },
  skip: { alignSelf: "flex-end" },
  content: { flex: 1, justifyContent: "center" },
  headline: { marginBottom: spacing.lg, textAlign: "center" },
  input: {
    minHeight: 52,
    borderWidth: 1.5,
    borderColor: colors.border,
    borderRadius: radii.md,
    paddingHorizontal: spacing.md,
    backgroundColor: colors.card,
    fontSize: 18,
    color: colors.brownText,
  },
  button: { marginBottom: spacing.lg },
});
