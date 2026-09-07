import React, { useEffect, useMemo, useState } from "react";
import { Pressable, StyleSheet, View, useWindowDimensions } from "react-native";
import { useRouter } from "expo-router";
import Svg, { Path } from "react-native-svg";
import { Page } from "../components/Page";
import { Reveal, RevealInstant } from "../components/Reveal";
import { Card, Logo, Pill, SectionLabel, T } from "../components/ui";
import { RequireAuth } from "../components/RequireAuth";
import { Colors, radius, space } from "../theme";
import { useTheme } from "../lib/theme";
import * as D from "../lib/data";
import { useVault } from "../lib/vault";

// Render of pages/top-performers.md (Claude's draft). Teams / Players sections behind a switch.
export default function Screen() { return <RequireAuth><TopPerformers /></RequireAuth>; }

type Row = { id: string; label: string; sub: string; value: number; color: string; logo: string; kind: "team" | "player" };
type Board = { title: string; unit: string; rows: Row[]; format?: (v: number) => string };
type Record = { title: string; value: string; who: string; when: string };
const MEDALS = ["#FFD84D", "#C9D1DA", "#D08A4E"];

function TopPerformers() {
  useVault();
  const { c: colors } = useTheme();
  const s = useMemo(() => makeStyles(colors), [colors]);
  const { width } = useWindowDimensions();
  const narrow = width < 900;
  const [section, setSection] = useState<"Teams" | "Players">("Teams");
  const [scope, setScope] = useState(0);
  const [instant, setInstant] = useState(false);
  useEffect(() => { const t = setTimeout(() => setInstant(true), 1500); return () => clearTimeout(t); }, []);
  useEffect(() => setScope(0), [section]);
  const scopes = section === "Teams" ? ["All-time", "Best season", "Current season"] : ["All-time", "Best season", "Best month"];
  const data = section === "Teams" ? teamData(scope, colors) : playerData(scope, colors);

  return (
    <Page>
      <Reveal style={[s.hero, narrow && { flexDirection: "column", alignItems: "flex-start" }]}>
        <View style={{ flex: 1 }}>
          <T.display>Who <T.mint style={s.glow}>carried</T.mint> the vault.</T.display>
          <T.muted style={{ marginTop: space.md, fontSize: 18 }}>The best teams, players, seasons and months across every save.</T.muted>
        </View>
        <View style={s.segment}>
          {(["Teams", "Players"] as const).map((x) => <Pill key={x} active={section === x} onPress={() => setSection(x)}>{x}</Pill>)}
        </View>
      </Reveal>
      <Reveal style={{ flexDirection: "row", gap: 4, flexWrap: "wrap", marginTop: space.lg }}>
        {scopes.map((sc, i) => <Pill key={sc} active={scope === i} onPress={() => setScope(i)}>{sc}</Pill>)}
      </Reveal>

      <RevealInstant.Provider value={instant}>
        <Reveal key={section + "-podium"} style={{ marginTop: space.xl }}>
          <SectionLabel>{data.podiumTitle}</SectionLabel>
          <Podium rows={data.podium} format={data.podiumFormat} />
        </Reveal>
        <Reveal key={section + "-boards"} style={{ marginTop: space.xl }}>
          <SectionLabel>Leaderboards · {scopes[scope].toLowerCase()}</SectionLabel>
          <View style={s.grid}>
            {data.boards.map((b) => (
              <View key={b.title} style={{ width: width < 700 ? "100%" : width < 1100 ? "50%" : "33.333%", padding: space.sm }}>
                <Leaderboard board={b} />
              </View>
            ))}
          </View>
        </Reveal>
        <Reveal key={section + "-records"} style={{ marginTop: space.xl }}>
          <SectionLabel>Record book</SectionLabel>
          <View style={[s.records, narrow && { flexDirection: "column" }]}>
            {data.records.map((r) => (
              <Card key={r.title} style={{ flex: 1 }}>
                <T.label>{r.title}</T.label>
                <T.h1 style={{ marginTop: space.xs, color: colors.mint }}>{r.value}</T.h1>
                <T.small style={{ fontWeight: "700", marginTop: space.xs }}>{r.who}</T.small>
                <T.small style={{ color: colors.muted }}>{r.when}</T.small>
              </Card>
            ))}
          </View>
        </Reveal>
      </RevealInstant.Provider>
    </Page>
  );
}

