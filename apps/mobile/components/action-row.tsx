import { useEffect, useRef } from "react";
import { Animated, Pressable, StyleSheet, Text, View } from "react-native";
import { BRAND } from "@qschool/shared";
import { GlassTile, GlossyButton, tap } from "@/components/ui";

const C = BRAND.colors;

/** Split-out action row — primary continue button plus the live-class shortcut. */
export function ActionRow({
  onContinue,
  onJoinLive,
  liveLabel = "Join live",
}: {
  onContinue?: () => void;
  onJoinLive?: () => void;
  liveLabel?: string;
}) {
  const pulse = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(pulse, { toValue: 1, duration: 900, useNativeDriver: true }),
        Animated.timing(pulse, { toValue: 0, duration: 900, useNativeDriver: true }),
      ]),
    ).start();
  }, [pulse]);

  return (
    <View style={styles.row}>
      <GlossyButton
        title="Continue learning"
        icon="▶"
        onPress={onContinue}
        style={{ flex: 1.35 }}
      />

      <Pressable style={{ flex: 1 }} onPress={() => { tap(); onJoinLive?.(); }}>
        <View style={styles.liveWrap}>
          <View pointerEvents="none" style={styles.liveShadow}>
            <GlassTile style={styles.liveTile}>
              <Animated.View
                style={[
                  styles.dot,
                  {
                    opacity: pulse.interpolate({ inputRange: [0, 1], outputRange: [0.35, 1] }),
                    transform: [
                      { scale: pulse.interpolate({ inputRange: [0, 1], outputRange: [0.85, 1.25] }) },
                    ],
                  },
                ]}
              />
              <Text style={styles.liveText}>{liveLabel}</Text>
            </GlassTile>
          </View>
        </View>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: "row", gap: 10, marginTop: 14, alignItems: "center" },
  liveWrap: { borderRadius: 16, overflow: "hidden" },
  liveShadow: {
    borderRadius: 16,
    backgroundColor: "rgba(5,64,56,0.08)",
    shadowColor: C.deep,
    shadowOpacity: 0.18,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 8 },
    elevation: 6,
  },
  liveTile: {
    height: 52,
    borderRadius: 16,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    padding: 0,
    backgroundColor: "rgba(5,64,56,0.06)",
    borderColor: "#CBDDD8",
  },
  dot: { width: 9, height: 9, borderRadius: 5, backgroundColor: "#E04E2F" },
  liveText: { color: C.deep, fontWeight: "700", fontSize: 14 },
});
