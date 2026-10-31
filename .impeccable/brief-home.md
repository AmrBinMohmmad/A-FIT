## Scope
Surface: the A-FIT mobile app (Expo, iOS + Android), every screen; primary target the Home tab.
Visitor mode: Operate. Audience: Arabic-first Gulf adults tracking steps and meals with friends;
English is a full second language. Task: glance at today, log a meal, check the group.
Constraints: Rakaya mobile standard (tokens + makeStyles + RText, envelope, secure-store,
en/ar parity, logical props); health data from the OS store; no push this release.
Chosen by the owner on 2026-10-30 from the direction round (the pick card).

## Direction contract
THESIS: Each day is a journey along a line. Stations are milestones, the roundel is where you
are, friends are markers on the same line. It refuses the card-and-ring fitness dashboard and
the bare percentage: progress is distance travelled toward a named next station.

OWN-WORLD: Metro-grade wayfinding signage. Light: white signage ground, ink-navy text, one line
colour (teal) for the journey, one signal colour (orange) reserved for "you" and the primary
action, hairline rules, dark-navy sign panels with white text for the key fact. Dark (evening
walks): ink-navy ground, white text, the same teal and orange lifted for contrast. One typeface,
IBM Plex Sans Arabic, tabular numerals, no display face. Components: LineDiagram,
StationRoundel, SignPanel, ExitRow (numbered code chip + title + subtitle + trailing value),
CodeChip, segment bars only where a budget is fixed. No nested cards, no gradients, no rings,
no emoji icons; stroke icons in one weight.

STORY: Open the app, read the line: where am I, what is the next station, how far. Below the
line, the exits list says what else is live today (meals, group, challenge, water, weight).
One orange action logs a meal. The group screen is the same line with every member's roundel.

FIRST VIEWPORT: Station-sign header (roundel wordmark, date, last sync). A bordered line
diagram panel: the line across the full width, stations at 0 / 2k / 5k / 8k / 10k, friends as
thin markers, you as an orange roundel with a flag "أنت · 7,482"; under it a dark SignPanel:
"المحطة القادمة 8,000 خطوة" and "المتبقي 518". Then the numbered exits list; the orange
primary button "تسجيل وجبة" above a four-tab bar (الرئيسية, الوجبات, المجموعات, أنا).

FORM: Metro Line Wayfinding, position 1 on my ordered list (the pick card); seed key 12479284.
The roll's assigned direction (The Instrument Face, position 4) was shown and not chosen.
Raises kept from the declined hand: labels are controls inside the panel; two ink levels plus
the signal colour; fixed-measure budgets with a struck overflow segment; sticky history head
naming the date span in view; whole-cell week strip; exact-magnitude bars on one scale.
Signature interaction: the "you" roundel slides along the line to its new position when fresh
step data arrives; everything else changes instantly, signage-style.

ADAPTATIONS (cited after the finish review, 2026-10-30): the header roundel carries the brand
mark "A" and the user's name is the station title (the roundel names whose line it is, the sign
names where you are); the group screen renders the same LineDiagram with every member as a tick
above the ranked ledger; the SegmentBar overflow block is painted in the danger ink because a
strike-through glyph has no RN primitive without a second drawing layer.

ADAPTATIONS (owner request, 2026-10-31): emoji are admitted as CONTENT glyphs — meal-type
marks, the goal-reached and streak celebrations, empty states, the greeting — never as controls
(controls stay stroke icons in one weight; `src/constants/emoji.ts` is the single list). Photos:
the user's avatar replaces the brand roundel in the header when present, members carry a 32 px
avatar after the rank chip, groups lead with their photo (👥 fallback); initials on a tinted disc
when there is no photo (`src/components/Avatar.tsx`).

FINISH: unreviewed and undocumented is unfinished; this build ends with the finish review,
the verdict, DESIGN.md, and every shipping raster carrying its provenance.
