import { Ionicons } from "@expo/vector-icons";
import * as Clipboard from "expo-clipboard";
import * as Linking from "expo-linking";
import { useTranslation } from "react-i18next";
import { Pressable, Share, View } from "react-native";

import { Button } from "@/components/Button";
import { RText } from "@/components/RText";
import { MIN_TOUCH_TARGET } from "@/constants/tokens";
import { useTheme } from "@/contexts/ThemeContext";
import { useToast } from "@/contexts/ToastContext";
import { makeStyles } from "@/hooks/useStyles";
import type { Group } from "@/types/api";

const useStyles = makeStyles((theme) => ({
  card: {
    borderWidth: 1,
    borderColor: theme.colors.border,
    borderRadius: theme.radii.xl,
    padding: theme.spacing.lg,
    gap: theme.spacing.md,
  },
  codeRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: theme.spacing.sm,
    minHeight: MIN_TOUCH_TARGET,
  },
  code: { letterSpacing: 2, flexShrink: 1 },
}));

/** The invite code as a station code: large, copyable on tap, and a full-width share action beneath it. */
export function InviteCard({ group }: { group: Group }) {
  const styles = useStyles();
  const { theme } = useTheme();
  const { t } = useTranslation();
  const toast = useToast();
  const pretty = `${group.invite_code.slice(0, 4)}-${group.invite_code.slice(4)}`;
  const link = Linking.createURL("/groups/join", { queryParams: { code: group.invite_code } });

  const copy = async () => {
    await Clipboard.setStringAsync(group.invite_code);
    toast.info(t("common.copied"));
  };

  const share = () =>
    void Share.share({ message: t("groups.shareMessage", { name: group.name, code: pretty, link }) });

  return (
    <View style={styles.card}>
      <RText variant="footnote" weight="medium" color="textSecondary">
        {t("groups.inviteCode")}
      </RText>
      <Pressable
        onPress={() => void copy()}
        style={styles.codeRow}
        accessibilityRole="button"
        accessibilityLabel={t("common.copy")}>
        <RText variant="title" tabular style={styles.code} numberOfLines={1}>
          {pretty}
        </RText>
        <Ionicons name="copy-outline" size={18} color={theme.colors.textMuted} />
      </Pressable>
      <Button
        title={t("groups.shareInvite")}
        variant="secondary"
        icon="share-social-outline"
        onPress={share}
      />
    </View>
  );
}
