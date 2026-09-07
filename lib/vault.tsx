import React, { createContext, useContext, useEffect, useRef, useState } from "react";
import { Team, teams, snapshotVault, restoreVault, clearVault, removeTeam, VaultSnapshot } from "./data";
import { load, save, remove } from "./storage";

/**
 * Vault state: mutations on the placeholder data, persisted to device storage so a
 * refresh keeps everything. Components that read D.teams call useVault() to re-render.
 */
type Vault = {
  version: number; ready: boolean; bump: () => void;
  addTeam: (t: Omit<Team, "id">) => Team; updateTeam: (id: string, patch: Partial<Team>) => void; deleteTeam: (id: string) => void; addSeason: (teamId: string) => number;
  exportJson: () => string; importJson: (json: string) => { teams: number }; deleteAll: () => void;
};
const C = createContext<Vault>(null as any);

export function VaultProvider({ children }: { children: React.ReactNode }) {
  const [version, setVersion] = useState(0);
  const [ready, setReady] = useState(false);
  const dirty = useRef(false);
  useEffect(() => { (async () => { const snap = await load<VaultSnapshot | null>("vault", null); if (snap) { try { restoreVault(snap); } catch {} } setReady(true); setVersion((v) => v + 1); })(); }, []);
  useEffect(() => { if (ready && dirty.current) { dirty.current = false; save("vault", snapshotVault()); } }, [version, ready]);
  const bump = () => { dirty.current = true; setVersion((v) => v + 1); };
  const addTeam = (t: Omit<Team, "id">) => { const team = { ...t, id: `t${Date.now()}` }; teams.push(team); bump(); return team; };
  const updateTeam = (id: string, patch: Partial<Team>) => { const t = teams.find((x) => x.id === id); if (t) Object.assign(t, patch); bump(); };
  const deleteTeam = (id: string) => { removeTeam(id); bump(); };
  const addSeason = (teamId: string) => {
    const t = teams.find((x) => x.id === teamId)!;
    t.seasons += 1; t.pointsBySeason.push(0); t.currentPoints = 0; t.monthsLogged = 0; t.lastSaved = new Date().toISOString().slice(0, 10);
    bump(); return t.seasons - 1;
  };
  const exportJson = () => JSON.stringify(snapshotVault(), null, 2);
  const importJson = (json: string) => { const snap = JSON.parse(json) as VaultSnapshot; restoreVault(snap); bump(); return { teams: snap.teams.length }; };
  const deleteAll = () => { clearVault(); remove("vault"); bump(); };
  return <C.Provider value={{ version, ready, bump, addTeam, updateTeam, deleteTeam, addSeason, exportJson, importJson, deleteAll }}>{children}</C.Provider>;
}
export const useVault = () => useContext(C);
