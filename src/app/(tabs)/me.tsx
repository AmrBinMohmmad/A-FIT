import Constants from "expo-constants";
import { useRouter } from "expo-router";
import { useTranslation } from "react-i18next";
import { View } from "react-native";

import { Button } from "@/components/Button";
import { ExitRow } from "@/components/line/ExitRow";
import { SignPanel } from "@/components/line/SignPanel";
import { RText } from "@/components/RText";
import { Screen } from "@/components/Screen";
import { useAlert } from "@/contexts/AlertContext";
import { useAuth } from "@/contexts/AuthContext";
import { useTheme } from "@/contexts/ThemeContext";
import { useDeleteAccount, useProfile } from "@/hooks/profile/useProfile";
import { useStepSync } from "@/hooks/steps/useStepSync";
import { makeStyles } from "@/hooks/useStyles";
import { formatDecimal, formatInt } from "@/utils/number";

const useStyles = makeStyles((theme) => ({
  section: { gap: theme.spacing.xs },
  danger: { gap: theme.spacing.sm, marginTop: theme.spacing.lg },
}));

export default function MeScreen() {
  const { t } = useTranslation();
  const { theme } = useTheme();
  const styles = useStyles();
  const router = useRouter();
  const { user, signOut } = useAuth();
  const { confirm } = useAlert();
  const profile = useProfile();
  const { health, syncing, syncNow, requestAccess } = useStepSync();
  const deleteAccount = useDeleteAccount();
  const version = Constants.expoConfig?.version ?? "";
  const p = profile.data;
  // Display-only arithmetic on stored profile values (the plan itself is computed server-side).
  const bmi = p && p.height > 0 ? p.current_weight / Math.pow(p.height / 100, 2) : null;
  const toTarget = p ? Math.abs(p.current_weight - p.target_weight) : null;

  const onSignOut = async () => {
    const ok = await confirm({
      title: t("auth.signOutConfirmTitle"),
      message: t("auth.signOutConfirmBody"),
      confirmText: t("auth.signOut"),
    });
    if (ok) await signOut();
  };

  const onDelete = async () => {
    const ok = await confirm({
      title: t("me.deleteAccountTitle"),
      message: t("me.deleteAccountBody"),
      confirmText: t("me.deleteAccountConfirm"),
      destructive: true,
    });
    if (ok) deleteAccount.mutate();
  };

  return (
    <Screen title={user?.name ?? t("me.title")} subtitle={user?.email}>
      {p && bmi !== null && toTarget !== null ? (
        <SignPanel
          label={t("me.plan")}
          value={`${formatInt(p.daily_calories)} ${t("common.kcal")}`}
          endLabel={t("me.bmi", { value: formatDecimal(bmi, 1) })}
          endValue={
            toTarget >= 0.1 ? t("me.toTarget", { value: formatDecimal(toTarget, 1) }) : t("me.atTarget")
          }
        />
      ) : null}

      <View style={styles.section}>
        <ExitRow
          first
          code={1}
          title={t("me.plan")}
          subtitle={profile.data ? t(`enums.goalType.${profile.data.goal_type}`) : t("home.noPlanTitle")}
          onPress={() => router.push("/onboarding")}
        />
        <ExitRow code={2} title={t("me.stepsHistory")} onPress={() => router.push("/steps")} />
        <ExitRow code={3} title={t("me.weight")} onPress={() => router.push("/weight")} />
        <ExitRow code={4} title={t("me.water")} onPress={() => router.push("/water")} />
        <ExitRow
          code={5}
          title={t("me.healthAccess")}
          subtitle={health === "granted" ? t("me.healthGranted") : t("me.healthNotGranted")}
          value={health === "granted" ? undefined : t("home.allowHealth")}
          valueTone="accent"
          onPress={health === "granted" ? () => void syncNow() : () => void requestAccess()}
          trailing={
            health === "granted" ? (
              <RText variant="caption" color="textMuted">
                {syncing ? t("common.loading") : t("me.syncNow")}
              </RText>
            ) : undefined
          }
        />
        <ExitRow
          code={6}
          title={t("me.appearance")}
          subtitle={`${t("me.language")} · ${t("me.name")}`}
          onPress={() => router.push("/settings")}
        />
      </View>

      <View style={styles.danger}>
        <Button
          title={t("auth.signOut")}
          variant="secondary"
          icon="log-out-outline"
          onPress={() => void onSignOut()}
        />
        <Button
          title={t("me.deleteAccount")}
          variant="danger"
          onPress={() => void onDelete()}
          loading={deleteAccount.isPending}
        />
        <RText variant="caption" color="textMuted" align="center" style={{ marginTop: theme.spacing.md }}>
          {t("me.version", { version })}
        </RText>
      </View>
    </Screen>
  );
}
