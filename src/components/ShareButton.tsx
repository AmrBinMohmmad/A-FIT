import React from 'react';
import { Meal } from '@/storage/meals';
import { useTheme } from '@/context/ThemeContext';
import { Ionicons } from '@expo/vector-icons';
import { Share, StyleSheet, TouchableOpacity } from 'react-native';
import * as Haptics from 'expo-haptics';

interface ShareButtonProps {
  meals: Meal[];
}

export default function ShareButton({ meals }: ShareButtonProps) {
  const { colors, isDark } = useTheme();

  const handleShare = async () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium).catch(() => {});

    const totals = meals.reduce(
      (acc, meal) => ({
        calories: acc.calories + (meal.calories || 0),
        protein: acc.protein + (meal.protein || 0),
        carbs: acc.carbs + (meal.carbs || 0),
        fat: acc.fat + (meal.fat || 0),
      }),
      { calories: 0, protein: 0, carbs: 0, fat: 0 }
    );

    const today = new Date().toLocaleDateString('ar-SA', {
      weekday: 'long',
      day: 'numeric',
      month: 'long',
    });

    const shareText = `📊 ملخص تغذيتي ليوم ${today} عبر تطبيق أي-فت (A-FIT):\n\n🔥 السعرات الحرارية: ${totals.calories} سعرة\n💪 البروتين: ${totals.protein} غرام\n🌾 الكربوهيدرات: ${totals.carbs} غرام\n🥑 الدهون الصحية: ${totals.fat} غرام\n\n🍽️ إجمالي الوجبات المسجلة: ${meals.length} وجبة\n#AFIT #صحة #تغذية`;

    await Share.share({
      message: shareText,
    });
  };

  return (
    <TouchableOpacity
      style={[
        styles.button,
        {
          backgroundColor: isDark ? colors.surfaceElevated : colors.surface,
          borderColor: colors.border,
        },
      ]}
      onPress={handleShare}
      activeOpacity={0.7}
    >
      <Ionicons name="share-social-outline" size={20} color={colors.primary} />
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  button: {
    width: 40,
    height: 40,
    borderRadius: 12,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
});