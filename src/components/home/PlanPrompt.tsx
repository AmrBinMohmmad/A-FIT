import { useTranslation } from "react-i18next";
import { View } from "react-native";

import { Button } from "@/components/Button";
import { RText } from "@/components/RText";
import { makeStyles } from "@/hooks/useStyles";

const useStyles = makeStyles((theme) => ({
  box: {
    backgroundColor: theme.colors.primaryMuted,
    borderRadius: theme.radii.lg,
    padding: theme.spacing.lg,
    gap: theme.spacing.sm,
  },
}));

/** First-run nudge: no nutrition plan yet. */
export function PlanPrompt({ onPress }: { onPress: () => void }) {
  const styles = useStyles();
  const { t } = useTranslation();
  return (
    <View style={styles.box}>
      <RText variant="callout" weight="bold">
        {t("home.noPlanTitle")}
      </RText>
      <RText variant="footnote" color="textSecondary">
        {t("home.noPlanBody")}
      </RText>
      <Button title={t("home.setUpPlan")} onPress={onPress} style={{ alignSelf: "flex-start" }} />
    </View>
  );
}
