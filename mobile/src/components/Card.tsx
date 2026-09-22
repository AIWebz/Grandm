import React, { PropsWithChildren } from "react";
import { View, StyleProp, ViewStyle } from "react-native";
import { colors, radii, spacing, shadow } from "../theme/theme";

export function Card({ children, style }: PropsWithChildren<{ style?: StyleProp<ViewStyle> }>) {
  return (
    <View
      style={[
        {
          backgroundColor: colors.card,
          borderRadius: radii.md,
          padding: spacing.md,
          ...shadow,
        },
        style,
      ]}
    >
      {children}
    </View>
  );
}
