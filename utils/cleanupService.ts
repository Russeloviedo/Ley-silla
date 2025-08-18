import AsyncStorage from '@react-native-async-storage/async-storage';

// Claves de almacenamiento para limpiar
const STORAGE_KEYS_TO_CLEAN = [
  'respuestas_iniciales',
  'respuestas_flujo',
  'respuestas_ponderacion',
  'seleccion_puesto',
  'seleccion_subpuesto',
  'preguntas_iniciales_completadas',
  'diagrama_flujo_completado',
  'cuestionario_ponderacion_completado',
  'analisis_en_progreso'
];

export class CleanupService {
  /**
   * Limpia todas las respuestas y estados del análisis anterior
   */
  static async cleanPreviousAnalysis(): Promise<void> {
    try {
      console.log('🧹 Iniciando limpieza de análisis anterior...');
      
      // Limpiar cada clave de almacenamiento
      for (const key of STORAGE_KEYS_TO_CLEAN) {
        try {
          await AsyncStorage.removeItem(key);
          console.log(`✅ Limpiado: ${key}`);
        } catch (error) {
          console.warn(`⚠️ No se pudo limpiar ${key}:`, error);
        }
      }
      
      // Limpiar también las claves que podrían tener nombres diferentes
      const allKeys = await AsyncStorage.getAllKeys();
      const keysToRemove = allKeys.filter(key => 
        key.includes('respuesta') || 
        key.includes('pregunta') || 
        key.includes('seleccion') || 
        key.includes('flujo') || 
        key.includes('ponderacion') ||
        key.includes('analisis') ||
        key.includes('puesto') ||
        key.includes('subpuesto')
      );
      
      if (keysToRemove.length > 0) {
        await AsyncStorage.multiRemove(keysToRemove);
        console.log(`✅ Limpiadas ${keysToRemove.length} claves adicionales:`, keysToRemove);
      }
      
      console.log('✅ Limpieza de análisis anterior completada');
    } catch (error) {
      console.error('❌ Error durante la limpieza:', error);
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
            'preguntas_iniciales_completadas'
          ]);
          break;
        case 'flujo':
          await AsyncStorage.multiRemove([
            'respuestas_flujo',
            'diagrama_flujo_completado'
          ]);
          break;
        case 'ponderacion':
          await AsyncStorage.multiRemove([
            'respuestas_ponderacion',
            'cuestionario_ponderacion_completado'
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
        key.includes('seleccion')
      );
      
      console.log(`🔍 Verificación de respuestas guardadas: ${hasResponses ? 'SÍ' : 'NO'}`);
      return hasResponses;
    } catch (error) {
      console.error('❌ Error al verificar respuestas guardadas:', error);
      return false;
    }
  }
}

