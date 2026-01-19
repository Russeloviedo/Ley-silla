// app/ResultadosFinalesScreen.tsx
import { StyleSheet, ScrollView, TouchableOpacity, View, Image, Alert, Platform } from 'react-native';
import { Text } from '@/components/Themed';
import { useState, useEffect, useRef } from 'react';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { AppColors } from '@/constants/Colors';
import AnimatedBackground from '@/components/AnimatedBackground';
import * as FileSystem from 'expo-file-system';
import * as Sharing from 'expo-sharing';
import * as XLSX from 'xlsx';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { LinearGradient } from 'expo-linear-gradient';
import { HistorialAnalisis } from '@/types';
import { safeJsonParse } from '@/utils/errorHandler';
import { FirestoreService } from '@/utils/firestoreService';
import { CleanupService } from '@/utils/cleanupService';
import { useBusinessUnit } from '@/utils/hooks';
import { useGuardarAnalisis } from '@/utils/useGuardarAnalisis';

// Recomendaciones (glosario)
const RECOMENDACIONES = {
  NO_DECRETO: 'No aplica el Decreto. Según las respuestas, la situación del trabajador no está contemplada por el decreto sobre bipedestación.',
  SILLA_DETERMINADO: 'Se debe proporcionar el asiento o silla con respaldo a la persona trabajadora en un lugar determinado dentro del centro de trabajo.',
  SILLA_CERCA: 'Se debe proporcionar el asiento o silla con respaldo a la persona trabajadora en un lugar cercano a su lugar de trabajo.',
  SILLA_CARACTERISTICAS: 'Se debe proporcionar el asiento o silla con respaldo a la persona trabajadora con las características determinadas para su espacio de trabajo.',
};

// Color por nivel de riesgo
function getNivelRiesgoColor(nivel: string): string {
  switch (nivel?.toLowerCase()) {
    case 'bajo':
      return '#4caf50';
    case 'medio':
      return '#ffeb3b';
    case 'alto':
      return '#f44336';
    case 'no aplica':
      return '#9e9e9e';
    default:
      return '#ccc';
  }
}

const parseBooleanParam = (value: string | string[] | undefined): boolean => {
  if (!value) return false;
  const check = (item: string) => {
    const normalized = item?.toString().toLowerCase();
    return normalized === 'true' || normalized === '1' || normalized === 'yes';
  };

  if (Array.isArray(value)) {
    return value.some((item) => check(String(item)));
  }

  return check(String(value));
};

