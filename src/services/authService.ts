import { apiClient } from './api';
import { UserProfile } from '@/storage/authStorage';

export interface AuthResponse {
  message: string;
  user: UserProfile;
  token: string;
}

export interface MessageResponse {
  message: string;
  email?: string;
  user?: UserProfile;
}

export const authService = {
  /**
   * Register a new user and trigger email verification code.
   */
  async register(name: string, email: string): Promise<AuthResponse> {
    return await apiClient.post<AuthResponse>('/auth/register', { name, email });
  },

  /**
   * Request a 6-digit login OTP code for the given email.
   */
  async requestLoginCode(email: string): Promise<MessageResponse> {
    return await apiClient.post<MessageResponse>('/auth/login', { email });
  },

  /**
   * Verify the 6-digit login OTP code and obtain token & user data.
   */
  async verifyLoginCode(email: string, code: string): Promise<AuthResponse> {
    return await apiClient.post<AuthResponse>('/auth/verifyLogin', { email, code });
  },

  /**
   * Verify email using 6-digit OTP code (requires auth token).
   */
  async verifyEmailCode(code: string): Promise<MessageResponse> {
    return await apiClient.post<MessageResponse>('/auth/verifyCode', { code });
  },

  /**
   * Resend email verification code (requires auth token).
   */
  async resendVerificationCode(): Promise<MessageResponse> {
    return await apiClient.post<MessageResponse>('/auth/resendCode');
  },

  /**
   * Revoke current access token on the backend.
   */
  async logout(): Promise<MessageResponse> {
    return await apiClient.post<MessageResponse>('/auth/logout');
  },
};
