// Tipos para el sistema de selección original (3 niveles)
export type UnidadDeNegocio = 'DD' | 'FX' | 'HCM' | 'Irrigación' | 'SOPORTE';

export type Position = 'Supervisor de producción Sr.' | 'Supervisor de producción ll' | 'Asistente de supervisor de ensamble DD' | 'Asistente de control de producción' | 'Practicante' | 'Operador universal' | 'Ensamblador' | 'Surtidor de materiales' | 'Supervisor de producción lll' | 'Principal supervisor de Moldeo' | 'Supervisor de Moldeo lll' | 'Supervisor de Moldeo Jr.' | 'Separador de partes' | 'Coordinador gestion herramientas mfg' | 'Coordinador tecnicos de moldeo' | 'Limpiador de moldes' | 'Mezclador de resinas' | 'Mezclador de resinas sr.' | 'Tecnico de moldeo l' | 'Tecnico de moldeo ll' | 'Tecnico de moldeo lll' | 'Tecnico de set up l' | 'Tecnico de set up lll' | 'Auxiliar de mantenimiento';

export type SubPosition = 'Nivel 1' | 'Nivel 2' | 'Nivel 3' | 'Nivel 4' | 'Nivel 5';

// Tipos para la nueva estructura de 5 niveles
export type Plant = 'Planta 1' | 'Planta 2' | 'Planta 3';
export type Shift = 'A001' | 'A002' | 'AD01' | 'AD02' | 'AD03' | 'AM01' | 'LS01' | 'LS02' | 'LS03' | 'PP' | 'PP3';
export type Area = 'PGJ' | 'PROSPRAY' | 'VALVULAS' | 'I-20-25-40' | 'I-20-25-41' | 'I-20-25-42' | 'I-20-25-43' | 'I-20-25-44' | 'I-20-25-45' | 'I-20-25-46' | 'GOLF' | 'SRN' | 'SENSORES' | 'AUTOMATIZACION PGJ' | 'HIGH POP' | 'ACCUSYNC' | 'PSU ULTRA' | 'SUB-ENSAMBLE I SERIES' | 'MOLDEO P1' | 'MOLDEOP2' | 'SOLENOIDES';

// Tipos adicionales para la aplicación
export type NivelRiesgo = 'Bajo' | 'Medio' | 'Alto';

export interface RespuestasPonderacion {
  [key: string]: number | null;
}

export interface ResultadoNivelRiesgo {
  nivel: NivelRiesgo;
  puntuacion: number;
  fecha: string;
  color?: string;
}

// Respuestas de las preguntas iniciales
export interface RespuestasIniciales {
  horasPuesto: string; // 8, 9, 10, 12 horas
  descansosAdicionales: string; // Sí, No
}

// Respuestas del cuestionario de ponderación
export interface RespuestasPonderacionCompletas {
  tiempoPie: number; // 1, 2, 3
  cambioPostura: number; // 1, 2, 3
  superficieTrabajo: number; // 1, 2, 3
  calzado: number; // 1, 2, 3
  espacioMovimiento: number; // 1, 2, 3
  malestares: number; // 1, 2, 3
  pausas: number; // 1, 2, 3
}

export interface HistorialAnalisis {
  // Campos legacy para compatibilidad
  unidad: string;
  puesto: string;
  subpuesto: string;
  
  // Nueva estructura de 5 niveles
  unidadDeNegocio: string;
  planta: string;
  turno: string;
  area: string;
  // puesto ya está definido arriba
  
  // Respuestas del flujo de decisión
  flujo: string;
  
  // Respuestas del cuestionario de ponderación
  ponderacion1: number | string; // tiempoPie
  ponderacion2: number | string; // cambioPostura
  ponderacion3: number | string; // superficieTrabajo
  ponderacion4: number | string; // calzado
  ponderacion5: number | string; // espacioMovimiento
  ponderacion6: number | string; // malestares
  ponderacion7: number | string; // pausas
  
