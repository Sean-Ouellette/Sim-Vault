---
project: sim-vault
page: players
title: Players
status: "in review"
render_hash: c4fb1ffef82858c6b6f97a3f9de0267db2cfa3f07961eb7512d41e71ade5da43
last_modified: 2026-09-07T01:18:53Z
modified_by: code
content_hash: c4fb1ffef82858c6b6f97a3f9de0267db2cfa3f07961eb7512d41e71ade5da43
---
# Players

Dark ZeBeyond style per design.md; shared navbar; requires sign-in;
scroll fade-ins on first load only (tab/season switches are instant);
fixed chart palette. Claude's first draft — the user will edit. Mirrors
the Teams page: two screens.

## Looks like

### Screen A — no player selected
1. **Hero**: "Every **player**, one vault." (accent word) with a muted
   subline and a count chip of players in the database.
2. **View switch + filters**: a two-way switch **Players / Graph** on the
   left. In Players view: a name search box (filters the grid as you
   type), position pills (All · GK · DEF · MID · FWD), and a team pill
   row (All + one per saved team, with the team's color dot).
3. **Player grid** (Players view): cards, 4 per row (3 / 2 on narrower):
   initials avatar tinted with the current team's color, name, position,
   current team; underneath a compact 5-stat strip — **Goals · Assists ·
   Clean sheets · Avg rating · Ballon d'Ors** (career, across all saves).
   Clean sheets are tracked for every player (they only really matter for
   keepers, but every card shows them). Ballon d'Or count is gold when
   > 0. Hover lift + accent glow; click opens Screen B for that player.
   Empty state when filters match nobody: "No players match" card.
4. **Graph view** (replaces the grid when the switch is on Graph):
   - A **search bar** at the top: type a name, pick from the dropdown to
     **add that player to the graph** (up to 10, one fixed palette color
     each). Starts with the top 5 by the selected stat already added.
   - The **comparison line chart** (running total by month, season ticks,
     right legend, hover dims others) with a stat selector: **Goals ·
     Assists · Goal contributions · Clean sheets · Avg rating** (avg
     rating plots the monthly rating, not a running total).
   - Under the chart, the **cards of the players in the graph**, same
     card as the grid plus a colored bar matching their line and an **×**
     to remove them from the graph. Click still opens Screen B.

### Screen B — player selected
Fixed **left sidebar**, 3 stacked rows:
1. **Player switcher**: big dropdown button with the current player's
   avatar + name + position; open, lists the other players (avatar, name,
   team). Picking one switches Screen B.
2. **Season list**: every season the player has logged data in, as rows
   "Season 3 · Verdant Athletic" (team they played for that season);
   scrolls internally when long. Click selects; click again deselects →
   whole-career scope. Muted scope line under the header, as on Teams.
3. **Open team** button pinned at the bottom → Teams page for the
   player's current team (stats are edited from the team's monthly log,
   not here).

Main area:
- **Player hero**: avatar large, name, position pill, current team (logo +
  name, links to Teams), and a **Ballon d'Or badge** ("2× Ballon d'Or")
  when they've won any.
- **Window tabs**: **Overview / Monthly log / Achievements**. Each has a
  career (no season selected) and a single-season variant. Graph x-axes
  follow scope: months of the season, or months across all seasons with
  season ticks.

**Overview window**:
- Top: six stat tiles in a row (wrap on narrow) — **Apps, Goals, Assists,
  Goal contributions, Clean sheets, Avg rating** for the scope, numbers
  count up on first reveal.
- Below: **Progression line chart** — one line, stat selector Goals /
  Assists / Goal contributions (running total) / Avg rating (monthly);
  x axis per scope.
- Below, two side-by-side cards: **Teams played for** (career: one row
  per team with seasons + goals there; season scope: that season's team
  and role) and **Bests** (best season by goals, best month, highest
  rated month — each with the value and when).

**Monthly log window**: season scope — one row per logged month: month,
apps, goals, assists, clean sheets, avg rating, and the team's result
line for that month (W-D-L). Career scope — a muted prompt to pick a
season, plus a per-season summary table (season, team, apps, goals,
assists, rating).

**Achievements window**: same four tiers as the shared catalogue (GOAT /
Great / Average / Bad), player-flavoured achievements (placeholders:
"Golden boot", "Hat-trick hero", "Ever-present", "Bench warmer"…);
career vs season sets differ.

Responsive: sidebar stacks above the main area under ~900px; stat tiles
wrap 3×2; side-by-side cards stack.

## Features
- **Data**: players table (name, position, current team, Ballon d'Ors);
  per player per season: team, monthly entries (apps, goals, assists,
  clean sheets, avg match rating). **Clean sheets are recorded for every
  player on every team** (matches they played in that ended 0 against) — the same monthly logs entered on the
  Teams page. Ballon d'Or per season from the team's season record.
- **Derived**: career totals, goal contributions (goals + assists), per-
  scope averages, top-5 rankings, bests.
- **Actions**: switch Players/Graph view; search/filter grid; add/remove
  players in the graph (max 10); open player; switch player (sidebar
  dropdown); select/deselect season; switch windows; change chart stat;
  open team. **No editing here** — stats are entered month by month on
  the Teams page.
- **Navigation**: navbar Players → Screen A; navbar search results and
  the Teams page's player names → Screen B (`/players?player=ID`); Open
  team / current-team link → Teams Screen B. Signed out → sign-in gate.
- Scope rule everywhere: season selected → that season (x = months);
  none → whole career (x = months across seasons, season ticks).

## Open questions
- Position groups for the filter (GK/DEF/MID/FWD) vs exact positions?
- Should a player have a photo/avatar upload, or stay initials?
- Player achievement names: later, per user.
