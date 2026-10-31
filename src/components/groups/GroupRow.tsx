import { useTranslation } from "react-i18next";

import { ExitRow } from "@/components/line/ExitRow";
import type { Group } from "@/types/api";

/** A group as a station exit: code chip is the first letter, subtitle is the member count. */
export function GroupRow({ group, onPress, first }: { group: Group; onPress: () => void; first?: boolean }) {
  const { t } = useTranslation();
  return (
    <ExitRow
      first={first}
      code={group.name.trim().charAt(0).toUpperCase() || "•"}
      tone={group.my_role === "owner" ? "accent" : "primary"}
      title={group.name}
      subtitle={`${t("common.members", { count: group.members_count })}${group.my_role === "owner" ? ` · ${t("groups.owner")}` : ""}`}
      onPress={onPress}
    />
  );
}
