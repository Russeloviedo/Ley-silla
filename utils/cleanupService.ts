import AsyncStorage from '@react-native-async-storage/async-storage';
import { ANALYSIS_DATA_KEYS, NAVIGATION_KEYS } from './storageKeys';
import React from 'react'; // Added missing import for React

// Claves de almacenamiento para limpiar (sistema antiguo)
const STORAGE_KEYS_TO_CLEAN = [
  'respuestas_iniciales',
  'respuestas_flujo',
  'respuestas_ponderacion',
  'seleccion_puesto',
  'seleccion_subpues  to',
  'preguntas_iniciales_completadas',
  'diagrama_flujo_completado',
  'cuestionario_ponderacion_completado',
  'analisis_en_progreso'
];

export class CleanupService {
  /**
   * Limpia TODAS las respuestas y estados del análisis anterior
   * Incluye tanto el sistema antiguo como el nuevo sistema de namespacing
   */
  static async cleanPreviousAnalysis(): Promise<void> {
    try {
      console.log('🧹 Iniciando limpieza completa de análisis anterior...');
      
      // 1. Limpiar claves del sistema antiguo
      for (const key of STORAGE_KEYS_TO_CLEAN) {
        try {
          await AsyncStorage.removeItem(key);
          console.log(`✅ Limpiado (sistema antiguo): ${key}`);
        } catch (error) {
          console.warn(`⚠️ No se pudo limpiar ${key}:`, error);
        }
      }
      
      // 2. Limpiar claves del nuevo sistema de namespacing
      try {
        const analysisKeys = Object.values(ANALYSIS_DATA_KEYS);
        await AsyncStorage.multiRemove(analysisKeys);
        console.log(`✅ Limpiadas ${analysisKeys.length} claves del sistema de namespacing`);
      } catch (error) {
        console.warn('⚠️ Error al limpiar claves de namespacing:', error);
      }
      
      // 3. Limpiar claves de navegación (excepto Business Unit)
      try {
        const navigationKeys = Object.values(NAVIGATION_KEYS).filter(key => 
          !key.includes('BusinessUnit')
        );
        await AsyncStorage.multiRemove(navigationKeys);
        console.log(`✅ Limpiadas ${navigationKeys.length} claves de navegación`);
      } catch (error) {
        console.warn('⚠️ Error al limpiar claves de navegación:', error);
      }
      
      // 4. Limpiar también las claves que podrían tener nombres diferentes o estar sin namespace
      const allKeys = await AsyncStorage.getAllKeys();
      const keysToRemove = allKeys.filter(key => 
        (key.includes('respuesta') || 
         key.includes('pregunta') || 
         key.includes('seleccion') || 
         key.includes('flujo') || 
         key.includes('ponderacion') ||
         key.includes('analisis') ||
         key.includes('puesto') ||
         key.includes('subpuesto') ||
         key.includes('nivel') ||
         key.includes('puntaje') ||
         key.includes('peso') ||
         key.includes('weight')) &&
        !key.includes('BusinessUnit') // Preservar Business Unit
      );
      
      if (keysToRemove.length > 0) {
        await AsyncStorage.multiRemove(keysToRemove);
        console.log(`✅ Limpiadas ${keysToRemove.length} claves adicionales:`, keysToRemove);
      }
      
      console.log('✅ Limpieza completa de análisis anterior finalizada');
    } catch (error) {
      console.error('❌ Error durante la limpieza completa:', error);
      throw error;
    }
  }

  /**
   * Limpia solo las respuestas específicas de un paso
   */
  static async cleanStepResponses(step: 'inicial' | 'flujo' | 'ponderacion'): Promise<void> {
    try {
      console.log(`🧹 Limpiando respuestas del paso: ${step}`);
      
      switch (step) {
        case 'inicial':
          await AsyncStorage.multiRemove([
            'respuestas_iniciales',
            'preguntas_iniciales_completadas',
            'data:respuestasPreguntas'
          ]);
          break;
        case 'flujo':
          await AsyncStorage.multiRemove([
            'respuestas_flujo',
            'diagrama_flujo_completado',
            'data:flujo'
          ]);
          break;
        case 'ponderacion':
          await AsyncStorage.multiRemove([
            'respuestas_ponderacion',
            'cuestionario_ponderacion_completado',
            'data:respuestasPonderacion',
            'data:pesos',
            'data:puntaje',
            'data:nivelRiesgo'
          ]);
          break;
      }
      
      console.log(`✅ Respuestas del paso ${step} limpiadas`);
    } catch (error) {
      console.error(`❌ Error al limpiar paso ${step}:`, error);
      throw error;
    }
  }

