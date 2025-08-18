// app/(tabs)/analisis.tsx
import { StyleSheet, ScrollView, TouchableOpacity, View, Image, Alert, RefreshControl, TextInput } from 'react-native';
import { Text } from '@/components/Themed';
import { useState, useEffect } from 'react';
import { useRouter } from 'expo-router';
import { AppColors } from '@/constants/Colors';
import AnimatedBackground from '@/components/AnimatedBackground';
import { LinearGradient } from 'expo-linear-gradient';
import { FirestoreService } from '@/utils/firestoreService';

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
}

type HojaActiva = 'identificacion' | 'matriz';

export default function AnalisisScreen() {
  const router = useRouter();
  const [analisis, setAnalisis] = useState<AnalisisGlobal[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [hojaActiva, setHojaActiva] = useState<HojaActiva>('identificacion');
  const [busqueda, setBusqueda] = useState('');
  const [ordenamiento, setOrdenamiento] = useState<{ columna: string; ascendente: boolean }>({ columna: 'fechaHora', ascendente: false });
  const [tablaPantallaCompleta, setTablaPantallaCompleta] = useState(false);

  // Cargar análisis globales
  const cargarAnalisisGlobales = async () => {
    try {
      setLoading(true);
      console.log('📥 Cargando análisis globales...');
      
      // Obtener análisis de la nueva colección global
      const analisisGlobales = await FirestoreService.getAnalisisGlobales();
      
      // Log de depuración para ver los datos
      console.log('🔍 Datos recibidos del primer análisis:', analisisGlobales[0]);
      console.log('🔍 Campos de preguntas del primer análisis:', {
        pregunta1: analisisGlobales[0]?.pregunta1,
        pregunta2: analisisGlobales[0]?.pregunta2,
        pregunta3: analisisGlobales[0]?.pregunta3,
        pregunta4: analisisGlobales[0]?.pregunta4,
        pregunta5: analisisGlobales[0]?.pregunta5,
        pregunta6: analisisGlobales[0]?.pregunta6,
        pregunta7: analisisGlobales[0]?.pregunta7,
        pregunta8: analisisGlobales[0]?.pregunta8,
        pregunta9: analisisGlobales[0]?.pregunta9,
        flujo: analisisGlobales[0]?.flujo,
        requiereAnalisis: analisisGlobales[0]?.requiereAnalisis
      });
      
      setAnalisis(analisisGlobales);
      
      console.log(`✅ Cargados ${analisisGlobales.length} análisis globales`);
    } catch (error) {
      console.error('❌ Error al cargar análisis globales:', error);
      Alert.alert('Error', 'No se pudieron cargar los análisis');
    } finally {
      setLoading(false);
    }
  };

  // Refrescar datos
  const onRefresh = async () => {
    setRefreshing(true);
    await cargarAnalisisGlobales();
    setRefreshing(false);
  };

  // Cargar datos al montar
  useEffect(() => {
    cargarAnalisisGlobales();
  }, []);

  // Alternar modo pantalla completa
  const togglePantallaCompleta = () => {
    setTablaPantallaCompleta(!tablaPantallaCompleta);
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
      const aValue = a[ordenamiento.columna as keyof AnalisisGlobal];
      const bValue = b[ordenamiento.columna as keyof AnalisisGlobal];
      
      if (ordenamiento.columna === 'fechaHora' || ordenamiento.columna === 'timestamp') {
        const aDate = new Date(aValue || '');
        const bDate = new Date(bValue || '');
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
            <Text style={styles.headerText}>Pregunta 1</Text>
          </View>
          <View style={[styles.columnaHeader, styles.colPregunta2]}>
            <Text style={styles.headerText}>Pregunta 2</Text>
          </View>
          <View style={[styles.columnaHeader, styles.colPregunta3]}>
            <Text style={styles.headerText}>Pregunta 3</Text>
          </View>
          <View style={[styles.columnaHeader, styles.colPregunta4]}>
            <Text style={styles.headerText}>Pregunta 4</Text>
          </View>
          <View style={[styles.columnaHeader, styles.colPregunta5]}>
            <Text style={styles.headerText}>Pregunta 5</Text>
          </View>
          <View style={[styles.columnaHeader, styles.colPregunta6]}>
            <Text style={styles.headerText}>Pregunta 6</Text>
          </View>
          <View style={[styles.columnaHeader, styles.colPregunta7]}>
            <Text style={styles.headerText}>Pregunta 7</Text>
          </View>
          <View style={[styles.columnaHeader, styles.colPregunta8]}>
            <Text style={styles.headerText}>Pregunta 8</Text>
          </View>
          <View style={[styles.columnaHeader, styles.colPregunta9]}>
            <Text style={styles.headerText}>Pregunta 9</Text>
          </View>
          <View style={[styles.columnaHeader, styles.colRequiere]}>
            <Text style={styles.headerText}>Requiere Análisis</Text>
          </View>
          <View style={[styles.columnaHeader, styles.colFlujo]}>
            <Text style={styles.headerText}>Flujo</Text>
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
          <View style={[styles.columnaCelda, styles.colPregunta8]}>
            <Text style={styles.celdaText} numberOfLines={2}>{item.pregunta8 || 'N/A'}</Text>
          </View>
          <View style={[styles.columnaCelda, styles.colPregunta9]}>
            <Text style={styles.celdaText} numberOfLines={2}>{item.pregunta9 || 'N/A'}</Text>
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

            {/* Botón Ver Análisis */}
            <View style={styles.botonVerAnalisisContainer}>
              <TouchableOpacity 
                style={styles.botonVerAnalisis} 
                onPress={togglePantallaCompleta}
                activeOpacity={0.8}
              >
                <Text style={styles.botonVerAnalisisIcon}>📊</Text>
                <Text style={styles.botonVerAnalisisTexto}>Ver Análisis</Text>
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
                      refreshControl={
                        <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
                      }
                    >
                      {datosFiltrados.map((item, index) => renderFilaTabla(item, index))}
                    </ScrollView>
                  </View>
                </ScrollView>
              )}
            </View>
          </>
        )}

        {/* Botones de acción */}
        <View style={styles.botonesContainer}>
          <TouchableOpacity style={styles.botonInicio} onPress={handleInicio} activeOpacity={0.8}>
            <Text style={styles.botonIcon}>🏠</Text>
            <Text style={styles.botonInicioTexto}>Inicio</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.botonActualizar} onPress={onRefresh} activeOpacity={0.8}>
            <Text style={styles.botonIcon}>🔄</Text>
            <Text style={styles.botonActualizarTexto}>Actualizar</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.botonNuevo} onPress={handleResultadosFinales} activeOpacity={0.8}>
            <Text style={styles.botonIcon}>📋</Text>
            <Text style={styles.botonNuevoTexto}>Resultados Finales</Text>
          </TouchableOpacity>
        </View>
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
  // Botón Ver Análisis
  botonVerAnalisisContainer: {
    alignItems: 'center',
    marginBottom: 20,
  },
  botonVerAnalisis: {
    backgroundColor: '#2196f3',
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
  botonVerAnalisisIcon: {
    fontSize: 24,
    marginRight: 12,
  },
  botonVerAnalisisTexto: {
    fontSize: 18,
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
  colPregunta8: { width: 100 },
  colPregunta9: { width: 100 },
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
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: 'rgba(255, 255, 255, 0.95)',
    padding: 20,
    paddingBottom: 30,
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    elevation: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -2 },
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
  botonActualizar: {
    backgroundColor: '#6c757d',
    paddingVertical: 15,
    paddingHorizontal: 20,
    borderRadius: 12,
    alignItems: 'center',
    flexDirection: 'row',
    elevation: 4,
  },
  botonActualizarTexto: {
    fontSize: 14,
    color: '#fff',
    fontWeight: 'bold',
  },
});
