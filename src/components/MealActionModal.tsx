import React, { useState, useEffect } from 'react';
import {
  Modal,
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  TouchableWithoutFeedback,
  Keyboard,
  ScrollView,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { useTheme } from '@/context/ThemeContext';
import { useToast } from '@/context/ToastContext';
import { useAlert } from '@/context/AlertContext';
import { updateMeal, deleteMeal, Meal } from '@/storage/meals';
import { FONTS } from '@/styles/global';

interface MealActionModalProps {
  visible: boolean;
  meal: Meal | null;
  onClose: () => void;
  onUpdated: () => void;
  onDeleted: () => void;
}

type MealType = 'breakfast' | 'lunch' | 'dinner' | 'snack' | 'other';

const MEAL_TYPES: { key: MealType; label: string; icon: keyof typeof Ionicons.glyphMap }[] = [
  { key: 'breakfast', label: 'إفطار', icon: 'sunny-outline' },
  { key: 'lunch', label: 'غداء', icon: 'restaurant-outline' },
  { key: 'dinner', label: 'عشاء', icon: 'moon-outline' },
  { key: 'snack', label: 'سناك', icon: 'cafe-outline' },
  { key: 'other', label: 'أخرى', icon: 'ellipsis-horizontal-outline' },
];

type ModalStep = 'options' | 'edit' | 'delete_confirm';

export default function MealActionModal({
  visible,
  meal,
  onClose,
  onUpdated,
  onDeleted,
}: MealActionModalProps) {
  const { colors, isDark } = useTheme();
  const toast = useToast();
  const { showAlert } = useAlert();

  const [step, setStep] = useState<ModalStep>('options');
  const [name, setName] = useState('');
  const [calories, setCalories] = useState('');
  const [protein, setProtein] = useState('');
  const [carbs, setCarbs] = useState('');
  const [fat, setFat] = useState('');
  const [mealType, setMealType] = useState<MealType>('other');
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (meal) {
      setName(meal.name || '');
      setCalories(meal.calories ? String(meal.calories) : '');
      setProtein(meal.protein ? String(meal.protein) : '');
      setCarbs(meal.carbs ? String(meal.carbs) : '');
      setFat(meal.fat ? String(meal.fat) : '');
      setMealType(meal.meal_type || 'other');
      setStep('options');
    }
  }, [meal, visible]);

  if (!meal) return null;

  const handleUpdate = async () => {
    const trimmedName = name.trim();
    const parsedCalories = Number(calories);

    if (!trimmedName) {
      toast.warning('يرجى إدخال اسم الوجبة');
      return;
    }

    if (trimmedName.length < 2) {
      toast.warning('اسم الوجبة يجب أن يتكون من حرفين على الأقل');
      return;
    }

    if (Number.isNaN(parsedCalories) || parsedCalories < 0) {
      toast.warning('يرجى إدخال عدد سعرات صالح');
      return;
    }

    setIsLoading(true);
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(() => {});

    try {
      await updateMeal(meal.id, {
        name: trimmedName,
        calories: Math.round(parsedCalories),
        protein: Math.round(Number(protein) || 0),
        carbs: Math.round(Number(carbs) || 0),
        fat: Math.round(Number(fat) || 0),
        meal_type: mealType,
      });

      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success).catch(() => {});
      toast.success('تم تحديث الوجبة بنجاح');
      onUpdated();
      onClose();
    } catch (err: any) {
      toast.error(err?.message || 'تعذر تحديث الوجبة');
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async () => {
    setIsLoading(true);
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium).catch(() => {});

    try {
      await deleteMeal(meal.id);
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success).catch(() => {});
      toast.success(`تم حذف وجبة "${meal.name}"`);
      onDeleted();
      onClose();
    } catch (err: any) {
      toast.error(err?.message || 'تعذر حذف الوجبة');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onClose}
    >
      <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
        <View
          style={[
            styles.overlay,
            { backgroundColor: isDark ? 'rgba(0, 0, 0, 0.72)' : 'rgba(15, 23, 42, 0.45)' },
          ]}
        >
          <KeyboardAvoidingView
            behavior={Platform.OS === 'ios' ? 'padding' : undefined}
            style={styles.keyboardView}
          >
            <View
              style={[
                styles.modalCard,
                {
                  backgroundColor: colors.surface,
                  borderColor: isDark ? colors.border : '#E2E8F0',
                  shadowColor: isDark ? '#000000' : '#0F172A',
                  shadowOpacity: isDark ? 0.45 : 0.12,
                },
              ]}
            >
              {/* STEP 1: OPTIONS MENU */}
              {step === 'options' && (
                <View style={styles.content}>
                  <View style={styles.mealHeader}>
                    <View
                      style={[
                        styles.mealIconCircle,
                        {
                          backgroundColor: isDark
                            ? 'rgba(16, 185, 129, 0.15)'
                            : 'rgba(5, 150, 105, 0.1)',
                        },
                      ]}
                    >
                      <Ionicons name="restaurant" size={24} color={colors.primary} />
                    </View>
                    <Text style={[styles.mealTitle, { color: colors.text }]} numberOfLines={1}>
                      {meal.name}
                    </Text>
                    <View
                      style={[
                        styles.calorieBadge,
                        {
                          backgroundColor: isDark
                            ? 'rgba(16, 185, 129, 0.12)'
                            : 'rgba(5, 150, 105, 0.1)',
                        },
                      ]}
                    >
                      <Ionicons name="flame" size={14} color={colors.primary} />
                      <Text style={[styles.calorieBadgeText, { color: colors.primary }]}>
                        {meal.calories} سعرة
                      </Text>
                    </View>
                  </View>

                  <View
                    style={[
                      styles.divider,
                      { backgroundColor: isDark ? colors.border : '#F1F5F9' },
                    ]}
                  />

                  {/* Edit Option Button */}
                  <TouchableOpacity
                    style={[
                      styles.actionRow,
                      {
                        backgroundColor: isDark ? colors.surfaceElevated : '#F8FAFC',
                        borderColor: isDark ? colors.border : '#E2E8F0',
                      },
                    ]}
                    onPress={() => {
                      Haptics.selectionAsync().catch(() => {});
                      setStep('edit');
                    }}
                    activeOpacity={0.8}
                  >
                    <View style={styles.actionRight}>
                      <View
                        style={[
                          styles.iconWrap,
                          {
                            backgroundColor: isDark
                              ? 'rgba(59, 130, 246, 0.12)'
                              : 'rgba(37, 99, 235, 0.08)',
                          },
                        ]}
                      >
                        <Ionicons name="pencil" size={18} color={isDark ? '#3B82F6' : '#2563EB'} />
                      </View>
                      <View>
                        <Text style={[styles.actionTitle, { color: colors.text }]}>تعديل الوجبة</Text>
                        <Text style={[styles.actionSub, { color: colors.textSecondary }]}>
                          تغيير الاسم أو السعرات أو المغذيات
                        </Text>
                      </View>
                    </View>
                    <Ionicons name="chevron-back" size={18} color={colors.textMuted} />
                  </TouchableOpacity>

                  {/* Delete Option Button */}
                  <TouchableOpacity
                    style={[
                      styles.actionRow,
                      {
                        backgroundColor: isDark
                          ? 'rgba(239, 68, 68, 0.08)'
                          : 'rgba(220, 38, 38, 0.05)',
                        borderColor: isDark
                          ? 'rgba(239, 68, 68, 0.15)'
                          : 'rgba(220, 38, 38, 0.12)',
                        marginTop: 10,
                      },
                    ]}
                    onPress={() => {
                      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(() => {});
                      onClose();
                      showAlert(
                        'حذف الوجبة',
                        `هل أنت متأكد من رغبتك في حذف وجبة "${meal.name}"؟`,
                        [
                          { text: 'إلغاء', style: 'cancel' },
                          {
                            text: 'حذف الوجبة',
                            style: 'destructive',
                            onPress: async () => {
                              try {
                                await deleteMeal(meal.id);
                                Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success).catch(() => {});
                                toast.success(`تم حذف وجبة "${meal.name}"`);
                                onDeleted();
                              } catch (err: any) {
                                toast.error(err?.message || 'تعذر حذف الوجبة');
                              }
                            },
                          },
                        ]
                      );
                    }}
                    activeOpacity={0.8}
                  >
                    <View style={styles.actionRight}>
                      <View
                        style={[
                          styles.iconWrap,
                          {
                            backgroundColor: isDark
                              ? 'rgba(239, 68, 68, 0.14)'
                              : 'rgba(220, 38, 38, 0.1)',
                          },
                        ]}
                      >
                        <Ionicons name="trash-outline" size={18} color={colors.danger} />
                      </View>
                      <View>
                        <Text style={[styles.actionTitle, { color: colors.danger }]}>حذف الوجبة</Text>
                        <Text style={[styles.actionSub, { color: colors.textSecondary }]}>
                          إزالة الوجبة نهائياً من سجل اليوم
                        </Text>
                      </View>
                    </View>
                    <Ionicons name="chevron-back" size={18} color={colors.danger} />
                  </TouchableOpacity>

                  {/* Cancel Button */}
                  <TouchableOpacity
                    style={[
                      styles.cancelBtn,
                      {
                        backgroundColor: isDark ? 'transparent' : '#F1F5F9',
                        borderColor: isDark ? colors.border : '#E2E8F0',
                      },
                    ]}
                    onPress={onClose}
                    activeOpacity={0.7}
                  >
                    <Text style={[styles.cancelBtnText, { color: colors.textSecondary }]}>إلغاء</Text>
                  </TouchableOpacity>
                </View>
              )}

              {/* STEP 2: EDIT FORM */}
              {step === 'edit' && (
                <ScrollView
                  showsVerticalScrollIndicator={false}
                  keyboardShouldPersistTaps="handled"
                >
                  <View style={styles.headerWithBack}>
                    <TouchableOpacity
                      style={styles.backBtn}
                      onPress={() => setStep('options')}
                      activeOpacity={0.7}
                    >
                      <Ionicons name="arrow-forward" size={20} color={colors.text} />
                    </TouchableOpacity>
                    <Text style={[styles.modalTitle, { color: colors.text }]}>تعديل الوجبة</Text>
                    <View style={{ width: 32 }} />
                  </View>

                  {/* Meal Name Input */}
                  <View style={styles.inputGroup}>
                    <Text style={[styles.inputLabel, { color: colors.textSecondary }]}>اسم الوجبة</Text>
                    <TextInput
                      style={[
                        styles.input,
                        {
                          backgroundColor: colors.surfaceElevated,
                          borderColor: isDark ? colors.border : '#E2E8F0',
                          color: colors.text,
                        },
                      ]}
                      value={name}
                      onChangeText={setName}
                      placeholder="اسم الوجبة"
                      placeholderTextColor={colors.textMuted}
                      textAlign="right"
                    />
                  </View>

                  {/* Calories Input */}
                  <View style={styles.inputGroup}>
                    <Text style={[styles.inputLabel, { color: colors.textSecondary }]}>السعرات الحرارية</Text>
                    <TextInput
                      style={[
                        styles.input,
                        {
                          backgroundColor: colors.surfaceElevated,
                          borderColor: isDark ? colors.border : '#E2E8F0',
                          color: colors.text,
                        },
                      ]}
                      value={calories}
                      onChangeText={setCalories}
                      keyboardType="numeric"
                      placeholder="0"
                      placeholderTextColor={colors.textMuted}
                      textAlign="right"
                    />
                  </View>

                  {/* Macros Row */}
                  <View style={styles.macrosRow}>
                    <View style={styles.macroCol}>
                      <Text style={[styles.macroLabel, { color: colors.protein }]}>بروتين (غ)</Text>
                      <TextInput
                        style={[
                          styles.macroInput,
                          {
                            backgroundColor: colors.surfaceElevated,
                            borderColor: isDark ? colors.border : '#E2E8F0',
                            color: colors.text,
                          },
                        ]}
                        value={protein}
                        onChangeText={setProtein}
                        keyboardType="numeric"
                        placeholder="0"
                        placeholderTextColor={colors.textMuted}
                        textAlign="center"
                      />
                    </View>

                    <View style={styles.macroCol}>
                      <Text style={[styles.macroLabel, { color: colors.carbs }]}>كارب (غ)</Text>
                      <TextInput
                        style={[
                          styles.macroInput,
                          {
                            backgroundColor: colors.surfaceElevated,
                            borderColor: isDark ? colors.border : '#E2E8F0',
                            color: colors.text,
                          },
                        ]}
                        value={carbs}
                        onChangeText={setCarbs}
                        keyboardType="numeric"
                        placeholder="0"
                        placeholderTextColor={colors.textMuted}
                        textAlign="center"
                      />
                    </View>

                    <View style={styles.macroCol}>
                      <Text style={[styles.macroLabel, { color: colors.fat }]}>دهون (غ)</Text>
                      <TextInput
                        style={[
                          styles.macroInput,
                          {
                            backgroundColor: colors.surfaceElevated,
                            borderColor: isDark ? colors.border : '#E2E8F0',
                            color: colors.text,
                          },
                        ]}
                        value={fat}
                        onChangeText={setFat}
                        keyboardType="numeric"
                        placeholder="0"
                        placeholderTextColor={colors.textMuted}
                        textAlign="center"
                      />
                    </View>
                  </View>

                  {/* Meal Type Category */}
                  <View style={styles.inputGroup}>
                    <Text style={[styles.inputLabel, { color: colors.textSecondary }]}>نوع الوجبة</Text>
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
                                borderColor: isSelected ? colors.primary : (isDark ? colors.border : '#E2E8F0'),
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
                              size={14}
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

                  {/* Save Button */}
                  <TouchableOpacity
                    style={[
                      styles.primaryBtn,
                      { backgroundColor: colors.primary },
                      isLoading && styles.btnDisabled,
                    ]}
                    onPress={handleUpdate}
                    disabled={isLoading}
                    activeOpacity={0.85}
                  >
                    {isLoading ? (
                      <ActivityIndicator color={isDark ? '#0D1117' : '#FFFFFF'} />
                    ) : (
                      <Text
                        style={[
                          styles.primaryBtnText,
                          { color: isDark ? '#0D1117' : '#FFFFFF' },
                        ]}
                      >
                        حفظ التعديلات
                      </Text>
                    )}
                  </TouchableOpacity>

                  {/* Cancel Button */}
                  <TouchableOpacity
                    style={[
                      styles.cancelBtn,
                      {
                        backgroundColor: isDark ? 'transparent' : '#F1F5F9',
                        borderColor: isDark ? colors.border : '#E2E8F0',
                      },
                    ]}
                    onPress={() => setStep('options')}
                    activeOpacity={0.7}
                  >
                    <Text style={[styles.cancelBtnText, { color: colors.textSecondary }]}>إلغاء</Text>
                  </TouchableOpacity>
                </ScrollView>
              )}
            </View>
          </KeyboardAvoidingView>
        </View>
      </TouchableWithoutFeedback>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  keyboardView: {
    width: '100%',
    maxWidth: 420,
  },
  modalCard: {
    borderRadius: 24,
    borderWidth: 1,
    padding: 22,
    shadowOffset: { width: 0, height: 8 },
    shadowRadius: 20,
    elevation: 8,
  },
  content: {
    width: '100%',
  },
  mealHeader: {
    alignItems: 'center',
    paddingVertical: 6,
  },
  mealIconCircle: {
    width: 52,
    height: 52,
    borderRadius: 26,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 10,
  },
  mealTitle: {
    fontSize: 18,
    fontWeight: '800',
    fontFamily: FONTS.bold,
    textAlign: 'center',
    marginBottom: 8,
  },
  calorieBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 12,
    paddingVertical: 5,
    borderRadius: 14,
  },
  calorieBadgeText: {
    fontSize: 13,
    fontWeight: '700',
    fontFamily: FONTS.bold,
  },
  divider: {
    height: 1,
    width: '100%',
    marginVertical: 18,
  },
  actionRow: {
    flexDirection: 'row-reverse',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 14,
    borderRadius: 16,
    borderWidth: 1,
  },
  actionRight: {
    flexDirection: 'row-reverse',
    alignItems: 'center',
    gap: 12,
  },
  iconWrap: {
    width: 38,
    height: 38,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  actionTitle: {
    fontSize: 15,
    fontWeight: '700',
    fontFamily: FONTS.bold,
    textAlign: 'right',
  },
  actionSub: {
    fontSize: 12,
    fontFamily: FONTS.regular,
    marginTop: 2,
    textAlign: 'right',
  },
  headerWithBack: {
    flexDirection: 'row-reverse',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 18,
  },
  backBtn: {
    width: 32,
    height: 32,
    alignItems: 'center',
    justifyContent: 'center',
  },
  modalTitle: {
    fontSize: 17,
    fontWeight: '800',
    fontFamily: FONTS.bold,
  },
  inputGroup: {
    marginBottom: 14,
  },
  inputLabel: {
    fontSize: 13,
    fontWeight: '700',
    fontFamily: FONTS.bold,
    marginBottom: 6,
    textAlign: 'right',
  },
  input: {
    height: 48,
    borderRadius: 14,
    borderWidth: 1,
    paddingHorizontal: 14,
    fontSize: 15,
    fontWeight: '600',
    fontFamily: FONTS.regular,
  },
  macrosRow: {
    flexDirection: 'row-reverse',
    gap: 10,
    marginBottom: 20,
  },
  macroCol: {
    flex: 1,
  },
  macroLabel: {
    fontSize: 12,
    fontWeight: '700',
    fontFamily: FONTS.bold,
    marginBottom: 6,
    textAlign: 'center',
  },
  macroInput: {
    height: 46,
    borderRadius: 12,
    borderWidth: 1,
    fontSize: 15,
    fontWeight: '700',
    fontFamily: FONTS.bold,
  },
  primaryBtn: {
    height: 50,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 6,
  },
  primaryBtnText: {
    fontSize: 15,
    fontWeight: '800',
    fontFamily: FONTS.bold,
  },
  deleteConfirmContainer: {
    alignItems: 'center',
    paddingVertical: 10,
  },
  deleteIconCircle: {
    width: 60,
    height: 60,
    borderRadius: 30,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 14,
  },
  deleteTitle: {
    fontSize: 19,
    fontWeight: '800',
    fontFamily: FONTS.bold,
    marginBottom: 8,
    textAlign: 'center',
  },
  deleteMessage: {
    fontSize: 13,
    lineHeight: 20,
    textAlign: 'center',
    marginBottom: 22,
    paddingHorizontal: 8,
    fontFamily: FONTS.regular,
  },
  deleteBtn: {
    width: '100%',
    height: 50,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  deleteBtnText: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '800',
    fontFamily: FONTS.bold,
  },
  cancelBtn: {
    width: '100%',
    height: 46,
    borderRadius: 14,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 10,
  },
  cancelBtnText: {
    fontSize: 14,
    fontWeight: '700',
    fontFamily: FONTS.bold,
  },
  categoryRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    direction: 'rtl',
    marginTop: 4,
  },
  categoryChip: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 12,
    borderWidth: 1,
  },
  categoryChipText: {
    fontSize: 12,
  },
  btnDisabled: {
    opacity: 0.6,
  },
});
