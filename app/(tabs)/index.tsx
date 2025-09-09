import React, { useEffect, useMemo, useRef, useState } from "react";
import { SafeAreaView, View, Text, Button, StyleSheet, Modal, Pressable } from "react-native";
import * as Haptics from "expo-haptics";
import * as Speech from "expo-speech";
import Slider from "@react-native-community/slider";

// ===== デザイン/動作パラメータ（初期値） =====
let STOP_GT_M = 5.0;
let FAR_MIN_M = 3.0;
let MID_MIN_M = 1.5;

let FAR_INTERVAL  = 1200;
let MID_INTERVAL  = 600;
let NEAR_INTERVAL = 500;
let NEAR_TAP_GAP  = 150;

type Band = "STOP" | "FAR" | "MID" | "NEAR";
const bands: Record<Band, { label: string }> = {
  STOP: { label: "停止" },
  FAR:  { label: "ゆっくり（遠）" },
  MID:  { label: "速め（中）" },
  NEAR: { label: "到着直前（連打・強）" },
};

export default function Home() {
  const [distance, setDistance] = useState(6.0);
  const [band, setBand] = useState<Band>("STOP");
  const [arrived, setArrived] = useState(false);
  const [showTagModal, setShowTagModal] = useState(false);
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const nearSinceRef = useRef<number | null>(null);
  const walkTimerRef = useRef<NodeJS.Timeout | null>(null);

  // 他画面で保存された設定値を反映（簡易：グローバルwindowから拾う）
  useEffect(() => {
    const g: any = globalThis as any;
    if (g.__beaconThresholds) {
      STOP_GT_M = g.__beaconThresholds.stop;
      FAR_MIN_M = g.__beaconThresholds.far;
      MID_MIN_M = g.__beaconThresholds.mid;
      FAR_INTERVAL  = g.__beaconThresholds.farInt;
      MID_INTERVAL  = g.__beaconThresholds.midInt;
      NEAR_INTERVAL = g.__beaconThresholds.nearInt;
      NEAR_TAP_GAP  = g.__beaconThresholds.nearGap;
    }
  });

  const currentBand: Band = useMemo(() => {
    if (distance > STOP_GT_M) return "STOP";
    if (distance >= FAR_MIN_M) return "FAR";
    if (distance >= MID_MIN_M) return "MID";
    return "NEAR";
  }, [distance]);

  useEffect(() => {
    if (band !== currentBand) {
      setBand(currentBand);
      setArrived(false);
      nearSinceRef.current = null;
      Speech.stop();
      if (currentBand !== "STOP") {
        Speech.speak(bands[currentBand].label, { language: "ja-JP" });
      }
      startPattern(currentBand, true);
    }
  }, [currentBand]);

  useEffect(() => () => stopPattern(), []);

  // 到着判定（NEARが1.5秒継続）
  useEffect(() => {
    if (band !== "NEAR") { nearSinceRef.current = null; return; }
    const now = Date.now();
    if (!nearSinceRef.current) nearSinceRef.current = now;
    const tick = setInterval(() => {
      if (nearSinceRef.current && Date.now() - nearSinceRef.current >= 1500 && !arrived) {
        setArrived(true);
        Speech.stop();
        Speech.speak("目的の棚に到着しました。ICタグをかざしてください。", { language: "ja-JP" });
      }
    }, 200);
    return () => clearInterval(tick);
  }, [band, arrived]);

  const stopPattern = () => {
    if (timerRef.current) { clearInterval(timerRef.current); timerRef.current = null; }
  };

  const startPattern = (b: Band, burstNow: boolean) => {
    stopPattern();
    if (b === "STOP") return;
    if (burstNow) Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);

    if (b === "FAR") {
      timerRef.current = setInterval(() => {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
      }, FAR_INTERVAL);
    } else if (b === "MID") {
      timerRef.current = setInterval(() => {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
        setTimeout(() => Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Rigid), 120);
      }, MID_INTERVAL);
    } else if (b === "NEAR") {
      timerRef.current = setInterval(async () => {
        await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Rigid);
        setTimeout(() => Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Rigid), NEAR_TAP_GAP);
        setTimeout(() => Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Rigid), NEAR_TAP_GAP * 2);
      }, NEAR_INTERVAL);
    }
  };

  // ウォークシミュレータ：遠→近→到着→遠 を自動再生
  const startWalk = () => {
    stopWalk();
    setArrived(false);
    Speech.stop();
    let d = 6.5;
    setDistance(d);
    walkTimerRef.current = setInterval(() => {
      d -= 0.25; // 歩くスピード
      if (d <= 0.8) {
        // 到着して少し待ってから離れる
        setDistance(0.8);
        setTimeout(() => {
          let back = 0.8;
          const t = setInterval(() => {
            back += 0.35;
            setDistance(back);
            if (back >= 6.5) { clearInterval(t); stopWalk(); }
          }, 300);
        }, 1500);
      } else {
        setDistance(d);
      }
    }, 300);
  };
  const stopWalk = () => {
    if (walkTimerRef.current) { clearInterval(walkTimerRef.current); walkTimerRef.current = null; }
  };

  return (
    <SafeAreaView style={styles.container}>
      <Text style={styles.title}>店内案内（シミュレーション）</Text>

      <View style={styles.card}>
        <Text style={styles.label}>距離: {distance.toFixed(2)} m（スライダーで調整）</Text>
        <Slider
          style={{ width: "100%", height: 40 }}
          minimumValue={0}
          maximumValue={10}
          step={0.01}
          value={distance}
          onValueChange={(v)=>{ setDistance(v); setArrived(false); }}
          minimumTrackTintColor="#3b82f6"
          maximumTrackTintColor="#ddd"
        />
        <View style={styles.rowButtons}>
          <Button title="ウォーク再生" onPress={startWalk} />
          <Button title="停止" onPress={()=>{ stopPattern(); stopWalk(); }} />
        </View>
      </View>

      <View style={styles.card}>
        <Row label="現在の帯" value={bands[band].label} />
        <Row label="到着判定" value={arrived ? "到着！" : "—"} />
        <View style={styles.hr} />
        <Text style={styles.notes}>
          ・停止: &gt; {STOP_GT_M} m{"\n"}
          ・遠: {FAR_MIN_M}–{STOP_GT_M} m（{FAR_INTERVAL}ms）{"\n"}
          ・中: {MID_MIN_M}–{FAR_MIN_M} m（{MID_INTERVAL}ms・二重発火）{"\n"}
          ・近: ≤ {MID_MIN_M} m（{NEAR_INTERVAL}ms・三連打 gap {NEAR_TAP_GAP}ms）
        </Text>
      </View>

      <View style={styles.card}>
        <Text style={styles.label}>ICタグ（模擬）</Text>
        <Button
          title="ICタグをかざす（模擬）"
          onPress={() => { setShowTagModal(true); Speech.speak("牛乳コーナーです。商品情報を表示します。", { language: "ja-JP" }); }}
        />
      </View>

      <Modal visible={showTagModal} transparent animationType="fade" onRequestClose={()=>setShowTagModal(false)}>
        <View style={styles.modalWrap}>
          <View style={styles.modal}>
            <Text style={{fontSize:18, fontWeight:"700", marginBottom:8}}>商品情報（模擬）</Text>
            <Text>カテゴリ：乳製品{"\n"}棚：A-12{"\n"}商品：明治おいしい牛乳 1L{"\n"}価格：¥228</Text>
            <Pressable style={styles.modalBtn} onPress={()=>setShowTagModal(false)}>
              <Text style={{color:"#fff", fontWeight:"700"}}>閉じる</Text>
            </Pressable>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

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
    width: "100%", borderRadius: 16, padding: 16,
    backgroundColor: "#f8fafc", borderColor: "#e5e7eb", borderWidth: 1, gap: 8
  },
  label: { fontSize: 16, fontWeight: "600" },
  row: { flexDirection: "row", alignItems: "center", justifyContent: "space-between" },
  rowLabel: { color: "#6b7280" },
  rowValue: { fontWeight: "700" },
  rowButtons: { flexDirection: "row", gap: 12, justifyContent: "space-between" },
  hr: { height: 1, backgroundColor: "#e5e7eb", marginVertical: 8 },
  notes: { color: "#374151", lineHeight: 20 },
  modalWrap: { flex:1, backgroundColor:"rgba(0,0,0,0.35)", alignItems:"center", justifyContent:"center" },
  modal: { width:"85%", backgroundColor:"#fff", borderRadius:16, padding:16, alignItems:"flex-start", gap:8 },
  modalBtn: { marginTop:12, backgroundColor:"#111827", paddingVertical:10, paddingHorizontal:12, borderRadius:10, alignSelf:"flex-end" }
});
