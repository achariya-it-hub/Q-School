import { useState } from "react";
import { Text, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { WEBINAR_LIST } from "@qschool/shared";
import { Art, K, Meta, Page, PillBtn, Segments, s } from "@/components/kit";

export default function Webinars() {
  const [tab, setTab] = useState(0);
  const [booked, setBooked] = useState<string[]>([]);
  const list = tab === 2 ? WEBINAR_LIST : WEBINAR_LIST.filter((w) => (tab === 1 ? w.recorded : !w.recorded));

  return (
    <Page title="Webinars" back>
      <Segments items={["Upcoming", "Recorded", "All Topics"]} value={tab} onChange={setTab} />
      {list.map((w) => {
        const on = booked.includes(w.id);
        return (
          <View key={w.id} style={s.row}>
            <Art art={w.art} style={{ width: 104, height: 92 }} size={36}>
              {w.recorded && (
                <View style={{ position: "absolute", width: 34, height: 34, borderRadius: 17, backgroundColor: "rgba(255,255,255,0.9)", alignItems: "center", justifyContent: "center" }}>
                  <Ionicons name="play" size={16} color={K.deep} style={{ marginLeft: 2 }} />
                </View>
              )}
            </Art>
            <View style={{ flex: 1 }}>
              <View style={{ flexDirection: "row" }}>
                <Text style={[s.rowTitle, { flex: 1 }]}>{w.title}</Text>
                <Ionicons name="ellipsis-vertical" size={16} color={K.ink} />
              </View>
              <Text style={[s.rowSub, { marginBottom: 1 }]}>By {w.by}</Text>
              <Meta icon="calendar-outline" text={`${w.date} • ${w.duration}`} />
              <Meta icon="people-outline" text={`${w.registered} ${w.recorded ? "Views" : "Registered"}`} />
              <PillBtn
                title={w.recorded ? "Watch" : on ? "Registered ✓" : "Register"}
                outline={on}
                onPress={() => !w.recorded && setBooked((v) => (on ? v.filter((x) => x !== w.id) : [...v, w.id]))}
              />
            </View>
          </View>
        );
      })}
    </Page>
  );
}
