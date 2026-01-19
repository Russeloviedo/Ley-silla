const tintColorLight = '#1976D2';
const tintColorDark = '#90CAF9';

// Sistema de colores moderno y profesional
export const AppColors = {
  // Colores primarios (Azul profesional)
  primary: '#1976D2',
  primaryLight: '#42A5F5',
  primaryDark: '#0D47A1',
  primaryContainer: '#E3F2FD',

  // Colores secundarios (Turquesa moderno)
  secondary: '#00BCD4',
  secondaryLight: '#4DD0E1',
  secondaryDark: '#006064',
  secondaryContainer: '#E0F7FA',

  // Colores de acento (Verde vibrante)
  accent: '#4CAF50',
  accentLight: '#81C784',
  accentDark: '#2E7D32',
  accentContainer: '#E8F5E8',

  // Colores de riesgo (mejorados)
  riskLow: '#4CAF50',
  riskLowLight: '#C8E6C9',
  riskMedium: '#FF9800',
  riskMediumLight: '#FFE0B2',
  riskHigh: '#F44336',
  riskHighLight: '#FFCDD2',
  riskUnknown: '#9E9E9E',
  riskUnknownLight: '#F5F5F5',

  // Colores de fondo (modernos)
  background: '#FAFAFA',
  surface: '#FFFFFF',
  surfaceVariant: '#F8F9FA',
  surfaceElevated: '#FFFFFF',

  // Colores de texto (jerarquía clara)
  textPrimary: '#212121',
  textSecondary: '#757575',
  textTertiary: '#9E9E9E',
  textDisabled: '#BDBDBD',
  textInverse: '#FFFFFF',
  textOnPrimary: '#FFFFFF',
  textOnSecondary: '#FFFFFF',
  textWhite: '#FFFFFF',

  // Colores de estado
  success: '#4CAF50',
  successLight: '#C8E6C9',
  successDark: '#2E7D32',

  warning: '#FF9800',
  warningLight: '#FFE0B2',
  warningDark: '#F57C00',

  error: '#F44336',
  errorLight: '#FFCDD2',
  errorDark: '#D32F2F',

  info: '#2196F3',
  infoLight: '#BBDEFB',
  infoDark: '#1976D2',

  // Colores de borde
  border: '#E0E0E0',
  borderLight: '#F5F5F5',
  borderDark: '#BDBDBD',
  borderFocus: '#1976D2',

  // Colores de sombra (modernos)
  shadowLight: 'rgba(0, 0, 0, 0.1)',
  shadowMedium: 'rgba(0, 0, 0, 0.2)',
  shadowDark: 'rgba(0, 0, 0, 0.3)',
  shadowColored: 'rgba(25, 118, 210, 0.2)',
  shadowSuccess: 'rgba(76, 175, 80, 0.2)',
  shadowWarning: 'rgba(255, 152, 0, 0.2)',
  shadowError: 'rgba(244, 67, 54, 0.2)',

  // Gradientes modernos
  gradient: {
    primary: ['#42A5F5', '#1976D2'],
    secondary: ['#4DD0E1', '#00BCD4'],
    success: ['#81C784', '#4CAF50'],
    warning: ['#FFB74D', '#FF9800'],
    error: ['#E57373', '#F44336'],
    surface: ['#FFFFFF', '#F8F9FA'],
  },

  // Colores de overlay
  overlay: 'rgba(0, 0, 0, 0.5)',
  overlayLight: 'rgba(0, 0, 0, 0.3)',
  overlayDark: 'rgba(0, 0, 0, 0.7)',
};

// Sistema de colores para modo claro y oscuro
export default {
  light: {
    text: AppColors.textPrimary,
    background: AppColors.background,
    surface: AppColors.surface,
    tint: tintColorLight,
    tabIconDefault: AppColors.textTertiary,
    tabIconSelected: tintColorLight,
    primary: AppColors.primary,
    secondary: AppColors.secondary,
    accent: AppColors.accent,
  },
  dark: {
    text: AppColors.textInverse,
    background: '#121212',
    surface: '#1E1E1E',
    tint: tintColorDark,
    tabIconDefault: AppColors.textTertiary,
    tabIconSelected: tintColorDark,
    primary: AppColors.primaryLight,
    secondary: AppColors.secondaryLight,
    accent: AppColors.accentLight,
  },
};
