import { Ionicons } from "@expo/vector-icons";
import { useTranslation } from "react-i18next";
import { ActivityIndicator, View } from "react-native";

import { Button } from "@/components/Button";
import { RText } from "@/components/RText";
import { useTheme } from "@/contexts/ThemeContext";
import { makeStyles } from "@/hooks/useStyles";
import type { AppError } from "@/types/error";
import { errorMessage, normalizeError } from "@/utils/api/errors";

interface ListStateProps {
  loading?: boolean;
  error?: unknown;
  empty?: boolean;
  emptyTitle?: string;
  emptyBody?: string;
  emptyIcon?: keyof typeof Ionicons.glyphMap;
  /** A friendly glyph instead of the stroke icon. */
  emptyEmoji?: string;
  emptyAction?: React.ReactNode;
  onRetry?: () => void;
  children: React.ReactNode;
}

const useStyles = makeStyles((theme) => ({
  box: {
    paddingVertical: theme.spacing.xxxl,
    alignItems: "center",
    gap: theme.spacing.sm,
    paddingHorizontal: theme.spacing.xl,
  },
  skeletonRow: {
    height: 56,
    borderRadius: theme.radii.md,
    backgroundColor: theme.colors.skeleton,
    marginBottom: theme.spacing.sm,
  },
  icon: {
    width: 56,
    height: 56,
    borderRadius: theme.radii.full,
    backgroundColor: theme.colors.surface,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: theme.spacing.xs,
  },
}));

/** The request-state quartet: skeleton rows, an error with retry, a teaching empty state, or the content. */
export function ListState({
  loading,
  error,
  empty,
  emptyTitle,
  emptyBody,
  emptyIcon = "train-outline",
  emptyEmoji,
  emptyAction,
  onRetry,
  children,
}: ListStateProps) {
  const styles = useStyles();
  const { theme } = useTheme();
  const { t } = useTranslation();

  if (loading) {
    return (
      <View accessibilityRole="progressbar" accessibilityLabel={t("common.loading")}>
        <View style={styles.skeletonRow} />
        <View style={[styles.skeletonRow, { width: "80%" }]} />
        <View style={[styles.skeletonRow, { width: "60%" }]} />
        <ActivityIndicator color={theme.colors.primary} style={{ marginTop: theme.spacing.md }} />
      </View>
    );
  }

  if (error) {
    const appError: AppError = normalizeError(error);
    return (
      <View style={styles.box}>
        <View style={styles.icon}>
          <Ionicons name="alert-circle-outline" size={28} color={theme.colors.danger} />
        </View>
        <RText variant="subtitle" align="center">
          {t("errors.title")}
        </RText>
        <RText variant="footnote" color="textSecondary" align="center">
          {errorMessage(appError, t)}
        </RText>
        {onRetry ? (
          <Button
            title={t("common.retry")}
            variant="secondary"
            onPress={onRetry}
            style={{ marginTop: theme.spacing.sm }}
          />
        ) : null}
      </View>
    );
  }

  if (empty) {
    return (
      <View style={styles.box}>
        <View style={styles.icon}>
          {emptyEmoji ? (
            <RText style={{ fontSize: 28, lineHeight: 34 }}>{emptyEmoji}</RText>
          ) : (
            <Ionicons name={emptyIcon} size={28} color={theme.colors.primary} />
          )}
        </View>
        {emptyTitle ? (
          <RText variant="subtitle" align="center">
            {emptyTitle}
          </RText>
        ) : null}
        {emptyBody ? (
          <RText variant="footnote" color="textSecondary" align="center">
            {emptyBody}
          </RText>
        ) : null}
        {emptyAction}
      </View>
    );
  }

  return <>{children}</>;
}
