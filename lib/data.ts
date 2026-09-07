// Placeholder save data for the signed-in render. Shapes mirror pages/*.md "Features".
export type Team = { id: string; name: string; short: string; league: string; color: string; lastSaved: string; seasons: number; trophies: number; w: number; d: number; l: number; pointsBySeason: number[]; currentPoints: number; monthsLogged: number; logo?: string; note?: string };

export const teams: Team[] = [
  { id: "t1", name: "Verdant Athletic", short: "VER", league: "Premier League", color: "#3DF5B6", lastSaved: "2026-09-04", seasons: 6, trophies: 4, w: 158, d: 41, l: 29, pointsBySeason: [71, 78, 84, 88, 91, 93], currentPoints: 41, monthsLogged: 4, note: "Road to glory from League Two. Youth academy first." },
  { id: "t2", name: "Nordhaven FC", short: "NOR", league: "Eredivisie", color: "#4DA3FF", lastSaved: "2026-09-01", seasons: 5, trophies: 2, w: 121, d: 38, l: 31, pointsBySeason: [66, 72, 75, 80, 83], currentPoints: 33, monthsLogged: 4, note: "Dutch rebuild: sell high, buy young." },
  { id: "t3", name: "Solstice United", short: "SOL", league: "La Liga", color: "#FF9F43", lastSaved: "2026-08-27", seasons: 4, trophies: 1, w: 84, d: 36, l: 32, pointsBySeason: [58, 64, 70, 76], currentPoints: 27, monthsLogged: 3, note: "Cup specialist save — every final counts." },
  { id: "t4", name: "Brixton Rovers", short: "BRX", league: "Championship", color: "#B388FF", lastSaved: "2026-08-20", seasons: 4, trophies: 1, w: 79, d: 40, l: 33, pointsBySeason: [55, 61, 68, 73], currentPoints: 22, monthsLogged: 3, note: "Promotion push on a shoestring. Loans only." },
  { id: "t5", name: "Calder Town", short: "CAL", league: "Serie A", color: "#FF5C7A", lastSaved: "2026-08-11", seasons: 3, trophies: 0, w: 52, d: 27, l: 35, pointsBySeason: [49, 57, 63], currentPoints: 15, monthsLogged: 2, note: "Survive first, then build. Defensive 3-5-2." },
];

export const recentTeams = () => [...teams].sort((a, b) => (a.lastSaved < b.lastSaved ? 1 : -1));

export const vaultStats = () => ({
  teamsSaved: teams.length,
  seasonsSaved: teams.reduce((n, t) => n + t.seasons, 0),
  trophiesWon: teams.reduce((n, t) => n + t.trophies, 0),
});

export type Tier = "GOAT" | "Great" | "Average" | "Bad";
export const tierColor: Record<Tier, string> = { GOAT: "#3DF5B6", Great: "#4DA3FF", Average: "#9BA8A1", Bad: "#F25C5C" };

// Career totals across all saves for the top-10 chart.
export const playerTotals = [
  { name: "Mateo Reyes", team: "Verdant Athletic", goals: 142, assists: 38 },
  { name: "Kofi Mensah", team: "Verdant Athletic", goals: 96, assists: 71 },
  { name: "Luca Bianchi", team: "Nordhaven FC", goals: 64, assists: 88 },
  { name: "Yusuf Demir", team: "Solstice United", goals: 88, assists: 29 },
  { name: "Emeka Obi", team: "Brixton Rovers", goals: 77, assists: 33 },
  { name: "Rafael Costa", team: "Calder Town", goals: 59, assists: 41 },
  { name: "Jonas Lindqvist", team: "Nordhaven FC", goals: 52, assists: 46 },
  { name: "Sami Haddad", team: "Verdant Athletic", goals: 31, assists: 57 },
  { name: "Diego Ferreira", team: "Solstice United", goals: 48, assists: 22 },
  { name: "Aiden Walsh", team: "Brixton Rovers", goals: 40, assists: 27 },
  { name: "Tomasz Nowak", team: "Solstice United", goals: 12, assists: 9 },
  { name: "Hugo Martin", team: "Calder Town", goals: 35, assists: 18 },
];

