import React, { useMemo, useState } from "react";
import { Pressable, StyleSheet, View, useWindowDimensions } from "react-native";
import { useRouter } from "expo-router";
import Svg, { Path, Rect, Circle, Line } from "react-native-svg";
import { Page, FullBleed } from "../components/Page";
import { Reveal } from "../components/Reveal";
import { Button, Card, CountUp, SectionLabel, T } from "../components/ui";
import { LineChart } from "../components/LineChart";
import { useTheme } from "../lib/theme";
import { Colors, radius, space } from "../theme";
import { useAuth } from "../lib/auth";
import { useSettings } from "../lib/settings";
import { useVault } from "../lib/vault";
import { allBadges } from "../lib/achievements";
import { vaultStats, tierColor, playerTotals, teams, recentTeams, monthlyCumulative, seasonTicks, monthLabel, MONTHS_PER_SEASON, lastLog, recentActivity, seasonPace } from "../lib/data";
import { Marquee } from "../components/Marquee";
import { Pill, Logo } from "../components/ui";

// Render of pages/home.md. Signed-out variant is described; signed-in is a placeholder.
export default function Home() {
  const { user } = useAuth();
  return user ? <SignedIn user={user} /> : <SignedOut />;
}

// ---------- Signed out ----------
const PREVIEW = (series: string[]) => [
  { name: "Verdant Athletic", color: series[0], values: [71, 149, 233, 321, 412] },
  { name: "Nordhaven FC", color: series[1], values: [66, 138, 213, 293, 376] },
  { name: "Solstice United", color: series[2], values: [58, 122, 192, 268, 340] },
  { name: "Brixton Rovers", color: series[3], values: [55, 116, 184, 257, 320] },
  { name: "Calder Town", color: series[4], values: [49, 106, 169, 230, 290] },
];

const FEATURES = [
  { title: "Teams", blurb: "Saves, seasons, W-D-L, points, and trophies from your league's own cup list.", icon: "shield" },
  { title: "Players", blurb: "Goals, assists, appearances, clean sheets, average match rating, Ballon d'Ors.", icon: "user" },
  { title: "Top performers", blurb: "Who really carried the team — rankings across every save you own.", icon: "trophy" },
  { title: "Season logs", blurb: "Month-by-month entries and achievements rated from GOAT to Bad.", icon: "calendar" },
];

const STEPS = [
  { n: 1, title: "Create a team save", blurb: "Pick the club, the league, and season one." },
  { n: 2, title: "Log each month", blurb: "Results and player stats, with player-name typeahead." },
  { n: 3, title: "Watch it fill up", blurb: "Graphs draw themselves; the trophy cabinet grows." },
];

