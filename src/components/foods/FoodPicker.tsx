import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { useEffect, useImperativeHandle, useState } from "react";
import { useTranslation } from "react-i18next";
import { Pressable, View } from "react-native";

import { Button } from "@/components/Button";
import { type Chip, Chips } from "@/components/foods/Chips";
import { FoodRow } from "@/components/foods/FoodRow";
import { FoodVariants } from "@/components/foods/FoodVariants";
import { ListState } from "@/components/ListState";
import { RText } from "@/components/RText";
import { RTextInput } from "@/components/RTextInput";
import { EMOJI, FOOD_CATEGORY_EMOJI } from "@/constants/emoji";
import { FOOD_CATEGORIES } from "@/constants/enums";
import { MIN_TOUCH_TARGET } from "@/constants/tokens";
import { useTheme } from "@/contexts/ThemeContext";
import { MIN_QUERY_LENGTH, useFoodSearch, useRecentFoods } from "@/hooks/foods/useFoods";
import { useDebouncedValue } from "@/hooks/useDebouncedValue";
import { makeStyles } from "@/hooks/useStyles";
import type { Food, FoodCategory } from "@/types/api";

export interface FoodPickerHandle {
  /** Leave search mode: clears the query, the aisle and any open kinds. */
  clear: () => void;
}

interface FoodPickerProps {
  ref?: React.Ref<FoodPickerHandle>;
  onPick: (food: Food) => void;
  /** Tells the parent whether results are showing (the basket list hides meanwhile). */
  onActiveChange: (active: boolean) => void;
}

const useStyles = makeStyles((theme) => ({
  wrap: { gap: theme.spacing.sm },
  search: { flexDirection: "row", alignItems: "flex-start", gap: theme.spacing.sm },
  scan: {
    width: MIN_TOUCH_TARGET + 4,
    height: MIN_TOUCH_TARGET + 4,
    borderRadius: theme.radii.md,
    borderWidth: 1,
    borderColor: theme.colors.border,
    alignItems: "center",
    justifyContent: "center",
  },
  head: { flexDirection: "row", justifyContent: "space-between", alignItems: "center" },
}));

/**
 * Search box + aisle chips. Empty → the user's recent foods; typing (2+ chars, debounced)
 * or an aisle → one catalog request per pause; a generic item opens its kinds in place.
 */
export function FoodPicker({ ref, onPick, onActiveChange }: FoodPickerProps) {
  const styles = useStyles();
  const { theme } = useTheme();
  const { t } = useTranslation();
  const router = useRouter();
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState<FoodCategory | null>(null);
  const [openId, setOpenId] = useState<number | null>(null);
  const debounced = useDebouncedValue(query, 400);
  const search = useFoodSearch(debounced, category);
  const recent = useRecentFoods();

  const searching = debounced.trim().length >= MIN_QUERY_LENGTH || category !== null;
  const active = searching || openId !== null || query.trim().length > 0;
  useEffect(() => onActiveChange(active), [active, onActiveChange]);

  const chips: Chip<FoodCategory>[] = FOOD_CATEGORIES.map((c) => ({
    key: c,
    label: t(`enums.foodCategory.${c}`),
    emoji: FOOD_CATEGORY_EMOJI[c],
  }));

  const pick = (food: Food) => {
    if (food.variants_count > 0) {
      setOpenId(food.id);
      return;
    }
    onPick(food);
  };

  const clear = () => {
    setQuery("");
    setCategory(null);
    setOpenId(null);
  };
  useImperativeHandle(ref, () => ({ clear }));

  const list = searching ? search : recent;
  const foods = list.data ?? [];

  return (
    <View style={styles.wrap}>
      <View style={styles.search}>
        <RTextInput
          containerStyle={{ flex: 1 }}
          value={query}
          onChangeText={(v) => {
            setQuery(v);
            setOpenId(null);
          }}
          placeholder={t("foods.searchPlaceholder")}
          returnKeyType="search"
          autoCorrect={false}
          startAdornment={<Ionicons name="search-outline" size={18} color={theme.colors.textMuted} />}
          endAdornment={
            active ? (
              <Pressable
                onPress={clear}
                hitSlop={13}
                accessibilityRole="button"
                accessibilityLabel={t("common.clear")}>
                <Ionicons name="close-circle" size={18} color={theme.colors.textMuted} />
              </Pressable>
            ) : undefined
          }
        />
        <Pressable
          onPress={() => router.push("/foods/scan")}
          style={styles.scan}
          accessibilityRole="button"
          accessibilityLabel={t("foods.scan")}>
          <Ionicons name="barcode-outline" size={24} color={theme.colors.primary} />
        </Pressable>
      </View>
      {openId === null ? (
        <Chips
          items={chips}
          selected={category}
          onSelect={(c) => {
            setCategory(c);
            setOpenId(null);
          }}
        />
      ) : null}

      {openId !== null ? (
        <FoodVariants foodId={openId} onPick={onPick} onBack={() => setOpenId(null)} />
      ) : active || foods.length > 0 ? (
        <View>
          <View style={styles.head}>
            <RText variant="footnote" weight="medium" color="textSecondary">
              {searching ? t("foods.results") : t("foods.recent")}
            </RText>
            <Button
              title={t("foods.addMine")}
              variant="ghost"
              icon="add"
              onPress={() => router.push("/foods/new")}
            />
          </View>
          <RText variant="caption" color="textMuted">
            {t("foods.tapAdds")}
          </RText>
          <ListState
            loading={searching && (list.isPending || list.isPlaceholderData)}
            error={list.isError ? list.error : undefined}
            onRetry={() => void list.refetch()}
            empty={foods.length === 0 && (searching ? !list.isPending : !recent.isPending)}
            emptyEmoji={EMOJI.meals}
            emptyTitle={
              searching ? t("foods.searchEmpty", { q: debounced.trim() }) : t("foods.noRecentTitle")
            }
            emptyBody={searching ? t("foods.searchEmptyHint") : t("foods.noRecent")}>
            <View>
              {foods.map((food, i) => (
                <FoodRow key={food.id} food={food} first={i === 0} onPress={() => pick(food)} />
              ))}
            </View>
          </ListState>
          {searching ? (
            <RText variant="caption" color="textMuted" align="center">
              {t("foods.attribution")}
            </RText>
          ) : null}
        </View>
      ) : (
        <View style={styles.head}>
          <RText variant="caption" color="textMuted" style={{ flex: 1 }}>
            {t("foods.noRecent")}
          </RText>
          <Button
            title={t("foods.addMine")}
            variant="ghost"
            icon="add"
            onPress={() => router.push("/foods/new")}
          />
        </View>
      )}
    </View>
  );
}