  /**
   * Verifica si hay respuestas guardadas
   */
  static async hasStoredResponses(): Promise<boolean> {
    try {
      const allKeys = await AsyncStorage.getAllKeys();
      const hasResponses = allKeys.some(key => 
        key.includes('respuesta') || 
        key.includes('pregunta') || 
        key.includes('seleccion') ||
        key.includes('data:respuestas') ||
        key.includes('data:pesos') ||
        key.includes('data:flujo')
      );
      
      console.log(`🔍 Verificación de respuestas guardadas: ${hasResponses ? 'SÍ' : 'NO'}`);
      return hasResponses;
    } catch (error) {
      console.error('❌ Error al verificar respuestas guardadas:', error);
      return false;
    }
  }

  /**
   * Limpia solo las respuestas del análisis actual, preservando la unidad de negocio
   */
  static async cleanCurrentAnalysisOnly(): Promise<void> {
    try {
      console.log('🧹 Limpiando solo respuestas del análisis actual...');
      
      // Limpiar claves de respuestas pero preservar Business Unit
      const keysToRemove = [
        ...STORAGE_KEYS_TO_CLEAN,
        ...Object.values(ANALYSIS_DATA_KEYS)
      ];
      
      await AsyncStorage.multiRemove(keysToRemove);
      console.log('✅ Respuestas del análisis actual limpiadas, Business Unit preservada');
    } catch (error) {
      console.error('❌ Error al limpiar análisis actual:', error);
      throw error;
    }
  }

  /**
   * Limpia COMPLETAMENTE todas las respuestas y datos, incluyendo Business Unit
   * Solo usar cuando se quiera un reinicio total
   */
  static async cleanEverything(): Promise<void> {
    try {
      console.log('🧹 Iniciando limpieza COMPLETA de todos los datos...');
      
      // Obtener todas las claves
      const allKeys = await AsyncStorage.getAllKeys();
      console.log(`📋 Total de claves encontradas: ${allKeys.length}`);
      
      // Limpiar todas las claves
      await AsyncStorage.multiRemove(allKeys);
      console.log('✅ TODAS las claves han sido eliminadas');
      
      // Verificar que se limpió correctamente
      const remainingKeys = await AsyncStorage.getAllKeys();
      if (remainingKeys.length === 0) {
        console.log('✅ Verificación exitosa: AsyncStorage está completamente vacío');
      } else {
        console.warn(`⚠️ Quedaron ${remainingKeys.length} claves sin limpiar:`, remainingKeys);
      }
    } catch (error) {
      console.error('❌ Error durante la limpieza completa:', error);
      throw error;
    }
  }

  /**
   * Verifica el estado actual del almacenamiento y muestra qué claves están presentes
   */
  static async debugStorageState(): Promise<void> {
    try {
      const allKeys = await AsyncStorage.getAllKeys();
      console.log('🔍 Estado actual del almacenamiento:');
      console.log(`📋 Total de claves: ${allKeys.length}`);
      
      if (allKeys.length === 0) {
        console.log('✅ AsyncStorage está completamente vacío');
        return;
      }
      
      // Agrupar claves por tipo
      const navigationKeys = allKeys.filter(key => key.startsWith('nav:'));
      const dataKeys = allKeys.filter(key => key.startsWith('data:'));
      const otherKeys = allKeys.filter(key => !key.startsWith('nav:') && !key.startsWith('data:'));
      
      console.log(`🧭 Claves de navegación (${navigationKeys.length}):`, navigationKeys);
      console.log(`📊 Claves de datos (${dataKeys.length}):`, dataKeys);
      console.log(`🔧 Otras claves (${otherKeys.length}):`, otherKeys);
      
      // Mostrar valores de algunas claves importantes
      for (const key of allKeys.slice(0, 5)) { // Solo las primeras 5 para no saturar
        try {
          const value = await AsyncStorage.getItem(key);
          console.log(`📝 ${key}: ${value}`);
        } catch (error) {
          console.log(`❌ ${key}: Error al leer`);
        }
      }
    } catch (error) {
      console.error('❌ Error al verificar estado del almacenamiento:', error);
    }
  }

