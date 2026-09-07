# Raw blab — teams

## 2026-09-06 (code)
Now let's work on the teams page, and use the blab from the teams page I had from the previous version of this project. (v1 blab below, carried over verbatim from archive/sim-vault-v1/raw/teams.md.)

## 2026-08-31 (Claude Code)

This page has two screens. One when you don't have a team selected: you see
all the teams you have saved in a grid pattern, with the top-left box being
"add a new team". There should be a hero that makes sense to go above this
grid, and the grid should only show 3 rows. Under that there's a graph
similar to the one on the home page, but you can change the stat that is on
the y axis.

When you have a team selected, a side bar shows up on the left. At the top
is a big button that is a dropdown that shows you the other teams they have
saved — on the button you see the words "select a team" or something
similar. Under that button you can select all the seasons the user has
saved; under that is the "add a season" button. Those 3 components are in 3
separate rows so if the user has enough seasons that they go off the page,
they can scroll to see them. The sidebar stays the same no matter how far
the user scrolls on the page.

On the main part of the page there's a hero at the top with the team's name
and logo so the user knows what team they're looking at. Right under the
hero there are windows: overview, players, achievements, and monthly log.
All of these windows have a version showing stats for the entire save and
one showing stats for the selected season. For all the graphs: if a season
is selected the x axis shows the months of that season; if not, it shows
the seasons saved so far.

Overview window: win, draw, loss, and point total for the team for that
season (no season selected → entire save). A bar for the win/loss record
above the numbers: green for wins, grey for draws, red for losses. To the
right, a box for if a player won the Ballon d'Or that season (no season →
the player who has won the most and the number they won; if no one won it,
show that no one won it). Under that, a box of trophies the team has won
that season — trophies are for that league, which can be saved on the
settings page (the user can add a league there and put the names of the
trophies they want to track for teams in that league). If no season
selected, show the total number of trophies won under each trophy. Under
that, a graph showing the top 5 players' goals over the season, switchable
to assists, goal contributions, and — if no season is selected — points as
well. Under that, an average rating bar chart showing the average rating of
the players through the months of that season (no season → per season
instead of per month).

Players window: two separate views through a switch — either a list of all
the players and their stats, or the stats in graph form, with selections
for avg match rating, goals, assists, goal contributions, and a bar graph
for Ballon d'Ors won if a player has won one in the save. No season
selected → entire-save stats; season selected → that season only.

Achievements window: for the selected season there are 4 tiers: GOAT,
Great, Average, Bad. No season selected → same tiers but not the same
achievements. Names of the achievements come later.

Monthly log window: for the season selected, see the stats for each month
that has save data, and which players had those stats.

Editing stats: a button in the hero lets you edit the stats of the save. If
a season is selected you edit that season; if not, it has you select a
season first. You edit month by month: wins, draws, losses for the month,
player goals, assists, appearances, clean sheets, avg match rating. When
entering player stats you type their name in a text box and it suggests the
closest existing player names in the database; once selected you choose the
position the player is playing.

## 2026-09-06 (code) — edits after first render
Remove the Screen A / Screen B toggle under the navbar. No "whole save" option: it just knows when you don't have a season selected, and clicking the already-selected season deselects it so you see the whole save's stats. In the team dropdown, show the team's logo. The scroll-down fade-in doesn't need to run on this page when it's not loading new things — keep the feature if possible, but it mainly happens when switching between the tabs on the page.

For the average rating in the whole-save option, make it not just 1 bar per season but 3 — it splits the season into 3 parts for the average rating.

For the points option on the overview graph (whole save), it should be a line plot of the top 5 seasons points-wise, so you can see the graph of your best seasons and how you did points-wise.

When editing the stats of a season you should see the stats that were saved so far and be able to edit them if needed. Also the win bar color should not change when the theme color is changed on the team page.

When you click the edit stats button, the month editing should come after the buttons for the trophies (buttons that highlight when clicked). Also when you click edit stats make sure it is the stats for the selected season. On the teams page the graph must update when the selected season changes. The month in the edit form should be a dropdown select box at the top.

For the team as well, make sure you can add the team's logo when adding them.

Make it so that teams don't have a color when making them, now that they have a logo.

## 2026-09-06 (code) — achievements
Achievements: some for the entire save, some for individual seasons, following the tiers that already exist on the teams page. Season tiers — GOAT: 4 trophies, 225 goals, 325 goal contributions, 100+ points, 0 losses. Great: 1–3 trophies, 150 goals, 250 goal contributions, 90+ points. Average: 100 goals, 150 goal contributions, 55+ points. Bad: 75 goals, 125 goal contributions. If you get the tier and the one above it, the one you see is the highest tier.

Keep clean sheets but smaller numbers: 20 for GOAT and go from there. Keep unbeaten months. Drop the Ballon d'Or one. Bad tier as a floor is good. Whole-save tiers: user will define; asked Claude for suggestions.

The whole-save tier totals should be based on the total number of seasons played so far, so "seasons saved" should not be one of the tiers.

Whole-save rates: trophies 2.5 per season for GOAT, 1.25 Great, 0.25 Average. GOAT seasons: 0.4 of seasons with 100+ points for GOAT, 0.2 Great, 0.05 Average. Otherwise the proposed numbers are good.

When making a team you should also be able to add a note (around 255 characters) that tells what type of save it is. You should be able to edit the team once it's saved, which also allows you to delete it — a three-vertical-dots menu on the team cards on the teams page.

The team's note should be visible on the teams page to the right of the team's name, logo and league, inside the card.

Put the note below the team name, logo and league, and make the boxes a bit smaller.

Make the card width a bit smaller, and the note character count can go down to 75.
