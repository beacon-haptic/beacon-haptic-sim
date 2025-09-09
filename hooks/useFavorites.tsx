// hooks/useFavorites.ts
import AsyncStorage from "@react-native-async-storage/async-storage";
import React, {
  createContext,
  ReactNode,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";

export type Item = {
  id: string;
  name: string;
  shelf: string;      // 例: "A-12"
  category?: string;  // 任意
};

type Ctx = {
  favorites: Item[];
  isFavorite: (id: string) => boolean;
  toggleFavorite: (item: Item) => void;
  removeFavorite: (id: string) => void;
  clearFavorites: () => void;
};

const FavoritesContext = createContext<Ctx | null>(null);
const STORAGE_KEY = "fav:v1";

export function FavoritesProvider({ children }: { children: ReactNode }) {
  const [favorites, setFavorites] = useState<Item[]>([]);

  // 初回ロード
  useEffect(() => {
    (async () => {
      try {
        const raw = await AsyncStorage.getItem(STORAGE_KEY);
        if (raw) setFavorites(JSON.parse(raw));
      } catch {
        // noop
      }
    })();
  }, []);

  // 変更があれば保存
  useEffect(() => {
    AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(favorites)).catch(() => {});
  }, [favorites]);

  const isFavorite = (id: string) => favorites.some((x) => x.id === id);

  const toggleFavorite = (item: Item) => {
    setFavorites((prev) => {
      const exists = prev.some((x) => x.id === item.id);
      return exists ? prev.filter((x) => x.id !== item.id) : [item, ...prev];
    });
  };

  const removeFavorite = (id: string) =>
    setFavorites((prev) => prev.filter((x) => x.id !== id));

  const clearFavorites = () => setFavorites([]);

  const value = useMemo(
    () => ({ favorites, isFavorite, toggleFavorite, removeFavorite, clearFavorites }),
    [favorites]
  );

  return (
    <FavoritesContext.Provider value={value}>
      {children}
    </FavoritesContext.Provider>
  );
}

export function useFavorites() {
  const ctx = useContext(FavoritesContext);
  if (!ctx) {
    throw new Error("useFavorites must be used inside FavoritesProvider");
  }
  return ctx;
}