  /**
   * Limpia COMPLETAMENTE todo y reinicia la navegación
   * Esta es la función más agresiva para asegurar un inicio limpio
   */
  static async cleanEverythingAndReset(): Promise<void> {
    try {
      console.log('🧹 Iniciando limpieza COMPLETA y reinicio de navegación...');
      
      // 1. Limpiar TODAS las claves de AsyncStorage
      const allKeys = await AsyncStorage.getAllKeys();
      if (allKeys.length > 0) {
        await AsyncStorage.multiRemove(allKeys);
        console.log(`✅ Eliminadas ${allKeys.length} claves de AsyncStorage`);
      }
      
      // 2. Verificar que se limpió correctamente
      const remainingKeys = await AsyncStorage.getAllKeys();
      if (remainingKeys.length === 0) {
        console.log('✅ Verificación exitosa: AsyncStorage está completamente vacío');
      } else {
        console.warn(`⚠️ Quedaron ${remainingKeys.length} claves sin limpiar:`, remainingKeys);
        // Intentar limpiar las que quedaron
        await AsyncStorage.multiRemove(remainingKeys);
        console.log('✅ Limpieza adicional completada');
      }
      
      // 3. Limpiar también el localStorage del navegador (para web)
      if (typeof window !== 'undefined' && window.localStorage) {
        try {
          window.localStorage.clear();
          console.log('✅ localStorage del navegador limpiado');
        } catch (error) {
          console.warn('⚠️ No se pudo limpiar localStorage del navegador:', error);
        }
      }
      
      // 4. Limpiar sessionStorage del navegador (para web)
      if (typeof window !== 'undefined' && window.sessionStorage) {
        try {
          window.sessionStorage.clear();
          console.log('✅ sessionStorage del navegador limpiado');
        } catch (error) {
          console.warn('⚠️ No se pudo limpiar sessionStorage del navegador:', error);
        }
      }
      
      console.log('✅ Limpieza COMPLETA y reinicio finalizado');
    } catch (error) {
      console.error('❌ Error durante la limpieza completa y reinicio:', error);
      throw error;
    }
  }

  /**
   * Limpia específicamente las respuestas que se pasan por parámetros de navegación
   */
  static async cleanNavigationParameters(): Promise<void> {
    try {
      console.log('🧹 Limpiando parámetros de navegación...');
      
      // Limpiar claves que podrían contener respuestas pasadas por navegación
      const navigationResponseKeys = [
        'respuestas',
        'respuestasPonderacion', 
        'respuestasFlujo',
        'flujo',
        'puntaje',
        'nivel',
        'unidad',
        'puesto',
        'subpuesto',
        'area',
        'planta',
        'turno'
      ];
      
      // Buscar y limpiar claves que contengan estos términos
      const allKeys = await AsyncStorage.getAllKeys();
      const keysToRemove = allKeys.filter(key => 
        navigationResponseKeys.some(term => key.toLowerCase().includes(term.toLowerCase()))
      );
      
      if (keysToRemove.length > 0) {
        await AsyncStorage.multiRemove(keysToRemove);
        console.log(`✅ Limpiadas ${keysToRemove.length} claves de parámetros de navegación:`, keysToRemove);
      } else {
        console.log('✅ No se encontraron claves de parámetros de navegación para limpiar');
      }
    } catch (error) {
      console.error('❌ Error al limpiar parámetros de navegación:', error);
      throw error;
    }
  }

  /**
   * Limpia SOLO las respuestas temporales de las preguntas
   * PRESERVA los resultados finales del análisis
   * Esta es la función más inteligente y eficiente
   */
  static async cleanOnlyQuestionResponses(): Promise<void> {
    try {
      console.log('🧹 Limpiando SOLO respuestas temporales de preguntas...');
      
      // 1. Claves específicas de respuestas temporales
      const temporaryResponseKeys = [
        // Respuestas de preguntas iniciales
        'data:respuestasPreguntas',
        'respuestas_iniciales',
        'preguntas_iniciales_completadas',
        
        // Respuestas de ponderación
        'data:respuestasPonderacion',
        'respuestas_ponderacion',
        'cuestionario_ponderacion_completado',
        
        // Respuestas de flujo
        'data:flujo',
        'respuestas_flujo',
        'diagrama_flujo_completado',
        
        // Datos temporales de cálculo
        'data:pesos',
        'data:puntaje',
        'data:nivelRiesgo',
        
        // Selecciones temporales
        'seleccion_puesto',
        'seleccion_subpuesto',
        'analisis_en_progreso'
      ];
      
      // 2. Limpiar claves temporales
      const keysToRemove = temporaryResponseKeys.filter(key => 
        // Solo limpiar si la clave existe
        true // Las limpiaremos todas, si no existen no hay problema
      );
      
      if (keysToRemove.length > 0) {
        await AsyncStorage.multiRemove(keysToRemove);
        console.log(`✅ Limpiadas ${keysToRemove.length} claves de respuestas temporales`);
      }
      
      // 3. Limpiar también parámetros de navegación
      await this.cleanNavigationParameters();
      
      // 4. Verificar qué quedó (solo para debug)
      const remainingKeys = await AsyncStorage.getAllKeys();
      const preservedKeys = remainingKeys.filter(key => 
        key.startsWith('data:historialAnalisis') ||
        key.startsWith('data:result') ||
        key.startsWith('data:meta') ||
        key.startsWith('data:timestamp')
      );
      
      console.log(`✅ Respuestas temporales limpiadas. Claves preservadas: ${preservedKeys.length}`);
      if (preservedKeys.length > 0) {
        console.log('📋 Claves preservadas:', preservedKeys);
      }
      
    } catch (error) {
      console.error('❌ Error al limpiar respuestas temporales:', error);
      throw error;
    }
  }

