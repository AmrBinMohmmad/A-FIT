# Expo HAS CHANGED

Read the exact versioned docs at https://docs.expo.dev/versions/v57.0.0/ before writing any code.

## rakaya-standard

- **Platform**: mobile (Expo / React Native) — the MOBILE track; the Laravel API is `../A-FIT-Backend`
- **Tier**: 1 — single developer, single-tenant (trigger wording: skill `references/adopting.md`)
- **Kit**: v4.3.0 copied 2026-10-30 from the `kit/` directory
- **Reference**: patterns from `kit/plumbing/mobile/` (R-primitives, makeStyles, api client +
  AppError, query-key factory, secure-store, i18next core, Theme/Language/Query contexts); no
  domain code copied
- **Envelope**: strict `{flag, data, message}` unwrapped by `fetcher<T>` in `src/utils/api/client.ts`;
  no `errors` key is ever read (D1)
- **Locale contract**: `Accept-Language` = the ACTIVE app language on every request; every string is a
  key in both `src/utils/localization/locales/{ar,en}.json` (parity test); enum labels via
  `t("enums.<x>.<value>")`; device locale is a first-run suggestion only (D3, i18n-rtl §6)
- **Auth**: Sanctum PAT at `data.token` stored ONLY in expo-secure-store (`src/utils/secureStore.ts`);
  AsyncStorage holds prefs + a non-credential user cache; any 401 clears the token, the cache and
  the Query cache (D7 shape b). ADR: first adopter against live Sanctum — verify login, 30-day
  expiry and logout end to end on a device before relying on it (not yet done: no device here).

| Concern            | Installed library                                                                                                                                                          |
| ------------------ | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| navigation         | expo-router 57 (`src/app`), guards in group layouts                                                                                                                        |
| styling / tokens   | `src/constants/{colors,tokens,theme}.ts` + `makeStyles`; `RText` / `RTextInput` are the text/input choke point; `OtpInput` is the third sanctioned RN `TextInput` importer |
| state (server)     | @tanstack/react-query 5 (`src/hooks/<domain>/`), keys from `src/utils/api/queryKeys.ts`                                                                                    |
| forms / validation | plain `useState` + per-field checks (D9)                                                                                                                                   |
| http client        | axios (`src/utils/api/client.ts`), no BFF                                                                                                                                  |
| secure storage     | expo-secure-store (token only)                                                                                                                                             |
| i18n               | i18next + react-i18next + expo-localization                                                                                                                                |
| icons / charts     | @expo/vector-icons (Ionicons) · react-native-svg (`src/components/charts`)                                                                                                 |
| health data        | @kingstinct/react-native-healthkit (iOS) · react-native-health-connect (Android) behind `src/utils/steps/healthSource.ts`                                                  |
| background         | expo-background-task + expo-task-manager (`src/utils/steps/backgroundTask.ts`)                                                                                             |
| toasts / dialogs   | in-house `ToastContext` / `AlertContext` (kept over react-native-toast-message: stack-first)                                                                               |
| test runner        | jest-expo — never add a second one                                                                                                                                         |

- **Enforcement copied**: `scripts/check-structure.mjs` (12 rules, `src/`-rooted, no carve-outs), `eslint.config.js` (R-primitive / `@/` / no-console / secure-store /
  `*_ar` bans), `src/utils/localization/i18n-parity.test.ts`, `npm run verify` + jest block.
  Fail-then-pass verified 2026-10-30 on the raw-`Text` import ban and the hex-literal rule.
- **CI**: `.github/workflows/mobile.yml` — verify members + `expo export` both platforms
- **Hooks**: SessionStart trigger on (global); Stop check opt-out

### Design

Direction: **Metro Line Wayfinding** (impeccable direction round, seed 12479284, owner choice
2026-10-30). Contract: `.impeccable/surfaces/src-app-tabs-index-tsx.md`; product truth: `PRODUCT.md`;
tokens: `DESIGN.md`. Components of the world: `src/components/line/*` (LineDiagram, SignPanel,
ExitRow, CodeChip, SegmentBar, StandingRow). Orange (`accent`) is reserved for "you" and the one
primary action per screen.

### Project rules beyond the kit

- Steps are never typed in: `syncSteps()` pushes only changed days (≤ 31) and is throttled to one
  automatic sync per 10 minutes and one manual sync (pull-to-refresh, "sync now") per 60 s; the
  server limits `PUT steps` to 12/min.
- Burst-prone writes coalesce on the client: water taps update the Query cache instantly and
  one `PUT water/{date}` carries the final total ~0.9 s after the last tap (`useWaterControls`).
- One request per screen: Home reads `GET dashboard`; group detail polls the leaderboard every 60 s
  only while mounted; nothing polls in the background except the OS task.
