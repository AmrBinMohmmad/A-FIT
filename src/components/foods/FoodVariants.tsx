import { Ionicons } from "@expo/vector-icons";
import { useTranslation } from "react-i18next";
import { Pressable, View } from "react-native";

import { FoodRow } from "@/components/foods/FoodRow";
import { ListState } from "@/components/ListState";
import { RText } from "@/components/RText";
import { EMOJI } from "@/constants/emoji";
import { MIN_TOUCH_TARGET } from "@/constants/tokens";
import { useLanguage } from "@/contexts/LanguageContext";
import { useTheme } from "@/contexts/ThemeContext";
import { useFoodDetail } from "@/hooks/foods/useFoods";
import { makeStyles } from "@/hooks/useStyles";
import { useRTL } from "@/hooks/useRTL";
import type { Food } from "@/types/api";
import { foodName } from "@/utils/foodMath";

const useStyles = makeStyles((theme) => ({
  head: { flexDirection: "row", alignItems: "center", gap: theme.spacing.sm, minHeight: MIN_TOUCH_TARGET },
  back: { width: MIN_TOUCH_TARGET, height: MIN_TOUCH_TARGET, alignItems: "center", justifyContent: "center" },
}));

/** The kinds of one generic item (sizes, brands, preparations), the generic itself first. */
export function FoodVariants({
  foodId,
  onPick,
  onBack,
}: {
  foodId: number;
  onPick: (food: Food) => void;
  onBack: () => void;
}) {
  const styles = useStyles();
  const { theme } = useTheme();
  const { t } = useTranslation();
  const { language } = useLanguage();
  const { isRTL } = useRTL();
  const detail = useFoodDetail(foodId);
  const generic = detail.data ? { ...detail.data.food, variants_count: 0 } : null;

  return (
    <View>
      <View style={styles.head}>
        <Pressable
          onPress={onBack}
          style={styles.back}
          accessibilityRole="button"
          accessibilityLabel={t("foods.backToResults")}>
          <Ionicons
            name={isRTL ? "chevron-forward" : "chevron-back"}
            size={22}
            color={theme.colors.textPrimary}
          />
        </Pressable>
        <RText variant="subtitle" numberOfLines={1} style={{ flex: 1 }}>
          {generic ? foodName(generic, language) : t("common.loading")}
        </RText>
      </View>
      <RText variant="caption" color="textMuted">
        {t("foods.kindsHint")}
      </RText>
      <ListState
        loading={detail.isPending}
        error={detail.isError ? detail.error : undefined}
        onRetry={() => void detail.refetch()}
        empty={!detail.data}
        emptyEmoji={EMOJI.meals}>
        <View>
          {generic ? <FoodRow food={generic} first onPress={() => onPick(generic)} /> : null}
          {(detail.data?.variants ?? []).map((v) => (
            <FoodRow key={v.id} food={{ ...v, variants_count: 0 }} onPress={() => onPick(v)} />
          ))}
        </View>
      </ListState>
    </View>
  );
}
