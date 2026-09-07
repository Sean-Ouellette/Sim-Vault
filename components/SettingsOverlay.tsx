import React, { useEffect, useMemo, useRef, useState } from "react";
import { Animated, Image, Modal, Pressable, ScrollView, StyleSheet, Text, TextInput, View, useWindowDimensions } from "react-native";
import * as ImagePicker from "expo-image-picker";
import { Colors, Mode, Scheme, font, radius, space } from "../theme";
import { useTheme } from "../lib/theme";
import { useAuth } from "../lib/auth";
import { League, MONTHS, Section, seasonLength, useSettings } from "../lib/settings";
import { Button, Card, Pill, T } from "./ui";
import { useVault } from "../lib/vault";
import { saveTextFile, pickTextFile } from "../lib/files";
import { useRouter } from "expo-router";

/** Settings drawer (pages/settings.md): slides in over the current page. */
export function SettingsOverlay() {
  const { c: colors } = useTheme();
  const s = useMemo(() => makeStyles(colors), [colors]);
  const { width } = useWindowDimensions();
  const { open, closeSettings, section, setSection } = useSettings();
  const { user } = useAuth();
  const { height } = useWindowDimensions();
  const a = useRef(new Animated.Value(0)).current;
  useEffect(() => { a.setValue(0); if (open) Animated.timing(a, { toValue: 1, duration: 220, useNativeDriver: false }).start(); }, [open]);
  const full = width < 700;
  return (
    <Modal visible={open} transparent animationType="fade" onRequestClose={closeSettings}>
      <Pressable style={s.backdrop} onPress={closeSettings}>
        <Animated.View style={[s.panel, full ? { width, height, borderRadius: 0 } : { width: Math.min(760, width - 48), maxHeight: height * 0.85 }, { opacity: a, transform: [{ scale: a.interpolate({ inputRange: [0, 1], outputRange: [0.96, 1] }) }] }]}>
          <Pressable style={{ flex: 1, cursor: "default" } as any} onPress={() => {}}>
            <View style={s.header}>
              <View>
                <T.h2>Settings</T.h2>
                <T.small style={{ color: colors.muted }}>{user ? `Signed in as ${user}` : "Signed out"}</T.small>
              </View>
              <Pressable onPress={closeSettings} accessibilityLabel="Close settings" style={[s.close, { cursor: "pointer" } as any]}><Text style={{ color: colors.text, fontSize: 18, fontWeight: "700" }}>×</Text></Pressable>
            </View>
            <View style={{ flexDirection: "row", gap: 4, paddingHorizontal: space.lg, paddingBottom: space.md, flexWrap: "wrap" }}>
              {(["Leagues", "Appearance", "Account", "Data"] as Section[]).map((sec) => <Pill key={sec} active={section === sec} onPress={() => setSection(sec)}>{sec}</Pill>)}
            </View>
            <ScrollView style={{ flex: 1 }} contentContainerStyle={{ padding: space.lg, paddingTop: 0, gap: space.md }}>
              {section === "Leagues" && <Leagues />}
              {section === "Appearance" && <Appearance />}
              {section === "Account" && <Account />}
              {section === "Data" && <Data />}
            </ScrollView>
          </Pressable>
        </Animated.View>
      </Pressable>
    </Modal>
  );
}

