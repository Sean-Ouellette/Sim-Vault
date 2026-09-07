---
project: sim-vault
page: teams
title: Teams
status: "in review"
render_hash: 5f533beef5116cd907bf63e92a9c767945a3176aeeb7824bbf3f2a823525a5aa
last_modified: 2026-09-07T01:23:17Z
modified_by: code
content_hash: 5f533beef5116cd907bf63e92a9c767945a3176aeeb7824bbf3f2a823525a5aa
---
# Teams

Dark ZeBeyond style per design.md; shared navbar (search + user menu);
requires sign-in (design.md → Auth); scroll fade-ins with the 10-second
re-arm on first load only — **switching windows/tabs or seasons swaps
content instantly, no fade-in**; chart lines use the fixed 10-color
palette. Carried
over from v1's blab (raw/teams.md). Two screens:

## Looks like

### Screen A — no team selected
1. **Hero**: short section introducing the vault of teams — e.g. "Your
   **clubs**, one vault." (key word mint) with a muted subline and a count
   of saved teams.
2. **Team grid**: cards in a grid, max 3 rows visible. Each saved-team
   card is compact: logo, name and league stacked and centered, then the
   team's **note** underneath in a muted panel (up to 2 lines, muted "No
   note" when empty). Cards are narrow — 5 per row on a wide screen. Top-left cell is an
   **Add a new team** tile (dashed mint border, big + icon) → a **New
   team save** dialog: team name, short code (auto from the name), league
   (pick from the leagues defined in Settings), a **logo** — a "Choose
   logo" button opens the device's image picker; the chosen image
   previews in a circle and replaces the initials everywhere the team
   appears (cards, switcher, hero, home bars) — and a **note** (up to 75
   characters, live counter) describing what kind of save it is, e.g.
   "Road to glory from League Two, no transfers in season 1". No color
   choice: a tint for the initials fallback is assigned automatically.
   Every saved team card has a **⋮ (three vertical dots) button** top-right
   → menu **Edit team** (same dialog, pre-filled, "Save changes") and
   **Delete team** (asks once: "Delete Verdant Athletic and its 6
   seasons?" → Delete / Keep). The note also shows under the team hero on
   Screen B. Create
   opens the new team on Screen B with an empty Season 1. Every other
   cell is a saved team card (logo, name; hover lift + mint glow). Clicking
   a team card opens Screen B for that team.
3. **Stat graph**: same style as the home page's top-10 graph (one
   fixed-color line per team, right-side legend, y-axis labels, monthly
   points with season-number ticks, full-opacity lines that only dim when
   another is hovered, draw-in on scroll, hover tooltip) but with a
   **y-axis stat selector** (points, wins, goals, trophies) that swaps
   what's plotted.

### Screen B — team selected
Fixed **left sidebar** (stays put while the main page scrolls), 3 stacked
rows:
1. **Team switcher**: big dropdown button at top showing the current
   team's logo + name (chevron right); open, it lists the user's other
   saved teams, each with its logo; picking one switches Screen B to it.
2. **Season list**: all saved seasons for this team as selectable rows;
   this row of the sidebar scrolls internally if the seasons overflow the
   viewport. Selecting a season scopes the whole main area to it;
   **clicking the selected season again deselects it** and the page shows
   whole-save stats. There is no separate "whole save" row — a muted
   "No season selected · whole save" line under the list header says
   which scope is active.
3. **Add a season** button pinned below the list.

Main area:
- **Team hero**: team name + logo large at top, plus an **Edit stats**
  button.
- **Window tabs** right under the hero: **Overview / Players /
  Achievements / Monthly log**. Every window has two variants: whole-save
  (no season selected) and single-season. Graph x-axes everywhere follow
  the scope: months of the season when a season is selected, otherwise the
  saved seasons.

**Overview window**:
- Left: W-D-L + total points for the scope. Above the numbers a single
  horizontal record bar segmented green (wins) / grey (draws) / red
  (losses).