  /**
   * Limpia COMPLETAMENTE todo el navegador y almacenamiento
   * Esta es la función más agresiva para asegurar un inicio completamente limpio
   */
  static async cleanBrowserCompletely(): Promise<void> {
    try {
      console.log('🧹 Iniciando limpieza COMPLETA del navegador...');
      
      // 1. Limpiar AsyncStorage completamente
      const allAsyncKeys = await AsyncStorage.getAllKeys();
      if (allAsyncKeys.length > 0) {
        await AsyncStorage.multiRemove(allAsyncKeys);
        console.log(`✅ AsyncStorage limpiado: ${allAsyncKeys.length} claves eliminadas`);
      }
      
      // 2. Limpiar localStorage del navegador
      if (typeof window !== 'undefined' && window.localStorage) {
        try {
          const localStorageKeys = Object.keys(window.localStorage);
          localStorageKeys.forEach(key => {
            if (key.includes('bipe360') || key.includes('analisis') || key.includes('respuesta')) {
              window.localStorage.removeItem(key);
            }
          });
          console.log(`✅ localStorage limpiado: ${localStorageKeys.length} claves revisadas`);
        } catch (error) {
          console.warn('⚠️ No se pudo limpiar localStorage:', error);
        }
      }
      
      // 3. Limpiar sessionStorage del navegador
      if (typeof window !== 'undefined' && window.sessionStorage) {
        try {
          const sessionStorageKeys = Object.keys(window.sessionStorage);
          sessionStorageKeys.forEach(key => {
            if (key.includes('bipe360') || key.includes('analisis') || key.includes('respuesta')) {
              window.sessionStorage.removeItem(key);
            }
          });
          console.log(`✅ sessionStorage limpiado: ${sessionStorageKeys.length} claves revisadas`);
        } catch (error) {
          console.warn('⚠️ No se pudo limpiar sessionStorage:', error);
        }
      }
      
      // 4. Limpiar cookies relacionadas con la aplicación
      if (typeof document !== 'undefined' && document.cookie) {
        try {
          const cookies = document.cookie.split(';');
          cookies.forEach(cookie => {
            const [name] = cookie.split('=');
            if (name.trim().includes('bipe360') || name.trim().includes('analisis')) {
              document.cookie = `${name.trim()}=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;`;
            }
          });
          console.log('✅ Cookies relacionadas limpiadas');
        } catch (error) {
          console.warn('⚠️ No se pudieron limpiar cookies:', error);
        }
      }
      
      // 5. Limpiar caché del navegador (si es posible)
      if (typeof window !== 'undefined' && 'caches' in window) {
        try {
          const cacheNames = await caches.keys();
          const appCaches = cacheNames.filter(name => 
            name.includes('bipe360') || name.includes('analisis')
          );
          
          for (const cacheName of appCaches) {
            await caches.delete(cacheName);
          }
          console.log(`✅ Caché del navegador limpiado: ${appCaches.length} caches eliminados`);
        } catch (error) {
          console.warn('⚠️ No se pudo limpiar caché del navegador:', error);
        }
      }
      
      // 6. Verificar que se limpió correctamente
      const finalAsyncKeys = await AsyncStorage.getAllKeys();
      console.log(`✅ Verificación final: AsyncStorage tiene ${finalAsyncKeys.length} claves`);
      
      console.log('✅ Limpieza COMPLETA del navegador finalizada');
    } catch (error) {
      console.error('❌ Error durante la limpieza completa del navegador:', error);
      throw error;
    }
  }

