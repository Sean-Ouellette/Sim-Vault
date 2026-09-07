import React, { useEffect, useMemo, useState } from "react";
import { Pressable, ScrollView, StyleSheet, TextInput, View, useWindowDimensions } from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";
import { Page, Background } from "../components/Page";
import { Reveal, RevealScroll, RevealInstant } from "../components/Reveal";
import { Button, Card, CountUp, Logo, Pill, SectionLabel, T } from "../components/ui";
import { BarChart, LineChart } from "../components/LineChart";
import { RequireAuth } from "../components/RequireAuth";
import { Colors, layout, radius, space } from "../theme";
import { useTheme } from "../lib/theme";
import * as D from "../lib/data";

// Render of pages/players.md (Claude's draft). Screen A = browse; Screen B = player view.
export default function PlayersScreen() { return <RequireAuth><Players /></RequireAuth>; }

function Players() {
  const params = useLocalSearchParams<{ player?: string }>();
  const [playerId, setPlayerId] = useState<string | null>(params.player ?? null);
  const player = D.playerProfiles.find((p) => p.id === playerId) ?? null;
  return player ? <PlayerView player={player} onSwitch={setPlayerId} /> : <PlayerGrid onOpen={setPlayerId} />;
}

const GROUPS = ["All", "GK", "DEF", "MID", "FWD"] as const;
const STATS = ["Goals", "Assists", "Goal contributions", "Clean sheets", "Avg rating"] as const;
type Stat = (typeof STATS)[number];

function statMonthly(p: D.PlayerProfile, stat: Stat) {
  const m = p.seasons.flatMap((s) => stat === "Goals" ? s.goals : stat === "Assists" ? s.assists : stat === "Goal contributions" ? s.goals.map((g, i) => g + s.assists[i]) : stat === "Clean sheets" ? s.cleanSheets : s.rating);
  return stat === "Avg rating" ? m : D.cumulative(m);
}

// ---------------- Screen A ----------------
function PlayerCard({ p, onOpen, lineColor, onRemove }: { p: D.PlayerProfile; onOpen: () => void; lineColor?: string; onRemove?: () => void }) {
  const { c: colors } = useTheme();
  const s = useMemo(() => makeStyles(colors), [colors]);
  const t = D.teamById(p.teamId); const c = D.career(p);
  return (
    <Card hover onPress={onOpen}>
      {lineColor && <View style={[s.lineBar, { backgroundColor: lineColor }]} />}
      <View style={{ flexDirection: "row", alignItems: "center", gap: 12 }}>
        <Logo label={initials(p.name)} color={t.color} size={48} />
        <View style={{ flex: 1 }}>
          <T.h3 numberOfLines={1}>{p.name}</T.h3>
          <T.small style={{ color: colors.muted }}>{p.pos} · {t.name}</T.small>
        </View>
        {onRemove && <Pressable onPress={onRemove} accessibilityLabel="Remove from graph" style={[s.remove, { cursor: "pointer" } as any]}><T.small style={{ color: colors.muted, fontWeight: "800" }}>×</T.small></Pressable>}
      </View>
      <View style={s.statStrip}>
        {[["Goals", c.goals], ["Ast", c.assists], ["CS", c.cleanSheets], ["Avg", c.rating.toFixed(2)], ["BdO", p.ballonDors]].map(([k, v]) => (
          <View key={String(k)} style={{ flex: 1 }}>
            <T.body style={{ fontWeight: "700", color: k === "BdO" && Number(v) > 0 ? colors.series[5] : colors.text }} numberOfLines={1}>{k === "BdO" && Number(v) > 0 ? `● ${v}` : v}</T.body>
            <T.label numberOfLines={1}>{k}</T.label>
          </View>
        ))}
      </View>
      <View style={s.teamsStrip}>
        {D.teamsPlayedFor(p).map((tp) => {
          const tt = D.teamById(tp.teamId);
          return (
            <View key={tp.teamId} style={s.teamChip}>
              <Logo label={tt.short} color={tt.color} size={18} uri={tt.logo} />
              <T.small style={{ fontWeight: "700" }}>{tt.short}</T.small>
              <T.small style={{ color: colors.muted }}>· {tp.positions.join(", ")}</T.small>
            </View>
          );
        })}
      </View>
    </Card>
  );
}

