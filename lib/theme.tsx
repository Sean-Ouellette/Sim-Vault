import React, { createContext, useContext, useEffect, useMemo, useState } from "react";
import { load, save } from "./storage";
import { Colors, Mode, Scheme, makeColors } from "../theme";

/** Runtime theme: mode (dark/light) + accent scheme (green/purple/sky). Session-only for now. */
type Theme = { c: Colors; mode: Mode; scheme: Scheme; setMode: (m: Mode) => void; setScheme: (s: Scheme) => void };
const Ctx = createContext<Theme>({ c: makeColors("dark", "green"), mode: "dark", scheme: "green", setMode: () => {}, setScheme: () => {} });

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [mode, setModeState] = useState<Mode>("dark");
  const [scheme, setSchemeState] = useState<Scheme>("green");
  useEffect(() => { load<{ mode: Mode; scheme: Scheme } | null>("theme", null).then((t) => { if (t) { setModeState(t.mode); setSchemeState(t.scheme); } }); }, []);
  const setMode = (m: Mode) => { setModeState(m); save("theme", { mode: m, scheme }); };
  const setScheme = (s: Scheme) => { setSchemeState(s); save("theme", { mode, scheme: s }); };
  const c = useMemo(() => makeColors(mode, scheme), [mode, scheme]);
  return <Ctx.Provider value={{ c, mode, scheme, setMode, setScheme }}>{children}</Ctx.Provider>;
}
export const useTheme = () => useContext(Ctx);
