import React, { createContext, useCallback, useContext, useEffect, useRef, useState } from "react";
import { Animated, ScrollView, ScrollViewProps, View, useWindowDimensions } from "react-native";
import { motion } from "../theme";
import { useSettings } from "../lib/settings";

/**
 * Scroll-triggered fade/slide-in. Wrap the page in <RevealScroll>; wrap each
 * section in <Reveal>. Re-arms after `motion.rearmMs` off-screen, so sections
 * animate in again on the next scroll into view (per design.md).
 */
type Sub = () => void;
const Ctx = createContext<{ subscribe: (f: Sub) => () => void }>({ subscribe: () => () => {} });

/** When true, <Reveal> children appear immediately (no fade, no re-arm). Use for content swapped by tabs/filters. */
export const RevealInstant = createContext(false);

export function RevealScroll({ children, onLayout, ...rest }: ScrollViewProps) {
  const subs = useRef(new Set<Sub>()).current;
  const subscribe = useCallback((f: Sub) => { subs.add(f); return () => subs.delete(f); }, []);
  const fire = () => subs.forEach((f) => f());
  useEffect(() => { const t = setTimeout(fire, 50); return () => clearTimeout(t); }, []);
  return (
    <Ctx.Provider value={{ subscribe }}>
      <ScrollView {...rest} scrollEventThrottle={32} onScroll={fire} onLayout={(e) => { onLayout?.(e); fire(); }}>{children}</ScrollView>
    </Ctx.Provider>
  );
}

export function Reveal({ children, delay = 0, style, onVisible }: { children: React.ReactNode; delay?: number; style?: any; onVisible?: (v: boolean) => void }) {
  const { subscribe } = useContext(Ctx);
  const { reduceMotion } = useSettings();
  const instant = useContext(RevealInstant) || reduceMotion;
  const { height: vh } = useWindowDimensions();
  const ref = useRef<View>(null);
  const a = useRef(new Animated.Value(0)).current;
  const shown = useRef(false);
  const hiddenSince = useRef<number | null>(null);
  const [visible, setVisible] = useState(false);

  const check = useCallback(() => {
    ref.current?.measureInWindow((_x, y, _w, h) => {
      const onScreen = y < vh - 40 && y + h > 40;
      if (onScreen) {
        hiddenSince.current = null;
        if (!shown.current) {
          shown.current = true;
          setVisible(true);
          Animated.timing(a, { toValue: 1, duration: motion.slow, delay, useNativeDriver: false }).start();
        }
      } else if (hiddenSince.current == null) {
        hiddenSince.current = Date.now();
      }
    });
  }, [vh]);

  useEffect(() => { if (instant) { shown.current = true; a.setValue(1); setVisible(true); } }, [instant]);
  useEffect(() => {
    if (instant) return;
    const unsub = subscribe(check);
    const t = setTimeout(check, 30); // check on mount too (content swapped in by tabs/filters)
    return () => { unsub(); clearTimeout(t); };
  }, [subscribe, check, instant]);
  useEffect(() => {
    const t = setInterval(() => {
      if (instant) return;
      if (shown.current && hiddenSince.current && Date.now() - hiddenSince.current > motion.rearmMs) {
        shown.current = false;
        setVisible(false);
        a.setValue(0);
      }
    }, 1000);
    return () => clearInterval(t);
  }, [instant]);
  useEffect(() => { onVisible?.(visible); }, [visible]);

  return (
    <Animated.View ref={ref} onLayout={instant ? undefined : check} style={[{ opacity: a, transform: [{ translateY: a.interpolate({ inputRange: [0, 1], outputRange: [28, 0] }) }] }, style]}>
      {children}
    </Animated.View>
  );
}
