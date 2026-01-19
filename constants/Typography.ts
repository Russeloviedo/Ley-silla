/**
 * Sistema de tipografía moderno y jerárquico
 * Basado en Material Design 3 y principios de accesibilidad
 */

// Escalas de tamaño de fuente
const fontSizes = {
  xs: 12,
  sm: 14,
  base: 16,
  lg: 18,
  xl: 20,
  '2xl': 24,
  '3xl': 28,
  '4xl': 32,
  '5xl': 36,
  '6xl': 48,
  '7xl': 56,
  '8xl': 64,
  '9xl': 72,
};

// Pesos de fuente
const fontWeights = {
  thin: '100',
  extraLight: '200',
  light: '300',
  normal: '400',
  medium: '500',
  semiBold: '600',
  bold: '700',
  extraBold: '800',
  black: '900',
};

// Alturas de línea
const lineHeights = {
  none: 1,
  tight: 1.25,
  snug: 1.375,
  normal: 1.5,
  relaxed: 1.625,
  loose: 2,
};

// Espaciado entre letras
const letterSpacings = {
  tighter: -0.05,
  tight: -0.025,
  normal: 0,
  wide: 0.025,
  wider: 0.05,
  widest: 0.1,
};

// Sistema de tipografía jerárquico
export const Typography = {
  // Títulos principales
  h1: {
    fontSize: fontSizes['5xl'],
    fontWeight: fontWeights.bold,
    lineHeight: lineHeights.tight,
    letterSpacing: letterSpacings.tight,
  },
  h2: {
    fontSize: fontSizes['4xl'],
    fontWeight: fontWeights.bold,
    lineHeight: lineHeights.tight,
    letterSpacing: letterSpacings.tight,
  },
  h3: {
    fontSize: fontSizes['3xl'],
    fontWeight: fontWeights.semiBold,
    lineHeight: lineHeights.snug,
    letterSpacing: letterSpacings.normal,
  },
  h4: {
    fontSize: fontSizes['2xl'],
    fontWeight: fontWeights.semiBold,
    lineHeight: lineHeights.snug,
    letterSpacing: letterSpacings.normal,
  },
  h5: {
    fontSize: fontSizes.xl,
    fontWeight: fontWeights.medium,
    lineHeight: lineHeights.normal,
    letterSpacing: letterSpacings.normal,
  },
  h6: {
    fontSize: fontSizes.lg,
    fontWeight: fontWeights.medium,
    lineHeight: lineHeights.normal,
    letterSpacing: letterSpacings.normal,
  },

  // Texto del cuerpo
  body1: {
    fontSize: fontSizes.base,
    fontWeight: fontWeights.normal,
    lineHeight: lineHeights.normal,
    letterSpacing: letterSpacings.normal,
  },
  body2: {
    fontSize: fontSizes.sm,
    fontWeight: fontWeights.normal,
    lineHeight: lineHeights.normal,
    letterSpacing: letterSpacings.normal,
  },

  // Texto de subtítulo
  subtitle1: {
    fontSize: fontSizes.base,
    fontWeight: fontWeights.medium,
    lineHeight: lineHeights.normal,
    letterSpacing: letterSpacings.normal,
  },
  subtitle2: {
    fontSize: fontSizes.sm,
    fontWeight: fontWeights.medium,
    lineHeight: lineHeights.normal,
    letterSpacing: letterSpacings.normal,
  },

  // Texto de botón
  button: {
    fontSize: fontSizes.sm,
    fontWeight: fontWeights.medium,
    lineHeight: lineHeights.none,
    letterSpacing: letterSpacings.wide,
    textTransform: 'uppercase' as const,
  },

  // Texto de caption
  caption: {
    fontSize: fontSizes.xs,
    fontWeight: fontWeights.normal,
    lineHeight: lineHeights.normal,
    letterSpacing: letterSpacings.normal,
  },

  // Texto de overline
  overline: {
    fontSize: fontSizes.xs,
    fontWeight: fontWeights.medium,
    lineHeight: lineHeights.normal,
    letterSpacing: letterSpacings.wider,
    textTransform: 'uppercase' as const,
  },

  // Texto de etiqueta
  label: {
    fontSize: fontSizes.sm,
    fontWeight: fontWeights.medium,
    lineHeight: lineHeights.normal,
    letterSpacing: letterSpacings.normal,
  },

  // Texto de entrada
  input: {
    fontSize: fontSizes.base,
    fontWeight: fontWeights.normal,
    lineHeight: lineHeights.normal,
    letterSpacing: letterSpacings.normal,
  },

  // Texto de placeholder
  placeholder: {
    fontSize: fontSizes.base,
    fontWeight: fontWeights.normal,
    lineHeight: lineHeights.normal,
    letterSpacing: letterSpacings.normal,
    fontStyle: 'italic' as const,
  },

  // Texto de error
  error: {
    fontSize: fontSizes.sm,
    fontWeight: fontWeights.normal,
    lineHeight: lineHeights.normal,
    letterSpacing: letterSpacings.normal,
  },

  // Texto de ayuda
  helper: {
    fontSize: fontSizes.xs,
    fontWeight: fontWeights.normal,
    lineHeight: lineHeights.normal,
    letterSpacing: letterSpacings.normal,
  },

  // Texto de código
  code: {
    fontSize: fontSizes.sm,
    fontWeight: fontWeights.normal,
    lineHeight: lineHeights.normal,
    letterSpacing: letterSpacings.normal,
    fontFamily: 'monospace',
  },

  // Texto de cita
  quote: {
    fontSize: fontSizes.lg,
    fontWeight: fontWeights.normal,
    lineHeight: lineHeights.relaxed,
    letterSpacing: letterSpacings.normal,
    fontStyle: 'italic' as const,
  },
};

// Utilidades de tipografía
export const TypographyUtils = {
  // Tamaños de fuente
  fontSize: fontSizes,
  
  // Pesos de fuente
  fontWeight: fontWeights,
  
  // Alturas de línea
  lineHeight: lineHeights,
  
  // Espaciado entre letras
  letterSpacing: letterSpacings,
  
  // Combinaciones comunes
  combinations: {
    // Título principal de página
    pageTitle: {
      ...Typography.h1,
      marginBottom: 16,
    },
    
    // Título de sección
    sectionTitle: {
      ...Typography.h3,
      marginBottom: 12,
    },
    
    // Título de tarjeta
    cardTitle: {
      ...Typography.h5,
      marginBottom: 8,
    },
    
    // Texto principal
    mainText: {
      ...Typography.body1,
      marginBottom: 8,
    },
    
    // Texto secundario
    secondaryText: {
      ...Typography.body2,
      marginBottom: 4,
    },
    
    // Texto de botón primario
    primaryButton: {
      ...Typography.button,
      color: '#FFFFFF',
    },
    
    // Texto de botón secundario
    secondaryButton: {
      ...Typography.button,
      color: '#1976D2',
    },
    
    // Texto de enlace
    link: {
      ...Typography.body1,
      color: '#1976D2',
      textDecorationLine: 'underline',
    },
    
    // Texto de error
    errorText: {
      ...Typography.error,
      color: '#F44336',
    },
    
    // Texto de éxito
    successText: {
      ...Typography.body2,
      color: '#4CAF50',
    },
    
    // Texto de advertencia
    warningText: {
      ...Typography.body2,
      color: '#FF9800',
    },
  },
};

export default Typography;

