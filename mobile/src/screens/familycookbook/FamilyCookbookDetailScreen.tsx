import React, { useState } from "react";
import { View, Text, StyleSheet, ScrollView, Image, ActivityIndicator, TextInput, Share } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { NativeStackScreenProps } from "@react-navigation/native-stack";
import { RecipesStackParamList } from "../../navigation/types";
import { useFamilyCookbookDetail, FamilyCookbookRecipe } from "../../hooks/useFamilyCookbook";
import { useSubscriptionStatus } from "../../hooks/useSubscriptionStatus";
import { api } from "../../api/client";
import { Card } from "../../components/Card";
import { PrimaryButton } from "../../components/PrimaryButton";
import { colors, typography, spacing, radii } from "../../theme/theme";
import { API_URL } from "../../api/config";

function formatRecipeForSharing(recipe: FamilyCookbookRecipe): string {
  const parts = [recipe.relatedPerson ? `${recipe.name} - ${recipe.relatedPerson}` : recipe.name];
  if (recipe.memoryStory) parts.push(`"${recipe.memoryStory}"`);
  if (recipe.ingredients.length) parts.push(["Ingredients:", ...recipe.ingredients.map((i) => `- ${i}`)].join("\n"));
  if (recipe.steps.length) parts.push(["Steps:", ...recipe.steps.map((s, i) => `${i + 1}. ${s}`)].join("\n"));
  parts.push("Shared from Grandma AI's Family Cookbook ❤️");
  return parts.join("\n\n");
}

type Props = NativeStackScreenProps<RecipesStackParamList, "FamilyCookbookDetail">;

export function FamilyCookbookDetailScreen({ route }: Props) {
  const { recipeId } = route.params;
  const { data, loading, refresh } = useFamilyCookbookDetail(recipeId);
  const recipe = data?.recipe;
  const { tier } = useSubscriptionStatus();
  const [editing, setEditing] = useState(false);
  const [ingredientsText, setIngredientsText] = useState("");
  const [stepsText, setStepsText] = useState("");
  const [saving, setSaving] = useState(false);

  if (loading || !recipe) {
    return (
      <SafeAreaView style={styles.container}>
        <ActivityIndicator color={colors.coral} style={{ marginTop: spacing.xl }} />
      </SafeAreaView>
    );
  }

  const startEditing = () => {
    setIngredientsText(recipe.ingredients.join("\n"));
    setStepsText(recipe.steps.join("\n"));
    setEditing(true);
  };

  const saveEdits = async () => {
    setSaving(true);
    try {
      await api.patch(`/family-cookbook/${recipe.id}`, {
        ingredients: ingredientsText.split("\n").map((s) => s.trim()).filter(Boolean),
        steps: stepsText.split("\n").map((s) => s.trim()).filter(Boolean),
        needsReview: false,
      });
      await refresh();
      setEditing(false);
    } finally {
      setSaving(false);
    }
  };

  const photoUrl = recipe.originalPhotoUrl ? (recipe.originalPhotoUrl.startsWith("http") ? recipe.originalPhotoUrl : `${API_URL}${recipe.originalPhotoUrl}`) : null;

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={{ padding: spacing.md }}>
        {photoUrl && <Image source={{ uri: photoUrl }} style={styles.photo} accessibilityLabel="Original recipe photo" />}
        <Text style={[typography.hero, { color: colors.coralDark }]}>{recipe.name}</Text>
        {recipe.relatedPerson && <Text style={typography.subtitle}>{recipe.relatedPerson}</Text>}
        {recipe.memoryStory && <Text style={[typography.body, styles.story]}>"{recipe.memoryStory}"</Text>}

        {tier === "PLUS" && (
          <PrimaryButton
            label="Share through Messages"
            variant="secondary"
            onPress={() => Share.share({ message: formatRecipeForSharing(recipe) })}
            style={{ marginTop: spacing.md, alignSelf: "flex-start" }}
          />
        )}

        {recipe.needsReview && !editing && (
          <Card style={styles.reviewCard}>
            <Text style={[typography.body, { fontWeight: "700" }]}>I wasn't totally sure I read this right</Text>
            <Text style={typography.caption}>Take a look and fix anything that doesn't look right, sweetheart.</Text>
            <PrimaryButton label="Review & fix" onPress={startEditing} style={{ marginTop: spacing.sm, alignSelf: "flex-start" }} />
          </Card>
        )}

        {editing ? (
          <Card style={{ marginTop: spacing.md }}>
            <Text style={typography.subtitle}>Ingredients</Text>
            <TextInput style={styles.editArea} value={ingredientsText} onChangeText={setIngredientsText} multiline accessibilityLabel="Edit ingredients" />
            <Text style={[typography.subtitle, { marginTop: spacing.md }]}>Steps</Text>
            <TextInput style={styles.editArea} value={stepsText} onChangeText={setStepsText} multiline accessibilityLabel="Edit steps" />
            <PrimaryButton label="Save" onPress={saveEdits} loading={saving} style={{ marginTop: spacing.md, alignSelf: "flex-start" }} />
          </Card>
        ) : (
          <>
            <Card style={{ marginTop: spacing.md }}>
              <Text style={typography.subtitle}>Ingredients</Text>
              {recipe.ingredients.map((ing, i) => (
                <Text key={i} style={[typography.body, styles.listItem]}>
                  • {ing}
                </Text>
              ))}
            </Card>
            <Card style={{ marginTop: spacing.md }}>
              <Text style={typography.subtitle}>Steps</Text>
              {recipe.steps.map((s, i) => (
                <Text key={i} style={[typography.body, styles.listItem]}>
                  {i + 1}. {s}
                </Text>
              ))}
            </Card>
          </>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#FBEFE4" },
  photo: { width: "100%", height: 220, borderRadius: radii.lg, marginBottom: spacing.md },
  story: { fontStyle: "italic", marginTop: spacing.sm, color: colors.brownMuted },
  reviewCard: { marginTop: spacing.md, backgroundColor: "#FFF3D6" },
  listItem: { marginTop: 4 },
  editArea: { minHeight: 100, borderWidth: 1, borderColor: colors.border, borderRadius: radii.sm, padding: spacing.sm, textAlignVertical: "top", backgroundColor: "#FFFDF9" },
});
