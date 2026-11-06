import { Link } from "expo-router";
import { useTranslation } from "react-i18next";

import { RText } from "@/components/RText";
import { Screen } from "@/components/Screen";

export default function NotFound() {
  const { t } = useTranslation();
  return (
    <Screen title={t("errors.notFound")} back>
      <Link href="/(tabs)" accessibilityRole="link">
        <RText color="primary">{t("tabs.home")}</RText>
      </Link>
    </Screen>
  );
}
