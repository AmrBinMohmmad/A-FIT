/**
 * Environment, resolved once at module load. `EXPO_PUBLIC_API_URL` is inlined by Metro and
 * must include the `/api/v1` suffix. In development, when the variable is absent, the API
 * is assumed to run on the machine serving the Metro bundle (the existing dev convention).
 */
import Constants from "expo-constants";

function devFallback(): string {
  const hostUri = Constants.expoConfig?.hostUri;
  const host = hostUri?.split(":")[0];
  return host ? `http://${host}:8000/api/v1` : "http://localhost:8000/api/v1";
}

function readApiUrl(): string {
  const raw = (process.env.EXPO_PUBLIC_API_URL ?? "").trim();
  if (/^https?:\/\/.+/i.test(raw)) return raw.replace(/\/+$/, "");
  if (__DEV__) return devFallback();
  throw new Error("EXPO_PUBLIC_API_URL must be an http(s) URL ending in /api/v1 in release builds.");
}

export const API_URL: string = readApiUrl();

/** Sent as device_name when signing in so the token is labelled server-side. */
export const DEVICE_NAME = `${Constants.expoConfig?.name ?? "A-FIT"} mobile`;

export const APP_SCHEME = "afit";
