import React from 'react';
import { Meal } from '@/storage/meals';
import { Text, View, StyleSheet, TouchableOpacity } from 'react-native';
import MealItem from './MealItem';
import { useTheme } from '@/context/ThemeContext';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { FONTS } from '@/styles/global';

interface RecentMealsProps {
  meals: Meal[];
  onDelete: () => void;
}

export default function RecentMeals({ meals, onDelete }: RecentMealsProps) {
  const { colors, isDark } = useTheme();
  const router = useRouter();

  return (
    <View style={styles.container}>
      <View style={styles.headerRow}>
        <Text style={[styles.title, { color: colors.text }]}>الوجبات الأخيرة</Text>
        {meals.length > 0 ? (
          <TouchableOpacity
            onPress={() => router.push('/(tabs)/meals')}
            activeOpacity={0.7}
            style={styles.seeAllBtn}
          >
            <Text style={[styles.seeAllText, { color: colors.primary }]}>عرض الكل</Text>
            <Ionicons name="chevron-back" size={14} color={colors.primary} />
          </TouchableOpacity>
        ) : null}
      </View>

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
            name="restaurant-outline"
            size={36}
            color={colors.textMuted}
            style={{ marginBottom: 8 }}
          />
          <Text style={[styles.emptyText, { color: colors.textSecondary }]}>
            لم تسجل أي وجبة اليوم حتى الآن
          </Text>
          <Text style={[styles.emptySubText, { color: colors.textMuted }]}>
            اضغط على "أضف وجبة" لبدء تسجيل سعراتك
          </Text>
        </View>
      ) : (
        meals
          .slice(0, 4)
          .map((meal) => (
            <MealItem
              key={meal.id}
              id={meal.id}
              name={meal.name}
              calories={meal.calories}
              protein={meal.protein}
              carbs={meal.carbs}
              fat={meal.fat}
              onDelete={onDelete}
            />
          ))
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginTop: 10,
    marginBottom: 20,
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 14,
  },
  title: {
    fontSize: 18,
    fontWeight: '800',
    fontFamily: FONTS.bold,
    writingDirection: 'rtl',
  },
  seeAllBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  seeAllText: {
    fontSize: 13,
    fontWeight: '700',
    fontFamily: FONTS.bold,
  },
  emptyCard: {
    borderRadius: 20,
    borderWidth: 1,
    paddingVertical: 32,
    paddingHorizontal: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptyText: {
    fontSize: 15,
    fontWeight: '700',
    fontFamily: FONTS.bold,
    marginBottom: 4,
    textAlign: 'center',
    writingDirection: 'rtl',
  },
  emptySubText: {
    fontSize: 13,
    fontFamily: FONTS.regular,
    textAlign: 'center',
    writingDirection: 'rtl',
  },
});