// ---------------- Leagues ----------------
function Leagues() {
  const { c: colors } = useTheme();
  const s = useMemo(() => makeStyles(colors), [colors]);
  const { leagues, saveLeague, deleteLeague } = useSettings();
  const [editing, setEditing] = useState<League | null>(null);
  const [confirm, setConfirm] = useState<string | null>(null);
  return (
    <>
      <T.muted style={{ fontSize: 14 }}>Leagues decide a team's season calendar and which trophies it can win.</T.muted>
      <T.label>Saved leagues</T.label>
      {leagues.length === 0 && <Card><T.muted>No leagues yet — add your first one below.</T.muted></Card>}
      {leagues.map((l) => (
        <Card key={l.id} style={{ padding: space.md }}>
          <View style={{ flexDirection: "row", alignItems: "center", gap: space.sm }}>
            <View style={{ flex: 1 }}>
              <T.h3>{l.name}</T.h3>
              <T.small style={{ color: colors.muted }}>{MONTHS[l.startMonth]} → {MONTHS[l.endMonth]} · {seasonLength(l.startMonth, l.endMonth)} months</T.small>
            </View>
            <Button small onPress={() => { setEditing({ ...l }); setConfirm(null); }}>Edit</Button>
            {confirm === l.id ? (
              <Button small primary onPress={() => { deleteLeague(l.id); setConfirm(null); }} style={{ backgroundColor: colors.loss, borderColor: colors.loss }}>Confirm</Button>
            ) : (
              <Button small onPress={() => setConfirm(l.id)}>Delete</Button>
            )}
          </View>
          <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 6, marginTop: space.sm }}>
            {l.trophies.map((t) => <View key={t} style={s.chip}><T.small>{t}</T.small></View>)}
          </View>
        </Card>
      ))}
      <LeagueForm key={editing?.id ?? "new"} initial={editing} onSave={(l) => { saveLeague(l); setEditing(null); }} onCancel={() => setEditing(null)} />
    </>
  );
}

function LeagueForm({ initial, onSave, onCancel }: { initial: League | null; onSave: (l: League) => void; onCancel: () => void }) {
  const { c: colors } = useTheme();
  const s = useMemo(() => makeStyles(colors), [colors]);
  const [name, setName] = useState(initial?.name ?? "");
  const [start, setStart] = useState<number | null>(initial?.startMonth ?? null);
  const [end, setEnd] = useState<number | null>(initial?.endMonth ?? null);
  const [trophies, setTrophies] = useState<string[]>(initial?.trophies ?? []);
  const [trophy, setTrophy] = useState("");
  const [err, setErr] = useState<string | null>(null);
  const addTrophy = () => { const t = trophy.trim(); if (t && !trophies.includes(t)) setTrophies([...trophies, t]); setTrophy(""); };
  const submit = () => {
    if (!name.trim()) return setErr("Give the league a name.");
    if (start == null || end == null) return setErr("Pick a start and an end month.");
    if (trophies.length === 0) return setErr("Add at least one trophy.");
    setErr(null);
    onSave({ id: initial?.id ?? `l${Date.now()}`, name: name.trim(), startMonth: start, endMonth: end, trophies });
    if (!initial) { setName(""); setStart(null); setEnd(null); setTrophies([]); }
  };
  return (
    <Card>
      <T.h3 style={{ marginBottom: space.md }}>{initial ? `Edit ${initial.name}` : "Add a league"}</T.h3>
      <T.label style={{ marginBottom: 6 }}>Name</T.label>
      <TextInput value={name} onChangeText={setName} placeholder="e.g. Premier League" placeholderTextColor={colors.muted} style={s.input} />
      <View style={{ flexDirection: "row", gap: space.sm, flexWrap: "wrap", zIndex: 10 }}>
        <MonthSelect label="Start month" value={start} onChange={setStart} />
        <MonthSelect label="End month" value={end} onChange={setEnd} />
      </View>
      {start != null && end != null && <T.small style={{ color: colors.mint, marginTop: 6 }}>Season length: {seasonLength(start, end)} months{end < start ? " (wraps the year)" : ""}</T.small>}
      <T.label style={{ marginTop: space.md, marginBottom: 6 }}>Trophies</T.label>
      <View style={{ flexDirection: "row", gap: space.sm }}>
        <TextInput value={trophy} onChangeText={setTrophy} onSubmitEditing={addTrophy} placeholder="Add a trophy…" placeholderTextColor={colors.muted} style={[s.input, { flex: 1 }]} />
        <Button onPress={addTrophy}>Add</Button>
      </View>
      <T.small style={{ color: colors.muted, marginTop: 6 }}>League title, cups, super cups, continental — anything the team can lift.</T.small>
      <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 6, marginTop: space.sm }}>
        {trophies.map((t) => (
          <Pressable key={t} onPress={() => setTrophies(trophies.filter((x) => x !== t))} style={[s.chip, { flexDirection: "row", gap: 6 }, { cursor: "pointer" } as any]}>
            <T.small>{t}</T.small><T.small style={{ color: colors.muted, fontWeight: "800" }}>×</T.small>
          </Pressable>
        ))}
      </View>
      {err && <T.small style={{ color: colors.loss, marginTop: space.sm }}>{err}</T.small>}
      <View style={{ flexDirection: "row", gap: space.sm, marginTop: space.lg, justifyContent: "flex-end" }}>
        {initial && <Button onPress={onCancel}>Cancel</Button>}
        <Button primary onPress={submit}>Save league</Button>
      </View>
    </Card>
  );
}

