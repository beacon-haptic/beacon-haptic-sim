// app/(tabs)/index.tsx
import Slider from "@react-native-community/slider";
import * as Haptics from "expo-haptics";
import * as Speech from "expo-speech";
import React, { useEffect, useMemo, useRef, useState } from "react";
import { Button, SafeAreaView, StyleSheet, Text, View } from "react-native";

// ===== 調整しやすい定数（速さ・強さ・しきい値） =====
const FAR_INTERVAL = 1200; // 遠：何ミリ秒ごとに1回鳴らすか
const MID_INTERVAL = 600;  // 中
const NEAR_INTERVAL = 500; // 近
const NEAR_TAP_GAP = 150;  // 近の三連打の間隔

const STOP_GT_M = 5.0;   // 5mより遠い→停止
const FAR_MIN_M = 3.0;   // 3〜5m → 遠
const MID_MIN_M = 1.5;   // 1.5〜3m → 中
// 1.5m未満 → 近（到着直前）

type Band = "STOP" | "FAR" | "MID" | "NEAR";

// ★★★ Expo/RN では setInterval の戻り値は number ★★★
type IntervalId = ReturnType<typeof setInterval>;

export default function Home() {
  const [distance, setDistance] = useState(6.0); // 0〜10m想定
  const [band, setBand] = useState<Band>("STOP");
  const timerRef = useRef<IntervalId | null>(null);
  const nearSinceRef = useRef<number | null>(null);
  const [arrived, setArrived] = useState(false);

  // 距離→帯の判定
  const currentBand: Band = useMemo(() => {
    if (distance > STOP_GT_M) return "STOP";
    if (distance >= FAR_MIN_M) return "FAR";
    if (distance >= MID_MIN_M) return "MID";
    return "NEAR";
  }, [distance]);

  // 「近」になって1.5秒経過したら到着アナウンス
  useEffect(() => {
    const tick = setInterval(() => {
      const now = Date.now();
      if (currentBand === "NEAR") {
        if (nearSinceRef.current == null) nearSinceRef.current = now;
      } else {
        nearSinceRef.current = null;
        setArrived(false);
      }
      if (
        nearSinceRef.current != null &&
        now - nearSinceRef.current >= 1500 &&
        !arrived
      ) {
        setArrived(true);
        Speech.stop();
        Speech.speak("目的の棚に到着しました。ICタグをかざしてください。", {
          language: "ja-JP",
        });
      }
    }, 200);
    return () => clearInterval(tick);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentBand, arrived]);

  // 帯が変わったら切替＆ワンショット
  useEffect(() => {
    if (band !== currentBand) {
      setBand(currentBand);
      startPattern(currentBand, true);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentBand]);

  useEffect(() => () => stopPattern(), []);

  const stopPattern = () => {
    if (timerRef.current != null) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
  };

  const startPattern = (b: Band, burstNow: boolean) => {
    stopPattern();
    if (b === "STOP") return;

    // 帯変更の合図（中〜強）
    if (burstNow) Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);

    if (b === "FAR") {
      timerRef.current = setInterval(() => {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
      }, FAR_INTERVAL);
    } else if (b === "MID") {
      timerRef.current = setInterval(() => {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
        setTimeout(
          () => Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Rigid),
          120
        );
      }, MID_INTERVAL);
    } else if (b === "NEAR") {
      timerRef.current = setInterval(async () => {
        await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Rigid);
        setTimeout(
          () => Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Rigid),
          NEAR_TAP_GAP
        );
        setTimeout(
          () => Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Rigid),
          NEAR_TAP_GAP * 2
        );
      }, NEAR_INTERVAL);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <Text style={styles.title}>店内案内（シミュレーション）</Text>

      <View style={styles.card}>
        <Text style={styles.label}>
          距離: {distance.toFixed(2)} m（スライダーで調整）
        </Text>
        <Slider
          style={{ width: "100%", height: 40 }}
          minimumValue={0}
          maximumValue={10}
          step={0.01}
          value={distance}
          onValueChange={setDistance}
          minimumTrackTintColor="#3b82f6"
          maximumTrackTintColor="#ddd"
        />
        <View style={{ flexDirection: "row", gap: 12, marginTop: 8 }}>
          <Button title="ウォーク再生" onPress={() => startPattern(currentBand, true)} />
          <Button title="停止" onPress={stopPattern} />
        </View>
      </View>

      <View style={styles.card}>
        <Row label="現在の帯" value={bandLabel(band)} />
        <View style={styles.hr} />
        <Text style={styles.notes}>
          しきい値：{"\n"}
          ・停止: &gt; {STOP_GT_M} m{"\n"}
          ・遠: {FAR_MIN_M}–{STOP_GT_M} m（{FAR_INTERVAL}ms周期）{"\n"}
          ・中: {MID_MIN_M}–{FAR_MIN_M} m（{MID_INTERVAL}ms周期・二重発火）{"\n"}
          ・近: ≤ {MID_MIN_M} m（{NEAR_INTERVAL}ms周期・三連打 gap {NEAR_TAP_GAP}ms）
        </Text>
      </View>
    </SafeAreaView>
  );
}

const bandLabel = (b: Band) =>
  b === "STOP"
    ? "停止"
    : b === "FAR"
    ? "ゆっくり（遠）"
    : b === "MID"
    ? "速め（中）"
    : "到着直前（連打・強）";

function Row({ label, value }: { label: string; value: string }) {
  return (
    <View style={styles.row}>
      <Text style={styles.rowLabel}>{label}</Text>
      <Text style={styles.rowValue}>{value}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, gap: 16, padding: 16, backgroundColor: "#fff" },
  title: { fontSize: 20, fontWeight: "700" },
  card: {
    width: "100%",
    borderRadius: 16,
    padding: 16,
    backgroundColor: "#f8fafc",
    borderColor: "#e5e7eb",
    borderWidth: 1,
    gap: 8,
  },
  label: { fontSize: 16, fontWeight: "600" },
  row: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  rowLabel: { color: "#6b7280" },
  rowValue: { fontWeight: "700" },
  hr: { height: 1, backgroundColor: "#e5e7eb", marginVertical: 8 },
  notes: { color: "#374151", lineHeight: 20 },
});