function SignedOut() {
  const { c: colors } = useTheme();
  const s = useMemo(() => makeStyles(colors), [colors]);
  const { width } = useWindowDimensions();
  const narrow = width < 900;
  const { openDialog } = useAuth();
  const router = useRouter();
  const [chartOn, setChartOn] = useState(false);
  const [stepsOn, setStepsOn] = useState(false);

  return (
    <Page>
      {/* 2. Hero */}
      <Reveal onVisible={setChartOn} style={[s.hero, narrow && { flexDirection: "column", alignItems: "stretch" }]}>
        <View style={{ flex: 1, minWidth: 300 }}>
          <T.display>Every save.{"\n"}Every season.{"\n"}One <T.mint style={s.glow}>vault</T.mint>.</T.display>
          <T.muted style={{ marginTop: space.lg, fontSize: 18, maxWidth: 520 }}>
            Log your career saves month by month and watch your dynasties take shape — records, trophies, Ballon d'Ors, and who really carried the team.
          </T.muted>
          <View style={{ flexDirection: "row", gap: space.sm, marginTop: space.xl, flexWrap: "wrap" }}>
            <Button primary onPress={openDialog}>Sign in</Button>
            <Button onPress={() => router.push("/teams" as any)}>Browse teams</Button>
          </View>
        </View>
        <Card style={[s.preview, narrow && { width: "100%", marginTop: space.xl }]}>
          <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: space.sm }}>
            <T.label>Inside a save</T.label>
            <T.small style={{ color: colors.muted }}>cumulative points · 5 seasons</T.small>
          </View>
          <LineChart play={chartOn} series={PREVIEW(colors.series)} xLabels={["S1", "S2", "S3", "S4", "S5"]} height={240} yFormat={(v) => `${v}`} />
        </Card>
      </Reveal>

      {/* 3. What's in the vault */}
      <Reveal style={{ marginTop: space.xxl }}><SectionLabel>What's in the vault</SectionLabel></Reveal>
      <View style={[s.grid, narrow && { flexDirection: "column" }]}>
        {FEATURES.map((f, i) => (
          <Reveal key={f.title} delay={i * 100} style={[{ flex: 1 }, !narrow && width < 1100 && { minWidth: "45%" }]}>
            <Card hover style={{ flex: 1 }}>
              <Icon name={f.icon} />
              <T.h3 style={{ marginTop: space.md }}>{f.title}</T.h3>
              <T.muted style={{ marginTop: space.xs, fontSize: 14 }}>{f.blurb}</T.muted>
            </Card>
          </Reveal>
        ))}
      </View>

      {/* 4. How it works */}
      <Reveal style={{ marginTop: space.xxl }} onVisible={setStepsOn}>
        <SectionLabel>How it works</SectionLabel>
        <View style={[s.steps, narrow && { flexDirection: "column" }]}>
          <View style={[s.connector, narrow && s.connectorV]} />
          {STEPS.map((st) => (
            <View key={st.n} style={[s.step, narrow && { flexDirection: "row", alignItems: "center", gap: space.md }]}>
              <View style={s.stepNum}><CountUp to={st.n} play={stepsOn} style={{ fontSize: 22, color: colors.onMint }} /></View>
              <View style={{ flex: 1 }}>
                <T.h3 style={{ marginTop: narrow ? 0 : space.md }}>{st.title}</T.h3>
                <T.muted style={{ fontSize: 14, marginTop: 4 }}>{st.blurb}</T.muted>
              </View>
            </View>
          ))}
        </View>
      </Reveal>

      {/* 5. Closing CTA */}
      <Reveal style={{ marginTop: space.xxl }}>
        <Card style={{ alignItems: "center", paddingVertical: space.xl }}>
          <T.h1 style={{ textAlign: "center" }}>Take the <T.mint style={s.glow}>touchline</T.mint>.</T.h1>
          <T.muted style={{ marginTop: space.sm, fontSize: 17 }}>Sign in to open your vault.</T.muted>
          <Button primary onPress={openDialog} style={{ marginTop: space.lg }}>Sign in</Button>
        </Card>
      </Reveal>

      {/* 6. Footer */}
      <Footer />
    </Page>
  );
}

function Footer() {
  const { c: colors } = useTheme();
  const s = useMemo(() => makeStyles(colors), [colors]);
  const router = useRouter();
  const { openSettings } = useSettings();
  const { user, openDialog } = useAuth();
  return (
    <View style={s.footer}>
      <T.small style={{ color: colors.muted }}>Sim Vault · soccer only</T.small>
      <View style={{ flexDirection: "row", gap: space.md }}>
        {[["Teams", "/teams"], ["Players", "/players"], ["Top Performers", "/top-performers"], ["Settings", "/settings"]].map(([l, h]) => (
          <Pressable key={h} onPress={() => (h === "/settings" ? openSettings() : router.push(h as any))} style={{ cursor: "pointer" } as any}><T.small style={{ color: colors.muted }}>{l}</T.small></Pressable>
        ))}
      </View>
    </View>
  );
}

