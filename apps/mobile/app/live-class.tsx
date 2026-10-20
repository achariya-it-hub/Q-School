import { useState } from "react";
import { FlatList, KeyboardAvoidingView, Platform, Pressable, StyleSheet, Text, TextInput, View } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { StatusBar } from "expo-status-bar";
import { LIVE_SESSION, STUDENT } from "@qschool/shared";
import { Avatar, K, type IconName } from "@/components/kit";
import { tap } from "@/components/ui";

const TABS = ["Chat", `Participants (${LIVE_SESSION.viewers})`, "Q&A", "Polls"];
const ACTIONS: { icon: IconName; label: string }[] = [
  { icon: "hand-left-outline", label: "Raise Hand" },
  { icon: "help-circle-outline", label: "Question" },
  { icon: "happy-outline", label: "Reaction" },
  { icon: "ellipsis-horizontal-circle-outline", label: "More" },
];

export default function LiveClass() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const [tab, setTab] = useState(0);
  const [paused, setPaused] = useState(false);
  const [hand, setHand] = useState(false);
  const [msg, setMsg] = useState("");
  const [chat, setChat] = useState(LIVE_SESSION.chat);

  const send = () => {
    if (!msg.trim()) return;
    tap();
    setChat((c) => [...c, { who: STUDENT.firstName, time: "10:05 AM", text: msg.trim() }]);
    setMsg("");
  };

  return (
    <KeyboardAvoidingView style={{ flex: 1, backgroundColor: K.deeper }} behavior={Platform.OS === "ios" ? "padding" : undefined}>
      <StatusBar style="light" />
      <View style={{ paddingTop: insets.top, backgroundColor: K.deeper }}>
        <View style={st.header}>
          <Pressable onPress={() => (router.canGoBack() ? router.back() : router.replace("/home"))} hitSlop={8}>
            <Ionicons name="chevron-back" size={24} color="#fff" />
          </Pressable>
          <Text style={st.headerTitle}>Live Class</Text>
          <Ionicons name="ellipsis-vertical" size={20} color="#fff" />
        </View>

        {/* Video stage */}
        <LinearGradient colors={["#1E5A52", "#0A3A33"]} style={st.video}>
          <View style={st.stageGlow} />
          <Avatar name={LIVE_SESSION.host} size={96} />
          <Text style={{ color: "#fff", marginTop: 10, fontWeight: "600" }}>{LIVE_SESSION.host}</Text>
          <Text style={{ color: "rgba(255,255,255,0.7)", fontSize: 12 }}>{LIVE_SESSION.title}</Text>
          <View style={st.liveRow}>
            <View style={st.live}>
              <Text style={{ color: "#fff", fontSize: 11, fontWeight: "800" }}>LIVE</Text>
            </View>
            <View style={st.viewers}>
              <Ionicons name="people" size={12} color="#fff" />
              <Text style={{ color: "#fff", fontSize: 11, fontWeight: "700" }}>{LIVE_SESSION.viewers}</Text>
            </View>
          </View>
          <View style={st.controls}>
            <Pressable onPress={() => setPaused((v) => !v)} hitSlop={6}>
              <Ionicons name={paused ? "play" : "pause"} size={18} color="#fff" />
            </Pressable>
            <Ionicons name="volume-high" size={18} color="#fff" />
            <View style={st.track}>
              <View style={st.trackFill} />
            </View>
            <Ionicons name="expand" size={17} color="#fff" />
          </View>
        </LinearGradient>
      </View>

      <View style={st.sheet}>
        <View style={st.tabs}>
          {TABS.map((t, i) => (
            <Pressable key={t} onPress={() => setTab(i)} style={{ alignItems: "center" }}>
              <Text style={[st.tab, tab === i && { color: K.teal, fontWeight: "700" }]}>{t}</Text>
              <View style={[st.tabLine, tab === i && { backgroundColor: K.teal }]} />
            </Pressable>
          ))}
        </View>

        {tab === 0 ? (
          <FlatList
            data={chat}
            keyExtractor={(_, i) => String(i)}
            contentContainerStyle={{ padding: 16, gap: 14 }}
            renderItem={({ item }) => (
              <View style={{ flexDirection: "row", gap: 10 }}>
                <Avatar name={item.who} size={34} />
                <View style={{ flex: 1 }}>
                  <Text style={{ fontWeight: "700", color: item.who === "Instructor" ? K.teal : K.ink, fontSize: 13 }}>
                    {item.who} <Text style={{ fontWeight: "400", color: K.sub, fontSize: 11 }}>{item.time}</Text>
                  </Text>
                  <Text style={{ color: "#26403A", fontSize: 13, marginTop: 1 }}>{item.text}</Text>
                </View>
              </View>
            )}
          />
        ) : (
          <View style={{ flex: 1, alignItems: "center", justifyContent: "center" }}>
            <Ionicons name={tab === 1 ? "people-outline" : tab === 2 ? "help-buoy-outline" : "bar-chart-outline"} size={36} color="#B6C6C1" />
            <Text style={{ color: K.sub, marginTop: 8 }}>{tab === 1 ? `${LIVE_SESSION.viewers} learners in class` : "Nothing yet"}</Text>
          </View>
        )}

        <View style={st.inputRow}>
          <TextInput
            value={msg}
            onChangeText={setMsg}
            onSubmitEditing={send}
            placeholder="Type a message..."
            placeholderTextColor="#8A9C97"
            style={st.input}
          />
          <Pressable onPress={send} style={st.send}>
            <Ionicons name="send" size={18} color="#fff" />
          </Pressable>
        </View>
      </View>

      <View style={[st.actions, { paddingBottom: insets.bottom + 10 }]}>
        {ACTIONS.map((a, i) => {
          const on = i === 0 && hand;
          return (
            <Pressable
              key={a.label}
              onPress={() => {
                tap();
                if (i === 0) setHand((v) => !v);
              }}
              style={{ alignItems: "center", gap: 4, flex: 1 }}
            >
              <Ionicons name={on ? "hand-left" : a.icon} size={23} color={on ? K.mint : "#fff"} />
              <Text style={{ color: on ? K.mint : "rgba(255,255,255,0.85)", fontSize: 11 }}>{a.label}</Text>
            </Pressable>
          );
        })}
      </View>
    </KeyboardAvoidingView>
  );
}

