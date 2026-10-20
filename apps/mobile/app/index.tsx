/** Welcome / onboarding — first screen of the app. */
import { useState } from "react";
import { Image, Pressable, StyleSheet, Text, View } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { Ionicons } from "@expo/vector-icons";
import { StatusBar } from "expo-status-bar";
import { useRouter } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Btn, K } from "@/components/kit";

const SLIDES = [
  { title: "Skills for a brighter tomorrow", icon: "school" as const },
  { title: "Live classes, workshops & webinars", icon: "videocam" as const },
  { title: "Earn certificates that count", icon: "ribbon" as const },
];

export default function Welcome() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const [i, setI] = useState(0);

  return (
    <LinearGradient colors={["#06473E", "#043A33", "#02231F"]} style={{ flex: 1 }}>
      <StatusBar style="light" />
      {/* glow + orbit lines */}
      <View style={[st.glow, { top: 90 }]} />
      <View style={[st.orbit, { top: 380, transform: [{ rotate: "-12deg" }] }]} />
      <View style={[st.orbit, { top: 420, width: 520, transform: [{ rotate: "-8deg" }], opacity: 0.12 }]} />

      <View style={{ flex: 1, paddingTop: insets.top + 56, paddingHorizontal: 28, alignItems: "center" }}>
        <Image source={require("../assets/logo-light.png")} style={{ width: 270, height: 106 }} resizeMode="contain" />
        <Text style={st.tags}>Learn   •   Grow   •   Apply   •   Excel</Text>
        <Text style={st.tagline}>{SLIDES[i].title}</Text>

        {/* Hero visual */}
        <View style={st.visual}>
          <LinearGradient colors={["rgba(43,214,180,0.35)", "rgba(43,214,180,0)"]} style={st.halo} />
          <View style={st.badge}>
            <Ionicons name={SLIDES[i].icon} size={64} color={K.mint} />
          </View>
          {[
            { icon: "bulb" as const, x: -110, y: -50 },
            { icon: "planet" as const, x: 105, y: -70 },
            { icon: "color-palette" as const, x: -95, y: 75 },
            { icon: "code-slash" as const, x: 110, y: 60 },
          ].map((b) => (
            <View key={b.icon} style={[st.float, { transform: [{ translateX: b.x }, { translateY: b.y }] }]}>
              <Ionicons name={b.icon} size={20} color="#fff" />
            </View>
          ))}
        </View>

        <View style={{ flexDirection: "row", gap: 6, marginTop: "auto", marginBottom: 22 }}>
          {SLIDES.map((_, k) => (
            <Pressable key={k} onPress={() => setI(k)} hitSlop={8}>
              <View style={[st.dot, k === i && { width: 18, backgroundColor: "#fff" }]} />
            </Pressable>
          ))}
        </View>
      </View>

      <View style={{ paddingHorizontal: 24, paddingBottom: insets.bottom + 24 }}>
        <Btn
          title={i < SLIDES.length - 1 ? "Next" : "Get Started"}
          variant="ghostLight"
          onPress={() => (i < SLIDES.length - 1 ? setI(i + 1) : router.push("/login"))}
        />
        <Pressable onPress={() => router.push("/login")} style={{ marginTop: 16, alignItems: "center" }}>
          <Text style={{ color: "rgba(255,255,255,0.8)", fontSize: 13 }}>
            Already have an account? <Text style={{ color: K.mint, fontWeight: "700" }}>Sign In</Text>
          </Text>
        </Pressable>
      </View>
    </LinearGradient>
  );
}

const st = StyleSheet.create({
  glow: {
    position: "absolute",
    alignSelf: "center",
    width: 340,
    height: 340,
    borderRadius: 170,
    backgroundColor: "#0E937E",
    opacity: 0.25,
  },
  orbit: {
    position: "absolute",
    left: -60,
    width: 480,
    height: 140,
    borderRadius: 240,
    borderWidth: 1,
    borderColor: "#2BD6B4",
    opacity: 0.2,
  },
  tags: { color: "rgba(255,255,255,0.85)", fontSize: 13, marginTop: 6, letterSpacing: 0.5 },
  tagline: { color: "#fff", fontSize: 17, fontWeight: "600", marginTop: 14, textAlign: "center" },
  visual: { marginTop: 48, width: 280, height: 240, alignItems: "center", justifyContent: "center" },
  halo: { position: "absolute", width: 240, height: 240, borderRadius: 120 },
  badge: {
    width: 128,
    height: 128,
    borderRadius: 40,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "rgba(255,255,255,0.08)",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.18)",
  },
  float: {
    position: "absolute",
    width: 44,
    height: 44,
    borderRadius: 14,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "rgba(43,214,180,0.18)",
    borderWidth: 1,
    borderColor: "rgba(43,214,180,0.4)",
  },
  dot: { width: 6, height: 6, borderRadius: 3, backgroundColor: "rgba(255,255,255,0.4)" },
});
