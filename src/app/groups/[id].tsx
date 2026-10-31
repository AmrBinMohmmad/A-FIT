import { useLocalSearchParams, useRouter } from "expo-router";
import { useState } from "react";
import { useTranslation } from "react-i18next";
import { RefreshControl, View } from "react-native";

import { Button } from "@/components/Button";
import { ChallengeRow } from "@/components/groups/ChallengeRow";
import { GroupActions } from "@/components/groups/GroupActions";
import { GroupLine } from "@/components/groups/GroupLine";
import { InviteCard } from "@/components/groups/InviteCard";
import { Leaderboard } from "@/components/groups/Leaderboard";
import { ListState } from "@/components/ListState";
import { RText } from "@/components/RText";
import { Screen } from "@/components/Screen";
import { useAlert } from "@/contexts/AlertContext";
import { useTheme } from "@/contexts/ThemeContext";
import { useGroupChallenges } from "@/hooks/challenges/useChallenges";
import { useGroup, useLeaderboard, useRemoveMember } from "@/hooks/groups/useGroups";
import { makeStyles } from "@/hooks/useStyles";
import type { LeaderboardPeriod, Standing } from "@/types/api";
import { todayKey } from "@/utils/date";

const useStyles = makeStyles((theme) => ({
  section: { gap: theme.spacing.sm },
  head: { flexDirection: "row", justifyContent: "space-between", alignItems: "center" },
}));

/** The group's line: standings for a period (polled every 60 s), invite code, challenges. */
export default function GroupScreen() {
  const { t } = useTranslation();
  const { theme } = useTheme();
  const styles = useStyles();
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id: string }>();
  const groupId = Number(id);
  const [period, setPeriod] = useState<LeaderboardPeriod>("today");
  const date = todayKey();
  const group = useGroup(groupId);
  const board = useLeaderboard(groupId, period, date);
  const challenges = useGroupChallenges(groupId);
  const removeMember = useRemoveMember();
  const { confirm } = useAlert();

  const onRemove = async (member: Standing) => {
    const ok = await confirm({
      title: t("groups.removeConfirmTitle", { name: member.name }),
      message: t("groups.removeConfirmBody"),
      confirmText: t("groups.removeMember"),
      destructive: true,
    });
    if (ok) removeMember.mutate({ groupId, userId: member.user_id });
  };

  const refetchAll = () => Promise.all([group.refetch(), board.refetch(), challenges.refetch()]);
  const g = group.data?.group;

  return (
    <Screen
      back
      title={g?.name ?? ""}
      subtitle={g ? t("common.members", { count: g.members_count }) : undefined}
      action={g ? <GroupActions group={g} /> : undefined}
      refreshControl={
        <RefreshControl
          refreshing={board.isRefetching}
          onRefresh={() => void refetchAll()}
          tintColor={theme.colors.primary}
        />
      }>
      <ListState
        loading={group.isPending}
        error={group.isError ? group.error : undefined}
        onRetry={() => void group.refetch()}>
        {g ? (
          <View style={{ gap: theme.spacing.xl }}>
            {board.data?.standings.length ? (
              <GroupLine
                standings={board.data.standings}
                periodLabel={t(`enums.leaderboardPeriod.${period}`)}
              />
            ) : null}
            <Leaderboard
              period={period}
              onPeriod={setPeriod}
              data={board.data}
              loading={board.isPending}
              error={board.isError ? board.error : undefined}
              onRetry={() => void board.refetch()}
              onRemove={g.my_role === "owner" ? (m) => void onRemove(m) : undefined}
            />

            <InviteCard group={g} />

            <View style={styles.section}>
              <View style={styles.head}>
                <RText variant="subtitle">{t("groups.challenges")}</RText>
                <Button
                  title={t("groups.newChallenge")}
                  variant="ghost"
                  icon="add"
                  onPress={() =>
                    router.push({ pathname: "/groups/[id]/challenges/new", params: { id: String(groupId) } })
                  }
                />
              </View>
              <ListState
                loading={challenges.isPending}
                error={challenges.isError ? challenges.error : undefined}
                onRetry={() => void challenges.refetch()}
                empty={(challenges.data?.length ?? 0) === 0}
                emptyIcon="flag-outline"
                emptyBody={t("groups.noChallenges")}>
                <View>
                  {(challenges.data ?? []).map((c, i) => (
                    <ChallengeRow
                      key={c.id}
                      challenge={c}
                      index={i}
                      first={i === 0}
                      onPress={() =>
                        router.push({ pathname: "/challenges/[id]", params: { id: String(c.id) } })
                      }
                    />
                  ))}
                </View>
              </ListState>
            </View>
          </View>
        ) : null}
      </ListState>
    </Screen>
  );
}
