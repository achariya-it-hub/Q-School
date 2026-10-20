import { useState } from "react";
import { Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { StatusBar } from "expo-status-bar";
import { PROGRAMS, findProgram, fmtCount } from "@qschool/shared";
import { Art, Avatar, Btn, K, Tag, type IconName } from "@/components/kit";

const TABS = ["Overview", "Curriculum", "Instructor", "Reviews"];

export default function CourseDetail() {
  const { slug } = useLocalSearchParams<{ slug: string }>();
  const p = findProgram(String(slug)) ?? PROGRAMS[0];
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const [tab, setTab] = useState(0);
  const [saved, setSaved] = useState(false);
  const isEvent = p.type === "workshop" || p.type === "webinar";

  const facts: { icon: IconName; text: string }[] = isEvent
    ? [
        { icon: "calendar-outline", text: p.date ?? "" },
        { icon: "time-outline", text: p.duration ?? "" },
        { icon: "ribbon-outline", text: "Certificate" },
      ]
    : [
        { icon: "book-outline", text: `${p.lessons} Lessons` },
        { icon: "time-outline", text: `${p.hours} Hours` },
        { icon: "ribbon-outline", text: "Certificate" },
      ];

  return (
    <View style={{ flex: 1, backgroundColor: "#fff" }}>
      <StatusBar style="light" />
      <ScrollView contentContainerStyle={{ paddingBottom: 110 }} showsVerticalScrollIndicator={false}>
        <Art art={p.art} radius={0} size={84} style={{ height: 270 + insets.top, paddingTop: insets.top }}>
          <View style={[st.topBar, { top: insets.top + 8 }]}>
            <Pressable onPress={() => (router.canGoBack() ? router.back() : router.replace("/home"))} style={st.round}>
              <Ionicons name="chevron-back" size={22} color="#fff" />
            </Pressable>
            <View style={{ flexDirection: "row", gap: 10 }}>
              <Pressable onPress={() => setSaved((v) => !v)} style={st.round}>
                <Ionicons name={saved ? "heart" : "heart-outline"} size={20} color={saved ? "#FF6B6B" : "#fff"} />
              </Pressable>
              <Pressable style={st.round}>
                <Ionicons name="share-social-outline" size={19} color="#fff" />
              </Pressable>
            </View>
          </View>
          <View style={st.play}>
            <Ionicons name="play" size={30} color={K.deep} style={{ marginLeft: 4 }} />
          </View>
          <View style={st.preview}>
            <Ionicons name="play-circle-outline" size={14} color="#fff" />
            <Text style={{ color: "#fff", fontSize: 11.5, fontWeight: "600" }}>Preview</Text>
          </View>
        </Art>

        <View style={st.body}>
          <View style={{ flexDirection: "row", gap: 10 }}>
            <Text style={st.title}>{p.title}</Text>
            <Ionicons name="bookmark-outline" size={22} color={K.ink} style={{ marginTop: 4 }} />
          </View>
          <View style={{ flexDirection: "row", alignItems: "center", gap: 5, marginTop: 8 }}>
            <Ionicons name="star" size={15} color={K.star} />
            <Text style={{ fontWeight: "700", color: K.star }}>{p.rating}</Text>
            <Text style={{ color: K.sub, fontSize: 13 }}>({fmtCount(p.ratings)} ratings)</Text>
          </View>

          <View style={st.facts}>
            {facts.map((f) => (
              <View key={f.text} style={{ flexDirection: "row", alignItems: "center", gap: 6 }}>
                <Ionicons name={f.icon} size={16} color={K.deep} />
                <Text style={{ fontSize: 12.5, color: "#41564F" }}>{f.text}</Text>
              </View>
            ))}
          </View>

          <View style={st.tabs}>
            {TABS.map((t, i) => (
              <Pressable key={t} onPress={() => setTab(i)} style={{ alignItems: "center" }}>
                <Text style={[st.tab, tab === i && { color: K.teal, fontWeight: "700" }]}>{t}</Text>
                <View style={[st.tabLine, tab === i && { backgroundColor: K.teal }]} />
              </Pressable>
            ))}
          </View>

          {tab === 0 && (
            <>
              <Text style={st.para}>{p.overview}</Text>
              <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 8, marginTop: 14 }}>
                {p.tags.map((t) => (
                  <Tag key={t} text={t} />
                ))}
              </View>
              <Text style={st.h3}>What you&apos;ll learn</Text>
              {p.learn.map((l) => (
                <View key={l} style={{ flexDirection: "row", alignItems: "center", gap: 10, marginBottom: 10 }}>
                  <Ionicons name="checkmark-circle" size={20} color={K.teal} />
                  <Text style={{ fontSize: 13.5, color: "#26403A", flex: 1 }}>{l}</Text>
                </View>
              ))}
            </>
          )}

          {tab === 1 &&
            p.curriculum.map((c, i) => (
              <View key={c} style={st.lesson}>
                <View style={st.num}>
                  <Text style={{ color: K.deep, fontWeight: "700", fontSize: 12 }}>{i + 1}</Text>
                </View>
                <Text style={{ flex: 1, fontSize: 14, color: K.ink, fontWeight: "500" }}>{c}</Text>
                <Ionicons name={i === 0 ? "play-circle" : "lock-closed-outline"} size={20} color={i === 0 ? K.teal : "#9AABA6"} />
              </View>
            ))}

          {tab === 2 && (
            <View style={{ flexDirection: "row", alignItems: "center", gap: 12 }}>
              <Avatar name={p.instructor} size={56} />
              <View>
                <Text style={{ fontSize: 16, fontWeight: "700", color: K.ink }}>{p.instructor}</Text>
                <Text style={{ color: K.sub, fontSize: 12.5, marginTop: 2 }}>Lead Instructor • 8 yrs teaching</Text>
              </View>
            </View>
          )}

          {tab === 3 &&
            [
              ["Riya", "Loved the projects — my favourite course this term!"],
              ["Aarav", "Clear explanations and fun activities."],
            ].map(([n, t]) => (
              <View key={n} style={{ flexDirection: "row", gap: 10, marginBottom: 16 }}>
                <Avatar name={n} size={36} />
                <View style={{ flex: 1 }}>
                  <Text style={{ fontWeight: "700", color: K.ink }}>{n}</Text>
                  <View style={{ flexDirection: "row", marginVertical: 3 }}>
                    {[0, 1, 2, 3, 4].map((k) => (
                      <Ionicons key={k} name="star" size={12} color={K.star} />
                    ))}
                  </View>
                  <Text style={{ color: "#41564F", fontSize: 13 }}>{t}</Text>
                </View>
              </View>
            ))}
        </View>
      </ScrollView>

      <View style={[st.cta, { paddingBottom: insets.bottom + 12 }]}>
        <Btn title={isEvent ? "Register Now" : "Enroll Now"} onPress={() => router.push("/learn")} />
      </View>
    </View>
  );
}

