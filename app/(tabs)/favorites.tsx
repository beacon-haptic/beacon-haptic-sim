import { Ionicons } from "@expo/vector-icons";
import React from "react";
import { FlatList, Pressable, SafeAreaView, StyleSheet, Text, View } from "react-native";
import { Item, useFavorites } from "../../hooks/useFavorites";

export default function FavoritesScreen() {
  const { favorites, removeFavorite, clearFavorites } = useFavorites();

  const renderItem = ({ item }: { item: Item }) => (
    <View style={styles.row}>
      <View style={styles.rowText}>
        <Text style={styles.name}>{item.name}</Text>
        <Text style={styles.meta}>
          カテゴリ: {item.category ?? "-"} / 棚: {item.shelf}
        </Text>
      </View>
      <Pressable onPress={() => removeFavorite(item.id)} hitSlop={8}>
        <Ionicons name="trash-outline" size={22} color="#ef4444" />
      </Pressable>
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      
      {favorites.length === 0 ? (
        <Text style={{ color: "#6b7280" }}>
          まだ登録がありません。{"\n"}「商品を探す」でハートを押すと追加されます。
        </Text>
      ) : (
        <>
          <Pressable style={styles.clearBtn} onPress={clearFavorites}>
            <Ionicons name="close-circle-outline" size={18} color="#374151" />
            <Text style={styles.clearLabel}>すべてクリア</Text>
          </Pressable>
          <FlatList
            data={favorites}
            keyExtractor={(x) => x.id}
            renderItem={renderItem}
            ItemSeparatorComponent={() => <View style={styles.sep} />}
          />
        </>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 16, gap: 12, backgroundColor: "#fff" },
  title: { fontSize: 20, fontWeight: "700", marginBottom: 4 },
  row: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: 12,
    paddingHorizontal: 8,
  },
  rowText: { gap: 2, flexShrink: 1, paddingRight: 12 },
  name: { fontSize: 16, fontWeight: "600" },
  meta: { color: "#6b7280" },
  sep: { height: 1, backgroundColor: "#e5e7eb" },
  clearBtn: {
    alignSelf: "flex-start",
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    paddingVertical: 6,
    paddingHorizontal: 10,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#e5e7eb",
    backgroundColor: "#f9fafb",
  },
  clearLabel: { color: "#374151", fontWeight: "600" },
});
