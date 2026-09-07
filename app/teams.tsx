import React, { useEffect, useMemo, useState } from "react";
import { Modal, Pressable, ScrollView, StyleSheet, TextInput, View, useWindowDimensions } from "react-native";
import { useLocalSearchParams } from "expo-router";
import { Page, Background } from "../components/Page";
import { Reveal, RevealScroll, RevealInstant } from "../components/Reveal";
import { Button, Card, CountUp, Logo, Pill, SectionLabel, T } from "../components/ui";
import { BarChart, LineChart } from "../components/LineChart";
import { Colors, layout, radius, space } from "../theme";
import { useTheme } from "../lib/theme";
import { RequireAuth } from "../components/RequireAuth";
import { monthlyCumulative, seasonTicks, monthLabel, MONTHS_PER_SEASON } from "../lib/data";
import * as D from "../lib/data";
import * as ImagePicker from "expo-image-picker";
import { TIERS, seasonLadders, saveLadders } from "../lib/achievements";
import { useSettings } from "../lib/settings";
import { useVault } from "../lib/vault";

// Render of pages/teams.md. Screen A = grid + stat graph; Screen B = team view.
export default function TeamsScreen() { return <RequireAuth><Teams /></RequireAuth>; }

function Teams() {
  const { version } = useVault();
  const params = useLocalSearchParams<{ team?: string }>();
  const [teamId, setTeamId] = useState<string | null>(params.team ?? null);
  const team = D.teams.find((t) => t.id === teamId) ?? null;
  return team ? <TeamView team={team} onSwitch={setTeamId} /> : <TeamGrid onOpen={setTeamId} />;
}

// ---------------- Screen A ----------------
const STATS = ["Points", "Wins", "Goals", "Trophies"] as const;

function TeamGrid({ onOpen }: { onOpen: (id: string) => void }) {
  const { c: colors } = useTheme();
  const s = useMemo(() => makeStyles(colors), [colors]);
  const [adding, setAdding] = useState(false);
  const [editing, setEditing] = useState<D.Team | null>(null);
  const [menuFor, setMenuFor] = useState<string | null>(null);
  const [confirmDel, setConfirmDel] = useState<D.Team | null>(null);
  const { deleteTeam } = useVault();
  const { width } = useWindowDimensions();
  const cols = width < 640 ? 2 : width < 900 ? 3 : width < 1200 ? 4 : 5;
  const [stat, setStat] = useState<(typeof STATS)[number]>("Points");
  const [chartOn, setChartOn] = useState(false);
  const [heroOn, setHeroOn] = useState(false);
  const months = Math.max(...D.teams.map((t) => t.seasons)) * MONTHS_PER_SEASON;
  const total = (t: D.Team) => stat === "Points" ? D.sum(t.pointsBySeason)
    : stat === "Wins" ? Math.round(D.sum(t.pointsBySeason) / 3.1)
    : stat === "Goals" ? Math.round(D.sum(t.pointsBySeason) * 0.9)
    : t.trophies;
  const series = D.topTeamsByPoints().map((t, i) => ({ name: t.name, color: colors.series[i], values: monthlyCumulative(total(t), t.seasons * MONTHS_PER_SEASON, i + 3) }));
  return (
    <Page>
      <Reveal onVisible={setHeroOn} style={s.hero}>
        <T.display>Your <T.mint style={s.glow}>clubs</T.mint>, one vault.</T.display>
        <View style={{ flexDirection: "row", alignItems: "center", gap: space.md, marginTop: space.md }}>
          <T.muted style={{ fontSize: 18 }}>Every save you've managed, ready to reopen.</T.muted>
          <View style={s.countChip}><CountUp to={D.teams.length} play={heroOn} style={{ fontSize: 16 }} /><T.label style={{ marginLeft: 6 }}>saved</T.label></View>
        </View>
      </Reveal>

      <Reveal style={{ marginTop: space.xl }}>
        <SectionLabel>Saved teams</SectionLabel>
        <View style={s.grid}>
          <View style={{ width: `${100 / cols}%`, padding: space.sm }}>
            <Pressable onPress={() => setAdding(true)} style={[s.addTile, { cursor: "pointer" } as any]}>
              <T.h1 style={{ color: colors.mint }}>+</T.h1>
              <T.small style={{ color: colors.mint, fontWeight: "700" }}>Add a new team</T.small>
            </Pressable>
          </View>
          {D.teams.map((t) => (
            <View key={t.id} style={{ width: `${100 / cols}%`, padding: space.sm, zIndex: menuFor === t.id ? 30 : 1 }}>
              <Card hover onPress={() => onOpen(t.id)} style={s.teamCard}>
                <Logo label={t.short} color={t.color} size={44} uri={t.logo} />
                <T.h3 style={{ marginTop: 6, textAlign: "center", fontSize: 17 }} numberOfLines={1}>{t.name}</T.h3>
                <T.small style={{ color: colors.muted }}>{t.league}</T.small>
                <View style={s.notePanel}>
                  <T.small style={{ color: t.note ? colors.text : colors.muted, fontSize: 12, lineHeight: 16 }} numberOfLines={2}>{t.note || "No note"}</T.small>
                </View>
              </Card>
              <Pressable onPress={() => setMenuFor(menuFor === t.id ? null : t.id)} accessibilityLabel={`More options for ${t.name}`} style={[s.kebab, { cursor: "pointer" } as any]}>
                <T.body style={{ fontWeight: "800", lineHeight: 18 }}>⋮</T.body>
              </Pressable>
              {menuFor === t.id && (
                <View style={s.kebabMenu}>
                  <Pressable onPress={() => { setMenuFor(null); setEditing(t); }} style={[s.dropRow, { cursor: "pointer" } as any]}><T.small style={{ fontWeight: "700" }}>Edit team</T.small></Pressable>
                  <Pressable onPress={() => { setMenuFor(null); setConfirmDel(t); }} style={[s.dropRow, { borderBottomWidth: 0 }, { cursor: "pointer" } as any]}><T.small style={{ fontWeight: "700", color: colors.loss }}>Delete team</T.small></Pressable>
                </View>
              )}
            </View>
          ))}
        </View>
      </Reveal>

      <Reveal style={{ marginTop: space.xxl }} onVisible={setChartOn}>
        <Card>
          <View style={s.chartHead}>
            <T.h3>Top 5 clubs · running {stat.toLowerCase()} by month</T.h3>
            <View style={{ flexDirection: "row", gap: 4 }}>
              {STATS.map((st) => <Pill key={st} active={stat === st} onPress={() => setStat(st)}>{st}</Pill>)}
            </View>
          </View>
          <LineChart play={chartOn} series={series} xLabels={seasonTicks(months)} xTooltip={monthLabel} />
        </Card>
      </Reveal>
      <NewTeamModal visible={adding || !!editing} team={editing} onClose={() => { setAdding(false); setEditing(null); }} onCreated={(id) => { setAdding(false); onOpen(id); }} onSaved={() => setEditing(null)} />
      <Modal visible={!!confirmDel} transparent animationType="fade" onRequestClose={() => setConfirmDel(null)}>
        <Pressable style={s.backdrop} onPress={() => setConfirmDel(null)}>
          <Pressable style={[s.modal, { maxWidth: 440 }]} onPress={() => {}}>
            <T.h3>Delete {confirmDel?.name}?</T.h3>
            <T.muted style={{ marginTop: space.xs }}>This removes the team and its {confirmDel?.seasons} season{confirmDel?.seasons === 1 ? "" : "s"} of logs. It can't be undone.</T.muted>
            <View style={{ flexDirection: "row", gap: space.sm, marginTop: space.lg, justifyContent: "flex-end" }}>
              <Button onPress={() => setConfirmDel(null)}>Keep</Button>
              <Button primary style={{ backgroundColor: colors.loss, borderColor: colors.loss }} onPress={() => { if (confirmDel) deleteTeam(confirmDel.id); setConfirmDel(null); }}>Delete</Button>
            </View>
          </Pressable>
        </Pressable>
      </Modal>
    </Page>
  );
}

