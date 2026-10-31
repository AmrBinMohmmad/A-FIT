import { Ionicons } from "@expo/vector-icons";
import { useTranslation } from "react-i18next";
import { ActivityIndicator, View } from "react-native";

import { Avatar } from "@/components/Avatar";
import { RText } from "@/components/RText";
import { EMOJI } from "@/constants/emoji";
import { useAuth } from "@/contexts/AuthContext";
import { useLanguage } from "@/contexts/LanguageContext";
import { useTheme } from "@/contexts/ThemeContext";
import { makeStyles } from "@/hooks/useStyles";
import { formatLongDate, formatTime } from "@/utils/date";

const useStyles = makeStyles((theme) => ({
  row: { flexDirection: "row", alignItems: "center", gap: theme.spacing.md },
  roundel: {
    width: 40,
    height: 40,
    borderRadius: theme.radii.full,
    backgroundColor: theme.colors.primary,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 3,
    borderColor: theme.colors.primaryMuted,
  },
  text: { flex: 1 },
  sync: { flexDirection: "row", alignItems: "center", gap: theme.spacing.xs },
}));

/**
 * The station-sign header. Contract adaptation (cited in the surface brief): the roundel
 * carries the brand mark (whose line it is) and the user's name is the station title (where
 * you are); date and last sync complete the sign.
 */
export function HomeHeader({ syncedAt, syncing }: { syncedAt: string | null; syncing: boolean }) {
  const styles = useStyles();
  const { theme } = useTheme();
  const { t } = useTranslation();
  const { language } = useLanguage();
  const { user } = useAuth();

  return (
    <View style={styles.row}>
      {user?.avatar ? (
        <Avatar avatar={user.avatar} name={user.name} size={40} />
      ) : (
        <View style={styles.roundel} accessibilityRole="image" accessibilityLabel={t("common.appName")}>
          <RText variant="callout" weight="bold" color="onPrimary">
            {t("common.brandMark")}
          </RText>
        </View>
      )}
      <View style={styles.text}>
        <RText variant="title" numberOfLines={1}>
          {user?.name ? `${t("home.hello", { name: user.name })} ${EMOJI.wave}` : t("common.appName")}
        </RText>
        <RText variant="footnote" color="textSecondary">
          {formatLongDate(new Date(), language)}
        </RText>
      </View>
      <View style={styles.sync} accessibilityLiveRegion="polite">
        {syncing ? (
          <ActivityIndicator size="small" color={theme.colors.textMuted} />
        ) : (
          <Ionicons name="sync-outline" size={14} color={theme.colors.textMuted} />
        )}
        <RText variant="caption" color="textMuted" tabular>
          {syncedAt
            ? t("common.lastSync", { time: formatTime(syncedAt, language) })
            : t("common.neverSynced")}
        </RText>
      </View>
    </View>
  );
}
