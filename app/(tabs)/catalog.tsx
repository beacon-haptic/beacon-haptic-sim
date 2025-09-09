import React, { useState } from "react";
import { SafeAreaView, View, Text, TextInput, FlatList, Pressable, StyleSheet } from "react-native";
import * as Speech from "expo-speech";

const DATA = [
  { id: "milk", name: "明治おいしい牛乳 1L", shelf: "A-12", category: "乳製品" },
  { id: "bread", name: "食パン 6枚切り", shelf: "B-07", category: "パン" },
  { id: "coffee", name: "レギュラーコーヒー 200g", shelf: "C-03", category: "飲料" },
];

export default function Catalog() {
  const [q, setQ] = useState("");

  const filtered = DATA.filter(item => item.name.includes(q) || item.category.includes(q));

  return (
    <SafeAreaView style={{flex:1, padding:16, gap:12, backgroundColor:"#fff"}}>
      <Text style={{fontSize:20, fontWeight:"700"}}>商品カタログ（デモ）</Text>
      <TextInput
        placeholder="商品名で検索"
        value={q}
        onChangeText={setQ}
        style={{borderWidth:1, borderColor:"#e5e7eb", borderRadius:12, padding:12}}
      />
      <FlatList
        data={filtered}
        keyExtractor={(i)=>i.id}
        renderItem={({item})=>(
          <Pressable
            onPress={()=>{
              Speech.stop();
              Speech.speak(`${item.name}、棚 ${item.shelf} にご案内します。`, { language: "ja-JP" });
              alert(`目的地を設定：${item.name}\n棚: ${item.shelf}`);
            }}
            style={({pressed})=>[{opacity: pressed?0.5:1}, styles.card]}
          >
            <Text style={{fontWeight:"700"}}>{item.name}</Text>
            <Text style={{color:"#6b7280"}}>{item.category} / 棚 {item.shelf}</Text>
          </Pressable>
        )}
        ItemSeparatorComponent={()=><View style={{height:8}} />}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  card: { backgroundColor:"#f8fafc", borderWidth:1, borderColor:"#e5e7eb", borderRadius:16, padding:16 }
});