  // Resultados finales
  nivel: string;
  puntaje: number | string;
  
  // Campos adicionales para compatibilidad
  fecha: string;
  timestamp?: string;
  
  // Campos legacy para compatibilidad
  pregunta1?: string;
  pregunta2?: string;
  pregunta3?: string;
  pregunta4?: string;
  pregunta5?: string;
  pregunta6?: string;
  pregunta7?: string;
  pregunta8?: string;
  pregunta9?: string;
  
  // Campo para nivel de riesgo (legacy)
  nivelRiesgo?: NivelRiesgo;
}

// Configuración de unidades de negocio
export interface UnidadDeNegocioConfig {
  id: string;
  name: string;
  emoji: string;
  color: string;
  plantas: Plant[];
  turnos: Shift[];
  areas: Area[];
  puestos: Position[];
}

// Configuración de plantas por unidad de negocio
export const UNIDADES_DE_NEGOCIO_CONFIG: Record<UnidadDeNegocio, UnidadDeNegocioConfig> = {
  'DD': {
    id: 'DD',
    name: 'DD',
    emoji: '🔧',
    color: '#96CEB4',
    plantas: ['Planta 3'],
    turnos: ['A001', 'A002', 'AD01', 'AD02', 'AD03', 'AM01', 'LS01', 'LS02', 'LS03', 'PP', 'PP3'],
    areas: ['MODULOS', 'CELDAS', 'MOLDEO'],
    puestos: ['Supervisor de producción Sr.', 'Supervisor de producción ll', 'Asistente de supervisor de ensamble DD', 'Asistente de control de producción', 'Practicante', 'Operador universal', 'Ensamblador', 'Surtidor de materiales', 'Supervisor de producción lll', 'Principal supervisor de Moldeo', 'Supervisor de Moldeo lll', 'Supervisor de Moldeo Jr.', 'Separador de partes', 'Coordinador gestion herramientas mfg', 'Coordinador tecnicos de moldeo', 'Limpiador de moldes', 'Mezclador de resinas', 'Mezclador de resinas sr.', 'Tecnico de moldeo l', 'Tecnico de moldeo ll', 'Tecnico de moldeo lll', 'Tecnico de set up l', 'Tecnico de set up lll', 'Auxiliar de mantenimiento']
  },
  'Irrigación': {
    id: 'Irrigación',
    name: 'Irrigación',
    emoji: '💧',
    color: '#4ECDC4',
    plantas: ['Planta 1', 'Planta 2'],
    turnos: ['A001', 'A002', 'AD01', 'AD02', 'AD03', 'AM01', 'LS01', 'LS02', 'LS03', 'PP', 'PP3'],
    areas: ['PGJ', 'PROSPRAY', 'VALVULAS', 'I-20-25-40', 'I-20-25-41', 'I-20-25-42', 'I-20-25-43', 'I-20-25-44', 'I-20-25-45', 'I-20-25-46', 'GOLF', 'SRN', 'SENSORES', 'AUTOMATIZACION PGJ', 'HIGH POP', 'ACCUSYNC', 'PSU ULTRA', 'SUB-ENSAMBLE I SERIES', 'MOLDEO P1', 'MOLDEOP2', 'SOLENOIDES'],
    puestos: ['Supervisor de producción Sr.', 'Supervisor de producción ll', 'Asistente de supervisor de ensamble DD', 'Asistente de control de producción', 'Practicante', 'Operador universal', 'Ensamblador', 'Surtidor de materiales', 'Supervisor de producción lll', 'Principal supervisor de Moldeo', 'Supervisor de Moldeo lll', 'Supervisor de Moldeo Jr.', 'Separador de partes', 'Coordinador gestion herramientas mfg', 'Coordinador tecnicos de moldeo', 'Limpiador de moldes', 'Mezclador de resinas', 'Mezclador de resinas sr.', 'Tecnico de moldeo l', 'Tecnico de moldeo ll', 'Tecnico de moldeo lll', 'Tecnico de set up l', 'Tecnico de set up lll', 'Auxiliar de mantenimiento']
  },
  'FX': {
    id: 'FX',
    name: 'FX',
    emoji: '🏭',
    color: '#FF6B6B',
    plantas: ['Planta 2'],
    turnos: ['A001', 'A002', 'AD01', 'AD02', 'AD03', 'AM01', 'LS01', 'LS02', 'LS03', 'PP', 'PP3'],
    areas: ['MODULOS', 'CELDAS', 'MOLDEO'],
    puestos: ['Supervisor de producción Sr.', 'Supervisor de producción ll', 'Asistente de supervisor de ensamble DD', 'Asistente de control de producción', 'Practicante', 'Operador universal', 'Ensamblador', 'Surtidor de materiales', 'Supervisor de producción lll', 'Principal supervisor de Moldeo', 'Supervisor de Moldeo lll', 'Supervisor de Moldeo Jr.', 'Separador de partes', 'Coordinador gestion herramientas mfg', 'Coordinador tecnicos de moldeo', 'Limpiador de moldes', 'Mezclador de resinas', 'Mezclador de resinas sr.', 'Tecnico de moldeo l', 'Tecnico de moldeo ll', 'Tecnico de moldeo lll', 'Tecnico de set up l', 'Tecnico de set up lll', 'Auxiliar de mantenimiento']
  },
  'HCM': {
    id: 'HCM',
    name: 'HCM',
    emoji: '⚙️',
    color: '#45B7D1',
    plantas: ['Planta 1', 'Planta 2'],
    turnos: ['A001', 'A002', 'AD01', 'AD02', 'AD03', 'AM01', 'LS01', 'LS02', 'LS03', 'PP', 'PP3'],
    areas: ['MODULOS', 'CELDAS', 'MOLDEO'],
    puestos: ['Supervisor de producción Sr.', 'Supervisor de producción ll', 'Asistente de supervisor de ensamble DD', 'Asistente de control de producción', 'Practicante', 'Operador universal', 'Ensamblador', 'Surtidor de materiales', 'Supervisor de producción lll', 'Principal supervisor de Moldeo', 'Supervisor de Moldeo lll', 'Supervisor de Moldeo Jr.', 'Separador de partes', 'Coordinador gestion herramientas mfg', 'Coordinador tecnicos de moldeo', 'Limpiador de moldes', 'Mezclador de resinas', 'Mezclador de resinas sr.', 'Tecnico de moldeo l', 'Tecnico de moldeo ll', 'Tecnico de moldeo lll', 'Tecnico de set up l', 'Tecnico de set up lll', 'Auxiliar de mantenimiento']
  },
  'SOPORTE': {
    id: 'SOPORTE',
    name: 'Soporte',
    emoji: '🛠️',
    color: '#FFEAA7',
    plantas: ['Planta 1', 'Planta 2'],
    turnos: ['A001', 'A002', 'AD01', 'AD02', 'AD03', 'AM01', 'LS01', 'LS02', 'LS03', 'PP', 'PP3'],
    areas: ['MODULOS', 'CELDAS', 'MOLDEO'],
    puestos: ['Supervisor de producción Sr.', 'Supervisor de producción ll', 'Asistente de supervisor de ensamble DD', 'Asistente de control de producción', 'Practicante', 'Operador universal', 'Ensamblador', 'Surtidor de materiales', 'Supervisor de producción lll', 'Principal supervisor de Moldeo', 'Supervisor de Moldeo lll', 'Supervisor de Moldeo Jr.', 'Separador de partes', 'Coordinador gestion herramientas mfg', 'Coordinador tecnicos de moldeo', 'Limpiador de moldes', 'Mezclador de resinas', 'Mezclador de resinas sr.', 'Tecnico de moldeo l', 'Tecnico de moldeo ll', 'Tecnico de moldeo lll', 'Tecnico de set up l', 'Tecnico de set up lll', 'Auxiliar de mantenimiento']
  }
};
