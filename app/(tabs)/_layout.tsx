// app/(tabs)/_layout.tsx
import { Ionicons } from "@expo/vector-icons";
import { Tabs } from "expo-router";
import { Platform } from "react-native";
import { FavoritesProvider } from "../../hooks/useFavorites"; // お気に入りの共有コンテキスト

const ACTIVE = "#166534";   // アクティブ時のタブ色（緑）
const INACTIVE = "#9CA3AF"; // 非アクティブ時のタブ色（グレー）

export default function TabLayout() {
  return (
    <FavoritesProvider>
      <Tabs
        screenOptions={{
          headerTitleAlign: "left",
          headerTitleStyle: { fontSize: 32, fontWeight: "800" }, // ← ヘッダーの文字を大きく
          headerStyle: { backgroundColor: "#ffffff" },
          headerShadowVisible: true,
          headerTintColor: "#111827",
          tabBarActiveTintColor: ACTIVE,
          tabBarInactiveTintColor: INACTIVE,
          tabBarStyle: {
            backgroundColor: "#ffffff",
            borderTopColor: "#E5E7EB",
            height: Platform.OS === "ios" ? 84 : 64,
            paddingTop: 6,
          },
          tabBarLabelStyle: { fontSize: 12, paddingBottom: 6 },
        }}
      >
        <Tabs.Screen
          name="index"
          options={{
            title: "ホーム",
            tabBarIcon: ({ color, size }) => (
              <Ionicons name="home-outline" size={size} color={color} />
            ),
          }}
        />
        <Tabs.Screen
          name="search"
          options={{
            title: "商品を探す",
            tabBarIcon: ({ color, size }) => (
              <Ionicons name="search-outline" size={size} color={color} />
            ),
          }}
        />
        <Tabs.Screen
          name="favorites"
          options={{
            title: "お気に入り",
            tabBarIcon: ({ color, size }) => (
              <Ionicons name="heart-outline" size={size} color={color} />
            ),
          }}
        />
        <Tabs.Screen
          name="settings"
          options={{
            title: "設定",
            tabBarIcon: ({ color, size }) => (
              <Ionicons name="settings-outline" size={size} color={color} />
            ),
          }}
        />
      </Tabs>
    </FavoritesProvider>
  );
}
