import React, { useCallback, useMemo, useState } from 'react';
import {
  ScrollView,
  Text,
  View,
  StyleSheet,
  RefreshControl,
  Keyboard,
  TouchableWithoutFeedback,
} from 'react-native';
import { useFocusEffect, useRouter } from 'expo-router';
import { useBottomTabBarHeight } from '@react-navigation/bottom-tabs';
import { SafeAreaView } from 'react-native-safe-area-context';
import { TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import HomeHeader from '@/components/HomeHeader';
import CalorieRing from '@/components/CalorieRing';
import MacroGrid from '@/components/MacroGrid';
import RecentMeals from '@/components/RecentMeals';
import ShareButton from '@/components/ShareButton';
import { getMeals, Meal } from '@/storage/meals';
import { useTheme } from '@/context/ThemeContext';
import { filterMealsByDay } from '@/utils/date';
import { profileService } from '@/services/profileService';
import { UserProfile } from '@/storage/profileStorage';

export default function HomeScreen() {
  const router = useRouter();
  const [meals, setMeals] = useState<Meal[]>([]);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [refreshing, setRefreshing] = useState(false);
  const { colors } = useTheme();
  const tabBarHeight = useBottomTabBarHeight();

  const loadMeals = async () => {
    const data = await getMeals();
    setMeals(data);
  };

  const loadProfile = async () => {
    const p = await profileService.getProfile();
    setProfile(p);
  };

  useFocusEffect(
    useCallback(() => {
      loadMeals();
      loadProfile();
    }, [])
  );

  const onRefresh = async () => {
    setRefreshing(true);
    await Promise.all([loadMeals(), loadProfile()]);
    setRefreshing(false);
  };

  // Filter meals strictly for today (resets at Midnight 00:00)
  const todayMeals = useMemo(() => filterMealsByDay(meals, new Date()), [meals]);

  // Calculate calories strictly for today
  const totalCalories = useMemo(
    () => todayMeals.reduce((sum, m) => sum + (m.calories || 0), 0),
    [todayMeals]
  );

  return (
    <SafeAreaView
      style={[styles.safeArea, { backgroundColor: colors.background }]}
      edges={['top', 'left', 'right']}
    >
      <TouchableWithoutFeedback onPress={Keyboard.dismiss} accessible={false}>
        <ScrollView
          style={[styles.container, { backgroundColor: colors.background }]}
          contentContainerStyle={[
            styles.scrollContent,
            { paddingBottom: tabBarHeight + 20 },
          ]}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={onRefresh}
              tintColor={colors.primary}
              colors={[colors.primary]}
            />
          }
        >
          {/* Top App Header */}
          <View style={styles.topBar}>
            <View style={styles.titleContainer}>
              <Text style={[styles.appTitle, { color: colors.text }]}>أي-فت</Text>
              <View style={[styles.tag, { backgroundColor: colors.primaryLight }]}>
                <Text style={[styles.tagText, { color: colors.primary }]}>صحة وتغذية</Text>
              </View>
            </View>
            <ShareButton meals={todayMeals} />
          </View>

          {/* User Greeting & Header Actions */}
          <HomeHeader />

          {/* Hero Calorie Ring */}
          <CalorieRing
            currentCalories={totalCalories}
            goalCalories={profile?.daily_calories || 2000}
          />

          {/* Macro Breakdown Bars */}
          <View style={styles.sectionHeader}>
            <Text style={[styles.sectionTitle, { color: colors.text }]}>توزيع المغذيات الكبرى</Text>
            <TouchableOpacity
              onPress={() => router.push('/onboarding')}
              style={[styles.planBadge, { backgroundColor: colors.primaryLight }]}
              activeOpacity={0.7}
            >
              <Ionicons name="options-outline" size={13} color={colors.primary} style={{ marginLeft: 4 }} />
              <Text style={[styles.planBadgeText, { color: colors.primary }]}>تعديل الخطة</Text>
            </TouchableOpacity>
          </View>
          <MacroGrid
            meals={todayMeals}
            goals={
              profile
                ? {
                    calories: profile.daily_calories,
                    protein: profile.daily_protein,
                    carbs: profile.daily_carbs,
                    fat: profile.daily_fat,
                  }
                : undefined
            }
          />

          {/* Today's Meals Section */}
          <RecentMeals meals={todayMeals} onDelete={loadMeals} />
        </ScrollView>
      </TouchableWithoutFeedback>
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
  topBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  titleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  appTitle: {
    fontSize: 26,
    fontWeight: '900',
    letterSpacing: -0.5,
  },
  tag: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 8,
  },
  tagText: {
    fontSize: 11,
    fontWeight: '700',
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  sectionTitle: {
    fontSize: 17,
    fontWeight: '800',
    textAlign: 'left',
  },
  planBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 10,
  },
  planBadgeText: {
    fontSize: 12,
    fontWeight: '700',
  },
});
