import { useRef, useState } from "react";
import {
  Animated,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  View,
  type StyleProp,
  type ViewStyle,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import * as Haptics from "expo-haptics";
import { BRAND } from "@qschool/shared";

const C = BRAND.colors;

/* ------------------------------------------------------------------ */
/* Haptics helper — no-op on web                                       */
/* ------------------------------------------------------------------ */
export function tap(style: Haptics.ImpactFeedbackStyle = Haptics.ImpactFeedbackStyle.Light) {
  if (Platform.OS === "web") return;
  Haptics.impactAsync(style).catch(() => {});
}

export function selectHaptic() {
  if (Platform.OS === "web") return;
  Haptics.selectionAsync().catch(() => {});
}

/* ------------------------------------------------------------------ */
/* Layout primitives                                                   */
/* ------------------------------------------------------------------ */
export function Screen({
  children,
  style,
}: {
  children: React.ReactNode;
  style?: StyleProp<ViewStyle>;
}) {
  return <View style={[styles.screen, style]}>{children}</View>;
}

export function Card({
  children,
  style,
}: {
  children: React.ReactNode;
  style?: StyleProp<ViewStyle>;
}) {
  return <View style={[styles.card, style]}>{children}</View>;
}

/** Elevated 3D card: soft shadow + bright top rim, for tappable content. */
export function Card3D({
  children,
  style,
  hoverable = true,
}: {
  children: React.ReactNode;
  style?: StyleProp<ViewStyle>;
  hoverable?: boolean;
}) {
  const lift = useRef(new Animated.Value(0)).current;
  const [hovered, setHovered] = useState(false);

  const animate = (to: number) =>
    Animated.spring(lift, { toValue: to, useNativeDriver: true, friction: 6, tension: 140 }).start();

  return (
    <Animated.View
      onPointerEnter={() => {
        if (!hoverable) return;
        setHovered(true);
        animate(-3);
      }}
      onPointerLeave={() => {
        if (!hoverable) return;
        setHovered(false);
        animate(0);
      }}
      style={[
        styles.card3d,
        hovered && styles.card3dHover,
        { transform: [{ translateY: lift }] },
        style,
      ]}
    >
      <View style={styles.card3dGloss} pointerEvents="none" />
      {children}
    </Animated.View>
  );
}

export function Chip({ label, hot }: { label: string; hot?: boolean }) {
  return (
    <View style={[styles.chip, hot && { backgroundColor: C.teal, borderColor: C.teal }]}>
      <Text style={[styles.chipText, hot && { color: "#fff" }]}>{label}</Text>
    </View>
  );
}

/* ------------------------------------------------------------------ */
/* 3D icon tile                                                        */
/* ------------------------------------------------------------------ */
/**
 * Glossy 3D icon tile. On pointer devices (web/desktop) it lifts, tilts and
 * brightens on hover — pointer events are used instead of a Pressable so touch
 * handling of parent buttons is never intercepted on native.
 */
export function Icon3D({
  glyph,
  size = 52,
  from = C.teal500,
  to = C.teal,
  style,
  hoverable = true,
}: {
  glyph: string;
  size?: number;
  from?: string;
  to?: string;
  style?: StyleProp<ViewStyle>;
  hoverable?: boolean;
}) {
  const radius = size * 0.3;
  const scale = useRef(new Animated.Value(1)).current;
  const lift = useRef(new Animated.Value(0)).current;
  const [hovered, setHovered] = useState(false);

  const animate = (toScale: number, toLift: number) =>
    Animated.parallel([
      Animated.spring(scale, { toValue: toScale, useNativeDriver: true, friction: 5, tension: 150 }),
      Animated.spring(lift, { toValue: toLift, useNativeDriver: true, friction: 5, tension: 150 }),
    ]).start();

  const onEnter = () => {
    if (!hoverable) return;
    setHovered(true);
    animate(1.1, -4);
  };

  const onLeave = () => {
    if (!hoverable) return;
    setHovered(false);
    animate(1, 0);
  };

  const tilt = lift.interpolate({ inputRange: [-6, 0], outputRange: ["-4deg", "0deg"] });

  return (
    <Animated.View
      onPointerEnter={onEnter}
      onPointerLeave={onLeave}
      style={[
        {
          width: size,
          height: size,
          borderRadius: radius,
          shadowColor: to,
          shadowOpacity: hovered ? 0.62 : 0.45,
          shadowRadius: size * (hovered ? 0.32 : 0.22),
          shadowOffset: { width: 0, height: size * (hovered ? 0.2 : 0.14) },
          elevation: hovered ? 14 : 8,
          backgroundColor: to,
          transform: [{ scale }, { translateY: lift }, { rotate: tilt }],
        },
        style,
      ]}
    >
      <LinearGradient
        colors={[from, to]}
        start={{ x: 0.05, y: 0 }}
        end={{ x: 0.95, y: 1 }}
        style={[StyleSheet.absoluteFill, { borderRadius: radius }]}
      />
      {/* top gloss */}
      <View
        pointerEvents="none"
        style={{
          position: "absolute",
          top: size * 0.05,
          left: size * 0.08,
          right: size * 0.08,
          height: size * (hovered ? 0.5 : 0.4),
          borderRadius: radius,
          backgroundColor: hovered ? "rgba(255,255,255,0.34)" : "rgba(255,255,255,0.22)",
        }}
      />
      {/* bright rim */}
      <View
        pointerEvents="none"
        style={[
          StyleSheet.absoluteFill,
          {
            borderRadius: radius,
            borderWidth: 1,
            borderColor: hovered ? "rgba(255,255,255,0.65)" : "rgba(255,255,255,0.38)",
          },
        ]}
      />
      <View style={{ flex: 1, alignItems: "center", justifyContent: "center" }}>
        <Text
          style={{
            fontSize: size * (hovered ? 0.5 : 0.46),
            textShadowColor: "rgba(0,0,0,0.25)",
            textShadowOffset: { width: 0, height: 1 },
            textShadowRadius: 2,
          }}
        >
          {glyph}
        </Text>
      </View>
    </Animated.View>
  );
}

/* ------------------------------------------------------------------ */
/* 3D glossy button                                                    */
/* ------------------------------------------------------------------ */
export function GlossyButton({
  title,
  icon,
  onPress,
  variant = "primary",
  size = "md",
  style,
}: {
  title: string;
  icon?: string;
  onPress?: () => void;
  variant?: "primary" | "glass" | "gold";
  size?: "md" | "sm";
  style?: StyleProp<ViewStyle>;
}) {
  const scale = useRef(new Animated.Value(1)).current;
  const lift = useRef(new Animated.Value(0)).current;
  const hoveredRef = useRef(false);
  const [hovered, setHovered] = useState(false);

  const animate = (toScale: number, toLift: number) =>
    Animated.parallel([
      Animated.spring(scale, { toValue: toScale, useNativeDriver: true, friction: 6, tension: 120 }),
      Animated.spring(lift, { toValue: toLift, useNativeDriver: true, friction: 6, tension: 120 }),
    ]).start();

  const palettes = {
    primary: { colors: [C.teal500, "#067A68"] as const, text: "#fff", shadow: C.teal },
    gold: { colors: ["#FFD98A", "#E8A33D"] as const, text: "#4A2E00", shadow: "#E8A33D" },
    glass: { colors: ["rgba(255,255,255,0.28)", "rgba(255,255,255,0.10)"] as const, text: "#fff", shadow: "#032922" },
  } as const;

  const p = palettes[variant];
  const h = size === "sm" ? 40 : 52;

  return (
    <Pressable
      onPressIn={() => animate(0.96, 2)}
      onPressOut={() => animate(hoveredRef.current ? 1.04 : 1, 0)}
      onPress={() => {
        tap();
        onPress?.();
      }}
      style={style}
    >
      <Animated.View
        onPointerEnter={() => {
          hoveredRef.current = true;
          setHovered(true);
          animate(1.04, -2);
        }}
        onPointerLeave={() => {
          hoveredRef.current = false;
          setHovered(false);
          animate(1, 0);
        }}
        style={{
          transform: [{ scale }, { translateY: lift }],
          borderRadius: 16,
          shadowColor: p.shadow,
          shadowOpacity: hovered ? 0.62 : variant === "glass" ? 0.25 : 0.45,
          shadowRadius: hovered ? 18 : 12,
          shadowOffset: { width: 0, height: hovered ? 12 : 8 },
          elevation: hovered ? 16 : 10,
        }}
      >
        <LinearGradient
          colors={p.colors as unknown as readonly [string, string]}
          start={{ x: 0, y: 0 }}
          end={{ x: 0, y: 1 }}
          style={{
            height: h,
            borderRadius: 16,
            paddingHorizontal: 18,
            flexDirection: "row",
            alignItems: "center",
            justifyContent: "center",
            gap: 8,
            borderWidth: 1,
            borderColor: hovered
              ? "rgba(255,255,255,0.6)"
              : variant === "glass"
                ? "rgba(255,255,255,0.35)"
                : "rgba(255,255,255,0.30)",
          }}
        >
          {/* gloss strip — brightens on hover */}
          <View
            pointerEvents="none"
            style={{
              position: "absolute",
              top: 2,
              left: 3,
              right: 3,
              height: h * (hovered ? 0.55 : 0.42),
              borderRadius: 12,
              backgroundColor: hovered ? "rgba(255,255,255,0.32)" : "rgba(255,255,255,0.18)",
            }}
          />
          {icon ? <Text style={{ fontSize: 16 }}>{icon}</Text> : null}
          <Text style={{ color: p.text, fontWeight: "700", fontSize: size === "sm" ? 13 : 15 }}>
            {title}
          </Text>
        </LinearGradient>
      </Animated.View>
    </Pressable>
  );
}

/* Back-compat for screens already using PrimaryButton */
export function PrimaryButton({ title, onPress }: { title: string; onPress?: () => void }) {
  return <GlossyButton title={title} onPress={onPress} />;
}

/* ------------------------------------------------------------------ */
/* Misc                                                               */
/* ------------------------------------------------------------------ */
export function ProgressBar({
  pct,
  height = 8,
  trackColor = "#EAF3F0",
}: {
  pct: number;
  height?: number;
  trackColor?: string;
}) {
  return (
    <View style={[styles.track, { height, backgroundColor: trackColor }]}>
      <LinearGradient
        colors={[C.teal500, C.teal]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 0 }}
        style={{
          height,
          width: `${Math.min(100, pct)}%`,
          borderRadius: height / 2,
        }}
      />
    </View>
  );
}

