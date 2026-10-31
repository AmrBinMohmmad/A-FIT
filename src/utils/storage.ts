/**
 * Typed AsyncStorage wrapper for non-sensitive preferences and caches. Failures are logged,
 * never thrown. Credentials go through `@/utils/secureStore` instead.
 */
import AsyncStorage from "@react-native-async-storage/async-storage";

import { logger } from "@/utils/logger";

export async function getItem<T>(key: string): Promise<T | null> {
  try {
    const raw = await AsyncStorage.getItem(key);
    return raw === null ? null : (JSON.parse(raw) as T);
  } catch (error) {
    logger.error(`storage.getItem("${key}") failed`, error);
    return null;
  }
}

export async function setItem<T>(key: string, value: T): Promise<void> {
  try {
    await AsyncStorage.setItem(key, JSON.stringify(value));
  } catch (error) {
    logger.error(`storage.setItem("${key}") failed`, error);
  }
}

export async function removeItem(key: string): Promise<void> {
  try {
    await AsyncStorage.removeItem(key);
  } catch (error) {
    logger.error(`storage.removeItem("${key}") failed`, error);
  }
}
