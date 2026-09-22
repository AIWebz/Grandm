import React, { useState } from "react";
import { View, Text, StyleSheet, FlatList, Pressable, TextInput, Alert } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useSchedule } from "../../hooks/useSchedule";
import { EmptyState } from "../../components/EmptyState";
import { PrimaryButton } from "../../components/PrimaryButton";
import { colors, typography, spacing, radii, MIN_TOUCH_TARGET } from "../../theme/theme";

function addDays(date: Date, days: number): Date {
  const d = new Date(date);
  d.setDate(d.getDate() + days);
  return d;
}

function formatDay(date: Date): string {
  return date.toLocaleDateString(undefined, { weekday: "long", month: "short", day: "numeric" });
}

export function PlannerScreen() {
  const [day, setDay] = useState(new Date());
  const dateIso = day.toISOString().slice(0, 10);
  const { events, addEvent, rescheduleEvent, removeEvent } = useSchedule(dateIso);
  const [newTitle, setNewTitle] = useState("");
  const [newTime, setNewTime] = useState("18:00");

  const sorted = [...events].sort((a, b) => new Date(a.startTime).getTime() - new Date(b.startTime).getTime());

  const addNew = async () => {
    if (!newTitle.trim()) return;
    const [h, m] = newTime.split(":").map(Number);
    const start = new Date(day);
    start.setHours(h || 0, m || 0, 0, 0);
    await addEvent(newTitle.trim(), start.toISOString());
    setNewTitle("");
  };

  const moveToTomorrow = async (id: string, startTime: string) => {
    const start = new Date(startTime);
    const next = addDays(start, 1);
    const ok = await rescheduleEvent(id, next.toISOString());
    if (!ok) Alert.alert("This one's fixed", "This is marked fixed, so it won't move automatically.");
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.dayNav}>
        <Pressable onPress={() => setDay(addDays(day, -1))} accessibilityLabel="Previous day" style={styles.navButton}>
          <Text style={styles.navArrow}>‹</Text>
        </Pressable>
        <Text style={typography.subtitle}>{formatDay(day)}</Text>
        <Pressable onPress={() => setDay(addDays(day, 1))} accessibilityLabel="Next day" style={styles.navButton}>
          <Text style={styles.navArrow}>›</Text>
        </Pressable>
      </View>

      <View style={styles.addRow}>
        <TextInput
          style={styles.timeInput}
          value={newTime}
          onChangeText={setNewTime}
          placeholder="HH:MM"
          placeholderTextColor={colors.brownMuted}
          accessibilityLabel="Event time (24-hour HH:MM)"
        />
        <TextInput
          style={styles.titleInput}
          value={newTitle}
          onChangeText={setNewTitle}
          placeholder="Add to the schedule..."
          placeholderTextColor={colors.brownMuted}
          onSubmitEditing={addNew}
          accessibilityLabel="New schedule item"
        />
        <PrimaryButton label="Add" onPress={addNew} />
      </View>

      <FlatList
        data={sorted}
        keyExtractor={(e) => e.id}
        contentContainerStyle={{ padding: spacing.md }}
        ListEmptyComponent={<EmptyState message="Nothing scheduled for this day yet." />}
        renderItem={({ item }) => (
          <View style={styles.eventRow}>
            <Text style={styles.eventTime}>{new Date(item.startTime).toLocaleTimeString(undefined, { hour: "numeric", minute: "2-digit" })}</Text>
            <View style={{ flex: 1, marginLeft: spacing.md }}>
              <Text style={typography.body}>
                {item.title} {item.isFixed && "🔒"}
              </Text>
            </View>
            {!item.isFixed && (
              <Pressable onPress={() => moveToTomorrow(item.id, item.startTime)} accessibilityLabel={`Move ${item.title} to tomorrow`} style={styles.actionButton}>
                <Text style={typography.caption}>Move →</Text>
              </Pressable>
            )}
            <Pressable onPress={() => removeEvent(item.id)} accessibilityLabel={`Remove ${item.title}`} style={styles.actionButton}>
              <Text style={{ color: colors.brownMuted }}>✕</Text>
            </Pressable>
          </View>
        )}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.cream },
  dayNav: { flexDirection: "row", alignItems: "center", justifyContent: "center", padding: spacing.md },
  navButton: { width: MIN_TOUCH_TARGET, height: MIN_TOUCH_TARGET, alignItems: "center", justifyContent: "center" },
  navArrow: { fontSize: 24, color: colors.coralDark },
  addRow: { flexDirection: "row", paddingHorizontal: spacing.md, alignItems: "center" },
  timeInput: { width: 70, minHeight: MIN_TOUCH_TARGET, backgroundColor: colors.card, borderRadius: radii.sm, borderWidth: 1, borderColor: colors.border, paddingHorizontal: spacing.sm, marginRight: spacing.sm, color: colors.brownText },
  titleInput: { flex: 1, minHeight: MIN_TOUCH_TARGET, backgroundColor: colors.card, borderRadius: radii.sm, borderWidth: 1, borderColor: colors.border, paddingHorizontal: spacing.sm, marginRight: spacing.sm, color: colors.brownText },
  eventRow: { flexDirection: "row", alignItems: "center", minHeight: MIN_TOUCH_TARGET, paddingVertical: spacing.sm, borderBottomWidth: 1, borderBottomColor: colors.border },
  eventTime: { width: 70, color: colors.brownMuted, fontVariant: ["tabular-nums"] },
  actionButton: { minHeight: MIN_TOUCH_TARGET, justifyContent: "center", paddingHorizontal: spacing.xs },
});