export default function ResultadosFinalesScreen() {
  const params = useLocalSearchParams<{
    unidad?: string;
    puesto?: string;
    subpuesto?: string;
    flujo?: string | string[];
    puntaje?: string | string[];
    nivel?: string | string[];
    respuestas?: string;
    respuestasPonderacion?: string;
    respuestasFlujo?: string;
    autoGuardar?: string | string[];
  }>();
  const router = useRouter();

  // Desestructurar con fallback a string
  const unidad = String(params.unidad ?? '');
  const puesto = String(params.puesto ?? '');
  const subpuesto = String(params.subpuesto ?? '');
  const flujoParam = params.flujo;
  const puntajeParam = params.puntaje;
  const nivelParam = params.nivel;
  const respuestasFlujo = params.respuestasFlujo;

  const flujo = Array.isArray(flujoParam) ? flujoParam[0] : String(flujoParam ?? '');
  const puntaje = Array.isArray(puntajeParam) ? puntajeParam[0] : String(puntajeParam ?? '');
  const nivel = Array.isArray(nivelParam) ? nivelParam[0] : String(nivelParam ?? '');

  console.log('🔍 Parámetros de flujo procesados:', {
    flujoParam,
    esArray: Array.isArray(flujoParam),
    flujoProcesado: flujo,
    tipoFlujo: typeof flujo
  });

  const [showGlosario, setShowGlosario] = useState(false);
  const [showHelpModal, setShowHelpModal] = useState(false);
  const [analisisActual, setAnalisisActual] = useState<HistorialAnalisis | null>(null);
  const [autoGuardarEjecutado, setAutoGuardarEjecutado] = useState(false);
  const envioEnCursoRef = useRef(false);
  const analisisActualRef = useRef<HistorialAnalisis | null>(null);

  const shouldAutoGuardar = parseBooleanParam(params.autoGuardar);
  const autoEnvioIntentado = useRef(false);

  // Hook BU
  const { businessUnit, loading: buLoading } = useBusinessUnit();

  const {
    estado: estadoGuardado,
    prepararBorrador,
    guardarAnalisis,
    limpiarEstadoError,
  } = useGuardarAnalisis();

  // Nueva estructura 5 niveles (estado mostrado en UI y usado para exportar)
  const [selectedPlanta, setSelectedPlanta] = useState('');
  const [selectedTurno, setSelectedTurno] = useState('');
  const [selectedArea, setSelectedArea] = useState('');
  const [selectedPuesto, setSelectedPuesto] = useState('');

  useEffect(() => {
    console.log('Estado del modal de ayuda:', showHelpModal);
  }, [showHelpModal]);

  // Validación de parámetros mínimos
  useEffect(() => {
    console.log('Parámetros recibidos en resultados finales:', params);
    // Nota: subpuesto es opcional, por lo que se eliminó de la validación requerida
    if (!unidad || !puesto || !puntaje || !nivel) {
      console.warn('Faltan parámetros requeridos:', { unidad, puesto, subpuesto, puntaje, nivel });
      Alert.alert(
        'Datos incompletos',
        'No se recibieron todos los datos necesarios para mostrar los resultados.',
        [{ text: 'OK', style: 'default' }],
      );
    }
  }, [unidad, puesto, subpuesto, puntaje, nivel]);

  // Cargar valores 5 niveles desde AsyncStorage
  useEffect(() => {
    const obtenerValoresAsyncStorage = async () => {
      try {
        const _selectedBusinessUnit = (await AsyncStorage.getItem('nav:selectedBusinessUnit')) || '';
        const _selectedPlanta = (await AsyncStorage.getItem('nav:selectedPlant')) || '';
        const _selectedTurno = (await AsyncStorage.getItem('nav:selectedShift')) || '';
        const _selectedArea = (await AsyncStorage.getItem('nav:selectedArea')) || '';
        const _selectedPuesto = (await AsyncStorage.getItem('nav:selectedPosition')) || '';

        console.log('🏢 Valores de AsyncStorage:', {
          _selectedBusinessUnit,
          _selectedPlanta,
          _selectedTurno,
          _selectedArea,
          _selectedPuesto,
        });

        setSelectedPlanta(_selectedPlanta);
        setSelectedTurno(_selectedTurno);
        setSelectedArea(_selectedArea);
        setSelectedPuesto(_selectedPuesto);
      } catch (error) {
        console.warn('Error al obtener valores de AsyncStorage:', error);
      }
    };

    obtenerValoresAsyncStorage();
  }, []);

  // Función para guardar análisis
  const guardarAnalisisAutomatico = async () => {
    try {
      console.log('🔍 Iniciando guardarAnalisisAutomatico...');
      console.log('📋 Parámetros recibidos:', params);

      // Parsear respuestas
      let respuestasIniciales: { [key: number]: string } = {};
      let respuestasPonderacion: { [key: number]: string } = {};
      let respuestasFlujoData: { [key: number]: string } = {};
      let flujoNormalized = '';
      let nivelString = '';
      let puntajeNumero = 0;

      try {
        if (params.respuestas) {
          respuestasIniciales = JSON.parse(params.respuestas);
          console.log('✅ Respuestas iniciales parseadas:', respuestasIniciales);
        }
      } catch (e) {
        console.warn('⚠️ Error al parsear respuestas iniciales:', e);
      }

      try {
        if (params.respuestasPonderacion) {
          respuestasPonderacion = JSON.parse(params.respuestasPonderacion);
          console.log('✅ Respuestas ponderación parseadas:', respuestasPonderacion);
        }
      } catch (e) {
        console.warn('⚠️ Error al parsear respuestas ponderación:', e);
      }

      try {
        if (params.respuestasFlujo) {
          respuestasFlujoData = JSON.parse(params.respuestasFlujo);
          console.log('✅ Respuestas flujo parseadas:', respuestasFlujoData);
        }
      } catch (e) {
        console.warn('⚠️ Error al parsear respuestas flujo:', e);
      }

      // Obtener valores de 5 niveles
      const unidadFinal = params.unidad || 'Sin especificar';
      const _selectedPlanta = await AsyncStorage.getItem('nav:selectedPlant');
      const _selectedTurno = await AsyncStorage.getItem('nav:selectedShift');
      const _selectedArea = await AsyncStorage.getItem('nav:selectedArea');
      const _selectedPuesto = await AsyncStorage.getItem('nav:selectedPosition');

      console.log('🏢 Valores de 5 niveles obtenidos:', {
        unidad: unidadFinal,
        planta: _selectedPlanta,
        turno: _selectedTurno,
        area: _selectedArea,
        puesto: _selectedPuesto
      });

      // Normalizar flujo
      if (params.flujo) {
        if (Array.isArray(params.flujo)) {
          flujoNormalized = params.flujo[0] || '';
        } else {
          flujoNormalized = params.flujo;
        }
      }
      console.log('🔄 Flujo normalizado:', flujoNormalized);

      // Normalizar nivel y puntaje
      if (params.nivel) {
        if (Array.isArray(params.nivel)) {
          nivelString = params.nivel[0] || '';
        } else {
          nivelString = params.nivel;
        }
      }
      console.log('📊 Nivel normalizado:', nivelString);

      if (params.puntaje) {
        if (Array.isArray(params.puntaje)) {
          puntajeNumero = parseFloat(params.puntaje[0]) || 0;
        } else {
          puntajeNumero = parseFloat(params.puntaje) || 0;
        }
      }
      console.log('🎯 Puntaje normalizado:', puntajeNumero);

      // Verificar si es NO_DECRETO
      const esNoDecreto = String(flujoNormalized || '').trim().toUpperCase() === 'NO_DECRETO';
      console.log('🚫 ¿Es NO_DECRETO?', esNoDecreto);

      console.log('✅ Preparando análisis para guardar...');

      // Objeto a guardar
      const nuevoAnalisis: HistorialAnalisis = {
        // Legacy visibles
        unidad: unidadFinal,
        puesto: normalizarCampo(_selectedPuesto),
        subpuesto: normalizarCampo(subpuesto),

        // Nueva estructura
        unidadDeNegocio: unidadFinal,
        planta: normalizarCampo(_selectedPlanta),
        turno: normalizarCampo(_selectedTurno),
        area: normalizarCampo(_selectedArea),

        // Flujo
        flujo: flujoNormalized,

        // Ponderaciones (strings con "N/A" o "N pt")
        ponderacion1: esNoDecreto ? 'N/A' : (respuestasPonderacion[1] ? `${respuestasPonderacion[1]} pt` : ''),
        ponderacion2: esNoDecreto ? 'N/A' : (respuestasPonderacion[2] ? `${respuestasPonderacion[2]} pt` : ''),
        ponderacion3: esNoDecreto ? 'N/A' : (respuestasPonderacion[3] ? `${respuestasPonderacion[3]} pt` : ''),
        ponderacion4: esNoDecreto ? 'N/A' : (respuestasPonderacion[4] ? `${respuestasPonderacion[4]} pt` : ''),
        ponderacion5: esNoDecreto ? 'N/A' : (respuestasPonderacion[5] ? `${respuestasPonderacion[5]} pt` : ''),
        ponderacion6: esNoDecreto ? 'N/A' : (respuestasPonderacion[6] ? `${respuestasPonderacion[6]} pt` : ''),
        ponderacion7: esNoDecreto ? 'N/A' : (respuestasPonderacion[7] ? `${respuestasPonderacion[7]} pt` : ''),

        // Resultados
        nivel: esNoDecreto ? 'N/A' : nivelString,
        puntaje: esNoDecreto ? 'N/A' : (puntajeNumero ? `${puntajeNumero} pt` : ''),

        // Fechas
        fecha: new Date().toLocaleDateString('es-ES', {
          year: 'numeric',
          month: '2-digit',
          day: '2-digit'
        }),
        timestamp: new Date().toISOString(),

        // Preguntas (CI = Cuestionario Inicial, CD = Cuestionario de Diagrama)
        pregunta1: respuestasIniciales[1] || 'N/A', // CI 1
        pregunta2:
          respuestasIniciales[2] === 'Sí'
            ? 'Sí'
            : respuestasIniciales[2] === 'No'
              ? 'No'
              : 'N/A', // CI 2
        pregunta3: respuestasFlujoData[1] || 'N/A', // CD 1
        pregunta4: respuestasFlujoData[2] || 'N/A', // CD 2
        pregunta5: respuestasFlujoData[3] || 'N/A', // CD 3
        pregunta6: respuestasFlujoData[4] || 'N/A', // CD 4
        pregunta7: respuestasFlujoData[5] || 'N/A', // CD 5
      };

      console.log('📋 Nuevo análisis a guardar:', nuevoAnalisis);

      try {
        setAnalisisActual(nuevoAnalisis);
        analisisActualRef.current = nuevoAnalisis;
        await prepararBorrador(nuevoAnalisis);
        const resultado = await guardarAnalisis(nuevoAnalisis);
        if (!resultado.success && resultado.error) {
          throw resultado.error;
        }
        console.log('✅ Guardado con resultado:', resultado);
        return resultado.result;
      } catch (firestoreError: any) {
        console.error('❌ Error al guardar en Firestore:', firestoreError);
        throw firestoreError;
      }
    } catch (error) {
      console.error('❌ Error general en guardarAnalisisAutomatico:', error);
      Alert.alert('❌ Error', 'Error inesperado al guardar el análisis');
      throw error;
    }
  };

  // Guardado local automático del análisis
  useEffect(() => {
    let isActive = true;

    const prepararAnalisisLocal = async () => {
      try {
        console.log('💾 Generando análisis para almacenamiento local...');
        const nuevoAnalisis = await generarAnalisisParaGuardar();

        if (!nuevoAnalisis) {
          console.warn('⚠️ No se generó un análisis válido. Se omite el guardado local.');
          return;
        }

        autoEnvioIntentado.current = false;
        limpiarEstadoError();

        if (!isActive) {
          return;
        }

        setAnalisisActual(nuevoAnalisis);
        analisisActualRef.current = nuevoAnalisis;
        await prepararBorrador(nuevoAnalisis);

        console.log('✅ Análisis preparado y almacenado localmente.');
      } catch (error) {
        console.error('❌ Error al guardar el análisis local:', error);
        if (isActive) {
          Alert.alert('Error', 'No se pudo guardar el análisis localmente. Intenta nuevamente.');
        }
      }
    };

    prepararAnalisisLocal();

    return () => {
      isActive = false;
    };
  }, [JSON.stringify(params)]);

  useEffect(() => {
    if (!analisisActualRef.current) return;
    if (estadoGuardado.guardadoRemoto) return;
    if (autoEnvioIntentado.current) return;

    autoEnvioIntentado.current = true;
    handleEnviarABaseDatos({ mostrarAlertas: false }).catch((error) => {
      console.error('❌ Error en envío automático:', error);
    });
  }, [estadoGuardado.guardadoRemoto, analisisActual]);

  // NUEVA FUNCIÓN: Generar análisis para guardar (sin guardarlo)
  const generarAnalisisParaGuardar = async (): Promise<HistorialAnalisis | null> => {
    try {
      console.log('🔧 Generando análisis para guardar...');

      // Cargar datos necesarios desde AsyncStorage o parámetros de navegación
      let respuestasIniciales: { [key: number]: string } = {};
      let respuestasFlujoData: { [key: number]: string } = {};
      let respuestasPonderacion: { [key: number]: number } = {};

      try {
        // Intentar cargar desde AsyncStorage primero
        const respuestasInicialesStorage = await AsyncStorage.getItem('data:respuestasPreguntas');
        const respuestasFlujoStorage = await AsyncStorage.getItem('data:flujo');
        const respuestasPonderacionStorage = await AsyncStorage.getItem('data:respuestasPonderacion');

        if (respuestasInicialesStorage) {
          respuestasIniciales = safeJsonParse(respuestasInicialesStorage, {});
          console.log('📋 Respuestas iniciales cargadas desde AsyncStorage:', respuestasIniciales);
        }

        if (respuestasFlujoStorage) {
          respuestasFlujoData = safeJsonParse(respuestasFlujoStorage, {});
          console.log('📋 Respuestas flujo cargadas desde AsyncStorage:', respuestasFlujoData);
        }

        if (respuestasPonderacionStorage) {
          respuestasPonderacion = safeJsonParse(respuestasPonderacionStorage, {});
          console.log('📋 Respuestas ponderación cargadas desde AsyncStorage:', respuestasPonderacion);
        }

        // Si no hay datos en AsyncStorage, intentar cargar desde parámetros de navegación
        if (Object.keys(respuestasIniciales).length === 0 && params.respuestas) {
          try {
            respuestasIniciales = safeJsonParse(params.respuestas, {});
            console.log('📋 Respuestas iniciales cargadas desde parámetros:', respuestasIniciales);
          } catch (error) {
            console.warn('⚠️ Error al parsear respuestas iniciales desde parámetros:', error);
          }
        }

        if (Object.keys(respuestasFlujoData).length === 0 && params.respuestasFlujo) {
          try {
            respuestasFlujoData = safeJsonParse(params.respuestasFlujo, {});
            console.log('📋 Respuestas flujo cargadas desde parámetros:', respuestasFlujoData);
          } catch (error) {
            console.warn('⚠️ Error al parsear respuestas flujo desde parámetros:', error);
          }
        }

        if (Object.keys(respuestasPonderacion).length === 0 && params.respuestasPonderacion) {
          try {
            respuestasPonderacion = safeJsonParse(params.respuestasPonderacion, {});
            console.log('📋 Respuestas ponderación cargadas desde parámetros:', respuestasPonderacion);
          } catch (error) {
            console.warn('⚠️ Error al parsear respuestas ponderación desde parámetros:', error);
          }
        }

        console.log('📋 Datos finales cargados:', {
          respuestasIniciales,
          respuestasFlujoData,
          respuestasPonderacion
        });

      } catch (error) {
        console.error('❌ Error al cargar datos de respuestas:', error);
      }

      // Obtener valores de 5 niveles (manejar null de AsyncStorage)
      const plantaStorage = await AsyncStorage.getItem('nav:selectedPlant');
      const turnoStorage = await AsyncStorage.getItem('nav:selectedShift');
      const areaStorage = await AsyncStorage.getItem('nav:selectedArea');
      const puestoStorage = await AsyncStorage.getItem('nav:selectedPosition');

      // Convertir null a string vacío para compatibilidad con tipos
      const _selectedPlanta: string = selectedPlanta || (plantaStorage ?? '');
      const _selectedTurno: string = selectedTurno || (turnoStorage ?? '');
      const _selectedArea: string = selectedArea || (areaStorage ?? '');
      const _selectedPuesto: string = selectedPuesto || (puestoStorage ?? '');

      // Normalizar flujo
      const flujoNormalized = Array.isArray(params.flujo) ? params.flujo[0] : String(params.flujo || '');
      const esNoDecreto = String(flujoNormalized).trim().toUpperCase() === 'NO_DECRETO';

      // Calcular puntaje y nivel
      let puntajeNumero = 0;
      let nivelString = 'N/A';

      if (!esNoDecreto) {
        puntajeNumero = Object.values(respuestasPonderacion).reduce((sum: number, val: any) => {
          return sum + (typeof val === 'number' ? val : 0);
        }, 0);

        if (puntajeNumero <= 7) nivelString = 'Bajo';
        else if (puntajeNumero <= 14) nivelString = 'Medio';
        else nivelString = 'Alto';
      }

      // Unidad final (priorizar nueva estructura)
      const buStorage = await AsyncStorage.getItem('nav:selectedBusinessUnit');
      const unidadFinal = params.unidad || buStorage || '';

      const nuevoAnalisis: HistorialAnalisis = {
        // Legacy visibles
        unidad: unidadFinal,
        puesto: normalizarCampo(_selectedPuesto),
        subpuesto: normalizarCampo(subpuesto),

        // Nueva estructura
        unidadDeNegocio: unidadFinal,
        planta: normalizarCampo(_selectedPlanta as string),
        turno: normalizarCampo(_selectedTurno as string),
        area: normalizarCampo(_selectedArea as string),

        // Flujo
        flujo: flujoNormalized,

        // Ponderaciones (strings con "N/A" o "N pt")
        ponderacion1: esNoDecreto ? 'N/A' : (respuestasPonderacion[1] ? `${respuestasPonderacion[1]} pt` : ''),
        ponderacion2: esNoDecreto ? 'N/A' : (respuestasPonderacion[2] ? `${respuestasPonderacion[2]} pt` : ''),
        ponderacion3: esNoDecreto ? 'N/A' : (respuestasPonderacion[3] ? `${respuestasPonderacion[3]} pt` : ''),
        ponderacion4: esNoDecreto ? 'N/A' : (respuestasPonderacion[4] ? `${respuestasPonderacion[4]} pt` : ''),
        ponderacion5: esNoDecreto ? 'N/A' : (respuestasPonderacion[5] ? `${respuestasPonderacion[5]} pt` : ''),
        ponderacion6: esNoDecreto ? 'N/A' : (respuestasPonderacion[6] ? `${respuestasPonderacion[6]} pt` : ''),
        ponderacion7: esNoDecreto ? 'N/A' : (respuestasPonderacion[7] ? `${respuestasPonderacion[7]} pt` : ''),

        // Resultados
        nivel: esNoDecreto ? 'N/A' : nivelString,
        puntaje: esNoDecreto ? 'N/A' : (puntajeNumero ? `${puntajeNumero} pt` : ''),

        // Fechas
        fecha: new Date().toLocaleDateString('es-ES', {
          year: 'numeric',
          month: '2-digit',
          day: '2-digit'
        }),
        timestamp: new Date().toISOString(),

        // Preguntas (CI = Cuestionario Inicial, CD = Cuestionario de Diagrama)
        pregunta1: respuestasIniciales[1] || 'N/A', // CI 1
        pregunta2:
          respuestasIniciales[2] === 'Sí'
            ? 'Sí'
            : respuestasIniciales[2] === 'No'
              ? 'No'
              : 'N/A', // CI 2
        pregunta3: respuestasFlujoData[1] || 'N/A', // CD 1
        pregunta4: respuestasFlujoData[2] || 'N/A', // CD 2
        pregunta5: respuestasFlujoData[3] || 'N/A', // CD 3
        pregunta6: respuestasFlujoData[4] || 'N/A', // CD 4
        pregunta7: respuestasFlujoData[5] || 'N/A', // CD 5
      };

      console.log('📋 Análisis generado para guardar:', nuevoAnalisis);
      return nuevoAnalisis;

    } catch (error) {
      console.error('❌ Error al generar análisis para guardar:', error);
      return null;
    }
  };

  // FUNCIÓN HELPER: Normalizar campos para claves consistentes
  const normalizarCampo = (campo: string | undefined | null): string => {
    if (!campo || campo.trim() === '') return 'Sin especificar';
    return campo.trim();
  };

  // FUNCIÓN HELPER: Generar clave única consistente
  const generarClaveUnica = (unidad: string, planta: string, turno: string, area: string, puesto: string, flujo: string): string => {
    return `${normalizarCampo(unidad)}|${normalizarCampo(planta)}|${normalizarCampo(turno)}|${normalizarCampo(area)}|${normalizarCampo(puesto)}|${normalizarCampo(flujo)}`;
  };

  // NUEVA FUNCIÓN: Verificar si un análisis realmente existe en Firestore
  const verificarAnalisisEnFirestore = async (
    analisis: HistorialAnalisis,
    esperadoId?: string
  ): Promise<boolean> => {
    try {
      console.log('🔍 Verificando si el análisis existe realmente en Firestore...');

      if (esperadoId) {
        const documentoDirecto = await FirestoreService.getNuevaEstructuraDocument(esperadoId);
        if (documentoDirecto) {
          console.log('✅ Verificación directa por ID exitosa:', esperadoId);
          return true;
        }
        console.warn('⚠️ No se encontró el documento esperado por ID aún:', esperadoId);
      }

      // Crear clave única para búsqueda usando función normalizada
      const claveUnica = generarClaveUnica(
        analisis.unidadDeNegocio || analisis.unidad || '',
        analisis.planta || '',
        analisis.turno || '',
        analisis.area || '',
        analisis.puesto || '',
        analisis.flujo || ''
      );
      console.log('🔑 Clave única para búsqueda:', claveUnica);

      // Obtener análisis existentes de Firestore
      const analisisExistentes = await FirestoreService.getAnalisisGlobales(100);

      // Buscar si existe un análisis con la misma clave única
      const analisisExistente = analisisExistentes.find(existente => {
        const claveExistente = generarClaveUnica(
          existente.unidadDeNegocio || '',
          existente.planta || '',
          existente.turno || '',
          existente.area || '',
          existente.puesto || '',
          existente.flujo || ''
        );
        return claveExistente === claveUnica;
      });

      if (analisisExistente) {
        console.log('✅ Análisis encontrado en Firestore con ID:', analisisExistente.id);
        return true;
      } else {
        console.log('❌ Análisis NO encontrado en Firestore');
        return false;
      }
    } catch (error) {
      console.error('❌ Error al verificar análisis en Firestore:', error);
      return false; // En caso de error, asumir que no existe
    }
  };

  // NUEVA FUNCIÓN: Sistema de guardado con verificación y reintentos
  const guardarAnalisisConVerificacion = async (
    analisis: HistorialAnalisis,
    expectedDocumentId: string,
    maxReintentos: number = 3
  ): Promise<{ success: boolean; message: string; result?: any }> => {
    try {
      console.log('💾 Guardando análisis (solo un intento de escritura a Firestore)...');
      const result = await FirestoreService.saveAnalysis(analisis);
      console.log('✅ Análisis guardado exitosamente con IDs:', result);

      const retrasoBase = 800; // ms
      for (let intento = 0; intento <= maxReintentos; intento++) {
        if (intento > 0) {
          const espera = retrasoBase * intento;
          console.log(`⏳ Revisión ${intento}/${maxReintentos}. Esperando ${espera}ms antes de verificar...`);
          await new Promise((resolve) => setTimeout(resolve, espera));
        }

        const verificado = await verificarAnalisisEnFirestore(analisis, expectedDocumentId);
        if (verificado) {
          console.log('✅ Verificación exitosa: análisis confirmado en Firestore');
          return {
            success: true,
            message: 'Análisis guardado y verificado exitosamente',
            result,
          };
        }
        console.warn('⚠️ Verificación aún no exitosa, se volverá a intentar...');
      }

      console.error('❌ No se pudo confirmar la existencia del análisis después de los reintentos');
      return {
        success: false,
        message: 'El análisis se guardó pero no se pudo confirmar en Firestore',
        result: null,
      };
    } catch (error) {
      console.error('❌ Error al guardar análisis en Firestore:', error);
      return { success: false, message: `Error al guardar análisis: ${error}` };
    }
  };

  const handleEnviarABaseDatos = async ({ mostrarAlertas = true }: { mostrarAlertas?: boolean } = {}): Promise<boolean> => {
    if (envioEnCursoRef.current || estadoGuardado.guardando) {
      console.log('⏳ Se omitió el envío porque ya hay uno en curso.');
      return false;
    }

    const analisis = analisisActualRef.current;
    if (!analisis) {
      if (mostrarAlertas) {
        Alert.alert('Datos incompletos', 'No hay un análisis listo para enviar.');
      }
      return false;
    }

    try {
      console.log('🚀 Iniciando envío manual a la base de datos...');
      envioEnCursoRef.current = true;
      limpiarEstadoError();

      const resultado = await guardarAnalisis(analisis, { verificar: true });

      if (resultado.success) {
        if (mostrarAlertas) {
          if (resultado.alreadyExists) {
            Alert.alert('Información', 'Este análisis ya estaba registrado en la base de datos.');
          } else if (!resultado.confirmed) {
            Alert.alert('Atención', 'El análisis se envió pero no se pudo confirmar de inmediato. Verifica los registros.');
          } else {
            Alert.alert('Éxito', 'El análisis se envió a la base de datos.');
          }
        }
        autoEnvioIntentado.current = true;
        return true;
      }

      console.error('❌ Error al enviar análisis:', resultado.error);
      if (mostrarAlertas) {
        Alert.alert('Error', 'No se pudo enviar el análisis. Intenta nuevamente.');
      }
    } catch (error) {
      console.error('❌ Error inesperado al enviar a la base de datos:', error);
      if (mostrarAlertas) {
        Alert.alert('Error', 'No se pudo enviar el análisis. Intenta nuevamente.');
      }
    } finally {
      envioEnCursoRef.current = false;
    }

    return false;
  };

  useEffect(() => {
    if (!shouldAutoGuardar) return;
    if (autoGuardarEjecutado) return;
    if (!analisisActualRef.current) return;

    setAutoGuardarEjecutado(true);

    const autoGuardar = async () => {
      console.log('🤖 Intentando enviar automáticamente el análisis a Firestore...');
      await handleEnviarABaseDatos({ mostrarAlertas: false });
    };

    autoGuardar();
  }, [shouldAutoGuardar, analisisActual, autoGuardarEjecutado]);

  // Cargar valores 5 niveles al montar (explícito)
  useEffect(() => {
    const cargarValores5Niveles = async () => {
      try {
        console.log('🏢 Cargando valores de la nueva estructura de 5 niveles...');
        const bu = (await AsyncStorage.getItem('nav:selectedBusinessUnit')) || '';
        const planta = (await AsyncStorage.getItem('nav:selectedPlant')) || '';
        const turno = (await AsyncStorage.getItem('nav:selectedShift')) || '';
        const area = (await AsyncStorage.getItem('nav:selectedArea')) || '';
        const pu = (await AsyncStorage.getItem('nav:selectedPosition')) || '';

        console.log('📋 Valores cargados:', { bu, planta, turno, area, pu });

        setSelectedPlanta(planta);
        setSelectedTurno(turno);
        setSelectedArea(area);
        setSelectedPuesto(pu);

        console.log('✅ Valores de 5 niveles cargados exitosamente');
      } catch (error) {
        console.error('❌ Error al cargar valores de 5 niveles:', error);
      }
    };

    cargarValores5Niveles();
  }, []);

  // Modal ayuda
  const handleHelp = () => {
    console.log('handleHelp ejecutado');
    setShowHelpModal(true);
  };

  // Navegar a inicio (limpia respuestas)
  const handleInicio = async () => {
    try {
      console.log('🧹 Limpiando respuestas antes de ir al inicio...');
      await CleanupService.cleanPreviousAnalysis();
      router.replace('/');
    } catch (error) {
      console.error('❌ Error al limpiar respuestas:', error);
      router.replace('/');
    }
  };



  // Aux: respuesta con N/A según flujo
  const getRespuestaConNA = (respuesta: string, preguntaNumero: number, flujoS: string): string => {
    const f = String(flujoS || '').trim().toUpperCase();
    if (!f || f.includes('NO APLICA') || f === 'NO_DECRETO') {
      if (preguntaNumero >= 3 && preguntaNumero <= 9) return 'N/A';
    }
    if (respuesta && respuesta.trim() !== '') return respuesta;
    if (preguntaNumero >= 3 && preguntaNumero <= 9) return 'N/A';
    return '';
  };



  // Exportar Excel (web y móvil)
  const exportarExcel = async () => {
    const headersIdent = [
      'UNIDAD DE NEGOCIO',
      'PLANTA',
      'TURNO',
      'AREA',
      'PUESTO',
      'CI 1',
      'CI 2',
      'CD 1',
      'CD 2',
      'CD 3',
      'CD 4',
      'CD 5',
      'REQUIERE ANALISIS',
      'FLUJO',
    ];
    const headersRiesgo = [
      'UNIDAD DE NEGOCIO',
      'PLANTA',
      'TURNO',
      'AREA',
      'PUESTO',
      'PONDERACION 1',
      'PONDERACION 2',
      'PONDERACION 3',
      'PONDERACION 4',
      'PONDERACION 5',
      'PONDERACION 6',
      'PONDERACION 7',
      'NIVEL DE RIESGO',
      'PUNTAJE',
    ];

    const getBusinessUnitName = (id: string) => {
      const businessUnits: { [key: string]: string } = {
        FX: 'FX',
        Irrigación: 'Irrigación',
        HCM: 'HCM',
        DD: 'DD',
        SOPORTE: 'Soporte',
      };
      return businessUnits[id] || id;
    };

    const respuestasIniciales = safeJsonParse(String(params.respuestas ?? ''), {});
    const respuestasFlujoData = safeJsonParse(String(respuestasFlujo ?? ''), {});
    const flujoNormalized = String(flujo || '').trim().toUpperCase();

    // LÓGICA MEJORADA para exportación
    const respuestasPonderacion = safeJsonParse(String(params.respuestasPonderacion ?? ''), {});
    const tieneRespuestasPonderacion = Object.values(respuestasPonderacion).some(valor => valor !== null && valor !== undefined && valor !== 0);
    const esNoDecreto = flujoNormalized === 'NO_DECRETO' || !tieneRespuestasPonderacion;

    // DEBUG AUTOMÁTICO - Exportación Excel
    console.log('🚨 DEBUG EXPORTACIÓN EXCEL:', {
      flujoNormalized,
      esNoDecreto,
      tieneRespuestasPonderacion,
      respuestasPonderacion,
      valoresRespuestas: Object.values(respuestasPonderacion),
      clavesRespuestas: Object.keys(respuestasPonderacion),
      respuestasValidas: Object.values(respuestasPonderacion).filter(valor => valor !== null && valor !== undefined && valor !== 0)
    });

    const dataIdent = [
      {
        'UNIDAD DE NEGOCIO': getBusinessUnitName(String(businessUnit ?? '')) || '',
        PLANTA: selectedPlanta || '',
        TURNO: selectedTurno || '',
        AREA: selectedArea || '',
        PUESTO: selectedPuesto || '',
        'CI 1': respuestasIniciales[1] || '',
        'CI 2':
          respuestasIniciales[2] === 'Sí' ? 'Sí' : respuestasIniciales[2] === 'No' ? 'No' : '',
        'CD 1': getRespuestaConNA(respuestasFlujoData[1] || '', 1, flujoNormalized),
        'CD 2': getRespuestaConNA(respuestasFlujoData[2] || '', 2, flujoNormalized),
        'CD 3': getRespuestaConNA(respuestasFlujoData[3] || '', 3, flujoNormalized),
        'CD 4': getRespuestaConNA(respuestasFlujoData[4] || '', 4, flujoNormalized),
        'CD 5': getRespuestaConNA(respuestasFlujoData[5] || '', 5, flujoNormalized),
        'REQUIERE ANALISIS': esNoDecreto ? 'No' : 'Sí',
        'FLUJO': flujoNormalized || 'N/A',
      },
    ];

    const dataRiesgo = [
      {
        'UNIDAD DE NEGOCIO': getBusinessUnitName(String(businessUnit ?? '')) || '',
        PLANTA: selectedPlanta || '',
        TURNO: selectedTurno || '',
        AREA: selectedArea || '',
        PUESTO: selectedPuesto || '',
        'PONDERACION 1': esNoDecreto ? 'N/A' : (respuestasPonderacion[1] ? `${respuestasPonderacion[1]} pt` : ''),
        'PONDERACION 2': esNoDecreto ? 'N/A' : (respuestasPonderacion[2] ? `${respuestasPonderacion[2]} pt` : ''),
        'PONDERACION 3': esNoDecreto ? 'N/A' : (respuestasPonderacion[3] ? `${respuestasPonderacion[3]} pt` : ''),
        'PONDERACION 4': esNoDecreto ? 'N/A' : (respuestasPonderacion[4] ? `${respuestasPonderacion[4]} pt` : ''),
        'PONDERACION 5': esNoDecreto ? 'N/A' : (respuestasPonderacion[5] ? `${respuestasPonderacion[5]} pt` : ''),
        'PONDERACION 6': esNoDecreto ? 'N/A' : (respuestasPonderacion[6] ? `${respuestasPonderacion[6]} pt` : ''),
        'PONDERACION 7': esNoDecreto ? 'N/A' : (respuestasPonderacion[7] ? `${respuestasPonderacion[7]} pt` : ''),
        'NIVEL DE RIESGO': esNoDecreto ? 'N/A' : nivel,
        PUNTAJE: esNoDecreto ? 'N/A' : (puntaje ? `${puntaje} pt` : ''),
      },
    ];

    const wsIdent = XLSX.utils.json_to_sheet(dataIdent, { header: headersIdent });
    const wsRiesgo = XLSX.utils.json_to_sheet(dataRiesgo, { header: headersRiesgo });

    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, wsIdent, 'Identificacion');
    XLSX.utils.book_append_sheet(wb, wsRiesgo, 'Matriz Riesgo');

    if (Platform.OS === 'web') {
      const wbout = XLSX.write(wb, { type: 'array', bookType: 'xlsx' });
      const blob = new Blob([wbout], {
        type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'Matriz_Riesgo_Bipedestacion.xlsx';
      document.body.appendChild(a);
      a.click();
      setTimeout(() => {
        document.body.removeChild(a);
        window.URL.revokeObjectURL(url);
      }, 0);
    } else {
      const wbout = XLSX.write(wb, { type: 'base64', bookType: 'xlsx' });
      const uri = FileSystem.cacheDirectory + 'Matriz_Riesgo_Bipedestacion.xlsx';
      await FileSystem.writeAsStringAsync(uri, wbout, {
        encoding: FileSystem.EncodingType.Base64,
      });
      await Sharing.shareAsync(uri, {
        mimeType: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        dialogTitle: 'Compartir Matriz de Riesgo',
      });
    }
  };

  // Exportar Excel Global (todos los análisis)
  const exportarExcelGlobal = async () => {
    try {
      console.log('📊 Iniciando exportación Excel Global...');

      // Obtener todos los análisis globales
      const analisisGlobales = await FirestoreService.getAnalisisGlobales();

      if (!analisisGlobales || analisisGlobales.length === 0) {
        Alert.alert('Sin datos', 'No hay análisis disponibles para exportar');
        return;
      }

      console.log(`📊 Exportando ${analisisGlobales.length} análisis...`);

      // Headers para hoja de Identificación
      const headersIdent = [
        'UNIDAD DE NEGOCIO',
        'PLANTA',
        'TURNO',
        'AREA',
        'PUESTO',
        'CI 1',
        'CI 2',
        'CD 1',
        'CD 2',
        'CD 3',
        'CD 4',
        'CD 5',
        'REQUIERE ANALISIS',
        'FLUJO',
        'FECHA',
        'HORA'
      ];

      // Headers para hoja de Matriz de Riesgo
      const headersRiesgo = [
        'UNIDAD DE NEGOCIO',
        'PLANTA',
        'TURNO',
        'AREA',
        'PUESTO',
        'PONDERACION 1',
        'PONDERACION 2',
        'PONDERACION 3',
        'PONDERACION 4',
        'PONDERACION 5',
        'PONDERACION 6',
        'PONDERACION 7',
        'PUNTAJE',
        'NIVEL',
        'FECHA',
        'HORA'
      ];

      // Función para formatear fecha
      const formatearFecha = (fecha: string) => {
        try {
          return new Date(fecha).toLocaleDateString('es-ES', {
            year: 'numeric',
            month: '2-digit',
            day: '2-digit'
          });
        } catch {
          return fecha;
        }
      };

      // Función para formatear hora
      const formatearHora = (fecha: string) => {
        try {
          return new Date(fecha).toLocaleTimeString('es-ES', {
            hour: '2-digit',
            minute: '2-digit'
          });
        } catch {
          return fecha;
        }
      };

      // Preparar datos para hoja de Identificación
      const dataIdent = analisisGlobales.map(analisis => ({
        'UNIDAD DE NEGOCIO': analisis.unidadDeNegocio || 'N/A',
        'PLANTA': analisis.planta || 'N/A',
        'TURNO': analisis.turno || 'N/A',
        'AREA': analisis.area || 'N/A',
        'PUESTO': analisis.puesto || 'N/A',
        'CI 1': analisis.pregunta1 || 'N/A',
        'CI 2': analisis.pregunta2 || 'N/A',
        'CD 1': analisis.pregunta3 || 'N/A',
        'CD 2': analisis.pregunta4 || 'N/A',
        'CD 3': analisis.pregunta5 || 'N/A',
        'CD 4': analisis.pregunta6 || 'N/A',
        'CD 5': analisis.pregunta7 || 'N/A',
        'REQUIERE ANALISIS': analisis.requiereAnalisis || 'N/A',
        'FLUJO': analisis.flujo || 'N/A',
        'FECHA': formatearFecha(analisis.fechaHora || analisis.timestamp),
        'HORA': formatearHora(analisis.fechaHora || analisis.timestamp)
      }));

      // Preparar datos para hoja de Matriz de Riesgo
      const dataRiesgo = analisisGlobales.map(analisis => ({
        'UNIDAD DE NEGOCIO': analisis.unidadDeNegocio || 'N/A',
        'PLANTA': analisis.planta || 'N/A',
        'TURNO': analisis.turno || 'N/A',
        'AREA': analisis.area || 'N/A',
        'PUESTO': analisis.puesto || 'N/A',
        'PONDERACION 1': analisis.ponderacion1 || 'N/A',
        'PONDERACION 2': analisis.ponderacion2 || 'N/A',
        'PONDERACION 3': analisis.ponderacion3 || 'N/A',
        'PONDERACION 4': analisis.ponderacion4 || 'N/A',
        'PONDERACION 5': analisis.ponderacion5 || 'N/A',
        'PONDERACION 6': analisis.ponderacion6 || 'N/A',
        'PONDERACION 7': analisis.ponderacion7 || 'N/A',
        'PUNTAJE': analisis.puntaje || 'N/A',
        'NIVEL': analisis.nivel || 'N/A',
        'FECHA': formatearFecha(analisis.fechaHora || analisis.timestamp),
        'HORA': formatearHora(analisis.fechaHora || analisis.timestamp)
      }));

      // Crear hojas de Excel
      const wsIdent = XLSX.utils.json_to_sheet(dataIdent, { header: headersIdent });
      const wsRiesgo = XLSX.utils.json_to_sheet(dataRiesgo, { header: headersRiesgo });

      // Crear libro de Excel
      const wb = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(wb, wsIdent, 'Identificacion');
      XLSX.utils.book_append_sheet(wb, wsRiesgo, 'Matriz Riesgo');

      // Exportar según plataforma
      if (Platform.OS === 'web') {
        const wbout = XLSX.write(wb, { type: 'array', bookType: 'xlsx' });
        const blob = new Blob([wbout], {
          type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        });
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `Analisis_Globales_${new Date().toISOString().split('T')[0]}.xlsx`;
        document.body.appendChild(a);
        a.click();
        setTimeout(() => {
          document.body.removeChild(a);
          window.URL.revokeObjectURL(url);
        }, 0);
      } else {
        const wbout = XLSX.write(wb, { type: 'base64', bookType: 'xlsx' });
        const uri = FileSystem.cacheDirectory + `Analisis_Globales_${new Date().toISOString().split('T')[0]}.xlsx`;
        await FileSystem.writeAsStringAsync(uri, wbout, {
          encoding: FileSystem.EncodingType.Base64,
        });
        await Sharing.shareAsync(uri, {
          mimeType: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
          dialogTitle: 'Compartir Análisis Globales',
        });
      }

      console.log('✅ Exportación Excel Global completada');
      Alert.alert('Éxito', `Se exportaron ${analisisGlobales.length} análisis a Excel`);

    } catch (error) {
      console.error('❌ Error al exportar Excel Global:', error);
      Alert.alert('Error', 'No se pudo exportar el archivo Excel');
    }
  };



  // Función para limpiar análisis duplicados

  return (
    <AnimatedBackground>
      <View style={styles.container}>
        {/* Barra superior */}
        <LinearGradient
          colors={['#00BCD4', '#00796B']}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.topBar}
        >
          <View style={styles.topBarContent}>
            <Image source={require('@/assets/images/logo-ehs.png')} style={styles.logoImage} resizeMode="cover" />
            <View style={styles.topBarInfo}>
              <Text style={styles.topBarTitle}>Resultados Finales</Text>
              <Text style={styles.topBarSubtitle}>
                {businessUnit || unidad || ''} • {selectedPlanta || ''} • {selectedTurno || ''} • {selectedArea || ''} • {selectedPuesto || ''}
              </Text>
            </View>
          </View>
          <TouchableOpacity style={styles.topBarButton} onPress={handleHelp}>
            <Text style={styles.topBarButtonText}>?</Text>
          </TouchableOpacity>
        </LinearGradient>

        {/* Contenido */}
        <ScrollView style={styles.scrollView} contentContainerStyle={styles.scrollContent}>
          {/* Resumen */}
          <View style={styles.resumenBox}>
            <View style={styles.resumenHeader}>
              <Text style={styles.resumenTitulo}>Resumen del Análisis</Text>
              <View style={styles.resumenIcon}>
                <Text style={styles.resumenIconText}>📊</Text>
              </View>
            </View>

            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>Unidad de Negocio:</Text>
              <Text style={styles.infoValue}>{businessUnit || unidad || ''}</Text>
            </View>
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>Planta:</Text>
              <Text style={styles.infoValue}>{selectedPlanta || 'N/A'}</Text>
            </View>
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>Turno:</Text>
              <Text style={styles.infoValue}>{selectedTurno || 'N/A'}</Text>
            </View>
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>Área:</Text>
              <Text style={styles.infoValue}>{selectedArea || 'N/A'}</Text>
            </View>
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>Puesto:</Text>
              <Text style={styles.infoValue}>{selectedPuesto || 'N/A'}</Text>
            </View>
          </View>

          {/* Resultado del flujo */}
          <View style={styles.resultadoFlujoBox}>
            <View style={styles.resultadoFlujoHeader}>
              <Text style={styles.resultadoFlujoTitulo}>Resultado del Diagrama de Flujo</Text>
              <TouchableOpacity style={styles.botonGlosario} onPress={() => setShowGlosario(v => !v)} activeOpacity={0.8}>
                <Text style={styles.botonGlosarioTexto}>ℹ️</Text>
              </TouchableOpacity>
            </View>
            <Text style={styles.resultadoFlujoTexto}>{flujo}</Text>

            {showGlosario && (
              <View style={styles.glosarioBox}>
                {Object.entries(RECOMENDACIONES).map(([clave, texto]) => (
                  <View key={clave} style={styles.glosarioItem}>
                    <Text style={styles.glosarioClave}>{clave}:</Text>
                    <Text style={styles.glosarioTexto}>{texto}</Text>
                  </View>
                ))}
              </View>
            )}
          </View>

          {/* Evaluación de riesgo */}
          <View style={styles.riesgoBox}>
            <View style={styles.riesgoHeader}>
              <Text style={styles.riesgoTitulo}>Evaluación de Riesgo</Text>
              <View style={styles.riesgoIcon}>
                <Text style={styles.riesgoIconText}>⚠️</Text>
              </View>
            </View>

            <View style={styles.riesgoInfo}>
              <View style={[styles.riesgoItem, styles.withSpacing]}>
                <Text style={styles.riesgoLabel}>Puntaje Total:</Text>
                <Text style={styles.riesgoValue}>{puntaje}/21</Text>
              </View>
              <View style={styles.riesgoItem}>
                <Text style={styles.riesgoLabel}>Nivel de Riesgo:</Text>
                <View
                  style={[
                    styles.nivelRiesgo,
                    { backgroundColor: getNivelRiesgoColor(nivel || 'Desconocido') },
                  ]}
                >
                  <Text style={styles.nivelRiesgoTexto}>{nivel || 'Desconocido'}</Text>
                </View>
              </View>
            </View>
          </View>



          {/* Botones de acción */}
          <View style={styles.botonesContainer}>
            <TouchableOpacity style={[styles.botonInicio, styles.withSpacing]} onPress={handleInicio} activeOpacity={0.8}>
              <LinearGradient
                colors={['#007bff', '#0056b3']}
                style={styles.gradientButton}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
              >
                <Text style={styles.botonIcon}>🏠</Text>
                <Text style={styles.botonInicioTexto}>Inicio</Text>
              </LinearGradient>
            </TouchableOpacity>



            <TouchableOpacity style={[styles.botonExportarGlobal, styles.withSpacing]} onPress={exportarExcelGlobal} activeOpacity={0.8}>
              <LinearGradient
                colors={['#4caf50', '#45a049']}
                style={styles.gradientButton}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
              >
                <Text style={styles.botonIcon}>📊</Text>
                <Text style={styles.botonExportarGlobalTexto}>Exportar a Excel</Text>
              </LinearGradient>
            </TouchableOpacity>

            {!estadoGuardado.guardadoRemoto && (
              <TouchableOpacity
                style={[styles.botonEnviar, styles.withSpacing, estadoGuardado.guardando && styles.botonEnviarDisabled]}
                onPress={() => handleEnviarABaseDatos({ mostrarAlertas: true })}
                activeOpacity={0.8}
                disabled={estadoGuardado.guardando}
              >
                <LinearGradient
                  colors={estadoGuardado.guardando ? ['#b0bec5', '#78909c'] : ['#ff9800', '#fb8c00']}
                  style={styles.gradientButton}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 0 }}
                >
                  <Text style={styles.botonIcon}>📤</Text>
                  <Text style={styles.botonEnviarTexto}>
                    {estadoGuardado.guardando ? 'Enviando...' : 'Enviar a base de datos'}
                  </Text>
                </LinearGradient>
              </TouchableOpacity>
            )}

            <TouchableOpacity style={[styles.botonAnalisis, styles.withSpacing]} onPress={() => router.push({ pathname: '/(tabs)/analisis' })} activeOpacity={0.8}>
              <LinearGradient
                colors={['#9c27b0', '#7b1fa2']}
                style={styles.gradientButton}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
              >
                <Text style={styles.botonIcon}>🔍</Text>
                <Text style={styles.botonAnalisisTexto}>Análisis</Text>
              </LinearGradient>
            </TouchableOpacity>


            {/* Indicador de estado del guardado */}
            <View style={styles.estadoGuardadoContainer}>
              {estadoGuardado.guardadoLocal && !estadoGuardado.guardando && !estadoGuardado.guardadoRemoto && (
                <View style={styles.estadoLocal}>
                  <Text style={styles.estadoLocalIcon}>💾</Text>
                  <Text style={styles.estadoLocalTexto}>Análisis guardado en este dispositivo</Text>
                </View>
              )}
              {estadoGuardado.guardando && (
                <View style={styles.estadoGuardando}>
                  <Text style={styles.estadoGuardandoIcon}>⏳</Text>
                  <Text style={styles.estadoGuardandoTexto}>Enviando a la base de datos...</Text>
                </View>
              )}
              {estadoGuardado.guardadoRemoto && !estadoGuardado.guardando && (
                <View style={styles.estadoGuardado}>
                  <Text style={styles.estadoGuardadoIcon}>✅</Text>
                  <Text style={styles.estadoGuardadoTexto}>Análisis enviado a la base de datos</Text>
                </View>
              )}
              {estadoGuardado.error && !estadoGuardado.guardando && (
                <>
                  <View style={styles.estadoError}>
                    <Text style={styles.estadoErrorIcon}>⚠️</Text>
                    <Text style={styles.estadoErrorTexto}>
                      {estadoGuardado.error || 'No se pudo enviar automáticamente. Intenta manualmente.'}
                    </Text>
                  </View>
                  <TouchableOpacity
                    style={styles.botonReintentarEnvio}
                    onPress={() => handleEnviarABaseDatos({ mostrarAlertas: true })}
                    activeOpacity={0.8}
                  >
                    <LinearGradient
                      colors={['#ff9800', '#fb8c00']}
                      style={styles.gradientButton}
                      start={{ x: 0, y: 0 }}
                      end={{ x: 1, y: 0 }}
                    >
                      <Text style={styles.botonIcon}>🔄</Text>
                      <Text style={styles.botonEnviarTexto}>Reintentar envío</Text>
                    </LinearGradient>
                  </TouchableOpacity>
                </>
              )}
            </View>


          </View>
        </ScrollView>

        {/* Modal de Ayuda */}
        {showHelpModal && (
          <View style={styles.modalOverlay}>
            <View style={styles.modalContent}>
              <View style={styles.modalHeader}>
                <Text style={styles.modalTitle}>Definiciones</Text>
                <TouchableOpacity style={styles.modalCloseButton} onPress={() => setShowHelpModal(false)}>
                  <Text style={styles.modalCloseText}>✕</Text>
                </TouchableOpacity>
              </View>

              <ScrollView style={styles.modalScrollView}>
                <View style={styles.definitionItem}>
                  <Text style={styles.definitionTitle}>Bipedestación</Text>
                  <Text style={styles.definitionText}>La postura de pie de las personas trabajadoras.</Text>
                </View>
                <View style={styles.definitionItem}>
                  <Text style={styles.definitionTitle}>Bipedestación estática</Text>
                  <Text style={styles.definitionText}>
                    La postura de las personas trabajadoras que realizan sus tareas de pie y prácticamente sin moverse o con desplazamientos mínimos.
                  </Text>
                </View>
                <View style={styles.definitionItem}>
                  <Text style={styles.definitionTitle}>Bipedestación dinámica</Text>
                  <Text style={styles.definitionText}>
                    La postura de las personas trabajadoras que tienen la posibilidad de realizar desplazamientos más amplios que en la bipedestación estática.
                  </Text>
                </View>
                <View style={styles.definitionItem}>
                  <Text style={styles.definitionTitle}>Bipedestación prolongada</Text>
                  <Text style={styles.definitionText}>
                    La postura de las personas trabajadoras que realizan sus tareas de pie por más de tres horas continuas durante su jornada laboral.
                  </Text>
                </View>
                <View style={styles.definitionItem}>
                  <Text style={styles.definitionTitle}>Disposiciones</Text>
                  <Text style={styles.definitionText}>
                    El presente instrumento sobre los factores de riesgos de trabajo para garantizar el derecho al descanso durante la jornada laboral de las personas trabajadoras en bipedestación en los sectores de servicios, comercio, centros de trabajo análogos y establecimientos industriales.
                  </Text>
                </View>
                <View style={styles.definitionItem}>
                  <Text style={styles.definitionTitle}>Factores de riesgo</Text>
                  <Text style={styles.definitionText}>
                    Aquellos que se determinan en función del tiempo que permanecen en bipedestación, postura, movilidad, periodos de descanso, superficie y puesto de trabajo de las personas trabajadoras.
                  </Text>
                </View>
                <View style={styles.definitionItem}>
                  <Text style={styles.definitionTitle}>Posición sedente</Text>
                  <Text style={styles.definitionText}>
                    Posición de descanso sentado; postura anatómica en la que el cuerpo se apoya en la zona posterior de los muslos, los glúteos y la espalda, sin que intervenga la musculatura abdominal.
                  </Text>
                </View>
              </ScrollView>
            </View>
          </View>
        )}
      </View>
    </AnimatedBackground>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'transparent',
  },
  // Barra superior
  topBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingTop: 36,
    paddingBottom: 20,
    paddingHorizontal: 20,
    borderBottomLeftRadius: 25,
    borderBottomRightRadius: 25,
    elevation: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
  },
  topBarContent: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  logoImage: {
    width: 35,
    height: 35,
    marginRight: 10,
  },
  topBarInfo: {
    alignItems: 'flex-start',
    flex: 1,
  },
  topBarTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#fff',
    textAlign: 'left',
    flex: 1,
    lineHeight: 20,
  },
  topBarSubtitle: {
    fontSize: 14,
    color: '#b6e600',
    textAlign: 'left',
    fontWeight: '500',
  },
  // Scroll view
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: 20,
    paddingBottom: 40,
  },
  // Resumen del análisis
  resumenBox: {
    backgroundColor: 'rgba(255, 255, 255, 0.15)',
    borderRadius: 20,
    padding: 25,
    marginBottom: 20,
    width: '100%',
    elevation: 8,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.3)',
    shadowColor: 'rgba(0,0,0,0.3)',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.2,
    shadowRadius: 16,
  },
  resumenHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 20,
  },
  resumenTitulo: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#003b4c',
  },
  resumenIcon: {
    backgroundColor: '#00c4cc',
    borderRadius: 50,
    width: 50,
    height: 50,
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 4,
    shadowColor: 'rgba(0,196,204,1)',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
  },
  resumenIconText: {
    fontSize: 24,
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  infoLabel: {
    fontSize: 16,
    color: '#666',
    fontWeight: '500',
  },
  infoValue: {
    fontSize: 16,
    color: '#222',
    fontWeight: '600',
  },
  // Resultado del diagrama de flujo
  resultadoFlujoBox: {
    backgroundColor: 'rgba(255, 255, 255, 0.15)',
    borderRadius: 20,
    padding: 25,
    marginBottom: 20,
    width: '100%',
    elevation: 8,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.3)',
    shadowColor: 'rgba(0,0,0,0.3)',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.2,
    shadowRadius: 16,
  },
  resultadoFlujoHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 15,
  },
  resultadoFlujoTitulo: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#003b4c',
    flex: 1,
  },
  botonGlosario: {
    backgroundColor: '#00c4cc',
    borderRadius: 50,
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 3,
    shadowColor: 'rgba(0,196,204,1)',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
  },
  botonGlosarioTexto: {
    fontSize: 18,
  },
  resultadoFlujoTexto: {
    fontSize: 16,
    color: '#444',
    lineHeight: 24,
    fontWeight: '500',
  },
  glosarioBox: {
    marginTop: 15,
    backgroundColor: '#f8f9fa',
    borderRadius: 12,
    padding: 15,
    borderWidth: 1,
    borderColor: '#00c4cc',
  },
  glosarioItem: {
    marginBottom: 12,
  },
  glosarioClave: {
    fontWeight: 'bold',
    color: '#003b4c',
    fontSize: 14,
    marginBottom: 4,
  },
  glosarioTexto: {
    color: '#666',
    fontSize: 14,
    lineHeight: 20,
  },
  // Evaluación de riesgo
  riesgoBox: {
    backgroundColor: 'rgba(255, 255, 255, 0.15)',
    borderRadius: 20,
    padding: 25,
    marginBottom: 20,
    width: '100%',
    elevation: 8,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.3)',
    shadowColor: 'rgba(0,188,212,1)',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.2,
    shadowRadius: 16,
  },
  riesgoHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 20,
  },
  riesgoTitulo: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#003b4c',
  },
  riesgoIcon: {
    backgroundColor: '#ff9800',
    borderRadius: 50,
    width: 50,
    height: 50,
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 4,
    shadowColor: '#ff9800',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
  },
  riesgoIconText: {
    fontSize: 24,
  },
  riesgoInfo: {},
  riesgoItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
  },
  withSpacing: {
    marginBottom: 2,
  },
  riesgoLabel: {
    fontSize: 16,
    color: '#666',
    fontWeight: '500',
  },
  riesgoValue: {
    fontSize: 18,
    color: '#222',
    fontWeight: 'bold',
  },
  nivelRiesgo: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    minWidth: 80,
    alignItems: 'center',
  },
  nivelRiesgoTexto: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#fff',
  },
  // Historial (no usado)
  historialBox: {
    backgroundColor: 'rgba(255, 255, 255, 0.15)',
    borderRadius: 20,
    padding: 25,
    marginBottom: 20,
    width: '100%',
    elevation: 8,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.3)',
    shadowColor: 'rgba(0,188,212,1)',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.2,
    shadowRadius: 16,
  },
  historialHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 20,
  },
  historialTitulo: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#003b4c',
  },
  historialCount: {
    fontSize: 14,
    color: '#666',
    fontWeight: '500',
  },
  tablaContainer: {
    minWidth: 600,
  },
  tablaHeader: {
    flexDirection: 'row',
    backgroundColor: '#f8f9fa',
    borderRadius: 8,
    paddingVertical: 12,
    paddingHorizontal: 8,
    marginBottom: 8,
  },
  tablaHeaderText: {
    fontWeight: 'bold',
    fontSize: 12,
    color: '#003b4c',
    flex: 1,
    textAlign: 'center',
  },
  tablaRow: {
    flexDirection: 'row',
    backgroundColor: 'rgba(255, 255, 255, 0.15)',
    borderRadius: 6,
    paddingVertical: 10,
    paddingHorizontal: 8,
    marginBottom: 6,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.3)',
  },
  tablaCell: {
    fontSize: 11,
    color: '#666',
    flex: 1,
    textAlign: 'center',
    fontWeight: '500',
  },
  // Botones
  botonesContainer: {
    width: '100%',
  },
  botonIcon: {
    fontSize: 20,
    marginRight: 10,
  },
  botonBorrar: {
    backgroundColor: '#f44336',
    paddingVertical: 18,
    paddingHorizontal: 30,
    borderRadius: 16,
    alignItems: 'center',
    elevation: 4,
    flexDirection: 'row',
    justifyContent: 'center',
  },
  botonBorrarTexto: {
    fontSize: 16,
    color: '#fff',
    fontWeight: 'bold',
  },
  botonInicio: {
    paddingVertical: 18,
    paddingHorizontal: 30,
    borderRadius: 16,
    alignItems: 'center',
    elevation: 4,
    flexDirection: 'row',
    justifyContent: 'center',
    overflow: 'hidden',
  },
  botonInicioTexto: {
    fontSize: 16,
    color: '#fff',
    fontWeight: 'bold',
  },
  botonExportar: {
    backgroundColor: '#28a745',
    paddingVertical: 18,
    paddingHorizontal: 30,
    borderRadius: 16,
    alignItems: 'center',
    elevation: 4,
    flexDirection: 'row',
    justifyContent: 'center',
  },
  botonExportarTexto: {
    fontSize: 16,
    color: '#fff',
    fontWeight: 'bold',
  },
  botonBaseDatos: {
    backgroundColor: '#ff9500',
    paddingVertical: 18,
    paddingHorizontal: 30,
    borderRadius: 16,
    alignItems: 'center',
    elevation: 4,
    flexDirection: 'row',
    justifyContent: 'center',
  },
  botonBaseDatosTexto: {
    fontSize: 16,
    color: '#fff',
    fontWeight: 'bold',
  },
  botonAnalisis: {
    paddingVertical: 18,
    paddingHorizontal: 30,
    borderRadius: 16,
    alignItems: 'center',
    elevation: 4,
    flexDirection: 'row',
    justifyContent: 'center',
    overflow: 'hidden',
  },
  botonAnalisisTexto: {
    fontSize: 16,
    color: '#fff',
    fontWeight: 'bold',
  },

  botonExportarGlobal: {
    paddingVertical: 18,
    paddingHorizontal: 30,
    borderRadius: 16,
    alignItems: 'center',
    elevation: 4,
    flexDirection: 'row',
    justifyContent: 'center',
    overflow: 'hidden',
  },
  botonExportarGlobalTexto: {
    fontSize: 16,
    color: '#fff',
    fontWeight: 'bold',
  },
  botonEnviar: {
    paddingVertical: 18,
    paddingHorizontal: 30,
    borderRadius: 16,
    alignItems: 'center',
    elevation: 4,
    flexDirection: 'row',
    justifyContent: 'center',
    overflow: 'hidden',
  },
  botonEnviarTexto: {
    fontSize: 16,
    color: '#fff',
    fontWeight: 'bold',
  },
  botonEnviarDisabled: {
    opacity: 0.85,
  },
  botonReintentarEnvio: {
    width: '100%',
    marginTop: 10,
    borderRadius: 16,
    overflow: 'hidden',
  },
  gradientButton: {
    flex: 1,
    borderRadius: 16,
    paddingVertical: 18,
    paddingHorizontal: 30,
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
  },
  // Modal
  modalOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 1000,
  },
  modalContent: {
    backgroundColor: 'rgba(255, 255, 255, 0.95)',
    borderRadius: 20,
    padding: 30,
    margin: 20,
    width: '90%',
    maxWidth: 400,
    elevation: 12,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.4)',
    shadowColor: 'rgba(0,188,212,1)',
    shadowOffset: { width: 0, height: 12 },
    shadowOpacity: 0.3,
    shadowRadius: 20,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  modalTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#f44336',
    textAlign: 'center',
  },
  modalScrollView: {
    maxHeight: 300,
  },
  topBarButton: {
    backgroundColor: AppColors.secondary,
    borderRadius: 16,
    width: 32,
    height: 32,
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: 12,
  },
  topBarButtonText: {
    color: AppColors.textWhite,
    fontWeight: 'bold',
    fontSize: 20,
  },
  modalCloseButton: {
    backgroundColor: '#f44336',
    borderRadius: 16,
    width: 32,
    height: 32,
    alignItems: 'center',
    justifyContent: 'center',
  },
  modalCloseText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 18,
  },
  definitionItem: {
    backgroundColor: '#f0f9eb',
    borderRadius: 10,
    padding: 15,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: '#a5d6a7',
  },
  definitionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#2e7d32',
    marginBottom: 5,
  },
  definitionText: {
    fontSize: 14,
    color: '#388e3c',
    lineHeight: 22,
  },
  secondaryButton: {
    backgroundColor: '#28a745',
    marginTop: 10,
  },
  // Botón Limpiar Duplicados
  limpiarDuplicadosContainer: {
    alignItems: 'center',
    marginBottom: 20,
  },
  botonLimpiarDuplicados: {
    backgroundColor: '#f44336',
    paddingVertical: 18,
    paddingHorizontal: 40,
    borderRadius: 20,
    alignItems: 'center',
    flexDirection: 'row',
    elevation: 6,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.2,
    shadowRadius: 6,
  },
  botonLimpiarDuplicadosIcon: {
    fontSize: 24,
    marginRight: 12,
  },
  botonLimpiarDuplicadosTexto: {
    fontSize: 18,
    color: '#fff',
    fontWeight: 'bold',
  },
  // Indicador de estado del guardado
  estadoGuardadoContainer: {
    alignItems: 'center',
    marginTop: 10,
  },
  estadoLocal: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#e3f2fd',
    borderRadius: 10,
    paddingVertical: 10,
    paddingHorizontal: 15,
    borderWidth: 1,
    borderColor: '#90caf9',
    marginBottom: 8,
  },
  estadoLocalIcon: {
    fontSize: 20,
    marginRight: 8,
  },
  estadoLocalTexto: {
    fontSize: 14,
    color: '#0d47a1',
    fontWeight: 'bold',
  },
  estadoGuardando: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f0f9eb',
    borderRadius: 10,
    paddingVertical: 10,
    paddingHorizontal: 15,
    borderWidth: 1,
    borderColor: '#a5d6a7',
    marginBottom: 8,
  },
  estadoGuardandoIcon: {
    fontSize: 20,
    marginRight: 8,
  },
  estadoGuardandoTexto: {
    fontSize: 14,
    color: '#388e3c',
    fontWeight: 'bold',
  },
  estadoGuardado: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#e8f5e9',
    borderRadius: 10,
    paddingVertical: 10,
    paddingHorizontal: 15,
    borderWidth: 1,
    borderColor: '#a5d6a7',
  },
  estadoGuardadoIcon: {
    fontSize: 20,
    marginRight: 8,
  },
  estadoGuardadoTexto: {
    fontSize: 14,
    color: '#2e7d32',
    fontWeight: 'bold',
  },
  estadoError: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#ffebee',
    borderRadius: 10,
    paddingVertical: 10,
    paddingHorizontal: 15,
    borderWidth: 1,
    borderColor: '#ef9a9a',
    marginTop: 8,
  },
  estadoErrorIcon: {
    fontSize: 20,
    marginRight: 8,
  },
  estadoErrorTexto: {
    fontSize: 14,
    color: '#c62828',
    fontWeight: 'bold',
  },
});
