import React from "react";
import { Pressable, Text, StyleSheet, ActivityIndicator, ViewStyle } from "react-native";
import { colors, radii, typography, MIN_TOUCH_TARGET } from "../theme/theme";

interface Props {
  label: string;
  onPress: () => void;
  variant?: "primary" | "secondary" | "ghost";
  loading?: boolean;
  disabled?: boolean;
  style?: ViewStyle;
  accessibilityHint?: string;
}

export function PrimaryButton({ label, onPress, variant = "primary", loading, disabled, style, accessibilityHint }: Props) {
  return (
    <Pressable
      onPress={onPress}
      disabled={disabled || loading}
      accessibilityRole="button"
      accessibilityLabel={label}
      accessibilityHint={accessibilityHint}
      accessibilityState={{ disabled: disabled || loading }}
      style={({ pressed }) => [
        styles.base,
        variant === "primary" && styles.primary,
        variant === "secondary" && styles.secondary,
        variant === "ghost" && styles.ghost,
        (disabled || loading) && styles.disabled,
        pressed && styles.pressed,
        style,
      ]}
    >
      {loading ? (
        <ActivityIndicator color={variant === "primary" ? "#fff" : colors.coral} />
      ) : (
        <Text
          style={[
            typography.subtitle,
            variant === "primary" && styles.primaryText,
            variant === "secondary" && styles.secondaryText,
            variant === "ghost" && styles.ghostText,
          ]}
        >
          {label}
        </Text>
      )}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  base: {
    minHeight: MIN_TOUCH_TARGET,
    borderRadius: radii.pill,
    paddingHorizontal: 24,
    alignItems: "center",
    justifyContent: "center",
  },
  primary: { backgroundColor: colors.coral },
  secondary: { backgroundColor: colors.card, borderWidth: 1.5, borderColor: colors.coral },
  ghost: { backgroundColor: "transparent" },
  primaryText: { color: "#fff" },
  secondaryText: { color: colors.coralDark },
  ghostText: { color: colors.brownMuted },
  disabled: { opacity: 0.5 },
  pressed: { opacity: 0.85 },
});
