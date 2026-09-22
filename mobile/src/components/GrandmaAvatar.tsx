import React, { useEffect, useRef } from "react";
import { Animated, Easing, View } from "react-native";
import Svg, { Circle, Ellipse, Path, G } from "react-native-svg";
import { colors } from "../theme/theme";

const AnimatedEllipse = Animated.createAnimatedComponent(Ellipse);

export type GrandmaMood = "neutral" | "happy" | "thinking" | "celebrating";

interface Props {
  size?: number;
  animated?: boolean;
  mood?: GrandmaMood;
}

const SKIN = "#F4D9C6";
const HAIR = "#E7E1DA";
const HAIR_SHADOW = "#D9D0C5";
const GLASSES = "#8A7A70";

const MOUTHS: Record<GrandmaMood, string> = {
  neutral: "M37 67 Q50 76 63 67",
  happy: "M34 65 Q50 84 66 65 Q50 78 34 65 Z",
  thinking: "M42 70 Q50 67 58 70.5",
  celebrating: "M32 63 Q50 88 68 63 Q50 80 32 63 Z",
};

const LEFT_BROWS: Record<GrandmaMood, string> = {
  neutral: "M30 42 Q37 39 44 42",
  happy: "M30 40 Q37 36 44 39",
  thinking: "M30 41 Q37 45 44 41",
  celebrating: "M29 38 Q37 33 45 37",
};

const RIGHT_BROWS: Record<GrandmaMood, string> = {
  neutral: "M56 42 Q63 39 70 42",
  happy: "M56 39 Q63 36 70 40",
  thinking: "M56 44 Q63 40 70 44",
  celebrating: "M55 37 Q63 33 71 38",
};

/**
 * The Grandma mascot: warm and approachable, never photorealistic or
 * uncanny (Section 13). One consistent character with a small set of
 * moods reused everywhere she appears - home greeting, chat, recipe tips,
 * task encouragement, empty states, notifications. `animated` adds a
 * subtle blink; it's a presence, not a mascot performance.
 */
export function GrandmaAvatar({ size = 56, animated = false, mood = "neutral" }: Props) {
  const blink = useRef(new Animated.Value(1)).current;
  const sparkle = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (!animated) return;
    let stopped = false;
    const loop = () => {
      if (stopped) return;
      Animated.sequence([
        Animated.timing(blink, { toValue: 0.1, duration: 90, useNativeDriver: false, easing: Easing.linear }),
        Animated.timing(blink, { toValue: 1, duration: 90, useNativeDriver: false, easing: Easing.linear }),
        Animated.delay(2600 + Math.random() * 2000),
      ]).start(loop);
    };
    loop();
    return () => {
      stopped = true;
    };
  }, [animated, blink]);

  useEffect(() => {
    if (mood !== "celebrating") return;
    sparkle.setValue(0);
    Animated.loop(
      Animated.sequence([
        Animated.timing(sparkle, { toValue: 1, duration: 500, useNativeDriver: false, easing: Easing.ease }),
        Animated.timing(sparkle, { toValue: 0.3, duration: 500, useNativeDriver: false, easing: Easing.ease }),
      ])
    ).start();
  }, [mood, sparkle]);

  return (
    <View style={{ width: size, height: size }}>
      <Svg width={size} height={size} viewBox="0 0 100 100">
        <Circle cx="50" cy="50" r="48" fill={colors.coral} opacity={0.12} />

        {/* Shawl / collar */}
        <Path d="M14 100 Q50 76 86 100 Z" fill={colors.coral} />
        <Path d="M14 100 Q50 82 86 100" stroke={colors.coralDark} strokeWidth={1.5} fill="none" opacity={0.4} />

        {/* Hair, framing behind the face */}
        <G>
          <Ellipse cx="50" cy="38" rx="34" ry="30" fill={HAIR} />
          <Circle cx="24" cy="46" r="10" fill={HAIR} />
          <Circle cx="76" cy="46" r="10" fill={HAIR} />
          <Circle cx="50" cy="16" r="13" fill={HAIR_SHADOW} />
        </G>

        {/* Face */}
        <Circle cx="50" cy="54" r="30" fill={SKIN} />

        {/* Rosy cheeks */}
        <Circle cx="30" cy="60" r="5" fill={colors.coral} opacity={0.3} />
        <Circle cx="70" cy="60" r="5" fill={colors.coral} opacity={0.3} />

        {/* Eyebrows (mood-dependent) */}
        <Path d={LEFT_BROWS[mood]} stroke={GLASSES} strokeWidth={2.4} fill="none" strokeLinecap="round" />
        <Path d={RIGHT_BROWS[mood]} stroke={GLASSES} strokeWidth={2.4} fill="none" strokeLinecap="round" />

        {/* Round glasses */}
        <Circle cx="38" cy="52" r="10" fill="none" stroke={GLASSES} strokeWidth={2.2} />
        <Circle cx="62" cy="52" r="10" fill="none" stroke={GLASSES} strokeWidth={2.2} />
        <Path d="M48 52 L52 52" stroke={GLASSES} strokeWidth={2.2} />
        <Path d="M28 50 L23 47" stroke={GLASSES} strokeWidth={2.2} strokeLinecap="round" />
        <Path d="M72 50 L77 47" stroke={GLASSES} strokeWidth={2.2} strokeLinecap="round" />

        {/* Eyes */}
        <AnimatedEye cx={38} cy={52} blink={blink} />
        <AnimatedEye cx={62} cy={52} blink={blink} />

        {/* Mouth (mood-dependent) */}
        <Path d={MOUTHS[mood]} stroke={colors.brownText} strokeWidth={mood === "happy" || mood === "celebrating" ? 0 : 3} fill={mood === "happy" || mood === "celebrating" ? colors.brownText : "none"} strokeLinecap="round" opacity={mood === "happy" || mood === "celebrating" ? 0.85 : 1} />

        {mood === "celebrating" && (
          <>
            <AnimatedSparkle cx={16} cy={22} progress={sparkle} />
            <AnimatedSparkle cx={84} cy={26} progress={sparkle} />
            <AnimatedSparkle cx={50} cy={4} progress={sparkle} />
          </>
        )}
      </Svg>
    </View>
  );
}

function AnimatedEye({ cx, cy, blink }: { cx: number; cy: number; blink: Animated.Value }) {
  const ry = blink.interpolate({ inputRange: [0.1, 1], outputRange: [0.4, 3.4] });
  return <AnimatedEllipse cx={cx} cy={cy} rx={3.4} ry={ry as any} fill={colors.brownText} />;
}

const AnimatedPath = Animated.createAnimatedComponent(Path);

function AnimatedSparkle({ cx, cy, progress }: { cx: number; cy: number; progress: Animated.Value }) {
  const opacity = progress;
  const s = 4;
  return (
    <AnimatedPath
      d={`M${cx} ${cy - s} L${cx + s * 0.3} ${cy - s * 0.3} L${cx + s} ${cy} L${cx + s * 0.3} ${cy + s * 0.3} L${cx} ${cy + s} L${cx - s * 0.3} ${cy + s * 0.3} L${cx - s} ${cy} L${cx - s * 0.3} ${cy - s * 0.3} Z`}
      fill={colors.coral}
      opacity={opacity as any}
    />
  );
}
