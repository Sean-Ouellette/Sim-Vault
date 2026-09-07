---
project: sim-vault
page: settings
title: Settings
status: "in review"
render_hash: 06175c65600d09ce79e621969ca8fa87d9ba5c4e436d823d0147c6065504c6b3
last_modified: 2026-09-07T00:23:30Z
modified_by: code
content_hash: 06175c65600d09ce79e621969ca8fa87d9ba5c4e436d823d0147c6065504c6b3
---
# Settings

**Not a page — an overlay.** Settings opens on top of whatever page the
user is on (from the navbar user menu, the home footer, or the `/settings`
URL, which opens Home with the overlay up). Requires sign-in.

## Looks like
1. **Panel**: a centered overlay **on top of the page** (not a side
   drawer): a rounded dark card ~760px wide, up to ~85% of the viewport
   tall (full-screen under 700px), 1px border and a deep shadow; it fades
   and scales in. The page behind dims (black at ~65%) and stays where it
   was. Close with the **×** top-right, clicking the dim backdrop, or
   Esc. Header: "Settings" + muted "Signed in as admin".
2. **Section tabs** under the header (pills): **Leagues · Appearance ·
   Account · Data**. Content below scrolls inside the panel.

### Leagues (the one the user asked for)
- Intro line: "Leagues decide a team's season calendar and which trophies
  it can win."
- **Saved leagues** list: one card per league — name, "Aug → May · 10
  months", trophy chips; **Edit** and **Delete** (delete asks once).
- **Add a league** form (also used for edit), in a card:
  - **Name** text field.
  - **Start month** and **End month**: two **dropdown select boxes**
    side by side (placeholder "Select…", opens a list of Jan…Dec, chosen
    month highlighted); picking both shows the computed season length
    ("10 months"; wraps across the year, e.g. Aug → May).
  - **Trophies**: text field + **Add** button; each trophy becomes a chip
    with an × to remove; Enter adds too. Muted hint: "League title, cups,
    super cups, continental — anything the team can lift."
  - **Save league** (mint) / **Cancel**. Validation: name required, both
    months required, at least one trophy; errors show inline in red.
- Empty state: "No leagues yet — add your first one below."

### Appearance
- Same controls as the navbar quick-access, larger: Dark / Light switch;
  scheme swatches Green / Purple / Sky blue with names. Preview strip
  showing a mini card + button in the chosen look.
- **Reduce motion** toggle: scroll sections appear without fading,
  count-ups and chart draw-ins show their final state immediately, and
  the auto-scrolling strips become hand-scrollable rows.

### Account
- **Profile picture**: a large circle (photo, or the user's initial on
  the accent when none) with **Choose photo…** (device image picker,
  square crop) and **Remove**. The photo replaces the navbar's user icon
  and is saved with the account.
- Username, "Temporary sign-in (admin / admin)" note, **Sign out**
  button. Placeholder rows for Change password and Email, disabled with
  "coming with real accounts".

### Data
- **Export vault**: writes a JSON snapshot (teams, every season's monthly
  data, players, leagues) — a download on web, the share sheet on
  mobile. A confirmation line appears under the buttons.
- **Import…**: file picker → the JSON replaces the vault (and leagues if
  the file has them); the line reports what was imported or why it
  failed.
- **Danger zone** card, red-tinted border: **Delete all saves** enabled
  only after typing DELETE; wipes teams, seasons and players, closes the
  overlay and lands on Home's empty state ("Your vault is empty — Add a
  team").

Responsive: panel goes full-screen under 700px; the two month
dropdowns stack.

## Features
- **Leagues data**: name, start month, end month (season length derived,
  wrapping the year), ordered trophy list. Used by Teams (trophy box
  shows the league's trophies; monthly log months follow the league
  calendar) and by the season-length maths everywhere (replaces the
  fixed 10-month assumption).
- **Actions**: open/close overlay; switch sections; add / edit / delete
  league (delete confirms once); add / remove trophy chips; change mode,
  scheme, reduce-motion; sign out; export / import (stub); delete all
  saves (confirm).
- **Persistence**: everything is saved on the device (AsyncStorage —
  browser storage on web, native storage on iOS/Android): sign-in,
  theme mode + scheme, reduce-motion, leagues, and the whole vault
  (teams, seasons, edits). A refresh or app restart restores it. Accounts
  / cloud sync later.
- **Navigation**: opens over the current page and returns to it on
  close; `/settings` deep link → Home + overlay.

## Open questions
- Should leagues be per-user or shared presets (e.g. built-in Premier
  League with its cups) that the user can copy?
- Does deleting a league that teams use block, or detach those teams?
