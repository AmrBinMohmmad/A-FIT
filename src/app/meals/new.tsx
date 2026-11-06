import { useLocalSearchParams, useRouter } from "expo-router";
import { useEffect, useState } from "react";
import { View } from "react-native";
import { useTranslation } from "react-i18next";

import { Button } from "@/components/Button";
import { MealComposer } from "@/components/foods/MealComposer";
import { MealForm } from "@/components/MealForm";
import { RText } from "@/components/RText";
import { Screen } from "@/components/Screen";
import { EMOJI } from "@/constants/emoji";
import { useMealDraft } from "@/contexts/MealDraftContext";
import { makeStyles } from "@/hooks/useStyles";
import { useCreateMeal } from "@/hooks/meals/useMeals";
import { todayKey } from "@/utils/date";

const useStyles = makeStyles((theme) => ({
  banner: {
    flexDirection: "row",
    alignItems: "center",
    gap: theme.spacing.sm,
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.sm,
    borderRadius: theme.radii.md,
    backgroundColor: theme.colors.primaryMuted,
  },
}));

/**
 * Log a meal: from catalog foods (default) or by typing the macros. The draft lives on the
 * phone until Save, so backing out and returning picks up where you left off.
 */
export default function NewMealScreen() {
  const { t } = useTranslation();
  const styles = useStyles();
  const router = useRouter();
  const { date } = useLocalSearchParams<{ date?: string }>();
  const create = useCreateMeal();
  const day = date ?? todayKey();
  const draft = useMealDraft();
  const { beginNew, clear, manual: manualDraft } = draft;
  const [manual, setManual] = useState<boolean | null>(null);

  useEffect(() => {
    void beginNew();
  }, [beginNew]);

  // Until the user toggles, a restored draft opens on the form it was typed in.
  const showManual = manual ?? (draft.restored && draft.lines.length === 0 && manualDraft !== null);

  const saved = () => {
    void clear();
    router.back();
  };

  return (
    <Screen
      title={t("meals.newTitle")}
      back
      keyboard
      action={
        <Button
          title={showManual ? t("meals.fromFoods") : t("meals.manual")}
          variant="ghost"
          icon={showManual ? "basket-outline" : "create-outline"}
          onPress={() => setManual(!showManual)}
        />
      }>
      {draft.restored ? (
        <View style={styles.banner}>
          <RText variant="footnote">{EMOJI.sparkle}</RText>
          <RText variant="footnote" weight="medium" style={{ flex: 1 }}>
            {t("meals.draftRestored")}
          </RText>
          <Button title={t("meals.draftDiscard")} variant="ghost" onPress={() => void clear()} />
        </View>
      ) : null}
      {showManual ? (
        <MealForm
          date={day}
          draft={manualDraft}
          onDraftChange={draft.setManual}
          submitting={create.isPending}
          submitLabel={t("common.save")}
          onSubmit={(payload) => create.mutate(payload, { onSuccess: saved })}
        />
      ) : (
        <MealComposer
          date={day}
          submitting={create.isPending}
          onSubmit={(payload) => create.mutate(payload, { onSuccess: saved })}
        />
      )}
    </Screen>
  );
}
