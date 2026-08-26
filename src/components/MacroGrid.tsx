import React from 'react';
import { StyleSheet, View } from 'react-native';
import MacroCard from './MacroCard';
import { Meal } from '@/storage/meals';
import { useTheme } from '@/context/ThemeContext';

interface MacroGridProps {
  meals: Meal[];
  goals?: {
    calories: number;
    protein: number;
    carbs: number;
    fat: number;
  };
}

export default function MacroGrid({
  meals,
  goals = { calories: 2000, protein: 150, carbs: 250, fat: 65 },
}: MacroGridProps) {
  const { colors } = useTheme();

  const totals = meals.reduce(
    (acc, meal) => ({
      calories: acc.calories + (meal.calories || 0),
      protein: acc.protein + (meal.protein || 0),
      carbs: acc.carbs + (meal.carbs || 0),
      fat: acc.fat + (meal.fat || 0),
    }),
    { calories: 0, protein: 0, carbs: 0, fat: 0 }
  );

  return (
    <View style={styles.container}>
      <MacroCard
        label="البروتين"
        value={totals.protein}
        goal={goals.protein}
        color={colors.protein}
        iconName="fitness-outline"
      />
      <MacroCard
        label="الكاربوهيدرات"
        value={totals.carbs}
        goal={goals.carbs}
        color={colors.carbs}
        iconName="nutrition-outline"
      />
      <MacroCard
        label="الدهون الصحية"
        value={totals.fat}
        goal={goals.fat}
        color={colors.fat}
        iconName="water-outline"
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginBottom: 16,
  },
});
