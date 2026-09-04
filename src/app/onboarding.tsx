import React, { useState, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  TextInput,
  ActivityIndicator,
} from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { useTheme } from '@/context/ThemeContext';
import { useToast } from '@/context/ToastContext';
import {
  calculateNutritionPlan,
  Gender,
  ActivityLevel,
  ACTIVITY_INFO,
} from '@/utils/nutritionCalculator';
import { profileService } from '@/services/profileService';
import { UserProfile } from '@/storage/profileStorage';

const TOTAL_STEPS = 5;

export default function OnboardingScreen() {
  const router = useRouter();
  const { colors, isDark } = useTheme();
  const toast = useToast();

  const [step, setStep] = useState(1);
  const [submitting, setSubmitting] = useState(false);

  // Form State
  const [gender, setGender] = useState<Gender>('male');
  const [age, setAge] = useState<number>(25);
  const [height, setHeight] = useState<number>(175);
  const [currentWeight, setCurrentWeight] = useState<number>(80);
  const [targetWeight, setTargetWeight] = useState<number>(75);
  const [activityLevel, setActivityLevel] = useState<ActivityLevel>('moderate');

  // Real-time calculated plan
  const plan = useMemo(() => {
    return calculateNutritionPlan({
      gender,
      age: Math.max(12, Math.min(100, age || 25)),
      height: Math.max(100, Math.min(250, height || 170)),
      currentWeight: Math.max(30, Math.min(300, currentWeight || 70)),
      targetWeight: Math.max(30, Math.min(300, targetWeight || 70)),
      activityLevel,
    });
  }, [gender, age, height, currentWeight, targetWeight, activityLevel]);

  const weightDiff = targetWeight - currentWeight;

  const handleNext = () => {
    Haptics.selectionAsync().catch(() => {});
    if (step < TOTAL_STEPS) {
      setStep((prev) => prev + 1);
    } else {
      handleComplete();
    }
  };

  const handleBack = () => {
    Haptics.selectionAsync().catch(() => {});
    if (step > 1) {
      setStep((prev) => prev - 1);
    }
  };

  const handleComplete = async () => {
    setSubmitting(true);
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success).catch(() => {});

    const userProfile: UserProfile = {
      gender,
      age,
      height,
      current_weight: currentWeight,
      target_weight: targetWeight,
      activity_level: activityLevel,
      goal_type: plan.goalType,
      daily_calories: plan.dailyCalories,
      daily_protein: plan.proteinGrams,
      daily_carbs: plan.carbsGrams,
      daily_fat: plan.fatGrams,
    };

    try {
      await profileService.saveProfile(userProfile);
      toast.success('تم إعداد خطتك الغذائية بنجاح!');
      router.replace('/(tabs)');
    } catch (e: any) {
      toast.error('حدث خطأ أثناء حفظ الخطة، حاول مجدداً');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <SafeAreaView style={[styles.safeArea, { backgroundColor: colors.background }]}>
      {/* Header & Progress Bar */}
      <View style={styles.header}>
        {step > 1 ? (
          <TouchableOpacity onPress={handleBack} style={styles.navBtn} activeOpacity={0.7}>
            <Ionicons name="chevron-forward" size={24} color={colors.text} />
          </TouchableOpacity>
        ) : (
          <View style={{ width: 40 }} />
        )}

        <View style={styles.progressContainer}>
          <View style={[styles.progressBarBg, { backgroundColor: colors.border }]}>
            <View
              style={[
                styles.progressBarFill,
                {
                  backgroundColor: colors.primary,
                  width: `${(step / TOTAL_STEPS) * 100}%`,
                },
              ]}
            />
          </View>
          <Text style={[styles.stepText, { color: colors.textSecondary }]}>
            خطوة {step} من {TOTAL_STEPS}
          </Text>
        </View>

        <View style={{ width: 40 }} />
      </View>

      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        {/* STEP 1: GENDER & AGE */}
        {step === 1 && (
          <View style={styles.stepContainer}>
            <Text style={[styles.stepTitle, { color: colors.text }]}>الجنس والعمر</Text>
            <Text style={[styles.stepDesc, { color: colors.textSecondary }]}>
              نحتاج هذه البيانات لحساب معدل الأيض الأساسي (BMR) بدقة علمية.
            </Text>

            <Text style={[styles.fieldLabel, { color: colors.text }]}>اختر الجنس</Text>
            <View style={styles.genderRow}>
              <TouchableOpacity
                style={[
                  styles.genderCard,
                  {
                    backgroundColor: colors.surface,
                    borderColor: gender === 'male' ? colors.primary : colors.border,
                    borderWidth: gender === 'male' ? 2 : 1,
                  },
                ]}
                onPress={() => {
                  Haptics.selectionAsync().catch(() => {});
                  setGender('male');
                }}
                activeOpacity={0.8}
              >
                <Ionicons
                  name="male"
                  size={38}
                  color={gender === 'male' ? colors.primary : colors.textSecondary}
                />
                <Text
                  style={[
                    styles.genderText,
                    { color: gender === 'male' ? colors.primary : colors.text },
                  ]}
                >
                  ذكر
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[
                  styles.genderCard,
                  {
                    backgroundColor: colors.surface,
                    borderColor: gender === 'female' ? colors.primary : colors.border,
                    borderWidth: gender === 'female' ? 2 : 1,
                  },
                ]}
                onPress={() => {
                  Haptics.selectionAsync().catch(() => {});
                  setGender('female');
                }}
                activeOpacity={0.8}
              >
                <Ionicons
                  name="female"
                  size={38}
                  color={gender === 'female' ? colors.primary : colors.textSecondary}
                />
                <Text
                  style={[
                    styles.genderText,
                    { color: gender === 'female' ? colors.primary : colors.text },
                  ]}
                >
                  أنثى
                </Text>
              </TouchableOpacity>
            </View>

            <Text style={[styles.fieldLabel, { color: colors.text, marginTop: 28 }]}>العمر (سنة)</Text>
            <View style={[styles.stepperContainer, { backgroundColor: colors.surface, borderColor: colors.border }]}>
              <TouchableOpacity
                style={styles.stepBtn}
                onPress={() => {
                  Haptics.selectionAsync().catch(() => {});
                  setAge((prev) => Math.max(12, prev - 1));
                }}
              >
                <Ionicons name="remove" size={24} color={colors.text} />
              </TouchableOpacity>

              <View style={styles.valWrapper}>
                <TextInput
                  style={[styles.stepperInput, { color: colors.text }]}
                  keyboardType="number-pad"
                  value={String(age)}
                  onChangeText={(val) => {
                    const num = parseInt(val, 10);
                    if (!isNaN(num)) setAge(num);
                  }}
                  maxLength={3}
                  textAlign="center"
                />
                <Text style={[styles.stepperUnit, { color: colors.textSecondary }]}>سنة</Text>
              </View>

              <TouchableOpacity
                style={styles.stepBtn}
                onPress={() => {
                  Haptics.selectionAsync().catch(() => {});
                  setAge((prev) => Math.min(100, prev + 1));
                }}
              >
                <Ionicons name="add" size={24} color={colors.text} />
              </TouchableOpacity>
            </View>
          </View>
        )}

        {/* STEP 2: HEIGHT & CURRENT WEIGHT */}
        {step === 2 && (
          <View style={styles.stepContainer}>
            <Text style={[styles.stepTitle, { color: colors.text }]}>الطول والوزن الحالي</Text>
            <Text style={[styles.stepDesc, { color: colors.textSecondary }]}>
              يتم استخدامهما لحساب مؤشر كتلة الجسم واحتياجك اليومي من السعرات.
            </Text>

            <Text style={[styles.fieldLabel, { color: colors.text }]}>الطول (سم)</Text>
            <View style={[styles.stepperContainer, { backgroundColor: colors.surface, borderColor: colors.border }]}>
              <TouchableOpacity
                style={styles.stepBtn}
                onPress={() => {
                  Haptics.selectionAsync().catch(() => {});
                  setHeight((prev) => Math.max(100, prev - 1));
                }}
              >
                <Ionicons name="remove" size={24} color={colors.text} />
              </TouchableOpacity>

              <View style={styles.valWrapper}>
                <TextInput
                  style={[styles.stepperInput, { color: colors.text }]}
                  keyboardType="number-pad"
                  value={String(height)}
                  onChangeText={(val) => {
                    const num = parseInt(val, 10);
                    if (!isNaN(num)) setHeight(num);
                  }}
                  maxLength={3}
                  textAlign="center"
                />
                <Text style={[styles.stepperUnit, { color: colors.textSecondary }]}>سم</Text>
              </View>

              <TouchableOpacity
                style={styles.stepBtn}
                onPress={() => {
                  Haptics.selectionAsync().catch(() => {});
                  setHeight((prev) => Math.min(230, prev + 1));
                }}
              >
                <Ionicons name="add" size={24} color={colors.text} />
              </TouchableOpacity>
            </View>

            <Text style={[styles.fieldLabel, { color: colors.text, marginTop: 24 }]}>الوزن الحالي (كغ)</Text>
            <View style={[styles.stepperContainer, { backgroundColor: colors.surface, borderColor: colors.border }]}>
              <TouchableOpacity
                style={styles.stepBtn}
                onPress={() => {
                  Haptics.selectionAsync().catch(() => {});
                  setCurrentWeight((prev) => Math.max(30, prev - 1));
                }}
              >
                <Ionicons name="remove" size={24} color={colors.text} />
              </TouchableOpacity>

              <View style={styles.valWrapper}>
                <TextInput
                  style={[styles.stepperInput, { color: colors.text }]}
                  keyboardType="number-pad"
                  value={String(currentWeight)}
                  onChangeText={(val) => {
                    const num = parseInt(val, 10);
                    if (!isNaN(num)) setCurrentWeight(num);
                  }}
                  maxLength={3}
                  textAlign="center"
                />
                <Text style={[styles.stepperUnit, { color: colors.textSecondary }]}>كغ</Text>
              </View>

              <TouchableOpacity
                style={styles.stepBtn}
                onPress={() => {
                  Haptics.selectionAsync().catch(() => {});
                  setCurrentWeight((prev) => Math.min(250, prev + 1));
                }}
              >
                <Ionicons name="add" size={24} color={colors.text} />
              </TouchableOpacity>
            </View>
          </View>
        )}

        {/* STEP 3: TARGET WEIGHT & GOAL */}
        {step === 3 && (
          <View style={styles.stepContainer}>
            <Text style={[styles.stepTitle, { color: colors.text }]}>الوزن المستهدف</Text>
            <Text style={[styles.stepDesc, { color: colors.textSecondary }]}>
              حدد الوزن الذي تسعى للوصول إليه لنحدد لك العجز أو الفائض المناسب.
            </Text>

            <Text style={[styles.fieldLabel, { color: colors.text }]}>الوزن المستهدف (كغ)</Text>
            <View style={[styles.stepperContainer, { backgroundColor: colors.surface, borderColor: colors.border }]}>
              <TouchableOpacity
                style={styles.stepBtn}
                onPress={() => {
                  Haptics.selectionAsync().catch(() => {});
                  setTargetWeight((prev) => Math.max(30, prev - 1));
                }}
              >
                <Ionicons name="remove" size={24} color={colors.text} />
              </TouchableOpacity>

              <View style={styles.valWrapper}>
                <TextInput
                  style={[styles.stepperInput, { color: colors.text }]}
                  keyboardType="number-pad"
                  value={String(targetWeight)}
                  onChangeText={(val) => {
                    const num = parseInt(val, 10);
                    if (!isNaN(num)) setTargetWeight(num);
                  }}
                  maxLength={3}
                  textAlign="center"
                />
                <Text style={[styles.stepperUnit, { color: colors.textSecondary }]}>كغ</Text>
              </View>

              <TouchableOpacity
                style={styles.stepBtn}
                onPress={() => {
                  Haptics.selectionAsync().catch(() => {});
                  setTargetWeight((prev) => Math.min(250, prev + 1));
                }}
              >
                <Ionicons name="add" size={24} color={colors.text} />
              </TouchableOpacity>
            </View>

            {/* Goal feedback badge */}
            <View
              style={[
                styles.goalBadge,
                {
                  backgroundColor:
                    weightDiff < 0
                      ? 'rgba(59, 130, 246, 0.12)'
                      : weightDiff > 0
                      ? 'rgba(16, 185, 129, 0.12)'
                      : 'rgba(148, 163, 184, 0.12)',
                  borderColor:
                    weightDiff < 0
                      ? 'rgba(59, 130, 246, 0.3)'
                      : weightDiff > 0
                      ? 'rgba(16, 185, 129, 0.3)'
                      : 'rgba(148, 163, 184, 0.3)',
                },
              ]}
            >
              <Ionicons
                name={weightDiff < 0 ? 'trending-down' : weightDiff > 0 ? 'trending-up' : 'remove-outline'}
                size={22}
                color={weightDiff < 0 ? colors.primary : weightDiff > 0 ? '#10B981' : colors.textSecondary}
              />
              <View style={{ flex: 1, marginRight: 8 }}>
                <Text style={[styles.goalBadgeTitle, { color: colors.text }]}>
                  {weightDiff < 0
                    ? `خسارة وزن (${Math.abs(weightDiff)} كغ)`
                    : weightDiff > 0
                    ? `زيادة وزن / بناء عضلات (+${weightDiff} كغ)`
                    : 'المحافظة على الوزن الحالي'}
                </Text>
                <Text style={[styles.goalBadgeSub, { color: colors.textSecondary }]}>
                  {weightDiff < 0
                    ? 'سيتم ضبط عجز سعرات حراري صحي وآمن لحرق الدهون.'
                    : weightDiff > 0
                    ? 'سيتم إضافة فائض سعرات مدروس لبناء الكتلة العضلية.'
                    : 'سيتم ضبط السعرات لتثبيت وزنك ومستويات طاقتك.'}
                </Text>
              </View>
            </View>
          </View>
        )}

        {/* STEP 4: ACTIVITY LEVEL */}
        {step === 4 && (
          <View style={styles.stepContainer}>
            <Text style={[styles.stepTitle, { color: colors.text }]}>مستوى النشاط البدني</Text>
            <Text style={[styles.stepDesc, { color: colors.textSecondary }]}>
              يحدد النشاط البدني معدل استهلاك الطاقة اليومي (TDEE).
            </Text>

            {(Object.keys(ACTIVITY_INFO) as ActivityLevel[]).map((key) => {
              const item = ACTIVITY_INFO[key];
              const isSelected = activityLevel === key;

              return (
                <TouchableOpacity
                  key={key}
                  style={[
                    styles.activityCard,
                    {
                      backgroundColor: colors.surface,
                      borderColor: isSelected ? colors.primary : colors.border,
                      borderWidth: isSelected ? 2 : 1,
                    },
                  ]}
                  onPress={() => {
                    Haptics.selectionAsync().catch(() => {});
                    setActivityLevel(key);
                  }}
                  activeOpacity={0.8}
                >
                  <View
                    style={[
                      styles.activityIconBox,
                      {
                        backgroundColor: isSelected
                          ? colors.primaryLight
                          : isDark
                          ? 'rgba(255,255,255,0.06)'
                          : 'rgba(0,0,0,0.04)',
                      },
                    ]}
                  >
                    <Ionicons
                      name={item.icon as any}
                      size={24}
                      color={isSelected ? colors.primary : colors.textSecondary}
                    />
                  </View>
                  <View style={styles.activityInfo}>
                    <Text
                      style={[
                        styles.activityTitle,
                        { color: isSelected ? colors.primary : colors.text },
                      ]}
                    >
                      {item.label}
                    </Text>
                    <Text style={[styles.activitySub, { color: colors.textSecondary }]}>
                      {item.description}
                    </Text>
                  </View>
                  {isSelected && (
                    <Ionicons name="checkmark-circle" size={22} color={colors.primary} />
                  )}
                </TouchableOpacity>
              );
            })}
          </View>
        )}

        {/* STEP 5: CALCULATED PLAN PREVIEW (KALEE STYLE) */}
        {step === 5 && (
          <View style={styles.stepContainer}>
            <Text style={[styles.stepTitle, { color: colors.text }]}>خطتك الغذائية المحسوبة</Text>
            <Text style={[styles.stepDesc, { color: colors.textSecondary }]}>
              بناءً على قياساتك ومستوى نشاطك، إليك أهدافك اليومية الدقيقة:
            </Text>

            {/* Hero Calorie Card */}
            <View
              style={[
                styles.heroPlanCard,
                {
                  backgroundColor: colors.surface,
                  borderColor: colors.border,
                },
              ]}
            >
              <View style={styles.heroPlanHeader}>
                <Ionicons name="flame" size={28} color="#F59E0B" />
                <Text style={[styles.heroPlanLabel, { color: colors.textSecondary }]}>
                  احتياجك اليومي من السعرات
                </Text>
              </View>

              <Text style={[styles.heroPlanCalories, { color: colors.primary }]}>
                {plan.dailyCalories.toLocaleString()}
                <Text style={[styles.heroPlanUnit, { color: colors.textSecondary }]}> سعرة / يوم</Text>
              </Text>

              <View style={styles.bmrPillsRow}>
                <View style={[styles.pill, { backgroundColor: isDark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.04)' }]}>
                  <Text style={[styles.pillText, { color: colors.textSecondary }]}>
                    الأيض الأساسي (BMR): {plan.bmr}
                  </Text>
                </View>
                <View style={[styles.pill, { backgroundColor: isDark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.04)' }]}>
                  <Text style={[styles.pillText, { color: colors.textSecondary }]}>
                    معدل الحرق (TDEE): {plan.tdee}
                  </Text>
                </View>
              </View>
            </View>

            {/* Macro Breakdown Cards */}
            <Text style={[styles.fieldLabel, { color: colors.text, marginTop: 20 }]}>
              توزيع المغذيات الكبرى المستهدفة
            </Text>

            <View style={styles.macrosRow}>
              {/* Protein */}
              <View style={[styles.macroBox, { backgroundColor: colors.surface, borderColor: colors.border }]}>
                <View style={[styles.macroDot, { backgroundColor: colors.protein }]} />
                <Text style={[styles.macroVal, { color: colors.protein }]}>{plan.proteinGrams}غ</Text>
                <Text style={[styles.macroName, { color: colors.textSecondary }]}>البروتين</Text>
              </View>

              {/* Carbs */}
              <View style={[styles.macroBox, { backgroundColor: colors.surface, borderColor: colors.border }]}>
                <View style={[styles.macroDot, { backgroundColor: colors.carbs }]} />
                <Text style={[styles.macroVal, { color: colors.carbs }]}>{plan.carbsGrams}غ</Text>
                <Text style={[styles.macroName, { color: colors.textSecondary }]}>الكاربوهيدرات</Text>
              </View>

              {/* Fat */}
              <View style={[styles.macroBox, { backgroundColor: colors.surface, borderColor: colors.border }]}>
                <View style={[styles.macroDot, { backgroundColor: colors.fat }]} />
                <Text style={[styles.macroVal, { color: colors.fat }]}>{plan.fatGrams}غ</Text>
                <Text style={[styles.macroName, { color: colors.textSecondary }]}>الدهون الصحية</Text>
              </View>
            </View>
          </View>
        )}
      </ScrollView>

      {/* Bottom Action Button */}
      <View style={[styles.footer, { backgroundColor: colors.surface, borderTopColor: colors.border }]}>
        <TouchableOpacity
          style={[styles.actionBtn, { backgroundColor: colors.primary }]}
          onPress={handleNext}
          disabled={submitting}
          activeOpacity={0.85}
        >
          {submitting ? (
            <ActivityIndicator color="#fff" size="small" />
          ) : (
            <Text style={styles.actionBtnText}>
              {step === TOTAL_STEPS ? 'ابدأ رحلتك الآن' : 'المتابعة'}
            </Text>
          )}
          {!submitting && (
            <Ionicons
              name={step === TOTAL_STEPS ? 'checkmark-sharp' : 'arrow-back-outline'}
              size={18}
              color="#fff"
              style={{ marginRight: 6 }}
            />
          )}
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  navBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  progressContainer: {
    flex: 1,
    alignItems: 'center',
    paddingHorizontal: 12,
  },
  progressBarBg: {
    width: '100%',
    height: 6,
    borderRadius: 3,
    overflow: 'hidden',
  },
  progressBarFill: {
    height: '100%',
    borderRadius: 3,
  },
  stepText: {
    fontSize: 12,
    fontWeight: '600',
    marginTop: 6,
  },
  scroll: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 40,
  },
  stepContainer: {
    width: '100%',
  },
  stepTitle: {
    fontSize: 26,
    fontWeight: '900',
    textAlign: 'right',
    marginBottom: 6,
  },
  stepDesc: {
    fontSize: 14,
    textAlign: 'right',
    lineHeight: 22,
    marginBottom: 24,
  },
  fieldLabel: {
    fontSize: 15,
    fontWeight: '700',
    textAlign: 'right',
    marginBottom: 12,
  },
  genderRow: {
    flexDirection: 'row',
    gap: 16,
    justifyContent: 'space-between',
  },
  genderCard: {
    flex: 1,
    borderRadius: 18,
    paddingVertical: 24,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
  },
  genderText: {
    fontSize: 17,
    fontWeight: '800',
  },
  stepperContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderRadius: 18,
    borderWidth: 1,
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  stepBtn: {
    width: 44,
    height: 44,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  valWrapper: {
    flexDirection: 'row',
    alignItems: 'baseline',
    justifyContent: 'center',
    gap: 6,
  },
  stepperInput: {
    fontSize: 28,
    fontWeight: '900',
    minWidth: 60,
  },
  stepperUnit: {
    fontSize: 15,
    fontWeight: '600',
  },
  goalBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 16,
    borderWidth: 1,
    padding: 14,
    marginTop: 20,
  },
  goalBadgeTitle: {
    fontSize: 15,
    fontWeight: '800',
    textAlign: 'right',
    marginBottom: 4,
  },
  goalBadgeSub: {
    fontSize: 12,
    textAlign: 'right',
    lineHeight: 18,
  },
  activityCard: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 18,
    padding: 16,
    marginBottom: 12,
  },
  activityIconBox: {
    width: 44,
    height: 44,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: 14,
  },
  activityInfo: {
    flex: 1,
    alignItems: 'flex-start',
  },
  activityTitle: {
    fontSize: 15,
    fontWeight: '800',
    textAlign: 'right',
    marginBottom: 4,
  },
  activitySub: {
    fontSize: 12,
    textAlign: 'right',
    lineHeight: 18,
  },
  heroPlanCard: {
    borderRadius: 22,
    borderWidth: 1,
    padding: 22,
    alignItems: 'center',
    marginBottom: 10,
  },
  heroPlanHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 8,
  },
  heroPlanLabel: {
    fontSize: 14,
    fontWeight: '600',
  },
  heroPlanCalories: {
    fontSize: 38,
    fontWeight: '900',
    marginVertical: 6,
  },
  heroPlanUnit: {
    fontSize: 15,
    fontWeight: '600',
  },
  bmrPillsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginTop: 12,
    justifyContent: 'center',
  },
  pill: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 10,
  },
  pillText: {
    fontSize: 12,
    fontWeight: '600',
  },
  macrosRow: {
    flexDirection: 'row',
    gap: 12,
  },
  macroBox: {
    flex: 1,
    borderRadius: 16,
    borderWidth: 1,
    paddingVertical: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  macroDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginBottom: 8,
  },
  macroVal: {
    fontSize: 18,
    fontWeight: '900',
    marginBottom: 4,
  },
  macroName: {
    fontSize: 12,
    fontWeight: '600',
  },
  footer: {
    paddingHorizontal: 20,
    paddingVertical: 14,
    borderTopWidth: 1,
  },
  actionBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    height: 54,
    borderRadius: 16,
  },
  actionBtnText: {
    color: '#fff',
    fontSize: 17,
    fontWeight: '800',
  },
});