// ---------- Signed in (hero described; sections below TBD) ----------
function SignedIn({ user }: { user: string }) {
  const router = useRouter();
  useVault(); // re-render when teams/seasons are added
  const { c: colors } = useTheme();
  const s = useMemo(() => makeStyles(colors), [colors]);
  const { width } = useWindowDimensions();
  const narrow = width < 900;
  const [heroOn, setHeroOn] = useState(false);
  const stats = vaultStats();
  const empty = stats.teamsSaved === 0;
  const tiles: [string, number][] = [["Teams saved", stats.teamsSaved], ["Seasons saved", stats.seasonsSaved], ["Trophies won", stats.trophiesWon]];
  return (
    <Page>
      <Reveal onVisible={setHeroOn} style={[s.hero, narrow && { flexDirection: "column", alignItems: "stretch" }]}>
        <View style={{ flex: 1, minWidth: 300 }}>
          <T.display>Welcome back to{"\n"}your <T.mint style={s.glow}>vault</T.mint>, {user}.</T.display>
          <T.muted style={{ marginTop: space.lg, fontSize: 18 }}>Here's everything you've saved.</T.muted>
        </View>
        <View style={[s.tiles, narrow && { marginTop: space.lg }]}>
          {tiles.map(([label, n]) => (
            <Card key={label} style={s.tile}>
              <CountUp to={n} play={heroOn} />
              <T.label style={{ marginTop: space.xs }}>{label}</T.label>
            </Card>
          ))}
        </View>
      </Reveal>
      {empty && (
        <Reveal style={{ marginTop: space.xl }}>
          <Card style={{ alignItems: "center", paddingVertical: space.xl }}>
            <T.h2>Your vault is empty.</T.h2>
            <T.muted style={{ marginTop: space.xs }}>Create a team save to start logging seasons.</T.muted>
            <Button primary style={{ marginTop: space.lg }} onPress={() => router.push("/teams" as any)}>Add a team</Button>
          </Card>
        </Reveal>
      )}
      {!empty && <>
      {/* 3. Achievements bar */}
      <Reveal style={{ marginTop: space.xl }}>
        <FullBleed render={(bleed) => (
          <Marquee fade={bleed}>
            {allBadges().slice(0, 24).map((a, i) => (
              <View key={i} style={s.chip}>
                <View style={[s.dot, { backgroundColor: tierColor[a.tier] }]} />
                <T.small style={{ fontWeight: "700" }}>{a.tier} · {a.ladder}</T.small>
                <T.small style={{ color: colors.muted }}>· {a.text.split(" · ").slice(1).join(" · ")}</T.small>
              </View>
            ))}
          </Marquee>
        )} />
      </Reveal>

      {/* 4. Top 10 */}
      <TopTen />

      {/* 5. Teams bar */}
      <Reveal style={{ marginTop: space.xl }}>
        <FullBleed render={(bleed) => (
          <Marquee fade={bleed} height={150} speed={30}>
            {recentTeams().map((t) => (
              <View key={t.id} style={{ marginRight: space.md }}>
                <Card hover onPress={() => router.push({ pathname: "/teams", params: { team: t.id } } as any)} style={s.teamCard}>
                  <View style={{ flexDirection: "row", alignItems: "center", gap: 10 }}>
                    <Logo label={t.short} color={t.color} size={40} uri={t.logo} />
                    <View style={{ flex: 1 }}>
                      <T.body style={{ fontWeight: "700" }} numberOfLines={1}>{t.name}</T.body>
                      <T.small style={{ color: colors.muted }} numberOfLines={1}>{t.league}</T.small>
                    </View>
                  </View>
                  <View style={{ flexDirection: "row", gap: space.md, marginTop: space.md }}>
                    {[["Season", `S${t.seasons}`], ["Trophies", String(t.trophies)], ["Points", String(t.currentPoints)]].map(([k, v]) => (
                      <View key={k} style={{ flex: 1 }}>
                        <T.h3 style={{ color: k === "Points" ? colors.mint : colors.text }}>{v}</T.h3>
                        <T.label>{k}</T.label>
                      </View>
                    ))}
                  </View>
                </Card>
              </View>
            ))}
          </Marquee>
        )} />
      </Reveal>

      {/* 6. Continue + Recent activity row, Season pace below */}
      <View style={[s.two, narrow && { flexDirection: "column" }]}>
        <Reveal style={{ flex: 1 }}>
          <ContinueCard />
        </Reveal>
        <Reveal delay={100} style={{ flex: 2 }}>
          <Card style={{ flex: 1 }}>
            <T.label style={{ marginBottom: space.md }}>Recent activity</T.label>
            <View style={[{ flexDirection: "row", gap: space.lg }, narrow && { flexDirection: "column", gap: 0 }]}>
              {[recentActivity.slice(0, 5), recentActivity.slice(5, 10)].map((col, ci) => (
                <View key={ci} style={{ flex: 1 }}>
                  {col.map((a, i) => (
                    <View key={i} style={[s.actRow, i === col.length - 1 && !narrow && { borderBottomWidth: 0 }]}>
                      <View style={[s.actDot, { backgroundColor: a.kind === "trophy" ? colors.series[2] : a.kind === "goal" ? colors.series[0] : a.kind === "award" ? colors.series[3] : colors.muted }]} />
                      <View style={{ flex: 1 }}>
                        <T.small style={{ fontWeight: "600" }} numberOfLines={1}>{a.text}</T.small>
                        <T.small style={{ color: colors.muted }}>{a.team} · {a.when}</T.small>
                      </View>
                    </View>
                  ))}
                </View>
              ))}
            </View>
          </Card>
        </Reveal>
      </View>

      <Reveal style={{ marginTop: space.md }}>
        <Card>
          <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "baseline", marginBottom: space.md, flexWrap: "wrap", gap: space.sm }}>
            <T.label>Season pace</T.label>
            <T.small style={{ color: colors.muted }}>vs the same month last season · projected total from this season's average</T.small>
          </View>
          <Marquee fade={space.lg} height={150} speed={30} fadeColor={colors.surface}>
            {seasonPace().map((p) => {
              const d = p.lastAtMonth == null ? null : p.now - p.lastAtMonth;
              const ahead = p.lastTotal != null && p.onPace >= p.lastTotal;
              return (
                <View key={p.id} style={s.paceTile}>
                  <View style={{ flexDirection: "row", alignItems: "center", gap: 8 }}>
                    <Logo label={p.short} color={p.color} size={26} uri={teams.find((x) => x.id === p.id)?.logo} />
                    <T.small style={{ fontWeight: "700", flex: 1 }} numberOfLines={1}>{p.name}</T.small>
                    <T.small style={{ color: colors.muted }}>{p.monthsLogged} mo</T.small>
                  </View>
                  <View style={{ flexDirection: "row", alignItems: "baseline", gap: 8, marginTop: space.sm }}>
                    <T.h2>{p.now}</T.h2>
                    <T.small style={{ color: colors.muted, flex: 1 }}>{p.lastAtMonth == null ? "first season" : `vs ${p.lastAtMonth} this time last season`}</T.small>
                    {d != null && <T.small style={{ fontWeight: "700", color: d >= 0 ? colors.series[0] : colors.loss }}>{d >= 0 ? "▲" : "▼"} {Math.abs(d)}</T.small>}
                  </View>
                  <View style={s.paceRow}>
                    <T.small style={{ color: colors.muted }}>On pace for</T.small>
                    <T.h3 style={{ color: p.lastTotal == null ? colors.text : ahead ? colors.series[0] : colors.loss }}>{p.onPace}</T.h3>
                    {p.lastTotal != null && <T.small style={{ color: colors.muted }}>· last season {p.lastTotal}</T.small>}
                  </View>
                </View>
              );
            })}
          </Marquee>
        </Card>
      </Reveal>

      </>}
      {/* 7. Footer */}
      <Footer />
    </Page>
  );
}