const TEAM_COLORS = ["#3DF5B6", "#4DA3FF", "#FF9F43", "#B388FF", "#FF5C7A", "#FFD84D", "#34D3E6", "#F97FD6"];
const NOTE_MAX = 75;
/** "Add a new team" / "Edit team" dialog: name, short code, league (from Settings), logo, note. */
function NewTeamModal({ visible, team, onClose, onCreated, onSaved }: { visible: boolean; team?: D.Team | null; onClose: () => void; onCreated: (id: string) => void; onSaved?: () => void }) {
  const { c: colors } = useTheme();
  const s = useMemo(() => makeStyles(colors), [colors]);
  const { leagues } = useSettings();
  const { addTeam, updateTeam } = useVault();
  const [name, setName] = useState(""); const [short, setShort] = useState(""); const [league, setLeague] = useState<string | null>(null);
  const [note, setNote] = useState("");
  const color = team?.color ?? TEAM_COLORS[D.teams.length % TEAM_COLORS.length]; // auto tint for the initials fallback
  const [logo, setLogo] = useState<string | undefined>(undefined);
  useEffect(() => { if (visible) { setName(team?.name ?? ""); setShort(team?.short ?? ""); setLeague(team?.league ?? null); setNote(team?.note ?? ""); setLogo(team?.logo); setErr(null); } }, [visible, team?.id]);
  const pickLogo = async () => {
    const res = await ImagePicker.launchImageLibraryAsync({ mediaTypes: ["images"], allowsEditing: true, aspect: [1, 1], quality: 0.8 });
    if (!res.canceled && res.assets[0]) setLogo(res.assets[0].uri);
  };
  const [err, setErr] = useState<string | null>(null);
  const auto = (n: string) => n.replace(/[^A-Za-z]/g, "").slice(0, 3).toUpperCase();
  const submit = () => {
    if (!name.trim()) return setErr("Give the team a name.");
    if (!league) return setErr("Pick a league (add more in Settings).");
    if (note.length > NOTE_MAX) return setErr(`Keep the note under ${NOTE_MAX} characters.`);
    if (team) { updateTeam(team.id, { name: name.trim(), short: (short || auto(name)).toUpperCase(), league, logo, note: note.trim() || undefined }); onSaved?.(); return; }
    const t = addTeam({ name: name.trim(), short: (short || auto(name)).toUpperCase(), league, color, logo, note: note.trim() || undefined, lastSaved: new Date().toISOString().slice(0, 10), seasons: 1, trophies: 0, w: 0, d: 0, l: 0, pointsBySeason: [0], currentPoints: 0, monthsLogged: 0 });
    setName(""); setShort(""); setLeague(null); setLogo(undefined); setNote(""); setErr(null); onCreated(t.id);
  };
  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      <Pressable style={s.backdrop} onPress={onClose}>
        <Pressable style={s.modal} onPress={() => {}}>
          <T.h3>{team ? `Edit ${team.name}` : "New team save"}</T.h3>
          <T.muted style={{ marginBottom: space.md }}>{team ? "Change the details; seasons and logs stay as they are." : "Season 1 starts empty — log months from the team page."}</T.muted>
          <View style={{ flexDirection: "row", alignItems: "center", gap: space.md, marginBottom: space.md }}>
            <Logo label={(short || auto(name) || "?").toUpperCase()} color={color} size={64} uri={logo} />
            <View style={{ gap: 6 }}>
              <Button small onPress={pickLogo} style={{ alignSelf: "flex-start" }}>{logo ? "Change logo" : "Choose logo…"}</Button>
              {logo ? <Pressable onPress={() => setLogo(undefined)} style={{ cursor: "pointer" } as any}><T.small style={{ color: colors.muted }}>Remove · use initials</T.small></Pressable> : <T.small style={{ color: colors.muted }}>Square image works best. Without one, the initials show.</T.small>}
            </View>
          </View>
          <T.label style={{ marginBottom: 4 }}>Team name</T.label>
          <TextInput value={name} onChangeText={(v) => { setName(v); if (!short) setShort(auto(v)); }} placeholder="e.g. Verdant Athletic" placeholderTextColor={colors.muted} style={s.input} />
          <T.label style={{ marginTop: space.md, marginBottom: 4 }}>Short code</T.label>
          <TextInput value={short} onChangeText={(v) => setShort(v.slice(0, 3))} placeholder="ABC" autoCapitalize="characters" placeholderTextColor={colors.muted} style={[s.input, { width: 100 }]} />
          <T.label style={{ marginTop: space.md, marginBottom: 6 }}>League</T.label>
          <View style={{ flexDirection: "row", gap: 4, flexWrap: "wrap" }}>{leagues.map((l) => <Pill key={l.id} active={league === l.name} onPress={() => setLeague(l.name)}>{l.name}</Pill>)}</View>
          <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "baseline", marginTop: space.md, marginBottom: 4 }}>
            <T.label>Note · what kind of save is this?</T.label>
            <T.small style={{ color: note.length > NOTE_MAX ? colors.loss : colors.muted }}>{note.length}/{NOTE_MAX}</T.small>
          </View>
          <TextInput value={note} onChangeText={(v) => setNote(v.slice(0, NOTE_MAX + 20))} multiline placeholder="e.g. Road to glory from League Two, youth only" placeholderTextColor={colors.muted} style={[s.input, { minHeight: 72, textAlignVertical: "top" }]} />
          {err && <T.small style={{ color: colors.loss, marginTop: space.sm }}>{err}</T.small>}
          <View style={{ flexDirection: "row", gap: space.sm, marginTop: space.lg, justifyContent: "flex-end" }}>
            <Button onPress={onClose}>Cancel</Button>
            <Button primary onPress={submit}>{team ? "Save changes" : "Create team"}</Button>
          </View>
        </Pressable>
      </Pressable>
    </Modal>
  );
}