function open(router: ReturnType<typeof useRouter>, r: Row) {
  router.push(r.kind === "team" ? ({ pathname: "/teams", params: { team: r.id } } as any) : ({ pathname: "/players", params: { player: r.id } } as any));
}

function Podium({ rows, format }: { rows: Row[]; format: (v: number) => string }) {
  const { c: colors } = useTheme();
  const s = useMemo(() => makeStyles(colors), [colors]);
  const { width } = useWindowDimensions();
  const router = useRouter();
  const order = width < 600 ? [0, 1, 2] : [1, 0, 2];
  const heights = [150, 110, 90];
  return (
    <View style={[s.podium, width < 600 && { flexDirection: "column", alignItems: "stretch" }]}>
      {order.map((i) => rows[i] && (
        <Pressable key={rows[i].id} onPress={() => open(router, rows[i])} style={[s.podiumCol, { cursor: "pointer" } as any]}>
          <Logo label={rows[i].logo} color={rows[i].color} size={i === 0 ? 64 : 48} />
          <T.h3 style={{ marginTop: space.sm, textAlign: "center" }} numberOfLines={1}>{rows[i].label}</T.h3>
          <T.small style={{ color: colors.muted }} numberOfLines={1}>{rows[i].sub}</T.small>
          <View style={[s.podiumBlock, { height: width < 600 ? 64 : heights[i], borderColor: MEDALS[i] }]}>
            <View style={[s.medal, { backgroundColor: MEDALS[i] }]}><T.small style={{ fontWeight: "800", color: "#111" }}>{i + 1}</T.small></View>
            <T.h2 style={{ color: i === 0 ? colors.mint : colors.text }}>{format(rows[i].value)}</T.h2>
          </View>
        </Pressable>
      ))}
    </View>
  );
}

function Leaderboard({ board }: { board: Board }) {
  const { c: colors } = useTheme();
  const s = useMemo(() => makeStyles(colors), [colors]);
  const router = useRouter();
  const max = Math.max(1, ...board.rows.map((r) => r.value));
  const fmt = board.format ?? ((v: number) => String(v));
  return (
    <Card style={{ padding: space.md }}>
      <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "baseline", marginBottom: space.sm }}>
        <T.h3>{board.title}</T.h3><T.label>{board.unit}</T.label>
      </View>
      {board.rows.filter((r) => r.value > 0).slice(0, 5).map((r, i) => (
        <Pressable key={r.id} onPress={() => open(router, r)} style={[s.lbRow, { cursor: "pointer" } as any]}>
          <View style={[s.lbBar, { width: `${(r.value / max) * 100}%`, backgroundColor: i === 0 ? colors.mintDim : colors.surfaceRaised }]} />
          <T.small style={[s.rank, i === 0 && { color: colors.mint }]}>{i === 0 ? <Crown color={colors.mint} /> : i + 1}</T.small>
          <Logo label={r.logo} color={r.color} size={26} />
          <View style={{ flex: 1 }}>
            <T.small style={{ fontWeight: "700" }} numberOfLines={1}>{r.label}</T.small>
            <T.small style={{ color: colors.muted, fontSize: 11 }} numberOfLines={1}>{r.sub}</T.small>
          </View>
          <T.body style={{ fontWeight: "800", color: i === 0 ? colors.mint : colors.text }}>{fmt(r.value)}</T.body>
        </Pressable>
      ))}
    </Card>
  );
}

const Crown = ({ color }: { color: string }) => (
  <Svg width={14} height={14} viewBox="0 0 24 24"><Path d="M3 18h18l-1.5-9-4.5 4-3-7-3 7-4.5-4L3 18z" fill={color} /></Svg>
);

