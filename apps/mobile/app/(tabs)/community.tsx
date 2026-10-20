import { useState } from "react";
import { Pressable, Text, TextInput, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { COMMUNITY_POSTS, STUDENT } from "@qschool/shared";
import { Avatar, Chips, K, Page, s } from "@/components/kit";

export default function Community() {
  const [f, setF] = useState(0);
  const [liked, setLiked] = useState<string[]>([]);

  return (
    <Page title="Community">
      <View style={[s.card, { flexDirection: "row", alignItems: "center", gap: 10, padding: 12 }]}>
        <Avatar name={STUDENT.name} size={38} />
        <TextInput placeholder="Share something with your peers..." placeholderTextColor="#8A9C97" style={{ flex: 1, fontSize: 13, color: K.ink }} />
        <Ionicons name="image-outline" size={21} color={K.teal} />
      </View>
      <View style={{ marginVertical: 14 }}>
        <Chips items={["For You", "Study Groups", "Projects", "Q&A"]} value={f} onChange={setF} />
      </View>

      {COMMUNITY_POSTS.map((p) => {
        const on = liked.includes(p.id);
        return (
          <View key={p.id} style={[s.card, { padding: 14, marginBottom: 12 }]}>
            <View style={{ flexDirection: "row", alignItems: "center", gap: 10 }}>
              <Avatar name={p.who} size={38} />
              <View style={{ flex: 1 }}>
                <Text style={{ fontWeight: "700", color: K.ink, fontSize: 13.5 }}>{p.who}</Text>
                <Text style={{ fontSize: 11, color: K.sub }}>{p.when}</Text>
              </View>
              <Ionicons name="ellipsis-horizontal" size={18} color={K.sub} />
            </View>
            <Text style={{ marginTop: 10, color: "#26403A", fontSize: 13.5, lineHeight: 20 }}>{p.text}</Text>
            <View style={{ flexDirection: "row", gap: 22, marginTop: 12 }}>
              <Pressable
                onPress={() => setLiked((v) => (on ? v.filter((x) => x !== p.id) : [...v, p.id]))}
                style={{ flexDirection: "row", alignItems: "center", gap: 6 }}
              >
                <Ionicons name={on ? "heart" : "heart-outline"} size={19} color={on ? K.red : K.sub} />
                <Text style={{ fontSize: 12, color: K.sub }}>{p.likes + (on ? 1 : 0)}</Text>
              </Pressable>
              <View style={{ flexDirection: "row", alignItems: "center", gap: 6 }}>
                <Ionicons name="chatbubble-outline" size={18} color={K.sub} />
                <Text style={{ fontSize: 12, color: K.sub }}>{p.replies}</Text>
              </View>
              <Ionicons name="share-social-outline" size={18} color={K.sub} />
            </View>
          </View>
        );
      })}
    </Page>
  );
}
