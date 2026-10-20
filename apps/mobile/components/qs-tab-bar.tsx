import { useEffect, useRef } from "react";
import { Animated, Pressable, StyleSheet, Text, View } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { Ionicons } from "@expo/vector-icons";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { selectHaptic } from "@/components/ui";
import { K, type IconName } from "@/components/kit";

const TABS: Record<string, { label: string; on: IconName; off: IconName }> = {
  home: { label: "Home", on: "home", off: "home-outline" },
  learn: { label: "Learn", on: "book", off: "book-outline" },
  explore: { label: "Explore", on: "search", off: "search" },
  community: { label: "Community", on: "people", off: "people-outline" },
  profile: { label: "Profile", on: "person", off: "person-outline" },
};

type Props = {
  state: { index: number; routes: { key: string; name: string }[] };
  navigation: {
    navigate: (name: string) => void;
    /* eslint-disable-next-line @typescript-eslint/no-explicit-any */
    emit: (event: any) => any;
  };
};

function Item({ name, focused, onPress }: { name: string; focused: boolean; onPress: () => void }) {
  const t = TABS[name];
  const a = useRef(new Animated.Value(focused ? 1 : 0)).current;
  useEffect(() => {
    Animated.spring(a, { toValue: focused ? 1 : 0, useNativeDriver: true, friction: 6 }).start();
  }, [focused, a]);
  if (!t) return null;

  return (
    <Pressable onPress={onPress} style={st.item} accessibilityRole="tab" accessibilityState={{ selected: focused }}>
      <Animated.View style={{ transform: [{ translateY: a.interpolate({ inputRange: [0, 1], outputRange: [0, -2] }) }] }}>
        <Ionicons name={focused ? t.on : t.off} size={23} color={focused ? K.teal : "#7C8C88"} />
      </Animated.View>
      <Text style={[st.label, focused && { color: K.teal, fontWeight: "700" }]}>{t.label}</Text>
      <Animated.View style={[st.dot, { opacity: a, transform: [{ scale: a }] }]} />
    </Pressable>
  );
}

export function QSTabBar({ state, navigation }: Props) {
  const insets = useSafeAreaInsets();

  const go = (route: { key: string; name: string }, focused: boolean) => {
    selectHaptic();
    const e = navigation.emit({ type: "tabPress", target: route.key, canPreventDefault: true });
    if (!focused && !e.defaultPrevented) navigation.navigate(route.name);
  };

  return (
    <View style={[st.bar, { paddingBottom: Math.max(insets.bottom, 10) }]}>
      {state.routes.map((r, i) => {
        const focused = state.index === i;
        if (r.name === "explore") {
          return (
            <View key={r.key} style={st.item}>
              <Pressable onPress={() => go(r, focused)} style={st.fabWrap} accessibilityLabel="Explore">
                <LinearGradient colors={focused ? ["#13A88F", K.deep] : ["#0B6E5F", K.deep]} style={st.fab}>
                  <Ionicons name="search" size={26} color="#fff" />
                </LinearGradient>
              </Pressable>
            </View>
          );
        }
        return <Item key={r.key} name={r.name} focused={focused} onPress={() => go(r, focused)} />;
      })}
    </View>
  );
}

const st = StyleSheet.create({
  bar: {
    flexDirection: "row",
    backgroundColor: "#fff",
    paddingTop: 10,
    borderTopLeftRadius: 22,
    borderTopRightRadius: 22,
    shadowColor: "#054038",
    shadowOpacity: 0.1,
    shadowRadius: 16,
    shadowOffset: { width: 0, height: -4 },
    elevation: 16,
    borderTopWidth: 1,
    borderColor: "#EEF3F1",
  },
  item: { flex: 1, alignItems: "center", justifyContent: "flex-start", gap: 3 },
  label: { fontSize: 11, color: "#7C8C88" },
  dot: { width: 4, height: 4, borderRadius: 2, backgroundColor: K.teal },
  fabWrap: {
    marginTop: -30,
    borderRadius: 34,
    padding: 5,
    backgroundColor: "#fff",
    shadowColor: "#054038",
    shadowOpacity: 0.35,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 6 },
    elevation: 10,
  },
  fab: { width: 58, height: 58, borderRadius: 29, alignItems: "center", justifyContent: "center" },
});
