import React from "react";
import { Modal, View, Text, StyleSheet } from "react-native";
import { useNavigation } from "@react-navigation/native";
import { useAppStore } from "../state/appStore";
import { colors, typography, spacing, radii } from "../theme/theme";
import { PrimaryButton } from "./PrimaryButton";
import { GrandmaAvatar } from "./GrandmaAvatar";

/**
 * Shown when a free-tier full account hits a Grandma+-only action
 * (grocery list generation, Family Cookbook, long-term memory, advanced
 * planning, unlimited recipes). Deep-links straight to the paywall rather
 * than making them hunt for it in Settings.
 */
export function PlusRequiredSheet() {
  const { plusPromptVisible, plusPromptReason, dismissPlusPrompt } = useAppStore();
  const navigation = useNavigation<any>();

  const seeGrandmaPlus = () => {
    dismissPlusPrompt();
    navigation.navigate("Main", { screen: "ProfileTab", params: { screen: "SubscriptionSettings" } });
  };

  return (
    <Modal visible={plusPromptVisible} transparent animationType="slide" onRequestClose={dismissPlusPrompt}>
      <View style={styles.backdrop}>
        <View style={styles.sheet}>
          <GrandmaAvatar size={48} mood="happy" />
          <Text style={[typography.title, styles.title]}>That's a Grandma+ thing</Text>
          <Text style={[typography.body, styles.subtitle]}>{plusPromptReason ?? "This feature is part of Grandma+."}</Text>
          <PrimaryButton label="See Grandma+ - $14.99/mo" onPress={seeGrandmaPlus} style={{ marginTop: spacing.md, width: "100%" }} />
          <PrimaryButton label="Not right now" onPress={dismissPlusPrompt} variant="ghost" style={{ width: "100%" }} />
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
});
