import React from "react";
import { View, Text, StyleSheet } from "react-native";
import { Card } from "./Card";
import { colors, typography, spacing } from "../theme/theme";
import { ToolInvocation } from "../api/chatStream";

/**
 * Renders the real app action a tool call produced as an inline card
 * (Section 4) - never leaves the action invisible in plain chat text.
 */
export function ToolInvocationCard({ invocation }: { invocation: ToolInvocation }) {
  if (!invocation.card) return null;
  const { type, data } = invocation.card;

  if (type === "task") {
    const tasks = data.tasks ?? [data];
    return (
      <Card style={styles.card}>
        <Text style={typography.subtitle}>{data.theme ? `📝 ${data.theme}` : "📝 Task added"}</Text>
        {tasks.map((t: any) => (
          <Text key={t.id} style={[typography.body, styles.line]}>
            • {t.title}
          </Text>
        ))}
      </Card>
    );
  }

  if (type === "reminder") {
    return (
      <Card style={styles.card}>
        <Text style={typography.subtitle}>⏰ Reminder set</Text>
        <Text style={[typography.body, styles.line]}>{data.title}</Text>
        <Text style={typography.caption}>{new Date(data.remindAt).toLocaleString()}</Text>
      </Card>
    );
  }

  if (type === "grocery_list") {
    return (
      <Card style={styles.card}>
        <Text style={typography.subtitle}>🛒 {data.title}</Text>
        {data.items?.slice(0, 6).map((item: any) => (
          <Text key={item.id} style={[typography.body, styles.line]}>
            ☐ {item.name} {item.quantity ? `(${item.quantity})` : ""}
          </Text>
        ))}
        {data.items?.length > 6 && <Text style={typography.caption}>+{data.items.length - 6} more</Text>}
      </Card>
    );
  }

  if (type === "recipe") {
    return (
      <Card style={styles.card}>
        <Text style={typography.subtitle}>🍲 {data.name}</Text>
        <Text style={typography.caption}>
          Serves {data.servings} · {data.prepMinutes + data.cookMinutes} min · {data.difficulty}
        </Text>
      </Card>
    );
  }

  if (type === "schedule") {
    return (
      <Card style={styles.card}>
        <Text style={typography.subtitle}>📅 Schedule updated</Text>
        <Text style={[typography.body, styles.line]}>{data.title ?? "Plan updated"}</Text>
      </Card>
    );
  }

  return null;
}

const styles = StyleSheet.create({
  card: { marginTop: spacing.sm, backgroundColor: "#FDEEEB" },
  line: { marginTop: 2, color: colors.brownText },
});
