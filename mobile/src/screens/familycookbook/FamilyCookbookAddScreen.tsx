import React, { useState } from "react";
import { View, Text, TextInput, StyleSheet, ScrollView, ActivityIndicator, Alert } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import * as ImagePicker from "expo-image-picker";
import { NativeStackScreenProps } from "@react-navigation/native-stack";
import { RecipesStackParamList } from "../../navigation/types";
import { useAddFamilyCookbookRecipe } from "../../hooks/useFamilyCookbook";
import { PrimaryButton } from "../../components/PrimaryButton";
import { Card } from "../../components/Card";
import { colors, typography, spacing, radii } from "../../theme/theme";

type Props = NativeStackScreenProps<RecipesStackParamList, "FamilyCookbookAdd">;

export function FamilyCookbookAddScreen({ navigation }: Props) {
  const { addManual, digitize, saving } = useAddFamilyCookbookRecipe();
  const [mode, setMode] = useState<"choose" | "manual">("choose");
  const [name, setName] = useState("");
  const [relatedPerson, setRelatedPerson] = useState("");
  const [memoryStory, setMemoryStory] = useState("");
  const [ingredientsText, setIngredientsText] = useState("");
  const [stepsText, setStepsText] = useState("");
  const [error, setError] = useState<string | null>(null);

  const pickAndDigitize = async () => {
    const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!permission.granted) {
      Alert.alert("Photo access needed", "Grandma AI needs photo access to digitize a handwritten recipe.");
      return;
    }
    const result = await ImagePicker.launchImageLibraryAsync({ mediaTypes: ImagePicker.MediaTypeOptions.Images, quality: 0.8 });
    if (result.canceled || !result.assets[0]) return;

    setError(null);
    const asset = result.assets[0];
    try {
      const res = await digitize(asset.uri, asset.mimeType ?? "image/jpeg");
      if (res) navigation.replace("FamilyCookbookDetail", { recipeId: res.recipe.id });
      // res === null means the account-required sheet was shown instead - nothing else to do here.
    } catch {
      setError("I couldn't quite make that out - try a clearer photo, or type it in by hand?");
    }
  };

  const submitManual = async () => {
    if (!name.trim()) {
      setError("Give this recipe a name first.");
      return;
    }
    setError(null);
    try {
      const recipe = await addManual({
        name,
        relatedPerson: relatedPerson || undefined,
        memoryStory: memoryStory || undefined,
        ingredients: ingredientsText.split("\n").map((s) => s.trim()).filter(Boolean),
        steps: stepsText.split("\n").map((s) => s.trim()).filter(Boolean),
      });
      if (recipe) navigation.replace("FamilyCookbookDetail", { recipeId: recipe.recipe.id });
    } catch {
      setError("Something went wrong saving that - try again?");
    }
  };

  if (mode === "choose") {
    return (
      <SafeAreaView style={styles.container}>
        <Text style={[typography.title, styles.headline]}>Add a family recipe</Text>
        <Card style={styles.choiceCard}>
          <Text style={typography.subtitle}>📷 Photo of a handwritten card</Text>
          <Text style={typography.caption}>Grandma will read it and turn it into a recipe you can follow - keeping the original photo too.</Text>
          <PrimaryButton label={saving ? "Reading..." : "Choose photo"} onPress={pickAndDigitize} loading={saving} style={{ marginTop: spacing.sm }} />
        </Card>
        <Card style={styles.choiceCard}>
          <Text style={typography.subtitle}>✍️ Type it in myself</Text>
          <Text style={typography.caption}>Add the name, ingredients, and story by hand.</Text>
          <PrimaryButton label="Type it in" variant="secondary" onPress={() => setMode("manual")} style={{ marginTop: spacing.sm }} />
        </Card>
        {error && <Text style={styles.error}>{error}</Text>}
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={{ padding: spacing.md }}>
        <Text style={typography.title}>Add a family recipe</Text>
        <TextInput style={styles.input} placeholder="Recipe name" placeholderTextColor={colors.brownMuted} value={name} onChangeText={setName} accessibilityLabel="Recipe name" />
        <TextInput
          style={styles.input}
          placeholder="Whose recipe is this? (e.g. Grandma Mary)"
          placeholderTextColor={colors.brownMuted}
          value={relatedPerson}
          onChangeText={setRelatedPerson}
          accessibilityLabel="Related family member"
        />
        <TextInput
          style={[styles.input, styles.multiline]}
          placeholder="The story behind it..."
          placeholderTextColor={colors.brownMuted}
          value={memoryStory}
          onChangeText={setMemoryStory}
          multiline
          accessibilityLabel="Memory or story"
        />
        <TextInput
          style={[styles.input, styles.multiline]}
          placeholder={"Ingredients, one per line"}
          placeholderTextColor={colors.brownMuted}
          value={ingredientsText}
          onChangeText={setIngredientsText}
          multiline
          accessibilityLabel="Ingredients, one per line"
        />
        <TextInput
          style={[styles.input, styles.multiline]}
          placeholder={"Steps, one per line"}
          placeholderTextColor={colors.brownMuted}
          value={stepsText}
          onChangeText={setStepsText}
          multiline
          accessibilityLabel="Steps, one per line"
        />
        {error && <Text style={styles.error}>{error}</Text>}
        <PrimaryButton label="Save recipe" onPress={submitManual} loading={saving} style={{ marginTop: spacing.md }} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#FBEFE4" },
  headline: { padding: spacing.md, color: colors.coralDark },
  choiceCard: { margin: spacing.md, marginTop: 0 },
  input: {
    minHeight: 48,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radii.sm,
    paddingHorizontal: spacing.md,
    marginBottom: spacing.sm,
    backgroundColor: "#FFFDF9",
    color: colors.brownText,
  },
  multiline: { minHeight: 90, textAlignVertical: "top", paddingTop: spacing.sm },
  error: { color: colors.danger, marginHorizontal: spacing.md },
});
