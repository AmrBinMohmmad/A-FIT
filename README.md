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

Run it before every pull request; this repository has no CI workflow (owner decision).

## Branching

- `main` — what is shipped to the stores. Changes only through a pull request from `dev`.
- `dev` — integration branch and the GitHub default. Feature branches (`feat/...`, `fix/...`)
  branch from `dev` and come back through a pull request with `npm run verify` green.
- Nothing is pushed straight to `main` or `dev`: every change is a branch and a pull request.
  Commits carry the author's own identity.

## Where things are

- `src/app` — Expo Router routes · `src/components` — UI (`line/` is the Metro world)
- `src/hooks/<domain>` — TanStack Query hooks · `src/utils` — api client, i18n, steps sync
- `src/constants` — tokens, colours, enum mirrors · `DESIGN.md`, `PRODUCT.md` — the contract