// ---------------- Screen B ----------------
const WINDOWS = ["Overview", "Players", "Achievements", "Monthly log"] as const;

function TeamView({ team, onSwitch }: { team: D.Team; onSwitch: (id: string) => void }) {
  const { c: colors } = useTheme();
  const s = useMemo(() => makeStyles(colors), [colors]);
  const { width } = useWindowDimensions();
  const [season, setSeason] = useState<number | null>(null);
  const [win, setWin] = useState<(typeof WINDOWS)[number]>("Overview");
  const [switcher, setSwitcher] = useState(false);
  const [editing, setEditing] = useState<"pick" | "form" | null>(null);
  const { addSeason } = useVault();
  const seasons = D.seasonsFor(team);
  const scope = season == null ? "save" : "season";
  // First load animates in; after that, tab/season switches swap content instantly.
  const [instant, setInstant] = useState(false);
  useEffect(() => { const t = setTimeout(() => setInstant(true), 1500); return () => clearTimeout(t); }, []);
  const xLabels = scope === "season" ? D.months : seasons.map((_, i) => `S${i + 1}`);
  const stacked = width < 900;

  return (
    <View style={{ flex: 1, flexDirection: stacked ? "column" : "row" }}>
      <Background />
      {/* Fixed sidebar */}
      <View style={[s.sidebar, stacked && { width: "100%", height: undefined, borderRightWidth: 0, borderBottomWidth: 1 }]}>
        <Pressable onPress={() => setSwitcher((v) => !v)} style={[s.switcher, { cursor: "pointer" } as any]}>
          <View style={{ flexDirection: "row", alignItems: "center", gap: 10, flex: 1 }}>
            <Logo label={team.short} color={team.color} size={32} uri={team.logo} />
            <View style={{ flex: 1 }}>
              <T.label>{switcher ? "Select a team" : "Team"}</T.label>
              <T.body style={{ fontWeight: "700" }} numberOfLines={1}>{team.name}</T.body>
            </View>
          </View>
          <T.mint>{switcher ? "▲" : "▼"}</T.mint>
        </Pressable>
        {switcher && (
          <View style={s.dropdown}>
            {D.teams.filter((t) => t.id !== team.id).map((t) => (
              <Pressable key={t.id} onPress={() => { onSwitch(t.id); setSwitcher(false); setSeason(null); }} style={[s.dropRow, { cursor: "pointer" } as any]}>
                <View style={{ flexDirection: "row", alignItems: "center", gap: 10 }}><Logo label={t.short} color={t.color} size={30} uri={t.logo} /><View><T.small style={{ fontWeight: "700" }}>{t.name}</T.small><T.small style={{ color: colors.muted }}>{t.league}</T.small></View></View>
              </Pressable>
            ))}
          </View>
        )}
        <T.label style={{ marginTop: space.lg }}>Seasons</T.label>
        <T.small style={{ color: colors.muted, marginBottom: space.sm }}>{season == null ? "No season selected · whole save" : `${seasons[season]} · click again to deselect`}</T.small>
        <ScrollView style={{ flex: 1 }} contentContainerStyle={{ gap: 4 }}>
          {seasons.map((sn, i) => (
            <Pressable key={sn} onPress={() => setSeason(season === i ? null : i)} style={[s.seasonRow, season === i && s.seasonActive, { cursor: "pointer" } as any]}>
              <T.small style={{ color: season === i ? colors.onMint : colors.text }}>{sn}</T.small>
              <T.small style={{ color: season === i ? colors.onMint : colors.muted }}>{team.pointsBySeason[i]} pts</T.small>
            </Pressable>
          ))}
        </ScrollView>
        <Button primary style={{ marginTop: space.md }} onPress={() => setSeason(addSeason(team.id))}>+ Add a season</Button>
      </View>

      {/* Main */}
      <RevealScroll style={{ flex: 1 }} contentContainerStyle={s.main}>
        <Reveal style={s.teamHero}>
          <View style={{ flexDirection: "row", alignItems: "center", gap: space.lg, flex: 1 }}>
            <Logo label={team.short} color={team.color} size={84} uri={team.logo} />
            <View>
              <T.h1>{team.name}</T.h1>
              <T.muted>{team.league} · {scope === "season" ? seasons[season!] : `${team.seasons} seasons saved`}</T.muted>
              {!!team.note && <T.small style={{ color: colors.muted, marginTop: 4, maxWidth: 560 }}>{team.note}</T.small>}
            </View>
          </View>
          <Button onPress={() => setEditing(season == null ? "pick" : "form")}>Edit stats</Button>
        </Reveal>
        <Reveal style={{ flexDirection: "row", gap: 4, marginTop: space.lg, marginBottom: space.lg }}>
          {WINDOWS.map((w) => <Pill key={w} active={win === w} onPress={() => setWin(w)}>{w}</Pill>)}
        </Reveal>
        <RevealInstant.Provider value={instant}>
          {win === "Overview" && <Overview team={team} scope={scope} season={season} xLabels={xLabels} />}
          {win === "Players" && <Players team={team} scope={scope} season={season} />}
          {win === "Achievements" && <Achievements team={team} scope={scope} season={season} />}
          {win === "Monthly log" && <MonthlyLog team={team} scope={scope} season={season} />}
        </RevealInstant.Provider>
      </RevealScroll>

      <EditStats mode={editing} team={team} seasons={seasons} seasonIdx={season} onPick={(i) => { setSeason(i); setEditing("form"); }} onClose={() => setEditing(null)} />
    </View>
  );
}

