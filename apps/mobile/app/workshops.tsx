import { useState } from "react";
import { Text, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { WORKSHOPS } from "@qschool/shared";
import { Art, K, Meta, Page, PillBtn, Segments, s } from "@/components/kit";

export default function Workshops() {
  const [tab, setTab] = useState(0);
  const [booked, setBooked] = useState<string[]>([]);
  const list = WORKSHOPS.filter((w) => (tab === 1 ? w.past : !w.past));

  return (
    <Page title="Workshops" back>
      <Segments items={["Upcoming", "Past", "All Categories"]} value={tab} onChange={setTab} />
      {(tab === 2 ? WORKSHOPS : list).map((w) => {
        const on = booked.includes(w.id);
        return (
          <View key={w.id} style={s.row}>
            <Art art={w.art} style={{ width: 104, height: 92 }} size={36} />
            <View style={{ flex: 1 }}>
              <View style={{ flexDirection: "row" }}>
                <Text style={[s.rowTitle, { flex: 1 }]}>{w.title}</Text>
                <Ionicons name="ellipsis-vertical" size={16} color={K.ink} />
              </View>
              <Meta icon="time-outline" text={`${w.days} • ${w.mode}`} />
              <Meta icon={w.city ? "location-outline" : "calendar-outline"} text={w.city ?? w.date} />
              {w.city && <Meta icon="calendar-outline" text={w.date} />}
              {w.seatsLeft && <Meta icon="people-outline" text={`${w.seatsLeft} Seats Left`} color={K.red} />}
              {!w.past && (
                <PillBtn
                  title={on ? "Registered ✓" : "Register"}
                  outline={on}
                  onPress={() => setBooked((v) => (on ? v.filter((x) => x !== w.id) : [...v, w.id]))}
                />
              )}
            </View>
          </View>
        );
      })}
    </Page>
  );
}
