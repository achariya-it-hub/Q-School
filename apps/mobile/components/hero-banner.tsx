import { useEffect, useRef } from "react";
import { Animated, StyleSheet, Text, View } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { BRAND } from "@qschool/shared";
import { GlassTile } from "@/components/ui";

const C = BRAND.colors;

const ORB_TEAL = require("../assets/orb-teal.png");
const ORB_GOLD = require("../assets/orb-gold.png");
const ORB_MINT = require("../assets/orb-mint.png");

/** Hero banner — brand mood, headline and level chips. Everything else is split out. */
export function HeroBanner({
  headline = "Keep the momentum going strong.",
  subtitle,
  streak = 12,
  level = 4,
}: {
  headline?: string;
  subtitle?: string;
  streak?: number;
  level?: number;
}) {
  const float = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(float, { toValue: 1, duration: 3400, useNativeDriver: true }),
        Animated.timing(float, { toValue: 0, duration: 3400, useNativeDriver: true }),
      ]),
    ).start();
  }, [float]);

  const orbY = float.interpolate({ inputRange: [0, 1], outputRange: [0, -14] });
  const orbY2 = float.interpolate({ inputRange: [0, 1], outputRange: [0, 12] });

  return (
    <View style={styles.shadow}>
      <LinearGradient
        colors={["#0B6E5F", C.deep, "#02201C"]}
        start={{ x: 0.05, y: 0 }}
        end={{ x: 0.9, y: 1 }}
        style={styles.bg}
      >
        <Animated.Image source={ORB_TEAL} style={[styles.orbTeal, { transform: [{ translateY: orbY }] }]} />
        <Animated.Image
          source={ORB_GOLD}
          style={[styles.orbGold, { transform: [{ translateY: orbY2 }, { rotate: "-14deg" }] }]}
        />
        <Animated.Image source={ORB_MINT} style={[styles.orbMint, { transform: [{ translateY: orbY2 }] }]} />
        <View pointerEvents="none" style={styles.glow} />

        <View style={styles.chipRow}>
          <GlassTile style={styles.chip}>
            <Text style={styles.streakText}>🔥 {streak}-day streak</Text>
          </GlassTile>
          <GlassTile style={styles.chip}>
            <Text style={styles.levelText}>⚡ Level {level} Scholar</Text>
          </GlassTile>
        </View>

        <Text style={styles.headline}>
          {headline.split(" ").slice(0, -2).join(" ")}{" "}
          <Text style={styles.headlineAccent}>{headline.split(" ").slice(-2).join(" ")}</Text>
        </Text>

        {subtitle ? <Text style={styles.subtitle}>{subtitle}</Text> : null}
      </LinearGradient>
    </View>
  );
}

const styles = StyleSheet.create({
  shadow: {
    borderRadius: 30,
    shadowColor: C.deep,
    shadowOpacity: 0.34,
    shadowRadius: 22,
    shadowOffset: { width: 0, height: 16 },
    elevation: 14,
  },
  bg: {
    borderRadius: 30,
    paddingTop: 18,
    paddingHorizontal: 18,
    paddingBottom: 46, // room for the progress card that tucks underneath
    overflow: "hidden",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.14)",
  },
  orbTeal: { position: "absolute", width: 250, height: 250, right: -78, top: -60, opacity: 0.5 },
  orbGold: { position: "absolute", width: 116, height: 116, right: 10, bottom: -46, opacity: 0.55 },
  orbMint: { position: "absolute", width: 84, height: 84, left: -40, bottom: 10, opacity: 0.28 },
  glow: {
    position: "absolute",
    left: -60,
    top: -70,
    width: 220,
    height: 220,
    borderRadius: 110,
    backgroundColor: "rgba(43,179,156,0.12)",
  },
  chipRow: { flexDirection: "row", gap: 8 },
  chip: { paddingHorizontal: 12, paddingVertical: 7, borderRadius: 999 },
  streakText: { color: "#FFD98A", fontSize: 12, fontWeight: "700" },
  levelText: { color: "#D7F0EB", fontSize: 12, fontWeight: "600" },
  headline: {
    color: "#fff",
    fontSize: 26,
    fontWeight: "800",
    lineHeight: 32,
    marginTop: 16,
    letterSpacing: 0.2,
  },
  headlineAccent: { color: C.teal500 },
  subtitle: { color: "#A9D8D0", fontSize: 12.5, marginTop: 8, lineHeight: 18 },
});