const st = StyleSheet.create({
  topBar: { position: "absolute", left: 16, right: 16, flexDirection: "row", justifyContent: "space-between" },
  round: { width: 38, height: 38, borderRadius: 19, backgroundColor: "rgba(0,0,0,0.25)", alignItems: "center", justifyContent: "center" },
  play: {
    position: "absolute",
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: "rgba(255,255,255,0.92)",
    alignItems: "center",
    justifyContent: "center",
  },
  preview: {
    position: "absolute",
    right: 14,
    bottom: 32,
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
    backgroundColor: "rgba(0,0,0,0.45)",
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 12,
  },
  body: { marginTop: -20, backgroundColor: "#fff", borderTopLeftRadius: 24, borderTopRightRadius: 24, padding: 18 },
  title: { flex: 1, fontSize: 23, fontWeight: "800", color: K.ink, lineHeight: 29 },
  facts: { flexDirection: "row", justifyContent: "space-between", marginTop: 16, paddingVertical: 12, borderTopWidth: 1, borderBottomWidth: 1, borderColor: "#F0F4F3" },
  tabs: { flexDirection: "row", justifyContent: "space-between", marginTop: 16, marginBottom: 14 },
  tab: { fontSize: 13.5, color: K.sub, paddingBottom: 8 },
  tabLine: { height: 2.5, width: 28, borderRadius: 2, backgroundColor: "transparent" },
  para: { fontSize: 13.5, color: "#41564F", lineHeight: 21 },
  h3: { fontSize: 16, fontWeight: "700", color: K.ink, marginTop: 20, marginBottom: 12 },
  lesson: { flexDirection: "row", alignItems: "center", gap: 12, paddingVertical: 13, borderBottomWidth: 1, borderBottomColor: "#F0F4F3" },
  num: { width: 30, height: 30, borderRadius: 10, backgroundColor: K.tint, alignItems: "center", justifyContent: "center" },
  cta: { position: "absolute", left: 0, right: 0, bottom: 0, paddingHorizontal: 18, paddingTop: 12, backgroundColor: "#fff", borderTopWidth: 1, borderTopColor: "#F0F4F3" },
});
