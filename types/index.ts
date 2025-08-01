// Tipos para las unidades de negocio
export type UnidadNegocio = 
  | 'IRRIGACIÓN MANTENIMIENTO'
  | 'IRRIGACIÓN MOLDEO'
  | 'IRRIGACIÓN ENSAMBLE'
  | 'IRRIGACIÓN CALIDAD'
  | 'IRRIGACIÓN MATERIALES'
  | 'FX'
  | 'DD ENSAMBLE MODULOS.CELDAS'
  | 'DD MOLDEO'
  | 'DD CALIDAD'
  | 'DD ALMACEN'
  | 'HCM PRODUCCIÓN'
  | 'HCM CALIDAD'
  | 'HCM ALMACÉN'
  | 'ALMACÉN'
  | 'MANTENIMIENTO'
  | 'TOOL ROOM'
  | 'ADMINISTRATIVO';

// Tipos para niveles de riesgo
export type NivelRiesgo = 'Bajo' | 'Medio' | 'Alto' | 'Desconocido' | 'No aplica';

// Tipos para respuestas de preguntas iniciales
export interface RespuestasIniciales {
  [key: number]: string | null;
}

// Tipos para respuestas de ponderación
export interface RespuestasPonderacion {
  [key: number]: number | null;
}

// Tipos para opciones de ponderación
export interface OpcionPonderacion {
  texto: string;
  puntos: number;
}

// Tipos para preguntas de ponderación
export interface PreguntaPonderacion {
  id: number;
  texto: string;
  opciones: OpcionPonderacion[];
}

// Tipos para el resultado de nivel de riesgo
export interface ResultadoNivelRiesgo {
  nivel: NivelRiesgo;
  color: string;
}

// Tipos para el historial de análisis
export interface HistorialAnalisis {
  unidad: string;
  puesto: string;
  subpuesto: string;
  flujo: string;
  puntaje: number;
  nivel: NivelRiesgo;
  fecha: string;
  // Preguntas iniciales
  pregunta1: string;
  pregunta2: string;
  pregunta3: string;
  pregunta4: string;
  pregunta5: string;
  pregunta6: string;
  pregunta7: string;
  pregunta8: string;
  pregunta9: string;
  // Ponderaciones
  ponderacion1: number;
  ponderacion2: number;
  ponderacion3: number;
  ponderacion4: number;
  ponderacion5: number;
  ponderacion6: number;
  ponderacion7: number;
}

// Tipos para parámetros de navegación
export interface NavigationParams {
  unidad?: string;
  puesto?: string;
  subpuesto?: string;
  flujo?: string;
  puntaje?: number;
  nivel?: string;
  respuestas?: string;
  respuestasPonderacion?: string;
}

// Tipos para recomendaciones
export type TipoRecomendacion = 
  | 'NO_DECRETO'
  | 'SILLA_DETERMINADO'
  | 'SILLA_CERCA'
  | 'SILLA_CARACTERISTICAS'; 