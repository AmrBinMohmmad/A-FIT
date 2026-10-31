---
name: A-FIT
description: Metro Line Wayfinding — each day is a journey along a line; signage grammar for an Arabic-first, RTL-first step and meal companion.
colors:
  primary: "#1F7A8C"
  primaryMuted: "#DCEFF2"
  onPrimary: "#FFFFFF"
  accent: "#C8451F"
  accentMuted: "#FBE3DC"
  onAccent: "#FFFFFF"
  background: "#FFFFFF"
  surface: "#F4F6F8"
  elevated: "#FFFFFF"
  border: "#D7DCE2"
  divider: "#E6EAEE"
  track: "#D7DCE2"
  textPrimary: "#0E1B2B"
  textSecondary: "#5B6878"
  textMuted: "#5B6878"
  textInverted: "#FFFFFF"
  signPanel: "#0E1B2B"
  onSignPanel: "#FFFFFF"
  signPanelMuted: "#B9C3CF"
  success: "#157A4F"
  successBg: "#E3F5EC"
  warning: "#9A6200"
  warningBg: "#FBF0D9"
  danger: "#B3261E"
  dangerBg: "#FCE8E6"
  info: "#1F5FA8"
  infoBg: "#E4EEFA"
  inputBackground: "#FFFFFF"
  inputBorder: "#D7DCE2"
  inputFocusBorder: "#1F7A8C"
  placeholder: "#5B6878"
  tabBar: "#FFFFFF"
  tabBarActive: "#1F7A8C"
  tabBarInactive: "#5B6878"
  overlay: "rgba(14,27,43,0.5)"
  skeleton: "#E6EAEE"
typography:
  display:
    fontFamily: "IBM Plex Sans Arabic, sans-serif"
    fontSize: "44px"
    fontWeight: 700
    lineHeight: "48px"
  largeTitle:
    fontFamily: "IBM Plex Sans Arabic, sans-serif"
    fontSize: "28px"
    fontWeight: 700
    lineHeight: "34px"
  title:
    fontFamily: "IBM Plex Sans Arabic, sans-serif"
    fontSize: "22px"
    fontWeight: 700
    lineHeight: "28px"
  subtitle:
    fontFamily: "IBM Plex Sans Arabic, sans-serif"
    fontSize: "18px"
    fontWeight: 700
    lineHeight: "26px"
  callout:
    fontFamily: "IBM Plex Sans Arabic, sans-serif"
    fontSize: "16px"
    fontWeight: 500
    lineHeight: "24px"
  body:
    fontFamily: "IBM Plex Sans Arabic, sans-serif"
    fontSize: "15px"
    fontWeight: 400
    lineHeight: "22px"
  footnote:
    fontFamily: "IBM Plex Sans Arabic, sans-serif"
    fontSize: "13px"
    fontWeight: 400
    lineHeight: "18px"
  caption:
    fontFamily: "IBM Plex Sans Arabic, sans-serif"
    fontSize: "11px"
    fontWeight: 500
    lineHeight: "16px"
rounded:
  none: "0px"
  sm: "6px"
  md: "10px"
  lg: "12px"
  xl: "16px"
  full: "999px"
spacing:
  none: "0px"
  xs: "4px"
  sm: "8px"
  md: "12px"
  lg: "16px"
  xl: "24px"
  xxl: "32px"
  xxxl: "48px"
