import React from "react";
import { View, Text, StyleSheet } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { NativeStackScreenProps } from "@react-navigation/native-stack";
import { OnboardingStackParamList } from "../../navigation/types";
import { GrandmaAvatar } from "../../components/GrandmaAvatar";
import { PrimaryButton } from "../../components/PrimaryButton";
import { colors, typography, spacing } from "../../theme/theme";

type Props = NativeStackScreenProps<OnboardingStackParamList, "Welcome">;

export function WelcomeScreen({ navigation }: Props) {
  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        <GrandmaAvatar size={120} animated />
        <Text style={[typography.hero, styles.headline]}>Meet Grandma AI</Text>
        <Text style={[typography.body, styles.subtitle]}>
          A little help, a little wisdom, and a whole lot of care.
        </Text>
      </View>
      <PrimaryButton label="Get Started" onPress={() => navigation.navigate("Name")} style={styles.button} />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.cream, padding: spacing.lg, justifyContent: "space-between" },
  content: { flex: 1, alignItems: "center", justifyContent: "center" },
  headline: { marginTop: spacing.lg, textAlign: "center" },
  subtitle: { marginTop: spacing.sm, textAlign: "center", color: colors.brownMuted, paddingHorizontal: spacing.lg },
  button: { marginBottom: spacing.lg },
});
