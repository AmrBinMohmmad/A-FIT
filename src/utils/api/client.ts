/**
 * The single axios instance (Rakaya mobile track, D7 shape b). Bearer from expo-secure-store,
 * `Accept` + `Accept-Language` on every request, and a 401 interceptor that clears the token
 * and notifies the AuthProvider so guards redirect to sign-in. No BFF, no cookies.
 */
import axios from "axios";

import { API_URL } from "@/constants/env";
import type { ApiEnvelope } from "@/types/api";
import i18n from "@/utils/localization/i18n";
import { clearToken, getToken } from "@/utils/secureStore";

let onUnauthorized: (() => void) | null = null;
export function setUnauthorizedHandler(handler: (() => void) | null): void {
  onUnauthorized = handler;
}

export const api = axios.create({
  baseURL: API_URL,
  timeout: 20_000,
  headers: { Accept: "application/json" },
});

const AUTH_PATHS = ["auth/otp/request", "auth/otp/verify"];

api.interceptors.request.use(async (config) => {
  const token = await getToken();
  if (token) config.headers.set("Authorization", `Bearer ${token}`);
  if (!(config.data instanceof FormData)) config.headers.set("Content-Type", "application/json");
  config.headers.set("Accept-Language", i18n.language || "ar");
  return config;
});

api.interceptors.response.use(
  (response) => response,
  async (error: unknown) => {
    const err = error as { config?: { url?: string }; response?: { status?: number } };
    const url = err.config?.url ?? "";
    const isAuthLeg = AUTH_PATHS.some((p) => url.includes(p));
    if (err.response?.status === 401 && !isAuthLeg) {
      await clearToken();
      onUnauthorized?.();
    }
    return Promise.reject(error as Error);
  },
);

/** Unwraps the `{ flag, data, message }` envelope and returns just `data`, typed. */
export function fetcher<T>(url: string): Promise<T> {
  return api.get<ApiEnvelope<T>>(url).then((res) => res.data.data);
}

export function buildQueryString(params: Record<string, unknown>): string {
  const search = new URLSearchParams();
  for (const [key, value] of Object.entries(params)) {
    if (value === undefined || value === null || value === "") continue;
    search.append(key, String(value));
  }
  const qs = search.toString();
  return qs ? `?${qs}` : "";
}
