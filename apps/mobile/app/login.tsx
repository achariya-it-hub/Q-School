import { useState } from "react";
import { Image, KeyboardAvoidingView, Platform, Pressable, ScrollView, StyleSheet, Text, TextInput, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Btn, K, type IconName } from "@/components/kit";

function Field({ icon, placeholder, secure }: { icon: IconName; placeholder: string; secure?: boolean }) {
  const [hidden, setHidden] = useState(true);
  return (
    <View style={st.field}>
      <Ionicons name={icon} size={19} color="#5E726D" />
      <TextInput
        placeholder={placeholder}
        placeholderTextColor="#8A9C97"
        secureTextEntry={secure && hidden}
        autoCapitalize="none"
        style={st.input}
      />
      {secure && (
        <Pressable onPress={() => setHidden((v) => !v)} hitSlop={8}>
          <Ionicons name={hidden ? "eye-outline" : "eye-off-outline"} size={19} color="#5E726D" />
        </Pressable>
      )}
    </View>
  );
}

export default function Login() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const [tab, setTab] = useState(0);
  const enter = () => router.replace("/home");

  return (
    <KeyboardAvoidingView style={{ flex: 1, backgroundColor: "#fff" }} behavior={Platform.OS === "ios" ? "padding" : undefined}>
      <ScrollView contentContainerStyle={{ paddingTop: insets.top + 36, paddingHorizontal: 24, paddingBottom: insets.bottom + 24 }}>
        <View style={{ alignItems: "center" }}>
          <Image source={require("../assets/logo.png")} style={{ width: 230, height: 90 }} resizeMode="contain" />
          <Text style={{ color: K.sub, fontSize: 12.5, marginTop: 6, letterSpacing: 0.4 }}>Learn   Grow   Apply   Excel</Text>
        </View>

        <View style={st.tabs}>
          {["Login", "Sign Up"].map((t, i) => (
            <Pressable key={t} onPress={() => setTab(i)} style={st.tab}>
              <Text style={[st.tabText, tab === i && { color: K.deep, fontWeight: "700" }]}>{t}</Text>
              <View style={[st.tabLine, tab === i && { backgroundColor: K.teal }]} />
            </Pressable>
          ))}
        </View>

        <View style={{ gap: 14 }}>
          {tab === 1 && <Field icon="person-outline" placeholder="Full Name" />}
          <Field icon="mail-outline" placeholder="Email or Mobile Number" />
          <Field icon="lock-closed-outline" placeholder="Password" secure />
        </View>

        {tab === 0 && (
          <Pressable style={{ alignSelf: "flex-end", marginTop: 12 }}>
            <Text style={{ color: K.teal, fontSize: 13, fontWeight: "600" }}>Forgot Password?</Text>
          </Pressable>
        )}

        <Btn title={tab === 0 ? "Login" : "Create Account"} onPress={enter} style={{ marginTop: 22 }} />

        <View style={st.orRow}>
          <View style={st.orLine} />
          <Text style={{ color: K.sub, fontSize: 13 }}>or continue with</Text>
          <View style={st.orLine} />
        </View>

        <View style={{ flexDirection: "row", justifyContent: "center", gap: 18 }}>
          {[
            { icon: "logo-google" as IconName, color: "#EA4335" },
            { icon: "logo-apple" as IconName, color: "#000" },
            { icon: "logo-facebook" as IconName, color: "#1877F2" },
          ].map((s) => (
            <Pressable key={s.icon} onPress={enter} style={({ pressed }) => [st.social, pressed && { backgroundColor: K.soft }]}>
              <Ionicons name={s.icon} size={26} color={s.color} />
            </Pressable>
          ))}
        </View>

        <Pressable onPress={() => setTab(tab === 0 ? 1 : 0)} style={{ alignItems: "center", marginTop: 34 }}>
          <Text style={{ color: "#41564F", fontSize: 13 }}>
            {tab === 0 ? "New to Q-School? " : "Already have an account? "}
            <Text style={{ color: K.teal, fontWeight: "700", textDecorationLine: "underline" }}>
              {tab === 0 ? "Create an account" : "Login"}
            </Text>
          </Text>
        </Pressable>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const st = StyleSheet.create({
  tabs: { flexDirection: "row", marginTop: 34, marginBottom: 22 },
  tab: { flex: 1, alignItems: "center" },
  tabText: { fontSize: 15, color: "#6B807B", fontWeight: "500", paddingBottom: 10 },
  tabLine: { height: 3, width: "70%", borderRadius: 2, backgroundColor: "transparent" },
  field: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    height: 54,
    borderRadius: 14,
    paddingHorizontal: 16,
    backgroundColor: "#F3F6F5",
    borderWidth: 1,
    borderColor: K.line,
  },
  input: { flex: 1, fontSize: 14, color: K.ink, paddingVertical: 0 },
  orRow: { flexDirection: "row", alignItems: "center", gap: 12, marginVertical: 26 },
  orLine: { flex: 1, height: 1, backgroundColor: K.line },
  social: {
    width: 58,
    height: 58,
    borderRadius: 29,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderColor: K.line,
    backgroundColor: "#fff",
  },
});