/** Dropdown select box for a month. */
function MonthSelect({ label, value, onChange }: { label: string; value: number | null; onChange: (m: number) => void }) {
  const { c: colors } = useTheme();
  const s = useMemo(() => makeStyles(colors), [colors]);
  const [open, setOpen] = useState(false);
  const [up, setUp] = useState(false);
  const { height: vh } = useWindowDimensions();
  const ref = useRef<View>(null);
  const toggle = () => {
    // open upward when the list would run past the bottom of the viewport
    ref.current?.measureInWindow((_x, y, _w, h) => { setUp(y + h + 250 > vh * 0.9); setOpen((v) => !v); });
  };
  return (
    <View ref={ref} style={{ flex: 1, minWidth: 180, zIndex: open ? 20 : 1 }}>
      <T.label style={{ marginTop: space.md, marginBottom: 6 }}>{label}</T.label>
      <Pressable onPress={toggle} style={[s.select, open && { borderColor: colors.mint }, { cursor: "pointer" } as any]}>
        <Text style={[s.selectText, value == null && { color: colors.muted }]}>{value == null ? "Select…" : MONTHS[value]}</Text>
        <Text style={{ color: colors.mint, fontSize: 11 }}>{open ? "▲" : "▼"}</Text>
      </Pressable>
      {open && (
        <View style={up ? s.selectMenuUp : s.selectMenu}>
          <ScrollView style={{ maxHeight: 240 }}>
            {MONTHS.map((m, i) => (
              <Pressable key={m} onPress={() => { onChange(i); setOpen(false); }} style={[s.selectRow, value === i && { backgroundColor: colors.mintDim }, { cursor: "pointer" } as any]}>
                <Text style={[s.selectText, value === i && { color: colors.mint, fontWeight: "700" }]}>{m}</Text>
              </Pressable>
            ))}
          </ScrollView>
        </View>
      )}
    </View>
  );
}

// ---------------- Appearance ----------------
function Appearance() {
  const { c: colors, mode, scheme, setMode, setScheme } = useTheme();
  const s = useMemo(() => makeStyles(colors), [colors]);
  const { reduceMotion, setReduceMotion } = useSettings();
  const schemes: { id: Scheme; label: string; swatch: string }[] = [{ id: "green", label: "Green", swatch: "#3DF5B6" }, { id: "purple", label: "Purple", swatch: "#B48CFF" }, { id: "sky", label: "Sky blue", swatch: "#4DB1FF" }];
  return (
    <>
      <T.label>Mode</T.label>
      <View style={{ flexDirection: "row", gap: 4 }}>{(["dark", "light"] as Mode[]).map((m) => <Pill key={m} active={mode === m} onPress={() => setMode(m)}>{m === "dark" ? "Dark" : "Light"}</Pill>)}</View>
      <T.label style={{ marginTop: space.sm }}>Color scheme</T.label>
      <View style={{ flexDirection: "row", gap: space.sm, flexWrap: "wrap" }}>
        {schemes.map((sc) => (
          <Pressable key={sc.id} onPress={() => setScheme(sc.id)} style={[s.schemeCard, scheme === sc.id && { borderColor: colors.mint }, { cursor: "pointer" } as any]}>
            <View style={{ width: 28, height: 28, borderRadius: 14, backgroundColor: sc.swatch }} />
            <T.small style={{ fontWeight: "700" }}>{sc.label}</T.small>
          </Pressable>
        ))}
      </View>
      <T.label style={{ marginTop: space.sm }}>Preview</T.label>
      <Card style={{ flexDirection: "row", alignItems: "center", gap: space.md }}>
        <View style={{ flex: 1 }}><T.h3>Take the <T.mint>touchline</T.mint>.</T.h3><T.muted style={{ fontSize: 14 }}>Cards, text and accent in the chosen look.</T.muted></View>
        <Button primary>Sign in</Button>
      </Card>
      <Card style={{ flexDirection: "row", alignItems: "center", gap: space.md, marginTop: space.sm }}>
        <View style={{ flex: 1 }}><T.body style={{ fontWeight: "700" }}>Reduce motion</T.body><T.muted style={{ fontSize: 13 }}>Turns off scroll fade-ins, marquees and chart draw-ins.</T.muted></View>
        <Pill active={reduceMotion} onPress={() => setReduceMotion(!reduceMotion)}>{reduceMotion ? "On" : "Off"}</Pill>
      </Card>
    </>
  );
}

