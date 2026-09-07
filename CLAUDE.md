# Sim-Vault

Expo + React Native Web app (web first, must stay mobile-ready: RN primitives only,
no DOM/HTML/CSS; the one sanctioned web branch is `lib/files.ts`).

- Run: `npm install`, then `npx expo start --web`. Typecheck: `npx tsc --noEmit -p .`
- Routes in `app/` (expo-router); shared UI in `components/`; state + data in `lib/`
  (`data.ts` placeholder vault, `vault.tsx` mutations + persistence, `auth.tsx`,
  `theme.tsx`, `settings.tsx`, `achievements.ts` ladders). Tokens in `theme.ts`.
- Design spec: `docs/design/` (snapshot of the Designs repo `sim-vault/`). Page docs
  are the contract: `## Looks like` = layout, `## Features` = behaviour.
- Temporary sign-in `admin` / `admin`; all state persists via AsyncStorage.
