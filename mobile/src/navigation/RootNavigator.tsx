import React, { useEffect, useState } from "react";
import { View, ActivityIndicator, StyleSheet } from "react-native";
import { NavigationContainer } from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { RootStackParamList } from "./types";
import { useAuthStore } from "../state/authStore";
import { OnboardingNavigator } from "./OnboardingNavigator";
import { MainTabNavigator } from "./MainTabNavigator";
import { FTUEScreen } from "../screens/ftue/FTUEScreen";
import { AccountRequiredSheet } from "../components/AccountRequiredSheet";
import { PlusRequiredSheet } from "../components/PlusRequiredSheet";
import { GrandmaAvatar } from "../components/GrandmaAvatar";
import { colors } from "../theme/theme";
import { hasSeenFTUE } from "../utils/ftueFlag";

const Stack = createNativeStackNavigator<RootStackParamList>();

function SplashScreen() {
  return (
    <View style={styles.splash}>
      <GrandmaAvatar size={100} animated />
      <ActivityIndicator color={colors.coral} style={{ marginTop: 24 }} />
    </View>
  );
}

export function RootNavigator() {
  const { isBootstrapping, user } = useAuthStore();
  const bootstrap = useAuthStore((s) => s.bootstrap);
  const [ftueSeen, setFtueSeen] = useState<boolean | null>(null);

  useEffect(() => {
    bootstrap();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (user?.onboardingCompleted) hasSeenFTUE().then(setFtueSeen);
  }, [user?.onboardingCompleted]);

  const showSplash = isBootstrapping || !user || (user.onboardingCompleted && ftueSeen === null);

  return (
    <NavigationContainer>
      {showSplash ? (
        <SplashScreen />
      ) : (
        <Stack.Navigator screenOptions={{ headerShown: false }}>
          {!user.onboardingCompleted ? (
            <Stack.Screen name="Onboarding" component={OnboardingNavigator} />
          ) : !ftueSeen ? (
            <>
              <Stack.Screen name="FTUE" component={FTUEScreen} />
              <Stack.Screen name="Main" component={MainTabNavigator} />
            </>
          ) : (
            <Stack.Screen name="Main" component={MainTabNavigator} />
          )}
        </Stack.Navigator>
      )}
      <AccountRequiredSheet />
      <PlusRequiredSheet />
    </NavigationContainer>
  );
}

const styles = StyleSheet.create({
  splash: { flex: 1, alignItems: "center", justifyContent: "center", backgroundColor: colors.cream },
});
