import { useLocalSearchParams, useRouter } from "expo-router";
import { useState } from "react";
import { useTranslation } from "react-i18next";
import { KeyboardAvoidingView, Platform, View } from "react-native";

import { Button } from "@/components/Button";
import { ChoiceRow } from "@/components/onboarding/ChoiceRow";
import { Stepper } from "@/components/onboarding/Stepper";
import { RText } from "@/components/RText";
import { RTextInput } from "@/components/RTextInput";
import { Screen } from "@/components/Screen";
import { useCreateChallenge } from "@/hooks/challenges/useChallenges";
import { makeStyles } from "@/hooks/useStyles";
import type { ChallengeType } from "@/types/api";
import { addDays, toDateKey } from "@/utils/date";
import { parseIntSafe } from "@/utils/number";

const useStyles = makeStyles((theme) => ({
  form: { gap: theme.spacing.lg },
  types: { gap: theme.spacing.sm },
}));

export default function NewChallengeScreen() {
  const { t } = useTranslation();
  const styles = useStyles();
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id: string }>();
  const groupId = Number(id);
  const create = useCreateChallenge(groupId);
  const [title, setTitle] = useState("");
  const [type, setType] = useState<ChallengeType>("most_steps");
  const [goal, setGoal] = useState("100000");
  const [days, setDays] = useState(7);
  const [errors, setErrors] = useState<{ title?: string; goal?: string }>({});

  const submit = () => {
    const next: typeof errors = {};
    const goalSteps = parseIntSafe(goal);
    if (title.trim().length < 2) next.title = t("challenges.nameInvalid");
    if (type === "target_steps" && (goalSteps === null || goalSteps < 1000))
      next.goal = t("challenges.goalInvalid");
    setErrors(next);
    if (Object.keys(next).length) return;
    const today = new Date();
    create.mutate(
      {
        title: title.trim(),
        type,
        goal_steps: type === "target_steps" ? goalSteps : null,
        starts_on: toDateKey(today),
        ends_on: toDateKey(addDays(today, days - 1)),
      },
      {
        onSuccess: (res) =>
          router.replace({ pathname: "/challenges/[id]", params: { id: String(res.data.data.id) } }),
      },
    );
  };

  return (
    <Screen title={t("challenges.newTitle")} back>
      <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : undefined}>
        <View style={styles.form}>
          <RTextInput
            label={t("challenges.nameLabel")}
            placeholder={t("challenges.namePlaceholder")}
            value={title}
            onChangeText={(v) => {
              setTitle(v);
              setErrors((e) => ({ ...e, title: undefined }));
            }}
            error={errors.title}
            maxLength={80}
            autoFocus
          />
          <RText variant="footnote" weight="medium" color="textSecondary">
            {t("challenges.type")}
          </RText>
          <View style={styles.types}>
            {(["most_steps", "target_steps"] as ChallengeType[]).map((ct) => (
              <ChoiceRow
                key={ct}
                title={t(`enums.challengeType.${ct}`)}
                hint={t(`enums.challengeTypeHint.${ct}`)}
                icon={ct === "most_steps" ? "trending-up-outline" : "flag-outline"}
                selected={type === ct}
                onPress={() => setType(ct)}
              />
            ))}
          </View>
          {type === "target_steps" ? (
            <RTextInput
              label={t("challenges.goalSteps")}
              value={goal}
              onChangeText={(v) => {
                setGoal(v);
                setErrors((e) => ({ ...e, goal: undefined }));
              }}
              error={errors.goal}
              keyboardType="number-pad"
              maxLength={8}
            />
          ) : null}
          <Stepper
            label={t("challenges.duration")}
            unit={t("challenges.durationDays", { count: days })}
            value={days}
            min={1}
            max={90}
            onChange={setDays}
          />
          <RText variant="caption" color="textMuted">
            {t("challenges.windowHint")}
          </RText>
          <Button
            title={t("challenges.create")}
            variant="accent"
            size="lg"
            onPress={submit}
            loading={create.isPending}
          />
        </View>
      </KeyboardAvoidingView>
    </Screen>
  );
}