export const MONTHS_PER_SEASON = 10;
export const monthNames = ["Aug", "Sep", "Oct", "Nov", "Dec", "Jan", "Feb", "Mar", "Apr", "May"];

/** Deterministic pseudo-random split of `total` over `months`, returned cumulative. */
export function monthlyCumulative(total: number, months: number, seed: number): number[] {
  let x = seed * 9301 + 49297;
  const w = Array.from({ length: months }, () => { x = (x * 9301 + 49297) % 233280; return 0.4 + x / 233280; });
  const sum = w.reduce((a, b) => a + b, 0);
  let acc = 0, out: number[] = [];
  for (let i = 0; i < months; i++) { acc += (w[i] / sum) * total; out.push(Math.round(acc)); }
  if (out.length) out[out.length - 1] = total;
  return out;
}

/** X labels for a monthly axis: season number at each season's first month, blank elsewhere. */
export function seasonTicks(months: number) {
  return Array.from({ length: months }, (_, i) => (i % MONTHS_PER_SEASON === 0 ? `S${i / MONTHS_PER_SEASON + 1}` : ""));
}
export function monthLabel(i: number) { return `S${Math.floor(i / MONTHS_PER_SEASON) + 1} · ${monthNames[i % MONTHS_PER_SEASON]}`; }

// ---- Trial sections (signed-in home) ----
export const lastLog = { teamId: "t1", season: 6, month: "Nov", nextMonth: "Dec", ago: "2 days ago" };

export const recentActivity = [
  { kind: "goal", text: "Mateo Reyes scored 3 vs Nordhaven", team: "Verdant Athletic", when: "2 days ago" },
  { kind: "trophy", text: "Won the Community Shield", team: "Verdant Athletic", when: "5 days ago" },
  { kind: "log", text: "October logged: 3W 1D 0L", team: "Nordhaven FC", when: "1 week ago" },
  { kind: "award", text: "Luca Bianchi named player of the month", team: "Nordhaven FC", when: "1 week ago" },
  { kind: "log", text: "Season 4 started", team: "Solstice United", when: "2 weeks ago" },
  { kind: "goal", text: "Yusuf Demir hat-trick vs Calder Town", team: "Solstice United", when: "2 weeks ago" },
  { kind: "trophy", text: "Won the EFL Cup", team: "Brixton Rovers", when: "3 weeks ago" },
  { kind: "log", text: "September logged: 2W 2D 0L", team: "Brixton Rovers", when: "3 weeks ago" },
  { kind: "award", text: "Idris Kane: 4 clean sheets in a month", team: "Brixton Rovers", when: "1 month ago" },
  { kind: "log", text: "Season 3 started", team: "Calder Town", when: "1 month ago" },
];

/** Season pace: points now vs same month last season, plus projected total from this season's average. */
export const seasonPace = () => teams.map((t, i) => {
  const lastTotal = t.pointsBySeason.length > 1 ? t.pointsBySeason[t.pointsBySeason.length - 2] : null;
  // placeholder: last season's running total at the same month (real data comes from monthly logs)
  const lastAtMonth = lastTotal == null ? null : Math.round(lastTotal * (t.monthsLogged / MONTHS_PER_SEASON) * (0.9 + (i % 3) * 0.08));
  const avg = t.monthsLogged ? t.currentPoints / t.monthsLogged : 0;
  const onPace = Math.round(avg * MONTHS_PER_SEASON);
  return { id: t.id, name: t.name, short: t.short, color: t.color, now: t.currentPoints, monthsLogged: t.monthsLogged, lastAtMonth, lastTotal, onPace };
});

export function sum(xs: number[]) { return xs.reduce((a, b) => a + b, 0); }
export function cumulative(xs: number[]) { let c = 0; return xs.map((x) => (c += x)); }
export const topTeamsByPoints = () => [...teams].sort((a, b) => sum(b.pointsBySeason) - sum(a.pointsBySeason)).slice(0, 5);

// ---- Teams page ----
export const months = ["Aug", "Sep", "Oct", "Nov", "Dec", "Jan", "Feb", "Mar", "Apr", "May"];

