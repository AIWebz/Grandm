import React from "react";
import { View, Text, Pressable, StyleSheet } from "react-native";
import { createDrawerNavigator } from "@react-navigation/drawer";
import { MainTabParamList } from "./types";
import { HomeScreen } from "../screens/home/HomeScreen";
import { ChatScreen } from "../screens/chat/ChatScreen";
import { RecipesNavigator } from "./RecipesNavigator";
import { TasksNavigator } from "./TasksNavigator";
import { ProfileNavigator } from "./ProfileNavigator";
import { DrawerContent } from "./DrawerContent";
import { GrandmaAvatar } from "../components/GrandmaAvatar";
import { colors, typography, spacing, MIN_TOUCH_TARGET } from "../theme/theme";

const Drawer = createDrawerNavigator<MainTabParamList>();

/** Chat's header: mascot + title in place of a plain string, matching the ChatGPT/Claude pattern of the current conversation's title up top. */
function ChatHeaderTitle() {
  return (
    <View style={styles.chatTitle}>
      <GrandmaAvatar size={26} />
      <Text style={[typography.subtitle, { marginLeft: spacing.xs }]}>Grandma</Text>
    </View>
  );
}

/** "New chat" icon button, top-right of the Chat header - the other half of the ChatGPT/Claude pattern (hamburger left, new-chat right). */
function NewChatHeaderButton({ navigation }: { navigation: any }) {
  return (
    <Pressable
      onPress={() => navigation.navigate("GrandmaTab", { resetAt: Date.now() })}
      style={styles.headerIconButton}
      accessibilityRole="button"
      accessibilityLabel="Start a new chat"
    >
      <Text style={styles.headerIconText}>✎</Text>
    </Pressable>
  );
}

/**
 * Replaces the old 5-tab bottom bar with a ChatGPT/Claude-style layout: a
 * slide-out hamburger sidebar (New chat action, flat nav list, account
 * footer - see DrawerContent.tsx) and Chat as the app's primary/default
 * screen instead of one tab among five. @react-navigation/drawer supplies
 * the hamburger button automatically on every screen's header.
 */
export function MainDrawerNavigator() {
  return (
    <Drawer.Navigator
      initialRouteName="GrandmaTab"
      drawerContent={(props) => <DrawerContent {...props} />}
      screenOptions={{
        headerTintColor: colors.coralDark,
        headerStyle: { backgroundColor: colors.cream },
        drawerType: "front",
        overlayColor: "rgba(0,0,0,0.35)",
      }}
    >
      <Drawer.Screen
        name="GrandmaTab"
        component={ChatScreen}
        options={({ navigation }) => ({
          title: "Grandma",
          headerTitle: () => <ChatHeaderTitle />,
          headerRight: () => <NewChatHeaderButton navigation={navigation} />,
        })}
      />
      <Drawer.Screen name="HomeTab" component={HomeScreen} options={{ title: "Home" }} />
      <Drawer.Screen name="RecipesTab" component={RecipesNavigator} options={{ headerShown: false, title: "Recipes" }} />
      <Drawer.Screen name="TasksTab" component={TasksNavigator} options={{ headerShown: false, title: "Tasks" }} />
      <Drawer.Screen name="ProfileTab" component={ProfileNavigator} options={{ headerShown: false, title: "Profile" }} />
    </Drawer.Navigator>
  );
}

const styles = StyleSheet.create({
  chatTitle: { flexDirection: "row", alignItems: "center" },
  headerIconButton: { width: MIN_TOUCH_TARGET, height: MIN_TOUCH_TARGET, alignItems: "center", justifyContent: "center", marginRight: spacing.xs },
  headerIconText: { fontSize: 18, color: colors.coralDark },
});
