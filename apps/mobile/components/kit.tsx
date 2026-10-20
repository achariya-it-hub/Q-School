/**
 * Q-School mobile UI kit (v2 — matches the student app mockups).
 * Flat, clean cards on a white surface; deep-green primary; teal accents.
 */
import { useState } from "react";
import {
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
  type StyleProp,
  type ViewStyle,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { ART, type ArtKey } from "@qschool/shared";
import { selectHaptic, tap } from "@/components/ui";

export const K = {
  deep: "#054038",
  deeper: "#03302A",
  teal: "#0E937E",
  mint: "#2BD6B4",
  tint: "#E8F5F1",
  ink: "#0F1F1C",
  sub: "#6B807B",
  line: "#E6EEEB",
  bg: "#FFFFFF",
  soft: "#F5F9F8",
  star: "#F5A623",
  red: "#E5484D",
};

export type IconName = keyof typeof Ionicons.glyphMap;

export const ART_ICON: Record<ArtKey, IconName> = {
  bulb: "bulb",
  laptop: "laptop-outline",
  pencil: "create-outline",
  planet: "planet",
  leader: "flag",
  palette: "color-palette",
  robot: "hardware-chip-outline",
  ai: "sparkles",
  heart: "heart",
  speech: "mic",
  python: "code-slash",
  leaf: "leaf",
  building: "business",
};

/* ------------------------------------------------------------------ */
/* Artwork thumbnail                                                    */
/* ------------------------------------------------------------------ */
export function Art({
  art,
  style,
  size = 36,
  radius = 12,
  children,
}: {
  art: ArtKey;
  style?: StyleProp<ViewStyle>;
  size?: number;
  radius?: number;
  children?: React.ReactNode;
}) {
  const a = ART[art];
  return (
    <LinearGradient
      colors={[a.from, a.to]}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
      style={[{ borderRadius: radius, overflow: "hidden", alignItems: "center", justifyContent: "center" }, style]}
    >
      <View style={[s.glow, { backgroundColor: a.accent, width: size * 1.9, height: size * 1.9, borderRadius: size * 0.95 }]} />
      <View style={[s.ring, { right: -size * 0.5, top: -size * 0.5, width: size * 1.6, height: size * 1.6, borderRadius: size }]} />
      <View style={[s.dot, { left: "18%", top: "22%" }]} />
      <View style={[s.dot, { right: "22%", bottom: "24%", width: 3, height: 3 }]} />
      <Ionicons name={ART_ICON[art]} size={size} color={a.accent} />
      {children}
    </LinearGradient>
  );
}

export function Avatar({ name, size = 40, ring }: { name: string; size?: number; ring?: boolean }) {
  const initials = name
    .split(" ")
    .map((w) => w[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();
  return (
    <LinearGradient
      colors={["#2BB39C", K.deep]}
      style={{
        width: size,
        height: size,
        borderRadius: size / 2,
        alignItems: "center",
        justifyContent: "center",
        borderWidth: ring ? 2 : 0,
        borderColor: "#fff",
      }}
    >
      <Text style={{ color: "#fff", fontWeight: "700", fontSize: size * 0.36 }}>{initials}</Text>
    </LinearGradient>
  );
}

/* ------------------------------------------------------------------ */
/* Layout                                                              */
/* ------------------------------------------------------------------ */
export function Page({
  title,
  back,
  right,
  children,
  scroll = true,
  pad = true,
}: {
  title?: string;
  back?: boolean;
  right?: React.ReactNode;
  children: React.ReactNode;
  scroll?: boolean;
  pad?: boolean;
}) {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const body = scroll ? (
    <ScrollView
      contentContainerStyle={{ paddingHorizontal: pad ? 16 : 0, paddingBottom: 120 }}
      showsVerticalScrollIndicator={false}
    >
      {children}
    </ScrollView>
  ) : (
    <View style={{ flex: 1, paddingHorizontal: pad ? 16 : 0 }}>{children}</View>
  );

  return (
    <View style={{ flex: 1, backgroundColor: K.bg, paddingTop: insets.top }}>
      {title !== undefined && (
        <View style={s.header}>
          {back && (
            <Pressable
              hitSlop={10}
              onPress={() => (router.canGoBack() ? router.back() : router.replace("/home"))}
              style={{ marginRight: 10 }}
            >
              <Ionicons name="arrow-back" size={24} color={K.ink} />
            </Pressable>
          )}
          <Text style={[s.h1, back && { fontSize: 22 }]}>{title}</Text>
          <View style={{ marginLeft: "auto" }}>{right}</View>
        </View>
      )}
      {body}
    </View>
  );
}

export function SectionHead({ title, cta, onPress }: { title: string; cta?: string; onPress?: () => void }) {
  return (
    <View style={s.sectionHead}>
      <Text style={s.h2}>{title}</Text>
      {cta && (
        <Pressable onPress={onPress} hitSlop={8}>
          <Text style={s.link}>{cta}</Text>
        </Pressable>
      )}
    </View>
  );
}

/* ------------------------------------------------------------------ */
/* Inputs & controls                                                    */
/* ------------------------------------------------------------------ */
export function SearchBar({ placeholder, scan }: { placeholder: string; scan?: boolean }) {
  return (
    <View style={s.search}>
      <Ionicons name="search" size={18} color={K.sub} />
      <TextInput placeholder={placeholder} placeholderTextColor="#94A6A1" style={s.searchInput} />
      {scan && <Ionicons name="scan-outline" size={18} color={K.ink} />}
    </View>
  );
}

/** Segmented pill tabs (In Progress / Completed / Bookmarks …). */
export function Segments({
  items,
  value,
  onChange,
}: {
  items: string[];
  value: number;
  onChange: (i: number) => void;
}) {
  return (
    <View style={s.segments}>
      {items.map((it, i) => {
        const on = i === value;
        return (
          <Pressable
            key={it}
            onPress={() => {
              selectHaptic();
              onChange(i);
            }}
            style={[s.segment, on && s.segmentOn]}
          >
            <Text style={[s.segmentText, on && { color: "#fff", fontWeight: "600" }]} numberOfLines={1}>
              {it}
            </Text>
          </Pressable>
        );
      })}
    </View>
  );
}

/** Horizontal filter chips (All / Courses / Live Classes …). */
export function Chips({ items, value, onChange }: { items: string[]; value: number; onChange: (i: number) => void }) {
  return (
    <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 8, paddingVertical: 2 }}>
      {items.map((it, i) => {
        const on = i === value;
        return (
          <Pressable
            key={it}
            onPress={() => {
              selectHaptic();
              onChange(i);
            }}
            style={[s.chip, on && { backgroundColor: K.deep, borderColor: K.deep }]}
          >
            <Text style={[s.chipText, on && { color: "#fff", fontWeight: "600" }]}>{it}</Text>
          </Pressable>
        );
      })}
    </ScrollView>
  );
}

export function Btn({
  title,
  onPress,
  icon = "arrow-forward",
  variant = "solid",
  small,
  style,
}: {
  title: string;
  onPress?: () => void;
  icon?: IconName | null;
  variant?: "solid" | "outline" | "light" | "ghostLight";
  small?: boolean;
  style?: StyleProp<ViewStyle>;
}) {
  const [down, setDown] = useState(false);
  const solid = variant === "solid";
  const color =
    variant === "solid" || variant === "ghostLight" ? "#fff" : variant === "light" ? K.deep : K.teal;
  return (
    <Pressable
      onPress={() => {
        tap();
        onPress?.();
      }}
      onPressIn={() => setDown(true)}
      onPressOut={() => setDown(false)}
      style={[{ transform: [{ scale: down ? 0.97 : 1 }] }, style]}
    >
      {solid ? (
        <LinearGradient colors={["#0B6E5F", K.deep]} style={[s.btn, small && s.btnSm]}>
          <Text style={[s.btnText, small && { fontSize: 12 }]}>{title}</Text>
          {icon && !small && <Ionicons name={icon} size={18} color="#fff" />}
        </LinearGradient>
      ) : (
        <View
          style={[
            s.btn,
            small && s.btnSm,
            variant === "outline" && { borderWidth: 1.5, borderColor: K.teal, backgroundColor: "#fff" },
            variant === "light" && { backgroundColor: K.tint },
            variant === "ghostLight" && { borderWidth: 1.5, borderColor: K.mint, backgroundColor: "rgba(255,255,255,0.06)" },
          ]}
        >
          <Text style={[s.btnText, { color }, small && { fontSize: 12 }]}>{title}</Text>
          {icon && !small && <Ionicons name={icon} size={18} color={color} />}
        </View>
      )}
    </Pressable>
  );
}

/** Small pill button used on list rows (Register / View Details / Join Now). */
export function PillBtn({ title, onPress, outline }: { title: string; onPress?: () => void; outline?: boolean }) {
  return (
    <Pressable
      onPress={() => {
        tap();
        onPress?.();
      }}
      style={({ pressed }) => [
        s.pill,
        outline ? { backgroundColor: "#fff", borderWidth: 1.5, borderColor: K.teal } : { backgroundColor: K.teal },
        pressed && { opacity: 0.85 },
      ]}
    >
      <Text style={[s.pillText, outline && { color: K.teal }]}>{title}</Text>
    </Pressable>
  );
}

export function Stars({ rating, count }: { rating: number; count?: string }) {
  return (
    <View style={{ flexDirection: "row", alignItems: "center", gap: 4 }}>
      <Ionicons name="star" size={13} color={K.star} />
      <Text style={{ fontSize: 12, fontWeight: "600", color: K.star }}>{rating}</Text>
      {count && <Text style={{ fontSize: 12, color: K.sub }}>({count})</Text>}
    </View>
  );
}

export function Progress({ value, height = 6 }: { value: number; height?: number }) {
  return (
    <View style={{ height, backgroundColor: "#E6EFEC", borderRadius: height, overflow: "hidden", flex: 1 }}>
      <LinearGradient
        colors={["#2BB39C", K.teal]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 0 }}
        style={{ width: `${value}%`, height: "100%", borderRadius: height }}
      />
    </View>
  );
}

