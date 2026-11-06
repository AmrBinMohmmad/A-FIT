/**
 * Environment, resolved once at module load. `EXPO_PUBLIC_API_URL` is inlined by Metro and
 * must include the `/api/v1` suffix (`.env.development` sets it for dev builds). In development
 * the API is always 127.0.0.1:8000, forwarded from the phone to this machine by adb reverse.
 */
import Constants from "expo-constants";

/** Development: the API is reached on the phone's own localhost via `adb reverse tcp:8000 tcp:8000`. */
function devFallback(): string {
  return "http://127.0.0.1:8000/api/v1";
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