components:
  button-primary:
    backgroundColor: "{colors.primary}"
    textColor: "{colors.onPrimary}"
    typography: "{typography.callout}"
    rounded: "{rounded.md}"
    padding: "0 16px"
    height: "44px"
  button-accent:
    backgroundColor: "{colors.accent}"
    textColor: "{colors.onAccent}"
    typography: "{typography.callout}"
    rounded: "{rounded.md}"
    padding: "0 16px"
    height: "44px"
  button-accent-lg:
    backgroundColor: "{colors.accent}"
    textColor: "{colors.onAccent}"
    typography: "{typography.callout}"
    rounded: "{rounded.md}"
    padding: "0 16px"
    height: "52px"
  button-secondary:
    backgroundColor: "{colors.surface}"
    textColor: "{colors.textPrimary}"
    typography: "{typography.callout}"
    rounded: "{rounded.md}"
    padding: "0 16px"
    height: "44px"
  button-ghost:
    backgroundColor: "transparent"
    textColor: "{colors.primary}"
    typography: "{typography.callout}"
    rounded: "{rounded.md}"
    padding: "0 16px"
    height: "44px"
  button-danger:
    backgroundColor: "{colors.dangerBg}"
    textColor: "{colors.danger}"
    typography: "{typography.callout}"
    rounded: "{rounded.md}"
    padding: "0 16px"
    height: "44px"
  input:
    backgroundColor: "{colors.inputBackground}"
    textColor: "{colors.textPrimary}"
    typography: "{typography.callout}"
    rounded: "{rounded.md}"
    padding: "12px 12px"
    height: "48px"
  code-chip:
    backgroundColor: "{colors.primary}"
    textColor: "{colors.onPrimary}"
    typography: "{typography.caption}"
    rounded: "{rounded.sm}"
    padding: "0 6px"
    height: "28px"
  code-chip-accent:
    backgroundColor: "{colors.accent}"
    textColor: "{colors.onAccent}"
    typography: "{typography.caption}"
    rounded: "{rounded.sm}"
    padding: "0 6px"
    height: "28px"
  code-chip-muted:
    backgroundColor: "{colors.surface}"
    textColor: "{colors.textSecondary}"
    typography: "{typography.caption}"
    rounded: "{rounded.sm}"
    padding: "0 6px"
    height: "28px"
  sign-panel:
    backgroundColor: "{colors.signPanel}"
    textColor: "{colors.onSignPanel}"
    typography: "{typography.subtitle}"
    rounded: "{rounded.lg}"
    padding: "12px 16px"
  line-panel:
    backgroundColor: "{colors.background}"
    textColor: "{colors.textPrimary}"
    rounded: "{rounded.xl}"
    padding: "16px"
  surface-box:
    backgroundColor: "{colors.surface}"
    textColor: "{colors.textPrimary}"
    rounded: "{rounded.lg}"
    padding: "16px"
  tab-bar:
    backgroundColor: "{colors.tabBar}"
    textColor: "{colors.tabBarActive}"
    typography: "{typography.caption}"
    height: "56px"
---

# Design System: A-FIT

## Overview

**Creative North Star: "Metro Line Wayfinding"**

A-FIT reads like a metro station sign. Each day is a journey along a line: stations are milestones at fixed shares of the step goal, the orange roundel is where you are, and friends are thin ink ticks on the same track. The system refuses the card-and-ring fitness dashboard and the bare percentage; progress is distance travelled toward a named next station, and the one fact that matters is printed on a dark sign panel in white.

The material is signage, not paper: a flat white (or ink-navy, in dark) ground, hairline rules instead of boxes, one line colour (teal) for the journey, and one signal colour (orange) that is spent only on "you" and on the single primary action a screen offers. There are exactly two text inks plus the signal; muted, placeholder and inactive-tab roles are aliases of the second ink, not a third one. One typeface, IBM Plex Sans Arabic, carries both Arabic and Latin at three weights; figures that must line up are set in tabular numerals.

Density is operational: short bursts of use, one-handed, often outdoors. Rows meet the platform touch minimum (44pt iOS / 48dp Android), every string is an i18n key in both `ar` and `en`, and all layout is written in logical direction so the line starts on the right in Arabic and on the left in English.

**Key Characteristics:**
- Line-first: `LineDiagram` + `SignPanel` is the hero of every progress surface, never a ring or a percentage alone.
- Two inks + one line colour + one signal colour; everything else is a hairline or a tint.
- Border-first depth; shadow only on the travelling roundel and floating sign panels (toast, dialog).
- Tight signage radii (6–16pt); the roundel is the only circle.
- Stroke icons (Ionicons outline) in one weight; no emoji, no glyph fonts beyond that set.
- One authored motion: the "you" roundel travels 600 ms ease-out; everything else changes instantly.

## Colors

A neutral signage ground, ink for text, teal for the line, orange for the signal, hairlines for structure, and a dark navy panel for the key fact. Light values are normative in the frontmatter; the dark palette exposes identical keys (see the sidecar `colorMeta.*.dark`).

### Primary
- **Line Teal** (`primary`): the journey. Track fill, reached stations, the primary button, focus borders, the active tab, the "allow" and "retry" actions, bars that met the goal. Dark lifts it to `#4FB3C6`.
- **Teal Tint** (`primaryMuted`): selected `ChoiceRow` fill, bars below goal, the header roundel's ring.
- **On Teal** (`onPrimary`): text and icons on a teal fill.