// ---------------- data shaping (placeholder maths over lib/data) ----------------
function teamData(scope: number, colors: Colors) {
  const row = (t: D.Team, value: number, sub?: string): Row => ({ id: t.id, label: t.name, sub: sub ?? t.league, value, color: t.color, logo: t.short, kind: "team" });
  const games = (t: D.Team) => Math.max(1, t.w + t.d + t.l);
  const bestSeason = (t: D.Team) => t.pointsBySeason.reduce((b, p, i) => (p > b.p ? { p, i } : b), { p: 0, i: 0 });
  const seasonGames = 38;
  const rank = (f: (t: D.Team) => number, sub?: (t: D.Team) => string) => [...D.teams].map((t) => row(t, +f(t).toFixed(2), sub?.(t))).sort((a, b) => b.value - a.value);
  const pct = (v: number) => `${Math.round(v * 100)}%`;
  let boards: Board[], podium: Row[], podiumTitle: string, podiumFormat = (v: number) => v.toFixed(2);
  if (scope === 0) {
    boards = [
      { title: "Most points", unit: "all seasons", rows: rank((t) => D.sum(t.pointsBySeason)) },
      { title: "Most wins", unit: "all seasons", rows: rank((t) => t.w) },
      { title: "Most trophies", unit: "all seasons", rows: rank((t) => t.trophies) },
      { title: "Best win %", unit: "wins ÷ games", rows: rank((t) => t.w / games(t)), format: pct },
      { title: "Points per game", unit: "avg", rows: rank((t) => D.sum(t.pointsBySeason) / games(t)) },
      { title: "Fewest losses", unit: "per season", rows: rank((t) => -(t.l / t.seasons)).map((r) => ({ ...r, value: -r.value })) },
    ];
    podium = rank((t) => D.sum(t.pointsBySeason) / games(t)).slice(0, 3); podiumTitle = "Podium · points per game, all-time";
  } else if (scope === 1) {
    boards = [
      { title: "Most points", unit: "single season", rows: rank((t) => bestSeason(t).p, (t) => `Season ${bestSeason(t).i + 1}`) },
      { title: "Most wins", unit: "single season", rows: rank((t) => Math.round(bestSeason(t).p / 3.05), (t) => `Season ${bestSeason(t).i + 1}`) },
      { title: "Most trophies", unit: "single season", rows: rank((t) => Math.min(t.trophies, 3), (t) => `Season ${bestSeason(t).i + 1}`) },
      { title: "Best win %", unit: "single season", rows: rank((t) => bestSeason(t).p / 3.05 / seasonGames, (t) => `Season ${bestSeason(t).i + 1}`), format: pct },
      { title: "Points per game", unit: "single season", rows: rank((t) => bestSeason(t).p / seasonGames, (t) => `Season ${bestSeason(t).i + 1}`) },
      { title: "Fewest losses", unit: "single season", rows: rank((t) => -Math.round((seasonGames - bestSeason(t).p / 3.05) * 0.4)).map((r) => ({ ...r, value: -r.value })) },
    ];
    podium = boards[4].rows.slice(0, 3); podiumTitle = "Podium · points per game, best season";
  } else {
    const g = (t: D.Team) => Math.max(1, t.monthsLogged * 3.8);
    boards = [
      { title: "Most points", unit: "this season", rows: rank((t) => t.currentPoints, (t) => `Season ${t.seasons} · ${t.monthsLogged} months`) },
      { title: "Most wins", unit: "this season", rows: rank((t) => Math.round(t.currentPoints / 3.05)) },
      { title: "Most trophies", unit: "this season", rows: rank((t) => (t.currentPoints > 35 ? 1 : 0)) },
      { title: "Best win %", unit: "this season", rows: rank((t) => t.currentPoints / 3.05 / g(t)), format: pct },
      { title: "Points per game", unit: "this season", rows: rank((t) => t.currentPoints / g(t)) },
      { title: "Fewest losses", unit: "this season", rows: rank((t) => -Math.round(g(t) - t.currentPoints / 3.05) * 0.4).map((r) => ({ ...r, value: Math.round(-r.value) })) },
    ];
    podium = boards[4].rows.slice(0, 3); podiumTitle = "Podium · points per game, current season";
  }
  const bestAll = [...D.teams].map((t) => ({ t, ...bestSeason(t) })).sort((a, b) => b.p - a.p)[0];
  const records: Record[] = [
    { title: "Best season points", value: String(bestAll.p), who: bestAll.t.name, when: `Season ${bestAll.i + 1}` },
    { title: "Most trophies in a season", value: "3", who: "Verdant Athletic", when: "Season 5" },
    { title: "Best W-D-L season", value: "29-6-3", who: "Verdant Athletic", when: "Season 6" },
    { title: "Longest unbeaten run", value: "7 mo", who: "Nordhaven FC", when: "Seasons 3–4" },
  ];
  return { boards, podium, podiumTitle, podiumFormat, records };
}

