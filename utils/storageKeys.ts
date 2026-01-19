/**
 * Claves de AsyncStorage con namespacing para separar navegación de datos de análisis
 * 
 * Prefijos:
 * - nav: para selecciones de navegación (se limpia al iniciar nuevo análisis)
 * - data: para datos de análisis (NO se limpia al iniciar nuevo análisis)
 */

// Claves de navegación (se limpian al iniciar nuevo análisis)
export const NAVIGATION_KEYS = {
  SELECTED_BUSINESS_UNIT: 'nav:selectedBusinessUnit',
  SELECTED_PLANT: 'nav:selectedPlant',
  SELECTED_SHIFT: 'nav:selectedShift',
  SELECTED_AREA: 'nav:selectedArea',
  SELECTED_POSITION: 'nav:selectedPosition',
  FLOW_STATE: 'nav:flowState',
} as const;

// Claves específicas para metadata del análisis (NO se limpian al iniciar nuevo análisis)
export const ANALYSIS_METADATA_KEYS = {
  BUSINESS_UNIT: 'data:meta.businessUnit',
  PLANT: 'data:meta.plant',
  SHIFT: 'data:meta.shift',
  AREA: 'data:meta.area',
  POSITION: 'data:meta.position',
} as const;

// Claves de datos de análisis (NO se limpian al iniciar nuevo análisis)
export const ANALYSIS_DATA_KEYS = {
  ANSWERS: 'data:answers',
  WEIGHTS: 'data:weights',
  RESULT: 'data:result',
  META: 'data:meta',
  HISTORIAL_ANALISIS: 'data:historialAnalisis',
  RESPUESTAS_PREGUNTAS: 'data:respuestasPreguntas',
  RESPUESTAS_PONDERACION: 'data:respuestasPonderacion',
  NIVEL_RIESGO: 'data:nivelRiesgo',
  PUNTAJE: 'data:puntaje',
  FLUJO: 'data:flujo',
  TIMESTAMP: 'data:timestamp',
} as const;

// Todas las claves para operaciones de limpieza completa
export const ALL_KEYS = {
  ...NAVIGATION_KEYS,
  ...ANALYSIS_DATA_KEYS,
  ...ANALYSIS_METADATA_KEYS,
} as const;

// Tipos para TypeScript
export type NavigationKey = typeof NAVIGATION_KEYS[keyof typeof NAVIGATION_KEYS];
export type AnalysisDataKey = typeof ANALYSIS_DATA_KEYS[keyof typeof ANALYSIS_DATA_KEYS];
export type StorageKey = NavigationKey | AnalysisDataKey;

// Helper para obtener todas las claves de un tipo específico
export const getNavigationKeys = (): NavigationKey[] => Object.values(NAVIGATION_KEYS);
export const getAnalysisDataKeys = (): AnalysisDataKey[] => Object.values(ANALYSIS_DATA_KEYS);
export const getAnalysisMetadataKeys = (): string[] => Object.values(ANALYSIS_METADATA_KEYS);
export const getAllKeys = (): StorageKey[] => Object.values(ALL_KEYS);

// Claves específicas para operaciones comunes
export const K_SELECTED_BUSINESS_UNIT = NAVIGATION_KEYS.SELECTED_BUSINESS_UNIT;
export const K_ANALYSIS_METADATA = ANALYSIS_METADATA_KEYS.BUSINESS_UNIT;