### Secondary
- **Signal Orange** (`accent`): reserved for "you" and one primary action per screen. The travelling roundel and its flag, your `StandingRow` name and bar, today's highlighted bar, the remaining-distance figure on the sign panel, and the single `variant="accent"` button (Home: log meal). Dark lifts it to `#FF7A4D`.
- **Orange Tint** (`accentMuted`) and **On Orange** (`onAccent`): the tint is defined but not yet drawn by a component; `onAccent` is the text on an orange fill.

### Tertiary (status inks)
- **Success** (`success` / `successBg`), **Warning** (`warning` / `warningBg`), **Danger** (`danger` / `dangerBg`), **Info** (`info` / `infoBg`): one ink and one tint each. Danger paints the input error border, the danger button, the error-state icon, and the struck overflow block of a `SegmentBar`. Status inks are never used decoratively.

### Neutral
- **Signage White** (`background`) and **Platform Grey** (`surface`): the ground and the one quieter plane (secondary buttons, segmented-control well, stepper buttons, prompt boxes). `elevated` equals the ground in light.
- **Ink Navy** (`textPrimary` = `signPanel`): the first ink; also the dark sign panel's fill and the friend ticks on the line.
- **Second Ink** (`textSecondary` = `textMuted` = `placeholder` = `tabBarInactive`): one grey for every quieter voice.
- **Hairline** (`border` = `track` = `inputBorder`) and **Divider** (`divider`): 1pt rules; the track is the unreached line.
- **On Sign** (`onSignPanel`) and **Sign Muted** (`signPanelMuted`): the two inks of the dark panel.
- **Overlay** (`overlay`) and **Skeleton** (`skeleton`): modal scrim and loading rows.

### Named Rules
**The Two-Ink Rule.** Text uses `textPrimary` or `textSecondary`. `textMuted` and `placeholder` are aliases of the second ink, not a third tone; a new grey is a defect.

**The Signal Rule.** Orange means "you" or "the one thing to do here". At most one `accent` button per screen; no orange on decoration, status, or other people.

**The One Line Rule.** Teal is the only line colour. Progress, reached stations, active tabs and focus share it; nothing else introduces a hue.

**The No-Hex Rule.** Components read `theme.colors.*`; a hex literal outside `src/constants/colors.ts` fails lint.

## Typography

**Display Font:** IBM Plex Sans Arabic (no display face; the UI face at 700)
**Body Font:** IBM Plex Sans Arabic 400 / 500 / 700 (`IBMPlexSansArabic_400Regular`, `_500Medium`, `_700Bold`)
**Label/Mono Font:** none; figures use `fontVariant: tabular-nums` on the same face

**Character:** One humanist face covering Arabic and Latin on equal terms, set at a fixed eight-step scale. Headings are bold, not large; the loudest thing on a screen is a tabular figure on a dark sign, not a headline.

### Hierarchy
- **Display** (700, 44/48): reserved; not yet placed on a shipped screen.
- **Large Title** (700, 28/34): the station-sign header on root screens; the `figure` input mode.
- **Title** (700, 22/28): the user's name in the Home header; titles on pushed screens.
- **Subtitle** (700, 18/26): the sign panel's value; empty/error-state titles.
- **Callout** (500 default, 16/24; 700 on buttons and values): row titles, button labels, input text, exit values and standing figures.
- **Body** (400, 15/22): running prose.
- **Footnote** (400, 13/18; 500 when a quiet heading): subtitles, labels above inputs, panel heads, the roundel flag (700).
- **Caption** (500, 11/16; 700 in chips): code chips, station labels, sign-panel labels, tab labels, helper and error messages.

### Named Rules
**The Tabular Figure Rule.** Any number that can change or sit beside another number is set with `tabular`; the sign value, exit values, standings, station labels and sync time all are.

**The No-Kicker Rule.** Labels are set in sentence case at `caption` or `footnote` in the second ink. No tracked uppercase eyebrows; the one tracked string in the build is the invite code (`letterSpacing: 2`), a code, not a label.

**The Direction Rule.** `RText` sets no `textAlign`; text follows the writing direction. Inputs flip `textAlign` and `writingDirection` to RTL only for Arabic non-numeric fields.

## Layout

Single column, full width, 16pt gutters (`spacing.lg`) and a 16pt gap between stacked blocks; the `Screen` scaffold owns safe areas, the header, the scrolling body and a sticky footer separated by a 1pt divider. Spacing is a 4pt scale (4 / 8 / 12 / 16 / 24 / 32 / 48). Rows are 12pt vertical padding with a `minHeight` of the platform touch target (44pt iOS, 48dp Android), often plus 12pt. Lists are rule-separated, not card-separated: each row draws a 1pt top divider except the first.

