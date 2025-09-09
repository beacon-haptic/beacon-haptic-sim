import { Ionicons } from "@expo/vector-icons";
import React, { useMemo, useState } from "react";
import {
  FlatList,
  Pressable,
  SafeAreaView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import { Item, useFavorites } from "../../hooks/useFavorites";

// サンプル商品（UTF-8で保存）
const DATA: Item[] = [
  { id: "milk",  name: "牛乳 1L",         shelf: "A-12", category: "飲料" },
  { id: "bread", name: "食パン 6枚切り",   shelf: "B-07", category: "パン" },
  { id: "butter",name: "バター 200g",     shelf: "C-03", category: "乳製品" },
];

export default function SearchScreen() {
  const { isFavorite, toggleFavorite } = useFavorites();
  const [q, setQ] = useState("");

  const list = useMemo(() => {
    const t = q.trim();
    if (!t) return DATA;
    return DATA.filter(
      (d) =>
        d.name.includes(t) ||
        d.category?.includes(t) ||
        d.shelf.toLowerCase().includes(t.toLowerCase())
    );
  }, [q]);

  const renderItem = ({ item }: { item: Item }) => {
    const fav = isFavorite(item.id);
    return (
      <Pressable style={styles.row} onPress={() => toggleFavorite(item)}>
        <View style={styles.rowText}>
          <Text style={styles.name}>{item.name}</Text>
          <Text style={styles.meta}>
            カテゴリ: {item.category ?? "-"} / 棚: {item.shelf}
          </Text>
        </View>
        <Ionicons
          name={fav ? "heart" : "heart-outline"}
          size={24}
          color={fav ? "#e11d48" : "#9ca3af"}
        />
      </Pressable>
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      
      <TextInput
        style={styles.input}
        value={q}
        onChangeText={setQ}
        placeholder="商品名・カテゴリ・棚で検索"
      />
      <FlatList
        data={list}
        keyExtractor={(x) => x.id}
        renderItem={renderItem}
        ItemSeparatorComponent={() => <View style={styles.sep} />}
        ListEmptyComponent={
          <Text style={{ color: "#6b7280", padding: 12 }}>該当なし</Text>
        }
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 16, gap: 12, backgroundColor: "#fff" },
  title: { fontSize: 20, fontWeight: "700", marginBottom: 4 },
  input: {
    height: 44,
    paddingHorizontal: 12,
    borderRadius: 10,
    borderColor: "#e5e7eb",
    borderWidth: 1,
    backgroundColor: "#f9fafb",
  },
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
});
