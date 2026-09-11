import React, { useCallback, useMemo, useState } from 'react';
import {
  ScrollView,
  Text,
  TouchableOpacity,
  View,
  StyleSheet,
  RefreshControl,
  Keyboard,
  TouchableWithoutFeedback,
} from 'react-native';
import { useFocusEffect, useRouter } from 'expo-router';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import * as Haptics from 'expo-haptics';
import { Ionicons } from '@expo/vector-icons';
import MealItem from '@/components/MealItem';
import { clearMealsForDay, getMeals, Meal } from '@/storage/meals';
import { useTheme } from '@/context/ThemeContext';
import { useToast } from '@/context/ToastContext';
import { useAlert } from '@/context/AlertContext';
import { filterMealsByDay, formatDateArabic, isToday } from '@/utils/date';

export default function MealsScreen() {
  const insets = useSafeAreaInsets();
  const [meals, setMeals] = useState<Meal[]>([]);
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [refreshing, setRefreshing] = useState(false);

  const { colors, isDark } = useTheme();
  const toast = useToast();
  const { showAlert } = useAlert();
  const router = useRouter();
  const tabBarHeight = 56 + insets.bottom;

  const loadMeals = async () => {
    const data = await getMeals();
    setMeals(data);
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadMeals();
    setRefreshing(false);
  };

  const isCurrentDay = isToday(selectedDate);

  const filteredMeals = useMemo(
    () => filterMealsByDay(meals, selectedDate),
    [meals, selectedDate]
  );

  const handlePrevDay = () => {
    Haptics.selectionAsync().catch(() => {});
    setSelectedDate((prev) => {
      const next = new Date(prev);
      next.setDate(next.getDate() - 1);
      return next;
    });
  };

  const handleNextDay = () => {
    if (isCurrentDay) return;
    Haptics.selectionAsync().catch(() => {});
    setSelectedDate((prev) => {
      const next = new Date(prev);
      next.setDate(next.getDate() + 1);
      return next;
    });
  };

  const handleResetToToday = () => {
    if (isCurrentDay) return;
    Haptics.selectionAsync().catch(() => {});
    setSelectedDate(new Date());
  };

  const handleClearDayMeals = () => {
    if (filteredMeals.length === 0) return;
    const formattedDate = formatDateArabic(selectedDate);
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning).catch(() => {});
    showAlert(
      `مسح وجبات ${formattedDate}`,
      `هل أنت متأكد من رغبتك في حذف وجبات هذا اليوم فقط (${filteredMeals.length} ${filteredMeals.length === 1 ? 'وجبة' : 'وجبات'})؟ لن تتأثر وجبات باقي الأيام.`,
      [
        { text: 'إلغاء', style: 'cancel' },
        {
          text: 'حذف وجبات اليوم',
          style: 'destructive',
          onPress: async () => {
            try {
              await clearMealsForDay(selectedDate);
              await loadMeals();
              Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success).catch(() => {});
              toast.success(`تم مسح وجبات ${formattedDate} بنجاح`);
            } catch (err: any) {
              toast.error(err?.message || 'تعذر مسح وجبات هذا اليوم');
            }
          },
        },
      ]
    );
  };

  useFocusEffect(
    useCallback(() => {
      loadMeals();
    }, [])
  );

  const totals = useMemo(
    () =>
      filteredMeals.reduce(
        (acc, m) => ({
          calories: acc.calories + (m.calories || 0),
          protein: acc.protein + (m.protein || 0),
          carbs: acc.carbs + (m.carbs || 0),
          fat: acc.fat + (m.fat || 0),
        }),
        { calories: 0, protein: 0, carbs: 0, fat: 0 }
      ),
    [filteredMeals]
  );

  return (
    <SafeAreaView
      style={[styles.safeArea, { backgroundColor: colors.background }]}
      edges={['top', 'left', 'right']}
    >
      <TouchableWithoutFeedback onPress={Keyboard.dismiss} accessible={false}>
        <ScrollView
          style={[styles.container, { backgroundColor: colors.background }]}
          contentContainerStyle={[
            styles.scrollContent,
            { paddingBottom: tabBarHeight + 20 },
          ]}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={onRefresh}
              tintColor={colors.primary}
              colors={[colors.primary]}
            />
          }
        >
          {/* Screen Header */}
          <View style={styles.header}>
            <View>
              <Text style={[styles.title, { color: colors.text }]}>سجل الوجبات</Text>
              <Text style={[styles.subtitle, { color: colors.textSecondary }]}>
                {filteredMeals.length} {filteredMeals.length === 1 ? 'وجبة مسجلة' : 'وجبات مسجلة'} {isCurrentDay ? 'اليوم' : ''}
              </Text>
            </View>

            <TouchableOpacity
              style={[
                styles.addMealHeaderBtn,
                {
                  backgroundColor: colors.primary,
                },
              ]}
              onPress={() => {
                Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium).catch(() => {});
                router.push({
                  pathname: '/(tabs)/add-meal',
                  params: { date: selectedDate.toISOString() },
                });
              }}
              activeOpacity={0.85}
            >
              <Ionicons name="add" size={18} color="#0D1117" />
              <Text style={styles.addMealHeaderBtnText}>
                {isCurrentDay ? 'أضف وجبة' : 'إضافة وجبة'}
              </Text>
            </TouchableOpacity>
          </View>

          {/* Date Navigator Bar */}
          <View
            style={[
              styles.dateBar,
              {
                backgroundColor: isDark ? colors.surface : colors.surface,
                borderColor: colors.border,
              },
            ]}
          >
            {/* Previous Day (Backwards in time) */}
            <TouchableOpacity
              onPress={handlePrevDay}
              style={[
                styles.dateNavBtn,
                { backgroundColor: isDark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.04)' },
              ]}
              activeOpacity={0.7}
              accessibilityLabel="اليوم السابق"
            >
              <Ionicons name="chevron-forward" size={18} color={colors.text} />
            </TouchableOpacity>

            {/* Selected Date Indicator & Reset Button */}
            <TouchableOpacity
              onPress={handleResetToToday}
              style={styles.dateCenterBtn}
              activeOpacity={0.7}
              disabled={isCurrentDay}
            >
              <Ionicons name="calendar-outline" size={16} color={colors.primary} style={{ marginLeft: 6 }} />
              <Text style={[styles.dateLabel, { color: colors.text }]}>
                {formatDateArabic(selectedDate)}
              </Text>
              {!isCurrentDay && (
                <View style={[styles.todayBadge, { backgroundColor: colors.primaryLight }]}>
                  <Text style={[styles.todayBadgeText, { color: colors.primary }]}>اليوم</Text>
                </View>
              )}
            </TouchableOpacity>

            {/* Next Day (Forward in time - disabled if today) */}
            <TouchableOpacity
              onPress={handleNextDay}
              disabled={isCurrentDay}
              style={[
                styles.dateNavBtn,
                { backgroundColor: isDark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.04)' },
                isCurrentDay && { opacity: 0.3 },
              ]}
              activeOpacity={0.7}
              accessibilityLabel="اليوم التالي"
            >
              <Ionicons
                name="chevron-back"
                size={18}
                color={isCurrentDay ? colors.textMuted : colors.text}
              />
            </TouchableOpacity>
          </View>

          {/* Daily Summary Pill Card */}
          {filteredMeals.length > 0 ? (
            <View
              style={[
                styles.summaryCard,
                {
                  backgroundColor: isDark ? colors.surface : colors.surface,
                  borderColor: colors.border,
                },
              ]}
            >
              <View style={styles.summaryItem}>
                <Text style={[styles.summaryLabel, { color: colors.textSecondary }]}>السعرات</Text>
                <Text style={[styles.summaryVal, { color: colors.primary }]}>{totals.calories}</Text>
              </View>
              <View style={[styles.vertDivider, { backgroundColor: colors.border }]} />
              <View style={styles.summaryItem}>
                <Text style={[styles.summaryLabel, { color: colors.textSecondary }]}>البروتين</Text>
                <Text style={[styles.summaryVal, { color: colors.protein }]}>{totals.protein}غ</Text>
              </View>
              <View style={[styles.vertDivider, { backgroundColor: colors.border }]} />
              <View style={styles.summaryItem}>
                <Text style={[styles.summaryLabel, { color: colors.textSecondary }]}>الكارب</Text>
                <Text style={[styles.summaryVal, { color: colors.carbs }]}>{totals.carbs}غ</Text>
              </View>
              <View style={[styles.vertDivider, { backgroundColor: colors.border }]} />
              <View style={styles.summaryItem}>
                <Text style={[styles.summaryLabel, { color: colors.textSecondary }]}>الدهون</Text>
                <Text style={[styles.summaryVal, { color: colors.fat }]}>{totals.fat}غ</Text>
              </View>
            </View>
          ) : null}

          {/* Day Actions / Clear day meals */}
          {filteredMeals.length > 0 && (
            <View style={styles.dayActionsRow}>
              <TouchableOpacity
                style={[
                  styles.clearDayBtn,
                  {
                    backgroundColor: isDark ? 'rgba(248, 81, 73, 0.08)' : 'rgba(220, 38, 38, 0.06)',
                    borderColor: isDark ? 'rgba(248, 81, 73, 0.2)' : 'rgba(220, 38, 38, 0.15)',
                  },
                ]}
                onPress={handleClearDayMeals}
                activeOpacity={0.7}
              >
                <Ionicons name="trash-outline" size={13} color={colors.danger} />
                <Text style={[styles.clearDayBtnText, { color: colors.danger }]}>
                  مسح وجبات هذا اليوم
                </Text>
              </TouchableOpacity>
            </View>
          )}

          {/* Meals List */}
          <View style={styles.listContainer}>
            {filteredMeals.length === 0 ? (
              <View
                style={[
                  styles.emptyCard,
                  {
                    backgroundColor: isDark ? colors.surface : colors.surface,
                    borderColor: colors.border,
                  },
                ]}
              >
                <Ionicons
                  name="nutrition-outline"
                  size={48}
                  color={colors.textMuted}
                  style={{ marginBottom: 12 }}
                />
                <Text style={[styles.emptyTitle, { color: colors.text }]}>
                  {isCurrentDay
                    ? 'لم تسجل أي وجبة حتى الآن اليوم'
                    : `لا توجد وجبات مسجلة في ${formatDateArabic(selectedDate)}`}
                </Text>
                <Text style={[styles.emptySub, { color: colors.textSecondary }]}>
                  {isCurrentDay
                    ? 'اضغط على زر الإضافة لتتبع وجباتك وسعراتك بدقة'
                    : 'هل نسيت تسجيل وجبة في هذا اليوم؟ يمكنك إضافتها الآن بسهولة'}
                </Text>
                <TouchableOpacity
                  style={[styles.emptyActionBtn, { backgroundColor: colors.primary }]}
                  onPress={() => {
                    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium).catch(() => {});
                    router.push({
                      pathname: '/(tabs)/add-meal',
                      params: { date: selectedDate.toISOString() },
                    });
                  }}
                  activeOpacity={0.85}
                >
                  <Ionicons name="add-circle" size={18} color="#0D1117" />
                  <Text style={styles.emptyActionBtnText}>
                    {isCurrentDay ? 'تسجيل أول وجبة اليوم' : '+ إضافة وجبة لهذا اليوم'}
                  </Text>
                </TouchableOpacity>
              </View>
            ) : (
              filteredMeals.map((meal) => (
                <MealItem
                  key={meal.id}
                  id={meal.id}
                  name={meal.name}
                  calories={meal.calories}
                  protein={meal.protein}
                  carbs={meal.carbs}
                  fat={meal.fat}
                  meal_type={meal.meal_type}
                  onDelete={loadMeals}
                  onUpdate={loadMeals}
                />
              ))
            )}
          </View>
        </ScrollView>
      </TouchableWithoutFeedback>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
  },
  container: {
    flex: 1,
  },
  scrollContent: {
    paddingTop: 12,
    paddingHorizontal: 20,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  title: {
    fontSize: 26,
    fontWeight: '900',
    textAlign: 'right',
  },
  subtitle: {
    fontSize: 13,
    marginTop: 2,
    textAlign: 'right',
  },
  addMealHeaderBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 14,
    paddingVertical: 9,
    borderRadius: 14,
  },
  addMealHeaderBtnText: {
    color: '#0D1117',
    fontSize: 13,
    fontWeight: '800',
  },
  dayActionsRow: {
    flexDirection: 'row',
    justifyContent: 'flex-start',
    marginBottom: 12,
  },
  clearDayBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 10,
    borderWidth: 1,
  },
  clearDayBtnText: {
    fontSize: 12,
    fontWeight: '700',
  },
  emptyActionBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 14,
    marginTop: 16,
  },
  emptyActionBtnText: {
    color: '#0D1117',
    fontSize: 14,
    fontWeight: '800',
  },
  summaryCard: {
    flexDirection: 'row',
    borderRadius: 18,
    borderWidth: 1,
    paddingVertical: 14,
    paddingHorizontal: 8,
    marginBottom: 16,
    justifyContent: 'space-around',
    alignItems: 'center',
  },
  summaryItem: {
    alignItems: 'center',
    flex: 1,
  },
  summaryLabel: {
    fontSize: 11,
    fontWeight: '600',
    marginBottom: 4,
  },
  summaryVal: {
    fontSize: 15,
    fontWeight: '900',
  },
  vertDivider: {
    width: 1,
    height: 28,
  },
  listContainer: {
    marginTop: 4,
  },
  emptyCard: {
    borderRadius: 24,
    borderWidth: 1,
    paddingVertical: 44,
    paddingHorizontal: 24,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 20,
  },
  emptyTitle: {
    fontSize: 17,
    fontWeight: '800',
    marginBottom: 6,
    textAlign: 'center',
  },
  emptySub: {
    fontSize: 13,
    textAlign: 'center',
    lineHeight: 20,
    maxWidth: 260,
  },
  dateBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderRadius: 14,
    borderWidth: 1,
    marginBottom: 16,
  },
  dateNavBtn: {
    width: 36,
    height: 36,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  dateCenterBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  dateLabel: {
    fontSize: 14,
    fontWeight: '700',
  },
  todayBadge: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 8,
    marginRight: 6,
  },
  todayBadgeText: {
    fontSize: 11,
    fontWeight: '700',
  },
});