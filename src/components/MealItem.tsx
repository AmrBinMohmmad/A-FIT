import React from 'react';
import { Alert, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { deleteMeal } from '@/storage/meals';
import { useTheme } from '@/context/ThemeContext';
import { useToast } from '@/context/ToastContext';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { FONTS } from '@/styles/global';

interface MealItemProps {
  id: string;
  name: string;
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
  onDelete: () => void;
}

export default function MealItem({
  id,
  name,
  calories,
  protein,
  carbs,
  fat,
  onDelete,
}: MealItemProps) {
  const { colors, isDark } = useTheme();
  const toast = useToast();

  const handleLongPress = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium).catch(() => {});
    Alert.alert('حذف وجبة', `هل أنت متأكد من حذف وجبة "${name}"؟`, [
      { text: 'إلغاء', style: 'cancel' },
      {
        text: 'حذف',
        style: 'destructive',
        onPress: async () => {
          await deleteMeal(id);
          Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success).catch(() => {});
          toast.success(`تم حذف وجبة "${name}"`);
          onDelete();
        },
      },
    ]);
  };

  return (
    <TouchableOpacity
      style={[
        styles.container,
        {
          backgroundColor: isDark ? colors.surface : colors.surface,
          borderColor: colors.border,
        },
      ]}
      onLongPress={handleLongPress}
      activeOpacity={0.85}
    >
      <View style={styles.topRow}>
        <Text style={[styles.name, { color: colors.text }]} numberOfLines={1}>
          {name}
        </Text>
        <View
          style={[
            styles.calorieBadge,
            { backgroundColor: isDark ? 'rgba(16, 185, 129, 0.12)' : 'rgba(5, 150, 105, 0.1)' },
          ]}
        >
          <Ionicons name="flame" size={13} color={colors.primary} />
          <Text style={[styles.calorieText, { color: colors.primary }]}>
            {calories} سعرة
          </Text>
        </View>
      </View>

      <View style={styles.macrosRow}>
        <View
          style={[
            styles.macroPill,
            { backgroundColor: isDark ? 'rgba(59, 130, 246, 0.1)' : 'rgba(37, 99, 235, 0.08)' },
          ]}
        >
          <Text style={[styles.macroPillText, { color: colors.protein }]}>
            بروتين: {protein}غ
          </Text>
        </View>

        <View
          style={[
            styles.macroPill,
            { backgroundColor: isDark ? 'rgba(245, 158, 11, 0.1)' : 'rgba(217, 119, 6, 0.08)' },
          ]}
        >
          <Text style={[styles.macroPillText, { color: colors.carbs }]}>
            كارب: {carbs}غ
          </Text>
        </View>

        <View
          style={[
            styles.macroPill,
            { backgroundColor: isDark ? 'rgba(239, 68, 68, 0.1)' : 'rgba(220, 38, 38, 0.08)' },
          ]}
        >
          <Text style={[styles.macroPillText, { color: colors.fat }]}>
            دهون: {fat}غ
          </Text>
        </View>
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
  },
  topRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
    gap: 8,
  },
  name: {
    fontSize: 16,
    fontWeight: '700',
    fontFamily: FONTS.bold,
    flex: 1,
    writingDirection: 'rtl',
  },
  calorieBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  calorieText: {
    fontSize: 12,
    fontWeight: '700',
    fontFamily: FONTS.bold,
  },
  macrosRow: {
    flexDirection: 'row',
    gap: 8,
    flexWrap: 'wrap',
  },
  macroPill: {
    paddingHorizontal: 9,
    paddingVertical: 3,
    borderRadius: 8,
  },
  macroPillText: {
    fontSize: 12,
    fontWeight: '600',
    fontFamily: FONTS.regular,
    writingDirection: 'rtl',
  },
});