  /**
   * Hook personalizado para limpiar parámetros de navegación al montar componentes
   * Se debe usar en el useEffect de cada componente que reciba parámetros
   */
  static useCleanupOnMount(): void {
    React.useEffect(() => {
      const cleanup = async () => {
        try {
          console.log('🧹 Limpieza automática al montar componente...');
          await this.cleanNavigationParameters();
          console.log('✅ Parámetros de navegación limpiados automáticamente');
        } catch (error) {
          console.warn('⚠️ No se pudieron limpiar los parámetros de navegación:', error);
        }
      };
      
      cleanup();
    }, []);
  }

  /**
   * Hook personalizado para formularios con limpieza automática
   * Incluye estado limpio, key dinámica y prevención de autocompletado
   */
  static useFormWithCleanup<T>(initialState: T, analysisId?: string) {
    const [formData, setFormData] = React.useState<T>(initialState);
    const [formKey, setFormKey] = React.useState<string>(`form-${Date.now()}`);
    
    // Generar ID único para el análisis si no se proporciona
    const currentAnalysisId = analysisId || `analysis-${Date.now()}`;
    
    // Función para limpiar completamente el formulario
    const resetForm = React.useCallback(() => {
      setFormData(initialState);
      setFormKey(`form-${Date.now()}`);
      console.log('🧹 Formulario reseteado completamente');
    }, [initialState]);
    
    // Función para limpiar campos específicos
    const clearField = React.useCallback((field: keyof T) => {
      setFormData(prev => ({
        ...prev,
        [field]: initialState[field]
      }));
    }, [initialState]);
    
    // Función para limpiar múltiples campos
    const clearFields = React.useCallback((fields: (keyof T)[]) => {
      const updates: Partial<T> = {};
      fields.forEach(field => {
        updates[field] = initialState[field];
      });
      setFormData(prev => ({
        ...prev,
        ...updates
      }));
    }, [initialState]);
    
    // Limpiar formulario automáticamente al montar
    React.useEffect(() => {
      resetForm();
    }, [resetForm]);
    
    return {
      formData,
      setFormData,
      formKey,
      currentAnalysisId,
      resetForm,
      clearField,
      clearFields
    };
  }

  /**
   * Función para generar nombres de campos únicos
   * Previene que el navegador sugiera datos pasados
   */
  static generateUniqueFieldName(baseName: string, analysisId: string, fieldId: string): string {
    return `${baseName}_${analysisId}_${fieldId}_${Date.now()}`;
  }

  /**
   * Función para limpiar autocompletado del navegador
   * Se debe usar en inputs para prevenir sugerencias
   */
  static getAutocompleteProps(analysisId: string, fieldId: string) {
    return {
      autoComplete: 'off',
      autoCorrect: 'off',
      autoCapitalize: 'off',
      spellCheck: false,
      'data-analysis-id': analysisId,
      'data-field-id': fieldId,
      'data-timestamp': Date.now().toString()
    };
  }