function Overview({ team, scope, season, xLabels }: { team: D.Team; scope: string; season: number | null; xLabels: string[] }) {
  const { c: colors } = useTheme();
  const s = useMemo(() => makeStyles(colors), [colors]);
  const { width } = useWindowDimensions();
  const [stat, setStat] = useState("Goals");
  const [chartOn, setChartOn] = useState(false);
  const data = D.scopeData(team, season);
  const rec = data.record.reduce((a, m) => ({ w: a.w + m.w, d: a.d + m.d, l: a.l + m.l }), { w: 0, d: 0, l: 0 });
  const total = rec.w + rec.d + rec.l;
  const stats = ["Goals", "Assists", "Goal contributions", ...(scope === "save" ? ["Points"] : [])];
  useEffect(() => { if (scope === "season" && stat === "Points") setStat("Goals"); }, [scope]);
  const top5 = [...data.players].sort((a, b) => D.sum(b.goals) - D.sum(a.goals)).slice(0, 5);
  const bestSeasons = team.pointsBySeason.map((total, idx) => ({ total, idx })).sort((a, b) => b.total - a.total).slice(0, 5);
  const pick = (p: D.Player) => stat === "Goals" ? p.goals : stat === "Assists" ? p.assists : p.goals.map((g, i) => g + p.assists[i]);
  const chartX = scope === "season" ? D.months : seasonTicks(data.months);
  const chartTip = scope === "season" ? undefined : monthLabel;
  const ratings = data.players.map((p) => p.rating);
  const monthAvg = (i: number) => ratings.reduce((a, r) => a + (r[i] ?? r[r.length - 1]), 0) / ratings.length;
  // Season scope: one bar per month. Save scope: three bars per season (early / mid / late thirds).
  const avg = scope === "season"
    ? D.months.map((_, i) => +monthAvg(i).toFixed(2))
    : Array.from({ length: team.seasons * 3 }, (_, k) => {
        const third = k % 3, sIdx = Math.floor(k / 3);
        const ms = third === 0 ? [0, 1, 2] : third === 1 ? [3, 4, 5, 6] : [7, 8, 9];
        return +(ms.reduce((a, m) => a + monthAvg(sIdx * MONTHS_PER_SEASON + m), 0) / ms.length).toFixed(2);
      });
  const avgLabels = scope === "season" ? D.months : avg.map((_, k) => (k % 3 === 1 ? `S${Math.floor(k / 3) + 1}` : ""));
  const avgColors = scope === "season" ? undefined : avg.map((_, k) => (Math.floor(k / 3) % 2 === 0 ? colors.series[0] : colors.series[1]));
  const { leagues } = useSettings();
  const trophies = leagues.find((l) => l.name === team.league)?.trophies ?? D.trophyDefs[team.league] ?? [];

  return (
    <>
      <View style={[s.two, width < 900 && { flexDirection: "column" }]}>
        <Reveal style={{ flex: 1 }}>
          <Card>
            <SectionLabel>Record · {scope === "season" ? "this season" : "whole save"}</SectionLabel>
            <View style={s.recordBar}>
              <View style={{ flex: rec.w, backgroundColor: colors.win }} />
              <View style={{ flex: rec.d, backgroundColor: colors.draw }} />
              <View style={{ flex: rec.l, backgroundColor: colors.loss }} />
            </View>
            <View style={{ flexDirection: "row", gap: space.lg, marginTop: space.md }}>
              {[["W", rec.w, colors.win], ["D", rec.d, colors.draw], ["L", rec.l, colors.loss]].map(([k, v, c]) => (
                <View key={String(k)}><T.h2 style={{ color: String(c) }}>{v}</T.h2><T.label>{k}</T.label></View>
              ))}
              <View style={{ marginLeft: "auto", alignItems: "flex-end" }}><T.h2>{rec.w * 3 + rec.d}</T.h2><T.label>points · {total} games</T.label></View>
            </View>
          </Card>
        </Reveal>
        <Reveal delay={100} style={{ flex: 1 }}>
          <Card style={{ flex: 1 }}>
            <SectionLabel>Ballon d'Or</SectionLabel>
            {scope === "season" ? (
              D.ballonDorSeason && season === team.seasons - 1 ? <><T.h2>{D.ballonDorSeason}</T.h2><T.muted>won it this season</T.muted></> : <T.muted>No one won it</T.muted>
            ) : (
              <><T.h2>{D.ballonDorSave.player}</T.h2><T.muted>{D.ballonDorSave.count}× winner · most decorated in this save</T.muted></>
            )}
          </Card>
        </Reveal>
      </View>

      <Reveal style={{ marginTop: space.md }}>
        <Card>
          <SectionLabel>Trophies · {scope === "season" ? "won this season" : "whole save"}</SectionLabel>
          <View style={{ flexDirection: "row", flexWrap: "wrap", gap: space.sm }}>
            {trophies.map((t) => {
              const count = scope === "season" ? (D.getSeasonData(team.id, season!).trophies.includes(t) ? 1 : 0) : D.trophyCount(team, t);
              const won = count > 0;
              return (
                <View key={t} style={[s.trophy, won && s.trophyWon]}>
                  <T.small style={{ fontWeight: "700", color: won ? colors.mint : colors.muted }}>{t}</T.small>
                  {scope === "save" && <T.h3 style={{ color: won ? colors.text : colors.muted }}>{count}</T.h3>}
                </View>
              );
            })}
          </View>
        </Card>
      </Reveal>

      <Reveal style={{ marginTop: space.md }} onVisible={setChartOn}>
        <Card>
          <View style={s.chartHead}>
            <View>
              <T.h3>{stat === "Points" ? "Best seasons · points" : `Top 5 players · ${stat.toLowerCase()}`}</T.h3>
              <T.small style={{ color: colors.muted }}>{stat === "Points" ? "top 5 seasons by points · running total by month" : scope === "season" ? "running total by month this season" : "running total by month across the save · ticks mark seasons"}</T.small>
            </View>
            <View style={{ flexDirection: "row", gap: 4, flexWrap: "wrap" }}>{stats.map((st) => <Pill key={st} active={stat === st} onPress={() => setStat(st)}>{st}</Pill>)}</View>
          </View>
          {stat === "Points" ? (
            <LineChart play={chartOn} xLabels={D.months} height={280} yFormat={(v) => `${v} pts`}
              series={bestSeasons.map((b, i) => ({ name: `Season ${b.idx + 1} · ${b.total} pts`, color: colors.series[i], values: monthlyCumulative(b.total, MONTHS_PER_SEASON, b.idx + 7) }))} />
          ) : (
            <LineChart play={chartOn} xLabels={chartX} xTooltip={chartTip} height={280} series={top5.map((p, i) => ({ name: p.name, color: colors.series[i], values: D.cumulative(pick(p)) }))} />
          )}
        </Card>
      </Reveal>

      <Reveal style={{ marginTop: space.md }}>
        <Card>
          <T.h3 style={{ marginBottom: space.md }}>Average match rating · {scope === "season" ? "per month" : "per third of each season"}</T.h3>
          <BarChart values={avg} labels={avgLabels} barColors={avgColors} yMin={6} yMax={8.5} />
        </Card>
      </Reveal>
    </>
  );
}