export type Player = { id: string; name: string; pos: string; goals: number[]; assists: number[]; apps: number[]; cleanSheets: number[]; rating: number[]; ballonDors: number };

// per-month arrays for the selected season (10 months)
export const players: Player[] = [
  { id: "p1", name: "Mateo Reyes", pos: "ST", goals: [3, 4, 2, 5, 3, 4, 2, 4, 3, 2], assists: [1, 0, 2, 1, 1, 0, 1, 2, 0, 1], apps: [4, 4, 3, 5, 4, 4, 3, 4, 4, 3], cleanSheets: [0,0,0,0,0,0,0,0,0,0], rating: [7.4, 7.9, 7.1, 8.2, 7.6, 7.8, 7.0, 7.7, 7.5, 7.3], ballonDors: 2 },
  { id: "p2", name: "Kofi Mensah", pos: "LW", goals: [2, 1, 3, 2, 2, 3, 1, 2, 2, 1], assists: [2, 3, 1, 2, 3, 2, 2, 1, 3, 2], apps: [4, 4, 4, 5, 4, 4, 3, 4, 4, 3], cleanSheets: [0,0,0,0,0,0,0,0,0,0], rating: [7.2, 7.5, 7.8, 7.3, 7.6, 7.9, 7.1, 7.4, 7.7, 7.2], ballonDors: 0 },
  { id: "p3", name: "Luca Bianchi", pos: "CAM", goals: [1, 2, 1, 1, 2, 1, 2, 1, 1, 2], assists: [3, 2, 4, 3, 2, 3, 2, 4, 3, 2], apps: [4, 4, 4, 4, 4, 4, 3, 4, 4, 3], cleanSheets: [0,0,0,0,0,0,0,0,0,0], rating: [7.6, 7.4, 8.0, 7.5, 7.3, 7.7, 7.4, 8.1, 7.6, 7.4], ballonDors: 0 },
  { id: "p4", name: "Tomasz Nowak", pos: "CB", goals: [0, 1, 0, 0, 1, 0, 0, 1, 0, 0], assists: [0, 0, 1, 0, 0, 0, 1, 0, 0, 0], apps: [4, 4, 4, 5, 4, 4, 3, 4, 4, 3], cleanSheets: [2, 1, 2, 3, 1, 2, 1, 2, 2, 1], rating: [7.0, 7.2, 7.1, 7.4, 6.9, 7.1, 7.0, 7.3, 7.2, 7.0], ballonDors: 0 },
  { id: "p5", name: "Idris Kane", pos: "GK", goals: [0,0,0,0,0,0,0,0,0,0], assists: [0,0,0,0,0,0,0,0,0,0], apps: [4, 4, 4, 5, 4, 4, 3, 4, 4, 3], cleanSheets: [2, 1, 2, 3, 1, 2, 1, 2, 2, 1], rating: [6.9, 7.3, 7.0, 7.5, 6.8, 7.2, 7.1, 7.4, 7.0, 6.9], ballonDors: 0 },
  { id: "p6", name: "Sami Haddad", pos: "CM", goals: [1, 0, 1, 1, 0, 1, 0, 1, 1, 0], assists: [1, 2, 1, 1, 2, 1, 1, 1, 2, 1], apps: [3, 4, 4, 4, 4, 3, 3, 4, 4, 3], cleanSheets: [0,0,0,0,0,0,0,0,0,0], rating: [7.1, 7.0, 7.3, 7.2, 7.1, 7.4, 7.0, 7.2, 7.3, 7.1], ballonDors: 0 },
];

export const seasonsFor = (team: Team) => Array.from({ length: team.seasons }, (_, i) => `Season ${i + 1}`);

export const monthlyRecord = [
  { w: 3, d: 1, l: 0 }, { w: 2, d: 1, l: 1 }, { w: 3, d: 0, l: 1 }, { w: 4, d: 1, l: 0 }, { w: 2, d: 2, l: 0 },
  { w: 3, d: 1, l: 0 }, { w: 2, d: 0, l: 1 }, { w: 3, d: 1, l: 0 }, { w: 3, d: 0, l: 1 }, { w: 2, d: 1, l: 0 },
];

