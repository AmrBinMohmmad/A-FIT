import { View } from "react-native";

import { RText } from "@/components/RText";
import { makeStyles } from "@/hooks/useStyles";

type Tone = "primary" | "accent" | "muted";

const useStyles = makeStyles((theme) => ({
  base: {
    minWidth: 28,
    height: 28,
    borderRadius: theme.radii.sm,
    paddingHorizontal: 6,
    alignItems: "center",
    justifyContent: "center",
  },
  primary: { backgroundColor: theme.colors.primary },
  accent: { backgroundColor: theme.colors.accent },
  muted: { backgroundColor: theme.colors.surface, borderWidth: 1, borderColor: theme.colors.border },
}));

/** The numbered exit code on a station sign: "1", "2", "A". */
export function CodeChip({ code, tone = "primary" }: { code: string | number; tone?: Tone }) {
  const styles = useStyles();
  return (
    <View style={[styles.base, styles[tone]]}>
      <RText
        variant="caption"
        weight="bold"
        color={tone === "muted" ? "textSecondary" : tone === "accent" ? "onAccent" : "onPrimary"}
        tabular>
        {String(code)}
      </RText>
    </View>
  );
}
