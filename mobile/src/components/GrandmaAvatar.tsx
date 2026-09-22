import React, { useEffect, useRef } from "react";
import { Animated, Easing, View } from "react-native";
import Svg, { Circle, Path, Ellipse } from "react-native-svg";

const AnimatedEllipse = Animated.createAnimatedComponent(Ellipse);
import { colors } from "../theme/theme";

interface Props {
  size?: number;
  animated?: boolean;
}

/**
 * Simple, warm, approachable avatar - not photorealistic, not a full
 * cartoon mascot. `animated` adds a subtle blink (a presence, not a
 * performance, per Section 13).
 */
export function GrandmaAvatar({ size = 56, animated = false }: Props) {
  const blink = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    if (!animated) return;
    const loop = () => {
      Animated.sequence([
        Animated.timing(blink, { toValue: 0.1, duration: 90, useNativeDriver: false, easing: Easing.linear }),
        Animated.timing(blink, { toValue: 1, duration: 90, useNativeDriver: false, easing: Easing.linear }),
        Animated.delay(2600 + Math.random() * 2000),
      ]).start(loop);
    };
    loop();
  }, [animated, blink]);

  return (
    <View style={{ width: size, height: size }}>
      <Svg width={size} height={size} viewBox="0 0 100 100">
        <Circle cx="50" cy="50" r="48" fill={colors.coral} opacity={0.15} />
        <Circle cx="50" cy="54" r="34" fill="#F4D9C6" />
        <Path d="M20 46 Q50 18 80 46 Q80 30 50 24 Q20 30 20 46 Z" fill="#EDEDED" />
        <AnimatedEye cx={38} cy={52} blink={blink} />
        <AnimatedEye cx={62} cy={52} blink={blink} />
        <Path d="M38 66 Q50 76 62 66" stroke={colors.brownText} strokeWidth={3} fill="none" strokeLinecap="round" />
        <Circle cx="30" cy="60" r="5" fill={colors.coral} opacity={0.35} />
        <Circle cx="70" cy="60" r="5" fill={colors.coral} opacity={0.35} />
      </Svg>
    </View>
  );
}

function AnimatedEye({ cx, cy, blink }: { cx: number; cy: number; blink: Animated.Value }) {
  const ry = blink.interpolate({ inputRange: [0.1, 1], outputRange: [0.4, 4] });
  return <AnimatedEllipse cx={cx} cy={cy} rx={4} ry={ry as any} fill={colors.brownText} />;
}