export const trophyDefs: Record<string, string[]> = {
  "Premier League": ["Premier League", "FA Cup", "EFL Cup", "Community Shield", "Champions League"],
  "Eredivisie": ["Eredivisie", "KNVB Cup", "Johan Cruyff Shield", "Champions League"],
  "La Liga": ["La Liga", "Copa del Rey", "Supercopa", "Champions League"],
  "Championship": ["Championship", "FA Cup", "EFL Cup"],
  "Serie A": ["Serie A", "Coppa Italia", "Supercoppa", "Champions League"],
  "Ligue 1": ["Ligue 1", "Coupe de France", "Trophée des Champions", "Champions League"],
};

export const trophiesWonSave: Record<string, number> = { "Premier League": 2, "FA Cup": 1, "EFL Cup": 0, "Community Shield": 1, "Champions League": 0 };
export const trophiesWonSeason = ["Premier League", "Community Shield"];

export const ballonDorSave = { player: "Mateo Reyes", count: 2 };
export const ballonDorSeason: string | null = "Mateo Reyes";

const _legacyTiers = {
  GOAT: ["Invincible season", "Continental treble"],
  Great: ["League title", "100+ goals"],
  Average: ["Top-4 finish", "Cup semi-final"],
  Bad: ["Relegation scrap", "Manager sacked"],
};


// ---- Players page ----
export type PlayerProfile = {
  id: string; name: string; pos: string; group: "GK" | "DEF" | "MID" | "FWD"; teamId: string; ballonDors: number;
  /** seasons with data, oldest first: which team, and 10 monthly entries */
  seasons: { season: number; teamId: string; pos: string; apps: number[]; goals: number[]; assists: number[]; cleanSheets: number[]; rating: number[] }[];
};

const groupOf = (pos: string): PlayerProfile["group"] => pos === "GK" ? "GK" : ["CB", "LB", "RB"].includes(pos) ? "DEF" : ["CM", "CAM", "CDM"].includes(pos) ? "MID" : "FWD";

function seasonRow(season: number, teamId: string, pos: string, seed: number, goalsT: number, assistsT: number, cs: number, rating: number) {
  const rnd = (i: number) => ((seed * 31 + i * 17) % 7) / 7;
  return {
    season, teamId, pos,
    apps: Array.from({ length: 10 }, (_, i) => 3 + Math.round(rnd(i) * 2)),
    goals: monthlyCumulative(goalsT, 10, seed).map((v, i, a) => (i ? v - a[i - 1] : v)),
    assists: monthlyCumulative(assistsT, 10, seed + 5).map((v, i, a) => (i ? v - a[i - 1] : v)),
    cleanSheets: Array.from({ length: 10 }, (_, i) => Math.round(rnd(i + 3) * (cs ? 3 : 2))),
    rating: Array.from({ length: 10 }, (_, i) => +(rating - 0.4 + rnd(i + 9) * 0.8).toFixed(1)),
  };
}

