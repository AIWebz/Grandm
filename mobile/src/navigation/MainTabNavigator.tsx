import React from "react";
import { View, Text, StyleSheet } from "react-native";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { MainTabParamList } from "./types";
import { HomeScreen } from "../screens/home/HomeScreen";
import { ChatScreen } from "../screens/chat/ChatScreen";
import { RecipesNavigator } from "./RecipesNavigator";
import { TasksNavigator } from "./TasksNavigator";
import { ProfileNavigator } from "./ProfileNavigator";
import { colors, radii, shadow } from "../theme/theme";

const Tab = createBottomTabNavigator<MainTabParamList>();

const TAB_META: Record<keyof MainTabParamList, { emoji: string; label: string }> = {
  HomeTab: { emoji: "🏠", label: "Home" },
  GrandmaTab: { emoji: "💬", label: "Grandma" },
  RecipesTab: { emoji: "🍲", label: "Recipes" },
  TasksTab: { emoji: "✓", label: "Tasks" },
  ProfileTab: { emoji: "👤", label: "Profile" },
};

/** The Grandma tab is the visual anchor of the bar - larger and elevated (Section 12), since chat drives action across the whole app. */
function GrandmaTabIcon({ focused }: { focused: boolean }) {
  return (
    <View style={styles.grandmaIconWrap}>
      <Text style={styles.grandmaEmoji}>{TAB_META.GrandmaTab.emoji}</Text>
    </View>
  );
}

function TabIcon({ routeName, focused }: { routeName: keyof MainTabParamList; focused: boolean }) {
  const meta = TAB_META[routeName];
  return (
    <View style={styles.iconWrap}>
      <Text style={[styles.emoji, focused && styles.emojiFocused]}>{meta.emoji}</Text>
      <Text style={[styles.label, focused && styles.labelFocused]}>{meta.label}</Text>
    </View>
  );
}

export function MainTabNavigator() {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarShowLabel: false,
        tabBarStyle: styles.tabBar,
        tabBarIcon: ({ focused }) =>
          route.name === "GrandmaTab" ? <GrandmaTabIcon focused={focused} /> : <TabIcon routeName={route.name as keyof MainTabParamList} focused={focused} />,
        tabBarAccessibilityLabel: TAB_META[route.name as keyof MainTabParamList].label,
        tabBarItemStyle: route.name === "GrandmaTab" ? styles.grandmaTabItem : undefined,
      })}
    >
      <Tab.Screen name="HomeTab" component={HomeScreen} options={{ title: "Home" }} />
      <Tab.Screen name="RecipesTab" component={RecipesNavigator} options={{ title: "Recipes" }} />
      <Tab.Screen name="GrandmaTab" component={ChatScreen} options={{ title: "Grandma" }} />
      <Tab.Screen name="TasksTab" component={TasksNavigator} options={{ title: "Tasks" }} />
      <Tab.Screen name="ProfileTab" component={ProfileNavigator} options={{ title: "Profile" }} />
    </Tab.Navigator>
  );
}

const styles = StyleSheet.create({
  tabBar: {
    backgroundColor: colors.card,
    borderTopColor: colors.border,
    height: 74,
    paddingTop: 8,
  },
  iconWrap: { alignItems: "center", justifyContent: "center", minWidth: 44, minHeight: 44 },
  emoji: { fontSize: 20, opacity: 0.6 },
  emojiFocused: { opacity: 1 },
  label: { fontSize: 11, color: colors.brownMuted, marginTop: 2 },
  labelFocused: { color: colors.coralDark, fontWeight: "700" },
  grandmaTabItem: { top: -18 },
  grandmaIconWrap: {
    width: 60,
    height: 60,
    borderRadius: radii.pill,
    backgroundColor: colors.coral,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 4,
    borderColor: colors.cream,
    ...shadow,
  },
  grandmaEmoji: { fontSize: 26 },
});
