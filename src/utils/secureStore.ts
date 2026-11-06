/**
 * Credential storage — the auth Bearer token lives ONLY here (Keychain / Keystore via
 * expo-secure-store), never in AsyncStorage or React state.
 */
import * as SecureStore from "expo-secure-store";

import { SECURE_KEYS } from "@/constants/storage";
import { logger } from "@/utils/logger";

export async function getToken(): Promise<string | null> {
  try {
    return await SecureStore.getItemAsync(SECURE_KEYS.token);
  } catch (error) {
    logger.error("secureStore.getToken failed", error);
    return null;
  }
}

export async function setToken(token: string): Promise<void> {
  try {
    await SecureStore.setItemAsync(SECURE_KEYS.token, token, {
      keychainAccessible: SecureStore.AFTER_FIRST_UNLOCK,
    });
  } catch (error) {
    logger.error("secureStore.setToken failed", error);
  }
}

export async function clearToken(): Promise<void> {
  try {
    await SecureStore.deleteItemAsync(SECURE_KEYS.token);
  } catch (error) {
    logger.error("secureStore.clearToken failed", error);
  }
}
