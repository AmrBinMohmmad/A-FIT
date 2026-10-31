import { Image } from "expo-image";
import { View } from "react-native";

import { RText } from "@/components/RText";
import { makeStyles } from "@/hooks/useStyles";
import { initials } from "@/utils/photos";

type Tone = "primary" | "accent" | "muted";

interface AvatarProps {
  uri?: string | null;
  name: string;
  size?: number;
  /** Fallback ring colour when there is no photo. */
  tone?: Tone;
  /** Shown instead of initials when there is no photo (e.g. 👥 for a group). */
  emoji?: string;
}

const useStyles = makeStyles((theme) => ({
  base: { alignItems: "center", justifyContent: "center", overflow: "hidden" },
  primary: { backgroundColor: theme.colors.primaryMuted },
  accent: { backgroundColor: theme.colors.accentMuted },
  muted: { backgroundColor: theme.colors.surface, borderWidth: 1, borderColor: theme.colors.border },
}));

/** A photo roundel; without a photo it shows initials (or an emoji) on a tinted disc. */
export function Avatar({ uri, name, size = 32, tone = "primary", emoji }: AvatarProps) {
  const styles = useStyles();
  const shape = { width: size, height: size, borderRadius: size / 2 };

  if (uri) {
    return (
      <Image
        source={{ uri }}
        style={[styles.base, shape]}
        contentFit="cover"
        cachePolicy="memory-disk"
        transition={150}
        accessibilityLabel={name}
      />
    );
  }

  const label = emoji ?? initials(name);
  const fontSize = Math.max(10, Math.round(size * (emoji ? 0.5 : 0.38)));

  return (
    <View style={[styles.base, styles[tone], shape]} accessibilityRole="image" accessibilityLabel={name}>
      <RText
        weight="bold"
        color={tone === "accent" ? "accent" : tone === "muted" ? "textSecondary" : "primary"}
        style={{ fontSize, lineHeight: Math.round(fontSize * 1.3) }}>
        {label}
      </RText>
    </View>
  );
}
