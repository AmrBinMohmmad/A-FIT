import { useRouter } from "expo-router";
import { useTranslation } from "react-i18next";
import { RefreshControl, View } from "react-native";

import { Button } from "@/components/Button";
import { GroupRow } from "@/components/groups/GroupRow";
import { ListState } from "@/components/ListState";
import { Screen } from "@/components/Screen";
import { useTheme } from "@/contexts/ThemeContext";
import { useGroups } from "@/hooks/groups/useGroups";
import { makeStyles } from "@/hooks/useStyles";

const useStyles = makeStyles((theme) => ({
  actions: { flexDirection: "row", gap: theme.spacing.sm },
  btn: { flex: 1 },
}));

export default function GroupsScreen() {
  const { t } = useTranslation();
  const { theme } = useTheme();
  const styles = useStyles();
  const router = useRouter();
  const groups = useGroups();

  const actions = (
    <View style={styles.actions}>
      <Button
        title={t("groups.create")}
        variant="accent"
        icon="add"
        onPress={() => router.push("/groups/new")}
        style={styles.btn}
      />
      <Button
        title={t("groups.join")}
        variant="secondary"
        icon="key-outline"
        onPress={() => router.push("/groups/join")}
        style={styles.btn}
      />
    </View>
  );

  return (
    <Screen
      title={t("groups.title")}
      subtitle={t("groups.subtitle")}
      refreshControl={
        <RefreshControl
          refreshing={groups.isRefetching}
          onRefresh={() => void groups.refetch()}
          tintColor={theme.colors.primary}
        />
      }
      footer={actions}>
      <ListState
        loading={groups.isPending}
        error={groups.isError ? groups.error : undefined}
        onRetry={() => void groups.refetch()}
        empty={(groups.data?.length ?? 0) === 0}
        emptyIcon="people-outline"
        emptyTitle={t("groups.emptyTitle")}
        emptyBody={t("groups.emptyBody")}>
        <View>
          {(groups.data ?? []).map((group, i) => (
            <GroupRow
              key={group.id}
              group={group}
              first={i === 0}
              onPress={() => router.push({ pathname: "/groups/[id]", params: { id: String(group.id) } })}
            />
          ))}
        </View>
      </ListState>
    </Screen>
  );
}