function ContinueCard() {
  const { c: colors } = useTheme();
  const router = useRouter();
  const t = teams.find((x) => x.id === lastLog.teamId) ?? teams[0];
  if (!t) return null;
  return (
    <Card style={{ flex: 1, justifyContent: "space-between" }}>
      <View>
        <T.label style={{ marginBottom: space.md }}>Continue where you left off</T.label>
        <View style={{ flexDirection: "row", alignItems: "center", gap: 12 }}>
          <Logo label={t.short} color={t.color} size={48} uri={t.logo} />
          <View>
            <T.h3>{t.name}</T.h3>
            <T.small style={{ color: colors.muted }}>Last logged: S{lastLog.season} · {lastLog.month}, {lastLog.ago}</T.small>
          </View>
        </View>
        <T.muted style={{ marginTop: space.md, fontSize: 14 }}>{t.currentPoints} points after {lastLog.month}. {lastLog.nextMonth} is next.</T.muted>
      </View>
      <View style={{ flexDirection: "row", gap: space.sm, marginTop: space.lg }}>
        <Button primary onPress={() => router.push({ pathname: "/teams", params: { team: t.id } } as any)}>Log {lastLog.nextMonth}</Button>
        <Button onPress={() => router.push({ pathname: "/teams", params: { team: t.id } } as any)}>Open team</Button>
      </View>
    </Card>
  );
}

