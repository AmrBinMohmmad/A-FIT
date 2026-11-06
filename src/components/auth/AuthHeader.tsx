import { useTranslation } from "react-i18next";
import { View } from "react-native";

import { CodeChip } from "@/components/line/CodeChip";
import { RText } from "@/components/RText";
import { makeStyles } from "@/hooks/useStyles";

const useStyles = makeStyles((theme) => ({
  wrap: { paddingTop: theme.spacing.xl, paddingBottom: theme.spacing.xxl, gap: theme.spacing.md },
  line: { flexDirection: "row", alignItems: "center", gap: theme.spacing.sm },
  track: { flex: 1, height: 3, borderRadius: 2, backgroundColor: theme.colors.track },
  trackOn: { backgroundColor: theme.colors.primary },
  titles: { gap: theme.spacing.xs },
}));

/** Sign-in header: a three-station line (e-mail → code → name) and the station's title. */
export function AuthHeader({ step, title, subtitle }: { step: 1 | 2 | 3; title: string; subtitle?: string }) {
  const styles = useStyles();
  const { t } = useTranslation();
  return (
    <View style={styles.wrap}>
      <View style={styles.line} accessibilityLabel={t("onboarding.step", { step, total: 3 })}>
        <CodeChip code={1} tone={step >= 1 ? "primary" : "muted"} />
        <View style={[styles.track, step >= 2 && styles.trackOn]} />
        <CodeChip code={2} tone={step >= 2 ? "primary" : "muted"} />
        <View style={[styles.track, step >= 3 && styles.trackOn]} />
        <CodeChip code={3} tone={step >= 3 ? "primary" : "muted"} />
      </View>
      <View style={styles.titles}>
        <RText variant="largeTitle">{title}</RText>
        {subtitle ? (
          <RText variant="body" color="textSecondary">
            {subtitle}
          </RText>
        ) : null}
      </View>
    </View>
  );
}
