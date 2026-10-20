import { useState } from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { ENROLLMENTS, NEXT_LIVE, PROGRAMS, pct } from "@qschool/shared";
import { Art, K, Page, Progress, Segments, s } from "@/components/kit";

export default function MyLearning() {
  const router = useRouter();
  const [tab, setTab] = useState(0);
  const inProgress = ENROLLMENTS.filter((e) => e.status === "in-progress" && e.slug !== "python-for-kids");
  const completed = ENROLLMENTS.filter((e) => e.status === "completed");
  const list = tab === 0 ? inProgress : tab === 1 ? completed : [];

  return (
    <Page title="My Learning">
      <Segments items={[`In Progress (${inProgress.length})`, "Completed", "Bookmarks"]} value={tab} onChange={setTab} />

      {tab === 2 &&
        PROGRAMS.slice(0, 2).map((p) => (
          <Pressable key={p.slug} onPress={() => router.push({ pathname: "/course/[slug]", params: { slug: p.slug } })} style={s.row}>
            <Art art={p.art} style={{ width: 100, height: 72 }} size={32} />
            <View style={{ flex: 1, justifyContent: "center" }}>
              <Text style={s.rowTitle}>{p.title}</Text>
              <Text style={s.rowSub}>{p.format}</Text>
            </View>
            <Ionicons name="bookmark" size={19} color={K.teal} />
          </Pressable>
        ))}

      {list.map((e) => {
        const p = pct(e);
        return (
          <Pressable
            key={e.slug}
            onPress={() =>
              PROGRAMS.some((x) => x.slug === e.slug) && router.push({ pathname: "/course/[slug]", params: { slug: e.slug } })
            }
            style={s.row}
          >
            <Art art={e.art} style={{ width: 100, height: 76 }} size={34} />
            <View style={{ flex: 1 }}>
              <View style={{ flexDirection: "row" }}>
                <Text style={[s.rowTitle, { flex: 1 }]} numberOfLines={2}>
                  {e.title}
                </Text>
                <Ionicons name="ellipsis-vertical" size={16} color={K.ink} />
              </View>
              <View style={{ flexDirection: "row", alignItems: "center", gap: 8, marginTop: 12 }}>
                <Progress value={p} />
                <Text style={{ fontSize: 11.5, fontWeight: "700", color: K.teal }}>{p}%</Text>
              </View>
              <Text style={[s.rowSub, { marginTop: 4 }]}>
                {e.done}/{e.total} lessons
              </Text>
            </View>
          </Pressable>
        );
      })}

      {tab === 0 && (
        <View style={st.live}>
          <Art art={NEXT_LIVE.art} style={{ width: 64, height: 64 }} size={28}>
            <View style={st.liveTag}>
              <Text style={{ color: "#fff", fontSize: 9, fontWeight: "800" }}>LIVE</Text>
            </View>
          </Art>
          <View style={{ flex: 1 }}>
            <Text style={{ fontSize: 14, fontWeight: "700", color: K.ink }}>Upcoming Live Class</Text>
            <Text style={{ fontSize: 12.5, color: "#41564F", marginTop: 2 }} numberOfLines={1}>
              {NEXT_LIVE.title}
            </Text>
            <View style={{ flexDirection: "row", alignItems: "center", marginTop: 6 }}>
              <Text style={{ fontSize: 11, color: K.sub, flex: 1 }}>{NEXT_LIVE.when}</Text>
              <Pressable onPress={() => router.push("/live-class")}>
                <LinearGradient colors={["#0B6E5F", K.deep]} style={st.join}>
                  <Text style={{ color: "#fff", fontSize: 12, fontWeight: "700" }}>Join Now</Text>
                </LinearGradient>
              </Pressable>
            </View>
          </View>
        </View>
      )}
    </Page>
  );
}

const st = StyleSheet.create({
  live: {
    flexDirection: "row",
    gap: 12,
    padding: 12,
    marginTop: 16,
    borderRadius: 16,
    backgroundColor: K.soft,
    borderWidth: 1,
    borderColor: K.line,
  },
  liveTag: { position: "absolute", left: 4, bottom: 4, backgroundColor: K.red, borderRadius: 4, paddingHorizontal: 5, paddingVertical: 1 },
  join: { height: 30, borderRadius: 15, paddingHorizontal: 14, alignItems: "center", justifyContent: "center" },
});
