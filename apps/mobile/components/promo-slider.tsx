import { useEffect, useRef, useState } from "react";
import {
  Animated,
  NativeScrollEvent,
  NativeSyntheticEvent,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { BRAND } from "@qschool/shared";
import { GlossyButton, Icon3D, tap } from "@/components/ui";

const C = BRAND.colors;

type Slide = {
  id: string;
  glyph: string;
  tag: string;
  title: string;
  subtitle: string;
  cta: string;
  glow: [string, string];
  iconFrom: string;
  iconTo: string;
  live?: boolean;
};

const SLIDES: Slide[] = [
  {
    id: "live",
    glyph: "🎥",
    tag: "LIVE IN 42 MIN",
    title: "Light — Reflection & Refraction",
    subtitle: "Class 10 Science · Prof. Meera",
    cta: "Join now",
    glow: ["#0B6E5F", "#032A25"],
    iconFrom: "#FF9E85",
    iconTo: "#D2452A",
    live: true,
  },
  {
    id: "referral",
    glyph: "🎁",
    tag: "REFER & EARN",
    title: "Invite a friend, get ₹500",
    subtitle: "Both of you get wallet credit on enrolment",
    cta: "Invite",
    glow: ["#8A6320", "#3A2807"],
    iconFrom: "#FFE1A8",
    iconTo: "#D1932C",
  },
  {
    id: "batch",
    glyph: "🧬",
    tag: "NEW BATCH",
    title: "NEET Biology Crash Course",
    subtitle: "Starts 12 Oct · only 40 seats left",
    cta: "Explore",
    glow: ["#0E5E86", "#052335"],
    iconFrom: "#8EDAFF",
    iconTo: "#2A7CA8",
  },
  {
    id: "rank",
    glyph: "🏆",
    tag: "WEEKLY LEADERBOARD",
    title: "You're #7 this week",
    subtitle: "Solve 3 more quizzes to reach the top 5",
    cta: "Practice",
    glow: ["#5B2E86", "#220F3A"],
    iconFrom: "#D8B7FF",
    iconTo: "#7B4FD1",
  },
];

const GAP = 12;
const AUTOPLAY_MS = 5200;

export function PromoSlider({ onAction }: { onAction?: (slideId: string) => void }) {
  const scrollRef = useRef<ScrollView>(null);
  const [index, setIndex] = useState(0);
  const [width, setWidth] = useState(0);
  const pausedUntil = useRef(0);
  const dotPulse = useRef(new Animated.Value(0)).current;

  // autoplay — skipped while the user is swiping
  useEffect(() => {
    if (width === 0) return;
    const timer = setInterval(() => {
      if (Date.now() < pausedUntil.current) return;
      setIndex((prev) => {
        const next = (prev + 1) % SLIDES.length;
        scrollRef.current?.scrollTo({ x: next * (width + GAP), animated: true });
        return next;
      });
    }, AUTOPLAY_MS);
    return () => clearInterval(timer);
  }, [width]);

  useEffect(() => {
    Animated.sequence([
      Animated.timing(dotPulse, { toValue: 1, duration: 180, useNativeDriver: true }),
      Animated.timing(dotPulse, { toValue: 0, duration: 180, useNativeDriver: true }),
    ]).start();
  }, [index, dotPulse]);

  const onScroll = (e: NativeSyntheticEvent<NativeScrollEvent>) => {
    if (width === 0) return;
    const i = Math.round(e.nativeEvent.contentOffset.x / (width + GAP));
    if (i !== index && i >= 0 && i < SLIDES.length) setIndex(i);
  };

  return (
    <View style={{ marginBottom: 20 }}>
      <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "space-between", marginBottom: 10 }}>
        <Text style={styles.heading}>For you</Text>
        <Text style={styles.swipeHint}>swipe →</Text>
      </View>

      <View onLayout={(e) => setWidth(e.nativeEvent.layout.width)}>
        {width > 0 && (
          <ScrollView
            ref={scrollRef}
            horizontal
            showsHorizontalScrollIndicator={false}
            snapToInterval={width + GAP}
            decelerationRate="fast"
            onScrollBeginDrag={() => {
              pausedUntil.current = Date.now() + 9000;
            }}
            onMomentumScrollEnd={onScroll}
            scrollEventThrottle={16}
            contentContainerStyle={{ gap: GAP }}
          >
            {SLIDES.map((s, i) => (
              <View key={s.id} style={{ width }}>
                <LinearGradient
                  colors={s.glow}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 1 }}
                  style={styles.card}
                >
                  <View pointerEvents="none" style={styles.cardGloss} />
                  <View pointerEvents="none" style={styles.cardRim} />

                  <View style={{ flexDirection: "row", gap: 12 }}>
                    <Icon3D glyph={s.glyph} size={46} from={s.iconFrom} to={s.iconTo} />

                    <View style={{ flex: 1 }}>
                      <View style={{ flexDirection: "row", alignItems: "center", gap: 6 }}>
                        {s.live ? <View style={styles.liveDot} /> : null}
                        <Text style={[styles.tag, s.live && { color: "#FFD0C4" }]}>{s.tag}</Text>
                      </View>
                      <Text style={styles.title} numberOfLines={1}>
                        {s.title}
                      </Text>
                      <Text style={styles.subtitle} numberOfLines={1}>
                        {s.subtitle}
                      </Text>
                    </View>
                  </View>

                  <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "space-between", marginTop: 12 }}>
                    <View style={styles.metaRow}>
                      <Text style={styles.meta}>
                        {i + 1} / {SLIDES.length}
                      </Text>
                    </View>
                    <Pressable style={{ width: 118 }} onPress={() => { tap(); onAction?.(s.id); }}>
                      <GlossyButton
                        title={s.cta}
                        icon={s.live ? "▶" : undefined}
                        size="sm"
                        variant={s.id === "referral" ? "gold" : "primary"}
                      />
                    </Pressable>
                  </View>
                </LinearGradient>
              </View>
            ))}
          </ScrollView>
        )}
      </View>

      {/* dots */}
      <View style={styles.dots}>
        {SLIDES.map((s, i) => {
          const active = i === index;
          return (
            <Animated.View
              key={s.id}
              style={[
                styles.dot,
                active && styles.dotActive,
                active && { transform: [{ scale: dotPulse.interpolate({ inputRange: [0, 1], outputRange: [1, 1.25] }) }] },
              ]}
            />
          );
        })}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  heading: { fontSize: 18, fontWeight: "700", color: C.deep },
  swipeHint: { fontSize: 11.5, color: "#8aa39c", fontWeight: "600" },
  card: {
    borderRadius: 22,
    padding: 16,
    overflow: "hidden",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.16)",
    shadowColor: C.deep,
    shadowOpacity: 0.28,
    shadowRadius: 18,
    shadowOffset: { width: 0, height: 12 },
    elevation: 10,
  },
  cardGloss: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    height: 30,
    backgroundColor: "rgba(255,255,255,0.09)",
  },
  cardRim: {
    position: "absolute",
    top: 1,
    left: 1,
    right: 1,
    height: 1,
    backgroundColor: "rgba(255,255,255,0.35)",
  },
  liveDot: { width: 8, height: 8, borderRadius: 4, backgroundColor: "#FF6B4A" },
  tag: { color: "#9FD6CC", fontSize: 10.5, fontWeight: "800", letterSpacing: 0.7 },
  title: { color: "#fff", fontSize: 16, fontWeight: "700", marginTop: 6 },
  subtitle: { color: "rgba(255,255,255,0.72)", fontSize: 12, marginTop: 3 },
  metaRow: { flexDirection: "row", alignItems: "center" },
  meta: { color: "rgba(255,255,255,0.55)", fontSize: 11, fontWeight: "600" },
  dots: { flexDirection: "row", justifyContent: "center", gap: 6, marginTop: 12 },
  dot: { width: 6, height: 6, borderRadius: 3, backgroundColor: "#CFE3DE" },
  dotActive: { width: 20, borderRadius: 4, backgroundColor: C.teal },
});
