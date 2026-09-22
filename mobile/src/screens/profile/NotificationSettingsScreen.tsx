import React from "react";
import { View, Text, StyleSheet, Switch, Pressable } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useNotificationPrefs } from "../../hooks/useNotificationPrefs";
import { registerForPushNotifications } from "../../utils/pushRegistration";
import { PrimaryButton } from "../../components/PrimaryButton";
import { colors, typography, spacing } from "../../theme/theme";

const FREQUENCIES: { key: "OFF" | "LOW" | "NORMAL"; label: string }[] = [
  { key: "OFF", label: "Off" },
  { key: "LOW", label: "Low" },
  { key: "NORMAL", label: "Normal" },
];

export function NotificationSettingsScreen() {
  const { preferences, update, registerToken } = useNotificationPrefs();

  const enablePush = async () => {
    const token = await registerForPushNotifications();
    if (token) await registerToken(token);
  };

  if (!preferences) return <SafeAreaView style={styles.container} />;

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.section}>
        <Text style={typography.subtitle}>How often</Text>
        <View style={styles.chipRow}>
          {FREQUENCIES.map((f) => (
            <Pressable
              key={f.key}
              onPress={() => update({ frequency: f.key })}
              style={[styles.chip, preferences.frequency === f.key && styles.chipSelected]}
              accessibilityRole="radio"
              accessibilityState={{ selected: preferences.frequency === f.key }}
            >
              <Text style={preferences.frequency === f.key ? { color: "#fff" } : undefined}>{f.label}</Text>
            </Pressable>
          ))}
        </View>
      </View>

      {!preferences.pushToken && preferences.frequency !== "OFF" && (
        <PrimaryButton label="Turn on push notifications" onPress={enablePush} style={{ margin: spacing.md }} />
      )}

      <View style={styles.section}>
        <Text style={typography.subtitle}>What kind</Text>
        <Row label="Task reminders" value={preferences.taskReminders} onChange={(v) => update({ taskReminders: v })} />
        <Row label="Meal-time prompts" value={preferences.mealTimePrompts} onChange={(v) => update({ mealTimePrompts: v })} />
        <Row label="Encouragement" value={preferences.encouragement} onChange={(v) => update({ encouragement: v })} />
      </View>

      <Text style={styles.note}>
        This is independent of your phone's notification permission - both need to be on for Grandma to reach you.
      </Text>
    </SafeAreaView>
  );
}

function Row({ label, value, onChange }: { label: string; value: boolean; onChange: (v: boolean) => void }) {
  return (
    <View style={styles.row}>
      <Text style={typography.body}>{label}</Text>
      <Switch value={value} onValueChange={onChange} accessibilityLabel={label} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.cream },
  section: { padding: spacing.md, borderBottomWidth: 1, borderBottomColor: colors.border },
  chipRow: { flexDirection: "row", marginTop: spacing.sm },
  chip: { paddingHorizontal: spacing.md, paddingVertical: spacing.sm, borderRadius: 999, borderWidth: 1, borderColor: colors.border, marginRight: spacing.sm },
  chipSelected: { backgroundColor: colors.coral, borderColor: colors.coral },
  row: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", minHeight: 48 },
  note: { color: colors.brownMuted, fontSize: 12, padding: spacing.md, textAlign: "center" },
});
