import React, { useState } from "react";
import { FlatList, ActivityIndicator, View, Text, StyleSheet } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { NativeStackScreenProps } from "@react-navigation/native-stack";
import { RecipesStackParamList } from "../../navigation/types";
import { useRecipes, useGenerateRecipe, useRecipeUsage } from "../../hooks/useRecipes";
import { RecipeRow } from "./RecipesHomeScreen";
import { EmptyState } from "../../components/EmptyState";
import { PrimaryButton } from "../../components/PrimaryButton";
import { colors, typography, spacing } from "../../theme/theme";

type Props = NativeStackScreenProps<RecipesStackParamList, "RecipeCategory">;

/** Skeleton rows shown while a recipe generates (Section 5). */
function SkeletonCard() {
  return <View style={styles.skeleton} />;
}

export function RecipeCategoryScreen({ route, navigation }: Props) {
  const { category } = route.params;
  const { data, loading, refresh } = useRecipes({ category });
  const { generate, generating, atCap } = useGenerateRecipe();
  const [usageRefreshKey, setUsageRefreshKey] = useState(0);
  const { data: usage } = useRecipeUsage(usageRefreshKey);

  const askGrandmaForRecipe = async () => {
    const recipe = await generate(`A ${category} recipe`, category);
    setUsageRefreshKey((k) => k + 1);
    if (recipe) {
      await refresh();
      navigation.navigate("RecipeDetail", { recipeId: recipe.id });
    }
  };

  if (loading && !data) {
    return (
      <SafeAreaView style={styles.container}>
        {[1, 2, 3].map((i) => (
          <SkeletonCard key={i} />
        ))}
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      {usage && !usage.unlimited && (
        <Text style={styles.usageText}>{usage.remaining} of {usage.cap} free Grandma recipes left today</Text>
      )}
      {generating && <SkeletonCard />}
      <FlatList
        data={data?.recipes ?? []}
        keyExtractor={(r) => r.id}
        contentContainerStyle={{ padding: spacing.md }}
        renderItem={({ item }) => <RecipeRow recipe={item} onPress={() => navigation.navigate("RecipeDetail", { recipeId: item.id })} />}
        ListEmptyComponent={
          !generating ? (
            atCap ? (
              <EmptyState message="You've used today's free recipes - Grandma+ gives you unlimited recipe generation." />
            ) : (
              <EmptyState
                message={`No ${category} recipes yet - want Grandma to whip one up?`}
                actionLabel="Ask Grandma for a recipe"
                onAction={askGrandmaForRecipe}
              />
            )
          ) : null
        }
      />
      {atCap && (
        <PrimaryButton
          label="See Grandma+ - $14.99/mo"
          onPress={() => navigation.getParent()?.navigate("ProfileTab", { screen: "SubscriptionSettings" } as any)}
          style={{ margin: spacing.md }}
        />
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.cream },
  skeleton: { height: 72, backgroundColor: colors.border, borderRadius: 16, margin: spacing.md, opacity: 0.6 },
  usageText: { textAlign: "center", color: colors.brownMuted, fontSize: 12, paddingVertical: 4 },
});
