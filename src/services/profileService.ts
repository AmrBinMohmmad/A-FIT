import { apiClient } from './api';
import { profileStorage, UserProfile } from '@/storage/profileStorage';

export const profileService = {
  /**
   * Fetch user physical profile and nutrition goals from backend,
   * falling back to local cache.
   */
  async getProfile(): Promise<UserProfile | null> {
    try {
      const res = await apiClient.get<any>('/user/profile');
      const data: UserProfile = res?.data || res?.profile || res;
      if (data && data.daily_calories) {
        await profileStorage.saveProfile(data);
        return data;
      }
    } catch (e) {
      console.log('Falling back to locally cached profile:', e);
    }
    return await profileStorage.getProfile();
  },

  /**
   * Save user physical profile to backend and update local cache.
   */
  async saveProfile(profile: UserProfile): Promise<UserProfile> {
    // Always persist locally first for instant UI response and offline resilience
    await profileStorage.saveProfile(profile);

    try {
      const res = await apiClient.post<any>('/user/profile', profile);
      const saved: UserProfile = res?.data || res?.profile || profile;
      await profileStorage.saveProfile(saved);
      return saved;
    } catch (e) {
      console.log('Backend profile sync failed (working offline):', e);
      return profile;
    }
  },
};
