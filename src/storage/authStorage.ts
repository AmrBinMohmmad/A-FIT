import AsyncStorage from '@react-native-async-storage/async-storage';

export interface UserProfile {
  id: number;
  name: string;
  email: string;
  email_verified_at: string | null;
  created_at?: string;
  updated_at?: string;
}

const STORAGE_KEYS = {
  AUTH_TOKEN: '@afit_auth_token',
  AUTH_USER: '@afit_auth_user',
  PENDING_EMAIL: '@afit_pending_email',
};

export const authStorage = {
  async getToken(): Promise<string | null> {
    try {
      return await AsyncStorage.getItem(STORAGE_KEYS.AUTH_TOKEN);
    } catch (e) {
      console.error('Failed to get auth token from storage', e);
      return null;
    }
  },

  async setToken(token: string): Promise<void> {
    try {
      await AsyncStorage.setItem(STORAGE_KEYS.AUTH_TOKEN, token);
    } catch (e) {
      console.error('Failed to save auth token to storage', e);
    }
  },

  async getUser(): Promise<UserProfile | null> {
    try {
      const raw = await AsyncStorage.getItem(STORAGE_KEYS.AUTH_USER);
      return raw ? JSON.parse(raw) : null;
    } catch (e) {
      console.error('Failed to get auth user from storage', e);
      return null;
    }
  },

  async setUser(user: UserProfile): Promise<void> {
    try {
      await AsyncStorage.setItem(STORAGE_KEYS.AUTH_USER, JSON.stringify(user));
    } catch (e) {
      console.error('Failed to save auth user to storage', e);
    }
  },

  async getPendingEmail(): Promise<string | null> {
    try {
      return await AsyncStorage.getItem(STORAGE_KEYS.PENDING_EMAIL);
    } catch (e) {
      return null;
    }
  },

  async setPendingEmail(email: string): Promise<void> {
    try {
      await AsyncStorage.setItem(STORAGE_KEYS.PENDING_EMAIL, email);
    } catch (e) {
      console.error('Failed to save pending email to storage', e);
    }
  },

  async clearPendingEmail(): Promise<void> {
    try {
      await AsyncStorage.removeItem(STORAGE_KEYS.PENDING_EMAIL);
    } catch (e) {
      console.error('Failed to clear pending email from storage', e);
    }
  },

  async clear(): Promise<void> {
    try {
      await AsyncStorage.multiRemove([
        STORAGE_KEYS.AUTH_TOKEN,
        STORAGE_KEYS.AUTH_USER,
        STORAGE_KEYS.PENDING_EMAIL,
      ]);
    } catch (e) {
      console.error('Failed to clear auth storage', e);
    }
  },
};
