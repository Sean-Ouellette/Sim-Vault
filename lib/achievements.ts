// Achievement ladders (design.md → Achievements (shared)). One badge per ladder at the highest tier reached.
import { MONTHS_PER_SEASON, Team, Tier, getSeasonData, scopeData, teams, trophyDefs, sum } from "./data";

export const TIERS: Tier[] = ["GOAT", "Great", "Average", "Bad"];
export type Badge = { ladder: string; tier: Tier; value: number; text: string; scope: "season" | "save"; teamId: string; season?: number };
export type LadderResult = { ladder: string; value: number; tier: Tier | null; needed: Partial<Record<Tier, string>>; format: (v: number) => string };

type Ladder = { name: string; thresholds: [number | null, number | null, number | null, number | null]; floorBad?: boolean; lowerIsBetter?: boolean; format?: (v: number) => string };

const fmt = (v: number) => String(Math.round(v * 100) / 100);
// Season ladders. thresholds = [GOAT, Great, Average, Bad] minimums (null = tier doesn't exist). floorBad: Bad needs its threshold too; otherwise Bad is "below Average".
const SEASON: Ladder[] = [
  { name: "Trophies", thresholds: [4, 1, null, 0] },
  { name: "Goals", thresholds: [225, 150, 100, 75], floorBad: true },
  { name: "Goal contributions", thresholds: [325, 250, 150, 125], floorBad: true },
  { name: "Points", thresholds: [100, 90, 55, 0] },
  { name: "Losses", thresholds: [0, 1, 4, 9], lowerIsBetter: true },
  { name: "Clean sheets", thresholds: [20, 15, 10, 6], floorBad: true },
  { name: "Unbeaten months", thresholds: [MONTHS_PER_SEASON, 6, 4, 2], floorBad: true },
];
// Whole-save ladders: per-season rates (× seasons played), except streak and GOAT-season share.
const SAVE_RATES: Ladder[] = [
  { name: "Trophies", thresholds: [2.5, 1.25, 0.25, 0] },
  { name: "Goals", thresholds: [175, 125, 90, 0] },
  { name: "Goal contributions", thresholds: [260, 200, 140, 0] },
  { name: "Points", thresholds: [90, 75, 55, 0] },
  { name: "Clean sheets", thresholds: [16, 12, 8, 0] },
];
const GOAT_SEASONS: Ladder = { name: "GOAT seasons", thresholds: [0.4, 0.2, 0.05, 0], format: (v) => `${Math.round(v * 100)}%` };
const TITLE_STREAK: Ladder = { name: "League title streak", thresholds: [4, 2, 1, 0] };

function grade(l: Ladder, value: number, scale = 1): LadderResult {
  const t = l.thresholds.map((x) => (x == null ? null : x * scale));
  let tier: Tier | null = null;
  for (let i = 0; i < 4; i++) {
    const th = t[i]; if (th == null) continue;
    const hit = l.lowerIsBetter ? value <= th : value >= th;
    if (hit) { tier = TIERS[i]; break; }
  }
  if (!l.lowerIsBetter && !l.floorBad && tier == null) tier = "Bad"; // "below" ladders always show Bad
  if (l.lowerIsBetter && tier == null) tier = "Bad";
  const needed: Partial<Record<Tier, string>> = {};
  const f = l.format ?? fmt;
  t.forEach((th, i) => { if (th != null) needed[TIERS[i]] = l.lowerIsBetter ? `${f(th)} or fewer` : `${f(th)} needed`; });
  return { ladder: l.name, value, tier, needed, format: l.format ?? fmt };
}

function seasonStats(team: Team, i: number) {
  const sd = getSeasonData(team.id, i);
  const goals = sum(sd.players.flatMap((p) => p.goals)); const assists = sum(sd.players.flatMap((p) => p.assists));
  const keepers = sd.players.filter((p) => p.pos === "GK");
  const cs = keepers.length ? Math.max(...keepers.map((p) => sum(p.cleanSheets))) : sum(sd.record.map((_, m) => Math.max(0, ...sd.players.map((p) => p.cleanSheets[m]))));
  const logged = sd.record.filter((r) => r.w + r.d + r.l > 0);
  return {
    trophies: sd.trophies.length, goals, gc: goals + assists, points: sum(sd.record.map((r) => r.w * 3 + r.d)), losses: sum(sd.record.map((r) => r.l)),
    cs, unbeaten: logged.filter((r) => r.l === 0).length, loggedMonths: logged.length,
    title: sd.trophies.includes((trophyDefs[team.league] ?? [])[0] ?? "__"),
  };
}

export function seasonLadders(team: Team, i: number): LadderResult[] {
  const s = seasonStats(team, i);
  const unbeaten = { ...SEASON[6], thresholds: [Math.max(1, s.loggedMonths), 6, 4, 2] as Ladder["thresholds"] };
  return [grade(SEASON[0], s.trophies), grade(SEASON[1], s.goals), grade(SEASON[2], s.gc), grade(SEASON[3], s.points), grade(SEASON[4], s.losses), grade(SEASON[5], s.cs), grade(unbeaten, s.unbeaten)];
}

export function saveLadders(team: Team): LadderResult[] {
  const n = Math.max(1, team.seasons);
  const all = Array.from({ length: team.seasons }, (_, i) => seasonStats(team, i));
  const tot = (k: keyof ReturnType<typeof seasonStats>) => sum(all.map((x) => Number(x[k])));
  let streak = 0, best = 0; all.forEach((x) => { streak = x.title ? streak + 1 : 0; best = Math.max(best, streak); });
  return [
    grade(SAVE_RATES[0], tot("trophies"), n), grade(SAVE_RATES[1], tot("goals"), n), grade(SAVE_RATES[2], tot("gc"), n),
    grade(SAVE_RATES[3], tot("points"), n), grade(SAVE_RATES[4], tot("cs"), n),
    grade(GOAT_SEASONS, all.filter((x) => x.points >= 100).length / n), grade(TITLE_STREAK, best),
  ];
}

/** Every badge earned across all saves (Home bar). GOAT first. */
export function allBadges(): Badge[] {
  const out: Badge[] = [];
  teams.forEach((t) => {
    saveLadders(t).forEach((r) => r.tier && out.push({ ladder: r.ladder, tier: r.tier, value: r.value, text: `${r.ladder} · ${r.format(r.value)} · ${t.name} · whole save`, scope: "save", teamId: t.id }));
    for (let i = 0; i < t.seasons; i++) seasonLadders(t, i).forEach((r) => r.tier && out.push({ ladder: r.ladder, tier: r.tier, value: r.value, text: `${r.ladder} · ${r.format(r.value)} · ${t.name} S${i + 1}`, scope: "season", teamId: t.id, season: i }));
  });
  return out.sort((a, b) => TIERS.indexOf(a.tier) - TIERS.indexOf(b.tier));
}
