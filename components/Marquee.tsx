import React, { useEffect, useMemo, useRef, useState } from "react";
import { Animated, Easing, ScrollView, StyleSheet, View } from "react-native";
import { useSettings } from "../lib/settings";
import Svg, { Defs, LinearGradient, Rect, Stop } from "react-native-svg";
import { Colors } from "../theme";
import { useTheme } from "../lib/theme";

/** Seamless horizontal auto-scroll. Content is rendered twice; pauses on hover. */
export function Marquee({ children, speed = 40, height = 56, fade = 80, fadeColor }: { children: React.ReactNode; speed?: number; height?: number; fade?: number; fadeColor?: string }) {
  const { c: colors } = useTheme();
  const { reduceMotion } = useSettings();
  const fc = fadeColor ?? colors.bg;
  const s = useMemo(() => makeStyles(colors), [colors]);
  const x = useRef(new Animated.Value(0)).current;
  const [w, setW] = useState(0);
  const [paused, setPaused] = useState(false);
  const anim = useRef<Animated.CompositeAnimation | null>(null);
  const id = useRef(`mq${Math.random().toString(36).slice(2, 8)}`).current;

  // Pause = stop in place; resume = continue from the current offset at the same
  // speed (no reset), so there is no jump on hover-out.
  useEffect(() => {
    if (!w || reduceMotion) return;
    anim.current?.stop();
    if (paused) return;
    let alive = true;
    const runFrom = (from: number) => {
      if (!alive) return;
      const remaining = w + from; // from is <= 0
      anim.current = Animated.timing(x, { toValue: -w, duration: Math.max(1, (remaining / speed) * 1000), easing: Easing.linear, useNativeDriver: false });
      anim.current.start(({ finished }) => { if (finished && alive) { x.setValue(0); runFrom(0); } });
    };
    x.stopAnimation((v) => runFrom(v <= -w ? 0 : v));
    return () => { alive = false; anim.current?.stop(); };
  }, [w, paused, reduceMotion]);

  if (reduceMotion) {
    // Reduce motion: no auto-scroll; the strip scrolls by hand instead.
    return (
      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={[s.wrap, { height }]} contentContainerStyle={{ flexDirection: "row", alignItems: "center", paddingHorizontal: fade }}>
        {children}
      </ScrollView>
    );
  }

  return (
    <View onPointerEnter={() => setPaused(true)} onPointerLeave={() => setPaused(false)} style={[s.wrap, { height }]}>
      <Animated.View style={{ flexDirection: "row", transform: [{ translateX: x }] }}>
        <View style={{ flexDirection: "row" }} onLayout={(e) => setW(e.nativeEvent.layout.width)}>{children}</View>
        <View style={{ flexDirection: "row" }}>{children}</View>
      </Animated.View>
      <View style={[StyleSheet.absoluteFill, { pointerEvents: "none" } as any]}>
        <Svg width="100%" height="100%">
          <Defs>
            <LinearGradient id={`${id}L`} x1="0" x2="1"><Stop offset="0" stopColor={fc} stopOpacity={1} /><Stop offset="1" stopColor={fc} stopOpacity={0} /></LinearGradient>
            <LinearGradient id={`${id}R`} x1="0" x2="1"><Stop offset="0" stopColor={fc} stopOpacity={0} /><Stop offset="1" stopColor={fc} stopOpacity={1} /></LinearGradient>
          </Defs>
          <Rect x="0" y="0" width={fade} height="100%" fill={`url(#${id}L)`} />
          <Rect x="100%" y="0" width={fade} height="100%" fill={`url(#${id}R)`} transform={`translate(${-fade},0)`} />
        </Svg>
      </View>
    </View>
  );
}

const makeStyles = (colors: Colors) => StyleSheet.create({
  wrap: { overflow: "hidden", width: "100%", justifyContent: "center" },
});
