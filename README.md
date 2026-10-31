# A-FIT (أي-فت) — mobile

Expo 57 / React Native 0.86 client of the A-FIT API (`../A-FIT-Backend`). Arabic-first, English
second, RTL and LTR both first-class. Steps are read from Apple Health / Health Connect in the
background, meals and macros are tracked against a server-calculated plan, and friends compete
in groups and challenges.

## Run

```bash
npm install
cp .env.example .env          # EXPO_PUBLIC_API_URL=https://…/api/v1 (empty → Metro host :8000 in dev)
npx expo prebuild             # native projects (HealthKit / Health Connect need a dev client)
npx expo run:ios              # or: npx expo run:android
```

Expo Go cannot run this app: HealthKit, Health Connect and background tasks are native modules.
Use the development build (`npm run build:dev` with EAS, or `expo run:*` locally).

## Quality gate

```bash
npm run verify   # typecheck · lint (0 warnings) · folder contract · prettier · jest
```

CI (`.github/workflows/mobile.yml`) runs exactly those members and then `expo export` for both
platforms.

## Where things live

| Folder                   | Holds                                                                                                |
| ------------------------ | ---------------------------------------------------------------------------------------------------- |
| `src/app`                | Expo Router routes only (thin: compose components, call hooks)                                       |
| `src/components`         | `RText`, `RTextInput`, `Screen`, `ListState`, `Button`; `line/` = the Metro signage parts; `charts/` |
| `src/contexts`           | Theme, Language, Query, Auth, Toast, Alert providers                                                 |
| `src/hooks/<domain>`     | TanStack Query hooks per resource; `steps/useStepSync` is the foreground sync                        |
| `src/utils/steps`        | `healthSource` (platform adapter), `stepSync` (delta push), `backgroundTask`                         |
| `src/utils/localization` | i18next core + `locales/{ar,en}.json` (parity test)                                                  |
| `src/constants`          | colours, tokens, theme, storage keys, env                                                            |
| `src/types`              | the wire contract mirrored from the API (`// Mirrors app/Enums/X.php`)                               |

## Steps: how syncing works

1. After sign-in the Home screen asks for step access (HealthKit on iOS, Health Connect + background
   read on Android).
2. `syncSteps()` reads the last 7 local days from the health store, compares them with the last
   pushed snapshot and sends only the days that changed in one `PUT /steps` (≤ 31 rows).
3. It runs when the app becomes active (at most every 10 minutes), on pull-to-refresh, and from a
   periodic OS background task (`expo-background-task`, ≥ 30 minutes, OS-scheduled). On iOS,
   HealthKit background delivery is also enabled so the system can wake the app hourly.
4. The group leaderboard is cached server-side for 60 seconds, so friends refreshing together cost
   the database one query per minute.

Honest limits: background execution timing is decided by the OS; a force-quit app resumes syncing
on the next launch. Health Connect requires Android 8+ with the Health Connect app installed.
