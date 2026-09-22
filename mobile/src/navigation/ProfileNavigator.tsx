import React from "react";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { DrawerToggleButton } from "@react-navigation/drawer";
import { ProfileStackParamList } from "./types";
import { ProfileHomeScreen } from "../screens/profile/ProfileHomeScreen";
import { MemorySettingsScreen } from "../screens/profile/MemorySettingsScreen";
import { NotificationSettingsScreen } from "../screens/profile/NotificationSettingsScreen";
import { SubscriptionSettingsScreen } from "../screens/profile/SubscriptionSettingsScreen";
import { PersonalitySettingsScreen } from "../screens/profile/PersonalitySettingsScreen";
import { colors } from "../theme/theme";

const Stack = createNativeStackNavigator<ProfileStackParamList>();

export function ProfileNavigator() {
  return (
    <Stack.Navigator screenOptions={{ headerTintColor: colors.coralDark, headerStyle: { backgroundColor: colors.cream } }}>
      <Stack.Screen
        name="ProfileHome"
        component={ProfileHomeScreen}
        options={{ title: "Profile", headerLeft: () => <DrawerToggleButton tintColor={colors.coralDark} /> }}
      />
      <Stack.Screen name="MemorySettings" component={MemorySettingsScreen} options={{ title: "Memory & Personalization" }} />
      <Stack.Screen name="NotificationSettings" component={NotificationSettingsScreen} options={{ title: "Notifications" }} />
      <Stack.Screen name="SubscriptionSettings" component={SubscriptionSettingsScreen} options={{ title: "Grandma+" }} />
      <Stack.Screen name="PersonalitySettings" component={PersonalitySettingsScreen} options={{ title: "Personality" }} />
    </Stack.Navigator>
  );
}
