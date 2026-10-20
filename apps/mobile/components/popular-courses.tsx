import { Pressable, StyleSheet, Text, View } from "react-native";
import { BRAND, COURSES, formatINR, type Course } from "@qschool/shared";
import { Card3D, GlossyButton, Icon3D, SectionTitle, tap } from "@/components/ui";
import { styleFor } from "@/components/course-style";

const C = BRAND.colors;
const RANKS = ["🥇", "🥈", "🥉", "#4", "#5"];

const byPopularity = (list: Course[], take: number): Course[] =>
  [...list].sort((a, b) => b.learners - a.learners).slice(0, take);

/** Split-out popular courses — ranked by enrolment. */
export function PopularCourses({
  courses = byPopularity(COURSES, 4),
  onOpen,
  onSeeAll,
}: {
  courses?: Course[];
  onOpen: (slug: string) => void;
  onSeeAll?: () => void;
}) {
  return (
    <View>
      <SectionTitle title="Popular courses" action="See all" onAction={onSeeAll} />

      {courses.map((c, i) => {
        const s = styleFor(c.category);
        return (
          <Pressable
            key={c.id}
            onPress={() => {
              tap();
              onOpen(c.slug);
            }}
          >
            <Card3D style={styles.card}>
              <View style={styles.row}>
                <View>
                  <Icon3D glyph={s.glyph} size={52} from={s.from} to={s.to} />
                  <View style={styles.rankBadge}>
                    <Text style={styles.rankText}>{RANKS[i] ?? `#${i + 1}`}</Text>
                  </View>
                </View>

                <View style={{ flex: 1 }}>
                  <View style={styles.titleRow}>
                    <Text numberOfLines={1} style={styles.title}>
                      {c.title}
                    </Text>
                    {i === 0 ? (
                      <View style={styles.hotTag}>
                        <Text style={styles.hotText}>🔥 #1</Text>
                      </View>
                    ) : null}
                  </View>
                  <Text style={styles.meta}>
                    ★ {c.rating} · {c.learners.toLocaleString("en-IN")} learners
                  </Text>
                  <Text style={styles.metaSub}>
                    {c.lessons} lessons · {c.durationHours}h
                  </Text>
                </View>

                <View style={styles.rightCol}>
                  <Text style={styles.price}>{formatINR(c.price)}</Text>
                  <View style={{ width: 84 }}>
                    <GlossyButton title="Enroll" size="sm" onPress={() => onOpen(c.slug)} />
                  </View>
                </View>
              </View>
            </Card3D>
          </Pressable>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  card: { marginBottom: 12 },
  row: { flexDirection: "row", alignItems: "center", gap: 14 },
  rankBadge: {
    position: "absolute",
    top: -6,
    left: -6,
    minWidth: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: "#fff",
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 3,
    shadowColor: C.deep,
    shadowOpacity: 0.2,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 3 },
    elevation: 4,
  },
  rankText: { fontSize: 12, fontWeight: "800", color: C.deep },
  titleRow: { flexDirection: "row", alignItems: "center", gap: 6 },
  title: { fontSize: 14.5, fontWeight: "700", color: C.deep, flexShrink: 1 },
  hotTag: { backgroundColor: "#FFECE5", borderRadius: 999, paddingHorizontal: 6, paddingVertical: 2 },
  hotText: { fontSize: 9.5, fontWeight: "800", color: "#D2452A" },
  meta: { fontSize: 11.5, color: "#5c7772", marginTop: 3 },
  metaSub: { fontSize: 11, color: "#8aa39c", marginTop: 2 },
  rightCol: { alignItems: "flex-end", gap: 8 },
  price: { fontSize: 15, fontWeight: "800", color: C.teal },
});