Panels that hold a line (`StepsPanel`, `GroupLine`, `InviteCard`) are a 1pt hairline box with 16pt radius and 16pt padding on the ground colour. Inside a panel the content is flat; there are no nested cards. Three-up macro cells share one row with 8pt gaps. The tab bar is 56pt plus the bottom inset, 1pt top hairline, caption labels in the medium weight.

Every offset is logical: `marginInlineStart`, `insetInlineStart/End`, `gap`, `flexDirection: row` (which mirrors under RTL). The line diagram positions stations from the `right` edge in RTL and the `left` edge in LTR; charts reverse their series order in RTL so bars read start to end.

## Elevation & Depth

Signage is border-first. Planes are separated by 1pt hairlines and the two neutral grounds (`background` / `surface`); rest-state components carry no shadow. Shadow is spent on altitude only: the travelling "you" roundel floats above the track (`shadows.sm`), and floating sign panels (toast, alert dialog) use `shadows.md`. Dark mode relies on the same borders with lifted inks; `elevated` is a slightly lighter navy there.

### Shadow Vocabulary
- **Roundel** (`shadows.sm` — iOS `0 2px 4px rgba(14,27,43,0.08)`, Android elevation 2): the "you" roundel on the line.
- **Floating sign** (`shadows.md` — iOS `0 6px 12px rgba(14,27,43,0.12)`, Android elevation 6): toast and alert dialog.
- **Card** (`shadows.card` — iOS `0 1px 2px rgba(14,27,43,0.05)`, elevation 1): defined, currently unreferenced.

### Named Rules
**The Border-First Rule.** A surface at rest is separated by a hairline, never a shadow. Shadow appears only on an element that is physically above the sign (roundel, toast, dialog).

## Shapes

Tight signage corners: chips and the flag at 6pt (`sm`), buttons, inputs and controls at 10pt (`md`), sign panels and option rows at 12pt (`lg`), line panels at 16pt (`xl`). The only circles are roundels (`full`): the header brand roundel (40pt, 3pt teal-tint ring), the station marks (20pt, 4pt ring, ground fill) and the "you" roundel (28pt, 4pt ground ring, orange fill). Tracks and bars are 4–6pt tall with fully rounded ends; `SegmentBar` blocks are 2pt-radius slabs with 2pt gaps. Borders are 1pt everywhere; nothing is pill-shaped except the roundel, and nothing uses a gradient.

## Components

### Buttons
Flat, bordered, one height; the orange one is rare and haptic.
- **Shape:** 10pt radius (`rounded.md`), 1pt border matching the fill, 16pt horizontal padding, 44/48pt min height (52pt for `size="lg"`), callout 700 label, optional 18pt stroke icon, 8pt gap.
- **Primary:** teal fill, white text; the default verb.
- **Accent:** orange fill, white text; one per screen (Home footer "log meal"); fires `Haptics.selectionAsync` on press.
- **Secondary:** `surface` fill with hairline border and first-ink text; retry, cancel, neutral choices.
- **Ghost:** transparent, teal text; tertiary links such as "open settings".
- **Danger:** `dangerBg` tint with `danger` text; destructive confirmations.
- **Pressed / Disabled:** opacity 0.85 pressed, 0.5 disabled (also while loading, which swaps the label for a spinner in the text colour).

### Chips (CodeChip)
- **Style:** 28pt square-ish slab, min width 28, 6pt radius, caption 700 tabular text. `primary` teal on white, `accent` orange on white, `muted` `surface` with hairline and second ink.
- **State:** tone encodes rank or identity (`accent` = you, `primary` = leader/first, `muted` = others), never interaction.

### Cards / Containers
- **Line panel:** 1pt hairline, 16pt radius, 16pt padding, ground fill; holds a head row (footnote labels), the `LineDiagram`, and a `SignPanel`.
- **Surface box:** `surface` fill, 12pt radius, 16pt padding; in-context prompts (health access, plan).
- **Macro cell:** hairline, 12pt radius, 12pt padding; caption label, callout 700 figure, 5-block `SegmentBar` at 4pt.
- **Shadow Strategy:** none at rest (see Elevation & Depth).

### Inputs / Fields
- **Style:** 1pt `inputBorder`, 10pt radius, `inputBackground` fill, 12pt horizontal padding, min height touch target + 4; callout 400 text; footnote second-ink label above, caption helper/error below; a clear button appears when non-empty.
- **Focus:** border becomes teal (`inputFocusBorder`); no glow.
- **Error:** border becomes `danger`; caption message in `danger`.
- **Figure mode:** large-title 700 centred tabular entry for weights and steps (used by `Stepper` between two 48pt `surface` +/− buttons).

