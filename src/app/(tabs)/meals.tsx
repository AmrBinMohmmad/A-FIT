import React, { useCallback, useState } from 'react';
import {
  Alert,
  ScrollView,
  Text,
  TouchableOpacity,
  View,
  StyleSheet,
  RefreshControl,
  Keyboard,
  TouchableWithoutFeedback,
} from 'react-native';
import { useFocusEffect } from 'expo-router';
import { useBottomTabBarHeight } from '@react-navigation/bottom-tabs';
import { SafeAreaView } from 'react-native-safe-area-context';
import * as Haptics from 'expo-haptics';
import { Ionicons } from '@expo/vector-icons';
import MealItem from '@/components/MealItem';
import { clearAllMeals, getMeals, Meal } from '@/storage/meals';
import { useTheme } from '@/context/ThemeContext';
import { useToast } from '@/context/ToastContext';

export default function MealsScreen() {
  const [meals, setMeals] = useState<Meal[]>([]);
  const [refreshing, setRefreshing] = useState(false);

  const { colors, isDark } = useTheme();
  const toast = useToast();
  const tabBarHeight = useBottomTabBarHeight();

  const loadMeals = async () => {
    const data = await getMeals();
    setMeals(data);
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadMeals();
    setRefreshing(false);
  };

  const handleClearAll = () => {
    if (meals.length === 0) return;

    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning).catch(() => {});
    Alert.alert(
      'مسح جميع الوجبات',
      'هل أنت متأكد من رغبتك في حذف كل وجبات اليوم؟ لا يمكن التراجع عن هذا الإجراء.',
      [
        { text: 'إلغاء', style: 'cancel' },
        {
          text: 'مسح الكل',
          style: 'destructive',
          onPress: async () => {
            await clearAllMeals();
            await loadMeals();
            Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success).catch(() => {});
            toast.success('تم مسح جميع الوجبات بنجاح');
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

  const totals = meals.reduce(
    (acc, m) => ({
      calories: acc.calories + (m.calories || 0),
      protein: acc.protein + (m.protein || 0),
      carbs: acc.carbs + (m.carbs || 0),
      fat: acc.fat + (m.fat || 0),
    }),
    { calories: 0, protein: 0, carbs: 0, fat: 0 }
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
                {meals.length} {meals.length === 1 ? 'وجبة مسجلة' : 'وجبات مسجلة'} اليوم
              </Text>
            </View>

            {meals.length > 0 ? (
              <TouchableOpacity
                style={[
                  styles.clearBtn,
                  {
                    backgroundColor: isDark ? 'rgba(248, 81, 73, 0.12)' : 'rgba(220, 38, 38, 0.1)',
                    borderColor: isDark ? 'rgba(248, 81, 73, 0.25)' : 'rgba(220, 38, 38, 0.2)',
                  },
                ]}
                onPress={handleClearAll}
                activeOpacity={0.7}
              >
                <Ionicons name="trash-outline" size={16} color={colors.danger} />
                <Text style={[styles.clearBtnText, { color: colors.danger }]}>مسح الكل</Text>
              </TouchableOpacity>
            ) : null}
          </View>

          {/* Daily Summary Pill Card */}
          {meals.length > 0 ? (
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

          {/* Meals List */}
          <View style={styles.listContainer}>
            {meals.length === 0 ? (
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
                  لم تسجل أي وجبة حتى الآن
                </Text>
                <Text style={[styles.emptySub, { color: colors.textSecondary }]}>
                  اضغط على تبويب "أضف وجبة" لتتبع سعراتك ومغذياتك بسهولة
                </Text>
              </View>
            ) : (
              meals.map((meal) => (
                <MealItem
                  key={meal.id}
                  id={meal.id}
                  name={meal.name}
                  calories={meal.calories}
                  protein={meal.protein}
                  carbs={meal.carbs}
                  fat={meal.fat}
                  onDelete={loadMeals}
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
  clearBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 12,
    borderWidth: 1,
  },
  clearBtnText: {
    fontSize: 13,
    fontWeight: '700',
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
});