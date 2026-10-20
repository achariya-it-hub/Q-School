import { useEffect, useRef, useState } from "react";
import { Animated, Pressable, StyleSheet, Text, View } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { Ionicons } from "@expo/vector-icons";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { BRAND } from "@qschool/shared";
import { selectHaptic, tap } from "@/components/ui";

const C = BRAND.colors;

const ICONS: Record<string, { active: keyof typeof Ionicons.glyphMap; inactive: keyof typeof Ionicons.glyphMap }> = {
  index: { active: "home", inactive: "home-outline" },
  courses: { active: "book", inactive: "book-outline" },
  live: { active: "videocam", inactive: "videocam-outline" },
  profile: { active: "person", inactive: "person-outline" },
};

const BAR_HEIGHT = 72;
const PILL_HEIGHT = 56;
const INSET = 8; // pill inset from the bar edge

type TabBarProps = {
  state: { index: number; routes: { key: string; name: string }[] };
  // Only the shape we actually read — keeps us decoupled from react-navigation internals.
  descriptors: Record<string, { options: { title?: string } }>;
  navigation: {
    navigate: (name: string) => void;
    /* eslint-disable-next-line @typescript-eslint/no-explicit-any */
    emit: (event: any) => any;
  };
};

function TabItem({
  focused,
  label,
  icons,
  onPress,
  onLongPress,
}: {
  focused: boolean;
  label: string;
  icons: { active: keyof typeof Ionicons.glyphMap; inactive: keyof typeof Ionicons.glyphMap };
  onPress: () => void;
  onLongPress: () => void;
}) {
  const f = useRef(new Animated.Value(focused ? 1 : 0)).current;
  const press = useRef(new Animated.Value(1)).current;
  const hover = useRef(new Animated.Value(0)).current;
  const [hovered, setHovered] = useState(false);

  const setHovering = (on: boolean) => {
    setHovered(on);
    Animated.spring(hover, {
      toValue: on ? 1 : 0,
      useNativeDriver: true,
      friction: 6,
      tension: 140,
    }).start();
  };

  useEffect(() => {
    if (focused) {
      // wait for the pill to travel before lighting the icon up
      const t = setTimeout(
        () => Animated.timing(f, { toValue: 1, duration: 160, useNativeDriver: true }).start(),
        90,
      );
      return () => clearTimeout(t);
    }
    Animated.timing(f, { toValue: 0, duration: 120, useNativeDriver: true }).start();
  }, [focused, f]);

  return (
    <Pressable
      accessibilityRole="tab"
      accessibilityState={focused ? { selected: true } : {}}
      accessibilityLabel={label}
      onPress={() => {
        selectHaptic();
        onPress();
      }}
      onLongPress={() => {
        tap();
        onLongPress();
      }}
      onPressIn={() =>
        Animated.spring(press, { toValue: 0.94, useNativeDriver: true, friction: 6 }).start()
      }
      onPressOut={() =>
        Animated.spring(press, { toValue: 1, useNativeDriver: true, friction: 6 }).start()
      }
      style={styles.item}
    >
      <Animated.View
        onPointerEnter={() => setHovering(true)}
        onPointerLeave={() => setHovering(false)}
        style={{
          alignItems: "center",
          zIndex: 2,
          transform: [
            { scale: press },
            { translateY: hover.interpolate({ inputRange: [0, 1], outputRange: [0, -2] }) },
          ],
        }}
      >
        {/* crossfading icons so the colour change is smooth */}
        <View
          style={[
            styles.iconBox,
            {
              transform: [
                { scale: hover.interpolate({ inputRange: [0, 1], outputRange: [1, 1.12] }) },
              ],
            },
          ]}
        >
          <Animated.View style={{ opacity: f }}>
            <Ionicons name={icons.active} size={22} color="#fff" />
          </Animated.View>
          <Animated.View style={[StyleSheet.absoluteFill, { opacity: f.interpolate({ inputRange: [0, 1], outputRange: [1, 0] }), alignItems: "center", justifyContent: "center" }]}>
            <Ionicons name={icons.inactive} size={22} color="#7E9A94" />
          </Animated.View>
        </View>

        <Animated.Text
          style={[
            styles.label,
            focused && styles.labelActive,
            hovered && !focused && { color: C.deep },
            { opacity: f.interpolate({ inputRange: [0, 1], outputRange: [0.85, 1] }) },
          ]}
        >
          {label}
        </Animated.Text>
      </Animated.View>
    </Pressable>
  );
}

/**
 * Q-School tab bar — light floating surface with a single brand-teal pill that
 * slides to the active tab. One accent colour, soft depth, haptic feedback.
 */
