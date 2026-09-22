import React from "react";
import { View, Text, StyleSheet, ScrollView, Pressable, ActivityIndicator } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useNavigation } from "@react-navigation/native";
import { BottomTabNavigationProp } from "@react-navigation/bottom-tabs";
import { useHome } from "../../hooks/useHome";
import { useTasks } from "../../hooks/useTasks";
import { useAuthStore } from "../../state/authStore";
import { GrandmaAvatar } from "../../components/GrandmaAvatar";
import { Card } from "../../components/Card";
import { ProgressRing } from "../../components/ProgressRing";
import { EmptyState } from "../../components/EmptyState";
import { OfflineBanner } from "../../components/OfflineBanner";
import { PrimaryButton } from "../../components/PrimaryButton";
import { colors, typography, spacing, radii, MIN_TOUCH_TARGET } from "../../theme/theme";
import { MainTabParamList } from "../../navigation/types";

function timeOfDayGreeting(): string {
  const hour = new Date().getHours();
  if (hour < 12) return "Good morning";
  if (hour < 18) return "Good afternoon";
  return "Good evening";
}

export function HomeScreen() {
  const navigation = useNavigation<BottomTabNavigationProp<MainTabParamList>>();
  const { data, loading, error, isOffline, refresh } = useHome();
  const { toggleComplete } = useTasks({ date: new Date().toISOString().slice(0, 10) });
  const preferredName = useAuthStore((s) => s.user?.preferredName);

  return (
    <SafeAreaView style={styles.container}>
      <OfflineBanner />
      <ScrollView contentContainerStyle={styles.content} refreshControl={undefined}>
        <View style={styles.header}>
          <GrandmaAvatar size={48} animated />
          <View style={{ marginLeft: spacing.sm, flex: 1 }}>
            <Text style={typography.hero} accessibilityRole="header">
              {timeOfDayGreeting()}, {preferredName ?? data?.preferredName ?? "there"} ❤️
            </Text>
          </View>
        </View>

        <Card style={styles.greetingCard}>
          {loading && !data ? (
            <ActivityIndicator color={colors.coral} />
          ) : (
            <Text style={[typography.body, styles.greetingText]}>{data?.greeting ?? "..."}</Text>
          )}
        </Card>

        {error && !data && <Text style={styles.errorText}>{error}</Text>}

        {data && data.tasks.length === 0 ? (
          <EmptyState
            message="Nothing on the list yet - want help planning your day?"
            actionLabel="Plan my day"
            onAction={() => navigation.navigate("GrandmaTab", { prefilledIntent: "Can you help me plan my day?" })}
          />
        ) : (
          <Card style={{ marginTop: spacing.md }}>
            <View style={styles.taskCardHeader}>
              <Text style={typography.subtitle}>Today's Tasks</Text>
              {data && <ProgressRing completed={data.progress.completed} total={data.progress.total} size={48} />}
            </View>
            {data && (
              <Text style={[typography.caption, { marginBottom: spacing.sm }]}>
                {data.progress.completed} of {data.progress.total} tasks completed
              </Text>
            )}
            {data?.tasks.map((task) => (
              <Pressable
                key={task.id}
                onPress={() => toggleComplete(task as any).then(refresh)}
                style={styles.taskRow}
                accessibilityRole="checkbox"
                accessibilityState={{ checked: task.completed }}
                accessibilityLabel={task.title}
              >
                <View style={[styles.checkbox, task.completed && styles.checkboxChecked]}>
                  {task.completed && <Text style={styles.checkmark}>✓</Text>}
                </View>
                <Text style={[typography.body, task.completed && styles.taskDone]}>{task.title}</Text>
              </Pressable>
            ))}
            <PrimaryButton
              label="Ask Grandma to reorganize"
              variant="ghost"
              onPress={() => navigation.navigate("GrandmaTab", { prefilledIntent: "Can you help me reorganize today's tasks?" })}
              style={{ marginTop: spacing.sm, alignSelf: "flex-start" }}
            />
          </Card>
        )}

        {isOffline && <Text style={styles.offlineNote}>Showing what we saved last time.</Text>}
      </ScrollView>

      <Pressable
        onPress={() => navigation.navigate("GrandmaTab", undefined)}
        style={styles.fab}
        accessibilityRole="button"
        accessibilityLabel="Talk to Grandma"
      >
        <Text style={styles.fabEmoji}>💬</Text>
      </Pressable>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.cream },
  content: { padding: spacing.md, paddingBottom: spacing.xxl },
  header: { flexDirection: "row", alignItems: "center", marginBottom: spacing.md },
  greetingCard: { backgroundColor: "#FDEEEB" },
  greetingText: { fontStyle: "italic" },
  errorText: { color: colors.danger, marginTop: spacing.sm },
  taskCardHeader: { flexDirection: "row", justifyContent: "space-between", alignItems: "center" },
  taskRow: { flexDirection: "row", alignItems: "center", minHeight: MIN_TOUCH_TARGET, paddingVertical: spacing.xs },
  checkbox: {
    width: 26,
    height: 26,
    borderRadius: 8,
    borderWidth: 2,
    borderColor: colors.coral,
    marginRight: spacing.sm,
    alignItems: "center",
    justifyContent: "center",
  },
  checkboxChecked: { backgroundColor: colors.coral },
  checkmark: { color: "#fff", fontWeight: "700" },
  taskDone: { textDecorationLine: "line-through", color: colors.brownMuted },
  offlineNote: { textAlign: "center", color: colors.brownMuted, marginTop: spacing.md },
  fab: {
    position: "absolute",
    right: spacing.lg,
    bottom: spacing.lg,
    width: 60,
    height: 60,
    borderRadius: radii.pill,
    backgroundColor: colors.coral,
    alignItems: "center",
    justifyContent: "center",
    ...{ shadowColor: colors.shadow, shadowOpacity: 1, shadowRadius: 10, shadowOffset: { width: 0, height: 4 }, elevation: 5 },
  },
  fabEmoji: { fontSize: 28 },
});
