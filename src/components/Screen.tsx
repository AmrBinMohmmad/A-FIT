import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { useTranslation } from "react-i18next";
import {
  Pressable,
  ScrollView,
  View,
  type RefreshControlProps,
  type StyleProp,
  type ViewStyle,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { RText } from "@/components/RText";
import { MIN_TOUCH_TARGET } from "@/constants/tokens";
import { useTheme } from "@/contexts/ThemeContext";
import { makeStyles } from "@/hooks/useStyles";
import { useRTL } from "@/hooks/useRTL";

interface ScreenProps {
  title?: string;
  subtitle?: string;
  back?: boolean;
  /** Right-hand (end-side) header action. */
  action?: React.ReactNode;
  scroll?: boolean;
  refreshControl?: React.ReactElement<RefreshControlProps>;
  contentStyle?: StyleProp<ViewStyle>;
  /** Extra bottom padding, e.g. above a tab bar or a sticky button. */
  bottomInset?: number;
  children: React.ReactNode;
  footer?: React.ReactNode;
  /** Inside the tab navigator the tab bar already owns the bottom safe area. */
  insideTabs?: boolean;
}

const useStyles = makeStyles((theme) => ({
  root: { flex: 1, backgroundColor: theme.colors.background },
  header: {
    flexDirection: "row",
    alignItems: "center",
    gap: theme.spacing.sm,
    paddingHorizontal: theme.spacing.lg,
    paddingBottom: theme.spacing.md,
    minHeight: MIN_TOUCH_TARGET + theme.spacing.md,
  },
  titles: { flex: 1 },
  backBtn: {
    width: MIN_TOUCH_TARGET,
    height: MIN_TOUCH_TARGET,
    alignItems: "center",
    justifyContent: "center",
    marginInlineStart: -theme.spacing.sm,
  },
  content: { paddingHorizontal: theme.spacing.lg, gap: theme.spacing.lg },
  footer: {
    paddingHorizontal: theme.spacing.lg,
    paddingTop: theme.spacing.md,
    borderTopWidth: 1,
    borderTopColor: theme.colors.divider,
    backgroundColor: theme.colors.background,
  },
}));

/**
 * The screen scaffold: safe-area aware, themed, RTL-correct header (large title as a
 * station sign), optional scroll body and a sticky footer. Navigators hide their own headers.
 */
export function Screen({
  title,
  subtitle,
  back,
  action,
  scroll = true,
  refreshControl,
  contentStyle,
  bottomInset = 0,
  children,
  footer,
  insideTabs,
}: ScreenProps) {
  const insets = useSafeAreaInsets();
  const { theme } = useTheme();
  const styles = useStyles();
  const router = useRouter();
  const { t } = useTranslation();
  const { isRTL } = useRTL();

  const header =
    title || back || action ? (
      <View style={styles.header}>
        {back ? (
          <Pressable
            onPress={() => router.back()}
            style={styles.backBtn}
            accessibilityRole="button"
            accessibilityLabel={t("common.back")}
            hitSlop={8}>
            <Ionicons
              name={isRTL ? "chevron-forward" : "chevron-back"}
              size={24}
              color={theme.colors.textPrimary}
            />
          </Pressable>
        ) : null}
        <View style={styles.titles}>
          {title ? <RText variant={back ? "title" : "largeTitle"}>{title}</RText> : null}
          {subtitle ? (
            <RText variant="footnote" color="textSecondary">
              {subtitle}
            </RText>
          ) : null}
        </View>
        {action}
      </View>
    ) : null;

  const body = scroll ? (
    <ScrollView
      style={{ flex: 1 }}
      contentContainerStyle={[
        styles.content,
        { paddingBottom: theme.spacing.xxl + bottomInset },
        contentStyle,
      ]}
      keyboardShouldPersistTaps="handled"
      showsVerticalScrollIndicator={false}
      refreshControl={refreshControl}>
      {children}
    </ScrollView>
  ) : (
    <View style={[{ flex: 1 }, styles.content, { paddingBottom: bottomInset }, contentStyle]}>
      {children}
    </View>
  );

  return (
    <View style={[styles.root, { paddingTop: insets.top + theme.spacing.sm }]}>
      {header}
      {body}
      {footer ? (
        <View
          style={[
            styles.footer,
            { paddingBottom: insideTabs ? theme.spacing.md : Math.max(insets.bottom, theme.spacing.md) },
          ]}>
          {footer}
        </View>
      ) : null}
    </View>
  );
}
