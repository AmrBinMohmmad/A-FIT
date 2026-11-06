import { useTranslation } from "react-i18next";
import { View } from "react-native";

import { SignPanel } from "@/components/line/SignPanel";
import { ChoiceRow } from "@/components/onboarding/ChoiceRow";
import { Stepper } from "@/components/onboarding/Stepper";
import { RText } from "@/components/RText";
import { makeStyles } from "@/hooks/useStyles";
import { ACTIVITY_LEVELS } from "@/constants/enums";
import type { ActivityLevel, Gender, GoalType } from "@/types/api";

const useStyles = makeStyles((theme) => ({
  section: { gap: theme.spacing.lg },
  intro: { gap: theme.spacing.xs },
  twoCol: { flexDirection: "row", gap: theme.spacing.md },
  col: { flex: 1 },
}));

function Intro({ title, subtitle }: { title: string; subtitle: string }) {
  const styles = useStyles();
  return (
    <View style={styles.intro}>
      <RText variant="title">{title}</RText>
      <RText variant="footnote" color="textSecondary">
        {subtitle}
      </RText>
    </View>
  );
}

export function GenderAgeStep(p: {
  gender: Gender;
  age: number;
  onGender: (g: Gender) => void;
  onAge: (a: number) => void;
}) {
  const { t } = useTranslation();
  const styles = useStyles();
  return (
    <View style={styles.section}>
      <Intro title={t("onboarding.genderAgeTitle")} subtitle={t("onboarding.genderAgeSubtitle")} />
      <View style={styles.twoCol}>
        <View style={styles.col}>
          <ChoiceRow
            title={t("enums.gender.male")}
            icon="male-outline"
            selected={p.gender === "male"}
            onPress={() => p.onGender("male")}
          />
        </View>
        <View style={styles.col}>
          <ChoiceRow
            title={t("enums.gender.female")}
            icon="female-outline"
            selected={p.gender === "female"}
            onPress={() => p.onGender("female")}
          />
        </View>
      </View>
      <Stepper
        label={t("onboarding.age")}
        unit={t("onboarding.years")}
        value={p.age}
        min={12}
        max={100}
        onChange={p.onAge}
      />
    </View>
  );
}

export function BodyStep(p: {
  height: number;
  weight: number;
  onHeight: (v: number) => void;
  onWeight: (v: number) => void;
}) {
  const { t } = useTranslation();
  const styles = useStyles();
  return (
    <View style={styles.section}>
      <Intro title={t("onboarding.bodyTitle")} subtitle={t("onboarding.bodySubtitle")} />
      <Stepper
        label={t("onboarding.height")}
        unit={t("onboarding.cm")}
        value={p.height}
        min={100}
        max={250}
        onChange={p.onHeight}
      />
      <Stepper
        label={t("onboarding.currentWeight")}
        unit={t("common.kg")}
        value={p.weight}
        min={30}
        max={300}
        onChange={p.onWeight}
      />
    </View>
  );
}

export function TargetStep(p: {
  current: number;
  target: number;
  onTarget: (v: number) => void;
  goalType: GoalType;
}) {
  const { t } = useTranslation();
  const styles = useStyles();
  const diff = p.target - p.current;
  const title =
    p.goalType === "lose"
      ? t("onboarding.goalLose", { kg: Math.abs(diff) })
      : p.goalType === "gain"
        ? t("onboarding.goalGain", { kg: diff })
        : t("onboarding.goalMaintain");
  const hint =
    p.goalType === "lose"
      ? t("onboarding.goalLoseHint")
      : p.goalType === "gain"
        ? t("onboarding.goalGainHint")
        : t("onboarding.goalMaintainHint");
  return (
    <View style={styles.section}>
      <Intro title={t("onboarding.targetTitle")} subtitle={t("onboarding.targetSubtitle")} />
      <Stepper
        label={t("onboarding.targetWeight")}
        unit={t("common.kg")}
        value={p.target}
        min={30}
        max={300}
        onChange={p.onTarget}
      />
      <SignPanel label={t(`enums.goalType.${p.goalType}`)} value={title} endValue={undefined} />
      <RText variant="footnote" color="textSecondary">
        {hint}
      </RText>
    </View>
  );
}

export function ActivityStep(p: { value: ActivityLevel; onChange: (v: ActivityLevel) => void }) {
  const { t } = useTranslation();
  const styles = useStyles();
  const icons: Record<
    ActivityLevel,
    "desktop-outline" | "walk-outline" | "fitness-outline" | "bicycle-outline" | "flame-outline"
  > = {
    sedentary: "desktop-outline",
    light: "walk-outline",
    moderate: "fitness-outline",
    active: "bicycle-outline",
    extra_active: "flame-outline",
  };
  return (
    <View style={styles.section}>
      <Intro title={t("onboarding.activityTitle")} subtitle={t("onboarding.activitySubtitle")} />
      {ACTIVITY_LEVELS.map((level) => (
        <ChoiceRow
          key={level}
          title={t(`enums.activityLevel.${level}`)}
          hint={t(`enums.activityLevelHint.${level}`)}
          icon={icons[level]}
          selected={p.value === level}
          onPress={() => p.onChange(level)}
        />
      ))}
    </View>
  );
}

export function GoalsStep(p: {
  stepsGoal: number;
  waterGoal: number;
  onSteps: (v: number) => void;
  onWater: (v: number) => void;
}) {
  const { t } = useTranslation();
  const styles = useStyles();
  return (
    <View style={styles.section}>
      <Intro title={t("onboarding.goalsTitle")} subtitle={t("onboarding.goalsSubtitle")} />
      <Stepper
        label={t("onboarding.stepsGoal")}
        unit={t("common.steps")}
        value={p.stepsGoal}
        min={1000}
        max={50000}
        step={500}
        onChange={p.onSteps}
      />
      <Stepper
        label={t("onboarding.waterGoal")}
        unit={t("common.ml")}
        value={p.waterGoal}
        min={500}
        max={8000}
        step={250}
        onChange={p.onWater}
      />
    </View>
  );
}
