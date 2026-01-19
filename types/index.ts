// Tipos para el sistema de selección original (3 niveles)
export type UnidadDeNegocio = 'DD' | 'FX' | 'HCM' | 'Irrigación' | 'SOPORTE';

export type Position = 'Supervisor de producción Sr.' | 'Supervisor de producción ll' | 'Asistente de supervisor de ensamble DD' | 'Asistente de control de producción' | 'Practicante' | 'Operador universal' | 'Ensamblador' | 'Surtidor de materiales' | 'Supervisor de producción lll' | 'Principal supervisor de Moldeo' | 'Supervisor de Moldeo lll' | 'Supervisor de Moldeo Jr.' | 'Separador de partes' | 'Coordinador gestion herramientas mfg' | 'Coordinador tecnicos de moldeo' | 'Limpiador de moldes' | 'Mezclador de resinas' | 'Mezclador de resinas sr.' | 'Tecnico de moldeo l' | 'Tecnico de moldeo ll' | 'Tecnico de moldeo lll' | 'Tecnico de set up l' | 'Tecnico de set up lll' | 'Auxiliar de mantenimiento' | 'Asistente Control Produccion' | 'Tecnico de Procesos' | 'Coord Tecnico de Moldeo (DD)' | 'Asist de Sup de Ensamble (DD)' | 'Auxiliar de Mantenimiento' | 'Limpiador de Moldes (DD)' | 'Mezclador de Resinas (DD)' | 'Mezclador de Resinas Sr. (DD)' | 'Operador Universal (DD)' | 'Surtidor de Materiales (DD)' | 'Tecnico de Moldeo I (DD)' | 'Tecnico de Moldeo II (DD)' | 'Tecnico de Moldeo III (DD)' | 'Tecnico de Set Up "I" (DD)' | 'Tecnico de Set Up "III" (DD)' | 'Auxiliar Control de Produccion' | 'Asist de Sup de Ensamble (FX)' | 'Tecnico en Pintura' | 'Aprendiz de Pintor' | 'Coordinador Técnicos CNC' | 'Operador CNC (FX)' | 'Operador Universal (FX)' | 'Pintor I' | 'Pintor II' | 'Pulidor (FX)' | 'Tecnico "II" CNC' | 'Sup. de Produccion "II"(FX)' | 'Tecnico de Moldeo I (HCM)' | 'Separador de partes (HCM)' | 'Coord Tecnico de Moldeo (HCM)' | 'Mezclador de Resinas (HCM)' | 'Mezclador de Resinas Sr. (HCM)' | 'Operador Ops Secundarias (HCM)' | 'Operador Universal (HCM)' | 'Surtidor de Materiales (HCM)' | 'Tecnico de Set Up "III" (HCM)' | 'Tecnico de Set Up "I" (HCM)' | 'Coord Tecnico de Moldeo (IR)' | 'Tecnico de Moldeo III (IR)' | 'Tecnico de Set Up "I" (IR)' | 'Tecnico de Set Up "III" (IR)' | 'Operador de Maquina' | 'Control de Produccion (IR)' | 'Asist de Sup de Ensamble (IR)' | 'Asistente de Supervisor Sr IR' | 'Tecnico de Moldeo I (IR)' | 'Tecnico de Moldeo II (IR)';

export type SubPosition = 'Nivel 1' | 'Nivel 2' | 'Nivel 3' | 'Nivel 4' | 'Nivel 5';

