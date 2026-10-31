import { useRouter } from "expo-router";
import { useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import { View } from "react-native";

import { Button } from "@/components/Button";
import { PlanStep } from "@/components/onboarding/PlanStep";
import { ActivityStep, BodyStep, GenderAgeStep, GoalsStep, TargetStep } from "@/components/onboarding/steps";
import { RText } from "@/components/RText";
import { Screen } from "@/components/Screen";
import { useToast } from "@/contexts/ToastContext";
import { useProfile, useSaveProfile } from "@/hooks/profile/useProfile";
import { makeStyles } from "@/hooks/useStyles";
import type { ActivityLevel, Gender } from "@/types/api";
import { computeNutritionPreview } from "@/utils/nutrition";

const TOTAL = 6;

const useStyles = makeStyles((theme) => ({
  progress: { flexDirection: "row", gap: theme.spacing.xs, marginBottom: theme.spacing.sm },
  seg: { flex: 1, height: 4, borderRadius: 2, backgroundColor: theme.colors.track },
  on: { backgroundColor: theme.colors.primary },
  footer: { flexDirection: "row", gap: theme.spacing.sm },
}));

/**
 * The plan wizard (6 stations). Inputs are the user's; the preview mirrors the server
 * formula and the server's answer is what gets stored.
 */
export default function OnboardingScreen() {
  const { t } = useTranslation();
  const styles = useStyles();
  const router = useRouter();
  const toast = useToast();
  const existing = useProfile();
  const save = useSaveProfile();

  const [step, setStep] = useState(1);
  const [gender, setGender] = useState<Gender>(existing.data?.gender ?? "male");
  const [age, setAge] = useState(existing.data?.age ?? 28);
  const [height, setHeight] = useState(existing.data?.height ?? 172);
  const [currentWeight, setCurrentWeight] = useState(existing.data?.current_weight ?? 78);
  const [targetWeight, setTargetWeight] = useState(existing.data?.target_weight ?? 74);
  const [activity, setActivity] = useState<ActivityLevel>(existing.data?.activity_level ?? "moderate");
  const [stepsGoal, setStepsGoal] = useState(existing.data?.daily_steps_goal ?? 10000);
  const [waterGoal, setWaterGoal] = useState(existing.data?.water_goal_ml ?? 2500);

  const preview = useMemo(
    () =>
      computeNutritionPreview({ gender, age, height, currentWeight, targetWeight, activityLevel: activity }),
    [gender, age, height, currentWeight, targetWeight, activity],
  );

  const finish = async () => {
    try {
      const res = await save.mutateAsync({
        gender,
        age,
        height,
        current_weight: currentWeight,
        target_weight: targetWeight,
        activity_level: activity,
        daily_steps_goal: stepsGoal,
        water_goal_ml: waterGoal,
      });
      toast.success(res.data.message);
      router.replace("/(tabs)");
    } catch {
      // The mutation cache already toasted the server message.
    }
  };

  return (
    <Screen
      back
      title={t("onboarding.step", { step, total: TOTAL })}
      footer={
        <View style={styles.footer}>
          {step > 1 ? (
            <Button
              title={t("common.back")}
              variant="secondary"
              onPress={() => setStep((s) => s - 1)}
              style={{ flex: 1 }}
            />
          ) : null}
          {step < TOTAL ? (
            <Button
              title={t("common.continue")}
              onPress={() => setStep((s) => s + 1)}
              style={{ flex: 2 }}
              size="lg"
            />
          ) : (
            <Button
              title={t("onboarding.start")}
              variant="accent"
              onPress={() => void finish()}
              loading={save.isPending}
              style={{ flex: 2 }}
              size="lg"
            />
          )}
        </View>
      }>
      <View
        style={styles.progress}
        accessibilityRole="progressbar"
        accessibilityValue={{ min: 1, max: TOTAL, now: step }}>
        {Array.from({ length: TOTAL }, (_, i) => (
          <View key={i} style={[styles.seg, i < step && styles.on]} />
        ))}
      </View>

      {step === 1 ? <GenderAgeStep gender={gender} age={age} onGender={setGender} onAge={setAge} /> : null}
      {step === 2 ? (
        <BodyStep height={height} weight={currentWeight} onHeight={setHeight} onWeight={setCurrentWeight} />
      ) : null}
      {step === 3 ? (
        <TargetStep
          current={currentWeight}
          target={targetWeight}
          onTarget={setTargetWeight}
          goalType={preview.goalType}
        />
      ) : null}
      {step === 4 ? <ActivityStep value={activity} onChange={setActivity} /> : null}
      {step === 5 ? (
        <GoalsStep
          stepsGoal={stepsGoal}
          waterGoal={waterGoal}
          onSteps={setStepsGoal}
          onWater={setWaterGoal}
        />
      ) : null}
      {step === 6 ? <PlanStep preview={preview} /> : null}

      {step === 6 ? (
        <RText variant="caption" color="textMuted">
          {t("onboarding.previewNote")}
        </RText>
      ) : null}
    </Screen>
  );
}
