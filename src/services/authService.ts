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
   * Step 1: Register (Request OTP - Does not create DB user yet)
   */
  async register(name: string, email: string): Promise<MessageResponse> {
    return await apiClient.post<MessageResponse>('/auth/register', { name, email });
  },

  /**
   * Step 2: Verify Registration OTP (Creates DB user and returns token)
   */
  async verifyRegister(email: string, code: string): Promise<AuthResponse> {
    return await apiClient.post<AuthResponse>('/auth/verifyRegister', { email, code });
  },

  /**
   * Resend Registration OTP for pending email
   */
  async resendRegisterCode(email: string): Promise<MessageResponse> {
    return await apiClient.post<MessageResponse>('/auth/resendRegisterCode', { email });
  },

  /**
   * Request a 6-digit login OTP code for the given email
   */
  async requestLoginCode(email: string): Promise<MessageResponse> {
    return await apiClient.post<MessageResponse>('/auth/login', { email });
  },

  /**
   * Verify the 6-digit login OTP code and obtain token & user data
   */
  async verifyLoginCode(email: string, code: string): Promise<AuthResponse> {
    return await apiClient.post<AuthResponse>('/auth/verifyLogin', { email, code });
  },

  /**
   * Revoke current access token on the backend
   */
  async logout(): Promise<MessageResponse> {
    return await apiClient.post<MessageResponse>('/auth/logout');
  },
};
