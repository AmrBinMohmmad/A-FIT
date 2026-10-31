import { Ionicons } from "@expo/vector-icons";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useTranslation } from "react-i18next";
import { Pressable, RefreshControl, View } from "react-native";

import { ListState } from "@/components/ListState";
import { SegmentBar } from "@/components/line/SegmentBar";
import { SignPanel } from "@/components/line/SignPanel";
import { StandingRow } from "@/components/line/StandingRow";
import { RText } from "@/components/RText";
import { Screen } from "@/components/Screen";
import { MIN_TOUCH_TARGET } from "@/constants/tokens";
import { useAlert } from "@/contexts/AlertContext";
import { useAuth } from "@/contexts/AuthContext";
import { useTheme } from "@/contexts/ThemeContext";
import { useChallenge, useDeleteChallenge } from "@/hooks/challenges/useChallenges";
import { formatInt } from "@/utils/number";

export default function ChallengeScreen() {
  const { t } = useTranslation();
  const { theme } = useTheme();
  const router = useRouter();
  const { confirm } = useAlert();
  const { user } = useAuth();
  const { id } = useLocalSearchParams<{ id: string }>();
  const challenge = useChallenge(Number(id));
  const remove = useDeleteChallenge();
  const c = challenge.data;
  const standings = c?.standings ?? [];
  const team = standings.reduce((sum, s) => sum + s.steps, 0);
  const max = Math.max(...standings.map((s) => s.steps), 1);
  const canDelete = c && c.creator_id === user?.id;
  const winner = c?.winner_user_id ? standings.find((s) => s.user_id === c.winner_user_id) : null;

  const onDelete = async () => {
    if (!c) return;
    const ok = await confirm({
      title: t("challenges.deleteConfirmTitle"),
      message: t("challenges.deleteConfirmBody", { title: c.title }),
      confirmText: t("common.delete"),
      destructive: true,
    });
    if (ok) remove.mutate(c.id, { onSuccess: () => router.back() });
  };

  return (
    <Screen
      back
      title={c?.title ?? t("challenges.title")}
      subtitle={
        c ? `${t(`enums.challengeType.${c.type}`)} · ${t(`enums.challengeStatus.${c.status}`)}` : undefined
      }
      action={
        canDelete ? (
          <Pressable
            onPress={() => void onDelete()}
            style={{
              width: MIN_TOUCH_TARGET,
              height: MIN_TOUCH_TARGET,
              alignItems: "center",
              justifyContent: "center",
            }}
            accessibilityRole="button"
            accessibilityLabel={t("common.delete")}>
            <Ionicons name="trash-outline" size={20} color={theme.colors.danger} />
          </Pressable>
        ) : undefined
      }
      refreshControl={
        <RefreshControl
          refreshing={challenge.isRefetching}
          onRefresh={() => void challenge.refetch()}
          tintColor={theme.colors.primary}
        />
      }>
      <ListState
        loading={challenge.isPending}
        error={challenge.isError ? challenge.error : undefined}
        onRetry={() => void challenge.refetch()}>
        {c ? (
          <View style={{ gap: theme.spacing.xl }}>
            <View style={{ gap: theme.spacing.sm }}>
              <SignPanel
                label={c.goal_steps ? t("challenges.goalSteps") : t("challenges.teamTotal")}
                value={c.goal_steps ? `${formatInt(team)} / ${formatInt(c.goal_steps)}` : formatInt(team)}
                endLabel={c.status === "ended" ? t("enums.challengeStatus.ended") : t("challenges.ends")}
                endValue={c.status === "ended" ? c.ends_on : t("common.days", { count: c.days_left })}
              />
              {c.goal_steps ? (
                <SegmentBar value={team} max={c.goal_steps} segments={20} height={8} color="accent" />
              ) : null}
              {c.status === "ended" ? (
                <RText variant="callout" weight="bold" color={winner ? "accent" : "textSecondary"}>
                  {winner
                    ? t("challenges.winner", { name: winner.is_me ? t("common.you") : winner.name })
                    : t("challenges.noWinner")}
                </RText>
              ) : null}
            </View>
            <View>
              <RText variant="subtitle" style={{ marginBottom: theme.spacing.xs }}>
                {t("challenges.standings")}
              </RText>
              {standings.map((s, i) => (
                <StandingRow
                  key={s.user_id}
                  standing={s}
                  max={max}
                  youLabel={t("common.you")}
                  ownerLabel={t("groups.owner")}
                  first={i === 0}
                />
              ))}
            </View>
          </View>
        ) : null}
      </ListState>
    </Screen>
  );
}
