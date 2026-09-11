import AsyncStorage from '@react-native-async-storage/async-storage';
import { authStorage } from '@/storage/authStorage';
import { Gender, ActivityLevel, GoalType } from '@/utils/nutritionCalculator';

export interface UserProfile {
  gender: Gender;
  age: number;
  height: number; // cm
  current_weight: number; // kg
  target_weight: number; // kg
  activity_level: ActivityLevel;
  goal_type: GoalType;
  daily_calories: number;
  daily_protein: number;
  daily_carbs: number;
  daily_fat: number;
  updated_at?: string;
}

const getProfileKey = async (): Promise<string> => {
  try {
    const user = await authStorage.getUser();
    if (user?.id) {
      return `profile_user_${user.id}`;
    }
  } catch (e) {
    console.error('Failed to get user for profile key', e);
  }
  return 'profile_guest';
};

export const profileStorage = {
  /**
   * Retrieve cached user profile
   */
  async getProfile(): Promise<UserProfile | null> {
    try {
      const key = await getProfileKey();
      const raw = await AsyncStorage.getItem(key);
      return raw ? JSON.parse(raw) : null;
    } catch (e) {
      console.error('Failed to load user profile from storage', e);
      return null;
    }
  },

  /**
   * Cache user profile locally
   */
  async saveProfile(profile: UserProfile): Promise<void> {
    try {
      const key = await getProfileKey();
      await AsyncStorage.setItem(key, JSON.stringify(profile));
    } catch (e) {
      console.error('Failed to save user profile to storage', e);
    }
  },

  /**
   * Check if the authenticated user has completed physical onboarding
   */
  async hasProfile(): Promise<boolean> {
    const profile = await this.getProfile();
    return Boolean(profile && profile.daily_calories > 0);
  },

  /**
   * Clear profile on logout
   */
  async clearProfile(): Promise<void> {
    try {
      const key = await getProfileKey();
      await AsyncStorage.removeItem(key);
    } catch (e) {
      console.error('Failed to clear user profile', e);
    }
  },
};
