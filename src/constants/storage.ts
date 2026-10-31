/**
 * Storage keys — single source of truth. The auth token lives in expo-secure-store
 * (SECURE_KEYS); everything in STORAGE_KEYS is a non-sensitive preference or cache.
 */
import Constants from "expo-constants";

const NAMESPACE = Constants.expoConfig?.slug ?? "a-fit";

export const STORAGE_KEYS = {
  themeMode: `${NAMESPACE}.theme-mode`,
  language: `${NAMESPACE}.language`,
  onboardingSeen: `${NAMESPACE}.onboarding-seen`,
  cachedUser: `${NAMESPACE}.user`,
  stepsSnapshot: `${NAMESPACE}.steps-snapshot`,
  stepsLastSync: `${NAMESPACE}.steps-last-sync`,
  healthPermission: `${NAMESPACE}.health-permission`,
} as const;

export const SECURE_KEYS = {
  token: `${NAMESPACE.replace(/[^A-Za-z0-9_]/g, "_")}_token`,
} as const;
