// app/(tabs)/analisis.tsx
import { StyleSheet, ScrollView, TouchableOpacity, View, Image, Alert, TextInput, Platform, Linking } from 'react-native';
import { Text } from '@/components/Themed';
import { useState, useEffect, useCallback, useRef, useMemo } from 'react';
import { useRouter } from 'expo-router';
import { AppColors } from '@/constants/Colors';
import AnimatedBackground from '@/components/AnimatedBackground';
import { LinearGradient } from 'expo-linear-gradient';
import { FirestoreService } from '@/utils/firestoreService';
import { loadLocalAnalyses, AnalisisLocalEntry, clearAllLocalAnalyses } from '@/utils/localAnalysis';
import * as FileSystem from 'expo-file-system';
import * as Sharing from 'expo-sharing';
import * as XLSX from 'xlsx';

interface AnalisisGlobal {
  id: string;
  unidadDeNegocio: string;
  planta: string;
  turno: string;
  area: string;
  puesto: string;
  flujo: string;
  ponderacion1: string;
  ponderacion2: string;
  ponderacion3: string;
  ponderacion4: string;
  ponderacion5: string;
  ponderacion6: string;
  ponderacion7: string;
  puntaje: string;
  nivel: string;
  requiereAnalisis: string;
  fechaHora: string;
  timestamp: string;
  pregunta1?: string;
  pregunta2?: string;
  pregunta3?: string;
  pregunta4?: string;
  pregunta5?: string;
  pregunta6?: string;
  pregunta7?: string;
  pregunta8?: string;
  pregunta9?: string;
  origen?: 'local' | 'remoto';
  esLocal?: boolean;
  claveUnica?: string;
}

type HojaActiva = 'identificacion' | 'matriz';

const timestampDeAnalisis = (item: AnalisisGlobal): number => {
  const raw = item.timestamp || item.fechaHora;
  const date = raw ? new Date(raw) : null;
  return date?.getTime() ?? 0;
};

const toDisplayValue = (value: unknown): string => {
  if (value === null || value === undefined) {
    return '';
  }

  if (typeof value === 'string') {
    return value;
  }

  if (typeof value === 'number') {
    return Number.isFinite(value) ? String(value) : '';
  }

  if (typeof value === 'boolean') {
    return value ? 'Sí' : 'No';
  }

  if (value instanceof Date) {
    return value.toISOString();
  }

  try {
    return JSON.stringify(value);
  } catch {
    return String(value);
  }
};