// Tipos para la nueva estructura de 5 niveles
export type Plant = 'Planta 1' | 'Planta 2' | 'Planta 3';
export type Shift = 'A001' | 'A002' | 'AD01' | 'AD02' | 'AD03' | 'AM01' | 'LS01' | 'LS02' | 'LS03' | 'PP' | 'PP3';
export type Area = 'PGJ' | 'PROSPRAY' | 'VALVULAS' | 'I-20-25-40' | 'I-20-25-41' | 'I-20-25-42' | 'I-20-25-43' | 'I-20-25-44' | 'I-20-25-45' | 'I-20-25-46' | 'GOLF' | 'SRN' | 'SENSORES' | 'AUTOMATIZACION PGJ' | 'HIGH POP' | 'ACCUSYNC' | 'PSU ULTRA' | 'SUB-ENSAMBLE I SERIES' | 'MOLDEO P1' | 'MOLDEOP2' | 'SOLENOIDES' | 'Celdas' | 'Moldeo' | 'Modulos' | 'Moldeo - ensamble' | 'DD Molding/Molding' | 'DD Molding Assembly';

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
    turnos: ['AD01', 'AM01', 'A001', 'A002', 'LS01', 'LS02', 'LS03'],
    areas: ['Celdas', 'Moldeo', 'Modulos', 'Moldeo - ensamble', 'DD Molding/Molding', 'DD Molding Assembly'],
    puestos: ['Asistente Control Produccion', 'Tecnico de Procesos', 'Coord Tecnico de Moldeo (DD)', 'Asist de Sup de Ensamble (DD)', 'Auxiliar de Mantenimiento', 'Limpiador de Moldes (DD)', 'Ensamblador', 'Mezclador de Resinas (DD)', 'Mezclador de Resinas Sr. (DD)', 'Operador Universal (DD)', 'Separador de Partes', 'Surtidor de Materiales (DD)', 'Tecnico de Moldeo I (DD)', 'Tecnico de Moldeo II (DD)', 'Tecnico de Moldeo III (DD)', 'Tecnico de Set Up "I" (DD)', 'Tecnico de Set Up "III" (DD)', 'Auxiliar Control de Produccion']
  },
  'Irrigación': {
    id: 'Irrigación',
    name: 'Irrigación',
    emoji: '💧',
    color: '#4ECDC4',
    plantas: ['Planta 1', 'Planta 2'],
    turnos: ['A', 'AD01', 'A001', 'A002', 'B', 'C', 'D', 'JR'],
    areas: ['ICV', 'Moldeo', 'Solenoides', 'Administracion de Produccion', 'Diafragma', 'Drip Zone', 'Ensamble ASV', 'Ensamble PGV', 'Ensamble Pro-Spray', 'HSBE', 'I-25/I-140', 'I-20', 'PGJ', 'PGV1.5&2', 'PSU', 'Rotor Sub-Assembly', 'SRM', 'Swing Joint', '90540 HCV'],
    puestos: ['Separador de Partes', 'Coord Tecnico de Moldeo (IR)', 'Ensamblador', 'Mezclador de Resinas', 'Mezclador de Resinas Sr.', 'Operador Universal', 'Tecnico de Moldeo I (IR)', 'Tecnico de Moldeo II (IR)', 'Tecnico de Moldeo III (IR)', 'Tecnico de Set Up "I" (IR)', 'Tecnico de Set Up "III" (IR)', 'Operador de Maquina', 'Control de Produccion (IR)', 'Asist de Sup de Ensamble (IR)', 'Asistente de Supervisor Sr IR', 'Tecnico de Procesos']
  },
  'FX': {
    id: 'FX',
    name: 'FX',
    emoji: '🏭',
    color: '#FF6B6B',
    plantas: ['Planta 2'],
    turnos: ['A001', 'LS01', 'LS02'],
    areas: ['FX'],
    puestos: ['Asist de Sup de Ensamble (FX)', 'Tecnico en Pintura', 'Aprendiz de Pintor', 'Coordinador Técnicos CNC', 'Ensamblador', 'Operador CNC (FX)', 'Operador Universal (FX)', 'Pintor I', 'Pintor II', 'Pulidor (FX)', 'Tecnico "II" CNC', 'Sup. de Produccion "II"(FX)']
  },
  'HCM': {
    id: 'HCM',
    name: 'HCM',
    emoji: '⚙️',
    color: '#45B7D1',
    plantas: ['Planta 2'],
    turnos: ['A', 'C', 'LS01', 'LS02', 'LS03'],
    areas: ['Moldeo', 'Ensamble'],
    puestos: ['Separador de Partes', 'Tecnico de Moldeo I (HCM)', 'Separador de partes (HCM)', 'Coord Tecnico de Moldeo (HCM)', 'Ensamblador', 'Mezclador de Resinas (HCM)', 'Mezclador de Resinas Sr. (HCM)', 'Operador Ops Secundarias (HCM)', 'Operador Universal (HCM)', 'Surtidor de Materiales (HCM)', 'Tecnico de Set Up "III" (HCM)', 'Tecnico de Set Up "I" (HCM)']
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

export interface UserData {
  nombre: string;
  rfc: string;
  numeroEmpleado: string;
  isAuthenticated: boolean;
  biometricRegistered: boolean;
  registrationDate: string;
  deviceId?: string;
  webAuthnCredentials?: any;
}

export interface AuthResult {
  success: boolean;
  message: string;
  userData?: UserData;
  requiresSecondPassword?: boolean;
}

export interface BiometricConfig {
  isAvailable: boolean;
  type: 'fingerprint' | 'face' | 'none';
  platform: 'web' | 'ios' | 'android';
}

// WebAuthn types
declare global {
  interface Window {
    PublicKeyCredential: any;
  }
}

export interface WebAuthnCredential {
  id: string;
  type: string;
  rawId: ArrayBuffer;
  response: any;
}
