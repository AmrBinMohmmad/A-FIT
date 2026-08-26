import { StyleSheet, I18nManager } from 'react-native';

// Enable RTL layout direction
if (!I18nManager.isRTL) {
  try {
    I18nManager.allowRTL(true);
    I18nManager.forceRTL(true);
  } catch (e) {
    console.log('RTL config error', e);
  }
}

export const FONTS = {
  regular: 'IBMPlexSansArabic_400Regular',
  bold: 'IBMPlexSansArabic_700Bold',
};

export const darkColors = {
  background: '#0D1117',
  surface: '#161B22',
  surfaceElevated: '#1F2937',
  card: '#161B22',
  header: '#161B22',
  border: 'rgba(255, 255, 255, 0.08)',
  borderActive: 'rgba(16, 185, 129, 0.4)',
  primary: '#10B981',
  primaryLight: 'rgba(16, 185, 129, 0.15)',
  accent: '#10B981',
  text: '#F0F6FC',
  textSecondary: '#8B949E',
  textMuted: '#57606A',
  
  // Macros
  calories: '#10B981',
  protein: '#3B82F6',
  carbs: '#F59E0B',
  fat: '#EF4444',
  
  // Feedback states
  alert: '#F85149',
  danger: '#F85149',
  warning: '#D29922',
  info: '#58A6FF',
  success: '#3FB950',
};

export const lightColors = {
  background: '#F8FAFC',
  surface: '#FFFFFF',
  surfaceElevated: '#F1F5F9',
  card: '#FFFFFF',
  header: '#FFFFFF',
  border: 'rgba(0, 0, 0, 0.08)',
  borderActive: 'rgba(5, 150, 105, 0.4)',
  primary: '#059669',
  primaryLight: 'rgba(5, 150, 105, 0.12)',
  accent: '#059669',
  text: '#0F172A',
  textSecondary: '#64748B',
  textMuted: '#94A3B8',
  
  // Macros
  calories: '#059669',
  protein: '#2563EB',
  carbs: '#D97706',
  fat: '#DC2626',
  
  // Feedback states
  alert: '#DC2626',
  danger: '#DC2626',
  warning: '#D97706',
  info: '#2563EB',
  success: '#16A34A',
};

export type ColorTheme = typeof darkColors;

// Default static colors fallback (defaults to dark)
export const colors = darkColors;

export const globalStyles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
    paddingTop: 56,
    paddingHorizontal: 20,
    direction: 'rtl',
  },
  title: {
    fontSize: 26,
    fontWeight: 'bold',
    fontFamily: FONTS.bold,
    color: colors.text,
    writingDirection: 'rtl',
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    fontFamily: FONTS.bold,
    color: colors.text,
    marginTop: 24,
    marginBottom: 14,
    writingDirection: 'rtl',
  },
  empty: {
    color: colors.textSecondary,
    fontSize: 15,
    fontFamily: FONTS.regular,
    textAlign: 'center',
    paddingVertical: 32,
    writingDirection: 'rtl',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  date: {
    alignSelf: 'center',
    fontSize: 13,
    fontFamily: FONTS.regular,
    color: colors.textSecondary,
    marginTop: 4,
    marginBottom: 20,
    writingDirection: 'rtl',
  },
});