import { useEffect, useRef, useState } from "react";
import { Animated, Pressable, StyleSheet, Text, View } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { BRAND } from "@qschool/shared";
import { Card3D, GlossyButton, Icon3D, ProgressBar, selectHaptic, tap } from "@/components/ui";

const C = BRAND.colors;

const TRACK_HEIGHT = 68;

type Test = { name: string; when: string };
type Certificate = { name: string; date: string };

/** Split-out stat tabs — a real segmented control, each segment shows its own panel. */
export function StatTabs({
  progress = 64,
  modulesDone = 3,
  modulesTotal = 5,
  lessonsWatched = 78,
  hours = 24,
  certificates = [
    { name: "Class 9 Science", date: "Aug 2026" },
    { name: "Python Basics", date: "Jun 2026" },
  ],
  tests = [
    { name: "Physics mock test", when: "Sat · 3:00 PM" },
    { name: "Maths weekly quiz", when: "Sun · 11:00 AM" },
    { name: "Science unit test", when: "Mon · 6:00 PM" },
  ],
  onAction,
}: {
  progress?: number;
  modulesDone?: number;
  modulesTotal?: number;
  lessonsWatched?: number;
  hours?: number;
  certificates?: Certificate[];
  tests?: Test[];
  onAction?: (key: string) => void;
}) {
  const [active, setActive] = useState(0);
  const [trackW, setTrackW] = useState(0);
  const slide = useRef(new Animated.Value(0)).current;
  const fade = useRef(new Animated.Value(1)).current;

  const TABS = [
    { key: "progress", glyph: "📈", value: `${progress}%`, label: "Progress" },
    { key: "certs", glyph: "🏆", value: `${certificates.length}`, label: "Certificates" },
    { key: "tests", glyph: "📝", value: `${tests.length}`, label: "Tests due" },
  ];

  useEffect(() => {
    Animated.spring(slide, {
      toValue: active,
      useNativeDriver: true,
      friction: 9,
      tension: 110,
    }).start();

    fade.setValue(0);
    Animated.timing(fade, { toValue: 1, duration: 240, useNativeDriver: true }).start();
  }, [active, slide, fade]);

  const itemW = trackW > 0 ? trackW / TABS.length : 0;

  return (
    <Card3D style={styles.card}>
      <View style={styles.track} onLayout={(e) => setTrackW(e.nativeEvent.layout.width)}>
        {itemW > 0 && (
          <Animated.View
            pointerEvents="none"
            style={[
              styles.pill,
              {
                width: itemW - 8,
                transform: [{ translateX: Animated.multiply(slide, itemW) }],
              },
            ]}
          >
            <LinearGradient
              colors={[C.teal500, C.teal]}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={styles.pillFill}
            >
              <View style={styles.pillGloss} />
            </LinearGradient>
          </Animated.View>
        )}

        {TABS.map((t, i) => {
          const on = i === active;
          return (
            <Pressable
              key={t.key}
              accessibilityRole="tab"
              accessibilityState={on ? { selected: true } : {}}
              accessibilityLabel={`${t.label}, ${t.value}`}
              onPress={() => {
                selectHaptic();
                setActive(i);
              }}
              style={styles.segment}
            >
              <Text style={styles.segGlyph}>{t.glyph}</Text>
              <Text style={[styles.segValue, on && styles.segOn]}>{t.value}</Text>
              <Text style={[styles.segLabel, on && styles.segOn]} numberOfLines={1}>
                {t.label}
              </Text>
            </Pressable>
          );
        })}
      </View>

      <Animated.View
        style={{
          opacity: fade,
          transform: [
            { translateY: fade.interpolate({ inputRange: [0, 1], outputRange: [8, 0] }) },
          ],
          marginTop: 14,
          minHeight: 132,
        }}
      >
        {active === 0 && (
          <View>
            <View style={styles.panelHead}>
              <Text style={styles.panelTitle}>Overall completion</Text>
              <Text style={styles.panelValue}>{progress}%</Text>
            </View>
            <ProgressBar pct={progress} height={8} />
            <Text style={styles.panelNote}>
              {modulesDone} of {modulesTotal} modules complete · on track for 18 Oct
            </Text>
            <View style={styles.chipRow}>
              <View style={styles.miniChip}>
                <Icon3D glyph="🎬" size={30} from="#3FC0DA" to="#0E6E8E" />
                <View style={{ marginLeft: 8 }}>
                  <Text style={styles.miniValue}>{lessonsWatched}</Text>
                  <Text style={styles.miniLabel}>lessons watched</Text>
                </View>
              </View>
              <View style={styles.miniChip}>
                <Icon3D glyph="⏱" size={30} from="#FFD98A" to="#E8A33D" />
                <View style={{ marginLeft: 8 }}>
                  <Text style={styles.miniValue}>{hours}h</Text>
                  <Text style={styles.miniLabel}>learning time</Text>
                </View>
              </View>
            </View>
          </View>
        )}

        {active === 1 && (
          <View>
            {certificates.map((c, i) => (
              <View key={c.name} style={[styles.listRow, i < certificates.length - 1 && styles.divider]}>
                <Icon3D glyph="🏅" size={34} from="#FFD98A" to="#E8A33D" />
                <View style={{ flex: 1, marginLeft: 10 }}>
                  <Text style={styles.listTitle}>{c.name}</Text>
                  <Text style={styles.listSub}>Issued {c.date}</Text>
                </View>
                <Text
                  style={styles.listAction}
                  onPress={() => {
                    tap();
                    onAction?.("share-certificate");
                  }}
                >
                  Share
                </Text>
              </View>
            ))}
            <View style={{ marginTop: 12 }}>
              <GlossyButton
                title="View all certificates"
                size="sm"
                variant="glass"
                onPress={() => onAction?.("certificates")}
              />
            </View>
          </View>
        )}

        {active === 2 && (
          <View>
            {tests.map((t, i) => (
              <View key={t.name} style={[styles.listRow, i < tests.length - 1 && styles.divider]}>
                <View style={styles.datePill}>
                  <Text style={styles.dateText}>{t.when.split("·")[0].trim()}</Text>
                </View>
                <View style={{ flex: 1, marginLeft: 10 }}>
                  <Text style={styles.listTitle}>{t.name}</Text>
                  <Text style={styles.listSub}>{t.when.split("·")[1]?.trim()}</Text>
                </View>
                <Text
                  style={styles.listAction}
                  onPress={() => {
                    tap();
                    onAction?.("start-test");
                  }}
                >
                  Start
                </Text>
              </View>
            ))}
            <View style={{ marginTop: 12 }}>
              <GlossyButton
                title="Practice now"
                icon="⚡"
                size="sm"
                onPress={() => onAction?.("practice")}
              />
            </View>
          </View>
        )}
      </Animated.View>
    </Card3D>
  );
}

