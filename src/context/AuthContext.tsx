import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { authStorage, UserProfile } from '@/storage/authStorage';
import { authService, AuthResponse } from '@/services/authService';

interface AuthContextType {
  user: UserProfile | null;
  token: string | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  isEmailVerified: boolean;
  requestLoginOtp: (email: string) => Promise<void>;
  submitLoginOtp: (email: string, code: string) => Promise<void>;
  registerUser: (name: string, email: string) => Promise<void>;
  submitEmailVerification: (code: string) => Promise<void>;
  resendEmailVerification: () => Promise<void>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  // Restore saved session on app launch
  useEffect(() => {
    async function restoreSession() {
      try {
        const [savedToken, savedUser] = await Promise.all([
          authStorage.getToken(),
          authStorage.getUser(),
        ]);

        if (savedToken && savedUser) {
          setToken(savedToken);
          setUser(savedUser);
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
    await Promise.all([
      authStorage.setToken(authData.token),
      authStorage.setUser(authData.user),
    ]);
  };

  const requestLoginOtp = async (email: string) => {
    await authService.requestLoginCode(email);
  };

  const submitLoginOtp = async (email: string, code: string) => {
    const response = await authService.verifyLoginCode(email, code);
    await saveAuthSession(response);
  };

  const registerUser = async (name: string, email: string) => {
    const response = await authService.register(name, email);
    await saveAuthSession(response);
  };

  const submitEmailVerification = async (code: string) => {
    const response = await authService.verifyEmailCode(code);
    if (response.user) {
      setUser(response.user);
      await authStorage.setUser(response.user);
    } else if (user) {
      const updatedUser: UserProfile = {
        ...user,
        email_verified_at: new Date().toISOString(),
      };
      setUser(updatedUser);
      await authStorage.setUser(updatedUser);
    }
  };

  const resendEmailVerification = async () => {
    await authService.resendVerificationCode();
  };

  const logout = async () => {
    setUser(null);
    setToken(null);
    await authStorage.clear();
  };

  const isAuthenticated = !!token && !!user;
  const isEmailVerified = !!user?.email_verified_at;

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        isLoading,
        isAuthenticated,
        isEmailVerified,
        requestLoginOtp,
        submitLoginOtp,
        registerUser,
        submitEmailVerification,
        resendEmailVerification,
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
