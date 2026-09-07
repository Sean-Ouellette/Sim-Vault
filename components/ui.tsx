import React, { useEffect, useMemo, useRef, useState } from "react";
import { Animated, Image, Pressable, StyleSheet, Text, View, ViewProps, TextProps, PressableProps } from "react-native";
import { Colors, font, radius, space, motion } from "../theme";
import { useTheme } from "../lib/theme";
import { useSettings } from "../lib/settings";

function useStyles() {
  const { c } = useTheme();
  return { c, s: useMemo(() => makeStyles(c), [c]) };
}

function mk(kind: "display" | "h1" | "h2" | "h3" | "body" | "muted" | "small" | "label" | "mint") {
  return function Txt(p: TextProps) {
    const { s } = useStyles();
    const extra = kind === "muted" ? [s.body, s.muted] : kind === "mint" ? [s.mint] : [s[kind]];
    return <Text {...p} style={[kind === "mint" ? null : s.text, ...extra, p.style]} />;
  };
}
export const T = { display: mk("display"), h1: mk("h1"), h2: mk("h2"), h3: mk("h3"), body: mk("body"), muted: mk("muted"), small: mk("small"), label: mk("label"), mint: mk("mint") };

/** Dark card with 1px border. `hover` adds lift + accent border glow (web). */
export function Card({ hover, style, children, onPress, ...rest }: ViewProps & { hover?: boolean; onPress?: () => void }) {
  const { c, s } = useStyles();
  const lift = useRef(new Animated.Value(0)).current;
  const [hovered, setHovered] = useState(false);
  useEffect(() => {
    Animated.timing(lift, { toValue: hovered ? 1 : 0, duration: motion.fast, useNativeDriver: false }).start();
  }, [hovered]);
  const anim = hover
    ? {
        transform: [{ translateY: lift.interpolate({ inputRange: [0, 1], outputRange: [0, -4] }) }],
        borderColor: lift.interpolate({ inputRange: [0, 1], outputRange: [c.border, c.mint] }),
      }
    : {};
  const body = (
    <Animated.View {...rest} style={[s.card, hover && hovered && s.cardHover, anim, style]}>
      {children}
    </Animated.View>
  );
  if (!hover && !onPress) return body;
  const flat = (StyleSheet.flatten(style) || {}) as any;
  return (
    <Pressable onHoverIn={() => setHovered(true)} onHoverOut={() => setHovered(false)} onPress={onPress}
      style={[flat.flex ? { flex: flat.flex } : null, onPress ? { cursor: "pointer" } as any : null]}>
      {body}
    </Pressable>
  );
}

export function Pill({ active, children, onPress, style, ...rest }: PressableProps & { active?: boolean; children: React.ReactNode; style?: any }) {
  const { c, s } = useStyles();
  const [h, setH] = useState(false);
  return (
    <Pressable {...rest} onPress={onPress} onHoverIn={() => setH(true)} onHoverOut={() => setH(false)}
      style={[s.pill, active && s.pillActive, !active && h && s.pillHover, { cursor: "pointer" } as any, style]}>
      <Text style={[s.text, s.small, { fontWeight: "600" }, active ? { color: c.onMint } : { color: h ? c.text : c.muted }]}>{children}</Text>
    </Pressable>
  );
}

export function Button({ primary, children, onPress, style, small }: { primary?: boolean; children: React.ReactNode; onPress?: () => void; style?: any; small?: boolean }) {
  const { c, s } = useStyles();
  const [h, setH] = useState(false);
  return (
    <Pressable onPress={onPress} onHoverIn={() => setH(true)} onHoverOut={() => setH(false)}
      style={[s.btn, small && s.btnSmall, primary ? s.btnPrimary : s.btnGhost, h && (primary ? s.btnPrimaryHover : s.btnGhostHover), { cursor: "pointer" } as any, style]}>
      <Text style={[s.text, s.small, { fontWeight: "700" }, { color: primary ? c.onMint : c.text }]}>{children}</Text>
    </Pressable>
  );
}