const TOP = ["Goals", "Assists", "Goal contributions", "Points"] as const;
function TopTen() {
  const { c: colors } = useTheme();
  const [stat, setStat] = useState<(typeof TOP)[number]>("Goals");
  const [on, setOn] = useState(false);
  const seasonsOf = (team: string) => teams.find((t) => t.name === team)?.seasons ?? 3;
  const rows = stat === "Points"
    ? teams.map((t, i) => ({ name: t.name, total: t.pointsBySeason.reduce((a, b) => a + b, 0), months: t.seasons * MONTHS_PER_SEASON, seed: i + 1 }))
    : playerTotals.map((p, i) => ({ name: p.name, total: stat === "Goals" ? p.goals : stat === "Assists" ? p.assists : p.goals + p.assists, months: seasonsOf(p.team) * MONTHS_PER_SEASON, seed: i + 11 }));
  const top = [...rows].sort((a, b) => b.total - a.total).slice(0, 10);
  const months = Math.max(...top.map((r) => r.months));
  const series = top.map((r, i) => ({ name: r.name, color: colors.series[i % colors.series.length], values: monthlyCumulative(r.total, r.months, r.seed) }));
  return (
    <Reveal style={{ marginTop: space.xl }} onVisible={setOn}>
      <Card>
        <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: space.sm, marginBottom: space.md }}>
          <View>
            <T.h3>Top 10 · {stat.toLowerCase()} {stat === "Points" ? "(teams)" : "(players)"}</T.h3>
            <T.small style={{ color: colors.muted }}>running total by month · ticks mark the start of each season</T.small>
          </View>
          <View style={{ flexDirection: "row", gap: 4, flexWrap: "wrap" }}>
            {TOP.map((t) => <Pill key={t} active={stat === t} onPress={() => setStat(t)}>{t}</Pill>)}
          </View>
        </View>
        <LineChart play={on} series={series} xLabels={seasonTicks(months)} xTooltip={monthLabel} height={380} />
      </Card>
    </Reveal>
  );
}