function PlayerGrid({ onOpen }: { onOpen: (id: string) => void }) {
  const { c: colors } = useTheme();
  const s = useMemo(() => makeStyles(colors), [colors]);
  const { width } = useWindowDimensions();
  const cols = width < 700 ? 2 : width < 1100 ? 3 : 4;
  const [view, setView] = useState<"Players" | "Graph">("Players");
  const [q, setQ] = useState("");
  const [group, setGroup] = useState<(typeof GROUPS)[number]>("All");
  const [teamId, setTeamId] = useState<string | null>(null);
  const [stat, setStat] = useState<Stat>("Goals");
  const [heroOn, setHeroOn] = useState(false);
  const [chartOn, setChartOn] = useState(false);
  const ranked = (st: Stat) => [...D.playerProfiles].map((p) => ({ p, v: st === "Avg rating" ? D.career(p).rating : statMonthly(p, st).slice(-1)[0] })).sort((a, b) => b.v - a.v).map((x) => x.p.id);
  const [picked, setPicked] = useState<string[]>(() => ranked("Goals").slice(0, 5));
  const [gq, setGq] = useState("");
  const [instant, setInstant] = useState(false);
  useEffect(() => { const t = setTimeout(() => setInstant(true), 1500); return () => clearTimeout(t); }, []);

  const list = D.playerProfiles.filter((p) =>
    (!q || p.name.toLowerCase().includes(q.toLowerCase())) && (group === "All" || p.group === group) && (!teamId || p.teamId === teamId));
  const chosen = picked.map((id) => D.playerProfiles.find((p) => p.id === id)!);
  const suggestions = gq.trim() ? D.playerProfiles.filter((p) => !picked.includes(p.id) && p.name.toLowerCase().includes(gq.toLowerCase())).slice(0, 6) : [];
  const months = Math.max(1, ...chosen.map((p) => p.seasons.length)) * D.MONTHS_PER_SEASON;
  const add = (id: string) => { if (picked.length < 10 && !picked.includes(id)) setPicked([...picked, id]); setGq(""); };

  return (
    <Page>
      <Reveal onVisible={setHeroOn} style={s.hero}>
        <T.display>Every <T.mint style={s.glow}>player</T.mint>, one vault.</T.display>
        <View style={{ flexDirection: "row", alignItems: "center", gap: space.md, marginTop: space.md, flexWrap: "wrap" }}>
          <T.muted style={{ fontSize: 18 }}>Everyone who's pulled on a shirt in your saves.</T.muted>
          <View style={s.countChip}><CountUp to={D.playerProfiles.length} play={heroOn} style={{ fontSize: 16 }} /><T.label style={{ marginLeft: 6 }}>players</T.label></View>
        </View>
      </Reveal>

      <Reveal style={{ marginTop: space.xl }}>
        <View style={s.filters}>
          <View style={s.segment}>
            <Pill active={view === "Players"} onPress={() => setView("Players")}>Players</Pill>
            <Pill active={view === "Graph"} onPress={() => setView("Graph")}>Graph</Pill>
          </View>
          {view === "Players" ? (
            <>
              <View style={s.search}>
                <TextInput value={q} onChangeText={setQ} placeholder="Search players" placeholderTextColor={colors.muted} style={s.searchInput} />
              </View>
              <View style={{ flexDirection: "row", gap: 4 }}>{GROUPS.map((g) => <Pill key={g} active={group === g} onPress={() => setGroup(g)}>{g}</Pill>)}</View>
            </>
          ) : (
            <View style={[s.search, { width: 360, zIndex: 20 }]}>
              <TextInput value={gq} onChangeText={setGq} placeholder={picked.length >= 10 ? "Graph is full (10)" : "Add a player to the graph…"} editable={picked.length < 10} placeholderTextColor={colors.muted} style={s.searchInput} />
              {suggestions.length > 0 && (
                <View style={s.dropdownAbs}>
                  {suggestions.map((p) => (
                    <Pressable key={p.id} onPress={() => add(p.id)} style={[s.dropRow, { flexDirection: "row", alignItems: "center", gap: 10 }, { cursor: "pointer" } as any]}>
                      <Logo label={initials(p.name)} color={D.teamById(p.teamId).color} size={24} />
                      <T.small style={{ fontWeight: "700" }}>{p.name}</T.small>
                      <T.small style={{ color: colors.muted, marginLeft: "auto" }}>{p.pos} · {D.teamById(p.teamId).short}</T.small>
                    </Pressable>
                  ))}
                </View>
              )}
            </View>
          )}
        </View>
        {view === "Players" && (
          <View style={{ flexDirection: "row", gap: 4, flexWrap: "wrap", marginTop: space.sm }}>
            <Pill active={teamId == null} onPress={() => setTeamId(null)}>All teams</Pill>
            {D.teams.map((t) => (
              <Pill key={t.id} active={teamId === t.id} onPress={() => setTeamId(teamId === t.id ? null : t.id)}>
                <View style={[s.teamDot, { backgroundColor: t.color }]} />{t.name}
              </Pill>
            ))}
          </View>
        )}
      </Reveal>

      <RevealInstant.Provider value={instant}>
      {view === "Players" ? (
        <Reveal key="grid" style={{ marginTop: space.lg }}>
          <SectionLabel>{list.length} player{list.length === 1 ? "" : "s"}</SectionLabel>
          {list.length === 0 ? (
            <Card><T.muted>No players match those filters.</T.muted></Card>
          ) : (
            <View style={s.grid}>
              {list.map((p) => (
                <View key={p.id} style={{ width: `${100 / cols}%`, padding: space.sm }}>
                  <PlayerCard p={p} onOpen={() => onOpen(p.id)} />
                </View>
              ))}
            </View>
          )}
        </Reveal>
      ) : (
        <>
          <Reveal key="graph-chart" style={{ marginTop: space.lg }} onVisible={setChartOn}>
            <Card>
              <View style={s.chartHead}>
                <View>
                  <T.h3>Compare · {stat.toLowerCase()}</T.h3>
                  <T.small style={{ color: colors.muted }}>{stat === "Avg rating" ? "monthly rating" : "running total by month"} · ticks mark the start of each season · {picked.length}/10 players</T.small>
                </View>
                <View style={{ flexDirection: "row", gap: 4, flexWrap: "wrap" }}>{STATS.map((st) => <Pill key={st} active={stat === st} onPress={() => setStat(st)}>{st}</Pill>)}</View>
              </View>
              {chosen.length === 0 ? (
                <T.muted>Search above to add players to the graph.</T.muted>
              ) : (
                <LineChart play={chartOn} xLabels={D.seasonTicks(months)} xTooltip={D.monthLabel} height={340}
                  series={chosen.map((p, i) => ({ name: p.name, color: colors.series[i % colors.series.length], values: statMonthly(p, stat) }))} />
              )}
            </Card>
          </Reveal>
          <Reveal key="graph-cards" style={{ marginTop: space.lg }}>
            <SectionLabel>In the graph</SectionLabel>
            <View style={s.grid}>
              {chosen.map((p, i) => (
                <View key={p.id} style={{ width: `${100 / cols}%`, padding: space.sm }}>
                  <PlayerCard p={p} onOpen={() => onOpen(p.id)} lineColor={colors.series[i % colors.series.length]} onRemove={() => setPicked(picked.filter((id) => id !== p.id))} />
                </View>
              ))}
            </View>
          </Reveal>
        </>
      )}
      </RevealInstant.Provider>
    </Page>
  );
}

