import React from "react";
import { View, Text, Pressable, StyleSheet } from "react-native";
import { DrawerContentScrollView, DrawerContentComponentProps } from "@react-navigation/drawer";
import { useAuthStore } from "../state/authStore";
import { useSubscriptionStatus } from "../hooks/useSubscriptionStatus";
import { GrandmaAvatar } from "../components/GrandmaAvatar";
import { colors, typography, spacing, radii, MIN_TOUCH_TARGET } from "../theme/theme";
import { MainTabParamList } from "./types";

const NAV_ITEMS: { route: keyof MainTabParamList; label: string; emoji: string }[] = [
  { route: "GrandmaTab", label: "Grandma", emoji: "💬" },
  { route: "HomeTab", label: "Home", emoji: "🏠" },
  { route: "RecipesTab", label: "Recipes", emoji: "🍲" },
  { route: "TasksTab", label: "Tasks & Planner", emoji: "✓" },
];

/**
 * ChatGPT/Claude-style sidebar: a prominent "New chat" action up top, a
 * flat nav list in place of the old bottom tab bar, and an account row
 * pinned to the bottom. Opened via the hamburger button that
 * @react-navigation/drawer adds automatically to every screen's header.
 */
export function DrawerContent(props: DrawerContentComponentProps) {
  const { navigation, state } = props;
  const activeRouteName = state.routeNames[state.index];
  const preferredName = useAuthStore((s) => s.user?.preferredName);
  const { tier } = useSubscriptionStatus();

  const startNewChat = () => {
    navigation.navigate("GrandmaTab", { resetAt: Date.now() });
    navigation.closeDrawer();
  };

  const goTo = (route: keyof MainTabParamList) => {
    navigation.navigate(route);
    navigation.closeDrawer();
  };

  return (
    <DrawerContentScrollView {...props} contentContainerStyle={styles.container}>
      <View style={styles.header}>
        <GrandmaAvatar size={32} />
        <Text style={[typography.subtitle, { marginLeft: spacing.sm }]}>Grandma AI</Text>
      </View>

      <Pressable onPress={startNewChat} style={styles.newChatButton} accessibilityRole="button" accessibilityLabel="Start a new chat">
        <Text style={styles.newChatIcon}>✎</Text>
        <Text style={styles.newChatText}>New chat</Text>
      </Pressable>

      <View style={styles.navList}>
        {NAV_ITEMS.map((item) => {
          const active = item.route === activeRouteName;
          return (
            <Pressable
              key={item.route}
              onPress={() => goTo(item.route)}
              style={[styles.navRow, active && styles.navRowActive]}
              accessibilityRole="button"
              accessibilityLabel={item.label}
              accessibilityState={{ selected: active }}
            >
              <Text style={styles.navEmoji}>{item.emoji}</Text>
              <Text style={[typography.body, styles.navLabel, active && styles.navLabelActive]}>{item.label}</Text>
            </Pressable>
          );
        })}
      </View>

      <View style={styles.spacer} />

      <Pressable
        onPress={() => goTo("ProfileTab")}
        style={[styles.footerRow, activeRouteName === "ProfileTab" && styles.navRowActive]}
        accessibilityRole="button"
        accessibilityLabel="Profile and settings"
      >
        <View style={styles.footerAvatar}>
          <Text style={{ fontSize: 16 }}>👤</Text>
        </View>
        <View style={{ marginLeft: spacing.sm, flex: 1 }}>
          <Text style={typography.body}>{preferredName ?? "Profile"}</Text>
          <Text style={typography.caption}>{tier === "PLUS" ? "Grandma+" : "Free plan"}</Text>
        </View>
      </Pressable>
    </DrawerContentScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.cream, paddingHorizontal: spacing.sm },
  header: { flexDirection: "row", alignItems: "center", paddingHorizontal: spacing.sm, paddingVertical: spacing.md },
  newChatButton: {
    flexDirection: "row",
    alignItems: "center",
    minHeight: MIN_TOUCH_TARGET,
    backgroundColor: colors.card,
    borderRadius: radii.md,
    borderWidth: 1,
    borderColor: colors.border,
    paddingHorizontal: spacing.md,
    marginBottom: spacing.md,
  },
  newChatIcon: { fontSize: 16, marginRight: spacing.sm, color: colors.coralDark },
  newChatText: { fontWeight: "700", color: colors.coralDark },
  navList: { marginTop: spacing.xs },
  navRow: {
    flexDirection: "row",
    alignItems: "center",
    minHeight: MIN_TOUCH_TARGET,
    borderRadius: radii.md,
    paddingHorizontal: spacing.md,
  },
  navRowActive: { backgroundColor: "#FDEEEB" },
  navEmoji: { fontSize: 18, width: 28 },
  navLabel: { marginLeft: spacing.xs },
  navLabelActive: { color: colors.coralDark, fontWeight: "700" },
  spacer: { flex: 1, minHeight: spacing.xl },
  footerRow: {
    flexDirection: "row",
    alignItems: "center",
    minHeight: MIN_TOUCH_TARGET + 8,
    borderRadius: radii.md,
    paddingHorizontal: spacing.md,
    borderTopWidth: 1,
    borderTopColor: colors.border,
    marginTop: spacing.sm,
    paddingTop: spacing.sm,
  },
  footerAvatar: {
    width: 32,
    height: 32,
    borderRadius: radii.pill,
    backgroundColor: colors.card,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderColor: colors.border,
  },
});
