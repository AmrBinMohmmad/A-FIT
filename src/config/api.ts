import { Platform } from 'react-native';

/**
 * Configure your backend API base URL here.
 * - Android Emulator: http://10.0.2.2:8000/api
 * - iOS Simulator / Web: http://localhost:8000/api
 * - Physical Device on same Wi-Fi: http://<YOUR_LOCAL_IP>:8000/api (e.g. http://192.168.1.5:8000/api)
 */
const DEV_API_URL = Platform.select({
  android: 'http://10.0.2.2:8000/api',
  ios: 'http://localhost:8000/api',
  default: 'http://localhost:8000/api',
});

export const API_CONFIG = {
  BASE_URL: DEV_API_URL,
  TIMEOUT_MS: 10000,
};