export function QTabBar({ state, descriptors, navigation }: TabBarProps) {
  const insets = useSafeAreaInsets();
  const [barWidth, setBarWidth] = useState(0);
  const slide = useRef(new Animated.Value(state.index)).current;

  useEffect(() => {
    Animated.spring(slide, {
      toValue: state.index,
      useNativeDriver: true,
      friction: 9,
      tension: 110,
    }).start();
  }, [state.index, slide]);

  const count = state.routes.length;
  const itemWidth = barWidth > 0 ? barWidth / count : 0;
  const pillWidth = Math.max(itemWidth - INSET * 2, 0);

  return (
    <View style={[styles.wrap, { paddingBottom: Math.max(insets.bottom, 10) }]} pointerEvents="box-none">
      {/* soft fade so scrolling content melts away behind the floating bar */}
      <LinearGradient
        pointerEvents="none"
        colors={["rgba(244,250,248,0)", "rgba(244,250,248,0.92)", "#F4FAF8"]}
        style={styles.fade}
      />

      <View
        style={styles.bar}
        onLayout={(e) => setBarWidth(e.nativeEvent.layout.width)}
      >
        <LinearGradient
          colors={["#FFFFFF", "#F1F8F6"]}
          start={{ x: 0, y: 0 }}
          end={{ x: 0, y: 1 }}
          style={StyleSheet.absoluteFill}
        />
        <View pointerEvents="none" style={styles.barRim} />
        <View pointerEvents="none" style={styles.barGloss} />

        {/* the single sliding pill */}
        {itemWidth > 0 && (
          <Animated.View
            pointerEvents="none"
            style={[
              styles.pill,
              {
                width: pillWidth,
                transform: [{ translateX: Animated.multiply(slide, itemWidth) }],
              },
            ]}
          >
            <LinearGradient
              colors={[C.teal500, C.teal]}
              start={{ x: 0.1, y: 0 }}
              end={{ x: 0.9, y: 1 }}
              style={styles.pillFill}
            >
              <View style={styles.pillGloss} />
            </LinearGradient>
          </Animated.View>
        )}

        {state.routes.map((route, index) => {
          const focused = state.index === index;
          const icons = ICONS[route.name] ?? ICONS.index;
          const label = descriptors[route.key]?.options.title ?? route.name;

          const onPress = () => {
            const event = navigation.emit({
              type: "tabPress",
              target: route.key,
              canPreventDefault: true,
            });
            if (!focused && !event.defaultPrevented) {
              navigation.navigate(route.name);
            }
          };

          return (
            <TabItem
              key={route.key}
              focused={focused}
              label={label}
              icons={icons}
              onPress={onPress}
              onLongPress={() =>
                navigation.emit({ type: "tabLongPress", target: route.key, canPreventDefault: false })
              }
            />
          );
        })}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { paddingHorizontal: 14, paddingTop: 6, backgroundColor: "transparent" },
  fade: { position: "absolute", left: 0, right: 0, top: -34, height: 40 },
  bar: {
    flexDirection: "row",
    height: BAR_HEIGHT,
    borderRadius: 26,
    overflow: "hidden",
    borderWidth: 1,
    borderColor: "rgba(5,64,56,0.07)",
    shadowColor: C.deep,
    shadowOpacity: 0.16,
    shadowRadius: 20,
    shadowOffset: { width: 0, height: 12 },
    elevation: 12,
  },
  barRim: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    height: 1.5,
    backgroundColor: "rgba(255,255,255,0.95)",
  },
  barGloss: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    height: 22,
    backgroundColor: "rgba(255,255,255,0.55)",
  },
  pill: {
    position: "absolute",
    top: (BAR_HEIGHT - PILL_HEIGHT) / 2,
    left: INSET,
    height: PILL_HEIGHT,
    borderRadius: 20,
    shadowColor: C.teal,
    shadowOpacity: 0.4,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 8 },
    elevation: 8,
  },
  pillFill: {
    flex: 1,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.45)",
    overflow: "hidden",
  },
  pillGloss: {
    position: "absolute",
    top: 3,
    left: 4,
    right: 4,
    height: 20,
    borderRadius: 14,
    backgroundColor: "rgba(255,255,255,0.22)",
  },
  item: { flex: 1, alignItems: "center", justifyContent: "center" },
  iconBox: { width: 24, height: 24, alignItems: "center", justifyContent: "center" },
  label: { marginTop: 4, fontSize: 11, fontWeight: "600", color: "#7E9A94" },
  labelActive: { color: "#fff", fontWeight: "700" },
});
