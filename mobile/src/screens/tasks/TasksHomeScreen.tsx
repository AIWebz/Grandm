import React, { useMemo, useState } from "react";
import { View, Text, StyleSheet, SectionList, Pressable, TextInput } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { NativeStackScreenProps } from "@react-navigation/native-stack";
import { TasksStackParamList } from "../../navigation/types";
import { useTasks, Task } from "../../hooks/useTasks";
import { EmptyState } from "../../components/EmptyState";
import { PrimaryButton } from "../../components/PrimaryButton";
import { AdSlot } from "../../components/AdSlot";
import { colors, typography, spacing, radii, MIN_TOUCH_TARGET } from "../../theme/theme";

type Props = NativeStackScreenProps<TasksStackParamList, "TasksHome">;

const CATEGORY_META: Record<string, { label: string; emoji: string }> = {
  CLEANING: { label: "Cleaning", emoji: "🧹" },
  LAUNDRY: { label: "Laundry", emoji: "🧺" },
  KITCHEN: { label: "Kitchen", emoji: "🍳" },
  YARD: { label: "Yard", emoji: "🌱" },
  SHOPPING: { label: "Shopping", emoji: "🛒" },
  PETS: { label: "Pets", emoji: "🐶" },
  HOUSEHOLD: { label: "Household", emoji: "🏠" },
  OTHER: { label: "Other", emoji: "📦" },
};

export function TasksHomeScreen({ navigation }: Props) {
  const { tasks, loading, toggleComplete, createTask, deleteTask } = useTasks();
  const [newTitle, setNewTitle] = useState("");

  const sections = useMemo(() => {
    const byCategory = new Map<string, Task[]>();
    for (const task of tasks) {
      const list = byCategory.get(task.category) ?? [];
      list.push(task);
      byCategory.set(task.category, list);
    }
    return Array.from(byCategory.entries()).map(([category, data]) => ({
      title: CATEGORY_META[category]?.label ?? category,
      emoji: CATEGORY_META[category]?.emoji ?? "📦",
      data,
    }));
  }, [tasks]);

  const addTask = async () => {
    if (!newTitle.trim()) return;
    await createTask({ title: newTitle.trim() });
    setNewTitle("");
  };

  return (
    <SafeAreaView style={styles.container} edges={["left", "right", "bottom"]}>
      <View style={styles.header}>
        <View style={styles.headerLinks}>
          <PrimaryButton label="Planner" variant="ghost" onPress={() => navigation.navigate("Planner")} />
          <PrimaryButton label="Grocery" variant="ghost" onPress={() => navigation.navigate("GroceryLists")} />
        </View>
      </View>

      <View style={styles.addRow}>
        <TextInput
          style={styles.addInput}
          placeholder="Add a task..."
          placeholderTextColor={colors.brownMuted}
          value={newTitle}
          onChangeText={setNewTitle}
          onSubmitEditing={addTask}
          accessibilityLabel="New task title"
        />
        <PrimaryButton label="Add" onPress={addTask} />
      </View>

      <SectionList
        sections={sections}
        keyExtractor={(item) => item.id}
        contentContainerStyle={{ padding: spacing.md }}
        ListHeaderComponent={<AdSlot screen="tasks_list" />}
        ListEmptyComponent={!loading ? <EmptyState message="Nothing here yet - add a task above, or ask Grandma for help." /> : null}
        renderSectionHeader={({ section }) => (
          <Text style={styles.sectionHeader}>
            {section.emoji} {section.title}
          </Text>
        )}
        renderItem={({ item }) => (
          <View style={styles.taskRow}>
            <Pressable
              onPress={() => toggleComplete(item)}
              style={[styles.checkbox, item.completed && styles.checkboxChecked]}
              accessibilityRole="checkbox"
              accessibilityState={{ checked: item.completed }}
              accessibilityLabel={item.title}
            >
              {item.completed && <Text style={styles.checkmark}>✓</Text>}
            </Pressable>
            <Text style={[typography.body, styles.taskTitle, item.completed && styles.taskDone]}>{item.title}</Text>
            {item.recurrence !== "NONE" && <Text style={styles.recurBadge}>↻</Text>}
            <Pressable onPress={() => deleteTask(item.id)} accessibilityRole="button" accessibilityLabel={`Delete ${item.title}`} style={styles.deleteButton}>
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
  header: { flexDirection: "row", justifyContent: "flex-end", alignItems: "center", padding: spacing.md, paddingBottom: 0 },
  headerLinks: { flexDirection: "row" },
  addRow: { flexDirection: "row", padding: spacing.md, alignItems: "center" },
  addInput: {
    flex: 1,
    minHeight: MIN_TOUCH_TARGET,
    backgroundColor: colors.card,
    borderRadius: radii.md,
    borderWidth: 1,
    borderColor: colors.border,
    paddingHorizontal: spacing.md,
    marginRight: spacing.sm,
    color: colors.brownText,
  },
  sectionHeader: { ...typography.subtitle, marginTop: spacing.md, marginBottom: spacing.xs },
  taskRow: { flexDirection: "row", alignItems: "center", minHeight: MIN_TOUCH_TARGET, paddingVertical: spacing.xs },
  checkbox: { width: 26, height: 26, borderRadius: 8, borderWidth: 2, borderColor: colors.coral, marginRight: spacing.sm, alignItems: "center", justifyContent: "center" },
  checkboxChecked: { backgroundColor: colors.coral },
  checkmark: { color: "#fff", fontWeight: "700" },
  taskTitle: { flex: 1 },
  taskDone: { textDecorationLine: "line-through", color: colors.brownMuted },
  recurBadge: { color: colors.brownMuted, marginRight: spacing.sm },
  deleteButton: { width: MIN_TOUCH_TARGET, height: MIN_TOUCH_TARGET, alignItems: "center", justifyContent: "center" },
});