- Right: **Ballon d'Or box** — season scope: the player who won it that
  season, or "No one won it"; save scope: the team's most-decorated Ballon
  d'Or winner and how many they've won.
- Below: **Trophies box** — trophies won in the scope. Trophy names come
  from the league the team belongs to (leagues + their trophy names are
  configured on the Settings page). Save scope: each trophy with the total
  count won underneath.
- Below: **Top-5 graph** — top 5 players' goals across the scope, with a
  stat switcher: goals / assists / goal contributions, plus **points**
  (save scope only): that option switches the chart to the team's **top 5
  seasons by points**, one line per season (S3, S6, …) with the x axis
  showing the months of a season and each line the running points total
  — so the best seasons can be compared month by month.
- Below: **Average rating bar chart** — players' average rating per month
  (season scope). Save scope: **three bars per season** (the season split
  into thirds: early / mid / late), grouped under one "S1", "S2"… label
  per season, alternating tint per season so the groups read clearly.

**Players window**: a switch toggles two views —
- **List view**: table of all players with their stats for the scope.
- **Graph view**: stat selector for avg match rating / goals / assists /
  goal contributions, plus a bar graph of Ballon d'Ors won (only shown if
  someone in the save has won one).

**Achievements window**: 4 tier cards — **GOAT, Great, Average, Bad** —
per design.md → Achievements (shared). Season scope grades the selected
season on the season ladders; save scope grades the whole save on the
per-season-rate ladders. Each ladder puts one solid badge in the card of
the highest tier reached ("Goals · 231"); in the cards above that, the
same ladder shows a dimmed chip with what it would take ("Goals · 225
needed"). Ladders below Bad's floor show a dimmed chip in Bad.

**Monthly log window** (season scope): each month with save data shows that
month's stats and which players produced them.

**Edit stats flow**: the hero's Edit button edits the **selected season**
(the form title names it); with no season selected it first asks the
user to pick one. The form, top to bottom:
1. **Trophies** — the league's trophies as toggle buttons; a click
   highlights it (won this season), click again to un-win. Loaded from
   what was saved for the season.
2. **Month** — a dropdown select box (months that already have data show
   a dot). Picking a month **loads whatever was saved for it** — wins,
   draws, losses, and one editable row per player who has stats that
   month (goals, assists, appearances, clean sheets, avg match rating,
   position) — so numbers can be corrected in place. A player row can be
   removed (×).
Adding a player: a text box with typeahead suggesting the closest
existing player names in the database; after picking the player you
choose the position they played and their numbers. **Save** writes the trophies and the month back; every window (Overview,
Players, Monthly log) and the graphs re-read the season's data, so
selecting a different season in the sidebar always shows that season's
own numbers. Cancel discards edits.

**Record bar colors are fixed**: wins green #3DF5B6, draws grey, losses
red — they do not follow the accent scheme.

## Features
- **Data**: saved teams (name, logo, league, note ≤75 chars); per team:
  seasons; per
  season: monthly entries (team W/D/L; per-player goals, assists,
  appearances, clean sheets — recorded for every player, not just
  keepers — avg match rating); trophies won per season;
  Ballon d'Or winner per season; league trophy definitions from Settings.
- **Derived**: points (from W/D/L), goal contributions (goals + assists),
  top-5 rankings, per-season and whole-save aggregates.
- **Actions**: add team (grid tile); edit team / delete team (card ⋮
  menu; delete removes its seasons too); open team; switch team (sidebar
  dropdown); select/deselect season; add season; switch window tabs;
  toggle players list/graph view; change graph stat selectors; edit stats
  (month-by-month form with player typeahead + position picker).
- **Navigation**: home's teams bar, continue card and search results land
  on Screen B for that team (`/teams?team=ID`); navbar Teams link lands on
  Screen A. Signed out → sign-in gate instead of either screen.
- Scope rule everywhere: season selected → that season (x axis = months);
  none → whole save (x axis = seasons).

## Open questions
- Screen A grid: with more teams than 3 rows, scroll within the grid or
  paginate?
- Achievement names and how tiers are awarded: later, per user.
