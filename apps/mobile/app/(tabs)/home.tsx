import { Pressable, StyleSheet, Text, View } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { Ionicons } from "@expo/vector-icons";
import { useRouter, type Href } from "expo-router";
import { HUB, PROGRAMS, STUDENT, fmtCount, type HubKey } from "@qschool/shared";
import { Art, Avatar, K, Page, SearchBar, SectionHead, Stars, type IconName } from "@/components/kit";
import { tap } from "@/components/ui";

const HUB_ICON: Record<HubKey, IconName> = {
  courses: "book",
  live: "tv",
  workshops: "color-palette",
  webinars: "easel",
  offline: "business",
  certifications: "ribbon",
  assessments: "clipboard",
  community: "people",
};

const HUB_ROUTE: Record<HubKey, Href> = {
  courses: "/explore",
  live: "/live-class",
  workshops: "/workshops",
  webinars: "/webinars",
  offline: "/offline",
  certifications: "/certificates",
  assessments: "/learn",
  community: "/community",
};

export default function Home() {
  const router = useRouter();
  const rec = PROGRAMS[0];

  return (
    <Page>
      {/* Greeting */}
      <View style={st.top}>
        <Avatar name={STUDENT.name} size={46} />
        <View style={{ flex: 1 }}>
          <Text style={st.hi}>Hi, {STUDENT.firstName} 👋</Text>
          <Text style={st.hiSub}>Let&apos;s continue learning!</Text>
        </View>
        <Pressable hitSlop={8}>
          <Ionicons name="notifications" size={25} color={K.deep} />
          <View style={st.badge} />
        </Pressable>
      </View>

      <SearchBar placeholder="Search for courses, workshops, webinars..." scan />

      {/* Hero */}
      <LinearGradient colors={["#06473E", "#0B6E5F"]} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={st.hero}>
        <View style={st.heroGlow} />
        <View style={{ flex: 1, zIndex: 1 }}>
          <Text style={st.heroTitle}>Learn Anytime{"\n"}Grow Everywhere</Text>
          <Text style={st.heroSub}>Live Classes • Workshops{"\n"}Offline Classes • Certifications</Text>
          <Pressable onPress={() => router.push("/explore")} style={st.heroBtn}>
            <Text style={{ color: K.deep, fontWeight: "700", fontSize: 12.5 }}>Explore Courses</Text>
            <Ionicons name="arrow-forward" size={15} color={K.deep} />
          </Pressable>
        </View>
        <View style={st.heroArt}>
          <View style={st.heroRing} />
          <Ionicons name="school" size={58} color={K.mint} />
          <View style={st.heroChip}>
            <View style={{ width: 6, height: 6, borderRadius: 3, backgroundColor: "#FF5A5F" }} />
            <Text style={{ color: "#fff", fontSize: 10, fontWeight: "600" }}>245 live</Text>
          </View>
        </View>
      </LinearGradient>

      {/* Hub grid */}
      <View style={st.grid}>
        {HUB.map((h) => (
          <Pressable
            key={h.key}
            onPress={() => {
              tap();
              router.push(HUB_ROUTE[h.key]);
            }}
            style={({ pressed }) => [st.hubItem, pressed && { transform: [{ scale: 0.94 }] }]}
          >
            <LinearGradient colors={[h.from, h.to]} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={[st.hubIcon, { shadowColor: h.to }]}>
              <View style={st.gloss} />
              <Ionicons name={HUB_ICON[h.key]} size={24} color="#fff" />
            </LinearGradient>
            <Text style={st.hubLabel} numberOfLines={1}>
              {h.label}
            </Text>
          </Pressable>
        ))}
      </View>

      <SectionHead title="Recommended for You" cta="See All" onPress={() => router.push("/explore")} />
      {[rec, PROGRAMS[1]].map((p) => (
        <Pressable
          key={p.slug}
          onPress={() => router.push({ pathname: "/course/[slug]", params: { slug: p.slug } })}
          style={({ pressed }) => [st.recCard, pressed && { opacity: 0.9 }]}
        >
          <Art art={p.art} style={{ width: 96, height: 76 }} size={34} />
          <View style={{ flex: 1 }}>
            <View style={{ flexDirection: "row", gap: 6 }}>
              <Text style={[st.recTitle, { flex: 1 }]} numberOfLines={2}>
                {p.title}
              </Text>
              <Ionicons name="bookmark-outline" size={18} color={K.ink} />
            </View>
            <Text style={st.recSub}>{p.format}</Text>
            <Stars rating={p.rating} count={fmtCount(p.ratings)} />
          </View>
          <LinearGradient colors={["#0B6E5F", K.deep]} style={st.play}>
            <Ionicons name="play" size={16} color="#fff" style={{ marginLeft: 2 }} />
          </LinearGradient>
        </Pressable>
      ))}
    </Page>
  );
}

const st = StyleSheet.create({
  top: { flexDirection: "row", alignItems: "center", gap: 12, paddingTop: 8, paddingBottom: 14 },
  hi: { fontSize: 18, fontWeight: "700", color: K.ink },
  hiSub: { fontSize: 13, color: K.sub, marginTop: 1 },
  badge: { position: "absolute", right: 1, top: 1, width: 9, height: 9, borderRadius: 5, backgroundColor: K.red, borderWidth: 1.5, borderColor: "#fff" },
  hero: { marginTop: 14, borderRadius: 20, padding: 18, flexDirection: "row", overflow: "hidden", minHeight: 160 },
  heroGlow: { position: "absolute", right: -40, top: -30, width: 220, height: 220, borderRadius: 110, backgroundColor: "#2BD6B4", opacity: 0.18 },
  heroTitle: { color: "#fff", fontSize: 21, fontWeight: "800", lineHeight: 26 },
  heroSub: { color: "rgba(255,255,255,0.85)", fontSize: 11.5, marginTop: 8, lineHeight: 17 },
  heroBtn: {
    marginTop: 14,
    alignSelf: "flex-start",
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    backgroundColor: "#fff",
    paddingHorizontal: 14,
    height: 36,
    borderRadius: 10,
  },
  heroArt: { width: 110, alignItems: "center", justifyContent: "center" },
  heroRing: { position: "absolute", width: 104, height: 104, borderRadius: 52, borderWidth: 1, borderColor: "rgba(43,214,180,0.45)", backgroundColor: "rgba(255,255,255,0.06)" },
  heroChip: {
    position: "absolute",
    bottom: 4,
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 10,
    backgroundColor: "rgba(0,0,0,0.25)",
  },
  grid: { flexDirection: "row", flexWrap: "wrap", marginTop: 18, rowGap: 16 },
  hubItem: { width: "25%", alignItems: "center", gap: 7 },
  hubIcon: {
    width: 54,
    height: 54,
    borderRadius: 16,
    alignItems: "center",
    justifyContent: "center",
    overflow: "hidden",
    shadowOpacity: 0.35,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 5 },
    elevation: 5,
  },
  gloss: { position: "absolute", top: 0, left: 0, right: 0, height: "45%", backgroundColor: "rgba(255,255,255,0.18)" },
  hubLabel: { fontSize: 11, color: K.ink, fontWeight: "500" },
  recCard: { flexDirection: "row", alignItems: "center", gap: 12, marginBottom: 12 },
  recTitle: { fontSize: 14.5, fontWeight: "700", color: K.ink, lineHeight: 19 },
  recSub: { fontSize: 12, color: K.sub, marginVertical: 3 },
  play: { width: 40, height: 40, borderRadius: 20, alignItems: "center", justifyContent: "center" },
});
