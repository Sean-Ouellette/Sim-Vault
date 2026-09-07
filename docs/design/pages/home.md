---
project: sim-vault
page: home
title: Home
status: "in review"
render_hash: cc2ee45610171920334198818ac0eb2dfff622a5a28a579fbf458b4a789a9e83
last_modified: 2026-09-07T01:28:32Z
modified_by: code
content_hash: cc2ee45610171920334198818ac0eb2dfff622a5a28a579fbf458b4a789a9e83
---
---
---
# Home

## Looks like
Two variants. **Signed out** is described here; **signed in** is TBD
(next blab). Colors, type, surfaces and motion follow design.md
Visual language (same scheme as v1: near-black, dark-green glows, mint
accent). Sections fade/slide in on scroll and re-arm after 10 s off-screen.

1. **Navbar** (shared, see design.md → Shared components): full-width,
   logo left → Teams / Players / Top Performers links → search bar
   (teams + players, dropdown results) → user icon (plain icon when signed
   out; right-anchored menu: sign in, saved stats, Settings, plus
   dark/light switch and green/purple/sky scheme swatches) at the far
   right. Reflows on resize.

### Signed out
2. **Hero**: full-width, tall. Left: three-line headline
   "Every save.
Every season.
One **vault**." with "vault" glowing
   mint; subline "Log your career saves month by month and watch your
   dynasties take shape — records, trophies, Ballon d'Ors, and who really
   carried the team."; two buttons: **Sign in** (mint, primary; opens the
   sign-in dialog) and **Browse teams** (ghost; goes to Teams). Right: a
   floating dark card with a decorative preview — a small multi-line
   points chart that draws itself in on load, five colored lines, legend
   on the right — to hint at what a save looks like inside.
