import React, { useState } from "react";
import { View, Text, StyleSheet, FlatList, Switch, TextInput, Pressable, Alert } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useMemory, MemoryFact } from "../../hooks/useMemory";
import { Card } from "../../components/Card";
import { PrimaryButton } from "../../components/PrimaryButton";
import { EmptyState } from "../../components/EmptyState";
import { colors, typography, spacing, MIN_TOUCH_TARGET } from "../../theme/theme";

const CATEGORY_LABELS: Record<string, string> = {
  favorite_food: "Favorite food",
  disliked_food: "Disliked food",
  dietary_restriction: "Dietary restriction",
  favorite_recipe: "Favorite recipe",
  routine: "Household routine",
  skill_level: "Cooking skill level",
  schedule: "Typical schedule",
  other: "Other",
};

export function MemorySettingsScreen() {
  const { memoryOptIn, facts, setOptIn, updateFact, deleteFact, forgetEverything } = useMemory();
  const [editingId, setEditingId] = useState<string | null>(null);
  const [draft, setDraft] = useState("");

  const confirmForgetAll = () => {
    Alert.alert("Forget everything?", "This deletes every fact Grandma remembers about you. This can't be undone.", [
      { text: "Cancel", style: "cancel" },
      { text: "Forget everything", style: "destructive", onPress: forgetEverything },
    ]);
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.optInRow}>
        <View style={{ flex: 1 }}>
          <Text style={typography.subtitle}>Let Grandma remember things</Text>
          <Text style={typography.caption}>
            Favorite/disliked foods, dietary needs, routines, schedule patterns, and skill level - only what helps with cooking, planning, and chores.
          </Text>
        </View>
        <Switch value={memoryOptIn} onValueChange={setOptIn} accessibilityLabel="Let Grandma remember things" />
      </View>

      {memoryOptIn && (
        <FlatList
          data={facts}
          keyExtractor={(f) => f.id}
          contentContainerStyle={{ padding: spacing.md }}
          ListEmptyComponent={<EmptyState message="Nothing remembered yet - it'll show up here as you chat." />}
          ListFooterComponent={
            facts.length > 0 ? <PrimaryButton label="Forget everything" variant="ghost" onPress={confirmForgetAll} style={{ marginTop: spacing.md }} /> : null
          }
          renderItem={({ item }: { item: MemoryFact }) => (
            <Card style={{ marginBottom: spacing.sm }}>
              <Text style={typography.caption}>{CATEGORY_LABELS[item.category] ?? item.category}</Text>
              {editingId === item.id ? (
                <View>
                  <TextInput style={styles.editInput} value={draft} onChangeText={setDraft} accessibilityLabel="Edit remembered fact" />
                  <View style={styles.editRow}>
                    <PrimaryButton
                      label="Save"
                      onPress={async () => {
                        await updateFact(item.id, draft);
                        setEditingId(null);
                      }}
                    />
                    <PrimaryButton label="Cancel" variant="ghost" onPress={() => setEditingId(null)} />
                  </View>
                </View>
              ) : (
                <View style={styles.factRow}>
                  <Text style={[typography.body, { flex: 1 }]}>{item.fact}</Text>
                  <Pressable
                    onPress={() => {
                      setEditingId(item.id);
                      setDraft(item.fact);
                    }}
                    accessibilityLabel={`Edit: ${item.fact}`}
                    style={styles.iconButton}
                  >
                    <Text>✏️</Text>
                  </Pressable>
                  <Pressable onPress={() => deleteFact(item.id)} accessibilityLabel={`Delete: ${item.fact}`} style={styles.iconButton}>
                    <Text>🗑️</Text>
                  </Pressable>
                </View>
              )}
            </Card>
          )}
        />
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.cream },
  optInRow: { flexDirection: "row", alignItems: "center", padding: spacing.md, borderBottomWidth: 1, borderBottomColor: colors.border },
  factRow: { flexDirection: "row", alignItems: "center", marginTop: spacing.xs },
  iconButton: { width: MIN_TOUCH_TARGET, height: MIN_TOUCH_TARGET, alignItems: "center", justifyContent: "center" },
  editInput: { minHeight: 44, borderWidth: 1, borderColor: colors.border, borderRadius: 8, paddingHorizontal: spacing.sm, marginTop: spacing.xs, color: colors.brownText },
  editRow: { flexDirection: "row", marginTop: spacing.xs },
});
