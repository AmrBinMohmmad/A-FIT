# A-FIT · أي-فت (mobile)

Expo 57 / React Native client of the A-FIT API (`../A-FIT-Backend`). Steps come from HealthKit /
Health Connect in the background, meals and water are the private ledger, groups and challenges
are the social game. Arabic + English, light + dark. Design: Metro Line Wayfinding (`DESIGN.md`).

## Run locally

```bash
npm install
npx expo start            # Metro; the dev client on the phone connects over the LAN
npx expo run:android      # or run:ios — builds the dev client (needed after native changes)
```

The API base URL lives in `src/constants/env.ts`; point it at the machine running
`php artisan serve --host 0.0.0.0 --port 8000` from the backend repo.

## Quality gate

```bash
npm run verify   # tsc · eslint (0 warnings) · check-structure · prettier · jest
```

CI (`.github/workflows/mobile.yml`) runs the same members plus a Metro export for both platforms
on every push and pull request to `main` and `dev`.

## Branching

- `main` — what is shipped to the stores. Only fast-forward merges from `dev` via a pull request.
- `dev` — integration branch and the GitHub default. Feature branches (`feat/...`, `fix/...`)
  branch from `dev` and come back through a pull request with the gate green.
- Nothing is pushed straight to `main`. Commits carry the author's own identity.

## Releases

```bash
git checkout main && git pull
npm version minor          # bumps package.json + app.json, commits, tags vX.Y.Z
git push --follow-tags     # CI verifies, exports, publishes the GitHub release (+ EAS if EXPO_TOKEN)
```

## Where things are

- `src/app` — Expo Router routes · `src/components` — UI (`line/` is the Metro world)
- `src/hooks/<domain>` — TanStack Query hooks · `src/utils` — api client, i18n, steps sync
- `src/constants` — tokens, colours, enum mirrors · `DESIGN.md`, `PRODUCT.md` — the contract
