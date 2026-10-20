import { useState } from "react";
import { StyleSheet, Text, View } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { Ionicons } from "@expo/vector-icons";
import { CERTIFICATES, ENROLLMENTS, pct } from "@qschool/shared";
import { K, Page, PillBtn, Progress, Segments, s } from "@/components/kit";

function CertThumb() {
  return (
    <LinearGradient colors={["#FFF4D6", "#F8DFA0"]} style={st.thumb}>
      <View style={st.inner}>
        <Ionicons name="ribbon" size={30} color="#C9861A" />
        <View style={st.line} />
        <View style={[st.line, { width: 26 }]} />
      </View>
    </LinearGradient>
  );
}

export default function Certificates() {
  const [tab, setTab] = useState(0);
  const inProgress = ENROLLMENTS.filter((e) => e.status === "in-progress");

  return (
    <Page title="Certificates" back>
      <Segments items={[`Earned (${CERTIFICATES.length})`, "In Progress"]} value={tab} onChange={setTab} />

      {tab === 0 &&
        CERTIFICATES.map((c, i) => (
          <View key={c.id} style={s.row}>
            <CertThumb />
            <View style={{ flex: 1 }}>
              <View style={{ flexDirection: "row" }}>
                <Text style={[s.rowTitle, { flex: 1 }]}>{c.title}</Text>
                <Ionicons name={i === 0 ? "bookmark-outline" : "ellipsis-vertical"} size={17} color={K.ink} />
              </View>
              <Text style={s.rowSub}>Completed on {c.completed}</Text>
              <PillBtn title="View Certificate" outline />
            </View>
          </View>
        ))}

      {tab === 1 &&
        inProgress.map((e) => (
          <View key={e.slug} style={s.row}>
            <View style={{ opacity: 0.55 }}>
              <CertThumb />
            </View>
            <View style={{ flex: 1, justifyContent: "center" }}>
              <Text style={s.rowTitle}>{e.title}</Text>
              <View style={{ flexDirection: "row", alignItems: "center", gap: 8, marginTop: 10 }}>
                <Progress value={pct(e)} />
                <Text style={{ fontSize: 11.5, fontWeight: "700", color: K.teal }}>{pct(e)}%</Text>
              </View>
              <Text style={[s.rowSub, { marginTop: 4 }]}>{e.total - e.done} lessons to unlock</Text>
            </View>
          </View>
        ))}
    </Page>
  );
}

const st = StyleSheet.create({
  thumb: { width: 92, height: 100, borderRadius: 10, padding: 6 },
  inner: { flex: 1, borderWidth: 1.5, borderColor: "#D9A441", borderRadius: 6, alignItems: "center", justifyContent: "center", gap: 5 },
  line: { width: 40, height: 3, borderRadius: 2, backgroundColor: "#E2B964" },
});