function Icon({ name }: { name: string }) {
  const { c: colors } = useTheme();
  const s = useMemo(() => makeStyles(colors), [colors]);
  const c = colors.mint;
  const p = { stroke: c, strokeWidth: 1.8, fill: "none", strokeLinecap: "round" as const, strokeLinejoin: "round" as const };
  return (
    <View style={s.iconWrap}>
      <Svg width={22} height={22} viewBox="0 0 24 24">
        {name === "shield" && <Path d="M12 3l7 3v5c0 5-3 8-7 10-4-2-7-5-7-10V6l7-3z" {...p} />}
        {name === "user" && <><Circle cx={12} cy={8} r={4} {...p} /><Path d="M4 21c0-4 3.6-7 8-7s8 3 8 7" {...p} /></>}
        {name === "trophy" && <><Path d="M7 4h10v5a5 5 0 0 1-10 0V4z" {...p} /><Path d="M7 6H4v2a3 3 0 0 0 3 3M17 6h3v2a3 3 0 0 1-3 3M12 14v4M8 21h8" {...p} /></>}
        {name === "calendar" && <><Rect x={3} y={5} width={18} height={16} rx={2} {...p} /><Line x1={3} y1={10} x2={21} y2={10} {...p} /><Line x1={8} y1={3} x2={8} y2={7} {...p} /><Line x1={16} y1={3} x2={16} y2={7} {...p} /></>}
      </Svg>
    </View>
  );
}

const makeStyles = (colors: Colors) => StyleSheet.create({
  hero: { flexDirection: "row", alignItems: "center", gap: space.xl, paddingTop: 96, paddingBottom: space.lg },
  glow: { textShadow: `0 0 24px ${colors.mintGlow}` } as any,
  preview: { width: 520, maxWidth: "100%", boxShadow: `0 20px 60px rgba(0,0,0,0.45)` } as any,
  grid: { flexDirection: "row", flexWrap: "wrap", gap: space.md, alignItems: "stretch" },
  tiles: { flexDirection: "row", flexWrap: "wrap", gap: space.md },
  chip: { flexDirection: "row", alignItems: "center", gap: 8, paddingHorizontal: 14, paddingVertical: 8, marginRight: 10, borderRadius: radius.pill, borderWidth: 1, borderColor: colors.border, backgroundColor: colors.surface },
  dot: { width: 8, height: 8, borderRadius: 4 },
  teamCard: { width: 300, padding: space.md },
  two: { flexDirection: "row", gap: space.md, marginTop: space.xl },
  actRow: { flexDirection: "row", alignItems: "flex-start", gap: 10, paddingVertical: 8, borderBottomWidth: 1, borderBottomColor: colors.border },
  actDot: { width: 8, height: 8, borderRadius: 4, marginTop: 6 },
  paceRow: { flexDirection: "row", alignItems: "baseline", gap: 6, marginTop: space.sm, paddingTop: space.sm, borderTopWidth: 1, borderTopColor: colors.border },
  paceTile: { width: 280, marginRight: space.sm, padding: space.md, borderRadius: radius.tile, borderWidth: 1, borderColor: colors.border, backgroundColor: colors.surfaceRaised },
  tile: { minWidth: 150, flexGrow: 1 },
  iconWrap: { width: 40, height: 40, borderRadius: radius.sm, backgroundColor: colors.mintDim, alignItems: "center", justifyContent: "center" },
  steps: { flexDirection: "row", gap: space.lg, position: "relative" },
  connector: { position: "absolute", left: 24, right: 24, top: 24, height: 2, backgroundColor: colors.mint, opacity: 0.5, boxShadow: `0 0 12px ${colors.mintGlow}` } as any,
  connectorV: { left: 24, right: undefined, top: 24, bottom: 24, width: 2, height: undefined },
  step: { flex: 1 },
  stepNum: { width: 48, height: 48, borderRadius: 24, backgroundColor: colors.mint, alignItems: "center", justifyContent: "center", boxShadow: `0 0 18px ${colors.mintGlow}` } as any,
  footer: { flexDirection: "row", justifyContent: "space-between", flexWrap: "wrap", gap: space.md, marginTop: space.xxl, paddingTop: space.lg, borderTopWidth: 1, borderTopColor: colors.border },
});
