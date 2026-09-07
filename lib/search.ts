// Placeholder search index for the navbar (teams + players). Real backend later.
export type Hit = { type: "team" | "player"; id: string; name: string; meta: string };
const index: Hit[] = [
  { type: "team", id: "t1", name: "Verdant Athletic", meta: "Premier League" },
  { type: "team", id: "t2", name: "Nordhaven FC", meta: "Eredivisie" },
  { type: "team", id: "t3", name: "Solstice United", meta: "La Liga" },
  { type: "team", id: "t4", name: "Brixton Rovers", meta: "Championship" },
  { type: "team", id: "t5", name: "Calder Town", meta: "Serie A" },
  { type: "player", id: "p1", name: "Mateo Reyes", meta: "ST · Verdant Athletic" },
  { type: "player", id: "p2", name: "Kofi Mensah", meta: "LW · Verdant Athletic" },
  { type: "player", id: "p3", name: "Luca Bianchi", meta: "CAM · Nordhaven FC" },
  { type: "player", id: "p4", name: "Tomasz Nowak", meta: "CB · Solstice United" },
  { type: "player", id: "p5", name: "Idris Kane", meta: "GK · Brixton Rovers" },
];
export function search(q: string, limit = 6): Hit[] {
  const s = q.trim().toLowerCase();
  if (!s) return [];
  return index.filter((h) => h.name.toLowerCase().includes(s) || h.meta.toLowerCase().includes(s)).slice(0, limit);
}