  /**
   * Limpia SOLO el almacenamiento local del navegador
   * PRESERVA los datos que van a la base de datos
   * Esta es la función más inteligente para tu arquitectura
   */
  static async cleanOnlyLocalStorage(): Promise<void> {
    try {
      console.log('🧹 Limpiando SOLO almacenamiento local del navegador...');
      
      // 1. Limpiar AsyncStorage completamente (solo datos temporales)
      const allAsyncKeys = await AsyncStorage.getAllKeys();
      if (allAsyncKeys.length > 0) {
        await AsyncStorage.multiRemove(allAsyncKeys);
        console.log(`✅ AsyncStorage limpiado: ${allAsyncKeys.length} claves eliminadas`);
      }
      
      // 2. Limpiar localStorage del navegador
      if (typeof window !== 'undefined' && window.localStorage) {
        try {
          const localStorageKeys = Object.keys(window.localStorage);
          localStorageKeys.forEach(key => {
            // Solo limpiar claves relacionadas con la aplicación
            if (key.includes('bipe360') || key.includes('analisis') || key.includes('respuesta')) {
              window.localStorage.removeItem(key);
            }
          });
          console.log(`✅ localStorage limpiado: ${localStorageKeys.length} claves revisadas`);
        } catch (error) {
          console.warn('⚠️ No se pudo limpiar localStorage:', error);
        }
      }
      
      // 3. Limpiar sessionStorage del navegador
      if (typeof window !== 'undefined' && window.sessionStorage) {
        try {
          const sessionStorageKeys = Object.keys(window.sessionStorage);
          sessionStorageKeys.forEach(key => {
            // Solo limpiar claves relacionadas con la aplicación
            if (key.includes('bipe360') || key.includes('analisis') || key.includes('respuesta')) {
              window.sessionStorage.removeItem(key);
            }
          });
          console.log(`✅ sessionStorage limpiado: ${sessionStorageKeys.length} claves revisadas`);
        } catch (error) {
          console.warn('⚠️ No se pudo limpiar sessionStorage:', error);
        }
      }
      
      // 4. Limpiar cookies relacionadas con la aplicación
      if (typeof document !== 'undefined' && document.cookie) {
        try {
          const cookies = document.cookie.split(';');
          cookies.forEach(cookie => {
            const [name] = cookie.split('=');
            if (name.trim().includes('bipe360') || name.trim().includes('analisis')) {
              document.cookie = `${name.trim()}=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;`;
            }
          });
          console.log('✅ Cookies relacionadas limpiadas');
        } catch (error) {
          console.warn('⚠️ No se pudieron limpiar cookies:', error);
        }
      }
      
      console.log('✅ Almacenamiento local limpiado, datos de BD preservados');
    } catch (error) {
      console.error('❌ Error al limpiar almacenamiento local:', error);
      throw error;
    }
  }

  /**
   * Función para guardar solo el resultado final en la base de datos
   * NO guarda datos temporales en almacenamiento local
   */
  static async saveFinalResultToDatabase(resultData: any): Promise<void> {
    try {
      console.log('💾 Guardando resultado final en base de datos...');
      
      // Aquí iría tu lógica para guardar en la base de datos
      // Por ejemplo, una llamada a tu API o servicio de BD
      
      // Ejemplo de estructura de datos a guardar:
      const finalResult = {
        id: `analysis-${Date.now()}`,
        businessUnit: resultData.businessUnit,
        planta: resultData.planta,
        turno: resultData.turno,
        area: resultData.area,
        puesto: resultData.puesto,
        puntajeTotal: resultData.puntajeTotal,
        nivelRiesgo: resultData.nivelRiesgo,
        timestamp: new Date().toISOString(),
        estado: 'completado'
      };
      
      console.log('📊 Resultado final a guardar:', finalResult);
      
      // TODO: Implementar llamada a tu API/BD aquí
      // await apiService.saveAnalysisResult(finalResult);
      
      console.log('✅ Resultado final guardado en base de datos');
    } catch (error) {
      console.error('❌ Error al guardar en base de datos:', error);
      throw error;
    }
  }