// ---------------- Account ----------------
function Account() {
  const { c: colors } = useTheme();
  const { user, avatar, setAvatar, signOut } = useAuth();
  const { closeSettings } = useSettings();
  const pick = async () => {
    const res = await ImagePicker.launchImageLibraryAsync({ mediaTypes: ["images"], allowsEditing: true, aspect: [1, 1], quality: 0.8 });
    if (!res.canceled && res.assets[0]) setAvatar(res.assets[0].uri);
  };
  return (
    <>
      <Card style={{ flexDirection: "row", alignItems: "center", gap: space.lg }}>
        <View style={{ width: 88, height: 88, borderRadius: 44, overflow: "hidden", backgroundColor: colors.mintDim, borderWidth: 2, borderColor: colors.mint, alignItems: "center", justifyContent: "center" }}>
          {avatar ? <Image source={{ uri: avatar }} style={{ width: 88, height: 88 }} /> : <T.h1 style={{ color: colors.mint }}>{(user ?? "?").slice(0, 1).toUpperCase()}</T.h1>}
        </View>
        <View style={{ flex: 1, gap: 6 }}>
          <T.label>Profile picture</T.label>
          <View style={{ flexDirection: "row", gap: space.sm, flexWrap: "wrap" }}>
            <Button small primary onPress={pick}>{avatar ? "Change photo…" : "Choose photo…"}</Button>
            {avatar && <Button small onPress={() => setAvatar(null)}>Remove</Button>}
          </View>
          <T.small style={{ color: colors.muted }}>Shows in the navbar. Square images work best.</T.small>
        </View>
      </Card>
      <Card>
        <T.label>Username</T.label><T.h3>{user ?? "—"}</T.h3>
        <T.small style={{ color: colors.muted, marginTop: 4 }}>Temporary sign-in (admin / admin). Real accounts later.</T.small>
        <Button style={{ marginTop: space.md, alignSelf: "flex-start" }} onPress={() => { signOut(); closeSettings(); }}>Sign out</Button>
      </Card>
      {["Change password", "Email"].map((k) => (
        <Card key={k} style={{ opacity: 0.55 }}><T.body style={{ fontWeight: "700" }}>{k}</T.body><T.small style={{ color: colors.muted }}>coming with real accounts</T.small></Card>
      ))}
    </>
  );
}