function Players({ team, scope, season }: { team: D.Team; scope: string; season: number | null }) {
  const { c: colors } = useTheme();
  const s = useMemo(() => makeStyles(colors), [colors]);
  const [view, setView] = useState<"List" | "Graph">("List");
  const [stat, setStat] = useState("Avg match rating");
  const [chartOn, setChartOn] = useState(false);
  const data = D.scopeData(team, season);
  const stats = ["Avg match rating", "Goals", "Assists", "Goal contributions"];
  const anyBallon = data.players.some((p) => p.ballonDors > 0);
  const val = (p: D.Player) => stat === "Goals" ? p.goals : stat === "Assists" ? p.assists : stat === "Goal contributions" ? p.goals.map((g, i) => g + p.assists[i]) : p.rating;
  const top = [...data.players].sort((a, b) => D.sum(b.goals) + D.sum(b.assists) - D.sum(a.goals) - D.sum(a.assists)).slice(0, 5);
  const series = top.map((p, i) => ({ name: p.name, color: colors.series[i], values: stat === "Avg match rating" ? val(p) : D.cumulative(val(p)) }));
  const chartX = scope === "season" ? D.months : seasonTicks(data.months);
  const cols = ["Player", "Pos", "Apps", "Goals", "Assists", "G+A", "CS", "Avg"];
  return (
    <>
      <Reveal style={{ flexDirection: "row", gap: 4, marginBottom: space.md }}>
        <Pill active={view === "List"} onPress={() => setView("List")}>List view</Pill>
        <Pill active={view === "Graph"} onPress={() => setView("Graph")}>Graph view</Pill>
      </Reveal>
      {view === "List" ? (
        <Reveal><Card style={{ padding: 0 }}>
          <View style={[s.tr, s.th]}>{cols.map((c, i) => <T.label key={c} style={[s.td, i === 0 && { flex: 3 }]}>{c}</T.label>)}</View>
          {[...data.players].sort((a, b) => D.sum(b.goals) - D.sum(a.goals)).map((p, r) => (
            <View key={p.id} style={[s.tr, r % 2 ? { backgroundColor: colors.surfaceRaised } : null]}>
              <T.small style={[s.td, { flex: 3, fontWeight: "700" }]}>{p.name}</T.small>
              <T.small style={s.td}>{p.pos}</T.small>
              <T.small style={s.td}>{D.sum(p.apps)}</T.small>
              <T.small style={s.td}>{D.sum(p.goals)}</T.small>
              <T.small style={s.td}>{D.sum(p.assists)}</T.small>
              <T.small style={s.td}>{D.sum(p.goals) + D.sum(p.assists)}</T.small>
              <T.small style={s.td}>{D.sum(p.cleanSheets)}</T.small>
              <T.small style={[s.td, { color: colors.mint, fontWeight: "700" }]}>{(D.sum(p.rating) / p.rating.length).toFixed(2)}</T.small>
            </View>
          ))}
        </Card></Reveal>
      ) : (
        <>
          <Reveal onVisible={setChartOn}><Card>
            <View style={s.chartHead}>
              <T.h3>{stat}</T.h3>
              <View style={{ flexDirection: "row", gap: 4, flexWrap: "wrap" }}>{stats.map((st) => <Pill key={st} active={stat === st} onPress={() => setStat(st)}>{st}</Pill>)}</View>
            </View>
            <LineChart play={chartOn} xLabels={chartX} xTooltip={scope === "season" ? undefined : monthLabel} height={280} series={series} />
          </Card></Reveal>
          {anyBallon && (
            <Reveal style={{ marginTop: space.md }}><Card>
              <T.h3 style={{ marginBottom: space.md }}>Ballon d'Ors won</T.h3>
              <BarChart values={data.players.filter((p) => p.ballonDors > 0).map((p) => p.ballonDors)} labels={data.players.filter((p) => p.ballonDors > 0).map((p) => p.name)} yMax={3} height={180} />
            </Card></Reveal>
          )}
        </>
      )}
    </>
  );
}

function Achievements({ team, scope, season }: { team: D.Team; scope: string; season: number | null }) {
  const { c: colors } = useTheme();
  const s = useMemo(() => makeStyles(colors), [colors]);
  const results = scope === "season" && season != null ? seasonLadders(team, season) : saveLadders(team);
  const tierIdx = (t: D.Tier) => TIERS.indexOf(t);
  return (
    <View style={{ gap: space.md }}>
      <T.small style={{ color: colors.muted }}>{scope === "season" ? `Season ${season! + 1} graded on the season ladders.` : `Whole save graded on per-season rates × ${team.seasons} season${team.seasons === 1 ? "" : "s"}.`} One badge per ladder, at the highest tier reached.</T.small>
      {TIERS.map((t, i) => {
        const earned = results.filter((r) => r.tier === t);
        const locked = results.filter((r) => r.needed[t] && (r.tier == null || tierIdx(r.tier) > i));
        return (
          <Reveal key={t} delay={i * 60}>
            <Card>
              <View style={{ flexDirection: "row", alignItems: "center", gap: space.sm, marginBottom: space.md }}>
                <View style={{ width: 10, height: 10, borderRadius: 5, backgroundColor: D.tierColor[t] }} />
                <T.h3>{t}</T.h3>
                <T.label style={{ marginLeft: "auto" }}>{earned.length} earned</T.label>
              </View>
              <View style={{ flexDirection: "row", gap: space.sm, flexWrap: "wrap" }}>
                {earned.map((r) => (
                  <View key={r.ladder} style={[s.trophy, { borderColor: D.tierColor[t], backgroundColor: D.tierColor[t] + "22" }]}>
                    <T.small style={{ fontWeight: "700", color: t === "Average" ? colors.text : D.tierColor[t] }}>{r.ladder}</T.small>
                    <T.h3>{r.format(r.value)}</T.h3>
                  </View>
                ))}
                {locked.map((r) => (
                  <View key={r.ladder} style={[s.trophy, { borderStyle: "dashed", opacity: 0.55 }]}>
                    <T.small style={{ color: colors.muted }}>{r.ladder}</T.small>
                    <T.small style={{ color: colors.muted }}>{r.needed[t]} · now {r.format(r.value)}</T.small>
                  </View>
                ))}
                {earned.length === 0 && locked.length === 0 && <T.muted style={{ fontSize: 13 }}>Nothing at this tier.</T.muted>}
              </View>
            </Card>
          </Reveal>
        );
      })}
    </View>
  );
}

