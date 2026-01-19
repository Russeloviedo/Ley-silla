import AsyncStorage from '@react-native-async-storage/async-storage';
import { NAVIGATION_KEYS, ANALYSIS_DATA_KEYS, ANALYSIS_METADATA_KEYS, getNavigationKeys, getAnalysisDataKeys, getAnalysisMetadataKeys, K_SELECTED_BUSINESS_UNIT } from './storageKeys';

/**
 * Utilidades para manejo seguro de AsyncStorage con namespacing
 */

/**
 * Limpia SOLO las claves de navegación (prefijo nav:)
 * Se usa al iniciar nuevo análisis
 */
export const clearNavigationOnly = async (): Promise<void> => {
  try {
    console.log('🧹 Limpiando navegación y respuestas anteriores...');
    
    // Limpiar claves de navegación
    const keysToRemove = [
      ...Object.values(NAVIGATION_KEYS),
      // También limpiar claves de respuestas y datos de análisis
      'data:answers',
      'data:weights', 
      'data:respuestasPreguntas',
      'data:respuestasPonderacion',
      'data:nivelRiesgo',
      'data:puntaje',
      'data:flujo'
    ];
    
    const removePromises = keysToRemove.map(key => AsyncStorage.removeItem(key));
    await Promise.all(removePromises);
    
    console.log('✅ Navegación y respuestas anteriores limpiadas exitosamente');
  } catch (error) {
    console.error('❌ Error al limpiar navegación y respuestas:', error);
    throw error;
  }
};

/**
 * Limpia SOLO las respuestas de las preguntas
 * Se usa para asegurar que cada nuevo análisis comience con respuestas limpias
 */


/**
 * Limpia SOLO las respuestas y datos de análisis, pero PRESERVA la unidad de negocio
 * Se usa al iniciar nuevo análisis para mantener la BU seleccionada
 */
export const clearAnswersOnly = async (): Promise<void> => {
  try {
    console.log('🧹 Limpiando respuestas y datos de análisis, preservando unidad de negocio...');
    
    // Solo limpiar claves de respuestas y datos de análisis
    const keysToRemove = [
      'data:answers',
      'data:weights', 
      'data:respuestasPreguntas',
      'data:respuestasPonderacion',
      'data:nivelRiesgo',
      'data:puntaje',
      'data:flujo'
    ];
    
    const removePromises = keysToRemove.map(key => AsyncStorage.removeItem(key));
    await Promise.all(removePromises);
    
    console.log('✅ Respuestas y datos de análisis limpiados, unidad de negocio preservada');
  } catch (error) {
    console.error('❌ Error al limpiar respuestas:', error);
    throw error;
  }
};

/**
 * Limpia claves de navegación pero PRESERVA Business Unit
 * Se usa cuando se quiere mantener la unidad de negocio seleccionada
 */
export const clearNavigationOnlyPreservingBU = async (): Promise<void> => {
  try {
    console.log('🧹 Limpiando navegación pero preservando Business Unit...');
    
    const navigationKeys = getNavigationKeys().filter(key => key !== K_SELECTED_BUSINESS_UNIT);
    const results = await Promise.allSettled(
      navigationKeys.map(key => AsyncStorage.removeItem(key))
    );
    
    // Contar éxitos y fallos
    const successCount = results.filter(result => result.status === 'fulfilled').length;
    const failureCount = results.filter(result => result.status === 'rejected').length;
    
    console.log(`✅ Navegación limpiada (BU preservado): ${successCount} claves eliminadas, ${failureCount} fallos`);
    
    if (failureCount > 0) {
      console.warn('⚠️ Algunas claves de navegación no se pudieron limpiar');
    }
  } catch (error) {
    console.error('❌ Error al limpiar navegación preservando BU:', error);
    throw error;
  }
};

/**
 * Limpia SOLO las claves de datos de análisis (prefijo data:)
 * Se usa en el botón "Reiniciar Base de Datos"
 */
