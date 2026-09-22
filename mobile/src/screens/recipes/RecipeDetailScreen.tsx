import React, { useState } from "react";
import { View, Text, StyleSheet, ScrollView, Pressable, Image, ActivityIndicator, TextInput } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { NativeStackScreenProps } from "@react-navigation/native-stack";
import { RecipesStackParamList } from "../../navigation/types";
import { useRecipeDetail } from "../../hooks/useRecipes";
import { useScaledIngredients, useSaveRecipe, useRecipeToGroceryList, useRecipeQuestion } from "../../hooks/useRecipeActions";
import { Card } from "../../components/Card";
import { PrimaryButton } from "../../components/PrimaryButton";
import { colors, typography, spacing, radii, MIN_TOUCH_TARGET } from "../../theme/theme";

type Props = NativeStackScreenProps<RecipesStackParamList, "RecipeDetail">;

export function RecipeDetailScreen({ route }: Props) {
  const { recipeId } = route.params;
  const { data, loading } = useRecipeDetail(recipeId);
  const recipe = data?.recipe;
  const [servings, setServings] = useState<number | null>(null);
  const { ingredients: scaledIngredients, scale } = useScaledIngredients(recipeId);
  const { save, saving } = useSaveRecipe();
  const { push: pushGroceryList, adding } = useRecipeToGroceryList();
  const [groceryDone, setGroceryDone] = useState(false);
  const [saved, setSaved] = useState(false);
  const [activeStep, setActiveStep] = useState(0);
  const [question, setQuestion] = useState("");
  const { ask, answer, asking } = useRecipeQuestion();

  if (loading || !recipe) {
    return (
      <SafeAreaView style={styles.container}>
        <ActivityIndicator color={colors.coral} style={{ marginTop: spacing.xl }} />
      </SafeAreaView>
    );
  }

  const currentServings = servings ?? recipe.servings;
  const ingredients = scaledIngredients ?? recipe.ingredients;

  const adjustServings = (delta: number) => {
    const next = Math.max(1, currentServings + delta);
    setServings(next);
    scale(next);
  };

  const askQuestion = () => {
    if (!question.trim()) return;
    ask({ recipeName: recipe.name, ingredients: recipe.ingredients, currentStepText: recipe.steps[activeStep]?.text, question });
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={{ padding: spacing.md }}>
        <View style={styles.imagePlaceholder}>
          {recipe.imageUrl ? <Image source={{ uri: recipe.imageUrl }} style={styles.image} /> : <Text style={{ fontSize: 40 }}>🍽️</Text>}
        </View>
        <Text style={typography.hero}>{recipe.name}</Text>
        <Text style={[typography.caption, { marginTop: spacing.xs }]}>
          Prep {recipe.prepMinutes} min · Cook {recipe.cookMinutes} min · {recipe.difficulty}
        </Text>

        <View style={styles.actionsRow}>
          <PrimaryButton
            label={saved ? "Saved ❤️" : "Save"}
            variant="secondary"
            onPress={async () => setSaved(await save(recipe.id))}
            loading={saving}
            style={{ flex: 1, marginRight: spacing.sm }}
          />
          <PrimaryButton
            label={groceryDone ? "Added ✓" : "Grocery List"}
            onPress={async () => {
              await pushGroceryList(recipe.id);
              setGroceryDone(true);
            }}
            loading={adding}
            style={{ flex: 1 }}
          />
        </View>

        <Card style={{ marginTop: spacing.md }}>
          <View style={styles.servingsRow}>
            <Text style={typography.subtitle}>Servings</Text>
            <View style={styles.stepper}>
              <Pressable onPress={() => adjustServings(-1)} style={styles.stepperButton} accessibilityLabel="Decrease servings">
                <Text style={styles.stepperText}>−</Text>
              </Pressable>
              <Text style={[typography.body, { marginHorizontal: spacing.md }]}>{currentServings}</Text>
              <Pressable onPress={() => adjustServings(1)} style={styles.stepperButton} accessibilityLabel="Increase servings">
                <Text style={styles.stepperText}>+</Text>
              </Pressable>
            </View>
          </View>
          <Text style={[typography.subtitle, { marginTop: spacing.md }]}>Ingredients</Text>
          {ingredients.map((ing, i) => (
            <Text key={i} style={[typography.body, styles.listItem]}>
              • {[ing.quantity, ing.unit, ing.name].filter(Boolean).join(" ")}
            </Text>
          ))}
        </Card>

        <Card style={{ marginTop: spacing.md }}>
          <Text style={typography.subtitle}>Steps</Text>
          {recipe.steps.map((step, i) => (
            <Pressable key={i} onPress={() => setActiveStep(i)} style={[styles.step, activeStep === i && styles.stepActive]}>
              <Text style={typography.body}>
                {i + 1}. {step.text}
              </Text>
              {step.tip && (
                <View style={styles.tipBox}>
                  <Text style={[typography.caption, { fontStyle: "italic" }]}>💬 Grandma's tip: {step.tip}</Text>
                </View>
              )}
            </Pressable>
          ))}
        </Card>

        {recipe.substitutions.length > 0 && (
          <Card style={{ marginTop: spacing.md }}>
            <Text style={typography.subtitle}>Substitutions</Text>
            {recipe.substitutions.map((s, i) => (
              <Text key={i} style={[typography.body, styles.listItem]}>
                • {s}
              </Text>
            ))}
          </Card>
        )}

        <Card style={{ marginTop: spacing.md }}>
          <Text style={typography.subtitle}>Ask Grandma about this recipe</Text>
          <Text style={typography.caption}>She'll answer based on this exact recipe and step {activeStep + 1}.</Text>
          <TextInput
            style={styles.questionInput}
            value={question}
            onChangeText={setQuestion}
            placeholder="e.g. my sauce is too thick"
            placeholderTextColor={colors.brownMuted}
            accessibilityLabel="Ask a question about this recipe"
          />
          <PrimaryButton label="Ask" onPress={askQuestion} loading={asking} style={{ marginTop: spacing.sm, alignSelf: "flex-start" }} />
          {answer && <Text style={[typography.body, styles.answer]}>{answer}</Text>}
        </Card>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.cream },
  imagePlaceholder: { height: 180, borderRadius: radii.md, backgroundColor: colors.card, alignItems: "center", justifyContent: "center", overflow: "hidden", marginBottom: spacing.md },
  image: { width: "100%", height: "100%" },
  actionsRow: { flexDirection: "row", marginTop: spacing.md },
  servingsRow: { flexDirection: "row", justifyContent: "space-between", alignItems: "center" },
  stepper: { flexDirection: "row", alignItems: "center" },
  stepperButton: { width: MIN_TOUCH_TARGET, height: MIN_TOUCH_TARGET, alignItems: "center", justifyContent: "center", backgroundColor: colors.cream, borderRadius: radii.pill },
  stepperText: { fontSize: 20, color: colors.coralDark },
  listItem: { marginTop: 2 },
  step: { paddingVertical: spacing.sm, borderRadius: radii.sm },
  stepActive: { backgroundColor: "#FDEEEB" },
  tipBox: { marginTop: spacing.xs, marginLeft: spacing.sm },
  questionInput: {
    marginTop: spacing.sm,
    minHeight: MIN_TOUCH_TARGET,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radii.sm,
    paddingHorizontal: spacing.md,
    backgroundColor: colors.cream,
    color: colors.brownText,
  },
  answer: { marginTop: spacing.sm, fontStyle: "italic" },
});
