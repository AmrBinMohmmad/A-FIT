import { View } from "react-native";

import { RText } from "@/components/RText";
import { AVATARS, type AvatarKey } from "@/constants/avatars";
import { makeStyles } from "@/hooks/useStyles";
import { initials } from "@/utils/text";

type Tone = "primary" | "accent" | "muted";

interface AvatarProps {
  /** The user's chosen avatar key; null falls back to initials (or `emoji`). */
  avatar?: AvatarKey | string | null;
  name: string;
  size?: number;
  tone?: Tone;
  /** Fallback glyph when there is no avatar (e.g. 👥 for a group). */
  emoji?: string;
  selected?: boolean;
}

const useStyles = makeStyles((theme) => ({
  base: { alignItems: "center", justifyContent: "center", overflow: "hidden" },
  primary: { backgroundColor: theme.colors.primaryMuted },
  accent: { backgroundColor: theme.colors.accentMuted },
  muted: { backgroundColor: theme.colors.surface, borderWidth: 1, borderColor: theme.colors.border },
  selected: { borderWidth: 3, borderColor: theme.colors.accent },
}));

/** An emoji roundel on a tinted disc; without a chosen avatar it shows initials (or `emoji`). */
export function Avatar({ avatar, name, size = 32, tone = "primary", emoji, selected }: AvatarProps) {
  const styles = useStyles();
  const shape = { width: size, height: size, borderRadius: size / 2 };
  const glyph = avatar && avatar in AVATARS ? AVATARS[avatar as AvatarKey] : emoji;
  const label = glyph ?? initials(name);
  const fontSize = Math.max(10, Math.round(size * (glyph ? 0.52 : 0.38)));

  return (
    <View
      style={[styles.base, styles[tone], shape, selected && styles.selected]}
      accessibilityRole="image"
      accessibilityLabel={name}>
      <RText
        weight="bold"
        color={tone === "accent" ? "accent" : tone === "muted" ? "textSecondary" : "primary"}
        style={{ fontSize, lineHeight: Math.round(fontSize * 1.3) }}>
        {label}
      </RText>
    </View>
  );
}
