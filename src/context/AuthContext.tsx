import React, { createContext, useContext, useState, useEffect, useCallback, ReactNode } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { authStorage, UserProfile } from '@/storage/authStorage';
import { authService, AuthResponse } from '@/services/authService';
import { updateApiClientToken, setSessionExpiredHandler } from '@/services/api';

interface AuthContextType {
  user: UserProfile | null;
  token: string | null;
  pendingEmail: string | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  isEmailVerified: boolean;
  requestLoginOtp: (email: string) => Promise<void>;
  submitLoginOtp: (email: string, code: string) => Promise<void>;
  registerUser: (name: string, email: string) => Promise<void>;
  submitRegisterOtp: (code: string) => Promise<void>;
  resendRegisterOtp: () => Promise<void>;
  setPendingEmailState: (email: string | null) => void;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [pendingEmail, setPendingEmail] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  // Synchronous session teardown callback
  const clearSession = useCallback(() => {
    updateApiClientToken(null);
    setUser(null);
    setToken(null);
    setPendingEmail(null);
    authStorage.clearAll();
    AsyncStorage.removeItem('meals').catch(() => {});
  }, []);

  // Register session expired handler (Sanad Mobile pattern for handling 401 anywhere in the app)
  useEffect(() => {
    setSessionExpiredHandler(clearSession);
    return () => setSessionExpiredHandler(null);
  }, [clearSession]);

  // Restore saved session on app launch
  useEffect(() => {
    async function restoreSession() {
      try {
        const [savedToken, savedUser, savedPendingEmail] = await Promise.all([
          authStorage.getToken(),
          authStorage.getUser(),
          authStorage.getPendingEmail(),
        ]);

        if (savedToken && savedUser) {
          // Push to in-memory API client immediately so initial requests are signed
          updateApiClientToken(savedToken);
          setToken(savedToken);
          setUser(savedUser);
        }
        if (savedPendingEmail) {
          setPendingEmail(savedPendingEmail);
        }
      } catch (error) {
        console.error('Failed to restore auth session', error);
      } finally {
        setIsLoading(false);
      }
    }

    restoreSession();
  }, []);

  const saveAuthSession = async (authData: AuthResponse) => {
    // Memory-first (Sanad Mobile pattern): immediately attach token for all following requests
    updateApiClientToken(authData.token);
    setToken(authData.token);
    setUser(authData.user);
    setPendingEmail(null);

    // Persist to storage backup
    await Promise.all([
      authStorage.setToken(authData.token),
      authStorage.setUser(authData.user),
      authStorage.clearPendingEmail(),
    ]);
  };

  const setPendingEmailState = async (email: string | null) => {
    setPendingEmail(email);
    if (email) {
      await authStorage.setPendingEmail(email);
    } else {
      await authStorage.clearPendingEmail();
    }
  };

  const registerUser = async (name: string, email: string) => {
    await authService.register(name, email);
    await setPendingEmailState(email);
  };

  const submitRegisterOtp = async (code: string) => {
    if (!pendingEmail) {
      throw new Error('لم يتم العثور على البريد الإلكتروني للتسجيل');
    }
    const response = await authService.verifyRegister(pendingEmail, code);
    await saveAuthSession(response);
  };

  const resendRegisterOtp = async () => {
    if (!pendingEmail) {
      throw new Error('لم يتم العثور على البريد الإلكتروني للتسجيل');
    }
    await authService.resendRegisterCode(pendingEmail);
  };

  const requestLoginOtp = async (email: string) => {
    await authService.requestLoginCode(email);
  };

  const submitLoginOtp = async (email: string, code: string) => {
    const response = await authService.verifyLoginCode(email, code);
    await saveAuthSession(response);
  };

  const logout = async () => {
    try {
      if (token) {
        await authService.logout();
      }
    } catch (e) {
      console.error('Failed to logout on backend', e);
    } finally {
      clearSession();
    }
  };

  const isAuthenticated = !!token && !!user;
  const isEmailVerified = !!user?.email_verified_at;

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        pendingEmail,
        isLoading,
        isAuthenticated,
        isEmailVerified,
        requestLoginOtp,
        submitLoginOtp,
        registerUser,
        submitRegisterOtp,
        resendRegisterOtp,
        setPendingEmailState,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
