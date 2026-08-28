import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { authStorage, UserProfile } from '@/storage/authStorage';
import { authService, AuthResponse } from '@/services/authService';

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
    setToken(authData.token);
    setUser(authData.user);
    setPendingEmail(null);
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
      setUser(null);
      setToken(null);
      setPendingEmail(null);
      await authStorage.clear();
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