function playerData(scope: number, colors: Colors) {
  const P = D.playerProfiles;
  const team = (p: D.PlayerProfile) => D.teamById(p.teamId);
  const row = (p: D.PlayerProfile, value: number, sub?: string): Row => ({ id: p.id, label: p.name, sub: sub ?? `${p.pos} · ${team(p).name}`, value, color: team(p).color, logo: p.name.split(" ").map((x) => x[0]).join("").slice(0, 3).toUpperCase(), kind: "player" });
  const isGK = (p: D.PlayerProfile) => p.group === "GK";
  const rank = (f: (p: D.PlayerProfile) => number, sub?: (p: D.PlayerProfile) => string, filter: (p: D.PlayerProfile) => boolean = () => true) => P.filter(filter).map((p) => row(p, +f(p).toFixed(2), sub?.(p))).sort((a, b) => b.value - a.value);
  const bestS = (p: D.PlayerProfile, k: "goals" | "assists" | "cleanSheets") => p.seasons.map((s) => ({ v: D.sum(s[k]), s: s.season })).sort((a, b) => b.v - a.v)[0];
  const bestM = (p: D.PlayerProfile, k: "goals" | "assists" | "cleanSheets" | "rating") => p.seasons.flatMap((s) => s[k].map((v, i) => ({ v, when: `S${s.season} · ${D.months[i]}` }))).sort((a, b) => b.v - a.v)[0];
  let boards: Board[], podium: Row[], podiumTitle: string;
  const fmt2 = (v: number) => v.toFixed(2);
  if (scope === 0) {
    const c = D.career;
    boards = [
      { title: "Most goals", unit: "career", rows: rank((p) => c(p).goals) },
      { title: "Most assists", unit: "career", rows: rank((p) => c(p).assists) },
      { title: "Goal contributions", unit: "goals + assists", rows: rank((p) => c(p).goals + c(p).assists) },
      { title: "Clean sheets", unit: "keepers · career", rows: rank((p) => c(p).cleanSheets, undefined, isGK) },
      { title: "Highest avg rating", unit: "min. 20 apps", rows: rank((p) => c(p).rating, undefined, (p) => c(p).apps >= 20), format: fmt2 },
      { title: "Ballon d'Ors", unit: "career", rows: rank((p) => p.ballonDors) },
    ];
    podium = boards[2].rows.slice(0, 3); podiumTitle = "Podium · goal contributions, all-time";
  } else if (scope === 1) {
    boards = [
      { title: "Most goals", unit: "single season", rows: rank((p) => bestS(p, "goals").v, (p) => `Season ${bestS(p, "goals").s} · ${team(p).short}`) },
      { title: "Most assists", unit: "single season", rows: rank((p) => bestS(p, "assists").v, (p) => `Season ${bestS(p, "assists").s} · ${team(p).short}`) },
      { title: "Goal contributions", unit: "single season", rows: rank((p) => Math.max(...p.seasons.map((s) => D.sum(s.goals) + D.sum(s.assists)))) },
      { title: "Clean sheets", unit: "keepers · single season", rows: rank((p) => bestS(p, "cleanSheets").v, (p) => `Season ${bestS(p, "cleanSheets").s}`, isGK) },
      { title: "Highest avg rating", unit: "single season", rows: rank((p) => Math.max(...p.seasons.map((s) => D.sum(s.rating) / s.rating.length))), format: fmt2 },
      { title: "Ballon d'Ors", unit: "season winners", rows: rank((p) => Math.min(1, p.ballonDors)) },
    ];
    podium = boards[2].rows.slice(0, 3); podiumTitle = "Podium · goal contributions, best season";
  } else {
    boards = [
      { title: "Most goals", unit: "single month", rows: rank((p) => bestM(p, "goals").v, (p) => bestM(p, "goals").when) },
      { title: "Most assists", unit: "single month", rows: rank((p) => bestM(p, "assists").v, (p) => bestM(p, "assists").when) },
      { title: "Goal contributions", unit: "single month", rows: rank((p) => Math.max(...p.seasons.flatMap((s) => s.goals.map((g, i) => g + s.assists[i])))) },
      { title: "Clean sheets", unit: "keepers · single month", rows: rank((p) => bestM(p, "cleanSheets").v, (p) => bestM(p, "cleanSheets").when, isGK) },
      { title: "Highest avg rating", unit: "single month", rows: rank((p) => bestM(p, "rating").v, (p) => bestM(p, "rating").when), format: (v) => v.toFixed(1) },
      { title: "Hat-tricks", unit: "months with 3+", rows: rank((p) => p.seasons.flatMap((s) => s.goals).filter((g) => g >= 3).length) },
    ];
    podium = boards[2].rows.slice(0, 3); podiumTitle = "Podium · goal contributions, best month";
  }
  const gS = P.map((p) => ({ p, ...bestS(p, "goals") })).sort((a, b) => b.v - a.v)[0];
  const aS = P.map((p) => ({ p, ...bestS(p, "assists") })).sort((a, b) => b.v - a.v)[0];
  const gM = P.map((p) => ({ p, ...bestM(p, "goals") })).sort((a, b) => b.v - a.v)[0];
  const rM = P.map((p) => ({ p, ...bestM(p, "rating") })).sort((a, b) => b.v - a.v)[0];
  const records: Record[] = [
    { title: "Most goals in a season", value: String(gS.v), who: gS.p.name, when: `Season ${gS.s}` },
    { title: "Most assists in a season", value: String(aS.v), who: aS.p.name, when: `Season ${aS.s}` },
    { title: "Most goals in a month", value: String(gM.v), who: gM.p.name, when: gM.when },
    { title: "Highest rated month", value: rM.v.toFixed(1), who: rM.p.name, when: rM.when },
  ];
  return { boards, podium, podiumTitle, podiumFormat: (v: number) => String(v), records };
}

