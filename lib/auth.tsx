import React, { createContext, useContext, useEffect, useState } from "react";
import { load, save, remove } from "./storage";

/** Temporary auth stub (design.md → Auth): admin / admin, in-memory for the session. */
type Auth = { user: string | null; avatar: string | null; setAvatar: (uri: string | null) => void; signIn: (u: string, p: string) => boolean; signOut: () => void; dialogOpen: boolean; openDialog: () => void; closeDialog: () => void };
const Ctx = createContext<Auth>({ user: null, avatar: null, setAvatar: () => {}, signIn: () => false, signOut: () => {}, dialogOpen: false, openDialog: () => {}, closeDialog: () => {} });

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<string | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [avatar, setAvatarState] = useState<string | null>(null);
  useEffect(() => { load<string | null>("user", null).then((u) => u && setUser(u)); load<string | null>("avatar", null).then((a) => a && setAvatarState(a)); }, []);
  const setAvatar = (uri: string | null) => { setAvatarState(uri); uri ? save("avatar", uri) : remove("avatar"); };
  const signIn = (u: string, p: string) => {
    if (u.trim().toLowerCase() === "admin" && p === "admin") { setUser("admin"); save("user", "admin"); setDialogOpen(false); return true; }
    return false;
  };
  const signOut = () => { setUser(null); remove("user"); };
  return (
    <Ctx.Provider value={{ user, avatar, setAvatar, signIn, signOut, dialogOpen, openDialog: () => setDialogOpen(true), closeDialog: () => setDialogOpen(false) }}>
      {children}
    </Ctx.Provider>
  );
}
export const useAuth = () => useContext(Ctx);