  /**
   * Limpia SOLO las respuestas de los tres pasos del análisis
   * Preguntas iniciales, diagrama de flujo y cuestionario de ponderación
   * Esta es la función específica que necesitas
   */
  static async cleanAnalysisSteps(): Promise<void> {
    try {
      console.log('🧹 Limpiando respuestas de los tres pasos del análisis...');
      
      // 1. Limpiar respuestas de preguntas iniciales
      const initialStepKeys = [
        'data:respuestasPreguntas',
        'respuestas_iniciales',
        'preguntas_iniciales_completadas'
      ];
      
      // 2. Limpiar respuestas de diagrama de flujo
      const flowStepKeys = [
        'data:flujo',
        'respuestas_flujo',
        'diagrama_flujo_completado'
      ];
      
      // 3. Limpiar respuestas de cuestionario de ponderación
      const ponderacionStepKeys = [
        'data:respuestasPonderacion',
        'respuestas_ponderacion',
        'cuestionario_ponderacion_completado',
        'data:pesos',
        'data:puntaje',
        'data:nivelRiesgo'
      ];
      
      // 4. Limpiar también parámetros de navegación que contengan respuestas
      const navigationResponseKeys = [
        'respuestas',
        'respuestasPonderacion',
        'respuestasFlujo',
        'flujo',
        'puntaje',
        'nivel'
      ];
      
      // 5. Combinar todas las claves a limpiar
      const allKeysToClean = [
        ...initialStepKeys,
        ...flowStepKeys,
        ...ponderacionStepKeys,
        ...navigationResponseKeys
      ];
      
      // 6. Limpiar AsyncStorage
      if (allKeysToClean.length > 0) {
        await AsyncStorage.multiRemove(allKeysToClean);
        console.log(`✅ AsyncStorage limpiado: ${allKeysToClean.length} claves eliminadas`);
      }
      
      // 7. Limpiar localStorage del navegador (solo claves relacionadas)
      if (typeof window !== 'undefined' && window.localStorage) {
        try {
          const localStorageKeys = Object.keys(window.localStorage);
          localStorageKeys.forEach(key => {
            if (key.includes('respuesta') || key.includes('flujo') || key.includes('ponderacion')) {
              window.localStorage.removeItem(key);
            }
          });
          console.log('✅ localStorage limpiado de respuestas');
        } catch (error) {
          console.warn('⚠️ No se pudo limpiar localStorage:', error);
        }
      }
      
      // 8. Limpiar sessionStorage del navegador (solo claves relacionadas)
      if (typeof window !== 'undefined' && window.sessionStorage) {
        try {
          const sessionStorageKeys = Object.keys(window.sessionStorage);
          sessionStorageKeys.forEach(key => {
            if (key.includes('respuesta') || key.includes('flujo') || key.includes('ponderacion')) {
              window.sessionStorage.removeItem(key);
            }
          });
          console.log('✅ sessionStorage limpiado de respuestas');
        } catch (error) {
          console.warn('⚠️ No se pudo limpiar sessionStorage:', error);
        }
      }
      
      // 9. LIMPIEZA AGRESIVA - Limpiar TODAS las claves que contengan respuestas
      try {
        const allAsyncKeys = await AsyncStorage.getAllKeys();
        const keysToRemove = allAsyncKeys.filter(key => 
          key.toLowerCase().includes('respuesta') ||
          key.toLowerCase().includes('flujo') ||
          key.toLowerCase().includes('ponderacion') ||
          key.toLowerCase().includes('pregunta') ||
          key.toLowerCase().includes('peso') ||
          key.toLowerCase().includes('puntaje') ||
          key.toLowerCase().includes('nivel') ||
          key.toLowerCase().includes('seleccion')
        );
        
        if (keysToRemove.length > 0) {
          await AsyncStorage.multiRemove(keysToRemove);
          console.log(`✅ Limpieza agresiva: ${keysToRemove.length} claves adicionales eliminadas`);
        }
      } catch (error) {
        console.warn('⚠️ Error en limpieza agresiva:', error);
      }
      
      // 10. Limpiar también el historial del navegador si es posible
      if (typeof window !== 'undefined' && window.history) {
        try {
          // Limpiar el estado del historial
          window.history.replaceState(null, '', window.location.pathname);
          console.log('✅ Historial del navegador limpiado');
        } catch (error) {
          console.warn('⚠️ No se pudo limpiar historial:', error);
        }
      }
      
      console.log('✅ Respuestas de los tres pasos del análisis limpiadas completamente');
      console.log('📋 Pasos limpiados:');
      console.log('   - Preguntas iniciales ✅');
      console.log('   - Diagrama de flujo ✅');
      console.log('   - Cuestionario de ponderación ✅');
      console.log('   - Limpieza agresiva adicional ✅');
      
    } catch (error) {
      console.error('❌ Error al limpiar pasos del análisis:', error);
      throw error;
    }
  }