const styles = StyleSheet.create({
  card: { padding: 12 },
  track: {
    height: TRACK_HEIGHT,
    flexDirection: "row",
    backgroundColor: "#F1F8F6",
    borderRadius: 18,
    padding: 4,
    borderWidth: 1,
    borderColor: "#E4EFEC",
  },
  pill: {
    position: "absolute",
    top: 4,
    left: 4,
    height: TRACK_HEIGHT - 8,
    borderRadius: 15,
    shadowColor: C.teal,
    shadowOpacity: 0.35,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 6 },
    elevation: 6,
  },
  pillFill: { flex: 1, borderRadius: 15, overflow: "hidden" },
  pillGloss: {
    position: "absolute",
    top: 2,
    left: 3,
    right: 3,
    height: 18,
    borderRadius: 12,
    backgroundColor: "rgba(255,255,255,0.22)",
  },
  segment: { flex: 1, alignItems: "center", justifyContent: "center", zIndex: 2 },
  segGlyph: { fontSize: 15 },
  segValue: { fontSize: 14, fontWeight: "800", color: C.deep, marginTop: 2 },
  segLabel: { fontSize: 9.5, fontWeight: "600", color: "#7E9A94", marginTop: 1 },
  segOn: { color: "#fff" },
  panelHead: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 10,
  },
  panelTitle: { fontSize: 13.5, fontWeight: "700", color: C.deep },
  panelValue: { fontSize: 14, fontWeight: "800", color: C.teal },
  panelNote: { fontSize: 11.5, color: "#7E9A94", marginTop: 8 },
  chipRow: { flexDirection: "row", gap: 10, marginTop: 12 },
  miniChip: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#F6FBF9",
    borderRadius: 14,
    padding: 8,
    borderWidth: 1,
    borderColor: "#E7F1EE",
  },
  miniValue: { fontSize: 13, fontWeight: "800", color: C.deep },
  miniLabel: { fontSize: 9.5, color: "#7E9A94" },
  listRow: { flexDirection: "row", alignItems: "center", paddingVertical: 9 },
  divider: { borderBottomWidth: 1, borderBottomColor: "#EEF5F3" },
  listTitle: { fontSize: 13.5, fontWeight: "700", color: C.deep },
  listSub: { fontSize: 11, color: "#7E9A94", marginTop: 1 },
  listAction: { fontSize: 12, fontWeight: "700", color: C.teal },
  datePill: {
    minWidth: 44,
    backgroundColor: "#EAF6F3",
    borderRadius: 10,
    paddingVertical: 7,
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#D7F0EB",
  },
  dateText: { fontSize: 11, fontWeight: "800", color: C.deep },
});
