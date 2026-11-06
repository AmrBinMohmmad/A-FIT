import { useState } from "react";
import { useTranslation } from "react-i18next";
import { View } from "react-native";

import { Button } from "@/components/Button";
import { RTextInput } from "@/components/RTextInput";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/contexts/ToastContext";

import { ChoiceRow } from "@/components/onboarding/ChoiceRow";
import { RText } from "@/components/RText";
import { Screen } from "@/components/Screen";
import type { ThemeMode } from "@/constants/theme";
import { useLanguage } from "@/contexts/LanguageContext";
import { useTheme } from "@/contexts/ThemeContext";
import { useUpdateMe } from "@/hooks/profile/useProfile";
import { makeStyles } from "@/hooks/useStyles";
import type { AppLanguage } from "@/utils/localization/i18n";

const useStyles = makeStyles((theme) => ({
  section: { gap: theme.spacing.sm },
  nameRow: { flexDirection: "row", gap: theme.spacing.sm, alignItems: "flex-start" },
}));

const MODES: ThemeMode[] = ["system", "light", "dark"];
const LANGS: AppLanguage[] = ["ar", "en"];

/** Appearance (tri-state) and language. Language also updates the server-side locale for e-mails. */
export default function SettingsScreen() {
  const { t } = useTranslation();
  const styles = useStyles();
  const { mode, setMode } = useTheme();
  const { language, setLanguage } = useLanguage();
  const updateMe = useUpdateMe();
  const { user } = useAuth();
  const toast = useToast();
  const [name, setName] = useState(user?.name ?? "");
  const [nameError, setNameError] = useState<string | undefined>();

  const saveName = () => {
    const value = name.trim();
    if (value.length < 2) {
      setNameError(t("auth.nameInvalid"));
      return;
    }
    setNameError(undefined);
    updateMe.mutate({ name: value }, { onSuccess: () => toast.info(t("me.nameSaved")) });
  };

  const pickLanguage = async (lang: AppLanguage) => {
    if (lang === language) return;
    updateMe.mutate({ locale: lang });
    await setLanguage(lang);
  };

  return (
    <Screen title={t("me.appearance")} back>
      <View style={styles.section}>
        <RText variant="footnote" weight="medium" color="textSecondary">
          {t("me.name")}
        </RText>
        <View style={styles.nameRow}>
          <RTextInput
            value={name}
            onChangeText={(v) => {
              setName(v);
              setNameError(undefined);
            }}
            error={nameError}
            maxLength={60}
            containerStyle={{ flex: 1 }}
            accessibilityLabel={t("me.name")}
            returnKeyType="done"
            onSubmitEditing={saveName}
          />
          <Button
            title={t("common.save")}
            onPress={saveName}
            loading={updateMe.isPending}
            disabled={name.trim() === user?.name || name.trim().length < 2}
          />
        </View>
      </View>
      <View style={styles.section}>
        <RText variant="footnote" weight="medium" color="textSecondary">
          {t("me.appearance")}
        </RText>
        {MODES.map((m) => (
          <ChoiceRow
            key={m}
            title={t(`theme.${m}`)}
            icon={m === "dark" ? "moon-outline" : m === "light" ? "sunny-outline" : "phone-portrait-outline"}
            selected={mode === m}
            onPress={(e) => setMode(m, { x: e.nativeEvent.pageX, y: e.nativeEvent.pageY })}
          />
        ))}
      </View>
      <View style={styles.section}>
        <RText variant="footnote" weight="medium" color="textSecondary">
          {t("me.language")}
        </RText>
        {LANGS.map((l) => (
          <ChoiceRow
            key={l}
            title={t(`language.${l}`)}
            icon="language-outline"
            selected={language === l}
            onPress={() => void pickLanguage(l)}
          />
        ))}
        <RText variant="caption" color="textMuted">
          {t("language.restartNote")}
        </RText>
      </View>
    </Screen>
  );
}
