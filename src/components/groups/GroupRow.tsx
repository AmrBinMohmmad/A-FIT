import { useTranslation } from "react-i18next";

import { Avatar } from "@/components/Avatar";
import { ExitRow } from "@/components/line/ExitRow";
import { EMOJI } from "@/constants/emoji";
import type { Group } from "@/types/api";

/** A group as a station exit: a 👥 roundel leads, the subtitle is the member count. */
export function GroupRow({
  group,
  onPress,
  first,
  index,
}: {
  group: Group;
  onPress: () => void;
  first?: boolean;
  index?: number;
}) {
  const { t } = useTranslation();
  return (
    <ExitRow
      first={first}
      index={index}
      code={group.name.trim().charAt(0).toUpperCase() || "•"}
      leading={
        <Avatar
          name={group.name}
          size={40}
          emoji={EMOJI.group}
          tone={group.my_role === "owner" ? "accent" : "primary"}
        />
      }
      title={group.name}
      subtitle={`${t("common.members", { count: group.members_count })}${group.my_role === "owner" ? ` · ${t("groups.owner")}` : ""}`}
      onPress={onPress}
    />
  );
}
