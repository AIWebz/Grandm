import React, { useEffect } from "react";
import { StatusBar } from "expo-status-bar";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { RootNavigator } from "./src/navigation/RootNavigator";
import { getMobileAdsModule } from "./src/utils/nativeAds";

export default function App() {
  useEffect(() => {
    // SDK init only - doesn't request or show any ad. Individual ad
    // components/hooks still gate on tier (Grandma+ = no ads at all).
    const Ads = getMobileAdsModule();
    Ads?.default()
      .initialize()
      .catch(() => {});
  }, []);

  return (
    <SafeAreaProvider>
      <StatusBar style="dark" />
      <RootNavigator />
    </SafeAreaProvider>
  );
}
