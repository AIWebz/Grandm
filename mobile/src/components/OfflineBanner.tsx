import React, { useEffect } from "react";
import { View, Text, StyleSheet } from "react-native";
import NetInfo from "@react-native-community/netinfo";
import { useAppStore } from "../state/appStore";
import { colors, typography, spacing } from "../theme/theme";

export function OfflineBanner() {
  const { isOnline, setOnline } = useAppStore();

  useEffect(() => {
    const unsubscribe = NetInfo.addEventListener((state) => {
      setOnline(Boolean(state.isConnected && state.isInternetReachable !== false));
    });
    return unsubscribe;
  }, [setOnline]);

  if (isOnline) return null;

  return (
    <View style={styles.banner} accessibilityRole="alert" accessibilityLabel="You're offline. Showing saved information.">
      <Text style={[typography.caption, styles.text]}>You're offline - showing what we saved last time.</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  banner: { backgroundColor: colors.warning, paddingVertical: spacing.xs, paddingHorizontal: spacing.md },
  text: { color: "#fff", textAlign: "center" },
});
