import React, { useMemo, useState } from "react";
import { View, Text, StyleSheet, SectionList, Pressable, TextInput, ActivityIndicator } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { NativeStackScreenProps } from "@react-navigation/native-stack";
import { TasksStackParamList } from "../../navigation/types";
import { useGroceryListDetail, GroceryItem, STORE_CATEGORIES } from "../../hooks/useGroceryLists";
import { PrimaryButton } from "../../components/PrimaryButton";
import { colors, typography, spacing, radii, MIN_TOUCH_TARGET } from "../../theme/theme";

type Props = NativeStackScreenProps<TasksStackParamList, "GroceryListDetail">;

export function GroceryListDetailScreen({ route }: Props) {
  const { listId } = route.params;
  const { list, loading, toggleItem, addItem, removeItem } = useGroceryListDetail(listId);
  const [newItem, setNewItem] = useState("");

  const sections = useMemo(() => {
    if (!list) return [];
    const byCategory = new Map<string, GroceryItem[]>();
    for (const item of list.items) {
      const list2 = byCategory.get(item.storeCategory) ?? [];
      list2.push(item);
      byCategory.set(item.storeCategory, list2);
    }
    return STORE_CATEGORIES.filter((c) => byCategory.has(c)).map((c) => ({ title: c, data: byCategory.get(c)! }));
  }, [list]);

  if (loading || !list) {
    return (
      <SafeAreaView style={styles.container}>
        <ActivityIndicator color={colors.coral} style={{ marginTop: spacing.xl }} />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <Text style={[typography.hero, { padding: spacing.md, paddingBottom: 0 }]}>{list.title}</Text>

      <View style={styles.addRow}>
        <TextInput
          style={styles.addInput}
          placeholder="Add an item..."
          placeholderTextColor={colors.brownMuted}
          value={newItem}
          onChangeText={setNewItem}
          onSubmitEditing={async () => {
            if (!newItem.trim()) return;
            await addItem(newItem.trim());
            setNewItem("");
          }}
          accessibilityLabel="New grocery item"
        />
        <PrimaryButton
          label="Add"
          onPress={async () => {
            if (!newItem.trim()) return;
            await addItem(newItem.trim());
            setNewItem("");
          }}
        />
      </View>

      <SectionList
        sections={sections}
        keyExtractor={(item) => item.id}
        contentContainerStyle={{ padding: spacing.md }}
        renderSectionHeader={({ section }) => <Text style={styles.sectionHeader}>{section.title}</Text>}
        renderItem={({ item }) => (
          <View style={styles.itemRow}>
            <Pressable
              onPress={() => toggleItem(item.id, !item.checked)}
              style={[styles.checkbox, item.checked && styles.checkboxChecked]}
              accessibilityRole="checkbox"
              accessibilityState={{ checked: item.checked }}
              accessibilityLabel={item.name}
            >
              {item.checked && <Text style={styles.checkmark}>✓</Text>}
            </Pressable>
            <Text style={[typography.body, styles.itemName, item.checked && styles.itemChecked]}>
              {item.name} {item.quantity ? `(${item.quantity})` : ""}
            </Text>
            <Pressable onPress={() => removeItem(item.id)} accessibilityLabel={`Remove ${item.name}`} style={styles.removeButton}>
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
  addRow: { flexDirection: "row", padding: spacing.md, alignItems: "center" },
  addInput: { flex: 1, minHeight: MIN_TOUCH_TARGET, backgroundColor: colors.card, borderRadius: radii.md, borderWidth: 1, borderColor: colors.border, paddingHorizontal: spacing.md, marginRight: spacing.sm, color: colors.brownText },
  sectionHeader: { ...typography.caption, textTransform: "uppercase", fontWeight: "700", marginTop: spacing.md, marginBottom: spacing.xs, color: colors.brownMuted },
  itemRow: { flexDirection: "row", alignItems: "center", minHeight: MIN_TOUCH_TARGET },
  checkbox: { width: 24, height: 24, borderRadius: 6, borderWidth: 2, borderColor: colors.coral, marginRight: spacing.sm, alignItems: "center", justifyContent: "center" },
  checkboxChecked: { backgroundColor: colors.coral },
  checkmark: { color: "#fff", fontSize: 12, fontWeight: "700" },
  itemName: { flex: 1 },
  itemChecked: { textDecorationLine: "line-through", color: colors.brownMuted },
  removeButton: { width: MIN_TOUCH_TARGET, height: MIN_TOUCH_TARGET, alignItems: "center", justifyContent: "center" },
});
