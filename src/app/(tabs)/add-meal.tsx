import React, { useState, useEffect } from 'react';
import {
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  Keyboard,
  TouchableWithoutFeedback,
} from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import * as Haptics from 'expo-haptics';
import { Ionicons } from '@expo/vector-icons';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { addMeal } from '@/storage/meals';
import { useTheme } from '@/context/ThemeContext';
import { useToast } from '@/context/ToastContext';
import { formatDateArabic, isToday, isYesterday } from '@/utils/date';

type MealType = 'breakfast' | 'lunch' | 'dinner' | 'snack' | 'other';

const MEAL_TYPES: { key: MealType; label: string; icon: keyof typeof Ionicons.glyphMap }[] = [
  { key: 'breakfast', label: 'إفطار', icon: 'sunny-outline' },
  { key: 'lunch', label: 'غداء', icon: 'restaurant-outline' },
  { key: 'dinner', label: 'عشاء', icon: 'moon-outline' },
  { key: 'snack', label: 'سناك', icon: 'cafe-outline' },
  { key: 'other', label: 'أخرى', icon: 'ellipsis-horizontal-outline' },
];

export default function AddMealScreen() {
  const params = useLocalSearchParams<{ date?: string }>();
  const [name, setName] = useState('');
  const [calories, setCalories] = useState('');
  const [protein, setProtein] = useState('');
  const [carbs, setCarbs] = useState('');
  const [fat, setFat] = useState('');
  const [mealType, setMealType] = useState<MealType>('lunch');
  const [mealDate, setMealDate] = useState<Date>(() => {
    if (params.date) {
      const parsed = new Date(params.date);
      if (!isNaN(parsed.getTime())) return parsed;
    }
    return new Date();
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (params.date) {
      const parsed = new Date(params.date);
      if (!isNaN(parsed.getTime())) {
        setMealDate(parsed);
      }
    }
  }, [params.date]);

  const { colors, isDark } = useTheme();
  const toast = useToast();
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const tabBarHeight = 56 + insets.bottom;

  const handleAddMeal = async () => {
    const trimmedName = name.trim();
    const parsedCalories = Number(calories);

    if (!trimmedName || !calories || Number.isNaN(parsedCalories) || parsedCalories <= 0) {
      toast.warning('يرجى إدخال اسم الوجبة وعدد السعرات الحرارية بشكل صحيح');
      return;
    }

    if (trimmedName.length < 2) {
      toast.warning('اسم الوجبة يجب أن يتكون من حرفين على الأقل');
      return;
    }

    setIsSubmitting(true);
    try {
      await addMeal({
        name: trimmedName,
        calories: Math.round(parsedCalories),
        protein: Math.round(Number(protein) || 0),
        carbs: Math.round(Number(carbs) || 0),
        fat: Math.round(Number(fat) || 0),
        meal_type: mealType,
        createdAt: mealDate.toISOString(),
      });

      setName('');
      setCalories('');
      setProtein('');
      setCarbs('');
      setFat('');
      setMealType('lunch');

      toast.success('تمت إضافة الوجبة بنجاح ✅');
      router.push('/(tabs)/meals');
    } catch (err: any) {
      toast.error(err?.message || 'تعذر حفظ الوجبة. حاول مرة أخرى');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <SafeAreaView
      style={[styles.safeArea, { backgroundColor: colors.background }]}
      edges={['top', 'left', 'right']}
    >
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        style={[styles.container, { backgroundColor: colors.background }]}
      >
        <TouchableWithoutFeedback onPress={Keyboard.dismiss} accessible={false}>
          <ScrollView
            contentContainerStyle={[
              styles.scrollContent,
              { paddingBottom: tabBarHeight + 30 },
            ]}
            showsVerticalScrollIndicator={false}
            keyboardShouldPersistTaps="handled"
          >
            <View style={styles.header}>
              <Text style={[styles.title, { color: colors.text }]}>أضف وجبة جديدة</Text>
              <Text style={[styles.subtitle, { color: colors.textSecondary }]}>
                سجّل تفاصيل وجبتك وتوزيع المغذيات الكبرى بدقة
              </Text>
            </View>

            {/* Target Day Selector Card */}
            <View
              style={[
                styles.dateCard,
                {
                  backgroundColor: isDark ? colors.surface : colors.surface,
                  borderColor: colors.border,
                },
              ]}
            >
              <View style={styles.dateCardHeader}>
                <Ionicons name="calendar-outline" size={16} color={colors.primary} />
                <Text style={[styles.dateCardTitle, { color: colors.textSecondary }]}>
                  تاريخ تسجيل الوجبة:
                </Text>
                <Text style={[styles.dateCardVal, { color: colors.primary }]}>
                  {formatDateArabic(mealDate)}
                </Text>
              </View>

              <View style={styles.dateChipRow}>
                <TouchableOpacity
                  style={[
                    styles.dateChip,
                    {
                      backgroundColor: isToday(mealDate)
                        ? colors.primary
                        : isDark
                        ? colors.surfaceElevated
                        : '#F1F5F9',
                      borderColor: isToday(mealDate) ? colors.primary : (isDark ? colors.border : '#E2E8F0'),
                    },
                  ]}
                  onPress={() => {
                    Haptics.selectionAsync().catch(() => {});
                    setMealDate(new Date());
                  }}
                  activeOpacity={0.8}
                >
                  <Ionicons
                    name="today-outline"
                    size={14}
                    color={isToday(mealDate) ? '#0D1117' : colors.textSecondary}
                    style={{ marginLeft: 4 }}
                  />
                  <Text
                    style={[
                      styles.dateChipText,
                      {
                        color: isToday(mealDate) ? '#0D1117' : colors.text,
                        fontWeight: isToday(mealDate) ? '800' : '600',
                      },
                    ]}
                  >
                    اليوم
                  </Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={[
                    styles.dateChip,
                    {
                      backgroundColor: isYesterday(mealDate)
                        ? colors.primary
                        : isDark
                        ? colors.surfaceElevated
                        : '#F1F5F9',
                      borderColor: isYesterday(mealDate) ? colors.primary : (isDark ? colors.border : '#E2E8F0'),
                    },
                  ]}
                  onPress={() => {
                    Haptics.selectionAsync().catch(() => {});
                    const y = new Date();
                    y.setDate(y.getDate() - 1);
                    setMealDate(y);
                  }}
                  activeOpacity={0.8}
                >
                  <Ionicons
                    name="time-outline"
                    size={14}
                    color={isYesterday(mealDate) ? '#0D1117' : colors.textSecondary}
                    style={{ marginLeft: 4 }}
                  />
                  <Text
                    style={[
                      styles.dateChipText,
                      {
                        color: isYesterday(mealDate) ? '#0D1117' : colors.text,
                        fontWeight: isYesterday(mealDate) ? '800' : '600',
                      },
                    ]}
                  >
                    أمس
                  </Text>
                </TouchableOpacity>

                {!isToday(mealDate) && !isYesterday(mealDate) && (
                  <View
                    style={[
                      styles.dateChip,
                      {
                        backgroundColor: colors.primary,
                        borderColor: colors.primary,
                      },
                    ]}
                  >
                    <Ionicons
                      name="calendar-outline"
                      size={14}
                      color="#0D1117"
                      style={{ marginLeft: 4 }}
                    />
                    <Text style={[styles.dateChipText, { color: '#0D1117', fontWeight: '800' }]}>
                      {formatDateArabic(mealDate)}
                    </Text>
                  </View>
                )}
              </View>

              {!isToday(mealDate) && (
                <View
                  style={[
                    styles.pastDateAlert,
                    {
                      backgroundColor: isDark ? 'rgba(245, 158, 11, 0.12)' : 'rgba(217, 119, 6, 0.08)',
                      borderColor: isDark ? 'rgba(245, 158, 11, 0.25)' : 'rgba(217, 119, 6, 0.2)',
                    },
                  ]}
                >
                  <Ionicons name="information-circle-outline" size={15} color={colors.warning} />
                  <Text style={[styles.pastDateAlertText, { color: colors.warning }]}>
                    سيتم إضافة هذه الوجبة إلى سجل {formatDateArabic(mealDate)}
                  </Text>
                </View>
              )}
            </View>

            {/* Meal Info Card */}
            <View
              style={[
                styles.card,
                {
                  backgroundColor: isDark ? colors.surface : colors.surface,
                  borderColor: colors.border,
                },
              ]}
            >
              {/* Meal Name Input */}
              <View style={styles.inputGroup}>
                <Text style={[styles.label, { color: colors.textSecondary }]}>اسم الوجبة</Text>
                <View
                  style={[
                    styles.inputWrapper,
                    {
                      backgroundColor: isDark ? colors.surfaceElevated : colors.surfaceElevated,
                      borderColor: colors.border,
                    },
                  ]}
                >
                  <Ionicons name="restaurant-outline" size={18} color={colors.textSecondary} />
                  <TextInput
                    style={[styles.input, { color: colors.text }]}
                    placeholder="مثال: صدر دجاج مع أرز وخضار"
                    placeholderTextColor={colors.textMuted}
                    value={name}
                    onChangeText={setName}
                    textAlign="right"
                  />
                </View>
              </View>

              {/* Calories Input */}
              <View style={styles.inputGroup}>
                <Text style={[styles.label, { color: colors.textSecondary }]}>
                  السعرات الحرارية (كيلو كالوري)
                </Text>
                <View
                  style={[
                    styles.inputWrapper,
                    {
                      backgroundColor: isDark ? colors.surfaceElevated : colors.surfaceElevated,
                      borderColor: colors.border,
                    },
                  ]}
                >
                  <Ionicons name="flame-outline" size={18} color={colors.primary} />
                  <TextInput
                    style={[styles.input, { color: colors.text }]}
                    placeholder="مثال: 450"
                    placeholderTextColor={colors.textMuted}
                    keyboardType="numeric"
                    value={calories}
                    onChangeText={setCalories}
                    textAlign="right"
                  />
                </View>
              </View>
            </View>

            {/* Meal Type Category Card */}
            <View
              style={[
                styles.card,
                {
                  backgroundColor: colors.surface,
                  borderColor: colors.border,
                },
              ]}
            >
              <Text style={[styles.cardTitle, { color: colors.text }]}>نوع الوجبة</Text>
              <View style={styles.categoryRow}>
                {MEAL_TYPES.map((t) => {
                  const isSelected = mealType === t.key;
                  return (
                    <TouchableOpacity
                      key={t.key}
                      style={[
                        styles.categoryChip,
                        {
                          backgroundColor: isSelected
                            ? colors.primary
                            : isDark
                            ? colors.surfaceElevated
                            : '#F1F5F9',
                          borderColor: isSelected ? colors.primary : colors.border,
                        },
                      ]}
                      onPress={() => {
                        Haptics.selectionAsync().catch(() => {});
                        setMealType(t.key);
                      }}
                      activeOpacity={0.8}
                    >
                      <Ionicons
                        name={t.icon}
                        size={15}
                        color={isSelected ? '#0D1117' : colors.textSecondary}
                        style={{ marginLeft: 4 }}
                      />
                      <Text
                        style={[
                          styles.categoryChipText,
                          {
                            color: isSelected ? '#0D1117' : colors.text,
                            fontWeight: isSelected ? '800' : '600',
                          },
                        ]}
                      >
                        {t.label}
                      </Text>
                    </TouchableOpacity>
                  );
                })}
              </View>
            </View>

            {/* Macros Breakdown Card */}
            <View
              style={[
                styles.card,
                {
                  backgroundColor: isDark ? colors.surface : colors.surface,
                  borderColor: colors.border,
                },
              ]}
            >
              <Text style={[styles.cardTitle, { color: colors.text }]}>
                توزيع المغذيات (اختياري)
              </Text>

              <View style={styles.macrosRow}>
                {/* Protein */}
                <View style={styles.macroCol}>
                  <Text style={[styles.macroLabel, { color: colors.protein }]}>بروتين (غ)</Text>
                  <View
                    style={[
                      styles.macroInputWrapper,
                      {
                        backgroundColor: isDark ? colors.surfaceElevated : colors.surfaceElevated,
                        borderColor: colors.border,
                      },
                    ]}
                  >
                    <TextInput
                      style={[styles.macroInput, { color: colors.text }]}
                      placeholder="0"
                      placeholderTextColor={colors.textMuted}
                      keyboardType="numeric"
                      value={protein}
                      onChangeText={setProtein}
                      textAlign="center"
                    />
                  </View>
                </View>

                {/* Carbs */}
                <View style={styles.macroCol}>
                  <Text style={[styles.macroLabel, { color: colors.carbs }]}>كارب (غ)</Text>
                  <View
                    style={[
                      styles.macroInputWrapper,
                      {
                        backgroundColor: isDark ? colors.surfaceElevated : colors.surfaceElevated,
                        borderColor: colors.border,
                      },
                    ]}
                  >
                    <TextInput
                      style={[styles.macroInput, { color: colors.text }]}
                      placeholder="0"
                      placeholderTextColor={colors.textMuted}
                      keyboardType="numeric"
                      value={carbs}
                      onChangeText={setCarbs}
                      textAlign="center"
                    />
                  </View>
                </View>

                {/* Fat */}
                <View style={styles.macroCol}>
                  <Text style={[styles.macroLabel, { color: colors.fat }]}>دهون (غ)</Text>
                  <View
                    style={[
                      styles.macroInputWrapper,
                      {
                        backgroundColor: isDark ? colors.surfaceElevated : colors.surfaceElevated,
                        borderColor: colors.border,
                      },
                    ]}
                  >
                    <TextInput
                      style={[styles.macroInput, { color: colors.text }]}
                      placeholder="0"
                      placeholderTextColor={colors.textMuted}
                      keyboardType="numeric"
                      value={fat}
                      onChangeText={setFat}
                      textAlign="center"
                    />
                  </View>
                </View>
              </View>
            </View>

            {/* Submit Button */}
            <TouchableOpacity
              style={[
                styles.submitButton,
                { backgroundColor: colors.primary },
                isSubmitting && styles.btnDisabled,
              ]}
              onPress={handleAddMeal}
              disabled={isSubmitting}
              activeOpacity={0.85}
            >
              <Ionicons name="add-circle" size={22} color="#0D1117" style={{ marginLeft: 6 }} />
              <Text style={styles.submitButtonText}>
                {isSubmitting ? 'جاري الحفظ...' : 'إضافة الوجبة إلى يومي'}
              </Text>
            </TouchableOpacity>
          </ScrollView>
        </TouchableWithoutFeedback>
      </KeyboardAvoidingView>
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
    marginBottom: 20,
  },
  title: {
    fontSize: 26,
    fontWeight: '900',
    marginBottom: 4,
    textAlign: 'right',
  },
  subtitle: {
    fontSize: 13,
    lineHeight: 18,
    textAlign: 'right',
  },
  card: {
    borderRadius: 20,
    borderWidth: 1,
    padding: 18,
    marginBottom: 16,
  },
  cardTitle: {
    fontSize: 15,
    fontWeight: '800',
    marginBottom: 14,
    textAlign: 'right',
  },
  inputGroup: {
    marginBottom: 16,
  },
  label: {
    fontSize: 13,
    fontWeight: '700',
    marginBottom: 8,
    textAlign: 'right',
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 14,
    borderWidth: 1,
    paddingHorizontal: 14,
    height: 52,
  },
  input: {
    flex: 1,
    fontSize: 15,
    marginRight: 10,
    fontWeight: '600',
  },
  macrosRow: {
    flexDirection: 'row',
    gap: 12,
  },
  macroCol: {
    flex: 1,
    alignItems: 'center',
  },
  macroLabel: {
    fontSize: 13,
    fontWeight: '700',
    marginBottom: 6,
  },
  macroInputWrapper: {
    width: '100%',
    height: 50,
    borderRadius: 12,
    borderWidth: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  macroInput: {
    fontSize: 16,
    fontWeight: '800',
    width: '100%',
    height: '100%',
  },
  submitButton: {
    flexDirection: 'row',
    height: 56,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 8,
    shadowColor: '#10B981',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 10,
    elevation: 4,
  },
  submitButtonText: {
    color: '#0D1117',
    fontSize: 16,
    fontWeight: '900',
  },
  categoryRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    direction: 'rtl',
  },
  categoryChip: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 9,
    paddingHorizontal: 14,
    borderRadius: 12,
    borderWidth: 1,
  },
  categoryChipText: {
    fontSize: 13,
  },
  btnDisabled: {
    opacity: 0.6,
  },
  dateCard: {
    borderRadius: 18,
    borderWidth: 1,
    padding: 16,
    marginBottom: 16,
  },
  dateCardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 12,
  },
  dateCardTitle: {
    fontSize: 13,
    fontWeight: '600',
  },
  dateCardVal: {
    fontSize: 14,
    fontWeight: '800',
  },
  dateChipRow: {
    flexDirection: 'row',
    gap: 8,
    flexWrap: 'wrap',
  },
  dateChip: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
    paddingHorizontal: 14,
    borderRadius: 12,
    borderWidth: 1,
  },
  dateChipText: {
    fontSize: 13,
    fontWeight: '700',
  },
  pastDateAlert: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginTop: 12,
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 10,
    borderWidth: 1,
  },
  pastDateAlertText: {
    fontSize: 12,
    fontWeight: '600',
  },
});