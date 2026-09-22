import React from "react";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { DrawerToggleButton } from "@react-navigation/drawer";
import { TasksStackParamList } from "./types";
import { TasksHomeScreen } from "../screens/tasks/TasksHomeScreen";
import { PlannerScreen } from "../screens/planner/PlannerScreen";
import { GroceryListsScreen } from "../screens/grocery/GroceryListsScreen";
import { GroceryListDetailScreen } from "../screens/grocery/GroceryListDetailScreen";
import { colors } from "../theme/theme";

const Stack = createNativeStackNavigator<TasksStackParamList>();

export function TasksNavigator() {
  return (
    <Stack.Navigator screenOptions={{ headerTintColor: colors.coralDark, headerStyle: { backgroundColor: colors.cream } }}>
      <Stack.Screen
        name="TasksHome"
        component={TasksHomeScreen}
        options={{ title: "Tasks", headerLeft: () => <DrawerToggleButton tintColor={colors.coralDark} /> }}
      />
      <Stack.Screen name="Planner" component={PlannerScreen} options={{ title: "Daily Planner" }} />
      <Stack.Screen name="GroceryLists" component={GroceryListsScreen} options={{ headerShown: false }} />
      <Stack.Screen name="GroceryListDetail" component={GroceryListDetailScreen} options={{ title: "" }} />
    </Stack.Navigator>
  );
}
