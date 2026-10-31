import { useRouter } from "expo-router";
import { useCallback, useState } from "react";
import { useTranslation } from "react-i18next";
import { RefreshControl, View } from "react-native";

import { Button } from "@/components/Button";
import { HealthPrompt } from "@/components/home/HealthPrompt";
import { HomeExits } from "@/components/home/HomeExits";
import { HomeHeader } from "@/components/HomeHeader";
import { PlanPrompt } from "@/components/home/PlanPrompt";
import { StepsPanel } from "@/components/home/StepsPanel";
import { ListState } from "@/components/ListState";
import { Screen } from "@/components/Screen";
import { useTheme } from "@/contexts/ThemeContext";
import { useDashboard } from "@/hooks/dashboard/useDashboard";
import { useStepSync } from "@/hooks/steps/useStepSync";
import { todayKey } from "@/utils/date";

/** Home: today's line. One request (dashboard) plus the local step sync; nothing is computed here. */
export default function HomeScreen() {
  const { t } = useTranslation();
  const { theme } = useTheme();
  const router = useRouter();
  const date = todayKey();
  const dashboard = useDashboard(date);
  const { health, syncing, requestAccess, syncNow } = useStepSync();
  const [refreshing, setRefreshing] = useState(false);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await Promise.all([syncNow(), dashboard.refetch()]);
    setRefreshing(false);
  }, [syncNow, dashboard]);

  const data = dashboard.data;

  return (
    <Screen
      refreshControl={
        <RefreshControl
          refreshing={refreshing}
          onRefresh={() => void onRefresh()}
          tintColor={theme.colors.primary}
          colors={[theme.colors.primary]}
        />
      }
      bottomInset={theme.spacing.xl}
      footer={
        <Button
          title={t("home.logMeal")}
          variant="accent"
          size="lg"
          icon="add"
          onPress={() => router.push("/meals/new")}
        />
      }>
      <HomeHeader syncedAt={data?.steps.synced_at ?? null} syncing={syncing} />

      <ListState
        loading={dashboard.isPending}
        error={dashboard.isError ? dashboard.error : undefined}
        onRetry={() => void dashboard.refetch()}>
        {data ? (
          <View style={{ gap: theme.spacing.lg }}>
            {!data.has_profile ? <PlanPrompt onPress={() => router.push("/onboarding")} /> : null}
            <StepsPanel steps={data.steps} group={data.group} />
            {health === "notGranted" || health === "needsUpdate" || health === "unavailable" ? (
              <HealthPrompt state={health} onAllow={() => void requestAccess()} />
            ) : null}
            <HomeExits data={data} date={date} />
          </View>
        ) : null}
      </ListState>
    </Screen>
  );
}