/** Small uppercase section label */
export function SectionLabel({ children }: { children: React.ReactNode }) {
  const { s } = useStyles();
  return <Text style={[s.text, s.label, { marginBottom: space.md }]}>{children}</Text>;
}

/** Animated count-up number; restarts when `play` flips to true. */
export function CountUp({ to, play = true, style, suffix = "" }: { to: number; play?: boolean; style?: any; suffix?: string }) {
  const { s } = useStyles();
  const { reduceMotion } = useSettings();
  const v = useRef(new Animated.Value(0)).current;
  const [n, setN] = useState(0);
  useEffect(() => {
    const id = v.addListener(({ value }) => setN(Math.round(value)));
    return () => v.removeListener(id);
  }, []);
  useEffect(() => {
    if (!play) { v.setValue(0); setN(0); return; }
    if (reduceMotion) { v.setValue(to); setN(to); return; }
    Animated.timing(v, { toValue: to, duration: motion.draw, useNativeDriver: false }).start();
  }, [play, to, reduceMotion]);
  return <Text style={[s.text, s.h1, style]}>{n}{suffix}</Text>;
}

/** Circle with initials, used for team/player logos in the render. */
export function Logo({ label, color, size = 48, uri }: { label: string; color: string; size?: number; uri?: string }) {
  return (
    <View style={{ width: size, height: size, borderRadius: size / 2, backgroundColor: color + "22", borderWidth: 1, borderColor: color, alignItems: "center", justifyContent: "center", overflow: "hidden" }}>
      {uri ? <Image source={{ uri }} style={{ width: size, height: size }} resizeMode="cover" /> : <Text style={{ fontFamily: font.family, color, fontWeight: "800", fontSize: size * 0.32, letterSpacing: 1 }}>{label}</Text>}
    </View>
  );
}

const makeStyles = (colors: Colors) => StyleSheet.create({
  text: { fontFamily: font.family, color: colors.text },
  display: { fontSize: font.display, fontWeight: "800", letterSpacing: -1.5, lineHeight: font.display * 1.05 },
  h1: { fontSize: font.h1, fontWeight: "800", letterSpacing: -1, lineHeight: font.h1 * 1.1 },
  h2: { fontSize: font.h2, fontWeight: "700", letterSpacing: -0.5 },
  h3: { fontSize: font.h3, fontWeight: "700" },
  body: { fontSize: font.body, lineHeight: font.body * 1.5 },
  small: { fontSize: font.small, lineHeight: font.small * 1.4 },
  muted: { color: colors.muted },
  label: { fontSize: font.label, fontWeight: "700", letterSpacing: 1.6, textTransform: "uppercase", color: colors.muted },
  mint: { color: colors.mint },
  card: { backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.border, borderRadius: radius.card, padding: space.lg },
  cardHover: { boxShadow: `0 8px 28px ${colors.mintGlow}` } as any,
  pill: { paddingHorizontal: 14, paddingVertical: 7, borderRadius: radius.pill, borderWidth: 1, borderColor: "transparent" },
  pillActive: { backgroundColor: colors.mint },
  pillHover: { borderColor: colors.border, backgroundColor: colors.surfaceRaised },
  btn: { paddingHorizontal: 20, paddingVertical: 12, borderRadius: radius.pill, borderWidth: 1, alignItems: "center", justifyContent: "center" },
  btnSmall: { paddingHorizontal: 14, paddingVertical: 8 },
  btnPrimary: { backgroundColor: colors.mint, borderColor: colors.mint },
  btnPrimaryHover: { boxShadow: `0 0 18px ${colors.mintGlow}` } as any,
  btnGhost: { backgroundColor: "transparent", borderColor: colors.borderStrong },
  btnGhostHover: { borderColor: colors.mint, backgroundColor: colors.mintDim },
});
