import { StyleSheet, Text, View } from "react-native";
import { BRAND } from "@qschool/shared";
import { Card3D, GlossyButton, Icon3D, ProgressBar, tap } from "@/components/ui";

const C = BRAND.colors;

/** Split-out progress card — tucks under the hero banner as its own surface. */
export function ProgressCard({
  courseTitle,
  nextLesson,
  progress,
  modulesDone,
  modulesTotal,
  glyph = "🔬",
  onResume,
}: {
  courseTitle: string;
  nextLesson: string;
  progress: number;
  modulesDone: number;
  modulesTotal: number;
  glyph?: string;
  onResume?: () => void;
}) {
  return (
    <Card3D style={styles.card}>
      <View style={styles.row}>
        <Icon3D glyph={glyph} size={48} from="#3FC0DA" to="#0E937E" />

        <View style={{ flex: 1 }}>
          <Text style={styles.label}>CONTINUE WHERE YOU LEFT OFF</Text>
          <Text style={styles.title} numberOfLines={1}>
            {courseTitle}
          </Text>
          <Text style={styles.lesson} numberOfLines={1}>
            Up next · {nextLesson}
          </Text>
        </View>

        <View style={styles.pctBubble}>
          <Text style={styles.pctText}>{progress}%</Text>
        </View>
      </View>

      <View style={{ marginTop: 14 }}>
        <ProgressBar pct={progress} height={8} />
      </View>

      <View style={styles.footer}>
        <Text style={styles.footerText}>
          {modulesDone} of {modulesTotal} modules complete
        </Text>
        <View style={{ width: 116 }}>
          <GlossyButton
            title="Resume"
            icon="▶"
            size="sm"
            onPress={() => {
              tap();
              onResume?.();
            }}
          />
        </View>
      </View>
    </Card3D>
  );
}

const styles = StyleSheet.create({
  card: {
    marginTop: -34,
    marginHorizontal: 6,
    zIndex: 5,
  },
  row: { flexDirection: "row", alignItems: "center", gap: 12 },
  label: { fontSize: 9.5, letterSpacing: 0.8, fontWeight: "800", color: C.teal },
  title: { fontSize: 15, fontWeight: "700", color: C.deep, marginTop: 3 },
  lesson: { fontSize: 12, color: "#5c7772", marginTop: 1 },
  pctBubble: {
    backgroundColor: "#EAF6F3",
    borderRadius: 12,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderWidth: 1,
    borderColor: "#D7F0EB",
  },
  pctText: { color: C.teal, fontWeight: "800", fontSize: 13 },
  footer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginTop: 12,
  },
  footerText: { fontSize: 11.5, color: "#8aa39c", fontWeight: "600" },
});