function MonthlyLog({ team, scope, season }: { team: D.Team; scope: string; season: number | null }) {
  const { c: colors } = useTheme();
  const s = useMemo(() => makeStyles(colors), [colors]);
  if (scope === "save" || season == null) return <Reveal><Card><T.muted>Select a season in the sidebar to see its monthly log.</T.muted></Card></Reveal>;
  const sd = D.getSeasonData(team.id, season);
  return (
    <View style={{ gap: space.md }}>
      {D.months.map((m, i) => {
        const r = sd.record[i];
        const scorers = sd.players.filter((p) => p.goals[i] > 0 || p.assists[i] > 0).sort((a, b) => b.goals[i] - a.goals[i]);
        const logged = r.w + r.d + r.l > 0 || sd.players.some((p) => p.apps[i] > 0);
        return (
          <Reveal key={m} delay={i * 40}>
            <Card style={!logged ? { opacity: 0.5 } : undefined}>
              <View style={{ flexDirection: "row", alignItems: "center", gap: space.md }}>
                <T.h3 style={{ width: 60 }}>{m}</T.h3>
                {logged ? (<>
                  <T.small style={{ color: colors.win }}>{r.w}W</T.small><T.small style={{ color: colors.draw }}>{r.d}D</T.small><T.small style={{ color: colors.loss }}>{r.l}L</T.small>
                  <T.small style={{ color: colors.muted, marginLeft: "auto" }}>{r.w * 3 + r.d} pts</T.small>
                </>) : <T.small style={{ color: colors.muted }}>not logged yet</T.small>}
              </View>
              {logged && (
                <View style={{ flexDirection: "row", flexWrap: "wrap", gap: space.sm, marginTop: space.md }}>
                  {scorers.map((p) => <View key={p.id} style={s.chip}><T.small>{p.name} <T.mint>{p.goals[i]}g</T.mint> {p.assists[i]}a</T.small></View>)}
                </View>
              )}
            </Card>
          </Reveal>
        );
      })}
    </View>
  );
}

type EditRow = { playerId: string; name: string; pos: string; goals: string; assists: string; apps: string; cs: string; rating: string };