const st = StyleSheet.create({
  header: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", paddingHorizontal: 16, paddingVertical: 10 },
  headerTitle: { color: "#fff", fontSize: 17, fontWeight: "700" },
  video: { height: 250, alignItems: "center", justifyContent: "center", overflow: "hidden" },
  stageGlow: { position: "absolute", width: 260, height: 260, borderRadius: 130, backgroundColor: "#2BD6B4", opacity: 0.12 },
  liveRow: { position: "absolute", top: 12, right: 12, flexDirection: "row", gap: 6 },
  live: { backgroundColor: K.red, borderRadius: 6, paddingHorizontal: 8, paddingVertical: 3 },
  viewers: { flexDirection: "row", alignItems: "center", gap: 4, backgroundColor: "rgba(0,0,0,0.4)", borderRadius: 6, paddingHorizontal: 8, paddingVertical: 3 },
  controls: { position: "absolute", left: 14, right: 14, bottom: 12, flexDirection: "row", alignItems: "center", gap: 14 },
  track: { flex: 1, height: 3, borderRadius: 2, backgroundColor: "rgba(255,255,255,0.3)" },
  trackFill: { width: "40%", height: "100%", borderRadius: 2, backgroundColor: "#fff" },
  sheet: { flex: 1, backgroundColor: "#fff" },
  tabs: { flexDirection: "row", justifyContent: "space-around", paddingTop: 12, borderBottomWidth: 1, borderBottomColor: "#F0F4F3" },
  tab: { fontSize: 12.5, color: K.sub, paddingBottom: 8 },
  tabLine: { height: 2.5, width: 26, borderRadius: 2, backgroundColor: "transparent" },
  inputRow: { flexDirection: "row", alignItems: "center", gap: 10, paddingHorizontal: 16, paddingVertical: 10, borderTopWidth: 1, borderTopColor: "#F0F4F3" },
  input: { flex: 1, height: 44, borderRadius: 22, paddingHorizontal: 16, backgroundColor: "#F3F6F5", fontSize: 13, color: K.ink },
  send: { width: 44, height: 44, borderRadius: 22, backgroundColor: K.deep, alignItems: "center", justifyContent: "center" },
  actions: { flexDirection: "row", paddingTop: 12, backgroundColor: K.deeper },
});
