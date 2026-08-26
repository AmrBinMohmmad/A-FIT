import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useTheme } from '@/context/ThemeContext';
import { Ionicons } from '@expo/vector-icons';
import { FONTS } from '@/styles/global';

export interface MacroCardProps {
  label: string;
  value: number;
  goal: number;
  unit?: string;
  color: string;
  iconName?: keyof typeof Ionicons.glyphMap;
}

export default function MacroCard({
  label,
  value,
  goal,
  unit = 'غ',
  color,
  iconName,
}: MacroCardProps) {
  const { colors, isDark } = useTheme();

  const percentage = Math.min(Math.round((value / goal) * 100), 100);

  return (
    <View
      style={[
        styles.card,
        {
          backgroundColor: isDark ? colors.surface : colors.surface,
          borderColor: colors.border,
        },
      ]}
    >
      <View style={styles.headerRow}>
        <View style={styles.labelGroup}>
          {iconName ? (
            <View
              style={[
                styles.iconBox,
                { backgroundColor: `${color}18` },
              ]}
            >
              <Ionicons name={iconName} size={15} color={color} />
            </View>
          ) : null}
          <Text style={[styles.label, { color: colors.textSecondary }]}>{label}</Text>
        </View>

        <View style={styles.valueGroup}>
          <Text style={[styles.value, { color: colors.text }]}>
            {value}
            <Text style={[styles.unit, { color: colors.textSecondary }]}> {unit}</Text>
          </Text>
          <Text style={[styles.goal, { color: colors.textMuted }]}>
            / {goal} {unit}
          </Text>
        </View>
      </View>

      {/* Progress Track Bar */}
      <View
        style={[
          styles.track,
          {
            backgroundColor: isDark
              ? 'rgba(255, 255, 255, 0.06)'
              : 'rgba(0, 0, 0, 0.05)',
          },
        ]}
      >
        <View
          style={[
            styles.fill,
            {
              width: `${percentage}%`,
              backgroundColor: color,
            },
          ]}
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    borderRadius: 16,
    padding: 14,
    borderWidth: 1,
    marginBottom: 10,
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  labelGroup: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  iconBox: {
    width: 28,
    height: 28,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  label: {
    fontSize: 14,
    fontWeight: '700',
    fontFamily: FONTS.bold,
    writingDirection: 'rtl',
  },
  valueGroup: {
    flexDirection: 'row',
    alignItems: 'baseline',
    gap: 4,
  },
  value: {
    fontSize: 15,
    fontWeight: '800',
    fontFamily: FONTS.bold,
  },
  unit: {
    fontSize: 12,
    fontWeight: '500',
    fontFamily: FONTS.regular,
  },
  goal: {
    fontSize: 12,
    fontWeight: '500',
    fontFamily: FONTS.regular,
  },
  track: {
    height: 7,
    borderRadius: 4,
    overflow: 'hidden',
    width: '100%',
  },
  fill: {
    height: '100%',
    borderRadius: 4,
  },
});