// ---------------- Data ----------------
function Data() {
  const { c: colors } = useTheme();
  const s = useMemo(() => makeStyles(colors), [colors]);
  const { exportJson, importJson, deleteAll } = useVault();
  const { leagues, replaceLeagues, closeSettings } = useSettings();
  const router = useRouter();
  const [typed, setTyped] = useState("");
  const [msg, setMsg] = useState<{ text: string; bad?: boolean } | null>(null);
  const doExport = async () => {
    try {
      const snap = JSON.parse(exportJson()); snap.leagues = leagues;
      await saveTextFile(`sim-vault-${new Date().toISOString().slice(0, 10)}.json`, JSON.stringify(snap, null, 2));
      setMsg({ text: "Exported your vault as JSON." });
    } catch (e: any) { setMsg({ text: `Export failed: ${e.message}`, bad: true }); }
  };
  const doImport = async () => {
    try {
      const f = await pickTextFile(); if (!f) return;
      const parsed = JSON.parse(f.text);
      const r = importJson(f.text);
      if (Array.isArray(parsed.leagues)) replaceLeagues(parsed.leagues);
      setMsg({ text: `Imported ${f.name}: ${r.teams} team${r.teams === 1 ? "" : "s"}${Array.isArray(parsed.leagues) ? `, ${parsed.leagues.length} leagues` : ""}.` });
    } catch (e: any) { setMsg({ text: `Import failed: ${e.message}`, bad: true }); }
  };
  const doDelete = () => { if (typed !== "DELETE") return; deleteAll(); setTyped(""); closeSettings(); router.push("/" as any); };
  return (
    <>
      <Card>
        <T.h3>Your vault</T.h3>
        <T.muted style={{ fontSize: 14, marginBottom: space.md }}>Export everything (teams, seasons, players, leagues) as JSON, or import a file you exported before. Importing replaces what's here.</T.muted>
        <View style={{ flexDirection: "row", gap: space.sm }}><Button primary onPress={doExport}>Export vault</Button><Button onPress={doImport}>Import…</Button></View>
        {msg && <T.small style={{ marginTop: space.sm, color: msg.bad ? colors.loss : colors.mint }}>{msg.text}</T.small>}
      </Card>
      <Card style={{ borderColor: colors.loss }}>
        <T.h3 style={{ color: colors.loss }}>Danger zone</T.h3>
        <T.muted style={{ fontSize: 14, marginBottom: space.sm }}>Delete every team, season and player in this vault. Type DELETE to enable.</T.muted>
        <TextInput value={typed} onChangeText={setTyped} placeholder="DELETE" placeholderTextColor={colors.muted} style={s.input} />
        <Button onPress={doDelete} style={[{ marginTop: space.sm, alignSelf: "flex-start" }, typed === "DELETE" ? { borderColor: colors.loss } : { opacity: 0.5 }]}>Delete all saves</Button>
      </Card>
    </>
  );
}

const makeStyles = (colors: Colors) => StyleSheet.create({
  backdrop: { flex: 1, backgroundColor: "rgba(0,0,0,0.65)", alignItems: "center", justifyContent: "center" },
  panel: { backgroundColor: colors.bg, borderWidth: 1, borderColor: colors.borderStrong, borderRadius: radius.card, overflow: "hidden", boxShadow: "0 30px 80px rgba(0,0,0,0.6)" } as any,
  header: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", padding: space.lg, paddingBottom: space.md },
  close: { width: 36, height: 36, borderRadius: 18, borderWidth: 1, borderColor: colors.borderStrong, alignItems: "center", justifyContent: "center" },
  input: { borderWidth: 1, borderColor: colors.borderStrong, borderRadius: radius.sm, paddingHorizontal: 12, paddingVertical: 10, color: colors.text, backgroundColor: colors.surface, fontFamily: font.family, fontSize: 14 },
  select: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", borderWidth: 1, borderColor: colors.borderStrong, borderRadius: radius.sm, paddingHorizontal: 12, paddingVertical: 10, backgroundColor: colors.surface },
  selectText: { fontFamily: font.family, fontSize: 14, color: colors.text },
  selectMenu: { position: "absolute", top: "100%", left: 0, right: 0, marginTop: 4, borderWidth: 1, borderColor: colors.borderStrong, borderRadius: radius.sm, backgroundColor: colors.surfaceRaised, overflow: "hidden", zIndex: 30, boxShadow: "0 12px 30px rgba(0,0,0,0.45)" } as any,
  selectMenuUp: { position: "absolute", bottom: 44, left: 0, right: 0, borderWidth: 1, borderColor: colors.borderStrong, borderRadius: radius.sm, backgroundColor: colors.surfaceRaised, overflow: "hidden", zIndex: 30, boxShadow: "0 -12px 30px rgba(0,0,0,0.45)" } as any,
  selectRow: { paddingHorizontal: 12, paddingVertical: 9, borderBottomWidth: 1, borderBottomColor: colors.border },
  chip: { paddingHorizontal: 10, paddingVertical: 5, borderRadius: radius.pill, borderWidth: 1, borderColor: colors.border, backgroundColor: colors.surfaceRaised },
  schemeCard: { flexDirection: "row", alignItems: "center", gap: 10, paddingHorizontal: 14, paddingVertical: 10, borderRadius: radius.tile, borderWidth: 1, borderColor: colors.border, backgroundColor: colors.surface },
});