function EditStats({ mode, team, seasons, seasonIdx, onPick, onClose }: { mode: "pick" | "form" | null; team: D.Team; seasons: string[]; seasonIdx: number | null; onPick: (i: number) => void; onClose: () => void }) {
  const { c: colors } = useTheme();
  const s = useMemo(() => makeStyles(colors), [colors]);
  const { height: vh } = useWindowDimensions();
  const { bump } = useVault();
  const [month, setMonth] = useState(0);
  const [rec, setRec] = useState({ w: "", d: "", l: "" });
  const [rows, setRows] = useState<EditRow[]>([]);
  const [query, setQuery] = useState("");
  const [picking, setPicking] = useState<D.Player | null>(null);
  const [pos, setPos] = useState("ST");
  const sd = seasonIdx == null ? null : D.getSeasonData(team.id, seasonIdx);
  const { leagues } = useSettings();
  const leagueTrophies = leagues.find((l) => l.name === team.league)?.trophies ?? D.trophyDefs[team.league] ?? [];
  const [won, setWon] = useState<string[]>([]);
  useEffect(() => { if (sd) setWon([...sd.trophies]); }, [mode, seasonIdx]);
  const hasData = (m: number) => !!sd && (sd.players.some((p) => p.apps[m] > 0) || sd.record[m].w + sd.record[m].d + sd.record[m].l > 0);
  // Load what was saved for the month
  const load = (m: number) => {
    if (!sd) return;
    const r = sd.record[m];
    setRec({ w: String(r.w), d: String(r.d), l: String(r.l) });
    setRows(sd.players.filter((p) => p.apps[m] > 0).map((p) => ({ playerId: p.id, name: p.name, pos: p.pos, goals: String(p.goals[m]), assists: String(p.assists[m]), apps: String(p.apps[m]), cs: String(p.cleanSheets[m]), rating: p.rating[m].toFixed(1) })));
    setQuery(""); setPicking(null);
  };
  useEffect(() => { if (mode === "form") load(month); }, [mode, month, seasonIdx]);
  const suggestions = query.length > 0 && !picking && sd ? sd.players.filter((p) => !rows.some((r) => r.playerId === p.id) && p.name.toLowerCase().includes(query.toLowerCase())).slice(0, 4) : [];
  const setRow = (i: number, k: keyof EditRow, v: string) => setRows(rows.map((r, j) => (j === i ? { ...r, [k]: v } : r)));
  const save = () => {
    if (!sd) return;
    const n = (v: string) => Number(v) || 0;
    sd.record[month] = { w: n(rec.w), d: n(rec.d), l: n(rec.l) };
    sd.players.forEach((p) => { if (!rows.some((r) => r.playerId === p.id)) { p.apps[month] = 0; p.goals[month] = 0; p.assists[month] = 0; p.cleanSheets[month] = 0; } });
    rows.forEach((r) => { const p = sd.players.find((x) => x.id === r.playerId); if (!p) return; p.pos = r.pos; p.goals[month] = n(r.goals); p.assists[month] = n(r.assists); p.apps[month] = n(r.apps); p.cleanSheets[month] = n(r.cs); p.rating[month] = Number(r.rating) || p.rating[month]; });
    sd.trophies = leagueTrophies.filter((t) => won.includes(t));
    team.trophies = D.trophiesTotal(team);
    // keep the team's season totals in step with the logged months
    const pts = sd.record.reduce((a, m) => a + m.w * 3 + m.d, 0);
    if (seasonIdx != null) { team.pointsBySeason[seasonIdx] = pts; if (seasonIdx === team.seasons - 1) { team.currentPoints = pts; team.monthsLogged = sd.record.filter((m) => m.w + m.d + m.l > 0).length; } }
    bump(); onClose();
  };
  return (
    <Modal visible={!!mode} transparent animationType="fade" onRequestClose={onClose}>
      <Pressable style={s.backdrop} onPress={onClose}>
        <Pressable style={[s.modal, { maxWidth: 760, maxHeight: vh * 0.85, padding: 0 }]} onPress={() => {}}>
          {mode === "pick" ? (
            <View style={{ padding: space.lg }}>
              <T.h3>Which season are you editing?</T.h3>
              <T.muted style={{ marginBottom: space.md }}>Stats are edited one season at a time.</T.muted>
              {seasons.map((sn, i) => <Pressable key={sn} onPress={() => onPick(i)} style={[s.seasonRow, { cursor: "pointer" } as any]}><T.small>{sn}</T.small></Pressable>)}
            </View>
          ) : (
            <>
            <View style={s.modalHead}>
              <View style={{ flex: 1 }}>
                <T.h3>Edit stats · {seasonIdx != null ? seasons[seasonIdx] : ""}</T.h3>
                <T.small style={{ color: colors.muted }}>Trophies first, then the month. Months with a dot already have data; their numbers load so you can correct them.</T.small>
              </View>
              <MonthDropdown value={month} onChange={setMonth} hasData={hasData} />
              <Pressable onPress={onClose} accessibilityLabel="Close" style={[s.removeBtn, { width: 34, height: 34, borderRadius: 17 }, { cursor: "pointer" } as any]}><T.body style={{ fontWeight: "800" }}>×</T.body></Pressable>
            </View>
            <ScrollView style={{ flexShrink: 1 }} contentContainerStyle={{ padding: space.lg, paddingTop: space.sm }}>
              <T.label style={{ marginBottom: space.sm }}>Trophies won this season · click to toggle</T.label>
              <View style={{ flexDirection: "row", flexWrap: "wrap", gap: space.sm, marginBottom: space.lg }}>
                {leagueTrophies.map((t) => {
                  const on = won.includes(t);
                  return (
                    <Pressable key={t} onPress={() => setWon(on ? won.filter((x) => x !== t) : [...won, t])} style={[s.trophy, on && s.trophyWon, { cursor: "pointer" } as any]}>
                      <T.small style={{ fontWeight: "700", color: on ? colors.mint : colors.muted }}>{on ? "🏆 " : ""}{t}</T.small>
                    </Pressable>
                  );
                })}
                {leagueTrophies.length === 0 && <T.muted style={{ fontSize: 13 }}>No trophies defined for {team.league} — add them in Settings → Leagues.</T.muted>}
              </View>
              <T.label style={{ marginBottom: space.sm }}>Team · {D.months[month]}</T.label>
              <View style={{ flexDirection: "row", gap: space.sm, marginBottom: space.lg }}>
                <Field label="Wins" value={rec.w} onChange={(v) => setRec({ ...rec, w: v })} />
                <Field label="Draws" value={rec.d} onChange={(v) => setRec({ ...rec, d: v })} />
                <Field label="Losses" value={rec.l} onChange={(v) => setRec({ ...rec, l: v })} />
              </View>
              <T.label style={{ marginBottom: space.sm }}>Players · {rows.length} with stats this month</T.label>
              {rows.map((r, i) => (
                <View key={r.playerId} style={s.editRow}>
                  <View style={{ width: 150, flexGrow: 1 }}>
                    <T.small style={{ fontWeight: "700" }} numberOfLines={1}>{r.name}</T.small>
                    <PosSelect value={r.pos} onChange={(p) => setRow(i, "pos", p)} />
                  </View>
                  <Field label="G" value={r.goals} onChange={(v) => setRow(i, "goals", v)} compact />
                  <Field label="A" value={r.assists} onChange={(v) => setRow(i, "assists", v)} compact />
                  <Field label="Apps" value={r.apps} onChange={(v) => setRow(i, "apps", v)} compact />
                  <Field label="CS" value={r.cs} onChange={(v) => setRow(i, "cs", v)} compact />
                  <Field label="Avg" value={r.rating} onChange={(v) => setRow(i, "rating", v)} compact />
                  <Pressable onPress={() => setRows(rows.filter((_, j) => j !== i))} accessibilityLabel={`Remove ${r.name}`} style={[s.removeBtn, { cursor: "pointer" } as any]}><T.small style={{ color: colors.muted, fontWeight: "800" }}>×</T.small></Pressable>
                </View>
              ))}
              <T.label style={{ marginTop: space.md, marginBottom: space.sm }}>Add a player</T.label>
              <TextInput value={picking ? picking.name : query} onChangeText={(t) => { setQuery(t); setPicking(null); }} placeholder="Start typing a name…" placeholderTextColor={colors.muted} style={s.input} />
              {suggestions.length > 0 && (
                <View style={s.dropdown}>{suggestions.map((p) => <Pressable key={p.id} onPress={() => { setPicking(p); setQuery(p.name); setPos(p.pos); }} style={[s.dropRow, { cursor: "pointer" } as any]}><T.small>{p.name}</T.small><T.small style={{ color: colors.muted }}>{p.pos}</T.small></Pressable>)}</View>
              )}
              {picking && (
                <>
                  <T.label style={{ marginTop: space.md, marginBottom: space.sm }}>Position played</T.label>
                  <View style={{ flexDirection: "row", gap: 4, flexWrap: "wrap", marginBottom: space.md }}>
                    {["GK", "CB", "LB", "RB", "CDM", "CM", "CAM", "LW", "RW", "ST"].map((p) => <Pill key={p} active={pos === p} onPress={() => setPos(p)}>{p}</Pill>)}
                  </View>
                  <Button small onPress={() => { setRows([...rows, { playerId: picking.id, name: picking.name, pos, goals: "0", assists: "0", apps: "1", cs: "0", rating: "6.5" }]); setPicking(null); setQuery(""); }}>Add {picking.name} to {D.months[month]}</Button>
                </>
              )}
            </ScrollView>
            <View style={s.modalFoot}>
              <Button onPress={onClose}>Cancel</Button>
              <Button primary onPress={save}>Save month</Button>
            </View>
            </>
          )}
        </Pressable>
      </Pressable>
    </Modal>
  );
}

/** Month select box for the edit form; dotted entries already have data. */
function MonthDropdown({ value, onChange, hasData }: { value: number; onChange: (m: number) => void; hasData: (m: number) => boolean }) {
  const { c: colors } = useTheme();
  const s = useMemo(() => makeStyles(colors), [colors]);
  const [open, setOpen] = useState(false);
  return (
    <View style={{ zIndex: 80, width: 150 }}>
      <Pressable onPress={() => setOpen((v) => !v)} style={[s.select, open && { borderColor: colors.mint }, { cursor: "pointer" } as any]}>
        <T.small style={{ fontWeight: "700" }}>{hasData(value) ? "● " : ""}{D.months[value]}</T.small>
        <T.mint style={{ fontSize: 11 }}>{open ? "▲" : "▼"}</T.mint>
      </Pressable>
      {open && (
        <View style={[s.dropdown, { position: "absolute", top: 42, left: 0, right: 0, zIndex: 90 }]}>
          {D.months.map((m, i) => (
            <Pressable key={m} onPress={() => { onChange(i); setOpen(false); }} style={[s.dropRow, value === i && { backgroundColor: colors.mintDim }, { cursor: "pointer" } as any]}>
              <T.small style={value === i ? { color: colors.mint, fontWeight: "700" } : undefined}>{hasData(i) ? "● " : "   "}{m}</T.small>
            </Pressable>
          ))}
        </View>
      )}
    </View>
  );
}

