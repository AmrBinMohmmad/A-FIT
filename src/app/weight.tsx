import { useState } from "react";
import { useTranslation } from "react-i18next";
import { KeyboardAvoidingView, Platform, RefreshControl, View } from "react-native";

import { Button } from "@/components/Button";
import { TrendLine } from "@/components/charts/TrendLine";
import { ListState } from "@/components/ListState";
import { ExitRow } from "@/components/line/ExitRow";
import { SignPanel } from "@/components/line/SignPanel";
import { RTextInput } from "@/components/RTextInput";
import { Screen } from "@/components/Screen";
import { useAlert } from "@/contexts/AlertContext";
import { useLanguage } from "@/contexts/LanguageContext";
import { useTheme } from "@/contexts/ThemeContext";
import { useDeleteWeight, useSaveWeight, useWeightHistory } from "@/hooks/body/useWeight";
import { useProfile } from "@/hooks/profile/useProfile";
import { makeStyles } from "@/hooks/useStyles";
import { addDays, formatShortDate, fromDateKey, toDateKey, todayKey } from "@/utils/date";
import { formatDecimal, parseFloatSafe } from "@/utils/number";

const useStyles = makeStyles((theme) => ({
  form: { flexDirection: "row", gap: theme.spacing.sm, alignItems: "flex-end" },
  field: { flex: 1 },
}));

/** Weight trend over the last year with a one-field log; target from the plan as a dashed rule. */
export default function WeightScreen() {
  const { t } = useTranslation();
  const { theme } = useTheme();
  const { language } = useLanguage();
  const styles = useStyles();
  const { confirm } = useAlert();
  const to = todayKey();
  const from = toDateKey(addDays(new Date(), -365));
  const history = useWeightHistory(from, to);
  const profile = useProfile();
  const save = useSaveWeight();
  const remove = useDeleteWeight();
  const [input, setInput] = useState("");
  const [error, setError] = useState<string | undefined>();

  const entries = history.data ?? [];
  const latest = entries[entries.length - 1];
  const first = entries[0];
  const change = latest && first && entries.length > 1 ? latest.weight_kg - first.weight_kg : null;

  const submit = () => {
    const kg = parseFloatSafe(input);
    if (kg === null || kg < 20 || kg > 400) {
      setError(t("weight.invalid"));
      return;
    }
    setError(undefined);
    save.mutate({ date: to, weight_kg: Math.round(kg * 10) / 10 }, { onSuccess: () => setInput("") });
  };

  const onDelete = async (id: number, date: string, kg: number) => {
    const ok = await confirm({
      title: t("weight.deleteConfirmTitle"),
      message: t("weight.deleteConfirmBody", {
        date: formatShortDate(fromDateKey(date), language),
        value: formatDecimal(kg),
      }),
      confirmText: t("common.delete"),
      destructive: true,
    });
    if (ok) remove.mutate(id);
  };

  return (
    <Screen
      title={t("weight.title")}
      back
      refreshControl={
        <RefreshControl
          refreshing={history.isRefetching}
          onRefresh={() => void history.refetch()}
          tintColor={theme.colors.primary}
        />
      }
      footer={
        <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : undefined}>
          <View style={styles.form}>
            <RTextInput
              label={t("weight.label")}
              value={input}
              onChangeText={(v) => {
                setInput(v);
                setError(undefined);
              }}
              error={error}
              keyboardType="decimal-pad"
              placeholder={latest ? formatDecimal(latest.weight_kg) : "75"}
              maxLength={6}
              containerStyle={styles.field}
            />
            <Button title={t("weight.logTitle")} variant="accent" onPress={submit} loading={save.isPending} />
          </View>
        </KeyboardAvoidingView>
      }>
      <ListState
        loading={history.isPending}
        error={history.isError ? history.error : undefined}
        onRetry={() => void history.refetch()}
        empty={entries.length === 0}
        emptyIcon="scale-outline"
        emptyTitle={t("weight.empty")}
        emptyBody={t("weight.emptyBody")}>
        <View style={{ gap: theme.spacing.lg }}>
          {latest ? (
            <SignPanel
              label={t("weight.latest")}
              value={`${formatDecimal(latest.weight_kg)} ${t("common.kg")}`}
              endLabel={
                change !== null && first
                  ? formatShortDate(fromDateKey(first.date), language)
                  : profile.data
                    ? t("common.goal")
                    : undefined
              }
              endValue={
                change !== null
                  ? `${change > 0 ? "+" : ""}${formatDecimal(change)} ${t("common.kg")}`
                  : profile.data
                    ? `${profile.data.target_weight} ${t("common.kg")}`
                    : undefined
              }
              tone={change !== null && change < 0 ? "accent" : "default"}
            />
          ) : null}
          {entries.length > 1 ? (
            <TrendLine
              points={entries.map((e) => ({
                key: e.date,
                label: formatShortDate(fromDateKey(e.date), language),
                value: e.weight_kg,
              }))}
              target={profile.data?.target_weight}
              targetLabel={t("common.goal")}
            />
          ) : null}
          <View>
            {[...entries]
              .reverse()
              .slice(0, 30)
              .map((e, i) => (
                <ExitRow
                  key={e.id}
                  first={i === 0}
                  code={fromDateKey(e.date).getDate()}
                  tone="muted"
                  title={formatShortDate(fromDateKey(e.date), language)}
                  value={`${formatDecimal(e.weight_kg)} ${t("common.kg")}`}
                  onPress={() => void onDelete(e.id, e.date, e.weight_kg)}
                />
              ))}
          </View>
        </View>
      </ListState>
    </Screen>
  );
}