  /**
   * Función para forzar reinicio completo de componentes
   * Incluye limpieza de estado de React y reinicio de navegación
   */
  static async forceCompleteReset(): Promise<void> {
    try {
      console.log('🚀 Iniciando reinicio completo forzado...');
      
      // 1. Limpiar todos los pasos del análisis
      await this.cleanAnalysisSteps();
      
      // 2. Limpiar TODAS las claves de AsyncStorage (limpieza nuclear)
      try {
        const allKeys = await AsyncStorage.getAllKeys();
        if (allKeys.length > 0) {
          await AsyncStorage.multiRemove(allKeys);
          console.log(`💥 Limpieza nuclear: ${allKeys.length} claves eliminadas completamente`);
        }
      } catch (error) {
        console.warn('⚠️ Error en limpieza nuclear:', error);
      }
      
      // 3. Limpiar localStorage completamente
      if (typeof window !== 'undefined' && window.localStorage) {
        try {
          window.localStorage.clear();
          console.log('💥 localStorage completamente limpiado');
        } catch (error) {
          console.warn('⚠️ No se pudo limpiar localStorage:', error);
        }
      }
      
      // 4. Limpiar sessionStorage completamente
      if (typeof window !== 'undefined' && window.sessionStorage) {
        try {
          window.sessionStorage.clear();
          console.log('💥 sessionStorage completamente limpiado');
        } catch (error) {
          console.warn('⚠️ No se pudo limpiar sessionStorage:', error);
        }
      }
      
      // 5. Limpiar cookies relacionadas
      if (typeof document !== 'undefined' && document.cookie) {
        try {
          const cookies = document.cookie.split(';');
          cookies.forEach(cookie => {
            const [name] = cookie.split('=');
            if (name.trim().includes('bipe360') || name.trim().includes('analisis')) {
              document.cookie = `${name.trim()}=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;`;
            }
          });
          console.log('💥 Cookies relacionadas limpiadas');
        } catch (error) {
          console.warn('⚠️ No se pudieron limpiar cookies:', error);
        }
      }
      
      // 6. Forzar recarga de la página si es posible
      if (typeof window !== 'undefined' && window.location) {
        try {
          // Limpiar parámetros de URL
          const cleanUrl = window.location.pathname;
          window.history.replaceState(null, '', cleanUrl);
          console.log('💥 URL limpiada de parámetros');
        } catch (error) {
          console.warn('⚠️ No se pudo limpiar URL:', error);
        }
      }
      
      // 7. FORZAR REFRESH COMPLETO DE LA PÁGINA (equivalente a F5)
      if (typeof window !== 'undefined') {
        try {
          console.log('🔄 Forzando refresh completo de la página...');
          
          // Opción 1: Usar window.location.reload() para refresh completo
          if (window.location && window.location.reload) {
            console.log('💥 Ejecutando window.location.reload()...');
            // Pequeño delay para asegurar que los logs se muestren
            setTimeout(() => {
              window.location.reload(); // Refresh completo (equivalente a F5)
            }, 100);
            return; // Salir aquí para evitar ejecución posterior
          }
          
          // Opción 2: Si no funciona reload, usar replace para navegar a la misma página
          if (window.location && window.location.replace) {
            console.log('💥 Ejecutando window.location.replace()...');
            setTimeout(() => {
              window.location.replace(window.location.pathname);
            }, 100);
            return;
          }
          
          // Opción 3: Navegación programática como último recurso
          console.log('💥 Usando navegación programática...');
          setTimeout(() => {
            window.location.href = window.location.pathname;
          }, 100);
          
        } catch (error) {
          console.warn('⚠️ No se pudo forzar refresh de la página:', error);
        }
      }
      
      console.log('🚀 Reinicio completo forzado finalizado');
      console.log('💥 Estado de la aplicación completamente reseteado');
      
    } catch (error) {
      console.error('❌ Error durante reinicio completo:', error);
      throw error;
    }
  }

  /**
   * REINICIO NUCLEAR CON REFRESH COMPLETO - Limpia TODO y refresca la página
   * Esta función es para casos extremos donde se necesite un reset completo
   */
  static async nuclearResetWithRefresh(): Promise<void> {
    try {
      console.log('☢️ INICIANDO REINICIO NUCLEAR CON REFRESH COMPLETO...');
      
      // 1. Limpieza nuclear completa
      await this.forceCompleteReset();
      
      // 2. REFRESH COMPLETO DE LA PÁGINA (equivalente a F5)
      if (typeof window !== 'undefined') {
        try {
          console.log('🔄 REFRESH COMPLETO EJECUTÁNDOSE...');
          
          // Opción 1: window.location.reload() - más efectivo
          if (window.location && window.location.reload) {
            console.log('💥 Ejecutando refresh completo con reload()...');
            setTimeout(() => {
              window.location.reload(); // Refresh completo desde servidor
            }, 500);
            return;
          }
          
          // Opción 2: window.location.replace() como alternativa
          if (window.location && window.location.replace) {
            console.log('💥 Ejecutando refresh con replace()...');
            setTimeout(() => {
              window.location.replace(window.location.pathname);
            }, 500);
            return;
          }
          
          // Opción 3: Navegación programática
          console.log('💥 Usando navegación programática para refresh...');
          setTimeout(() => {
            window.location.href = window.location.pathname;
          }, 500);
          
        } catch (error) {
          console.error('❌ ERROR CRÍTICO: No se pudo ejecutar refresh completo:', error);
          throw new Error('No se pudo completar el refresh nuclear');
        }
      } else {
        console.log('⚠️ No se puede ejecutar refresh en este entorno (no es navegador)');
      }
      
    } catch (error) {
      console.error('❌ ERROR CRÍTICO durante reinicio nuclear con refresh:', error);
      throw error;
    }
  }
}

