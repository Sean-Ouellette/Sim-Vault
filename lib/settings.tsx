import React, { createContext, useContext, useEffect, useState } from "react";
import { useAuth } from "./auth";
import { load, save } from "./storage";

/** Settings overlay state + league definitions (session memory until real accounts). */
export type League = { id: string; name: string; startMonth: number; endMonth: number; trophies: string[] };
export const MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
/** Number of months in a season that starts at `s` and ends at `e` (0-based, wraps the year). */
export const seasonLength = (s: number, e: number) => ((e - s + 12) % 12) + 1;

const seed: League[] = [
  { id: "l1", name: "Premier League", startMonth: 7, endMonth: 4, trophies: ["Premier League", "FA Cup", "EFL Cup", "Community Shield", "Champions League"] },
  { id: "l2", name: "Eredivisie", startMonth: 7, endMonth: 4, trophies: ["Eredivisie", "KNVB Cup", "Johan Cruyff Shield", "Champions League"] },
  { id: "l3", name: "La Liga", startMonth: 7, endMonth: 4, trophies: ["La Liga", "Copa del Rey", "Supercopa", "Champions League"] },
  { id: "l4", name: "Championship", startMonth: 7, endMonth: 4, trophies: ["Championship", "FA Cup", "EFL Cup"] },
  { id: "l5", name: "Serie A", startMonth: 7, endMonth: 4, trophies: ["Serie A", "Coppa Italia", "Supercoppa", "Champions League"] },
];

type Ctx = {
  open: boolean; openSettings: (section?: Section) => void; closeSettings: () => void; section: Section; setSection: (s: Section) => void;
  leagues: League[]; saveLeague: (l: League) => void; deleteLeague: (id: string) => void; replaceLeagues: (ls: League[]) => void;
  reduceMotion: boolean; setReduceMotion: (v: boolean) => void;
};
export type Section = "Leagues" | "Appearance" | "Account" | "Data";
const C = createContext<Ctx>(null as any);

export function SettingsProvider({ children }: { children: React.ReactNode }) {
  const [open, setOpen] = useState(false);
  const [section, setSection] = useState<Section>("Leagues");
  const [leagues, setLeaguesState] = useState<League[]>(seed);
  const [reduceMotion, setReduceMotionState] = useState(false);
  useEffect(() => {
    load<League[] | null>("leagues", null).then((ls) => ls && setLeaguesState(ls));
    load<boolean>("reduceMotion", false).then(setReduceMotionState);
  }, []);
  const setLeagues = (f: (ls: League[]) => League[]) => setLeaguesState((ls) => { const next = f(ls); save("leagues", next); return next; });
  const setReduceMotion = (v: boolean) => { setReduceMotionState(v); save("reduceMotion", v); };
  const replaceLeagues = (ls: League[]) => setLeagues(() => ls);
  const { user, openDialog } = useAuth();
  const [pending, setPending] = useState(false);
  useEffect(() => { if (user && pending) { setPending(false); setOpen(true); } if (!user) setOpen(false); }, [user]);
  const saveLeague = (l: League) => setLeagues((ls) => (ls.some((x) => x.id === l.id) ? ls.map((x) => (x.id === l.id ? l : x)) : [...ls, l]));
  const deleteLeague = (id: string) => setLeagues((ls) => ls.filter((x) => x.id !== id));
  return (
    <C.Provider value={{ open, openSettings: (s) => { if (s) setSection(s); if (!user) { setPending(true); openDialog(); } else setOpen(true); }, closeSettings: () => setOpen(false), section, setSection, leagues, saveLeague, deleteLeague, replaceLeagues, reduceMotion, setReduceMotion }}>
      {children}
    </C.Provider>
  );
}
export const useSettings = () => useContext(C);