export function Meta({ icon, text, color = K.sub }: { icon: IconName; text: string; color?: string }) {
  return (
    <View style={{ flexDirection: "row", alignItems: "center", gap: 5, marginTop: 3 }}>
      <Ionicons name={icon} size={12} color={color} />
      <Text style={{ fontSize: 11.5, color }} numberOfLines={1}>
        {text}
      </Text>
    </View>
  );
}

export function Tag({ text }: { text: string }) {
  return (
    <View style={s.tag}>
      <Text style={s.tagText}>{text}</Text>
    </View>
  );
}

export const s = StyleSheet.create({
  glow: { position: "absolute", opacity: 0.14 },
  ring: { position: "absolute", borderWidth: 1, borderColor: "rgba(255,255,255,0.15)" },
  dot: { position: "absolute", width: 4, height: 4, borderRadius: 2, backgroundColor: "rgba(255,255,255,0.55)" },
  header: { flexDirection: "row", alignItems: "center", paddingHorizontal: 16, paddingTop: 8, paddingBottom: 12 },
  h1: { fontSize: 26, fontWeight: "700", color: K.ink, letterSpacing: -0.3 },
  h2: { fontSize: 17, fontWeight: "700", color: K.ink },
  link: { fontSize: 13, fontWeight: "600", color: K.teal },
  sectionHead: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", marginTop: 22, marginBottom: 12 },
  search: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    height: 46,
    borderRadius: 14,
    paddingHorizontal: 14,
    backgroundColor: "#F3F6F5",
    borderWidth: 1,
    borderColor: K.line,
  },
  searchInput: { flex: 1, fontSize: 13, color: K.ink, paddingVertical: 0 },
  segments: { flexDirection: "row", gap: 8, marginBottom: 14 },
  segment: {
    flex: 1,
    height: 38,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#F1F5F4",
    paddingHorizontal: 6,
  },
  segmentOn: { backgroundColor: K.teal },
  segmentText: { fontSize: 12.5, color: "#41564F", fontWeight: "500" },
  chip: { paddingHorizontal: 14, height: 32, borderRadius: 16, borderWidth: 1, borderColor: K.line, justifyContent: "center", backgroundColor: "#fff" },
  chipText: { fontSize: 12, color: "#41564F", fontWeight: "500" },
  btn: { height: 54, borderRadius: 16, flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 8 },
  btnSm: { height: 34, borderRadius: 10, paddingHorizontal: 14 },
  btnText: { color: "#fff", fontSize: 16, fontWeight: "700" },
  pill: { alignSelf: "flex-start", paddingHorizontal: 16, height: 30, borderRadius: 15, alignItems: "center", justifyContent: "center", marginTop: 8 },
  pillText: { color: "#fff", fontSize: 12, fontWeight: "700" },
  tag: { backgroundColor: K.tint, borderRadius: 14, paddingHorizontal: 12, paddingVertical: 6 },
  tagText: { fontSize: 11.5, color: K.deep, fontWeight: "500" },
  card: { backgroundColor: "#fff", borderRadius: 16, borderWidth: 1, borderColor: K.line },
  row: { flexDirection: "row", gap: 12, paddingVertical: 12, borderBottomWidth: 1, borderBottomColor: "#F0F4F3" },
  rowTitle: { fontSize: 14, fontWeight: "700", color: K.ink, lineHeight: 19 },
  rowSub: { fontSize: 12, color: K.sub, marginTop: 2 },
});
