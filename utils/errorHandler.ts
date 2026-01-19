import { Alert } from 'react-native';

// Tipos de errores
export enum ErrorType {
  NETWORK = 'NETWORK',
  STORAGE = 'STORAGE',
  VALIDATION = 'VALIDATION',
  UNKNOWN = 'UNKNOWN',
}

// Interfaz para errores personalizados
export interface AppError {
  type: ErrorType;
  message: string;
  details?: any;
}

// Función para crear errores personalizados
export function createError(type: ErrorType, message: string, details?: any): AppError {
  return {
    type,
    message,
    details,
  };
}

// Función para manejar errores de AsyncStorage
export function handleStorageError(error: any, operation: string): AppError {
  console.error(`Error en ${operation}:`, error);
  
  if (error?.message?.includes('QuotaExceededError')) {
    return createError(
      ErrorType.STORAGE,
      'No hay suficiente espacio de almacenamiento disponible',
      { operation, originalError: error }
    );
  }
  
  return createError(
    ErrorType.STORAGE,
    `Error al ${operation}: ${error?.message || 'Error desconocido'}`,
    { operation, originalError: error }
  );
}

// Función para manejar errores de validación
export function handleValidationError(field: string, value: any): AppError {
  return createError(
    ErrorType.VALIDATION,
    `Campo "${field}" tiene un valor inválido: ${value}`,
    { field, value }
  );
}

// Función para mostrar errores al usuario
export function showErrorToUser(error: AppError, title: string = 'Error') {
  Alert.alert(
    title,
    error.message,
    [{ text: 'OK', style: 'default' }]
  );
}

// Función para validar parámetros de navegación
export function validateNavigationParams(params: any): boolean {
  if (!params) {
    console.warn('Parámetros de navegación vacíos');
    return false;
  }
  
  return true;
}

// Función para parsear JSON de forma segura
export function safeJsonParse(jsonString: string | undefined, defaultValue: any = {}): any {
  if (!jsonString) return defaultValue;
  
  try {
    const parsed = JSON.parse(jsonString);
    return typeof parsed === 'object' ? parsed : defaultValue;
  } catch (error) {
    console.warn('Error al parsear JSON:', error);
    return defaultValue;
  }
}

// Función para validar respuestas de ponderación
export function validatePonderacionResponses(responses: any): boolean {
  if (!responses || typeof responses !== 'object') {
    console.warn('Respuestas inválidas:', responses);
    return false;
  }
  
  const requiredKeys = [1, 2, 3, 4, 5, 6, 7];
  const isValid = requiredKeys.every(key => {
    const value = responses[key];
    const isValidKey = value !== null && value !== undefined && typeof value === 'number';
    if (!isValidKey) {
      console.warn(`Respuesta inválida para pregunta ${key}:`, value);
    }
    return isValidKey;
  });
  
  console.log('Validación de respuestas:', { responses, isValid });
  return isValid;
} 