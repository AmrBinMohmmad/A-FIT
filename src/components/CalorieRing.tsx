import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useTheme } from '@/context/ThemeContext';
import { Ionicons } from '@expo/vector-icons';
import { FONTS } from '@/styles/global';

interface CalorieRingProps {
  currentCalories: number;
  goalCalories?: number;
}

export default function CalorieRing({
  currentCalories,
  goalCalories = 2000,
}: CalorieRingProps) {
  const { colors, isDark } = useTheme();

  const percentage = Math.min(Math.round((currentCalories / goalCalories) * 100), 100);
  const remaining = Math.max(goalCalories - currentCalories, 0);

  return (
    <View
      style={[
        styles.card,
        {
          backgroundColor: isDark ? colors.surface : colors.surface,
          borderColor: colors.border,
          shadowColor: colors.primary,
        },
      ]}
    >
      {/* Background radial glow effect */}
      <View
        style={[
          styles.glowBg,
          {
            backgroundColor: isDark ? 'rgba(16, 185, 129, 0.08)' : 'rgba(5, 150, 105, 0.05)',
          },
        ]}
      />

      {/* Main Calorie Display Ring Area */}
      <View style={styles.contentRow}>
        <View style={styles.ringOuter}>
          {/* Outer track circle */}
          <View
            style={[
              styles.ringCircle,
              {
                borderColor: isDark ? 'rgba(255, 255, 255, 0.08)' : 'rgba(0, 0, 0, 0.06)',
                borderTopColor: colors.primary,
                borderRightColor: percentage > 25 ? colors.primary : isDark ? 'rgba(255, 255, 255, 0.08)' : 'rgba(0, 0, 0, 0.06)',
                borderBottomColor: percentage > 50 ? colors.primary : isDark ? 'rgba(255, 255, 255, 0.08)' : 'rgba(0, 0, 0, 0.06)',
                borderLeftColor: percentage > 75 ? colors.primary : isDark ? 'rgba(255, 255, 255, 0.08)' : 'rgba(0, 0, 0, 0.06)',
              },
            ]}
          >
            <View style={styles.ringInner}>
              <Ionicons name="flame" size={24} color={colors.primary} style={{ marginBottom: 2 }} />
              <Text style={[styles.calorieValue, { color: colors.text }]}>
                {currentCalories.toLocaleString()}
              </Text>
              <Text style={[styles.calorieUnit, { color: colors.textSecondary }]}>
                سعرة حرارية
              </Text>
            </View>
          </View>
        </View>

        {/* Target and Stats Info */}
        <View style={styles.infoCol}>
          <View style={styles.infoItem}>
            <Text style={[styles.infoLabel, { color: colors.textSecondary }]}>الهدف اليومي</Text>
            <Text style={[styles.infoValue, { color: colors.text }]}>
              {goalCalories.toLocaleString()} <Text style={styles.subUnit}>سعرة</Text>
            </Text>
          </View>

          <View style={styles.divider} />

          <View style={styles.infoItem}>
            <Text style={[styles.infoLabel, { color: colors.textSecondary }]}>المتبقي</Text>
            <Text
              style={[
                styles.infoValue,
                { color: remaining > 0 ? colors.primary : colors.danger },
              ]}
            >
              {remaining.toLocaleString()} <Text style={styles.subUnit}>سعرة</Text>
            </Text>
          </View>

          {/* Progress Pill */}
          <View
            style={[
              styles.progressPill,
              { backgroundColor: isDark ? 'rgba(16, 185, 129, 0.12)' : 'rgba(5, 150, 105, 0.1)' },
            ]}
          >
            <Ionicons name="trending-up" size={14} color={colors.primary} />
            <Text style={[styles.progressText, { color: colors.primary }]}>
              إنجاز {percentage}%
            </Text>
          </View>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    borderRadius: 24,
    borderWidth: 1,
    padding: 20,
    marginBottom: 20,
    position: 'relative',
    overflow: 'hidden',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.15,
    shadowRadius: 16,
    elevation: 4,
  },
  glowBg: {
    position: 'absolute',
    top: -50,
    right: -50,
    width: 180,
    height: 180,
    borderRadius: 90,
  },
  contentRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 16,
  },
  ringOuter: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  ringCircle: {
    width: 140,
    height: 140,
    borderRadius: 70,
    borderWidth: 10,
    alignItems: 'center',
    justifyContent: 'center',
    transform: [{ rotate: '-45deg' }],
  },
  ringInner: {
    alignItems: 'center',
    justifyContent: 'center',
    transform: [{ rotate: '45deg' }],
  },
  calorieValue: {
    fontSize: 26,
    fontWeight: '900',
    fontFamily: FONTS.bold,
    lineHeight: 30,
  },
  calorieUnit: {
    fontSize: 11,
    fontWeight: '600',
    fontFamily: FONTS.regular,
    marginTop: 2,
    writingDirection: 'rtl',
  },
  infoCol: {
    flex: 1,
    justifyContent: 'center',
  },
  infoItem: {
    marginBottom: 8,
  },
  infoLabel: {
    fontSize: 12,
    fontWeight: '500',
    fontFamily: FONTS.regular,
    marginBottom: 2,
    writingDirection: 'rtl',
  },
  infoValue: {
    fontSize: 18,
    fontWeight: '800',
    fontFamily: FONTS.bold,
    writingDirection: 'rtl',
  },
  subUnit: {
    fontSize: 12,
    fontWeight: '400',
    fontFamily: FONTS.regular,
  },
  divider: {
    height: 1,
    width: '100%',
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    marginVertical: 4,
  },
  progressPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 20,
    marginTop: 4,
    alignSelf: 'flex-start',
  },
  progressText: {
    fontSize: 12,
    fontWeight: '700',
    fontFamily: FONTS.bold,
  },
});