function Field({ label, value, onChange, compact }: { label: string; value?: string; onChange?: (v: string) => void; compact?: boolean }) {
  const { c: colors } = useTheme();
  const s = useMemo(() => makeStyles(colors), [colors]);
  return (
    <View style={compact ? { width: 64 } : { minWidth: 90, flex: 1 }}>
      <T.label style={{ marginBottom: 4 }}>{label}</T.label>
      <TextInput value={value} onChangeText={onChange} placeholder="0" placeholderTextColor={colors.muted} keyboardType="numeric" style={[s.input, compact && { paddingVertical: 6, paddingHorizontal: 8, textAlign: "center" }]} />
    </View>
  );
}

/** Position picker used in edit rows: a small button that expands into pills inline. */
function PosSelect({ value, onChange }: { value: string; onChange: (p: string) => void }) {
  const { c: colors } = useTheme();
  const s = useMemo(() => makeStyles(colors), [colors]);
  const [open, setOpen] = useState(false);
  if (!open) return <Pressable onPress={() => setOpen(true)} style={[s.posBtn, { cursor: "pointer" } as any]}><T.small style={{ color: colors.mint, fontWeight: "700" }}>{value} ▾</T.small></Pressable>;
  return (
    <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 2, marginTop: 2 }}>
      {["GK", "CB", "LB", "RB", "CDM", "CM", "CAM", "LW", "RW", "ST"].map((p) => <Pill key={p} active={value === p} onPress={() => { onChange(p); setOpen(false); }} style={{ paddingHorizontal: 7, paddingVertical: 2 }}>{p}</Pill>)}
    </View>
  );
}

const makeStyles = (colors: Colors) => StyleSheet.create({
  hero: { paddingTop: 72 },
  glow: { textShadow: `0 0 24px ${colors.mintGlow}` } as any,
  countChip: { flexDirection: "row", alignItems: "center", paddingHorizontal: 12, paddingVertical: 4, borderRadius: radius.pill, borderWidth: 1, borderColor: colors.border, backgroundColor: colors.surface },
  grid: { flexDirection: "row", flexWrap: "wrap", marginHorizontal: -space.sm },
  addTile: { height: 180, borderRadius: radius.card, borderWidth: 1.5, borderStyle: "dashed", borderColor: colors.mint, alignItems: "center", justifyContent: "center", backgroundColor: colors.mintDim },
  teamCard: { height: 180, alignItems: "center", justifyContent: "flex-start", padding: space.md },
  notePanel: { alignSelf: "stretch", marginTop: space.sm, padding: 8, borderRadius: radius.sm, backgroundColor: colors.surfaceRaised, borderWidth: 1, borderColor: colors.border, minHeight: 48 },
  kebab: { position: "absolute", top: space.sm + 8, right: space.sm + 8, width: 30, height: 30, borderRadius: 15, alignItems: "center", justifyContent: "center", backgroundColor: colors.surfaceRaised, borderWidth: 1, borderColor: colors.border },
  kebabMenu: { position: "absolute", top: space.sm + 44, right: space.sm + 8, width: 150, borderRadius: radius.tile, borderWidth: 1, borderColor: colors.borderStrong, backgroundColor: colors.surfaceRaised, overflow: "hidden", zIndex: 40, boxShadow: "0 12px 30px rgba(0,0,0,0.45)" } as any,
  chartHead: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: space.sm, marginBottom: space.md },
  sidebar: { width: layout.sidebar, borderRightWidth: 1, borderRightColor: colors.border, padding: space.md, backgroundColor: "rgba(18,24,21,0.7)" },
  switcher: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", padding: 14, borderRadius: radius.tile, borderWidth: 1, borderColor: colors.borderStrong, backgroundColor: colors.surfaceRaised },
  dropdown: { marginTop: 6, borderRadius: radius.tile, borderWidth: 1, borderColor: colors.border, backgroundColor: colors.surface, overflow: "hidden" },
  dropRow: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", gap: space.sm, padding: 10, borderBottomWidth: 1, borderBottomColor: colors.border },
  seasonRow: { flexDirection: "row", justifyContent: "space-between", padding: 10, borderRadius: radius.sm, borderWidth: 1, borderColor: colors.border },
  seasonActive: { backgroundColor: colors.mint, borderColor: colors.mint },
  main: { padding: space.lg, paddingBottom: space.xxl, width: "100%", maxWidth: layout.maxWidth, alignSelf: "center" },
  teamHero: { flexDirection: "row", alignItems: "center", gap: space.lg, paddingTop: space.lg, flexWrap: "wrap" },
  two: { flexDirection: "row", gap: space.md },
  recordBar: { flexDirection: "row", height: 12, borderRadius: 6, overflow: "hidden", gap: 2 },
  trophy: { paddingHorizontal: 14, paddingVertical: 10, borderRadius: radius.tile, borderWidth: 1, borderColor: colors.border, minWidth: 120 },
  trophyWon: { borderColor: colors.mint, backgroundColor: colors.mintDim },
  chip: { paddingHorizontal: 10, paddingVertical: 6, borderRadius: radius.pill, borderWidth: 1, borderColor: colors.border },
  tr: { flexDirection: "row", paddingHorizontal: space.md, paddingVertical: 10, alignItems: "center" },
  th: { borderBottomWidth: 1, borderBottomColor: colors.border },
  td: { flex: 1 },
  backdrop: { flex: 1, backgroundColor: "rgba(0,0,0,0.6)", alignItems: "center", justifyContent: "center", padding: space.lg },
  modal: { width: "100%", maxWidth: 560, backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.borderStrong, borderRadius: radius.card, padding: space.lg },
  editRow: { flexDirection: "row", alignItems: "flex-end", gap: space.sm, padding: space.sm, borderRadius: radius.sm, borderWidth: 1, borderColor: colors.border, backgroundColor: colors.surfaceRaised, marginBottom: space.sm, flexWrap: "wrap" },
  modalHead: { flexDirection: "row", alignItems: "center", gap: space.md, padding: space.lg, paddingBottom: space.sm, zIndex: 20 },
  modalFoot: { flexDirection: "row", gap: space.sm, justifyContent: "flex-end", padding: space.md, paddingHorizontal: space.lg, borderTopWidth: 1, borderTopColor: colors.border },
  select: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", borderWidth: 1, borderColor: colors.borderStrong, borderRadius: radius.sm, paddingHorizontal: 12, paddingVertical: 9, backgroundColor: colors.surface },
  posBtn: { alignSelf: "flex-start", paddingHorizontal: 6, paddingVertical: 2, marginTop: 2 },
  removeBtn: { width: 26, height: 26, borderRadius: 13, borderWidth: 1, borderColor: colors.border, alignItems: "center", justifyContent: "center" },
  input: { borderWidth: 1, borderColor: colors.borderStrong, borderRadius: radius.sm, paddingHorizontal: 12, paddingVertical: 10, color: colors.text, backgroundColor: colors.bg },
});