const makeStyles = (colors: Colors) => StyleSheet.create({
  hero: { flexDirection: "row", alignItems: "center", gap: space.lg, paddingTop: 72 },
  glow: { textShadow: `0 0 24px ${colors.mintGlow}` } as any,
  segment: { flexDirection: "row", gap: 2, padding: 3, borderRadius: radius.pill, borderWidth: 1, borderColor: colors.border, backgroundColor: colors.surface },
  podium: { flexDirection: "row", alignItems: "flex-end", gap: space.md },
  podiumCol: { flex: 1, alignItems: "center" },
  podiumBlock: { alignSelf: "stretch", marginTop: space.sm, borderRadius: radius.card, borderWidth: 1, backgroundColor: colors.surface, alignItems: "center", justifyContent: "center", gap: 4 },
  medal: { width: 26, height: 26, borderRadius: 13, alignItems: "center", justifyContent: "center" },
  grid: { flexDirection: "row", flexWrap: "wrap", marginHorizontal: -space.sm },
  lbRow: { flexDirection: "row", alignItems: "center", gap: 10, paddingVertical: 7, paddingHorizontal: 8, borderRadius: radius.sm, overflow: "hidden" },
  lbBar: { position: "absolute", left: 0, top: 0, bottom: 0, borderRadius: radius.sm },
  rank: { width: 18, textAlign: "center", fontWeight: "800", color: colors.muted },
  records: { flexDirection: "row", gap: space.md },
});
