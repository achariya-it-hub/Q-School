import { Pressable, StyleSheet, Text, View } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { Ionicons } from "@expo/vector-icons";
import { useRouter, type Href } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { ScrollView } from "react-native";
import { StatusBar } from "expo-status-bar";
import { STUDENT } from "@qschool/shared";
import { Avatar, K, type IconName } from "@/components/kit";

const MENU: { icon: IconName; label: string; to?: Href }[] = [
  { icon: "calendar-outline", label: "My Bookings", to: "/workshops" },
  { icon: "location-outline", label: "My Offline Classes", to: "/offline" },
  { icon: "clipboard-outline", label: "Assessments & Quiz", to: "/learn" },
  { icon: "card-outline", label: "Payments & Invoices" },
  { icon: "help-circle-outline", label: "Help & Support" },
  { icon: "settings-outline", label: "Settings" },
  { icon: "information-circle-outline", label: "About Q-School" },
];

export default function Profile() {
  const router = useRouter();
  const insets = useSafeAreaInsets();

  return (
    <View style={{ flex: 1, backgroundColor: "#fff" }}>
      <StatusBar style="light" />
      <ScrollView contentContainerStyle={{ paddingBottom: 120 }} showsVerticalScrollIndicator={false}>
        <LinearGradient colors={["#06473E", "#0B6E5F"]} style={[st.head, { paddingTop: insets.top + 22 }]}>
          <View style={st.headGlow} />
          <Avatar name={STUDENT.name} size={64} ring />
          <View style={{ flex: 1 }}>
            <Text style={st.name}>{STUDENT.name}</Text>
            <Text style={st.mail}>{STUDENT.email}</Text>
          </View>
          <Pressable style={st.edit}>
            <Text style={{ color: "#fff", fontSize: 12.5, fontWeight: "600" }}>Edit</Text>
          </Pressable>
        </LinearGradient>

        <View style={st.stats}>
          {[
            [STUDENT.enrolled, "Courses"],
            [STUDENT.certificates, "Certificates"],
            [STUDENT.hours, "Hours"],
          ].map(([n, l], i) => (
            <Pressable
              key={l}
              onPress={() => router.push(i === 1 ? "/certificates" : "/learn")}
              style={[st.stat, i > 0 && { borderLeftWidth: 1, borderLeftColor: "#F1E3C4" }]}
            >
              <Text style={st.statN}>{n}</Text>
              <Text style={st.statL}>{l}</Text>
            </Pressable>
          ))}
        </View>

        <View style={{ paddingHorizontal: 16, marginTop: 8 }}>
          {MENU.map((m) => (
            <Pressable
              key={m.label}
              onPress={() => m.to && router.push(m.to)}
              style={({ pressed }) => [st.item, pressed && { backgroundColor: K.soft }]}
            >
              <Ionicons name={m.icon} size={21} color={K.deep} />
              <Text style={st.itemText}>{m.label}</Text>
              <Ionicons name="chevron-forward" size={18} color="#9AABA6" />
            </Pressable>
          ))}
          <Pressable onPress={() => router.replace("/login")} style={[st.item, { borderBottomWidth: 0 }]}>
            <Ionicons name="log-out-outline" size={21} color={K.red} />
            <Text style={[st.itemText, { color: K.red }]}>Log out</Text>
          </Pressable>
        </View>
      </ScrollView>
    </View>
  );
}

const st = StyleSheet.create({
  head: {
    flexDirection: "row",
    alignItems: "center",
    gap: 14,
    paddingHorizontal: 18,
    paddingBottom: 54,
    borderBottomLeftRadius: 26,
    borderBottomRightRadius: 26,
    overflow: "hidden",
  },
  headGlow: { position: "absolute", right: -60, top: -40, width: 220, height: 220, borderRadius: 110, backgroundColor: "#2BD6B4", opacity: 0.15 },
  name: { color: "#fff", fontSize: 19, fontWeight: "700" },
  mail: { color: "rgba(255,255,255,0.8)", fontSize: 12.5, marginTop: 2 },
  edit: { borderWidth: 1, borderColor: "rgba(255,255,255,0.6)", borderRadius: 10, paddingHorizontal: 16, paddingVertical: 7 },
  stats: {
    flexDirection: "row",
    marginHorizontal: 16,
    marginTop: -34,
    backgroundColor: "#FFF6E3",
    borderRadius: 18,
    paddingVertical: 16,
    borderWidth: 1,
    borderColor: "#F6E6C2",
    shadowColor: "#054038",
    shadowOpacity: 0.08,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 4 },
    elevation: 3,
  },
  stat: { flex: 1, alignItems: "center" },
  statN: { fontSize: 22, fontWeight: "800", color: K.ink },
  statL: { fontSize: 11.5, color: K.sub, marginTop: 2 },
  item: { flexDirection: "row", alignItems: "center", gap: 14, paddingVertical: 15, paddingHorizontal: 4, borderBottomWidth: 1, borderBottomColor: "#F0F4F3" },
  itemText: { flex: 1, fontSize: 14.5, color: K.ink },
});
