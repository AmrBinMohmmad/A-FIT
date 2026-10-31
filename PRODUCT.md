# Product

<!-- impeccable:product-schema 1 -->

## Platform

adaptive

## Users

Arabic-first (Saudi / Gulf) adults who want to get fitter with friends. Primary user: someone
tracking daily steps and meals on their own phone, who invites a few friends into a shared
group so they can see each other's step counts and run short challenges. Used many times a day
in short bursts: a glance at the home screen, a quick meal log, a check of the group
leaderboard. English-speaking users are a confirmed secondary audience (owner answer,
2026-10-30: ship Arabic + English).

## Product Purpose

A-FIT (أي-فت) is a personal fitness companion: it reads the phone's step count in the
background, tracks meals and macros against a calculated daily plan, and turns steps into a
social game with friends. Success for a user is a visible streak: daily step goal met, meals
logged, and a place on the group leaderboard. Success for the product is daily return visits
without nagging.

## Positioning

Steps are the social currency; nutrition is the private ledger. Unlike a generic calorie
counter, A-FIT's group leaderboard and challenges run on real background step data from the
OS health store (HealthKit / Health Connect), so friends compete on numbers nobody typed in.
Unlike a generic step app, the same home screen carries the user's own calorie budget and macro
targets, so the social loop and the personal plan live together.

## Operating Context

- Phones only (iOS + Android), one-handed, often outdoors or between tasks.
- Arabic is the default language and RTL is the default layout; English is a full second
  language, not a fallback.
- Step data comes from the OS health store, synced in the background; the app must never
  require being open to count steps (owner answer, 2026-10-30).
- The backend is a Laravel JSON API shared by all users; the mobile client is the only
  client today. The server must stay cheap per user: few requests, batched step syncs,
  cached leaderboards.
- Sign-in is passwordless: email → 6-digit code → (first time) name.

## Capabilities and Constraints

Confirmed capabilities:
- Email OTP sign-in (one "continue with email" flow, no account enumeration).
- Onboarding that calculates a nutrition plan (Mifflin-St Jeor BMR, TDEE, goal adjustment)
  and stores it as the user's daily calorie and macro targets.
- Meal logging with calories and macros per meal, per day, with edit/delete and history by date.
- Daily steps read from HealthKit (iOS) / Health Connect (Android), synced to the server as a
  per-day total; 7-day and 30-day step history.
- Weight log and water intake log.
- Groups: create a group, invite friends with a code or link, see members' steps for today,
  this week, this month.
- Challenges inside a group: most steps in a window, or first to a step target; status
  upcoming / active / ended; winner shown when ended.
- Account deletion from inside the app (store requirement).
- Light and dark appearance, tri-state (system / light / dark).
- Profile photo and group photo; emoji as content glyphs (meal types, celebrations, empty
  states) to keep the tone friendly (owner request 2026-10-31).
- "Sign out of all devices" for a lost phone; at most ten live sessions per account.

Constraints:
- Rakaya mobile standard: strict `{flag, data, message}` API envelope, token only in
  expo-secure-store, server state only in TanStack Query, all text through RText, tokens +
  makeStyles only, en/ar key parity, logical-direction styling.
- Health permissions are requested in-context with a plain explanation; a user who declines
  can still use meals, groups and manual weight/water.
- No push notifications in this release (polled refresh only). Explicitly undecided: push.
- Photos are limited to a profile picture and a group photo (owner-set), both square and
  downsized on the device before upload (owner request 2026-10-31). No meal photos, no feed,
  no chat. Explicitly undecided: friend requests outside groups.

Terminology (Arabic / English): خطوات / steps, مجموعة / group, تحدي / challenge, وجبة / meal,
الخطة اليومية / daily plan, سعرة / kcal, بروتين / protein, كارب / carbs, دهون / fat.

## Brand Commitments

- Name: A-FIT, Arabic أي-فت. Keep both forms.
- Typeface: IBM Plex Sans Arabic is already licensed and loaded (400/700); it may stay as the
  UI face for Arabic + Latin. No other brand commitment is binding; the owner asked for a new
  visual identity (2026-10-30), so the current dark-emerald look is evidence, not authority.
- Existing icon assets live in `assets/images/` (A-FIT.png, android adaptive icon set,
  splash-icon.png). They may be replaced if the new identity requires it.

## Evidence on Hand

- Existing Expo app and Laravel API in this repository (meals, profile, OTP auth).
- No user research, testimonials, metrics or store listings exist. Future work must not
  fabricate any.
- Reference competitor named by the owner: "MySteps"-style group step tracking with
  invitations and challenges.

## Product Principles

1. Background truth: numbers come from the OS, never from the user's memory; the UI shows
   when data was last synced and never pretends.
2. Glanceable first: the home screen answers "how am I doing today, and how are my friends"
   in one look; details are one tap away.
3. Cheap to run: the client batches and caches; one request per surface, never per element.
4. Bilingual by construction: every string is a key, every layout is logical-direction.
5. Private ledger, public game: meals and weight are never shown to the group; only steps are.

## Accessibility & Inclusion

Touch targets at least 44pt, contrast at least 4.5:1 for body text, Dynamic Type / font scale
respected, every icon-only control labelled, RTL and LTR both first-class.
