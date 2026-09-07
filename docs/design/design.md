---
project: sim-vault
title: "Sim Vault"
last_modified: 2026-09-07T01:04:09Z
modified_by: code
content_hash: 6c5d064c6b2842ea6b16ba3ffeb43ec91cbc95a7edf387b273c227b66fabedce
---
---
---
# Sim Vault — Design

## Overview
Sim Vault is a soccer-sim stats vault (soccer only). Managers playing
career saves log their teams, seasons and players month by month and get
them back as records, points, trophies, Ballon d'Ors, top-performer
rankings and graphs. Signed-out visitors see what the vault is and can
browse; signed-in users see and edit their own saves. Full redo started
2026-09-06 (v1 archived at archive/sim-vault-v1); the visual direction
carries over from v1: the ZeBeyond engineering-platform shot
(reference image in archive/sim-vault-v1/assets/reference-zebeyond.png),
dark, modern, glowing green, dynamic scrolling pages.

## Design principles
- Modern dark UI with one vivid mint accent; nothing sits still — sections
  animate in on scroll, cards lift on hover, numbers count up.
- Content in rounded dark cards on a glowing gradient background, never
  plain white pages.
- Big confident type; one highlighted word in the accent color per hero.
- Web app first, built with React Native primitives so it can ship as a
  mobile app later.

## Pages
| page | status | notes |
|---|---|---|
| home | in review | navbar; signed-out variant; signed-in hero, achievements marquee, top-10 line graph, teams marquee, continue/activity/pace row, footer |
| teams | in review | v1 blab carried over: saved-team grid + stat graph; team view w/ sidebar, 4 windows, edit flow |
| players | in review | Claude's draft: browse grid + filters + top-5 graph; player view w/ sidebar, Overview/Monthly log/Achievements |
| top-performers | in review | Claude's draft: Teams/Players switch, scope pills, podium, leaderboards, record book |
| settings | in review | centered overlay panel: Leagues (name, start/end month, trophies), Appearance, Account, Data |

