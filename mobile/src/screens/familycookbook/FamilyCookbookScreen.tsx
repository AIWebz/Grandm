import React from "react";
import { View, Text, StyleSheet, FlatList, Pressable, Image } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { NativeStackScreenProps } from "@react-navigation/native-stack";
import { RecipesStackParamList } from "../../navigation/types";
import { useFamilyCookbook } from "../../hooks/useFamilyCookbook";
import { EmptyState } from "../../components/EmptyState";
import { colors, typography, spacing, radii } from "../../theme/theme";
import { API_URL } from "../../api/config";

type Props = NativeStackScreenProps<RecipesStackParamList, "FamilyCookbook">;

/** Distinct, more personal visual treatment than the general Recipes tab (Section 6) - photo-forward, warmer, less "app-like". */
export function FamilyCookbookScreen({ navigation }: Props) {
  const { data, loading } = useFamilyCookbook();

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={[typography.hero, styles.title]}>Our Family Cookbook</Text>
        <Text style={[typography.body, styles.subtitle]}>Recipes worth keeping in the family, just as they were written.</Text>
      </View>

      <FlatList
        data={data?.recipes ?? []}
        keyExtractor={(r) => r.id}
        contentContainerStyle={{ padding: spacing.md }}
        ListEmptyComponent={
          !loading ? (
            <EmptyState
              message="This is where your family's recipes live - handwritten cards, old favorites, and the stories behind them."
              actionLabel="Add a recipe"
              onAction={() => navigation.navigate("FamilyCookbookAdd")}
            />
          ) : null
        }
        renderItem={({ item }) => (
          <Pressable
            onPress={() => navigation.navigate("FamilyCookbookDetail", { recipeId: item.id })}
            accessibilityRole="button"
            accessibilityLabel={item.name}
            style={styles.card}
          >
            <View style={styles.photoWrap}>
              {item.photoUrl ? (
                <Image source={{ uri: item.photoUrl.startsWith("http") ? item.photoUrl : `${API_URL}${item.photoUrl}` }} style={styles.photo} />
              ) : (
                <Text style={{ fontSize: 32 }}>📖</Text>
              )}
            </View>
            <View style={{ flex: 1, marginLeft: spacing.md }}>
              <Text style={typography.subtitle}>{item.name}</Text>
              {item.relatedPerson && <Text style={typography.caption}>{item.relatedPerson}</Text>}
              {item.needsReview && <Text style={styles.reviewBadge}>Needs a quick review</Text>}
            </View>
          </Pressable>
        )}
      />

      <Pressable
        onPress={() => navigation.navigate("FamilyCookbookAdd")}
        style={styles.fab}
        accessibilityRole="button"
        accessibilityLabel="Add a family recipe"
      >
        <Text style={styles.fabText}>+</Text>
      </Pressable>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#FBEFE4" },
  header: { padding: spacing.md, paddingTop: spacing.sm },
  title: { color: colors.coralDark },
  subtitle: { color: colors.brownMuted, marginTop: spacing.xs },
  card: {
    flexDirection: "row",
    backgroundColor: "#FFFDF9",
    borderRadius: radii.lg,
    padding: spacing.md,
    marginBottom: spacing.md,
    borderWidth: 1,
    borderColor: "#F0DFCB",
  },
  photoWrap: { width: 72, height: 72, borderRadius: radii.md, backgroundColor: colors.cream, alignItems: "center", justifyContent: "center", overflow: "hidden" },
  photo: { width: 72, height: 72 },
  reviewBadge: { color: colors.warning, marginTop: spacing.xs, fontSize: 12, fontWeight: "600" },
  fab: {
    position: "absolute",
    right: spacing.lg,
    bottom: spacing.lg,
    width: 56,
    height: 56,
    borderRadius: radii.pill,
    backgroundColor: colors.coral,
    alignItems: "center",
    justifyContent: "center",
  },
  fabText: { color: "#fff", fontSize: 28, marginTop: -2 },
});
