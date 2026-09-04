import AsyncStorage from '@react-native-async-storage/async-storage';

export interface UserProfile {
  id: number;
  name: string;
  email: string;
  email_verified_at: string | null;
  created_at?: string;
  updated_at?: string;
}

const TOKEN_KEY = 'auth.token';
const USER_KEY = 'auth.user';
const PENDING_EMAIL_KEY = 'auth.pending_email';

export const authStorage = {
  async getToken(): Promise<string | null> {
    try {
      return await AsyncStorage.getItem(TOKEN_KEY);
    } catch (e) {
      console.error('Failed to get token from storage', e);
      return null;
    }
  },

  async setToken(token: string | null): Promise<void> {
    try {
      if (!token) {
        await AsyncStorage.removeItem(TOKEN_KEY);
      } else {
        await AsyncStorage.setItem(TOKEN_KEY, token);
      }
    } catch (e) {
      console.error('Failed to save token to storage', e);
    }
  },

  async getUser(): Promise<UserProfile | null> {
    try {
      const raw = await AsyncStorage.getItem(USER_KEY);
      if (!raw) return null;
      return JSON.parse(raw);
    } catch {
      // Corrupted entry — drop it instead of throwing
      await AsyncStorage.removeItem(USER_KEY).catch(() => {});
      return null;
    }
  },

  async setUser(user: UserProfile | null): Promise<void> {
    try {
      if (!user) {
        await AsyncStorage.removeItem(USER_KEY);
      } else {
        await AsyncStorage.setItem(USER_KEY, JSON.stringify(user));
      }
    } catch (e) {
      console.error('Failed to save user to storage', e);
    }
  },

  async getPendingEmail(): Promise<string | null> {
    try {
      return await AsyncStorage.getItem(PENDING_EMAIL_KEY);
    } catch {
      return null;
    }
  },

  async setPendingEmail(email: string | null): Promise<void> {
    try {
      if (!email) {
        await AsyncStorage.removeItem(PENDING_EMAIL_KEY);
      } else {
        await AsyncStorage.setItem(PENDING_EMAIL_KEY, email);
      }
    } catch (e) {
      console.error('Failed to save pending email to storage', e);
    }
  },

  async clearPendingEmail(): Promise<void> {
    try {
      await AsyncStorage.removeItem(PENDING_EMAIL_KEY);
    } catch {}
  },

  async isAuthenticated(): Promise<boolean> {
    const token = await this.getToken();
    return Boolean(token);
  },

  async clearAll(): Promise<void> {
    try {
      await AsyncStorage.multiRemove([TOKEN_KEY, USER_KEY, PENDING_EMAIL_KEY]);
    } catch (e) {
      console.error('Failed to clear auth storage', e);
    }
  },

  // Alias for backward compatibility
  async clear(): Promise<void> {
    return this.clearAll();
  },
};
