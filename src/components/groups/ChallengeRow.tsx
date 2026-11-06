import { useTranslation } from "react-i18next";

import { ExitRow } from "@/components/line/ExitRow";
import type { Challenge } from "@/types/api";
import { formatInt } from "@/utils/number";

/** A challenge as an exit: ordinal code (status carried by tone and the subtitle word), type, remaining days. */
export function ChallengeRow({
  challenge,
  index,
  onPress,
  first,
}: {
  challenge: Challenge;
  index: number;
  onPress: () => void;
  first?: boolean;
}) {
  const { t } = useTranslation();
  const subtitle =
    challenge.status === "ended"
      ? t("challenges.ended", { date: challenge.ends_on })
      : challenge.status === "upcoming"
        ? t("challenges.startsIn", { days: t("common.days", { count: Math.max(0, challenge.days_left) }) })
        : t("challenges.endsIn", { days: t("common.days", { count: challenge.days_left }) });

  return (
    <ExitRow
      first={first}
      code={index + 1}
      tone={challenge.status === "active" ? "accent" : "muted"}
      title={challenge.title}
      subtitle={`${t(`enums.challengeType.${challenge.type}`)} · ${subtitle}`}
      value={challenge.goal_steps ? formatInt(challenge.goal_steps) : undefined}
      valueTone="muted"
      onPress={onPress}
    />
  );
}
