import React, { useState } from "react";
import { View, Text, StyleSheet, FlatList, Pressable, TextInput, ActivityIndicator, Image } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { NativeStackScreenProps } from "@react-navigation/native-stack";
import { RecipesStackParamList } from "../../navigation/types";
import { useRecipes, RECIPE_CATEGORIES, Recipe } from "../../hooks/useRecipes";
import { Card } from "../../components/Card";
import { AdSlot } from "../../components/AdSlot";
import { colors, typography, spacing, radii, MIN_TOUCH_TARGET } from "../../theme/theme";

type Props = NativeStackScreenProps<RecipesStackParamList, "RecipesHome">;

export function RecipesHomeScreen({ navigation }: Props) {
  const [search, setSearch] = useState("");
  const [difficulty, setDifficulty] = useState<string | undefined>(undefined);
  const { data, loading } = useRecipes({ search: search || undefined, difficulty });

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.headerRow}>
        <Text style={typography.hero}>Recipes 🍲</Text>
        <Pressable
          onPress={() => navigation.navigate("FamilyCookbook")}
          style={styles.cookbookLink}
          accessibilityRole="button"
          accessibilityLabel="Open Our Family Cookbook"
        >
          <Text style={[typography.caption, { color: colors.coralDark, fontWeight: "700" }]}>Family Cookbook ❤️</Text>
        </Pressable>
      </View>

      <TextInput
        style={styles.search}
        placeholder="Search recipes..."
        placeholderTextColor={colors.brownMuted}
        value={search}
        onChangeText={setSearch}
        accessibilityLabel="Search recipes"
      />

      <FlatList
        horizontal
        showsHorizontalScrollIndicator={false}
        data={["Any", "easy", "medium", "hard"]}
        keyExtractor={(d) => d}
        contentContainerStyle={{ paddingBottom: spacing.sm }}
        renderItem={({ item }) => {
          const value = item === "Any" ? undefined : item;
          const selected = difficulty === value;
          return (
            <Pressable
              onPress={() => setDifficulty(value)}
              style={[styles.filterChip, selected && styles.filterChipSelected]}
              accessibilityRole="button"
              accessibilityState={{ selected }}
            >
              <Text style={[typography.caption, selected && { color: "#fff" }]}>{item}</Text>
            </Pressable>
          );
        }}
      />

      {search.length > 0 ? (
        loading ? (
          <ActivityIndicator color={colors.coral} style={{ marginTop: spacing.lg }} />
        ) : (
          <FlatList
            data={data?.recipes ?? []}
            keyExtractor={(r) => r.id}
            contentContainerStyle={{ padding: spacing.md }}
            renderItem={({ item }) => <RecipeRow recipe={item} onPress={() => navigation.navigate("RecipeDetail", { recipeId: item.id })} />}
            ListEmptyComponent={<Text style={[typography.body, styles.empty]}>No recipes match yet - try asking Grandma to make one.</Text>}
          />
        )
      ) : (
        <FlatList
          data={RECIPE_CATEGORIES}
          keyExtractor={(c) => c}
          numColumns={2}
          contentContainerStyle={{ padding: spacing.md }}
          columnWrapperStyle={{ gap: spacing.sm }}
          ListFooterComponent={<AdSlot screen="recipes_list" />}
          renderItem={({ item }) => (
            <Pressable
              onPress={() => navigation.navigate("RecipeCategory", { category: item })}
              style={styles.categoryCard}
              accessibilityRole="button"
              accessibilityLabel={item}
            >
              <Text style={typography.subtitle}>{item}</Text>
            </Pressable>
          )}
        />
      )}
    </SafeAreaView>
  );
}

export function RecipeRow({ recipe, onPress }: { recipe: Recipe; onPress: () => void }) {
  return (
    <Pressable onPress={onPress} accessibilityRole="button" accessibilityLabel={recipe.name}>
      <Card style={styles.recipeRow}>
        <View style={styles.recipeImagePlaceholder}>
          {recipe.imageUrl ? <Image source={{ uri: recipe.imageUrl }} style={styles.recipeImage} /> : <Text style={{ fontSize: 24 }}>🍽️</Text>}
        </View>
        <View style={{ flex: 1, marginLeft: spacing.md }}>
          <Text style={typography.subtitle}>{recipe.name}</Text>
          <Text style={typography.caption}>
            {recipe.prepMinutes + recipe.cookMinutes} min · {recipe.difficulty} · {recipe.category}
          </Text>
        </View>
      </Card>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.cream },
  headerRow: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", paddingHorizontal: spacing.md, paddingTop: spacing.sm },
  cookbookLink: { minHeight: MIN_TOUCH_TARGET, justifyContent: "center" },
  search: {
    margin: spacing.md,
    minHeight: MIN_TOUCH_TARGET,
    backgroundColor: colors.card,
    borderRadius: radii.md,
    borderWidth: 1,
    borderColor: colors.border,
    paddingHorizontal: spacing.md,
    color: colors.brownText,
  },
  filterChip: {
    marginLeft: spacing.md,
    paddingHorizontal: spacing.md,
    minHeight: 36,
    justifyContent: "center",
    borderRadius: radii.pill,
    backgroundColor: colors.card,
    borderWidth: 1,
    borderColor: colors.border,
  },
  filterChipSelected: { backgroundColor: colors.coral, borderColor: colors.coral },
  categoryCard: {
    flex: 1,
    minHeight: 80,
    backgroundColor: colors.card,
    borderRadius: radii.md,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: spacing.sm,
    padding: spacing.md,
  },
  recipeRow: { flexDirection: "row", alignItems: "center", marginBottom: spacing.sm },
  recipeImagePlaceholder: {
    width: 56,
    height: 56,
    borderRadius: radii.sm,
    backgroundColor: colors.cream,
    alignItems: "center",
    justifyContent: "center",
    overflow: "hidden",
  },
  recipeImage: { width: 56, height: 56 },
  empty: { textAlign: "center", marginTop: spacing.lg, color: colors.brownMuted },
});
