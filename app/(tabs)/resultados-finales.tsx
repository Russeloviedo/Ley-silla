// app/ResultadosFinalesScreen.tsx
import { StyleSheet, ScrollView, TouchableOpacity, View, Image, Alert, Platform } from 'react-native';
import { Text } from '@/components/Themed';
import { useState, useEffect } from 'react';
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
  const [guardandoAnalisis, setGuardandoAnalisis] = useState(false);
  const [analisisGuardado, setAnalisisGuardado] = useState(false);

  // Hook BU
  const { businessUnit, loading: buLoading } = useBusinessUnit();

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
    if (!unidad || !puesto || !subpuesto || !puntaje || !nivel) {
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

      // Verificar si ya existe un análisis similar
      console.log('🔍 Verificando si existe análisis similar...');
      const analisisExistentes = await FirestoreService.getAnalisisGlobales();
      const analisisSimilar = analisisExistentes.find(
        (analisis) =>
          analisis.unidadDeNegocio === unidadFinal &&
          analisis.planta === (_selectedPlanta || 'Sin especificar') &&
          analisis.turno === (_selectedTurno || 'Sin especificar') &&
          analisis.area === (_selectedArea || 'Sin especificar') &&
          analisis.puesto === (_selectedPuesto || 'Sin especificar') &&
          analisis.flujo === flujoNormalized
      );

      if (analisisSimilar) {
        console.log('⚠️ Análisis similar encontrado:', analisisSimilar);
        Alert.alert('⚠️ Análisis Existente', 'Ya existe un análisis para esta combinación de parámetros. No se guardará duplicado.');
        return;
      }

      console.log('✅ No se encontró análisis similar, procediendo a guardar...');

      // Objeto a guardar
      const nuevoAnalisis: HistorialAnalisis = {
        // Legacy visibles
        unidad: unidadFinal,
        puesto: _selectedPuesto || 'Sin especificar',
        subpuesto: '',

        // Nueva estructura
        unidadDeNegocio: unidadFinal,
        planta: (_selectedPlanta || 'Sin especificar'),
        turno: (_selectedTurno || 'Sin especificar'),
        area: (_selectedArea || 'Sin especificar'),

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

        // Preguntas (legacy / flujo)
        pregunta1: respuestasIniciales[1] || 'N/A',
        pregunta2:
          respuestasIniciales[2] === 'Sí'
            ? 'Sí'
            : respuestasIniciales[2] === 'No'
            ? 'No'
            : 'N/A',
        pregunta3: respuestasFlujoData[3] || '',
        pregunta4: respuestasFlujoData[4] || '',
        pregunta5: respuestasFlujoData[5] || '',
        pregunta6: respuestasFlujoData[6] || '',
        pregunta7: respuestasFlujoData[7] || '',
        pregunta8: respuestasFlujoData[8] || '',
        pregunta9: respuestasFlujoData[9] || '',
      };

      console.log('📋 Nuevo análisis a guardar:', nuevoAnalisis);

      try {
        console.log('📤 Guardando en Firestore...');
        const result = await FirestoreService.saveAnalysis(nuevoAnalisis);
        console.log('✅ Guardado con IDs:', result);
        return result;
      } catch (firestoreError) {
        console.error('❌ Error al guardar en Firestore:', firestoreError);
        throw firestoreError;
      }
    } catch (error) {
      console.error('❌ Error general en guardarAnalisisAutomatico:', error);
      Alert.alert('❌ Error', 'Error inesperado al guardar el análisis');
      throw error;
    }
  };

  // Guardado automático en Firestore
  useEffect(() => {
    // Ejecutar guardado automático cuando se monta el componente
    const ejecutarGuardadoAutomatico = async () => {
      try {
        console.log('🚀 Ejecutando guardado automático al montar componente...');
        console.log('📋 Parámetros disponibles:', params);
        console.log('🏢 Valores de estado:', { selectedPlanta, selectedTurno, selectedArea, selectedPuesto });
        
        // Verificar si ya se guardó este análisis (evitar duplicados)
        // Usar una clave basada en los parámetros del análisis, no en timestamp
        const analisisGuardadoKey = `analisis_guardado_${params.unidad || ''}_${selectedPlanta || ''}_${selectedTurno || ''}_${selectedArea || ''}_${selectedPuesto || ''}_${params.flujo || ''}`;
        console.log('🔑 Clave de guardado:', analisisGuardadoKey);
        
        const yaSeGuardo = await AsyncStorage.getItem(analisisGuardadoKey);
        console.log('✅ ¿Ya se guardó?', yaSeGuardo);
        
        if (yaSeGuardo) {
          console.log('⚠️ Este análisis ya fue guardado, no se guardará nuevamente');
          setAnalisisGuardado(true);
          return;
        }

        // Marcar como guardado para evitar duplicados
        await AsyncStorage.setItem(analisisGuardadoKey, 'true');
        console.log('🔒 Marcado como guardado en AsyncStorage');
        
        // Mostrar estado de guardando
        setGuardandoAnalisis(true);
        
        // Ejecutar el guardado
        console.log('💾 Iniciando guardado en Firestore...');
        await guardarAnalisisAutomatico();
        
        // Marcar como guardado exitosamente
        setGuardandoAnalisis(false);
        setAnalisisGuardado(true);
        
        console.log('✅ Guardado automático completado exitosamente');
      } catch (error) {
        console.error('❌ Error en guardado automático:', error);
        setGuardandoAnalisis(false);
      }
    };

    // Ejecutar después de un breve delay para asegurar que todos los datos estén cargados
    const timer = setTimeout(() => {
      ejecutarGuardadoAutomatico();
    }, 2000); // 2 segundos de delay

    return () => clearTimeout(timer);
  }, []); // Solo se ejecuta una vez al montar el componente

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
      'PREGUNTA 1',
      'PREGUNTA 2',
      'PREGUNTA 3',
      'PREGUNTA 4',
      'PREGUNTA 5',
      'PREGUNTA 6',
      'PREGUNTA 7',
      'PREGUNTA 8',
      'PREGUNTA 9',
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
        'PREGUNTA 1': respuestasIniciales[1] || '',
        'PREGUNTA 2':
          respuestasIniciales[2] === 'Sí' ? 'Sí' : respuestasIniciales[2] === 'No' ? 'No' : '',
        'PREGUNTA 3': getRespuestaConNA(respuestasFlujoData[3] || '', 3, flujoNormalized),
        'PREGUNTA 4': getRespuestaConNA(respuestasFlujoData[4] || '', 4, flujoNormalized),
        'PREGUNTA 5': getRespuestaConNA(respuestasFlujoData[5] || '', 5, flujoNormalized),
        'PREGUNTA 6': getRespuestaConNA(respuestasFlujoData[6] || '', 6, flujoNormalized),
        'PREGUNTA 7': getRespuestaConNA(respuestasFlujoData[7] || '', 7, flujoNormalized),
        'PREGUNTA 8': getRespuestaConNA(respuestasFlujoData[8] || '', 8, flujoNormalized),
        'PREGUNTA 9': getRespuestaConNA(respuestasFlujoData[9] || '', 9, flujoNormalized),
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
        'PREGUNTA 1',
        'PREGUNTA 2',
        'PREGUNTA 3',
        'PREGUNTA 4',
        'PREGUNTA 5',
        'PREGUNTA 6',
        'PREGUNTA 7',
        'PREGUNTA 8',
        'PREGUNTA 9',
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
        'PREGUNTA 1': analisis.pregunta1 || 'N/A',
        'PREGUNTA 2': analisis.pregunta2 || 'N/A',
        'PREGUNTA 3': analisis.pregunta3 || 'N/A',
        'PREGUNTA 4': analisis.pregunta4 || 'N/A',
        'PREGUNTA 5': analisis.pregunta5 || 'N/A',
        'PREGUNTA 6': analisis.pregunta6 || 'N/A',
        'PREGUNTA 7': analisis.pregunta7 || 'N/A',
        'PREGUNTA 8': analisis.pregunta8 || 'N/A',
        'PREGUNTA 9': analisis.pregunta9 || 'N/A',
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



  // Función para navegar al inicio
  const handleIniciarAnalisis = () => {
    router.replace('/');
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

            {/* Botón principal */}
            <TouchableOpacity
              style={styles.mainButton}
              onPress={handleIniciarAnalisis}
              activeOpacity={0.8}
            >
              <LinearGradient
                colors={['#003333', '#006666']}
                style={styles.gradientMainButton}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
              >
                <View style={styles.buttonContent}>
                  <Text style={styles.buttonEmoji}>🚀</Text>
                  <Text style={styles.buttonText}>Iniciar Nuevo Análisis</Text>
                </View>
              </LinearGradient>
            </TouchableOpacity>



            {/* Indicador de estado del guardado */}
            <View style={styles.estadoGuardadoContainer}>
              {guardandoAnalisis && (
                <View style={styles.estadoGuardando}>
                  <Text style={styles.estadoGuardandoIcon}>⏳</Text>
                  <Text style={styles.estadoGuardandoTexto}>Guardando análisis...</Text>
                </View>
              )}
              {analisisGuardado && !guardandoAnalisis && (
                <View style={styles.estadoGuardado}>
                  <Text style={styles.estadoGuardadoIcon}>✅</Text>
                  <Text style={styles.estadoGuardadoTexto}>Análisis guardado exitosamente</Text>
                </View>
              )}
            </View>

            {/* Botón de debug temporal */}
            <View style={styles.debugContainer}>
              <TouchableOpacity
                style={styles.botonDebug}
                onPress={async () => {
                  console.log('🔍 DEBUG: Probando guardado manual...');
                  try {
                    await guardarAnalisisAutomatico();
                    Alert.alert('✅ Debug', 'Guardado manual exitoso');
                  } catch (error) {
                    console.error('❌ Debug error:', error);
                    Alert.alert('❌ Debug Error', String(error));
                  }
                }}
                activeOpacity={0.8}
              >
                <Text style={styles.botonDebugTexto}>🐛 Debug Guardado</Text>
              </TouchableOpacity>
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
  mainButton: {
    marginTop: 10,
    paddingVertical: 18,
    paddingHorizontal: 30,
    borderRadius: 16,
    alignItems: 'center',
    elevation: 4,
    flexDirection: 'row',
    justifyContent: 'center',
    overflow: 'hidden',
  },
  gradientMainButton: {
    flex: 1,
    borderRadius: 16,
    paddingVertical: 18,
    paddingHorizontal: 30,
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
  },
  buttonContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  buttonEmoji: {
    fontSize: 20,
    marginRight: 10,
  },
  buttonText: {
    fontSize: 16,
    color: '#fff',
    fontWeight: 'bold',
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
  estadoGuardando: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f0f9eb',
    borderRadius: 10,
    paddingVertical: 10,
    paddingHorizontal: 15,
    borderWidth: 1,
    borderColor: '#a5d6a7',
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
  debugContainer: {
    marginTop: 10,
    alignItems: 'center',
  },
  botonDebug: {
    backgroundColor: '#4CAF50', // Verde para debug
    paddingVertical: 12,
    paddingHorizontal: 25,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 4,
    shadowColor: '#388e3c',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
  },
  botonDebugTexto: {
    color: '#fff',
    fontSize: 14,
    fontWeight: 'bold',
  },
});
