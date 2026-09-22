import React, { useState } from "react";
import { View, Text, StyleSheet, Pressable } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { api } from "../../api/client";
import { useAuthStore } from "../../state/authStore";
import { colors, typography, spacing, radii, MIN_TOUCH_TARGET } from "../../theme/theme";

const OPTIONS: { key: "WARM" | "FUNNY" | "CALM" | "PRACTICAL"; label: string; blurb: string }[] = [
  { key: "WARM", label: "Warm & caring", blurb: "Gentle, doting, full of endearments" },
  { key: "FUNNY", label: "Funny & playful", blurb: "Light teasing, quick with a joke" },
  { key: "CALM", label: "Calm & gentle", blurb: "Slow, soothing, grounding" },
  { key: "PRACTICAL", label: "Practical & direct", blurb: "No-nonsense, gets to the point" },
];

export function PersonalitySettingsScreen() {
  const refreshMe = useAuthStore((s) => s.refreshMe);
  const [selected, setSelected] = useState<string | null>(null);

  const choose = async (key: string) => {
    setSelected(key);
    await api.patch("/users/me", { personalityStyle: key });
    await refreshMe();
  };

  return (
    <SafeAreaView style={styles.container}>
      <Text style={[typography.body, styles.note]}>
        This changes Grandma's tone only - she'll always tell the truth, recommend a professional when it matters, and never pretend to be
        something she isn't.
      </Text>
      {OPTIONS.map((opt) => (
        <Pressable
          key={opt.key}
          onPress={() => choose(opt.key)}
          style={[styles.option, selected === opt.key && styles.optionSelected]}
          accessibilityRole="radio"
          accessibilityState={{ selected: selected === opt.key }}
        >
          <Text style={typography.subtitle}>{opt.label}</Text>
          <Text style={typography.caption}>{opt.blurb}</Text>
        </Pressable>
      ))}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.cream, padding: spacing.md },
  note: { color: colors.brownMuted, marginBottom: spacing.md },
  option: { minHeight: MIN_TOUCH_TARGET, padding: spacing.md, borderRadius: radii.md, borderWidth: 1.5, borderColor: colors.border, backgroundColor: colors.card, marginBottom: spacing.sm },
  optionSelected: { borderColor: colors.coral, backgroundColor: "#FDEEEB" },
});
