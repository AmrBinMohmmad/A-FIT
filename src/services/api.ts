import { API_CONFIG } from '@/config/api';
import { authStorage } from '@/storage/authStorage';

export interface ApiResponse<T = any> {
  data?: T;
  message?: string;
  error?: string;
  errors?: Record<string, string[]>;
}

export class ApiError extends Error {
  status: number;
  errors?: Record<string, string[]>;

  constructor(message: string, status: number, errors?: Record<string, string[]>) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
    this.errors = errors;
  }
}

// In-memory token for synchronous, race-condition-free access (Sanad Mobile pattern)
let currentContextToken: string | null = null;

export const updateApiClientToken = (token: string | null) => {
  currentContextToken = token;
};

// Global 401 session expiry callback
let onSessionExpired: (() => void) | null = null;

export const setSessionExpiredHandler = (handler: (() => void) | null) => {
  onSessionExpired = handler;
};

async function request<T = any>(
  endpoint: string,
  options: RequestInit = {}
): Promise<T> {
  const token = currentContextToken || (await authStorage.getToken());

  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
    'Accept-Language': 'ar',
    ...(token ? { 'Authorization': `Bearer ${token}` } : {}),
    ...((options.headers as Record<string, string>) || {}),
  };

  const url = `${API_CONFIG.BASE_URL}${endpoint.startsWith('/') ? endpoint : `/${endpoint}`}`;

  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), API_CONFIG.TIMEOUT_MS);

  try {
    const response = await fetch(url, {
      ...options,
      headers,
      signal: controller.signal,
    });

    clearTimeout(timeoutId);

    const contentType = response.headers.get('content-type');
    const isJson = contentType && contentType.includes('application/json');
    const data = isJson ? await response.json() : null;

    if (!response.ok) {
      const isAuthEndpoint = [
        'login',
        'register',
        'verifyRegister',
        'verifyLogin',
        'resendRegisterCode',
      ].some((p) => endpoint.includes(p));

      // Handle 401 unauthorized session expiry on non-auth requests (Sanad Mobile pattern)
      if (response.status === 401 && !isAuthEndpoint) {
        currentContextToken = null;
        await authStorage.clearAll();
        onSessionExpired?.();
        throw new ApiError('انتهت صلاحية الجلسة، يرجى تسجيل الدخول مرة أخرى', 401);
      }

      // First per-field validation error
      const firstFieldError = () => {
        if (data?.errors && typeof data.errors === 'object') {
          const first = Object.values(data.errors)[0];
          if (Array.isArray(first) && first[0]) return first[0];
        }
        return null;
      };

      const errorMessage =
        data?.message ||
        firstFieldError() ||
        (data?.errors ? Object.values(data.errors).flat().join('، ') : null) ||
        `فشل الطلب (رمز الخطأ: ${response.status})`;

      throw new ApiError(errorMessage, response.status, data?.errors);
    }

    return data as T;
  } catch (error: any) {
    clearTimeout(timeoutId);

    if (error instanceof ApiError) {
      throw error;
    }

    if (error.name === 'AbortError') {
      throw new ApiError('انتهت مهلة الاتصال. يرجى التحقق من الشبكة أو الخادم.', 408);
    }

    throw new ApiError(
      error.message || 'تعذر الاتصال بالخادم. يرجى التحقق من اتصال الإنترنت.',
      0
    );
  }
}

export const apiClient = {
  get<T = any>(endpoint: string, options?: RequestInit) {
    return request<T>(endpoint, { ...options, method: 'GET' });
  },

  post<T = any>(endpoint: string, body?: any, options?: RequestInit) {
    return request<T>(endpoint, {
      ...options,
      method: 'POST',
      body: body ? JSON.stringify(body) : undefined,
    });
  },

  put<T = any>(endpoint: string, body?: any, options?: RequestInit) {
    return request<T>(endpoint, {
      ...options,
      method: 'PUT',
      body: body ? JSON.stringify(body) : undefined,
    });
  },

  delete<T = any>(endpoint: string, options?: RequestInit) {
    return request<T>(endpoint, { ...options, method: 'DELETE' });
  },
};
