import React, { useEffect, useState } from "react";
import { View, Text, ActivityIndicator, Pressable, StyleSheet } from "react-native";
import { NavigationContainer } from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { RootStackParamList } from "./types";
import { useAuthStore } from "../state/authStore";
import { OnboardingNavigator } from "./OnboardingNavigator";
import { MainDrawerNavigator } from "./MainDrawerNavigator";
import { FTUEScreen } from "../screens/ftue/FTUEScreen";
import { AccountRequiredSheet } from "../components/AccountRequiredSheet";
import { PlusRequiredSheet } from "../components/PlusRequiredSheet";
import { GrandmaAvatar } from "../components/GrandmaAvatar";
import { colors, typography, radii, spacing } from "../theme/theme";
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

function BootstrapErrorScreen({ message, onRetry }: { message: string; onRetry: () => void }) {
  return (
    <View style={styles.splash}>
      <GrandmaAvatar size={100} mood="thinking" />
      <Text style={[typography.body, styles.errorText]}>{message}</Text>
      <Pressable style={styles.retryButton} onPress={onRetry}>
        <Text style={[typography.body, styles.retryButtonText]}>Try again</Text>
      </Pressable>
    </View>
  );
}

export function RootNavigator() {
  const { isBootstrapping, user, bootstrapError } = useAuthStore();
  const bootstrap = useAuthStore((s) => s.bootstrap);
  const [ftueSeen, setFtueSeen] = useState<boolean | null>(null);

  useEffect(() => {
    bootstrap();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (user?.onboardingCompleted) hasSeenFTUE().then(setFtueSeen);
  }, [user?.onboardingCompleted]);

  const showSplash = isBootstrapping || (!user && !bootstrapError) || (user?.onboardingCompleted && ftueSeen === null);

  return (
    <NavigationContainer>
      {bootstrapError && !user ? (
        <BootstrapErrorScreen message={bootstrapError} onRetry={bootstrap} />
      ) : showSplash ? (
        <SplashScreen />
      ) : (
        <Stack.Navigator screenOptions={{ headerShown: false }}>
          {!user!.onboardingCompleted ? (
            <Stack.Screen name="Onboarding" component={OnboardingNavigator} />
          ) : !ftueSeen ? (
            <>
              <Stack.Screen name="FTUE" component={FTUEScreen} />
              <Stack.Screen name="Main" component={MainDrawerNavigator} />
            </>
          ) : (
            <Stack.Screen name="Main" component={MainDrawerNavigator} />
          )}
        </Stack.Navigator>
      )}
      <AccountRequiredSheet />
      <PlusRequiredSheet />
    </NavigationContainer>
  );
}

const styles = StyleSheet.create({
  splash: { flex: 1, alignItems: "center", justifyContent: "center", backgroundColor: colors.cream, paddingHorizontal: spacing.xl },
  errorText: { marginTop: spacing.lg, textAlign: "center", color: colors.brownMuted },
  retryButton: { marginTop: spacing.lg, backgroundColor: colors.coral, paddingVertical: spacing.sm, paddingHorizontal: spacing.xl, borderRadius: radii.md },
  retryButtonText: { color: colors.card, fontWeight: "600" },
});
