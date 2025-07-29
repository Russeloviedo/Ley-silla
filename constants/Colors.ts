const tintColorLight = '#2f95dc';
const tintColorDark = '#fff';

// Colores principales de la aplicación
export const AppColors = {
  // Colores primarios
  primary: '#003b4c',
  secondary: '#00c4cc',
  accent: '#b6e600',
  
  // Colores de riesgo
  riskLow: '#4caf50',
  riskMedium: '#ffeb3b',
  riskHigh: '#f44336',
  riskUnknown: '#ccc',
  
  // Colores de fondo
  background: '#f7f7f7',
  surface: '#fff',
  
  // Colores de texto
  textPrimary: '#222',
  textSecondary: '#444',
  textMuted: '#888',
  textWhite: '#fff',
  
  // Colores de estado
  disabled: '#bdbdbd',
  border: '#003b4c',
  
  // Sombras
  shadowColor: '#00c4cc',
  shadowColorDark: '#003b4c',
};

export default {
  light: {
    text: '#000',
    background: '#fff',
    tint: tintColorLight,
    tabIconDefault: '#ccc',
    tabIconSelected: tintColorLight,
  },
  dark: {
    text: '#fff',
    background: '#000',
    tint: tintColorDark,
    tabIconDefault: '#ccc',
    tabIconSelected: tintColorDark,
  },
};
