import { useState } from "react";
import { Pressable, Text, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { PROGRAMS, fmtCount, type Program } from "@qschool/shared";
import { Art, Chips, K, Page, SearchBar, Stars, s } from "@/components/kit";

const FILTERS: { label: string; match: (p: Program) => boolean }[] = [
  { label: "All", match: () => true },
  { label: "Courses", match: (p) => p.type === "course" },
  { label: "Live Classes", match: (p) => p.type === "live" || p.type === "webinar" },
  { label: "Workshops", match: (p) => p.type === "workshop" },
  { label: "Webinars", match: (p) => p.type === "webinar" },
];

const TYPE_LABEL = { course: "Course", workshop: "Workshop", webinar: "Webinar", live: "Live Class" };

function sub(p: Program) {
  if (p.lessons) return `${TYPE_LABEL[p.type]} • ${p.lessons} Lessons`;
  return `${TYPE_LABEL[p.type]} • ${p.duration}`;
}

export default function Explore() {
  const router = useRouter();
  const [f, setF] = useState(0);
  const [saved, setSaved] = useState<string[]>([]);
  const list = PROGRAMS.filter(FILTERS[f].match);

  return (
    <Page title="Explore">
      <SearchBar placeholder="Search courses, topics, instructors..." />
      <View style={{ marginTop: 14, marginBottom: 6 }}>
        <Chips items={FILTERS.map((x) => x.label)} value={f} onChange={setF} />
      </View>

      {list.map((p) => {
        const on = saved.includes(p.slug);
        return (
          <Pressable
            key={p.slug}
            onPress={() => router.push({ pathname: "/course/[slug]", params: { slug: p.slug } })}
            style={({ pressed }) => [s.row, pressed && { opacity: 0.85 }]}
          >
            <Art art={p.art} style={{ width: 112, height: 82 }} size={36}>
              {p.badge && (
                <View style={{ position: "absolute", left: 6, top: 6, backgroundColor: "#FFC845", borderRadius: 8, paddingHorizontal: 7, paddingVertical: 2 }}>
                  <Text style={{ fontSize: 10, fontWeight: "700", color: "#3D2A00" }}>{p.badge}</Text>
                </View>
              )}
            </Art>
            <View style={{ flex: 1 }}>
              <View style={{ flexDirection: "row", gap: 6 }}>
                <Text style={[s.rowTitle, { flex: 1 }]} numberOfLines={2}>
                  {p.title}
                </Text>
                <Pressable hitSlop={8} onPress={() => setSaved((v) => (on ? v.filter((x) => x !== p.slug) : [...v, p.slug]))}>
                  <Ionicons name={on ? "bookmark" : "bookmark-outline"} size={19} color={on ? K.teal : K.ink} />
                </Pressable>
              </View>
              <Text style={[s.rowSub, { marginBottom: 4 }]}>{sub(p)}</Text>
              <Stars rating={p.rating} count={fmtCount(p.ratings)} />
            </View>
          </Pressable>
        );
      })}
      {!list.length && <Text style={{ textAlign: "center", color: K.sub, marginTop: 40 }}>Nothing here yet — check back soon.</Text>}
    </Page>
  );
}
