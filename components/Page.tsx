import React, { createContext, useContext, useMemo, useState } from "react";
import { StyleSheet, View } from "react-native";
import Svg, { Defs, Pattern, Path, Rect, RadialGradient, Stop } from "react-native-svg";
import { useTheme } from "../lib/theme";
import { Colors, layout, space } from "../theme";
import { RevealScroll } from "./Reveal";

const WidthCtx = createContext(0);

/** Measured width of the page's scroll area (excludes the vertical scrollbar). */
export function usePageWidth() { return useContext(WidthCtx); }

/**
 * Break a child out of the content column to the full page width. `bleed` is the
 * distance from the column's inner edge to the page edge (gutter + centering margin).
 */
export function FullBleed({ children, render }: { children?: React.ReactNode; render?: (bleed: number) => React.ReactNode }) {
  const width = usePageWidth();
  if (!width) return null;
  const col = Math.min(width, layout.maxWidth);
  const bleed = (width - col) / 2 + layout.gutter;
  return <View style={{ marginHorizontal: -bleed, width }}>{render ? render(bleed) : children}</View>;
}

/** Page shell: glowing dark background + grid overlay + centered content column. */
export function Page({ children, wide }: { children: React.ReactNode; wide?: boolean }) {
  const { c: colors } = useTheme();
  const s = useMemo(() => makeStyles(colors), [colors]);
  const [width, setWidth] = useState(0);
  return (
    <View style={s.root}>
      <Background />
      <WidthCtx.Provider value={width}>
        <RevealScroll style={{ flex: 1 }} onLayout={(e) => setWidth(e.nativeEvent.layout.width)} contentContainerStyle={[s.content, wide && { maxWidth: undefined }]}>
          {children}
        </RevealScroll>
      </WidthCtx.Provider>
    </View>
  );
}

export function Background() {
  const { c: colors } = useTheme();
  const s = useMemo(() => makeStyles(colors), [colors]);
  return (
    <View style={[StyleSheet.absoluteFill, { pointerEvents: "none" } as any]}>
      <Svg width="100%" height="100%">
        <Defs>
          <RadialGradient id="g1" cx="20%" cy="0%" r="60%">
            <Stop offset="0" stopColor={colors.glowA} stopOpacity={1} />
            <Stop offset="1" stopColor={colors.glowB} stopOpacity={0} />
          </RadialGradient>
          <RadialGradient id="g2" cx="90%" cy="70%" r="55%">
            <Stop offset="0" stopColor={colors.glowA} stopOpacity={0.9} />
            <Stop offset="1" stopColor={colors.glowB} stopOpacity={0} />
          </RadialGradient>
          <Pattern id="grid" width={48} height={48} patternUnits="userSpaceOnUse">
            <Path d="M48 0H0V48" fill="none" stroke={colors.border} strokeWidth={0.6} strokeOpacity={0.5} />
          </Pattern>
        </Defs>
        <Rect width="100%" height="100%" fill={colors.bg} />
        <Rect width="100%" height="100%" fill="url(#g1)" />
        <Rect width="100%" height="100%" fill="url(#g2)" />
        <Rect width="100%" height="100%" fill="url(#grid)" />
      </Svg>
    </View>
  );
}

const makeStyles = (colors: Colors) => StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.bg },
  content: { width: "100%", maxWidth: layout.maxWidth, alignSelf: "center", paddingHorizontal: layout.gutter, paddingBottom: space.xxl },
});