export function SectionTitle({
  title,
  action,
  onAction,
}: {
  title: string;
  action?: string;
  onAction?: () => void;
}) {
  return (
    <View style={styles.sectionRow}>
      <Text style={styles.sectionTitle}>{title}</Text>
      {action ? (
        <Pressable
          onPress={() => {
            tap();
            onAction?.();
          }}
          hitSlop={8}
          style={({ pressed }) => [pressed && { opacity: 0.6 }]}
        >
          <Text style={styles.sectionAction}>{action}</Text>
        </Pressable>
      ) : null}
    </View>
  );
}

/** Translucent tile used inside gradient surfaces (hero). */
export function GlassTile({
  children,
  style,
}: {
  children: React.ReactNode;
  style?: StyleProp<ViewStyle>;
}) {
  return (
    <View style={[styles.glass, style]}>
      <View pointerEvents="none" style={styles.glassGloss} />
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: "#F4FAF8" },
  card: {
    backgroundColor: "#fff",
    borderRadius: 16,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: "#E2ECE9",
    padding: 16,
  },
  card3d: {
    backgroundColor: "#fff",
    borderRadius: 20,
    padding: 16,
    overflow: "hidden",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.9)",
    shadowColor: "#054038",
    shadowOpacity: 0.14,
    shadowRadius: 16,
    shadowOffset: { width: 0, height: 10 },
    elevation: 6,
  },
  card3dHover: {
    shadowOpacity: 0.24,
    shadowRadius: 24,
    shadowOffset: { width: 0, height: 16 },
    elevation: 12,
    borderColor: "#D6E9E4",
  },
  card3dGloss: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    height: 26,
    backgroundColor: "rgba(215,240,235,0.55)",
  },
  chip: {
    alignSelf: "flex-start",
    borderRadius: 999,
    borderWidth: 1,
    borderColor: C.teal100,
    backgroundColor: "#EAF6F3",
    paddingHorizontal: 10,
    paddingVertical: 3,
  },
  chipText: { fontSize: 11, fontWeight: "600", color: C.deep },
  track: {
    borderRadius: 999,
    overflow: "hidden",
  },
  sectionRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
    marginTop: 8,
  },
  sectionTitle: { fontSize: 18, fontWeight: "700", color: C.deep },
  sectionAction: { fontSize: 13, fontWeight: "600", color: C.teal },
  glass: {
    backgroundColor: "rgba(255,255,255,0.14)",
    borderRadius: 16,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.22)",
    padding: 12,
    overflow: "hidden",
  },
  glassGloss: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    height: 14,
    backgroundColor: "rgba(255,255,255,0.10)",
  },
});
