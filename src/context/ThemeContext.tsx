import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { useColorScheme } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { lightColors, darkColors } from '@/styles/theme';

type ThemePreference = 'light' | 'dark' | 'system';

type ThemeContextType = {
  colors: typeof lightColors;
  scheme: 'light' | 'dark';
  preference: ThemePreference;
  setThemePreference: (value: ThemePreference) => Promise<void>;
};

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);
const STORAGE_KEY = 'themePreference';

export const ThemeProvider = ({ children }: { children: ReactNode }) => {
  const systemScheme = useColorScheme(); 
  const [preference, setPreference] = useState<ThemePreference>('system');
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    AsyncStorage.getItem(STORAGE_KEY).then((saved) => {
      if (saved === 'light' || saved === 'dark' || saved === 'system') {
        setPreference(saved);
      }
      setLoaded(true);
    });
  }, []);

  const activeScheme: 'light' | 'dark' = preference === 'system' ? (systemScheme || 'dark') : preference;
  const colors = activeScheme === 'light' ? lightColors : darkColors;

  const setThemePreference = async (value: ThemePreference) => {
    setPreference(value);
    await AsyncStorage.setItem(STORAGE_KEY, value);
  };

  if (!loaded) return null; 

  return (
    <ThemeContext.Provider value={{ colors, scheme: activeScheme, preference, setThemePreference }}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
};