export const playerProfiles: PlayerProfile[] = [
  { id: "p1", name: "Mateo Reyes", pos: "ST", teamId: "t1", ballonDors: 2 },
  { id: "p2", name: "Kofi Mensah", pos: "LW", teamId: "t1", ballonDors: 0 },
  { id: "p3", name: "Luca Bianchi", pos: "CAM", teamId: "t2", ballonDors: 0 },
  { id: "p4", name: "Yusuf Demir", pos: "ST", teamId: "t3", ballonDors: 0 },
  { id: "p5", name: "Emeka Obi", pos: "RW", teamId: "t4", ballonDors: 0 },
  { id: "p6", name: "Rafael Costa", pos: "CM", teamId: "t5", ballonDors: 0 },
  { id: "p7", name: "Jonas Lindqvist", pos: "ST", teamId: "t2", ballonDors: 1 },
  { id: "p8", name: "Sami Haddad", pos: "CM", teamId: "t1", ballonDors: 0 },
  { id: "p9", name: "Diego Ferreira", pos: "LW", teamId: "t3", ballonDors: 0 },
  { id: "p10", name: "Aiden Walsh", pos: "RB", teamId: "t4", ballonDors: 0 },
  { id: "p11", name: "Tomasz Nowak", pos: "CB", teamId: "t3", ballonDors: 0 },
  { id: "p12", name: "Idris Kane", pos: "GK", teamId: "t4", ballonDors: 0 },
  { id: "p13", name: "Hugo Martin", pos: "CDM", teamId: "t5", ballonDors: 0 },
  { id: "p14", name: "Ben Okafor", pos: "GK", teamId: "t1", ballonDors: 0 },
].map((p, i) => {
  const team = teams.find((t) => t.id === p.teamId)!;
  const n = Math.max(2, Math.min(team.seasons, 3 + (i % 3)));
  const base = playerTotals.find((x) => x.name === p.name) ?? { goals: 20, assists: 10 };
  const seasons = Array.from({ length: n }, (_, k) => {
    const prevTeam = k === 0 && i % 4 === 0 ? teams[(i + 1) % teams.length].id : p.teamId;
    const share = (k + 1) / ((n * (n + 1)) / 2);
    const alt: Record<string, string> = { ST: "RW", LW: "ST", CAM: "CM", CM: "CDM", RW: "ST", CB: "RB", RB: "CB", CDM: "CM", GK: "GK" };
    const pos = k === 1 && i % 3 === 1 ? alt[p.pos] ?? p.pos : p.pos; // some players covered a second position for a season
    return seasonRow(team.seasons - n + k + 1, prevTeam, pos, i * 7 + k, Math.round(base.goals * share), Math.round(base.assists * share), p.pos === "GK" || p.pos === "CB" ? 1 : 0, p.pos === "GK" ? 6.9 : 7.1 + (i % 4) * 0.15);
  });
  return { ...p, group: groupOf(p.pos), seasons } as PlayerProfile;
});

export const teamById = (id: string) => teams.find((t) => t.id === id)!;
/** Teams a player has played for, with the positions covered at each (in career order). */
export const teamsPlayedFor = (p: PlayerProfile) => {
  const out: { teamId: string; positions: string[]; seasons: number[] }[] = [];
  p.seasons.forEach((s) => { let e = out.find((x) => x.teamId === s.teamId); if (!e) { e = { teamId: s.teamId, positions: [], seasons: [] }; out.push(e); } if (!e.positions.includes(s.pos)) e.positions.push(s.pos); e.seasons.push(s.season); });
  return out;
};
export const career = (p: PlayerProfile) => {
  const all = (k: "apps" | "goals" | "assists" | "cleanSheets") => p.seasons.flatMap((s) => s[k]);
  const ratings = p.seasons.flatMap((s) => s.rating);
  return { apps: sum(all("apps")), goals: sum(all("goals")), assists: sum(all("assists")), cleanSheets: sum(all("cleanSheets")), rating: +(sum(ratings) / ratings.length).toFixed(2) };
};

// ---- Per-season monthly data for the Teams page (placeholder, generated once per team+season, then editable) ----
export type MonthRecord = { w: number; d: number; l: number };
export type SeasonData = { record: MonthRecord[]; players: Player[]; trophies: string[] };
const seasonCache = new Map<string, SeasonData>();
const hash = (s: string) => [...s].reduce((a, c) => (a * 31 + c.charCodeAt(0)) % 100003, 7);

