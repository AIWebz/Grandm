import React from "react";
import { View, Text, StyleSheet, ScrollView, Pressable, Alert } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { NativeStackScreenProps } from "@react-navigation/native-stack";
import { ProfileStackParamList } from "../../navigation/types";
import { useAuthStore } from "../../state/authStore";
import { useSubscriptionStatus } from "../../hooks/useSubscriptionStatus";
import { GrandmaAvatar } from "../../components/GrandmaAvatar";
import { Card } from "../../components/Card";
import { PrimaryButton } from "../../components/PrimaryButton";
import { api } from "../../api/client";
import { colors, typography, spacing, radii, MIN_TOUCH_TARGET } from "../../theme/theme";

type Props = NativeStackScreenProps<ProfileStackParamList, "ProfileHome">;

export function ProfileHomeScreen({ navigation }: Props) {
  const { user, logout } = useAuthStore();
  const { tier } = useSubscriptionStatus();

  const rows: { label: string; onPress: () => void }[] = [
    { label: "Personality", onPress: () => navigation.navigate("PersonalitySettings") },
    { label: "Memory & Personalization", onPress: () => navigation.navigate("MemorySettings") },
    { label: "Notifications", onPress: () => navigation.navigate("NotificationSettings") },
    { label: tier === "PLUS" ? "Grandma+ (active)" : "Upgrade to Grandma+", onPress: () => navigation.navigate("SubscriptionSettings") },
  ];

  const exportData = async () => {
    Alert.alert("Export requested", "Your data export is being prepared - in production this downloads a JSON file with everything Grandma AI has stored for you.");
    try {
      await api.get("/users/me/export");
    } catch {
      // Export endpoint exists server-side; a native file-save flow would consume the response here.
    }
  };

  const deleteAccount = () => {
    Alert.alert("Delete account?", "This permanently deletes everything - tasks, recipes, the Family Cookbook, all of it. This can't be undone.", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Delete everything",
        style: "destructive",
        onPress: async () => {
          await api.delete("/users/me");
          await logout();
        },
      },
    ]);
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={{ padding: spacing.md }}>
        <View style={styles.header}>
          <GrandmaAvatar size={56} />
          <View style={{ marginLeft: spacing.md }}>
            <Text style={typography.title}>{user?.preferredName ?? "Friend"}</Text>
            <Text style={typography.caption}>{user?.isGuest ? "Guest - not saved to an account yet" : user?.email}</Text>
          </View>
        </View>

        {user?.isGuest && (
          <Card style={styles.guestCard}>
            <Text style={typography.body}>You're using Grandma AI as a guest. Create a free account so nothing gets lost.</Text>
          </Card>
        )}

        <Card style={{ marginTop: spacing.md, padding: 0 }}>
          {rows.map((row, i) => (
            <Pressable key={row.label} onPress={row.onPress} style={[styles.row, i > 0 && styles.rowBorder]} accessibilityRole="button" accessibilityLabel={row.label}>
              <Text style={typography.body}>{row.label}</Text>
              <Text style={{ color: colors.brownMuted }}>›</Text>
            </Pressable>
          ))}
        </Card>

        <Card style={{ marginTop: spacing.md, padding: 0 }}>
          <Pressable onPress={exportData} style={styles.row} accessibilityRole="button" accessibilityLabel="Export my data">
            <Text style={typography.body}>Export my data</Text>
          </Pressable>
          <Pressable onPress={deleteAccount} style={[styles.row, styles.rowBorder]} accessibilityRole="button" accessibilityLabel="Delete my account">
            <Text style={[typography.body, { color: colors.danger }]}>Delete my account</Text>
          </Pressable>
        </Card>

        <PrimaryButton label="Log out" variant="ghost" onPress={logout} style={{ marginTop: spacing.lg }} />

        <Text style={styles.footerNote}>
          Grandma AI is here to help with everyday life - it isn't a doctor, therapist, lawyer, or financial advisor, and it's not a
          replacement for the people in your life.
        </Text>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.cream },
  header: { flexDirection: "row", alignItems: "center" },
  guestCard: { marginTop: spacing.md, backgroundColor: "#FFF3D6" },
  row: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", minHeight: MIN_TOUCH_TARGET, paddingHorizontal: spacing.md },
  rowBorder: { borderTopWidth: 1, borderTopColor: colors.border },
  footerNote: { color: colors.brownMuted, fontSize: 12, marginTop: spacing.xl, textAlign: "center" },
});