### Navigation
- **Tab bar:** `tabBar` fill, 1pt `border` top hairline, 56pt + bottom inset, caption 500 labels, 22pt Ionicons switching outline → filled when focused; teal active, second-ink inactive. Four tabs: Home, Meals, Groups, Me.
- **Screen header:** large title (root) or title (pushed) with an optional footnote subtitle; a 44pt back button whose chevron flips with direction.
- **Segmented period switcher:** `surface` well, 10pt radius, 3pt inset; the selected tab is a ground-filled 6pt-radius slab with a hairline, footnote 700 first ink; unselected footnote 500 second ink.

### Signature Components
- **LineDiagram:** a 6pt track (`track`) with a teal progress fill; stations at 0 / 20 / 50 / 80 / 100 % of the goal as 20pt ring roundels (teal ring once reached, track-grey before); friends as 2 × 30pt ink ticks; "you" as a 28pt orange roundel with a 6pt-radius orange flag reading "you · 7,482" (footnote 700 tabular), pinned inside the panel near either terminus. Station labels are caption second-ink `formatCompact` figures. The roundel travels on value change over `duration.travel` (600 ms, `Easing.out(cubic)`); under Reduce Motion it jumps.
- **SignPanel:** dark `signPanel` slab, 12pt radius, 12 × 16pt padding; caption label in `signPanelMuted` over a subtitle tabular value in white; optional end column, whose value may take the `accent` tone (the remaining distance to the next station, or an over-budget figure).
- **ExitRow:** `CodeChip` + callout 500 title + footnote subtitle + callout 700 tabular trailing value (`accent` / `muted` tones) + optional trailing bar; 1pt top divider except first; pressable rows end in an 18pt chevron that flips with direction.
- **StandingRow:** rank `CodeChip`, name (accent + bold when you), a 4pt exact-magnitude bar on one shared scale, and the tabular step count.
- **SegmentBar:** a fixed measure of discrete blocks (10 for kcal, 5 for macros) that never stretches; filled in teal or orange; when over budget the last block is painted `danger` (the struck-overflow adaptation).
- **Charts (DayBars / TrendLine):** single series, 3pt-radius bars with 4pt gaps; teal when the goal is met, teal tint below, orange for today; a dashed 1.5pt ink goal line with a 10pt medium label; caption day labels.
- **ListState:** three skeleton rows (56pt, 10pt radius, `skeleton`), or a 56pt `surface` roundel holding a 28pt stroke icon above a subtitle and footnote; the empty icon defaults to `train-outline`.

## Do's and Don'ts

### Do:
- **Do** express progress as a `LineDiagram` + `SignPanel` pair naming the next station and the remaining distance.
- **Do** keep orange to "you" (roundel, flag, your row, your bar, today) and one `variant="accent"` button per screen.
- **Do** use only `textPrimary` and `textSecondary` (and their aliases) for text; the Two-Ink Rule.
- **Do** separate rows and planes with 1pt hairlines (`divider` / `border`) on a flat ground.
- **Do** set every changing number with `tabular` and format it through `formatInt` / `formatCompact`.
- **Do** write offsets in logical properties (`marginInlineStart`, `insetInlineStart`) and flip chevrons with `useRTL`.
- **Do** keep every visible string a key in both `ar.json` and `en.json`; enum labels via `t("enums.<x>.<value>")`.
- **Do** meet `MIN_TOUCH_TARGET` on every pressable and use stroke Ionicons at 18–24pt in one weight.
- **Do** use fixed-measure `SegmentBar`s where a budget is fixed; one shared scale for bars that compare people or days.

### Don't:
- **Don't** draw rings, donuts or a bare percentage as the primary progress read.
- **Don't** nest a card inside a panel; inside a hairline box, content is flat.
- **Don't** introduce gradients, a second hue, a third grey, or a hex literal outside `src/constants/colors.ts`.
- **Don't** add shadow to a resting surface; shadow is for the roundel, toast and dialog only.
- **Don't** set tracked uppercase labels, kickers or eyebrows; labels are sentence-case caption/footnote in the second ink.
- **Don't** use emoji or glyph-font icons; `@expo/vector-icons` Ionicons outline is the only icon set.
- **Don't** animate anything except the travelling roundel; signage changes instantly.
- **Don't** render `Text` or `TextInput` outside `RText` / `RTextInput` (and the sanctioned `OtpInput`).