/** Monthly data for one season of one team. Generated deterministically from the base placeholder on first use; edits persist in the cache. */
export function getSeasonData(teamId: string, seasonIdx: number): SeasonData {
  const key = `${teamId}:${seasonIdx}`;
  const hit = seasonCache.get(key); if (hit) return hit;
  const seed = hash(teamId) + seasonIdx * 17;
  const jit = (i: number, k: number) => 0.55 + ((seed * 31 + i * 7 + k * 13) % 10) / 10; // 0.55 … 1.45
  const clamp = (v: number, lo: number, hi: number) => Math.max(lo, Math.min(hi, v));
  const record = monthlyRecord.map((r, i) => ({ w: clamp(Math.round(r.w * jit(i, 1)), 0, 5), d: clamp(Math.round(r.d * jit(i, 2)), 0, 3), l: clamp(Math.round(r.l * jit(i, 3) + (jit(i, 4) > 1.3 ? 1 : 0)), 0, 3) }));
  const players = players_base().map((p, pi) => ({
    ...p,
    goals: p.goals.map((g, i) => Math.round(g * jit(i + pi, 5))),
    assists: p.assists.map((g, i) => Math.round(g * jit(i + pi, 6))),
    apps: p.apps.map((g, i) => clamp(Math.round(g * jit(i + pi, 7)), 1, 5)),
    // clean sheets are recorded for everyone: keepers/defenders keep their own numbers, outfield players get the team's shut-out months they played in
    cleanSheets: p.cleanSheets.some((x) => x > 0) ? p.cleanSheets.map((g, i) => Math.round(g * jit(i + pi, 8))) : record.map((r, i) => Math.min(Math.round(r.w * 0.6 * jit(i + pi, 8)), 3)),
    rating: p.rating.map((g, i) => +(g + (jit(i + pi, 9) - 1) * 0.6).toFixed(1)),
  }));
  const team = teams.find((t) => t.id === teamId);
  const pool = team ? (trophyDefs[team.league] ?? []) : [];
  const trophies = team && seasonIdx === team.seasons - 1 && teamId === "t1" ? [...trophiesWonSeason] : pool.filter((_, i) => jit(i, 11) > 1.25);
  const sd = { record, players, trophies }; seasonCache.set(key, sd); return sd;
}
function players_base(): Player[] { return players.map((p) => ({ ...p, goals: [...p.goals], assists: [...p.assists], apps: [...p.apps], cleanSheets: [...p.cleanSheets], rating: [...p.rating] })); }

/** Data for the current scope: one season, or every season concatenated month by month (save scope). */
export const trophyCount = (team: Team, t: string) => Array.from({ length: team.seasons }, (_, i) => getSeasonData(team.id, i)).filter((sd) => sd.trophies.includes(t)).length;
export const trophiesTotal = (team: Team) => Array.from({ length: team.seasons }, (_, i) => getSeasonData(team.id, i).trophies.length).reduce((a, b) => a + b, 0);

export function scopeData(team: Team, season: number | null): { record: MonthRecord[]; players: Player[]; months: number; seasonsIncluded: number[] } {
  const idxs = season == null ? Array.from({ length: team.seasons }, (_, i) => i) : [season];
  const parts = idxs.map((i) => getSeasonData(team.id, i));
  const record = parts.flatMap((x) => x.record);
  const merged: Player[] = players.map((base, pi) => ({
    ...base,
    goals: parts.flatMap((x) => x.players[pi].goals), assists: parts.flatMap((x) => x.players[pi].assists), apps: parts.flatMap((x) => x.players[pi].apps),
    cleanSheets: parts.flatMap((x) => x.players[pi].cleanSheets), rating: parts.flatMap((x) => x.players[pi].rating),
    pos: parts[parts.length - 1].players[pi].pos,
  }));
  return { record, players: merged, months: record.length, seasonsIncluded: idxs };
}

// ---- Whole-vault snapshot (persistence, export, import) ----
export type VaultSnapshot = { version: 1; exportedAt: string; teams: Team[]; seasons: Record<string, SeasonData> };
export function snapshotVault(): VaultSnapshot {
  // make sure every season of every team is materialised so the snapshot is complete
  teams.forEach((t) => { for (let i = 0; i < t.seasons; i++) getSeasonData(t.id, i); });
  return { version: 1, exportedAt: new Date().toISOString(), teams: JSON.parse(JSON.stringify(teams)), seasons: Object.fromEntries(seasonCache) };
}
export function restoreVault(snap: VaultSnapshot) {
  if (!snap || snap.version !== 1 || !Array.isArray(snap.teams)) throw new Error("Not a Sim Vault export");
  teams.splice(0, teams.length, ...snap.teams);
  seasonCache.clear();
  Object.entries(snap.seasons ?? {}).forEach(([k, v]) => seasonCache.set(k, v));
}
export function clearVault() { teams.splice(0, teams.length); seasonCache.clear(); }
export function removeTeam(id: string) { const i = teams.findIndex((t) => t.id === id); if (i >= 0) teams.splice(i, 1); [...seasonCache.keys()].filter((k) => k.startsWith(id + ":")).forEach((k) => seasonCache.delete(k)); }
