import { useState } from "react";
import { Pressable, Text, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { CENTERS } from "@qschool/shared";
import { Art, K, Page, PillBtn, Segments, s } from "@/components/kit";

export default function OfflineClasses() {
  const [tab, setTab] = useState(0);
  const [open, setOpen] = useState<string | null>(null);

  return (
    <Page title="Offline Classes" back>
      <Segments items={["Nearby", "All Locations"]} value={tab} onChange={setTab} />
      {CENTERS.map((c) => (
        <View key={c.id} style={s.row}>
          <Art art="building" style={{ width: 104, height: 96 }} size={38} />
          <View style={{ flex: 1 }}>
            <Pressable onPress={() => setOpen(open === c.id ? null : c.id)} style={{ flexDirection: "row", alignItems: "flex-start" }}>
              <View style={{ flex: 1 }}>
                <Text style={s.rowTitle}>{c.name}</Text>
                <Text style={s.rowSub}>
                  {c.area}, {c.city}
                </Text>
              </View>
              <Ionicons name={open === c.id ? "chevron-down" : "chevron-forward"} size={18} color={K.ink} />
            </Pressable>
            <View style={{ flexDirection: "row", gap: 6, marginTop: 8 }}>
              {c.batches.map((b) => (
                <View key={b} style={{ backgroundColor: "#F1F5F4", borderRadius: 6, paddingHorizontal: 7, paddingVertical: 3 }}>
                  <Text style={{ fontSize: 10.5, color: "#41564F" }}>{b}</Text>
                </View>
              ))}
            </View>
            {open === c.id && (
              <Text style={{ fontSize: 12, color: K.sub, marginTop: 8, lineHeight: 18 }}>
                Mon–Fri 4–7 PM • Sat–Sun 9 AM–1 PM{"\n"}Labs: Robotics, Art studio, Library
              </Text>
            )}
            <PillBtn title="View Details" onPress={() => setOpen(open === c.id ? null : c.id)} />
          </View>
        </View>
      ))}
    </Page>
  );
}