export default function AnalisisScreen() {
  const router = useRouter();
  const [analisis, setAnalisis] = useState<AnalisisGlobal[]>([]);
  const [analisisLocales, setAnalisisLocales] = useState<AnalisisLocalEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [hojaActiva, setHojaActiva] = useState<HojaActiva>('identificacion');
  const [busqueda, setBusqueda] = useState('');
  const [ordenamiento, setOrdenamiento] = useState<{ columna: string; ascendente: boolean }>({ columna: 'ordenCreacion', ascendente: false });
  const [tablaPantallaCompleta, setTablaPantallaCompleta] = useState(false);
  const [ultimaActualizacion, setUltimaActualizacion] = useState<Date | null>(null);
  const cargaEnCurso = useRef(false);
  const ultimoAnalisis = useMemo(() => (analisis.length > 0 ? analisis[0] : null), [analisis]);

  // Cargar análisis globales
  const cargarAnalisisGlobales = useCallback(async (mostrarCarga: boolean = false) => {
    if (cargaEnCurso.current) {
      console.log('ℹ️ Se omitió un refresco porque ya hay una carga en curso.');
      return;
    }

    try {
      cargaEnCurso.current = true;
      if (mostrarCarga) {
        setLoading(true);
      }
      console.log('📥 Cargando análisis globales y locales...');

      const [analisisGlobales, localesPendientes] = await Promise.all([
        FirestoreService.getAnalisisGlobales(),
        loadLocalAnalyses(),
      ]);

      setAnalisisLocales(localesPendientes);

      const localesFormateados: AnalisisGlobal[] = localesPendientes
        .filter((entry) => !entry.synced)
        .map((entry) => ({
          id: entry.id,
          unidadDeNegocio: entry.data.unidadDeNegocio || entry.data.unidad || '',
          planta: entry.data.planta || '',
          turno: entry.data.turno || '',
          area: entry.data.area || '',
          puesto: entry.data.puesto || '',
          flujo: entry.data.flujo || '',
          ponderacion1: toDisplayValue(entry.data.ponderacion1),
          ponderacion2: toDisplayValue(entry.data.ponderacion2),
          ponderacion3: toDisplayValue(entry.data.ponderacion3),
          ponderacion4: toDisplayValue(entry.data.ponderacion4),
          ponderacion5: toDisplayValue(entry.data.ponderacion5),
          ponderacion6: toDisplayValue(entry.data.ponderacion6),
          ponderacion7: toDisplayValue(entry.data.ponderacion7),
          puntaje: toDisplayValue(entry.data.puntaje),
          nivel: toDisplayValue(entry.data.nivel),
          requiereAnalisis: 'Pendiente',
          fechaHora: entry.updatedAt,
          timestamp: entry.updatedAt,
          pregunta1: toDisplayValue(entry.data.pregunta1),
          pregunta2: toDisplayValue(entry.data.pregunta2),
          pregunta3: toDisplayValue(entry.data.pregunta3),
          pregunta4: toDisplayValue(entry.data.pregunta4),
          pregunta5: toDisplayValue(entry.data.pregunta5),
          pregunta6: toDisplayValue(entry.data.pregunta6),
          pregunta7: toDisplayValue(entry.data.pregunta7),
          pregunta8: toDisplayValue(entry.data.pregunta8),
          pregunta9: toDisplayValue(entry.data.pregunta9),
          origen: 'local',
          esLocal: true,
          claveUnica: entry.claveUnica,
        }))
        .sort((a, b) => new Date(b.timestamp || '').getTime() - new Date(a.timestamp || '').getTime()) as AnalisisGlobal[];

      // Log de depuración para ver los datos remotos (opcional)
      console.log('🔍 Datos recibidos del primer análisis remoto:', analisisGlobales[0]);

      const remotos = analisisGlobales.map((item) => ({ ...item, origen: 'remoto' as const, esLocal: false }));

      const combinados = [...localesFormateados, ...remotos].sort(
        (a, b) => timestampDeAnalisis(b) - timestampDeAnalisis(a)
      );
      setAnalisis(combinados);
      setUltimaActualizacion(new Date());

      console.log(`✅ Cargados ${analisisGlobales.length} análisis globales + ${localesPendientes.length} locales`);
    } catch (error) {
      console.error('❌ Error al cargar análisis globales:', error);
      if (mostrarCarga) {
        Alert.alert('Error', 'No se pudieron cargar los análisis');
      }
    } finally {
      if (mostrarCarga) {
        setLoading(false);
      }
      cargaEnCurso.current = false;
    }
  }, []);

  // Cargar datos al montar
  useEffect(() => {
    const limpiarYcargar = async () => {
      try {
        await clearAllLocalAnalyses();
      } catch (error) {
        console.warn('⚠️ No se pudieron limpiar los análisis locales antes de cargar:', error);
      }
      cargarAnalisisGlobales(true);
    };

    limpiarYcargar();
  }, [cargarAnalisisGlobales]);

  // Refresco automático periódico (cada 5 minutos)
  useEffect(() => {
    const intervalo = setInterval(() => {
      cargarAnalisisGlobales(false);
    }, 5 * 60 * 1000);

    return () => clearInterval(intervalo);
  }, [cargarAnalisisGlobales]);

  // Alternar modo pantalla completa
  const togglePantallaCompleta = () => {
    setTablaPantallaCompleta(!tablaPantallaCompleta);
  };

  // Abrir Google Sheets con análisis globales
  const abrirAnalisisGlobales = async () => {
    const url = 'https://docs.google.com/spreadsheets/d/146qa6JdnDtgpgCUKlT-KFXvPq5XMKOXS_0J8orG3c6w/edit?gid=0#gid=0';
    try {
      const canOpen = await Linking.canOpenURL(url);
      if (canOpen) {
        await Linking.openURL(url);
      } else {
        Alert.alert('Error', 'No se pudo abrir el enlace');
      }
    } catch (error) {
      console.error('Error al abrir el enlace:', error);
      Alert.alert('Error', 'No se pudo abrir el enlace');
    }
  };

  // Navegar a resultados finales
  const handleNuevoAnalisis = () => {
    router.push({ pathname: '/(tabs)/resultados-finales' });
  };

  // Navegar a resultados finales
  const handleResultadosFinales = () => {
    router.push({ pathname: '/(tabs)/resultados-finales' });
  };

  // Navegar a inicio
  const handleInicio = () => {
    router.replace('/');
  };

  const exportarAnalisisExcel = async () => {
    try {
      const analisisGlobales = await FirestoreService.getAnalisisGlobales();

      if (!analisisGlobales || analisisGlobales.length === 0) {
        Alert.alert('Sin datos', 'No hay análisis disponibles para exportar.');
        return;
      }

      const dataIdent = analisisGlobales.map((analisis) => {
        const fechaReferencia = analisis.fechaHora || analisis.timestamp || '';
        return {
          'UNIDAD DE NEGOCIO': analisis.unidadDeNegocio || 'N/A',
          PLANTA: analisis.planta || 'N/A',
          TURNO: analisis.turno || 'N/A',
          AREA: analisis.area || 'N/A',
          PUESTO: analisis.puesto || 'N/A',
          'CI 1': analisis.pregunta1 || 'N/A',
          'CI 2': analisis.pregunta2 || 'N/A',
          'CD 1': analisis.pregunta3 || 'N/A',
          'CD 2': analisis.pregunta4 || 'N/A',
          'CD 3': analisis.pregunta5 || 'N/A',
          'CD 4': analisis.pregunta6 || 'N/A',
          'CD 5': analisis.pregunta7 || 'N/A',
          'CI 8': analisis.pregunta8 || 'N/A',
          'CI 9': analisis.pregunta9 || 'N/A',
          'REQUIERE ANALISIS': analisis.requiereAnalisis || 'N/A',
          FLUJO: analisis.flujo || 'N/A',
          FECHA: formatearFecha(fechaReferencia),
          HORA: formatearHora(fechaReferencia),
        };
      });

      const dataRiesgo = analisisGlobales.map((analisis) => {
        const fechaReferencia = analisis.fechaHora || analisis.timestamp || '';
        return {
          'UNIDAD DE NEGOCIO': analisis.unidadDeNegocio || 'N/A',
          PLANTA: analisis.planta || 'N/A',
          TURNO: analisis.turno || 'N/A',
          AREA: analisis.area || 'N/A',
          PUESTO: analisis.puesto || 'N/A',
          'PONDERACION 1': analisis.ponderacion1 || 'N/A',
          'PONDERACION 2': analisis.ponderacion2 || 'N/A',
          'PONDERACION 3': analisis.ponderacion3 || 'N/A',
          'PONDERACION 4': analisis.ponderacion4 || 'N/A',
          'PONDERACION 5': analisis.ponderacion5 || 'N/A',
          'PONDERACION 6': analisis.ponderacion6 || 'N/A',
          'PONDERACION 7': analisis.ponderacion7 || 'N/A',
          PUNTAJE: analisis.puntaje || 'N/A',
          NIVEL: analisis.nivel || 'N/A',
          FECHA: formatearFecha(fechaReferencia),
          HORA: formatearHora(fechaReferencia),
        };
      });

      const wsIdent = XLSX.utils.json_to_sheet(dataIdent);
      const wsRiesgo = XLSX.utils.json_to_sheet(dataRiesgo);
      const wb = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(wb, wsIdent, 'Identificacion');
      XLSX.utils.book_append_sheet(wb, wsRiesgo, 'MatrizRiesgo');

      const nombreArchivo = `Analisis_Globales_${new Date().toISOString().split('T')[0]}.xlsx`;

      if (Platform.OS === 'web') {
        const wbout = XLSX.write(wb, { type: 'array', bookType: 'xlsx' });
        const blob = new Blob([wbout], {
          type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        });
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = nombreArchivo;
        document.body.appendChild(a);
        a.click();
        setTimeout(() => {
          document.body.removeChild(a);
          window.URL.revokeObjectURL(url);
        }, 0);
      } else {
        const wbout = XLSX.write(wb, { type: 'base64', bookType: 'xlsx' });
        const uri = FileSystem.cacheDirectory + nombreArchivo;
        await FileSystem.writeAsStringAsync(uri, wbout, {
          encoding: FileSystem.EncodingType.Base64,
        });
        await Sharing.shareAsync(uri, {
          mimeType: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
          dialogTitle: 'Compartir Análisis Globales',
        });
      }
    } catch (error) {
      console.error('❌ Error al exportar análisis a Excel:', error);
      Alert.alert('Error', 'No se pudo exportar el archivo Excel.');
    }
  };


  // Formatear fecha
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

  // Formatear hora
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

  // Obtener color del nivel de riesgo
  const getColorNivel = (nivel: string) => {
    switch (nivel?.toLowerCase()) {
      case 'bajo': return '#4caf50';
      case 'medio': return '#ff9800';
      case 'alto': return '#f44336';
      default: return '#9e9e9e';
    }
  };

  // Filtrar y ordenar datos
  const datosFiltrados = analisis
    .filter(item => {
      if (!busqueda) return true;
      const busquedaLower = busqueda.toLowerCase();
      return (
        item.unidadDeNegocio?.toLowerCase().includes(busquedaLower) ||
        item.planta?.toLowerCase().includes(busquedaLower) ||
        item.turno?.toLowerCase().includes(busquedaLower) ||
        item.area?.toLowerCase().includes(busquedaLower) ||
        item.puesto?.toLowerCase().includes(busquedaLower)
      );
    })
    .sort((a, b) => {
      // Ordenamiento por orden de creación (más recientes primero por defecto)
      if (ordenamiento.columna === 'ordenCreacion') {
        // Usar el índice del array como orden de creación (más reciente = índice menor)
        const indexA = analisis.indexOf(a);
        const indexB = analisis.indexOf(b);
        return ordenamiento.ascendente ? indexA - indexB : indexB - indexA;
      }

      const aValue = a[ordenamiento.columna as keyof AnalisisGlobal];
      const bValue = b[ordenamiento.columna as keyof AnalisisGlobal];

      if (ordenamiento.columna === 'fechaHora' || ordenamiento.columna === 'timestamp') {
        const aDate = new Date(String(aValue || ''));
        const bDate = new Date(String(bValue || ''));
        return ordenamiento.ascendente ? aDate.getTime() - bDate.getTime() : bDate.getTime() - aDate.getTime();
      }

      if (typeof aValue === 'string' && typeof bValue === 'string') {
        return ordenamiento.ascendente
          ? aValue.localeCompare(bValue)
          : bValue.localeCompare(aValue);
      }

      return 0;
    });

  // Cambiar ordenamiento
  const cambiarOrdenamiento = (columna: string) => {
    setOrdenamiento(prev => ({
      columna,
      ascendente: prev.columna === columna ? !prev.ascendente : true
    }));
  };

  // Renderizar encabezado de tabla
  const renderEncabezadoTabla = () => {
    if (hojaActiva === 'identificacion') {
      return (
        <View style={styles.tablaHeader}>
          <TouchableOpacity
            style={[styles.columnaHeader, styles.colUnidad]}
            onPress={() => cambiarOrdenamiento('unidadDeNegocio')}
          >
            <Text style={styles.headerText}>Unidad de Negocio</Text>
            {ordenamiento.columna === 'unidadDeNegocio' && (
              <Text style={styles.ordenIcon}>{ordenamiento.ascendente ? '↑' : '↓'}</Text>
            )}
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.columnaHeader, styles.colPlanta]}
            onPress={() => cambiarOrdenamiento('planta')}
          >
            <Text style={styles.headerText}>Planta</Text>
            {ordenamiento.columna === 'planta' && (
              <Text style={styles.ordenIcon}>{ordenamiento.ascendente ? '↑' : '↓'}</Text>
            )}
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.columnaHeader, styles.colTurno]}
            onPress={() => cambiarOrdenamiento('turno')}
          >
            <Text style={styles.headerText}>Turno</Text>
            {ordenamiento.columna === 'turno' && (
              <Text style={styles.ordenIcon}>{ordenamiento.ascendente ? '↑' : '↓'}</Text>
            )}
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.columnaHeader, styles.colArea]}
            onPress={() => cambiarOrdenamiento('area')}
          >
            <Text style={styles.headerText}>Área</Text>
            {ordenamiento.columna === 'area' && (
              <Text style={styles.ordenIcon}>{ordenamiento.ascendente ? '↑' : '↓'}</Text>
            )}
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.columnaHeader, styles.colPuesto]}
            onPress={() => cambiarOrdenamiento('puesto')}
          >
            <Text style={styles.headerText}>Puesto</Text>
            {ordenamiento.columna === 'puesto' && (
              <Text style={styles.ordenIcon}>{ordenamiento.ascendente ? '↑' : '↓'}</Text>
            )}
          </TouchableOpacity>
          <View style={[styles.columnaHeader, styles.colPregunta1]}>
            <Text style={styles.headerText}>CI 1</Text>
          </View>
          <View style={[styles.columnaHeader, styles.colPregunta2]}>
            <Text style={styles.headerText}>CI 2</Text>
          </View>
          <View style={[styles.columnaHeader, styles.colPregunta3]}>
            <Text style={styles.headerText}>CD 1</Text>
          </View>
          <View style={[styles.columnaHeader, styles.colPregunta4]}>
            <Text style={styles.headerText}>CD 2</Text>
          </View>
          <View style={[styles.columnaHeader, styles.colPregunta5]}>
            <Text style={styles.headerText}>CD 3</Text>
          </View>
          <View style={[styles.columnaHeader, styles.colPregunta6]}>
            <Text style={styles.headerText}>CD 4</Text>
          </View>
          <View style={[styles.columnaHeader, styles.colPregunta7]}>
            <Text style={styles.headerText}>CD 5</Text>
          </View>
          <View style={[styles.columnaHeader, styles.colRequiere]}>
            <Text style={styles.headerText}>Requiere Análisis</Text>
          </View>
          <View style={[styles.columnaHeader, styles.colFlujo]}>
            <Text style={styles.headerText}>Flujo</Text>
          </View>
          <TouchableOpacity
            style={[styles.columnaHeader, styles.colFecha]}
            onPress={() => cambiarOrdenamiento('ordenCreacion')}
          >
            <Text style={styles.headerText}>Orden de Creación</Text>
            {ordenamiento.columna === 'ordenCreacion' && (
              <Text style={styles.ordenIcon}>{ordenamiento.ascendente ? '↑' : '↓'}</Text>
            )}
          </TouchableOpacity>
          <View style={[styles.columnaHeader, styles.colHora]}>
            <Text style={styles.headerText}>Hora</Text>
          </View>
        </View>
      );
    } else {
      return (
        <View style={styles.tablaHeader}>
          <TouchableOpacity
            style={[styles.columnaHeader, styles.colUnidad]}
            onPress={() => cambiarOrdenamiento('unidadDeNegocio')}
          >
            <Text style={styles.headerText}>Unidad de Negocio</Text>
            {ordenamiento.columna === 'unidadDeNegocio' && (
              <Text style={styles.ordenIcon}>{ordenamiento.ascendente ? '↑' : '↓'}</Text>
            )}
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.columnaHeader, styles.colPlanta]}
            onPress={() => cambiarOrdenamiento('planta')}
          >
            <Text style={styles.headerText}>Planta</Text>
            {ordenamiento.columna === 'planta' && (
              <Text style={styles.ordenIcon}>{ordenamiento.ascendente ? '↑' : '↓'}</Text>
            )}
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.columnaHeader, styles.colTurno]}
            onPress={() => cambiarOrdenamiento('turno')}
          >
            <Text style={styles.headerText}>Turno</Text>
            {ordenamiento.columna === 'turno' && (
              <Text style={styles.ordenIcon}>{ordenamiento.ascendente ? '↑' : '↓'}</Text>
            )}
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.columnaHeader, styles.colArea]}
            onPress={() => cambiarOrdenamiento('area')}
          >
            <Text style={styles.headerText}>Área</Text>
            {ordenamiento.columna === 'area' && (
              <Text style={styles.ordenIcon}>{ordenamiento.ascendente ? '↑' : '↓'}</Text>
            )}
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.columnaHeader, styles.colPuesto]}
            onPress={() => cambiarOrdenamiento('puesto')}
          >
            <Text style={styles.headerText}>Puesto</Text>
            {ordenamiento.columna === 'puesto' && (
              <Text style={styles.ordenIcon}>{ordenamiento.ascendente ? '↑' : '↓'}</Text>
            )}
          </TouchableOpacity>
          <View style={[styles.columnaHeader, styles.colPonderacion1]}>
            <Text style={styles.headerText}>Ponderación 1</Text>
          </View>
          <View style={[styles.columnaHeader, styles.colPonderacion2]}>
            <Text style={styles.headerText}>Ponderación 2</Text>
          </View>
          <View style={[styles.columnaHeader, styles.colPonderacion3]}>
            <Text style={styles.headerText}>Ponderación 3</Text>
          </View>
          <View style={[styles.columnaHeader, styles.colPonderacion4]}>
            <Text style={styles.headerText}>Ponderación 4</Text>
          </View>
          <View style={[styles.columnaHeader, styles.colPonderacion5]}>
            <Text style={styles.headerText}>Ponderación 5</Text>
          </View>
          <View style={[styles.columnaHeader, styles.colPonderacion6]}>
            <Text style={styles.headerText}>Ponderación 6</Text>
          </View>
          <View style={[styles.columnaHeader, styles.colPonderacion7]}>
            <Text style={styles.headerText}>Ponderación 7</Text>
          </View>
          <View style={[styles.columnaHeader, styles.colPuntaje]}>
            <Text style={styles.headerText}>Puntaje</Text>
          </View>
          <View style={[styles.columnaHeader, styles.colNivel]}>
            <Text style={styles.headerText}>Nivel</Text>
          </View>
          <TouchableOpacity
            style={[styles.columnaHeader, styles.colFecha]}
            onPress={() => cambiarOrdenamiento('fechaHora')}
          >
            <Text style={styles.headerText}>Fecha</Text>
            {ordenamiento.columna === 'fechaHora' && (
              <Text style={styles.ordenIcon}>{ordenamiento.ascendente ? '↑' : '↓'}</Text>
            )}
          </TouchableOpacity>
        </View>
      );
    }
  };

  // Renderizar fila de tabla
  const renderFilaTabla = (item: AnalisisGlobal, index: number) => {
    if (hojaActiva === 'identificacion') {
      return (
        <View key={item.id || index} style={[styles.tablaFila, index % 2 === 0 ? styles.filaPar : styles.filaImpar]}>
          <View style={[styles.columnaCelda, styles.colUnidad]}>
            <Text style={styles.celdaText} numberOfLines={2}>{item.unidadDeNegocio || 'N/A'}</Text>
          </View>
          <View style={[styles.columnaCelda, styles.colPlanta]}>
            <Text style={styles.celdaText} numberOfLines={2}>{item.planta || 'N/A'}</Text>
          </View>
          <View style={[styles.columnaCelda, styles.colTurno]}>
            <Text style={styles.celdaText} numberOfLines={2}>{item.turno || 'N/A'}</Text>
          </View>
          <View style={[styles.columnaCelda, styles.colArea]}>
            <Text style={styles.celdaText} numberOfLines={2}>{item.area || 'N/A'}</Text>
          </View>
          <View style={[styles.columnaCelda, styles.colPuesto]}>
            <Text style={styles.celdaText} numberOfLines={2}>{item.puesto || 'N/A'}</Text>
          </View>
          <View style={[styles.columnaCelda, styles.colPregunta1]}>
            <Text style={styles.celdaText} numberOfLines={2}>{item.pregunta1 || 'N/A'}</Text>
          </View>
          <View style={[styles.columnaCelda, styles.colPregunta2]}>
            <Text style={styles.celdaText} numberOfLines={2}>{item.pregunta2 || 'N/A'}</Text>
          </View>
          <View style={[styles.columnaCelda, styles.colPregunta3]}>
            <Text style={styles.celdaText} numberOfLines={2}>{item.pregunta3 || 'N/A'}</Text>
          </View>
          <View style={[styles.columnaCelda, styles.colPregunta4]}>
            <Text style={styles.celdaText} numberOfLines={2}>{item.pregunta4 || 'N/A'}</Text>
          </View>
          <View style={[styles.columnaCelda, styles.colPregunta5]}>
            <Text style={styles.celdaText} numberOfLines={2}>{item.pregunta5 || 'N/A'}</Text>
          </View>
          <View style={[styles.columnaCelda, styles.colPregunta6]}>
            <Text style={styles.celdaText} numberOfLines={2}>{item.pregunta6 || 'N/A'}</Text>
          </View>
          <View style={[styles.columnaCelda, styles.colPregunta7]}>
            <Text style={styles.celdaText} numberOfLines={2}>{item.pregunta7 || 'N/A'}</Text>
          </View>
          <View style={[styles.columnaCelda, styles.colRequiere]}>
            <View style={[
              styles.requiereAnalisisBadge,
              { backgroundColor: item.requiereAnalisis === 'Sí' ? '#f44336' : '#4caf50' }
            ]}>
              <Text style={styles.requiereAnalisisText}>
                {item.requiereAnalisis || 'N/A'}
              </Text>
            </View>
          </View>
          <View style={[styles.columnaCelda, styles.colFlujo]}>
            <Text style={styles.celdaText} numberOfLines={2}>{item.flujo || 'N/A'}</Text>
          </View>
          <View style={[styles.columnaCelda, styles.colFecha]}>
            <Text style={styles.celdaText}>{formatearFecha(item.fechaHora)}</Text>
          </View>
          <View style={[styles.columnaCelda, styles.colHora]}>
            <Text style={styles.celdaText}>{formatearHora(item.fechaHora)}</Text>
          </View>
        </View>
      );
    } else {
      return (
        <View key={item.id || index} style={[styles.tablaFila, index % 2 === 0 ? styles.filaPar : styles.filaImpar]}>
          <View style={[styles.columnaCelda, styles.colUnidad]}>
            <Text style={styles.celdaText} numberOfLines={2}>{item.unidadDeNegocio || 'N/A'}</Text>
          </View>
          <View style={[styles.columnaCelda, styles.colPlanta]}>
            <Text style={styles.celdaText} numberOfLines={2}>{item.planta || 'N/A'}</Text>
          </View>
          <View style={[styles.columnaCelda, styles.colTurno]}>
            <Text style={styles.celdaText} numberOfLines={2}>{item.turno || 'N/A'}</Text>
          </View>
          <View style={[styles.columnaCelda, styles.colArea]}>
            <Text style={styles.celdaText} numberOfLines={2}>{item.area || 'N/A'}</Text>
          </View>
          <View style={[styles.columnaCelda, styles.colPuesto]}>
            <Text style={styles.celdaText} numberOfLines={2}>{item.puesto || 'N/A'}</Text>
          </View>
          <View style={[styles.columnaCelda, styles.colPonderacion1]}>
            <Text style={styles.celdaText} numberOfLines={2}>{item.ponderacion1 || 'N/A'}</Text>
          </View>
          <View style={[styles.columnaCelda, styles.colPonderacion2]}>
            <Text style={styles.celdaText} numberOfLines={2}>{item.ponderacion2 || 'N/A'}</Text>
          </View>
          <View style={[styles.columnaCelda, styles.colPonderacion3]}>
            <Text style={styles.celdaText} numberOfLines={2}>{item.ponderacion3 || 'N/A'}</Text>
          </View>
          <View style={[styles.columnaCelda, styles.colPonderacion4]}>
            <Text style={styles.celdaText} numberOfLines={2}>{item.ponderacion4 || 'N/A'}</Text>
          </View>
          <View style={[styles.columnaCelda, styles.colPonderacion5]}>
            <Text style={styles.celdaText} numberOfLines={2}>{item.ponderacion5 || 'N/A'}</Text>
          </View>
          <View style={[styles.columnaCelda, styles.colPonderacion6]}>
            <Text style={styles.celdaText} numberOfLines={2}>{item.ponderacion6 || 'N/A'}</Text>
          </View>
          <View style={[styles.columnaCelda, styles.colPonderacion7]}>
            <Text style={styles.celdaText} numberOfLines={2}>{item.ponderacion7 || 'N/A'}</Text>
          </View>
          <View style={[styles.columnaCelda, styles.colPuntaje]}>
            <Text style={styles.celdaText} numberOfLines={2}>{item.puntaje || 'N/A'}</Text>
          </View>
          <View style={[styles.columnaCelda, styles.colNivel]}>
            <View style={[
              styles.nivelRiesgo,
              { backgroundColor: getColorNivel(item.nivel) }
            ]}>
              <Text style={styles.nivelRiesgoTexto}>{item.nivel || 'N/A'}</Text>
            </View>
          </View>
          <View style={[styles.columnaCelda, styles.colFecha]}>
            <Text style={styles.celdaText}>{formatearFecha(item.fechaHora)}</Text>
          </View>
        </View>
      );
    }
  };



  return (
    <AnimatedBackground>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.container}>
          {/* Barra superior */}
          <LinearGradient
            colors={['#00BCD4', '#00796B']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.topBar}
          >
            <View style={styles.topBarContent}>
              <Image
                source={require('@/assets/images/logo-ehs.png')}
                style={styles.logoImage}
                resizeMode="cover"
              />
              <View style={styles.topBarInfo}>
                <Text style={styles.topBarTitle}>Análisis Globales</Text>
                <Text style={styles.topBarSubtitle}>
                  Vista tipo Excel con dos hojas
                </Text>
              </View>
            </View>
          </LinearGradient>

          {/* Barra de búsqueda - siempre visible */}
          <View style={styles.busquedaContainer}>
            <View style={styles.busquedaWrapper}>
              <Text style={styles.busquedaIcon}>🔍</Text>
              <TextInput
                style={styles.busquedaInput}
                placeholder="Buscar por unidad, planta, turno, área o puesto..."
                value={busqueda}
                onChangeText={setBusqueda}
                placeholderTextColor="#999"
              />
              {busqueda ? (
                <TouchableOpacity
                  style={styles.busquedaClearButton}
                  onPress={() => setBusqueda('')}
                >
                  <Text style={styles.busquedaClearText}>✕</Text>
                </TouchableOpacity>
              ) : null}
            </View>
          </View>

          {ultimoAnalisis && (
            <View style={styles.resumenContainer}>
              <View style={styles.resumenHeader}>
                <Text style={styles.resumenTitulo}>Resumen del análisis</Text>
                <View
                  style={[
                    styles.resumenNivelBadge,
                    { backgroundColor: getColorNivel(ultimoAnalisis.nivel) },
                  ]}
                >
                  <Text style={styles.resumenNivelTexto}>{ultimoAnalisis.nivel || 'N/A'}</Text>
                </View>
              </View>

              <View style={styles.resumenInfoGrid}>
                <View style={styles.resumenInfoItem}>
                  <Text style={styles.resumenInfoLabel}>Unidad</Text>
                  <Text style={styles.resumenInfoValue}>{ultimoAnalisis.unidadDeNegocio || 'N/A'}</Text>
                </View>
                <View style={styles.resumenInfoItem}>
                  <Text style={styles.resumenInfoLabel}>Planta</Text>
                  <Text style={styles.resumenInfoValue}>{ultimoAnalisis.planta || 'N/A'}</Text>
                </View>
                <View style={styles.resumenInfoItem}>
                  <Text style={styles.resumenInfoLabel}>Turno</Text>
                  <Text style={styles.resumenInfoValue}>{ultimoAnalisis.turno || 'N/A'}</Text>
                </View>
                <View style={styles.resumenInfoItem}>
                  <Text style={styles.resumenInfoLabel}>Área</Text>
                  <Text style={styles.resumenInfoValue}>{ultimoAnalisis.area || 'N/A'}</Text>
                </View>
                <View style={styles.resumenInfoItem}>
                  <Text style={styles.resumenInfoLabel}>Puesto</Text>
                  <Text style={styles.resumenInfoValue}>{ultimoAnalisis.puesto || 'N/A'}</Text>
                </View>
                <View style={styles.resumenInfoItem}>
                  <Text style={styles.resumenInfoLabel}>Flujo</Text>
                  <Text style={styles.resumenInfoValue}>{ultimoAnalisis.flujo || 'N/A'}</Text>
                </View>
                <View style={styles.resumenInfoItem}>
                  <Text style={styles.resumenInfoLabel}>Puntaje</Text>
                  <Text style={styles.resumenInfoValue}>{ultimoAnalisis.puntaje || 'N/A'}</Text>
                </View>
                <View style={styles.resumenInfoItem}>
                  <Text style={styles.resumenInfoLabel}>Fecha</Text>
                  <Text style={styles.resumenInfoValue}>
                    {formatearFecha(ultimoAnalisis.fechaHora || ultimoAnalisis.timestamp)}
                  </Text>
                </View>
                <View style={styles.resumenInfoItem}>
                  <Text style={styles.resumenInfoLabel}>Hora</Text>
                  <Text style={styles.resumenInfoValue}>
                    {formatearHora(ultimoAnalisis.fechaHora || ultimoAnalisis.timestamp)}
                  </Text>
                </View>
              </View>

              <View style={styles.resumenBotones}>
                <TouchableOpacity
                  style={[styles.resumenBoton, styles.resumenBotonInicio]}
                  onPress={handleInicio}
                  activeOpacity={0.85}
                >
                  <Text style={styles.resumenBotonIcon}>🏠</Text>
                  <Text style={styles.resumenBotonTexto}>Inicio</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={[styles.resumenBoton, styles.resumenBotonExportar]}
                  onPress={exportarAnalisisExcel}
                  activeOpacity={0.85}
                >
                  <Text style={styles.resumenBotonIcon}>📊</Text>
                  <Text style={styles.resumenBotonTexto}>Exportar a Excel</Text>
                </TouchableOpacity>
              </View>
            </View>
          )}

          {!tablaPantallaCompleta ? (
            <>
              {/* Pestañas de navegación */}
              <View style={styles.tabsContainer}>
                <TouchableOpacity
                  style={[styles.tab, hojaActiva === 'identificacion' && styles.tabActiva]}
                  onPress={() => setHojaActiva('identificacion')}
                >
                  <Text style={[styles.tabText, hojaActiva === 'identificacion' && styles.tabTextActiva]}>
                    📋 Identificación
                  </Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[styles.tab, hojaActiva === 'matriz' && styles.tabActiva]}
                  onPress={() => setHojaActiva('matriz')}
                >
                  <Text style={[styles.tabText, hojaActiva === 'matriz' && styles.tabTextActiva]}>
                    🎯 Matriz de Riesgo
                  </Text>
                </TouchableOpacity>
              </View>

              {/* Estadísticas */}
              <View style={styles.statsContainer}>
                <View style={styles.statBox}>
                  <Text style={styles.statNumber}>{datosFiltrados.length}</Text>
                  <Text style={styles.statLabel}>Total Registros</Text>
                </View>
                <View style={styles.statBox}>
                  <Text style={styles.statNumber}>
                    {datosFiltrados.filter(a => a.requiereAnalisis === 'Sí').length}
                  </Text>
                  <Text style={styles.statLabel}>Requieren Análisis</Text>
                </View>
                <View style={styles.statBox}>
                  <Text style={styles.statNumber}>
                    {datosFiltrados.filter(a => a.requiereAnalisis === 'No').length}
                  </Text>
                  <Text style={styles.statLabel}>No Requieren</Text>
                </View>
              </View>

              {/* Botones Ver Análisis */}
              <View style={styles.botonVerAnalisisContainer}>
                <TouchableOpacity
                  style={styles.botonVerAnalisis}
                  onPress={togglePantallaCompleta}
                  activeOpacity={0.8}
                >
                  <Text style={styles.botonVerAnalisisIcon}>📊</Text>
                  <Text style={styles.botonVerAnalisisTexto}>Ver Análisis</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={styles.botonVerAnalisisGlobales}
                  onPress={abrirAnalisisGlobales}
                  activeOpacity={0.8}
                >
                  <Text style={styles.botonVerAnalisisIcon}>📈</Text>
                  <Text style={styles.botonVerAnalisisTexto}>Ver Análisis Globales</Text>
                </TouchableOpacity>
              </View>
            </>
          ) : (
            <>
              {/* Barra superior en modo pantalla completa */}
              <View style={styles.pantallaCompletaHeader}>
                <View style={styles.pantallaCompletaTabs}>
                  <TouchableOpacity
                    style={[styles.tabPantallaCompleta, hojaActiva === 'identificacion' && styles.tabPantallaCompletaActiva]}
                    onPress={() => setHojaActiva('identificacion')}
                  >
                    <Text style={[styles.tabPantallaCompletaText, hojaActiva === 'identificacion' && styles.tabPantallaCompletaTextActiva]}>
                      📋 Identificación
                    </Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={[styles.tabPantallaCompleta, hojaActiva === 'matriz' && styles.tabPantallaCompletaActiva]}
                    onPress={() => setHojaActiva('matriz')}
                  >
                    <Text style={[styles.tabPantallaCompletaText, hojaActiva === 'matriz' && styles.tabPantallaCompletaTextActiva]}>
                      🎯 Matriz de Riesgo
                    </Text>
                  </TouchableOpacity>
                </View>

                <TouchableOpacity
                  style={styles.botonCerrarPantallaCompleta}
                  onPress={togglePantallaCompleta}
                  activeOpacity={0.8}
                >
                  <Text style={styles.botonCerrarPantallaCompletaTexto}>✕</Text>
                </TouchableOpacity>
              </View>

              {/* Tabla en pantalla completa */}
              <View style={styles.tablaPantallaCompletaContainer}>
                {loading ? (
                  <View style={styles.loadingContainer}>
                    <Text style={styles.loadingText}>Cargando análisis...</Text>
                  </View>
                ) : datosFiltrados.length === 0 ? (
                  <View style={styles.emptyContainer}>
                    <Text style={styles.emptyTitle}>No hay datos disponibles</Text>
                    <Text style={styles.emptySubtitle}>
                      {busqueda ? 'No se encontraron resultados para tu búsqueda' : 'Los análisis aparecerán aquí una vez que se realicen'}
                    </Text>
                  </View>
                ) : (
                  <ScrollView
                    horizontal
                    style={styles.tablaScrollHorizontal}
                    showsHorizontalScrollIndicator={true}
                  >
                    <View style={styles.tablaWrapper}>
                      {renderEncabezadoTabla()}
                      <ScrollView
                        style={styles.tablaScrollVertical}
                        showsVerticalScrollIndicator={true}
                      >
                        {datosFiltrados.map((item, index) => renderFilaTabla(item, index))}
                      </ScrollView>
                    </View>
                  </ScrollView>
                )}
              </View>
            </>
          )}

          <View style={styles.estadoActualizacionContainer}>
            <Text style={styles.estadoActualizacionTexto}>
              Última actualización:{' '}
              {ultimaActualizacion
                ? ultimaActualizacion.toLocaleTimeString('es-MX', { hour: '2-digit', minute: '2-digit' })
                : 'Sin datos aún'}
            </Text>
          </View>
        </View>
      </ScrollView>
    </AnimatedBackground>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'transparent',
    paddingBottom: 30,
  },
  scrollContent: {
    paddingBottom: 40,
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
    width: 40,
    height: 40,
    borderRadius: 20,
    marginRight: 15,
  },
  topBarInfo: {
    flex: 1,
  },
  topBarTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: AppColors.textWhite,
    marginBottom: 4,
  },
  topBarSubtitle: {
    fontSize: 14,
    color: AppColors.textWhite,
    opacity: 0.9,
  },
  // Pestañas
  tabsContainer: {
    flexDirection: 'row',
    backgroundColor: 'rgba(255, 255, 255, 0.95)',
    margin: 20,
    borderRadius: 15,
    padding: 5,
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  tab: {
    flex: 1,
    paddingVertical: 15,
    paddingHorizontal: 20,
    borderRadius: 12,
    alignItems: 'center',
  },
  tabActiva: {
    backgroundColor: AppColors.primary,
  },
  tabText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#666',
  },
  tabTextActiva: {
    color: '#fff',
  },
  // Búsqueda
  busquedaContainer: {
    marginHorizontal: 20,
    marginTop: 15,
    marginBottom: 20,
  },
  busquedaWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.95)',
    borderRadius: 12,
    paddingHorizontal: 15,
    paddingVertical: 10,
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  busquedaIcon: {
    fontSize: 20,
    marginRight: 10,
  },
  busquedaInput: {
    flex: 1,
    fontSize: 16,
    color: '#333',
  },
  busquedaClearButton: {
    padding: 5,
  },
  busquedaClearText: {
    fontSize: 18,
    color: '#999',
  },
  // Estadísticas
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginHorizontal: 20,
    marginBottom: 20,
  },
  statBox: {
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    borderRadius: 15,
    padding: 15,
    alignItems: 'center',
    flex: 1,
    marginHorizontal: 5,
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  statNumber: {
    fontSize: 24,
    fontWeight: 'bold',
    color: AppColors.primary,
    marginBottom: 5,
  },
  statLabel: {
    fontSize: 11,
    color: '#666',
    textAlign: 'center',
    fontWeight: '500',
  },
  resumenContainer: {
    marginHorizontal: 20,
    marginBottom: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.95)',
    borderRadius: 18,
    padding: 20,
    elevation: 6,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.12,
    shadowRadius: 8,
  },
  resumenHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  resumenTitulo: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#003b4c',
  },
  resumenNivelBadge: {
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: 20,
  },
  resumenNivelTexto: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 14,
  },
  resumenInfoGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: 20,
  },
  resumenInfoItem: {
    width: '50%',
    paddingVertical: 6,
  },
  resumenInfoLabel: {
    fontSize: 12,
    color: '#607d8b',
    textTransform: 'uppercase',
    fontWeight: '600',
  },
  resumenInfoValue: {
    fontSize: 16,
    color: '#263238',
    fontWeight: '600',
  },
  resumenBotones: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    flexWrap: 'wrap',
  },
  resumenBoton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 14,
    borderRadius: 14,
    elevation: 3,
    marginHorizontal: 6,
    marginVertical: 6,
    minWidth: '45%',
  },
  resumenBotonInicio: {
    backgroundColor: '#007bff',
  },
  resumenBotonExportar: {
    backgroundColor: '#43a047',
  },
  resumenBotonIcon: {
    fontSize: 18,
    marginRight: 8,
    color: '#fff',
  },
  resumenBotonTexto: {
    fontSize: 15,
    fontWeight: 'bold',
    color: '#fff',
  },
  // Botones Ver Análisis
  botonVerAnalisisContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
    gap: 15,
    paddingHorizontal: 20,
  },
  botonVerAnalisis: {
    backgroundColor: '#2196f3',
    paddingVertical: 18,
    paddingHorizontal: 30,
    borderRadius: 20,
    alignItems: 'center',
    flexDirection: 'row',
    elevation: 6,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.2,
    shadowRadius: 6,
    flex: 1,
    maxWidth: 200,
  },
  botonVerAnalisisGlobales: {
    backgroundColor: '#4caf50',
    paddingVertical: 18,
    paddingHorizontal: 30,
    borderRadius: 20,
    alignItems: 'center',
    flexDirection: 'row',
    elevation: 6,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.2,
    shadowRadius: 6,
    flex: 1,
    maxWidth: 200,
  },
  botonVerAnalisisIcon: {
    fontSize: 24,
    marginRight: 12,
  },
  botonVerAnalisisTexto: {
    fontSize: 16,
    color: '#fff',
    fontWeight: 'bold',
  },

  // Pantalla Completa
  pantallaCompletaHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: 'rgba(255, 255, 255, 0.95)',
    margin: 20,
    borderRadius: 15,
    padding: 15,
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  pantallaCompletaTabs: {
    flexDirection: 'row',
    flex: 1,
  },
  tabPantallaCompleta: {
    flex: 1,
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 10,
    alignItems: 'center',
    marginRight: 10,
  },
  tabPantallaCompletaActiva: {
    backgroundColor: AppColors.primary,
  },
  tabPantallaCompletaText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#666',
  },
  tabPantallaCompletaTextActiva: {
    color: '#fff',
  },
  botonCerrarPantallaCompleta: {
    backgroundColor: '#f44336',
    borderRadius: 12,
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 4,
  },
  botonCerrarPantallaCompletaTexto: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 18,
  },
  tablaPantallaCompletaContainer: {
    flex: 1,
    marginHorizontal: 20,
    marginBottom: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.95)',
    borderRadius: 15,
    elevation: 6,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.1,
    shadowRadius: 6,
    overflow: 'hidden',
  },
  // Tabla
  tablaContainer: {
    flex: 1,
    marginHorizontal: 20,
    marginBottom: 100,
    backgroundColor: 'rgba(255, 255, 255, 0.95)',
    borderRadius: 15,
    elevation: 6,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.1,
    shadowRadius: 6,
    overflow: 'hidden',
  },
  tablaScrollHorizontal: {
    flex: 1,
  },
  tablaWrapper: {
    minWidth: 1400, // Ancho mínimo para todas las columnas
  },
  tablaHeader: {
    flexDirection: 'row',
    backgroundColor: AppColors.primary,
    borderBottomWidth: 2,
    borderBottomColor: '#fff',
  },

  columnaHeader: {
    paddingVertical: 8,
    paddingHorizontal: 8,
    justifyContent: 'center',
    alignItems: 'center',
    borderRightWidth: 1,
    borderRightColor: 'rgba(255, 255, 255, 0.3)',
    minHeight: 40,
  },

  headerText: {
    color: '#fff',
    fontSize: 11,
    fontWeight: 'bold',
    textAlign: 'center',
    flexWrap: 'wrap',
  },
  ordenIcon: {
    color: '#fff',
    fontSize: 10,
    marginTop: 2,
  },
  tablaScrollVertical: {
    flex: 1,
  },
  tablaFila: {
    flexDirection: 'row',
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(0, 0, 0, 0.1)',
    minHeight: 35,
  },
  filaPar: {
    backgroundColor: 'rgba(255, 255, 255, 0.8)',
  },
  filaImpar: {
    backgroundColor: 'rgba(240, 240, 240, 0.8)',
  },
  columnaCelda: {
    paddingVertical: 4,
    paddingHorizontal: 8,
    justifyContent: 'center',
    alignItems: 'center',
    borderRightWidth: 1,
    borderRightColor: 'rgba(0, 0, 0, 0.1)',
    minHeight: 35,
  },
  celdaText: {
    fontSize: 10,
    color: '#333',
    textAlign: 'center',
    fontWeight: '500',
  },
  // Columnas de Identificación
  colUnidad: { width: 120 },
  colPlanta: { width: 100 },
  colTurno: { width: 80 },
  colArea: { width: 100 },
  colPuesto: { width: 100 },
  colPregunta1: { width: 100 },
  colPregunta2: { width: 100 },
  colPregunta3: { width: 100 },
  colPregunta4: { width: 100 },
  colPregunta5: { width: 100 },
  colPregunta6: { width: 100 },
  colPregunta7: { width: 100 },
  colRequiere: { width: 100 },
  colFlujo: { width: 100 },
  colFecha: { width: 100 },
  colHora: { width: 80 },
  // Columnas de Matriz de Riesgo
  colPonderacion1: { width: 100 },
  colPonderacion2: { width: 100 },
  colPonderacion3: { width: 100 },
  colPonderacion4: { width: 100 },
  colPonderacion5: { width: 100 },
  colPonderacion6: { width: 100 },
  colPonderacion7: { width: 100 },
  colPuntaje: { width: 80 },
  colNivel: { width: 80 },
  // Elementos especiales
  requiereAnalisisBadge: {
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 6,
    minWidth: 50,
  },
  requiereAnalisisText: {
    fontSize: 9,
    fontWeight: 'bold',
    color: '#fff',
    textAlign: 'center',
  },
  nivelRiesgo: {
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 6,
    minWidth: 50,
  },
  nivelRiesgoTexto: {
    fontSize: 9,
    fontWeight: 'bold',
    color: '#fff',
    textAlign: 'center',
  },
  // Loading y Empty
  loadingContainer: {
    alignItems: 'center',
    padding: 40,
  },
  loadingText: {
    fontSize: 16,
    color: '#666',
  },
  emptyContainer: {
    alignItems: 'center',
    padding: 40,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#666',
    marginBottom: 10,
  },
  emptySubtitle: {
    fontSize: 14,
    color: '#999',
    textAlign: 'center',
  },
  // Botones
  botonesContainer: {
    backgroundColor: 'rgba(255, 255, 255, 0.95)',
    marginHorizontal: 20,
    marginTop: 10,
    marginBottom: 10,
    paddingVertical: 16,
    borderRadius: 16,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 12,
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  botonIcon: {
    fontSize: 20,
    marginRight: 8,
  },
  botonInicio: {
    backgroundColor: '#007bff',
    paddingVertical: 15,
    paddingHorizontal: 20,
    borderRadius: 12,
    alignItems: 'center',
    flexDirection: 'row',
    elevation: 4,
  },
  botonInicioTexto: {
    fontSize: 14,
    color: '#fff',
    fontWeight: 'bold',
  },
  botonNuevo: {
    backgroundColor: '#28a745',
    paddingVertical: 15,
    paddingHorizontal: 20,
    borderRadius: 12,
    alignItems: 'center',
    flexDirection: 'row',
    elevation: 4,
  },
  botonNuevoTexto: {
    fontSize: 14,
    color: '#fff',
    fontWeight: 'bold',
  },
  estadoActualizacionContainer: {
    marginTop: 12,
    marginBottom: 30,
    alignItems: 'center',
  },
  estadoActualizacionTexto: {
    fontSize: 14,
    color: '#fff',
  },
});

