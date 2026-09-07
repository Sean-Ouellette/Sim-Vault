# Sim-Vault

## Description

SimVault is a mobile-friendly web app for tracking **10 Season Challenges** in the EA FC (EA soccer) games — a community challenge where you sim 10 seasons with a single team and see how many trophies you can win and how your players develop along the way.

It's built as a community tool: any player running a 10 Season Challenge can use it to archive their saves and show off the results.

**Core features (overview):**

- **Trophy tracking** — log the trophies won each season across the challenge.
- **Player stat progression** — follow player ratings, goals, and assists as they grow season over season.
- **Season summaries** — a per-season overview of league finish, cup runs, and top performers.
- **Multiple saves/teams** — archive more than one challenge or team at a time.

**Design direction:** a dark, sporty dashboard — dark theme with bold accent colors, in the spirit of an EA FC / football analytics hub. Layouts should work great on a phone first (used as a second screen while playing) and scale up cleanly to desktop.

Each page will be designed and specced individually; this description is just the top-level picture of the app.

## Getting started

Expo + React Native Web app (web first, mobile-ready).

```bash
npm install
npx expo start --web      # http://localhost:8081
```

Temporary sign-in: `admin` / `admin`. Data is stored on the device (AsyncStorage) until real accounts exist.

## Design

Design docs live in the [Designs](https://github.com/Sean-Ouellette/Designs) repo under `sim-vault/` (`design.md`, `pages/*.md`, `raw/*.md`), edited with the blab-design skill. They are the source of truth for every page; this repo holds the implementation only. New pages get designed there first and their app files copied over.
