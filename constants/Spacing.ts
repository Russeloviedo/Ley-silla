/**
 * Sistema de espaciado consistente
 * Basado en una escala de 8px para mantener consistencia visual
 */

// Escala base de espaciado (8px)
const baseSpacing = 8;

// Espaciado estándar
export const Spacing = {
  // Espaciado base
  xs: baseSpacing * 0.5,    // 4px
  sm: baseSpacing * 1,       // 8px
  md: baseSpacing * 1.5,     // 12px
  lg: baseSpacing * 2,       // 16px
  xl: baseSpacing * 2.5,     // 20px
  '2xl': baseSpacing * 3,    // 24px
  '3xl': baseSpacing * 4,    // 32px
  '4xl': baseSpacing * 5,    // 40px
  '5xl': baseSpacing * 6,    // 48px
  '6xl': baseSpacing * 8,    // 64px
  '7xl': baseSpacing * 10,   // 80px
  '8xl': baseSpacing * 12,   // 96px
  '9xl': baseSpacing * 16,   // 128px

  // Espaciado específico para componentes
  component: {
    padding: baseSpacing * 2,        // 16px
    paddingSmall: baseSpacing * 1.5, // 12px
    paddingLarge: baseSpacing * 3,   // 24px
    margin: baseSpacing * 2,         // 16px
    marginSmall: baseSpacing * 1,    // 8px
    marginLarge: baseSpacing * 4,    // 32px
    gap: baseSpacing * 1.5,          // 12px
    gapSmall: baseSpacing * 1,       // 8px
    gapLarge: baseSpacing * 2,       // 16px
  },

  // Espaciado para layout
  layout: {
    container: baseSpacing * 4,      // 32px
    section: baseSpacing * 6,        // 48px
    page: baseSpacing * 8,           // 64px
    header: baseSpacing * 4,         // 32px
    footer: baseSpacing * 4,         // 32px
  },

  // Espaciado para formularios
  form: {
    field: baseSpacing * 2,          // 16px
    fieldSmall: baseSpacing * 1.5,   // 12px
    group: baseSpacing * 3,          // 24px
    section: baseSpacing * 4,        // 32px
  },

  // Espaciado para tarjetas
  card: {
    padding: baseSpacing * 3,        // 24px
    paddingSmall: baseSpacing * 2,   // 16px
    paddingLarge: baseSpacing * 4,   // 32px
    margin: baseSpacing * 2,         // 16px
    marginSmall: baseSpacing * 1,    // 8px
    marginLarge: baseSpacing * 3,    // 24px
    gap: baseSpacing * 2,            // 16px
  },

  // Espaciado para botones
  button: {
    padding: baseSpacing * 2,        // 16px
    paddingSmall: baseSpacing * 1.5, // 12px
    paddingLarge: baseSpacing * 3,   // 24px
    margin: baseSpacing * 1,         // 8px
    gap: baseSpacing * 1,            // 8px
  },

  // Espaciado para iconos
  icon: {
    small: baseSpacing * 0.5,        // 4px
    medium: baseSpacing * 1,         // 8px
    large: baseSpacing * 1.5,        // 12px
  },
};

// Sistema de breakpoints para responsive design
export const Breakpoints = {
  xs: 0,
  sm: 576,
  md: 768,
  lg: 992,
  xl: 1200,
  '2xl': 1400,
};

// Sistema de bordes redondeados
export const BorderRadius = {
  none: 0,
  sm: 4,
  md: 8,
  lg: 12,
  xl: 16,
  '2xl': 20,
  '3xl': 24,
  full: 9999,
  
  // Bordes específicos para componentes
  component: {
    button: 8,
    card: 12,
    input: 8,
    modal: 16,
    badge: 12,
  },
};

// Sistema de sombras
export const Shadows = {
  none: {
    shadowColor: 'transparent',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0,
    shadowRadius: 0,
    elevation: 0,
  },
  sm: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  md: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 4,
    elevation: 4,
  },
  lg: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 8,
  },
  xl: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.25,
    shadowRadius: 16,
    elevation: 16,
  },
  '2xl': {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 16 },
    shadowOpacity: 0.3,
    shadowRadius: 32,
    elevation: 32,
  },
};

// Sistema de z-index
export const ZIndex = {
  hide: -1,
  auto: 'auto',
  base: 0,
  docked: 10,
  dropdown: 1000,
  sticky: 1100,
  banner: 1200,
  overlay: 1300,
  modal: 1400,
  popover: 1500,
  skipLink: 1600,
  toast: 1700,
  tooltip: 1800,
};

export default Spacing;