3. **What's in the vault**: section label + 4 feature cards in a row
   (stack on narrow): **Teams** (saves, seasons, W-D-L, points, trophies
   from your league's cup list), **Players** (goals, assists,
   appearances, clean sheets, average match rating, Ballon d'Ors),
   **Top performers** (rankings across every save), **Season logs**
   (month-by-month entries and achievements from GOAT to Bad). Each card:
   small line icon, title, two-line blurb; hover lift + mint glow;
   staggered slide-up.
4. **How it works**: three numbered steps in a row connected by a thin
   glowing mint line — 1 Create a team save, 2 Log each month (results
   and player stats, with player-name typeahead), 3 Watch the graphs and
   trophy cabinet fill up. Numbers count up as the section reveals.
5. **Closing CTA**: centered dark card, "Take the **touchline**." with
   the accent word mint, subline "Sign in to open your vault.", one mint
   **Sign in** button.
6. **Footer**: thin, muted: "Sim Vault · soccer only" left, links Teams ·
   Players · Top Performers · Settings right.

**Sign-in dialog** (opened from hero, CTA, or user menu): centered dark
modal, title "Sign in", username + password fields, mint **Sign in**
button, muted "Temporary: admin / admin" hint. Wrong credentials shake
the card and show a red-tinted "That's not it" line. Success closes the
dialog and switches Home to the signed-in variant.

### Signed in
Same navbar (user icon shows the signed-in ring). Rest of the page still
being blabbed; only the hero is described so far.

2. **Hero**: welcomes the user to their vault — left, big two-line
   greeting "Welcome back to your **vault**, admin." (accent word glowing)
   with a muted subline ("Here's everything you've saved."). Right, a row
   of three stat tiles (dark cards, 1px border, big count-up number, small
   uppercase label): **Teams saved**, **Seasons saved**, **Trophies won**
   — trophies counted across every team and every season. Numbers count
   up when the hero reveals. Tiles wrap under the text on narrow widths.
3. **Achievements bar**: directly under the hero, a **full-bleed** strip
   — it breaks out of the content column and runs edge to edge of the
   viewport, ignoring the page gutter. Scrolls horizontally on its own
   (marquee, slow, loops seamlessly, pauses on hover) showing achievement
   chips the user has earned across all saves — each chip: small tier dot
   (GOAT / Great / Average / Bad color), achievement name, and the team it
   was earned with. The badges come from the shared achievement
   ladders (design.md → Achievements): every badge earned across all
   saves, season and whole-save, GOAT first — chip text like "Goals · 231
   · Verdant Athletic S6".
   Background-colored fades at both ends whose width **equals the page's
   side padding** (gutter plus any centering margin), so chips fade out
   exactly where the content column's edge would be.
4. **Top 10 chart**: dark card with a title and a row of selector pills:
   **Goals** (players), **Assists** (players), **Goal contributions**
   (players), **Points** (teams). **Line graph**, one line per entry in
   the top 10, showing the running total over time. Because saves are
   logged by month, each point is one month; the **x axis is labeled with
   the season number at the first month of each season** (S1, S2, …) with
   a vertical gridline there, no per-month labels. Y axis shows numeric
   labels. Legend of the 10 names on the right. Lines draw in when the
   card reveals and when the selector changes; hovering a line dims the
   others and shows a tooltip (name, value, "S3 · Nov"). Each line has a
   fixed color from the 10-color chart palette, unaffected by the page
   scheme. Entries with fewer seasons simply end early.
5. **Teams bar**: under the graph, a second full-bleed auto-scrolling
   strip (same treatment as the achievements bar: seamless loop, pauses
   on hover, fades matching the side padding) of **team cards**, one per
   saved team, ordered by most recently saved. Each card (dark, 1px
   border, hover lift + accent glow, click opens that team on the Teams
   page): team logo + name on top; then league they're currently in; then
   three small stats side by side — **Season** (the season they're on,
   e.g. "S6"), **Trophies** (won so far in this save), **Points** (league
   points in the current season so far).
6. **Continue + Recent activity** in one row, **Season pace** full width
   below (kept after review; stack on narrow):
   - **Continue where you left off** (left, narrower — about a third of
     the row): card for the most
     recently saved team — logo + name, "Last logged: S6 · Nov, 2 days
     ago", and one mint button "Log December" that would open the
     month-entry flow for the next unlogged month.
   - **Recent activity** (right, about two thirds): the last 10 logged
     events across all saves in **two columns** (5 per column; one column
     on narrow) — small tier-colored dot, one-line text ("Mateo Reyes
     scored 3 vs Nordhaven"), team + time muted.
   - **Season pace** (full width below): one tile per team in an
     **auto-scrolling strip inside the card** (same marquee behaviour as
     the bars above: seamless loop, pauses on hover, fades at the card's
     inner edges). Fixed-width tiles. Top:
     this season's points so far vs **points at the same month last
     season**, with a green/red up-down delta. Below: **"On pace for N"**
     — the projected season total from this season's average points per
     logged month (avg × months in a season), shown next to last season's
     final total ("last season 91") so the pace reads as ahead/behind.
     First-season teams show only the pace line.
7. **Footer**: same thin footer as the signed-out variant.

Responsive: hero stacks (text above preview card); feature cards 2×2 then
1 column; steps stack vertically with the connector line turning vertical.

## Features
- Navbar: logo → Home; links → Teams, Players, Top Performers; search box
  queries the teams and players tables and lists matches in a dropdown
  (team vs player labeled), selecting one opens that team/player; user
  icon menu → sign in/out, saved stats, Settings.
- Auth: temporary stub, username `admin` password `admin`; state held in
  app memory (context) for the session; signing out returns to the
  signed-out variant. Real accounts later. All other pages are gated
  (see design.md → Auth).
- Signed-in hero data: count of the user's saved teams; count of seasons
  across all their teams; total trophies across all teams and seasons.
- Achievements bar: all achievements earned by the user across all saves
  (name, tier, team). Achievement definitions TBD later; render uses
  placeholders.
- Teams bar: every saved team with current league, current season
  number, trophies to date, and current-season points to date (from the
  latest logged month). Click → Teams page for that team.
- Top 10 chart: top 10 players by total goals / assists / goals+assists
  across all the user's saves, or top 10 teams by total league points;
  plotted as cumulative monthly totals from each team's monthly logs
  (season = 10 logged months). Selector swaps the dataset; no
  click-through required.
- Signed-out home is static marketing content; no user data is read.
- Hero preview chart uses fixed sample data (not the database).
- Buttons: Sign in → dialog; Browse teams → Teams page; footer links →
  respective pages.
- Out of scope here: the signed-in variant's content (next blab), real
  search backend (uses placeholder data in the render).

## Open questions
- Achievement names/tiers: later, per user.
- Search results as dropdown, signed-out user icon plain: confirmed.
