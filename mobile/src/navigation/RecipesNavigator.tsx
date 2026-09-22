import React from "react";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { DrawerToggleButton } from "@react-navigation/drawer";
import { RecipesStackParamList } from "./types";
import { RecipesHomeScreen } from "../screens/recipes/RecipesHomeScreen";
import { RecipeCategoryScreen } from "../screens/recipes/RecipeCategoryScreen";
import { RecipeDetailScreen } from "../screens/recipes/RecipeDetailScreen";
import { FamilyCookbookScreen } from "../screens/familycookbook/FamilyCookbookScreen";
import { FamilyCookbookDetailScreen } from "../screens/familycookbook/FamilyCookbookDetailScreen";
import { FamilyCookbookAddScreen } from "../screens/familycookbook/FamilyCookbookAddScreen";
import { colors } from "../theme/theme";

const Stack = createNativeStackNavigator<RecipesStackParamList>();

export function RecipesNavigator() {
  return (
    <Stack.Navigator screenOptions={{ headerTintColor: colors.coralDark, headerStyle: { backgroundColor: colors.cream } }}>
      <Stack.Screen
        name="RecipesHome"
        component={RecipesHomeScreen}
        options={{ title: "Recipes", headerLeft: () => <DrawerToggleButton tintColor={colors.coralDark} /> }}
      />
      <Stack.Screen name="RecipeCategory" component={RecipeCategoryScreen} options={({ route }) => ({ title: route.params.category })} />
      <Stack.Screen name="RecipeDetail" component={RecipeDetailScreen} options={{ title: "" }} />
      <Stack.Screen name="FamilyCookbook" component={FamilyCookbookScreen} options={{ title: "Family Cookbook" }} />
      <Stack.Screen name="FamilyCookbookDetail" component={FamilyCookbookDetailScreen} options={{ title: "" }} />
      <Stack.Screen name="FamilyCookbookAdd" component={FamilyCookbookAddScreen} options={{ title: "Add a recipe" }} />
    </Stack.Navigator>
  );
}
