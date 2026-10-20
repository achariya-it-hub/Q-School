import { Pressable, StyleSheet, Text, View } from "react-native";
import { BRAND } from "@qschool/shared";
import { Card3D, Icon3D, tap } from "@/components/ui";

const C = BRAND.colors;

export type QuickAction = {
  glyph: string;
  label: string;
  onPress: () => void;
};

const DEFAULT_ACTIONS = (nav: {
  courses: () => void;
  profile: () => void;
  live: () => void;
}): QuickAction[] => [
  { glyph: "📚", label: "My courses", onPress: nav.courses },
  { glyph: "⬇️", label: "Downloads", onPress: nav.profile },
  { glyph: "🏆", label: "Certificates", onPress: nav.profile },
  { glyph: "💬", label: "Ask doubt", onPress: nav.live },
];

export { DEFAULT_ACTIONS };

/** Split-out quick actions row — four 3D tiles. */
export function QuickActions({
  actions,
  title = "Quick actions",
}: {
  actions?: QuickAction[];
  title?: string;
}) {
  const items =
    actions ??
    DEFAULT_ACTIONS({ courses: () => {}, profile: () => {}, live: () => {} });

  return (
    <View style={{ marginBottom: 22 }}>
      {title ? <Text style={styles.title}>{title}</Text> : null}
      <View style={styles.row}>
        {items.map((a) => (
          <Pressable
            key={a.label}
            style={{ flex: 1 }}
            onPress={() => {
              tap();
              a.onPress();
            }}
          >
            <Card3D style={styles.tile}>
              <Icon3D glyph={a.glyph} size={46} from={C.teal500} to={C.deep} />
              <Text style={styles.label} numberOfLines={2}>
                {a.label}
              </Text>
            </Card3D>
          </Pressable>
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  title: { fontSize: 18, fontWeight: "700", color: C.deep, marginBottom: 12 },
  row: { flexDirection: "row", gap: 10 },
  tile: { alignItems: "center", paddingVertical: 14, paddingHorizontal: 6 },
  label: {
    marginTop: 8,
    fontSize: 10.5,
    fontWeight: "700",
    color: C.deep,
    textAlign: "center",
  },
});
