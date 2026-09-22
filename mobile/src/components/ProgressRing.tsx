import React from "react";
import { View, Text, StyleSheet } from "react-native";
import Svg, { Circle } from "react-native-svg";
import { colors, typography } from "../theme/theme";

interface Props {
  completed: number;
  total: number;
  size?: number;
}

export function ProgressRing({ completed, total, size = 64 }: Props) {
  const strokeWidth = 7;
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const pct = total === 0 ? 0 : completed / total;
  const dashOffset = circumference * (1 - pct);

  return (
    <View
      style={{ width: size, height: size }}
      accessible
      accessibilityRole="progressbar"
      accessibilityLabel={`${completed} of ${total} tasks completed`}
    >
      <Svg width={size} height={size}>
        <Circle cx={size / 2} cy={size / 2} r={radius} stroke={colors.border} strokeWidth={strokeWidth} fill="none" />
        <Circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke={colors.coral}
          strokeWidth={strokeWidth}
          strokeLinecap="round"
          fill="none"
          strokeDasharray={`${circumference} ${circumference}`}
          strokeDashoffset={dashOffset}
          rotation={-90}
          origin={`${size / 2}, ${size / 2}`}
        />
      </Svg>
      <View style={StyleSheet.absoluteFill}>
        <View style={styles.centerText}>
          <Text style={[typography.caption, { fontWeight: "700", color: colors.brownText }]}>
            {completed}/{total}
          </Text>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  centerText: { flex: 1, alignItems: "center", justifyContent: "center" },
});
