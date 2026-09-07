---
project: sim-vault
page: top-performers
title: "Top Performers"
status: "in review"
render_hash: 369afee2c1d57724f08574f33ac48959d36ca65e55b87f666313a88001d81ba9
last_modified: 2026-09-06T20:38:27Z
modified_by: code
content_hash: 369afee2c1d57724f08574f33ac48959d36ca65e55b87f666313a88001d81ba9
---
# Top Performers

Dark ZeBeyond style per design.md; shared navbar; requires sign-in;
scroll fade-ins on first load, instant on switches; fixed chart palette.
Claude's first draft — the user will approve / edit / remove. Two
sections, **Teams** and **Players**, on one page.

## Looks like
1. **Hero**: "Who **carried** the vault." (accent word) with a muted
   subline ("The best teams, players, seasons and months across every
   save."). Right of the text: a **Teams / Players** segmented switch
   that swaps the section below (content swaps instantly after first
   load).
2. **Scope pills** under the hero, per section: Teams → **All-time ·
   Best season · Current season**; Players → **All-time · Best season ·
   Best month**. All-time ranks career/save totals; "Best season" ranks
   the single best season any team/player had; "Best month" the single
   best month.

### Teams section
3. **Podium**: top 3 teams by points per game in the chosen scope —
   three columns, 1st in the middle and tallest, 2nd left, 3rd right;
   each column: logo, name, the headline value, and a medal badge (gold /
   silver / bronze). Columns rise in on reveal.
4. **Leaderboards**: a grid of cards (3 per row, 2 / 1 on narrow), one
   per category — **Most points · Most wins · Most trophies · Best win %
   · Points per game · Fewest losses**. Each card: title, unit label, top
   5 rows (rank, logo, team name + league, value) with a thin bar behind
   each value proportional to the leader; #1 row highlighted in the
   accent with a small crown icon. Hover lift on rows; click opens the
   team on Teams.
5. **Record book**: a row of single-record tiles — **Best season points
   (team, season) · Most trophies in a season · Best W-D-L season ·
   Longest unbeaten run (months)**. Each: big value, who and when muted.

### Players section
3. **Podium**: top 3 players by goal contributions in the scope, same
   podium treatment (avatar in team color instead of logo).
4. **Leaderboards**: cards — **Most goals · Most assists · Goal
   contributions · Clean sheets (goalkeepers only) · Highest avg rating
   (min. 20 apps) · Ballon d'Ors**. Rows: rank, avatar, name + position + team, value +
   bar. Click opens the player on Players.
5. **Record book**: **Most goals in a season · Most assists in a season ·
   Most goals in a month · Highest rated month**.

Responsive: switch drops under the hero text; podium columns stay side
by side down to ~600px then stack; leaderboard grid 3 → 2 → 1.

Empty states: no saves → hero + one card "Log a season to see your top
performers."

## Features
- **Data**: same tables as Teams and Players: per team per season
  monthly W/D/L, trophies; per player per season monthly apps, goals,
  assists, clean sheets, avg rating; Ballon d'Or winners.
- **Derived**: points, win %, points per game, goal contributions;
  per-scope aggregates (all-time totals, best single season, best single
  month, current season); ranked top-5 per category; record holders.
- **Actions**: switch Teams/Players; change scope; click a row/podium
  entry → that team (Teams page) or player (Players page). No editing.
- **Navigation**: navbar Top Performers → this page; signed out → gate.
- **Out of scope**: awards/achievements (they live on Teams/Players);
  head-to-head comparisons (Players graph view does that).

## Open questions
- Should the two sections stack on one scrolling page instead of a
  switch?
- Minimum appearances for the rating leaderboard (20 assumed).
- Which record-book entries matter most; any to drop or add?