## Shared components
- **Navbar** (every page). Full-width bar across the top of the viewport
  (not a centered column); reflows on resize. Left to right:
  1. **Logo** at the far left: the v1 mark (dark rounded-square vault, open
     door with a crosshair handle, a soccer ball and two speed lines
     inside) redrawn as vector. The ball is a proper **white soccer ball**
     (always white — whatever sits behind it is dark) whose pentagon
     patches (each with a thin black border) and the speed lines take the **active scheme's accent**
     (green / purple / sky). `assets/logo.png` stays as the static
     reference and is also the **browser tab icon** (favicon) and app icon.
     Links to Home.
  2. **Page links** right after the logo: Teams, Players, Top Performers.
     (Home is reached via the logo; Settings via the user menu.)
  3. **Search bar** on the right side: searches teams and players in the
     database (both types in one box; results show which is which).
  4. **User icon** at the far right, right of the search bar (the user's
     profile picture once they've chosen one in Settings → Account; a
     plain icon otherwise). Opens a
     240px menu anchored to its right edge (never overflows the viewport)
     with: sign in / sign out, "my saved stats" (the user's saved data),
     Settings (opens the **Settings overlay** on the current page, see
     pages/settings.md), and a **quick-access block** at the bottom: a Dark / Light
     segmented switch and three color-scheme swatches — green (default),
     dark purple, dark sky blue — with the active one ringed.
  Responsive: at narrow widths the page links collapse into a menu button
  and the search bar shrinks to an icon that expands on tap; logo and user
  icon stay pinned to the edges.
(pieces used on more than one page)

## Visual language
From the ZeBeyond reference:
- **Background**: near-black charcoal (#0B0F0D-ish) with soft radial
  dark-green glow gradients (#0E2B1F → #051009) and a faint thin grid-line
  overlay.
- **Accent**: bright mint/neon green (~#3DF5B6) for primary CTAs, active
  states, highlighted hero words, glowing diagram lines. Dark text on mint
  buttons.
- **Text**: off-white (#F2F5F3) headings, muted gray-green (#9BA8A1) body.
- **Type**: modern grotesque sans (Inter/Space Grotesk feel); large tight
  headings, small uppercase labels for meta text.
- **Surfaces**: dark cards (#121815-ish) with 1px subtle borders
  (#233028), 14–16px radius; pill-shaped buttons and filter chips.
- **Iconography**: small crisp line icons; optional small 3D/isometric
  thumbnails inside category cards.
- **Motion**: everything dynamic — fade/slide-up on scroll, hover lift +
  border-glow on cards, animated glowing connector lines, count-up stats,
  smooth filter transitions. No static walls of content.

## Themes
Two modes × three schemes, switchable from the navbar user menu. **Dark**
is the default and matches the ZeBeyond look above. **Light** uses a darker
tone of the same accent (green #0B8F63, purple #6D3FE0, sky #1667C7) on an
off-white ground (#F4F7F5) with white cards, white text on accent
buttons, and darker body text — the bright dark-mode accent is unreadable
on light. Schemes change the accent and the background glow tint: **green**
(#3DF5B6, default), **purple** (#B48CFF on #0D0A14), **sky blue** (#4DB1FF
on #0A0F16). **Chart line colors are fixed** and never change with mode or
scheme — a 10-color palette: mint #3DF5B6, blue #4DA3FF, orange #FF9F43,
purple #B388FF, red #FF5C7A, yellow #FFD84D, cyan #34D3E6, pink #F97FD6,
lime #A3E635, coral #FF7A45. Win / draw / loss colors are fixed too
(green #3DF5B6 / grey / red #F25C5C). Choice is session-only until accounts exist.

## Page frame
Content sits in a centered column, max 1400px wide, with 40px of side
padding — clearly visible, but the outer margins are about half what the
old 1180px column left on a wide screen.

## Achievements (shared)
One system, used by the Teams page's Achievements window and the Home
achievements bar. Four tiers — **GOAT, Great, Average, Bad** — applied to
**ladders**. Each ladder awards **one badge at the highest tier reached**
(hit Great and Average → you see Great). **Bad is a floor**, not a
punishment: it's the lowest badge you can earn; below Bad a ladder shows
nothing (except where noted "below", where Bad is always shown).

### Season ladders (one season of one team)
| ladder | GOAT | Great | Average | Bad |
|---|---|---|---|---|
| Trophies | 4+ | 1–3 | — | 0 |
| Goals | 225+ | 150+ | 100+ | 75+ |
| Goal contributions (G+A) | 325+ | 250+ | 150+ | 125+ |
| Points | 100+ | 90+ | 55+ | below 55 |
| Losses | 0 | 1–3 | 4–8 | 9+ |
| Clean sheets | 20+ | 15+ | 10+ | 6+ |
| Unbeaten months | every logged month | 6+ | 4+ | 2+ |

### Whole-save ladders (one team, every season)
Thresholds are **rates per season played × seasons in the save**, so a
2-season save and a 6-season save are judged on the same standard.
| ladder | GOAT | Great | Average | Bad |
|---|---|---|---|---|
| Trophies per season | 2.5 | 1.25 | 0.25 | below |
| Goals per season | 175 | 125 | 90 | below |
| Goal contributions per season | 260 | 200 | 140 | below |
| Points per season | 90 | 75 | 55 | below |
| Clean sheets per season | 16 | 12 | 8 | below |
| GOAT seasons (share of seasons with 100+ points) | 40%+ | 20%+ | 5%+ | none |
| League title streak (consecutive seasons winning the league's first-listed trophy) | 4+ | 2–3 | 1 | 0 |

Tier colors: GOAT accent, Great blue, Average grey, Bad red. Home's bar
shows every badge earned across all saves, GOAT first.

## Auth (temporary)
Until real accounts exist, a stub sign-in accepts **admin / admin**. Signed-in
state, theme, leagues and the vault itself persist on the device
(AsyncStorage), so a refresh keeps everything. **Every page except Home requires sign-in**: signed out, Teams, Players,
Top Performers and Settings show a centered dark card ("Sign in to open
your vault", one mint Sign in button that opens the dialog) instead of
their content. Home has a signed-out and a signed-in variant.

## Open questions
- 

## Changelog
- 2026-09-06 (code): achievements defined — season + whole-save ladders with GOAT/Great/Average/Bad thresholds, highest tier shown, Bad as floor; badges wired on Teams and Home
- 2026-09-06 (code): final audit — light mode gets a readable darker accent; profile picture; all flows re-verified
- 2026-09-06 (code): wired reduce motion, export / import / delete-all, and device persistence (sign-in, theme, leagues, vault survive refresh); Home empty state
- 2026-09-06 (code): audit pass — equal-height home cards, Add team (with logo picker) + Add season work, per-season team data (graphs follow the selected season), edit-stats loads/saves the season's trophies + months (month dropdown), fixed W/D/L colors, settings opens after sign-in
- 2026-09-06 (code): settings drafted as an overlay drawer (leagues with name/start/end month/trophies; appearance; account; data), rendered
- 2026-09-06 (code): top-performers drafted by Claude for review (Teams + Players sections: podium, leaderboard cards, record book), rendered
- 2026-09-06 (code): players drafted by Claude for the user to edit (browse + filters + graph; player view with sidebar and 3 windows), rendered
- 2026-09-06 (code): teams drafted from the v1 blab and rendered (grid + stat graph; team view with sidebar, Overview/Players/Achievements/Monthly log, edit-stats flow)
- 2026-09-06 (code): continue / recent activity / season pace kept, laid out as one three-column row
- 2026-09-06 (code): signed-in home trial sections (continue / recent activity / season pace) + footer, pending review
- 2026-09-06 (code): logo redrawn as vector, recolors with the scheme; signed-in home teams marquee (logo, name, league, season, trophies, current points)
- 2026-09-06 (code): achievements marquee made full-bleed with fades matching the side padding
- 2026-09-06 (code): signed-in top-10 chart is now a monthly line graph with season ticks; chart palette extended to 10 fixed colors
- 2026-09-06 (code): signed-in home — achievements marquee + top-10 ranking chart (goals/assists/contributions/points); side padding halved, column widened to 1500px
- 2026-09-06 (code): fixed chart palette (scheme-independent); all non-home pages gated behind sign-in; signed-in home hero (welcome + teams/seasons/trophies count-up)
- 2026-09-06 (code): user menu anchored right + quick-access (dark/light, green/purple/sky schemes); theme made dynamic
- 2026-09-06 (code): overview/visual language carried over from v1; shared navbar (full-width, search teams+players, user menu, admin/admin stub sign-in); home signed-out variant drafted and rendered; signed-in variant pending
- 2026-09-06 (code): created project with 5 pages: home, teams, players, top-performers, settings