export const clearAnalysisDataOnly = async (): Promise<void> => {
  try {
    console.log('🧹 Limpiando solo datos de análisis...');
    
    const analysisKeys = getAnalysisDataKeys();
    const results = await Promise.allSettled(
      analysisKeys.map(key => AsyncStorage.removeItem(key))
    );
    
    // Contar éxitos y fallos
    const successCount = results.filter(result => result.status === 'fulfilled').length;
    const failureCount = results.filter(result => result.status === 'rejected').length;
    
    console.log(`✅ Datos de análisis limpiados: ${successCount} claves eliminadas, ${failureCount} fallos`);
    
    if (failureCount > 0) {
      console.warn('⚠️ Algunos datos de análisis no se pudieron limpiar');
    }
  } catch (error) {
    console.error('❌ Error al limpiar datos de análisis:', error);
    throw error;
  }
};

/**
 * Limpia TODAS las claves (navegación + datos)
 * Solo se usa en casos extremos o cuando el usuario confirma limpieza total
 */
export const clearAllData = async (): Promise<void> => {
  try {
    console.log('🧹 Limpiando TODOS los datos...');
    
    const allKeys = [...getNavigationKeys(), ...getAnalysisDataKeys()];
    const results = await Promise.allSettled(
      allKeys.map(key => AsyncStorage.removeItem(key))
    );
    
    const successCount = results.filter(result => result.status === 'fulfilled').length;
    const failureCount = results.filter(result => result.status === 'rejected').length;
    
    console.log(`✅ Limpieza completa: ${successCount} claves eliminadas, ${failureCount} fallos`);
    
    if (failureCount > 0) {
      console.warn('⚠️ Algunas claves no se pudieron limpiar');
    }
  } catch (error) {
    console.error('❌ Error en limpieza completa:', error);
    throw error;
  }
};

/**
 * Función helper para evitar renders prematuros
 * Devuelve un valor seguro cuando AsyncStorage está vacío o no disponible
 */
export const safe = <T>(value: T | null | undefined, fallback: T = 'N/D' as T): T => {
  if (value === null || value === undefined || value === '') {
    return fallback;
  }
  return value;
};

/**
 * Función helper para normalizar nombres de hojas de Excel
 * Elimina acentos, caracteres inválidos y corta a 31 caracteres
 */
export const enforceSheetName = (name: string): string => {
  if (!name) return 'Hoja';
  
  // Normalizar acentos y caracteres especiales
  let normalized = name
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '') // Eliminar acentos
    .replace(/[^a-zA-Z0-9\s]/g, ' ') // Solo letras, números y espacios
    .replace(/\s+/g, ' ') // Múltiples espacios a uno solo
    .trim();
  
  // Si está vacío después de normalizar, usar fallback
  if (!normalized) return 'Hoja';
  
  // Cortar a 31 caracteres máximo
  if (normalized.length > 31) {
    normalized = normalized.substring(0, 31).trim();
  }
  
  return normalized;
};

/**
 * Función helper para validar que una clave existe en el namespace correcto
 */
export const validateKeyNamespace = (key: string): boolean => {
  return key.startsWith('nav:') || key.startsWith('data:');
};

/**
 * Función helper para obtener el namespace de una clave
 */
export const getKeyNamespace = (key: string): 'nav' | 'data' | 'unknown' => {
  if (key.startsWith('nav:')) return 'nav';
  if (key.startsWith('data:')) return 'data';
  return 'unknown';
};

/**
 * Función helper para debug: listar todas las claves en AsyncStorage
 */
export const debugStorageContents = async (): Promise<Record<string, any>> => {
  try {
    const allKeys = await AsyncStorage.getAllKeys();
    const result: Record<string, any> = {};
    
    for (const key of allKeys) {
      try {
        const value = await AsyncStorage.getItem(key);
        result[key] = value;
      } catch (error) {
        result[key] = `ERROR: ${error}`;
      }
    }
    
    return result;
  } catch (error) {
    console.error('❌ Error al obtener contenido de AsyncStorage:', error);
    return {};
  }
};
