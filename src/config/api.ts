import { Platform } from 'react-native';
import Constants from 'expo-constants';

/**
 * Automatically resolve the local IP address of your development machine when using Expo.
 */
function getDevApiUrl(): string {
  // 1. Try to get the IP address dynamically from the Expo development server
  const hostUri =
    Constants.expoConfig?.hostUri ||
    (Constants as any).manifest2?.extra?.expoClient?.hostUri ||
    (Constants as any).manifest?.debuggerHost;

  if (hostUri) {
    const hostIp = hostUri.split(':')[0];
    if (hostIp) {
      return `http://${hostIp}:8000/api`;
    }
  }

  // 2. Fallback based on platform and current local network IP
  return Platform.select({
    android: 'http://192.168.100.4:8000/api',
    ios: 'http://192.168.100.4:8000/api',
    default: 'http://192.168.100.4:8000/api',
  });
}

export const API_CONFIG = {
  BASE_URL: getDevApiUrl(),
  TIMEOUT_MS: 15000,
};
