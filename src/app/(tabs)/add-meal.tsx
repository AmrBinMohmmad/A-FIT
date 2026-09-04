import React, { useState } from 'react';
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
import { useRouter } from 'expo-router';
import * as Haptics from 'expo-haptics';
import { Ionicons } from '@expo/vector-icons';
import { useBottomTabBarHeight } from '@react-navigation/bottom-tabs';
import { SafeAreaView } from 'react-native-safe-area-context';
import { addMeal } from '@/storage/meals';
import { useTheme } from '@/context/ThemeContext';
import { useToast } from '@/context/ToastContext';

export default function AddMealScreen() {
  const [name, setName] = useState('');
  const [calories, setCalories] = useState('');
  const [protein, setProtein] = useState('');
  const [carbs, setCarbs] = useState('');
  const [fat, setFat] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { colors, isDark } = useTheme();
  const toast = useToast();
  const router = useRouter();
  const tabBarHeight = useBottomTabBarHeight();

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
        calories: parsedCalories,
        protein: Number(protein) || 0,
        carbs: Number(carbs) || 0,
        fat: Number(fat) || 0,
      });

      setName('');
      setCalories('');
      setProtein('');
      setCarbs('');
      setFat('');

      toast.success('تمت إضافة الوجبة بنجاح ✅');
      router.push('/(tabs)');
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
  btnDisabled: {
    opacity: 0.6,
  },
});