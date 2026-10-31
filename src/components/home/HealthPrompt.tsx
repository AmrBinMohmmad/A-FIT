import { Ionicons } from "@expo/vector-icons";
import { useTranslation } from "react-i18next";
import { Linking, View } from "react-native";

import { Button } from "@/components/Button";
import { RText } from "@/components/RText";
import { useTheme } from "@/contexts/ThemeContext";
import { makeStyles } from "@/hooks/useStyles";
import type { HealthState } from "@/hooks/steps/useStepSync";

const useStyles = makeStyles((theme) => ({
  box: {
    backgroundColor: theme.colors.surface,
    borderRadius: theme.radii.lg,
    padding: theme.spacing.lg,
    gap: theme.spacing.sm,
    flexDirection: "row",
    alignItems: "flex-start",
  },
  text: { flex: 1, gap: theme.spacing.xs },
  actions: { flexDirection: "row", gap: theme.spacing.sm, marginTop: theme.spacing.xs },
}));

/** In-context request for step access; explains what is read and why before the OS dialog. */
export function HealthPrompt({ state, onAllow }: { state: HealthState; onAllow: () => void }) {
  const styles = useStyles();
  const { theme } = useTheme();
  const { t } = useTranslation();

  const body = state === "unavailable" ? t("home.healthUnavailable") : t("home.noHealthBody");

  return (
    <View style={styles.box} accessibilityRole="alert">
      <Ionicons name="footsteps-outline" size={22} color={theme.colors.primary} />
      <View style={styles.text}>
        <RText variant="callout" weight="bold">
          {t("home.noHealthTitle")}
        </RText>
        <RText variant="footnote" color="textSecondary">
          {body}
        </RText>
        {state !== "unavailable" ? (
          <View style={styles.actions}>
            <Button title={t("home.allowHealth")} onPress={onAllow} />
            <Button
              title={t("common.openSettings")}
              variant="ghost"
              onPress={() => void Linking.openSettings()}
            />
          </View>
        ) : null}
      </View>
    </View>
  );
}