// ---------------- Screen B ----------------
const WINDOWS = ["Overview", "Monthly log", "Achievements"] as const;

function PlayerView({ player, onSwitch }: { player: D.PlayerProfile; onSwitch: (id: string) => void }) {
  const { c: colors } = useTheme();
  const s = useMemo(() => makeStyles(colors), [colors]);
  const { width } = useWindowDimensions();
  const router = useRouter();
  const [season, setSeason] = useState<number | null>(null);
  const [win, setWin] = useState<(typeof WINDOWS)[number]>("Overview");
  const [switcher, setSwitcher] = useState(false);
  const [instant, setInstant] = useState(false);
  useEffect(() => { const t = setTimeout(() => setInstant(true), 1500); return () => clearTimeout(t); }, []);
  useEffect(() => { setSeason(null); }, [player.id]);
  const team = D.teamById(player.teamId);
  const scope = season == null ? "career" : "season";
  const stacked = width < 900;
  const sel = season == null ? null : player.seasons[season];

  return (
    <View style={{ flex: 1, flexDirection: stacked ? "column" : "row" }}>
      <Background />
      <View style={[s.sidebar, stacked && { width: "100%", height: undefined, borderRightWidth: 0, borderBottomWidth: 1 }]}>
        <Pressable onPress={() => setSwitcher((v) => !v)} style={[s.switcher, { cursor: "pointer" } as any]}>
          <View style={{ flexDirection: "row", alignItems: "center", gap: 10, flex: 1 }}>
            <Logo label={initials(player.name)} color={team.color} size={32} />
            <View style={{ flex: 1 }}>
              <T.label>{switcher ? "Select a player" : player.pos}</T.label>
              <T.body style={{ fontWeight: "700" }} numberOfLines={1}>{player.name}</T.body>
            </View>
          </View>
          <T.mint>{switcher ? "▲" : "▼"}</T.mint>
        </Pressable>
        {switcher && (
          <ScrollView style={[s.dropdown, { maxHeight: 280 }]}>
            {D.playerProfiles.filter((p) => p.id !== player.id).map((p) => (
              <Pressable key={p.id} onPress={() => { onSwitch(p.id); setSwitcher(false); }} style={[s.dropRow, { cursor: "pointer" } as any]}>
                <View style={{ flexDirection: "row", alignItems: "center", gap: 10 }}><Logo label={initials(p.name)} color={D.teamById(p.teamId).color} size={28} /><View><T.small style={{ fontWeight: "700" }}>{p.name}</T.small><T.small style={{ color: colors.muted }}>{p.pos} · {D.teamById(p.teamId).name}</T.small></View></View>
              </Pressable>
            ))}
          </ScrollView>
        )}
        <T.label style={{ marginTop: space.lg }}>Seasons</T.label>
        <T.small style={{ color: colors.muted, marginBottom: space.sm }}>{season == null ? "No season selected · whole career" : `Season ${sel!.season} · click again to deselect`}</T.small>
        <ScrollView style={{ flex: 1 }} contentContainerStyle={{ gap: 4 }}>
          {player.seasons.map((sn, i) => (
            <Pressable key={i} onPress={() => setSeason(season === i ? null : i)} style={[s.seasonRow, season === i && s.seasonActive, { cursor: "pointer" } as any]}>
              <T.small style={{ color: season === i ? colors.onMint : colors.text }}>Season {sn.season}</T.small>
              <T.small style={{ color: season === i ? colors.onMint : colors.muted }}>{D.teamById(sn.teamId).short} · {D.sum(sn.goals)}g {D.sum(sn.assists)}a</T.small>
            </Pressable>
          ))}
        </ScrollView>
        <Button style={{ marginTop: space.md }} onPress={() => router.push({ pathname: "/teams", params: { team: team.id } } as any)}>Open {team.short}</Button>
      </View>

      <RevealScroll style={{ flex: 1 }} contentContainerStyle={s.main}>
        <Reveal style={s.playerHero}>
          <View style={{ flexDirection: "row", alignItems: "center", gap: space.lg, flex: 1, flexWrap: "wrap" }}>
            <Logo label={initials(player.name)} color={team.color} size={84} />
            <View>
              <View style={{ flexDirection: "row", alignItems: "center", gap: space.sm, flexWrap: "wrap" }}>
                <T.h1>{player.name}</T.h1>
                <Pill active>{player.pos}</Pill>
                {player.ballonDors > 0 && <View style={s.badge}><T.small style={{ fontWeight: "800", color: colors.series[5] }}>● {player.ballonDors}× Ballon d'Or</T.small></View>}
              </View>
              <Pressable onPress={() => router.push({ pathname: "/teams", params: { team: team.id } } as any)} style={[{ flexDirection: "row", alignItems: "center", gap: 8, marginTop: 4 }, { cursor: "pointer" } as any]}>
                <Logo label={team.short} color={team.color} size={22} /><T.muted>{team.name} · {team.league}</T.muted>
              </Pressable>
            </View>
          </View>
        </Reveal>
        <Reveal style={{ flexDirection: "row", gap: 4, marginTop: space.lg, marginBottom: space.lg }}>
          {WINDOWS.map((w) => <Pill key={w} active={win === w} onPress={() => setWin(w)}>{w}</Pill>)}
        </Reveal>
        <RevealInstant.Provider value={instant}>
          {win === "Overview" && <Overview player={player} season={season} />}
          {win === "Monthly log" && <MonthlyLog player={player} season={season} />}
          {win === "Achievements" && <Achievements scope={scope} />}
        </RevealInstant.Provider>
      </RevealScroll>
    </View>
  );
}

function Overview({ player, season }: { player: D.PlayerProfile; season: number | null }) {
  const { c: colors } = useTheme();
  const s = useMemo(() => makeStyles(colors), [colors]);
  const { width } = useWindowDimensions();
  const [stat, setStat] = useState<Stat>("Goals");
  const [tilesOn, setTilesOn] = useState(false);
  const [chartOn, setChartOn] = useState(false);
  const rows = season == null ? player.seasons : [player.seasons[season]];
  const flat = (k: "apps" | "goals" | "assists" | "cleanSheets" | "rating") => rows.flatMap((r) => r[k]);
  const ratings = flat("rating");
  const totals = { apps: D.sum(flat("apps")), goals: D.sum(flat("goals")), assists: D.sum(flat("assists")), cs: D.sum(flat("cleanSheets")), rating: +(D.sum(ratings) / ratings.length).toFixed(2) };
  const monthly = stat === "Avg rating" ? ratings : D.cumulative(rows.flatMap((r) => stat === "Goals" ? r.goals : stat === "Assists" ? r.assists : stat === "Clean sheets" ? r.cleanSheets : r.goals.map((g, i) => g + r.assists[i])));
  const xLabels = season == null ? D.seasonTicks(monthly.length) : D.months;
  const xTooltip = season == null ? D.monthLabel : (i: number) => D.months[i];
  const bestSeason = [...player.seasons].sort((a, b) => D.sum(b.goals) - D.sum(a.goals))[0];
  const bestMonth = rows.flatMap((r) => r.goals.map((g, i) => ({ g, when: `S${r.season} · ${D.months[i]}` }))).sort((a, b) => b.g - a.g)[0];
  const bestRated = rows.flatMap((r) => r.rating.map((v, i) => ({ v, when: `S${r.season} · ${D.months[i]}` }))).sort((a, b) => b.v - a.v)[0];
  const teamsPlayed = Object.values(rows.reduce<Record<string, { teamId: string; seasons: number[]; goals: number }>>((acc, r) => {
    const e = (acc[r.teamId] ??= { teamId: r.teamId, seasons: [], goals: 0 }); e.seasons.push(r.season); e.goals += D.sum(r.goals); return acc;
  }, {}));
  return (
    <>
      <Reveal onVisible={setTilesOn} style={s.tiles}>
        {[["Apps", totals.apps], ["Goals", totals.goals], ["Assists", totals.assists], ["G + A", totals.goals + totals.assists], ["Clean sheets", totals.cs], ["Avg rating", totals.rating]].map(([k, v]) => (
          <Card key={String(k)} style={s.tile}>
            {k === "Avg rating" ? <T.h1>{v}</T.h1> : <CountUp to={Number(v)} play={tilesOn} />}
            <T.label style={{ marginTop: space.xs }}>{k}</T.label>
          </Card>
        ))}
      </Reveal>
      <Reveal style={{ marginTop: space.md }} onVisible={setChartOn}>
        <Card>
          <View style={s.chartHead}>
            <T.h3>Progression · {stat.toLowerCase()}</T.h3>
            <View style={{ flexDirection: "row", gap: 4, flexWrap: "wrap" }}>{STATS.map((st) => <Pill key={st} active={stat === st} onPress={() => setStat(st)}>{st}</Pill>)}</View>
          </View>
          <LineChart play={chartOn} xLabels={xLabels} xTooltip={xTooltip} height={260} series={[{ name: player.name, color: colors.series[0], values: monthly }]} />
        </Card>
      </Reveal>
      <View style={[s.two, width < 900 && { flexDirection: "column" }]}>
        <Reveal style={{ flex: 1 }}>
          <Card style={{ flex: 1 }}>
            <SectionLabel>{season == null ? "Teams played for" : "This season"}</SectionLabel>
            {teamsPlayed.map((tp) => {
              const t = D.teamById(tp.teamId);
              return (
                <View key={tp.teamId} style={s.row}>
                  <Logo label={t.short} color={t.color} size={28} />
                  <View style={{ flex: 1 }}><T.small style={{ fontWeight: "700" }}>{t.name}</T.small><T.small style={{ color: colors.muted }}>{tp.seasons.map((x) => `S${x}`).join(", ")} · {D.teamsPlayedFor(player).find((x) => x.teamId === tp.teamId)?.positions.join(", ") ?? player.pos}</T.small></View>
                  <T.small style={{ fontWeight: "700" }}>{tp.goals} goals</T.small>
                </View>
              );
            })}
          </Card>
        </Reveal>
        <Reveal delay={100} style={{ flex: 1 }}>
          <Card style={{ flex: 1 }}>
            <SectionLabel>Bests</SectionLabel>
            {[
              season == null ? ["Best season", `${D.sum(bestSeason.goals)} goals`, `Season ${bestSeason.season}`] : null,
              ["Best month", `${bestMonth.g} goals`, bestMonth.when],
              ["Highest rated month", bestRated.v.toFixed(1), bestRated.when],
            ].filter(Boolean).map((b) => (
              <View key={b![0]} style={s.row}>
                <View style={{ flex: 1 }}><T.small style={{ color: colors.muted }}>{b![0]}</T.small><T.body style={{ fontWeight: "700" }}>{b![1]}</T.body></View>
                <T.small style={{ color: colors.mint }}>{b![2]}</T.small>
              </View>
            ))}
          </Card>
        </Reveal>
      </View>
    </>
  );
}

function MonthlyLog({ player, season }: { player: D.PlayerProfile; season: number | null }) {
  const { c: colors } = useTheme();
  const s = useMemo(() => makeStyles(colors), [colors]);
  if (season == null) {
    return (
      <>
        <Reveal><Card><T.muted>Select a season in the sidebar for the month-by-month log. Career summary below.</T.muted></Card></Reveal>
        <Reveal style={{ marginTop: space.md }}><Card style={{ padding: 0 }}>
          <View style={[s.tr, s.th]}>{["Season", "Team", "Apps", "Goals", "Assists", "CS", "Avg"].map((c, i) => <T.label key={c} style={[s.td, i < 2 && { flex: 2 }]}>{c}</T.label>)}</View>
          {player.seasons.map((r, i) => (
            <View key={i} style={[s.tr, i % 2 ? { backgroundColor: colors.surfaceRaised } : null]}>
              <T.small style={[s.td, { flex: 2, fontWeight: "700" }]}>Season {r.season}</T.small>
              <T.small style={[s.td, { flex: 2 }]}>{D.teamById(r.teamId).name}</T.small>
              <T.small style={s.td}>{D.sum(r.apps)}</T.small><T.small style={s.td}>{D.sum(r.goals)}</T.small><T.small style={s.td}>{D.sum(r.assists)}</T.small><T.small style={s.td}>{D.sum(r.cleanSheets)}</T.small>
              <T.small style={[s.td, { color: colors.mint, fontWeight: "700" }]}>{(D.sum(r.rating) / r.rating.length).toFixed(2)}</T.small>
            </View>
          ))}
        </Card></Reveal>
      </>
    );
  }
  const r = player.seasons[season];
  return (
    <Reveal><Card style={{ padding: 0 }}>
      <View style={[s.tr, s.th]}>{["Month", "Apps", "Goals", "Assists", "CS", "Avg", "Team result"].map((c, i) => <T.label key={c} style={[s.td, i === 6 && { flex: 2 }]}>{c}</T.label>)}</View>
      {D.months.map((m, i) => {
        const rec = D.monthlyRecord[i];
        return (
          <View key={m} style={[s.tr, i % 2 ? { backgroundColor: colors.surfaceRaised } : null]}>
            <T.small style={[s.td, { fontWeight: "700" }]}>{m}</T.small>
            <T.small style={s.td}>{r.apps[i]}</T.small><T.small style={s.td}>{r.goals[i]}</T.small><T.small style={s.td}>{r.assists[i]}</T.small><T.small style={s.td}>{r.cleanSheets[i]}</T.small>
            <T.small style={[s.td, { color: colors.mint, fontWeight: "700" }]}>{r.rating[i].toFixed(1)}</T.small>
            <T.small style={[s.td, { flex: 2, color: colors.muted }]}><T.small style={{ color: colors.win }}>{rec.w}W</T.small> <T.small style={{ color: colors.draw }}>{rec.d}D</T.small> <T.small style={{ color: colors.loss }}>{rec.l}L</T.small></T.small>
          </View>
        );
      })}
    </Card></Reveal>
  );
}

const PLAYER_ACHIEVEMENTS: Record<D.Tier, string[]> = {
  GOAT: ["Golden boot", "Ballon d'Or"], Great: ["Hat-trick hero", "Player of the month"], Average: ["Ever-present", "Squad rotation"], Bad: ["Bench warmer", "Own goal"],
};
function Achievements({ scope }: { scope: string }) {
  const { c: colors } = useTheme();
  const s = useMemo(() => makeStyles(colors), [colors]);
  return (
    <View style={{ gap: space.md }}>
      {(Object.keys(PLAYER_ACHIEVEMENTS) as D.Tier[]).map((t, i) => (
        <Reveal key={t} delay={i * 80}>
          <Card>
            <View style={{ flexDirection: "row", alignItems: "center", gap: space.sm, marginBottom: space.md }}>
              <View style={{ width: 10, height: 10, borderRadius: 5, backgroundColor: D.tierColor[t] }} />
              <T.h3>{t}</T.h3>
              <T.label style={{ marginLeft: "auto" }}>{scope === "season" ? "season set" : "career set"}</T.label>
            </View>
            <View style={{ flexDirection: "row", gap: space.sm, flexWrap: "wrap" }}>
              {PLAYER_ACHIEVEMENTS[t].map((a) => <View key={a} style={s.chip}><T.small style={{ color: colors.muted }}>{a} · TBD</T.small></View>)}
            </View>
          </Card>
        </Reveal>
      ))}
    </View>
  );
}

const initials = (n: string) => n.split(" ").map((x) => x[0]).join("").slice(0, 3).toUpperCase();

const makeStyles = (colors: Colors) => StyleSheet.create({
  hero: { paddingTop: 72 },
  glow: { textShadow: `0 0 24px ${colors.mintGlow}` } as any,
  countChip: { flexDirection: "row", alignItems: "center", paddingHorizontal: 12, paddingVertical: 4, borderRadius: radius.pill, borderWidth: 1, borderColor: colors.border, backgroundColor: colors.surface },
  filters: { flexDirection: "row", alignItems: "center", gap: space.md, flexWrap: "wrap" },
  search: { flexDirection: "row", alignItems: "center", width: 280, maxWidth: "100%", height: 40, paddingHorizontal: 14, borderRadius: radius.pill, borderWidth: 1, borderColor: colors.borderStrong, backgroundColor: colors.surface },
  searchInput: { flex: 1, color: colors.text, fontSize: 14, outlineStyle: "none" } as any,
  teamDot: { width: 8, height: 8, borderRadius: 4, marginRight: 6, display: "inline-block" } as any,
  grid: { flexDirection: "row", flexWrap: "wrap", marginHorizontal: -space.sm },
  segment: { flexDirection: "row", gap: 2, padding: 3, borderRadius: radius.pill, borderWidth: 1, borderColor: colors.border, backgroundColor: colors.surface },
  lineBar: { height: 4, borderRadius: 2, marginBottom: space.md, marginTop: -space.sm },
  remove: { width: 28, height: 28, borderRadius: 14, borderWidth: 1, borderColor: colors.border, alignItems: "center", justifyContent: "center" },
  dropdownAbs: { position: "absolute", top: 44, left: 0, right: 0, borderRadius: radius.tile, borderWidth: 1, borderColor: colors.borderStrong, backgroundColor: colors.surfaceRaised, overflow: "hidden", zIndex: 30 },
  teamsStrip: { flexDirection: "row", flexWrap: "wrap", gap: 6, marginTop: space.sm, paddingTop: space.sm, borderTopWidth: 1, borderTopColor: colors.border },
  teamChip: { flexDirection: "row", alignItems: "center", gap: 5, paddingHorizontal: 8, paddingVertical: 4, borderRadius: radius.pill, borderWidth: 1, borderColor: colors.border, backgroundColor: colors.surfaceRaised },
  statStrip: { flexDirection: "row", gap: space.sm, marginTop: space.md, paddingTop: space.md, borderTopWidth: 1, borderTopColor: colors.border },
  chartHead: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: space.sm, marginBottom: space.md },
  sidebar: { width: layout.sidebar, borderRightWidth: 1, borderRightColor: colors.border, padding: space.md, backgroundColor: colors.mode === "dark" ? "rgba(18,24,21,0.7)" : "rgba(255,255,255,0.7)" },
  switcher: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", padding: 12, borderRadius: radius.tile, borderWidth: 1, borderColor: colors.borderStrong, backgroundColor: colors.surfaceRaised },
  dropdown: { marginTop: 6, borderRadius: radius.tile, borderWidth: 1, borderColor: colors.border, backgroundColor: colors.surface, overflow: "hidden" },
  dropRow: { padding: 10, borderBottomWidth: 1, borderBottomColor: colors.border },
  seasonRow: { flexDirection: "row", justifyContent: "space-between", padding: 10, borderRadius: radius.sm, borderWidth: 1, borderColor: colors.border },
  seasonActive: { backgroundColor: colors.mint, borderColor: colors.mint },
  main: { padding: space.lg, paddingBottom: space.xxl, width: "100%", maxWidth: layout.maxWidth, alignSelf: "center" },
  playerHero: { flexDirection: "row", alignItems: "center", gap: space.lg, paddingTop: space.lg, flexWrap: "wrap" },
  badge: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: radius.pill, borderWidth: 1, borderColor: colors.series[5], backgroundColor: "rgba(255,216,77,0.12)" },
  tiles: { flexDirection: "row", flexWrap: "wrap", gap: space.md },
  tile: { flexGrow: 1, minWidth: 140, flexBasis: "14%" },
  two: { flexDirection: "row", gap: space.md, marginTop: space.md },
  row: { flexDirection: "row", alignItems: "center", gap: 10, paddingVertical: 8, borderTopWidth: 1, borderTopColor: colors.border },
  chip: { paddingHorizontal: 14, paddingVertical: 10, borderRadius: radius.tile, borderWidth: 1, borderStyle: "dashed", borderColor: colors.border },
  tr: { flexDirection: "row", paddingHorizontal: space.md, paddingVertical: 10, alignItems: "center" },
  th: { borderBottomWidth: 1, borderBottomColor: colors.border },
  td: { flex: 1 },
});
