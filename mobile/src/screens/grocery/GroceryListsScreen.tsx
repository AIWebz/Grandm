import React, { useState } from "react";
import { View, Text, StyleSheet, FlatList, Pressable, TextInput } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { NativeStackScreenProps } from "@react-navigation/native-stack";
import { TasksStackParamList } from "../../navigation/types";
import { useGroceryLists } from "../../hooks/useGroceryLists";
import { useSubscriptionStatus } from "../../hooks/useSubscriptionStatus";
import { Card } from "../../components/Card";
import { EmptyState } from "../../components/EmptyState";
import { PrimaryButton } from "../../components/PrimaryButton";
import { AdSlot } from "../../components/AdSlot";
import { colors, typography, spacing, radii, MIN_TOUCH_TARGET } from "../../theme/theme";

type Props = NativeStackScreenProps<TasksStackParamList, "GroceryLists">;

export function GroceryListsScreen({ navigation }: Props) {
  const { groceryLists, loading, createList, deleteList, mergeLists } = useGroceryLists();
  const { tier } = useSubscriptionStatus();
  const [newTitle, setNewTitle] = useState("");
  const [selecting, setSelecting] = useState(false);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);

  const toggleSelect = (id: string) => setSelectedIds((prev) => (prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]));

  const doMerge = async () => {
    if (selectedIds.length < 2) return;
    const merged = await mergeLists(selectedIds);
    if (merged) {
      setSelecting(false);
      setSelectedIds([]);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={typography.hero}>Grocery Lists 🛒</Text>
        <PrimaryButton
          label={selecting ? "Cancel" : "Merge lists"}
          variant="ghost"
          onPress={() => {
            setSelecting((v) => !v);
            setSelectedIds([]);
          }}
        />
      </View>

      {tier !== "PLUS" && (
        <Text style={styles.upsellNote}>Grocery list generation is a Grandma+ feature - $14.99/mo.</Text>
      )}

      <View style={styles.addRow}>
        <TextInput
          style={styles.addInput}
          placeholder="New list name..."
          placeholderTextColor={colors.brownMuted}
          value={newTitle}
          onChangeText={setNewTitle}
          accessibilityLabel="New grocery list name"
        />
        <PrimaryButton
          label="Create"
          onPress={async () => {
            if (!newTitle.trim()) return;
            const created = await createList(newTitle.trim());
            if (created) setNewTitle("");
          }}
        />
      </View>

      {selecting && selectedIds.length >= 2 && <PrimaryButton label={`Merge ${selectedIds.length} lists`} onPress={doMerge} style={{ margin: spacing.md }} />}

      <FlatList
        data={groceryLists}
        keyExtractor={(l) => l.id}
        contentContainerStyle={{ padding: spacing.md }}
        ListHeaderComponent={<AdSlot screen="grocery_list" />}
        ListEmptyComponent={
          !loading ? (
            <EmptyState
              message={
                tier === "PLUS"
                  ? "No grocery lists yet - make one from a recipe or ask Grandma."
                  : "Grocery lists are part of Grandma+ - upgrade to generate one from any recipe or right from chat."
              }
            />
          ) : null
        }
        renderItem={({ item }) => {
          const checkedCount = item.items.filter((i) => i.checked).length;
          const selected = selectedIds.includes(item.id);
          return (
            <Pressable
              onPress={() => (selecting ? toggleSelect(item.id) : navigation.navigate("GroceryListDetail", { listId: item.id }))}
              accessibilityRole="button"
              accessibilityLabel={item.title}
            >
              <Card style={[styles.listCard, selected && styles.listCardSelected]}>
                <Text style={typography.subtitle}>{item.title}</Text>
                <Text style={typography.caption}>
                  {checkedCount} of {item.items.length} items checked
                </Text>
              </Card>
            </Pressable>
          );
        }}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.cream },
  header: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", padding: spacing.md, paddingBottom: 0 },
  upsellNote: { color: colors.coralDark, fontSize: 12, textAlign: "center", marginTop: spacing.xs },
  addRow: { flexDirection: "row", padding: spacing.md, alignItems: "center" },
  addInput: { flex: 1, minHeight: MIN_TOUCH_TARGET, backgroundColor: colors.card, borderRadius: radii.md, borderWidth: 1, borderColor: colors.border, paddingHorizontal: spacing.md, marginRight: spacing.sm, color: colors.brownText },
  listCard: { marginBottom: spacing.sm },
  listCardSelected: { borderWidth: 2, borderColor: colors.coral },
});
