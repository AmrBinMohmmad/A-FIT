/**
 * Color tokens — the single source of truth for the Metro Line Wayfinding world.
 * Signage grammar: a neutral ground, ink for text, ONE line colour (teal) for the journey,
 * ONE signal colour (orange) reserved for "you" and the primary action, hairline rules,
 * and a dark sign panel for the key fact. Exactly two inks (primary / secondary — muted,
 * placeholder and inactive-tab aliases share the second ink) plus the signal colour. Light
 * and dark expose identical keys; the
 * `ThemeColors` interface makes drift impossible. Never hardcode a hex in a component.
 */

export interface ThemeColors {
  primary: string;
  primaryMuted: string;
  onPrimary: string;
  accent: string;
  accentMuted: string;
  onAccent: string;

  background: string;
  surface: string;
  elevated: string;
  border: string;
  divider: string;
  track: string;

  textPrimary: string;
  textSecondary: string;
  textMuted: string;
  textInverted: string;

  signPanel: string;
  onSignPanel: string;
  signPanelMuted: string;

  success: string;
  successBg: string;
  warning: string;
  warningBg: string;
  danger: string;
  dangerBg: string;
  info: string;
  infoBg: string;

  inputBackground: string;
  inputBorder: string;
  inputFocusBorder: string;
  placeholder: string;

  tabBar: string;
  tabBarActive: string;
  tabBarInactive: string;

  overlay: string;
  skeleton: string;
}

export const lightColors: ThemeColors = {
  primary: "#1F7A8C",
  primaryMuted: "#DCEFF2",
  onPrimary: "#FFFFFF",
  accent: "#C8451F",
  accentMuted: "#FBE3DC",
  onAccent: "#FFFFFF",

  background: "#FFFFFF",
  surface: "#F4F6F8",
  elevated: "#FFFFFF",
  border: "#D7DCE2",
  divider: "#E6EAEE",
  track: "#D7DCE2",

  textPrimary: "#0E1B2B",
  textSecondary: "#5B6878",
  textMuted: "#5B6878",
  textInverted: "#FFFFFF",

  signPanel: "#0E1B2B",
  onSignPanel: "#FFFFFF",
  signPanelMuted: "#B9C3CF",

  success: "#157A4F",
  successBg: "#E3F5EC",
  warning: "#9A6200",
  warningBg: "#FBF0D9",
  danger: "#B3261E",
  dangerBg: "#FCE8E6",
  info: "#1F5FA8",
  infoBg: "#E4EEFA",

  inputBackground: "#FFFFFF",
  inputBorder: "#D7DCE2",
  inputFocusBorder: "#1F7A8C",
  placeholder: "#5B6878",

  tabBar: "#FFFFFF",
  tabBarActive: "#1F7A8C",
  tabBarInactive: "#5B6878",

  overlay: "rgba(14,27,43,0.5)",
  skeleton: "#E6EAEE",
};

export const darkColors: ThemeColors = {
  primary: "#4FB3C6",
  primaryMuted: "#163840",
  onPrimary: "#06212A",
  accent: "#FF7A4D",
  accentMuted: "#3B2017",
  onAccent: "#1A0E09",

  background: "#0B1420",
  surface: "#121D2B",
  elevated: "#182536",
  border: "#2A3A4E",
  divider: "#1F2D3E",
  track: "#2A3A4E",

  textPrimary: "#F2F5F8",
  textSecondary: "#B8C3D0",
  textMuted: "#B8C3D0",
  textInverted: "#0E1B2B",

  signPanel: "#193352",
  onSignPanel: "#FFFFFF",
  signPanelMuted: "#A9BBD0",

  success: "#4CD08A",
  successBg: "#0E2A1C",
  warning: "#F2B04B",
  warningBg: "#2A1F08",
  danger: "#FF7B72",
  dangerBg: "#2E1413",
  info: "#6FB1FF",
  infoBg: "#0E2238",

  inputBackground: "#182536",
  inputBorder: "#2A3A4E",
  inputFocusBorder: "#4FB3C6",
  placeholder: "#B8C3D0",

  tabBar: "#121D2B",
  tabBarActive: "#4FB3C6",
  tabBarInactive: "#B8C3D0",

  overlay: "rgba(0,0,0,0.6)",
  skeleton: "#1F2D3E",
};
