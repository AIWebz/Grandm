import React from "react";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { OnboardingStackParamList } from "./types";
import { WelcomeScreen } from "../screens/onboarding/WelcomeScreen";
import { NameScreen } from "../screens/onboarding/NameScreen";
import { InterestsScreen } from "../screens/onboarding/InterestsScreen";
import { PersonalityScreen } from "../screens/onboarding/PersonalityScreen";

const Stack = createNativeStackNavigator<OnboardingStackParamList>();

export function OnboardingNavigator() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="Welcome" component={WelcomeScreen} />
      <Stack.Screen name="Name" component={NameScreen} />
      <Stack.Screen name="Interests" component={InterestsScreen} />
      <Stack.Screen name="Personality" component={PersonalityScreen} />
    </Stack.Navigator>
  );
}
