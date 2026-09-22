import React from "react";
import { View, Text, StyleSheet } from "react-native";
import { colors, typography, spacing } from "../theme/theme";
import { GrandmaAvatar } from "./GrandmaAvatar";
import { PrimaryButton } from "./PrimaryButton";

interface Props {
  message: string;
  actionLabel?: string;
  onAction?: () => void;
}

/** Encouraging empty state, used everywhere a list-type screen can be empty (Section 18). */
export function EmptyState({ message, actionLabel, onAction }: Props) {
  return (
    <View style={styles.container} accessible accessibilityRole="text">
      <GrandmaAvatar size={64} mood="thinking" />
      <Text style={[typography.body, styles.message]}>{message}</Text>
      {actionLabel && onAction && (
        <PrimaryButton label={actionLabel} onPress={onAction} style={{ marginTop: spacing.md }} />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { alignItems: "center", justifyContent: "center", padding: spacing.xl },
  message: { textAlign: "center", marginTop: spacing.md, color: colors.brownMuted },
});
