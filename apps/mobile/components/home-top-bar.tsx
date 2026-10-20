import { Image, Pressable, StyleSheet, Text, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { BRAND } from "@qschool/shared";
import { tap } from "@/components/ui";

const C = BRAND.colors;

/** Split top bar — sits above the hero banner as its own surface. */
export function HomeTopBar({
  name,
  subtitle = "Ready for today's class?",
  notifications = 2,
  streak,
  onBell,
}: {
  name: string;
  subtitle?: string;
  notifications?: number;
  streak?: number;
  onBell?: () => void;
}) {
  return (
    <View style={styles.bar}>
      <View style={styles.logoTile}>
        <Image
          source={require("../assets/icon.png")}
          style={{ width: "100%", height: "100%" }}
          resizeMode="cover"
        />
      </View>

      <View style={{ flex: 1 }}>
        <Text style={styles.greet}>Hi {name} 👋</Text>
        <Text style={styles.sub}>{subtitle}</Text>
      </View>

      {typeof streak === "number" ? (
        <View style={styles.streakChip}>
          <Text style={styles.streakText}>🔥 {streak}</Text>
        </View>
      ) : null}

      <Pressable
        onPress={() => {
          tap();
          onBell?.();
        }}
        accessibilityLabel={`Notifications${notifications ? `, ${notifications} unread` : ""}`}
        style={({ pressed }) => [styles.bell, pressed && { opacity: 0.75 }]}
      >
        <Ionicons name="notifications-outline" size={20} color={C.deep} />
        {notifications > 0 ? (
          <View style={styles.badge}>
            <Text style={styles.badgeText}>{notifications}</Text>
          </View>
        ) : null}
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  bar: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    paddingVertical: 6,
    marginBottom: 12,
  },
  logoTile: {
    width: 46,
    height: 46,
    borderRadius: 15,
    overflow: "hidden",
    borderWidth: 2,
    borderColor: "#FFFFFF",
    backgroundColor: C.deep,
    shadowColor: C.deep,
    shadowOpacity: 0.28,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 6 },
    elevation: 8,
  },
  greet: { color: C.deep, fontSize: 19, fontWeight: "800" },
  sub: { color: "#5c7772", fontSize: 12, marginTop: 1 },
  streakChip: {
    backgroundColor: "#FFF3DA",
    borderRadius: 999,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderWidth: 1,
    borderColor: "#FFE1A8",
  },
  streakText: { color: "#8A6320", fontSize: 12, fontWeight: "800" },
  bell: {
    width: 42,
    height: 42,
    borderRadius: 14,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#fff",
    borderWidth: 1,
    borderColor: "#E2ECE9",
    shadowColor: C.deep,
    shadowOpacity: 0.16,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 6 },
    elevation: 6,
  },
  badge: {
    position: "absolute",
    top: 4,
    right: 4,
    minWidth: 16,
    height: 16,
    borderRadius: 8,
    backgroundColor: "#FF6B4A",
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 3,
    borderWidth: 1.5,
    borderColor: "#fff",
  },
  badgeText: { color: "#fff", fontSize: 9, fontWeight: "800" },
});
