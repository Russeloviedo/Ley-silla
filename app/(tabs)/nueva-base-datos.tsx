import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, TextInput, Alert, StatusBar, Modal } from 'react-native';
import { router } from 'expo-router';
import { FirestoreService } from '@/utils/firestoreService';
import * as XLSX from 'xlsx';
import { AppColors } from '@/constants/Colors';
import AnimatedBackground from '@/components/AnimatedBackground';
import { LinearGradient } from 'expo-linear-gradient';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { safe, enforceSheetName, clearAnalysisDataOnly } from '@/utils/storageUtils';

export default function NuevaBaseDatosScreen() {
  const [datosNuevaEstructura, setDatosNuevaEstructura] = useState<{
    identificacion: any[];
    matrizRiesgo: any[];
  }>({ identificacion: [], matrizRiesgo: [] });
  const [datosFiltrados, setDatosFiltrados] = useState<any[]>([]);
  const [cargando, setCargando] = useState(true);
  const [busqueda, setBusqueda] = useState('');
  const [ordenarPor, setOrdenarPor] = useState<string>('timestamp');
  const [ordenAscendente, setOrdenAscendente] = useState(false);
  const [tabActiva, setTabActiva] = useState<'identificacion' | 'matriz-riesgo'>('identificacion');
  
  // Estado para el modal de contraseña
  const [modalContrasenaVisible, setModalContrasenaVisible] = useState(false);
  const [contrasena, setContrasena] = useState('');
  const [selectedUnidadDeNegocio, setSelectedUnidadDeNegocio] = useState('');

  // Función para obtener el nombre descriptivo del business unit
  const getBusinessUnitName = (id: string) => {
    const businessUnits: { [key: string]: string } = {
      'FX': 'FX',
      'Irrigación': 'Irrigación',
      'HCM': 'HCM',
      'DD': 'DD',
      'SOPORTE': 'Soporte'
    };
    return businessUnits[id] || id;
  };

  // Cargar el business unit seleccionado al montar el componente
  useEffect(() => {
    const cargarBusinessUnit = async () => {
      try {
        const bu = await AsyncStorage.getItem('selectedBusinessUnit');
        if (bu) {
          setSelectedUnidadDeNegocio(bu);
          console.log('✅ Unidad de Negocio cargada:', bu);
        }
      } catch (error) {
        console.error('❌ Error al cargar Business Unit:', error);
      }
    };
    
    cargarBusinessUnit();
  }, []);

  useEffect(() => {
    cargarDatosNuevaEstructura();
  }, []);

  useEffect(() => {
    filtrarYOrdenarDatos();
  }, [datosNuevaEstructura, busqueda, ordenarPor, ordenAscendente, tabActiva]);

  const cargarDatosNuevaEstructura = async () => {
    try {
      setCargando(true);
      
      console.log('🔄 Iniciando carga de datos de nueva estructura...');
      
      // Obtener solo datos con la nueva estructura de 5 niveles
      const [identificacion, matrizRiesgo] = await Promise.all([
        FirestoreService.getIdentificacionDataCombinada(1000),
        FirestoreService.getMatrizRiesgoDataCombinada(1000)
      ]);
      
      console.log(`📥 Datos brutos recibidos:`);
      console.log(`   - Identificación: ${identificacion.length} registros`);
      console.log(`   - Matriz de Riesgo: ${matrizRiesgo.length} registros`);
      
      // Filtrar solo los datos que tienen la nueva estructura (businessUnit o unidadDeNegocio)
      const datosNuevos = identificacion.filter(item => 
        item.businessUnit || item.unidadDeNegocio || item.planta || item.area
      );
      
      const matrizRiesgoNuevos = matrizRiesgo.filter(item => 
        item.businessUnit || item.unidadDeNegocio || item.planta || item.area
      );
      
      console.log(`🔍 Después del filtro de nueva estructura:`);
      console.log(`   - Identificación: ${datosNuevos.length} registros`);
      console.log(`   - Matriz de Riesgo: ${matrizRiesgoNuevos.length} registros`);
      
      console.log(`📋 Muestra de datos de identificación:`, datosNuevos.slice(0, 3));
      console.log(`📋 Muestra de datos de matriz de riesgo:`, matrizRiesgoNuevos.slice(0, 3));
      
      setDatosNuevaEstructura({
        identificacion: datosNuevos,
        matrizRiesgo: matrizRiesgoNuevos
      });
      
      console.log(`✅ Cargados ${datosNuevos.length} registros de identificación y ${matrizRiesgoNuevos.length} de matriz de riesgo con nueva estructura`);
    } catch (error) {
      console.error('❌ Error al cargar datos de nueva estructura:', error);
      Alert.alert('Error', 'No se pudieron cargar los datos de la nueva estructura');
    } finally {
      setCargando(false);
    }
  };

  const filtrarYOrdenarDatos = () => {
    const datosActuales = tabActiva === 'identificacion' 
      ? datosNuevaEstructura.identificacion 
      : datosNuevaEstructura.matrizRiesgo;
    
    console.log(`🔍 Filtrando datos para pestaña: ${tabActiva}`);
    console.log(`📊 Datos totales disponibles: ${datosActuales.length}`);
    console.log(`📋 Datos originales:`, datosActuales);
    
    let resultado = [...datosActuales];

    // Filtrar por búsqueda
    if (busqueda.trim()) {
      const termino = busqueda.toLowerCase();
      resultado = resultado.filter(item => {
        return (item.businessUnit || item.unidadDeNegocio || '')?.toLowerCase().includes(termino) ||
               (item.planta || '')?.toLowerCase().includes(termino) ||
               (item.turno || '')?.toLowerCase().includes(termino) ||
               (item.area || '')?.toLowerCase().includes(termino) ||
               (item.puesto || '')?.toLowerCase().includes(termino);
      });
      console.log(`🔍 Después de filtro de búsqueda: ${resultado.length} registros`);
    }

    // Ordenar
    resultado.sort((a, b) => {
      let valorA = a[ordenarPor];
      let valorB = b[ordenarPor];

      if (typeof valorA === 'string') valorA = valorA.toLowerCase();
      if (typeof valorB === 'string') valorB = valorB.toLowerCase();

      if (valorA < valorB) return ordenAscendente ? -1 : 1;
      if (valorA > valorB) return ordenAscendente ? 1 : -1;
      return 0;
    });

    console.log(`✅ Resultado final del filtrado: ${resultado.length} registros`);
    console.log(`📋 Datos filtrados:`, resultado);
    
    setDatosFiltrados(resultado);
  };

  const cambiarOrden = (campo: string) => {
    if (ordenarPor === campo) {
      setOrdenAscendente(!ordenAscendente);
    } else {
      setOrdenarPor(campo);
      setOrdenAscendente(false);
    }
  };

  const obtenerIconoOrden = (campo: string) => {
    if (ordenarPor !== campo) return '↕️';
    return ordenAscendente ? '↑' : '↓';
  };

  const handleResultadosFinales = () => {
    router.push({ pathname: '/resultados-finales' });
  };

  const handleInicio = () => {
    console.log('🏠 Navegando a la página de inicio...');
    router.push('/');
  };

  const verificarContrasena = () => {
    console.log('🔐 Verificando contraseña:', contrasena);
    if (contrasena === '10335') {
      console.log('✅ Contraseña correcta');
      setModalContrasenaVisible(false);
      setContrasena('');
      Alert.alert(
        '🚨 Confirmación Final',
        '¿Estás COMPLETAMENTE seguro de que quieres reiniciar la base de datos?\n\nEsta acción eliminará TODOS los datos y NO se puede deshacer.',
        [
          {
            text: 'Cancelar',
            style: 'cancel',
            onPress: () => {
              console.log('❌ Reinicio cancelado por el usuario');
            }
          },
          {
            text: '🚨 REINICIAR TODO',
            style: 'destructive',
            onPress: () => {
              console.log('🚀 Usuario confirmó reinicio, ejecutando...');
              reiniciarBaseDatosCompletamente();
            },
          },
        ]
      );
    } else {
      console.log('❌ Contraseña incorrecta');
      Alert.alert('❌ Contraseña Incorrecta', 'La contraseña ingresada no es válida.');
      setContrasena('');
    }
  };

  const cancelarContrasena = () => {
    setModalContrasenaVisible(false);
    setContrasena('');
  };

  const reiniciarBaseDatosCompletamente = async () => {
    try {
      console.log('🔄 Iniciando reinicio de base de datos...');
      
      // Limpiar SOLO datos de análisis usando el nuevo sistema de namespacing
      console.log('🗑️ Limpiando datos de análisis con namespacing...');
      await clearAnalysisDataOnly();
      
      console.log('✅ Datos de análisis limpiados exitosamente');
      
      // Limpiar el estado local de la aplicación
      setDatosNuevaEstructura({ identificacion: [], matrizRiesgo: [] });
      setDatosFiltrados([]);
      setCargando(false);
      
      console.log('✅ Estado local limpiado');
      
      // Mostrar confirmación de éxito
        Alert.alert(
          '✅ Base de Datos Reiniciada',
        'Todos los datos locales han sido eliminados exitosamente.\n\nLa aplicación se recargará para aplicar los cambios.',
          [
            {
              text: 'OK',
              onPress: () => {
              console.log('🔄 Recargando aplicación...');
              // Recargar la página para aplicar los cambios
              if (typeof window !== 'undefined') {
                window.location.reload();
              } else {
                // Para React Native, recargar los datos
                cargarDatosNuevaEstructura();
              }
            }
          }
          ]
        );
      
    } catch (error) {
      console.error('❌ Error al reiniciar base de datos:', error);
      Alert.alert('❌ Error', 'No se pudo reiniciar la base de datos completamente');
    }
  };

  const exportarExcelNuevaEstructura = () => {
    if (datosNuevaEstructura.identificacion.length === 0 && datosNuevaEstructura.matrizRiesgo.length === 0) {
      Alert.alert('Sin datos', 'No hay datos de la nueva estructura para exportar');
      return;
    }

    try {
      const workbook = XLSX.utils.book_new();

      // Hoja 1: Identificación - Nueva Estructura
      if (datosNuevaEstructura.identificacion.length > 0) {
        const datosIdentificacion = datosNuevaEstructura.identificacion.map(item => ({
          'UNIDAD DE NEGOCIO': item.businessUnit || item.unidadDeNegocio || '',
          'PLANTA': item.planta || '',
          'TURNO': item.turno || '',
          'AREA': item.area || '',
          'PUESTO': item.puesto || '',
          '1ERA PREGUNTA INICIAL': item.pregunta1 || '',
          '2DA PREGUNTA INICIAL': item.pregunta2 || '',
          'PREGUNTA 3': item.pregunta3 || '',
          'PREGUNTA 4': item.pregunta4 || '',
          'PREGUNTA 5': item.pregunta5 || '',
          'PREGUNTA 6': item.pregunta6 || '',
          'PREGUNTA 7': item.pregunta7 || '',
          'PREGUNTA 8': item.pregunta8 || '',
          'PREGUNTA 9': item.pregunta9 || '',
          'REQUIERE ANALISIS': item.requiereAnalisis || (item.flujo === 'NO_DECRETO' ? 'No' : 'Sí'),
          'FECHA': item.fecha || ''
        }));

        const worksheetIdentificacion = XLSX.utils.json_to_sheet(datosIdentificacion);
        
        // Ajustar ancho de columnas
        const columnWidthsIdentificacion = Object.keys(datosIdentificacion[0] || {}).map(key => ({
          wch: Math.max(key.length, 15)
        }));
        worksheetIdentificacion['!cols'] = columnWidthsIdentificacion;

        XLSX.utils.book_append_sheet(workbook, worksheetIdentificacion, 'Identificacion Nueva');
      }

      // Hoja 2: Matriz de Riesgo - Nueva Estructura
      if (datosNuevaEstructura.matrizRiesgo.length > 0) {
        const datosMatrizRiesgo = datosNuevaEstructura.matrizRiesgo.map(item => ({
          'UNIDAD DE NEGOCIO': item.businessUnit || item.unidadDeNegocio || '',
          'PLANTA': item.planta || '',
          'TURNO': item.turno || '',
          'AREA': item.area || '',
          'PUESTO': item.puesto || '',
          'TIEMPO PIE': item.flujo === 'NO_DECRETO' ? 'N/A' : (item.ponderacion1 || ''),
          'CAMBIO POSTURA': item.flujo === 'NO_DECRETO' ? 'N/A' : (item.ponderacion2 || ''),
          'SUPERFICIE': item.flujo === 'NO_DECRETO' ? 'N/A' : (item.ponderacion3 || ''),
          'CALZADO': item.flujo === 'NO_DECRETO' ? 'N/A' : (item.ponderacion4 || ''),
          'ESPACIO': item.flujo === 'NO_DECRETO' ? 'N/A' : (item.ponderacion5 || ''),
          'MALESTARES': item.flujo === 'NO_DECRETO' ? 'N/A' : (item.ponderacion6 || ''),
          'PAUSAS': item.flujo === 'NO_DECRETO' ? 'N/A' : (item.ponderacion7 || ''),
          'NIVEL DE RIESGO': item.flujo === 'NO_DECRETO' ? 'N/A' : (item.nivel || ''),
          'PUNTAJE': item.flujo === 'NO_DECRETO' ? 'N/A' : (item.puntaje || ''),
          'FECHA': item.fecha || ''
        }));

        const worksheetMatrizRiesgo = XLSX.utils.json_to_sheet(datosMatrizRiesgo);
        
        // Ajustar ancho de columnas
        const columnWidthsMatrizRiesgo = Object.keys(datosMatrizRiesgo[0] || {}).map(key => ({
          wch: Math.max(key.length, 15)
        }));
        worksheetMatrizRiesgo['!cols'] = columnWidthsMatrizRiesgo;

        XLSX.utils.book_append_sheet(workbook, worksheetMatrizRiesgo, 'Matriz Riesgo Nueva');
      }

      // Generar archivo Excel
      const excelBuffer = XLSX.write(workbook, { bookType: 'xlsx', type: 'array' });
      const blob = new Blob([excelBuffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
      
      // Descargar archivo
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `nueva_estructura_analisis_bipedestacion_${new Date().toISOString().split('T')[0]}.xlsx`;
      a.click();
      window.URL.revokeObjectURL(url);

      const totalRegistros = datosNuevaEstructura.identificacion.length + datosNuevaEstructura.matrizRiesgo.length;
      Alert.alert(
        '✅ Exportado', 
        `Archivo Excel con ${totalRegistros} registros de la nueva estructura descargado correctamente.\n\n` +
        `📊 Hojas incluidas:\n` +
        `• Identificacion Nueva: ${datosNuevaEstructura.identificacion.length} registros\n` +
        `• Matriz Riesgo Nueva: ${datosNuevaEstructura.matrizRiesgo.length} registros`
      );
    } catch (error) {
      console.error('Error al exportar Excel de nueva estructura:', error);
      Alert.alert('Error', 'No se pudo exportar el archivo Excel');
    }
  };

  if (cargando) {
    return (
      <>
        <StatusBar hidden={true} backgroundColor="#00BCD4" barStyle="light-content" />
        <AnimatedBackground>
          <LinearGradient
            colors={['#00BCD4', '#00796B']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.topBar}
          >
            <View style={styles.topBarContent}>
              <Text style={styles.logoText}>EHS</Text>
              <Text style={styles.topBarTitle}>Nueva Base de Datos{`\n`}Análisis Bipedestación</Text>
            </View>
          </LinearGradient>
          <View style={styles.container}>
            <Text style={styles.titulo}>Nueva Base de Datos</Text>
            <Text style={styles.cargando}>Cargando datos de nueva estructura...</Text>
          </View>
        </AnimatedBackground>
      </>
    );
  }

  return (
    <>
      <StatusBar hidden={true} backgroundColor="#00BCD4" barStyle="light-content" />
      <AnimatedBackground>
        {/* Barra superior */}
        <LinearGradient
          colors={['#00BCD4', '#00796B']}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.topBar}
        >
          <View style={styles.topBarContent}>
            <Text style={styles.logoText}>EHS</Text>
            <Text style={styles.topBarTitle}>Nueva Base de Datos{`\n`}Análisis Bipedestación</Text>
          </View>
        </LinearGradient>
        <ScrollView contentContainerStyle={styles.container}>
          <Text style={styles.titulo}>🆕 Nueva Base de Datos - Estructura de 5 Niveles</Text>
      
          {/* Pestañas */}
          <View style={styles.tabs}>
            <TouchableOpacity 
              style={[styles.tab, tabActiva === 'identificacion' && styles.tabActiva]} 
              onPress={() => setTabActiva('identificacion')}
            >
              <Text style={[styles.tabTexto, tabActiva === 'identificacion' && styles.tabTextoActivo]}>
                🆔 Identificación ({datosNuevaEstructura.identificacion?.length || 0})
              </Text>
            </TouchableOpacity>
            <TouchableOpacity 
              style={[styles.tab, tabActiva === 'matriz-riesgo' && styles.tabActiva]} 
              onPress={() => setTabActiva('matriz-riesgo')}
            >
              <Text style={[styles.tabTexto, tabActiva === 'matriz-riesgo' && styles.tabTextoActivo]}>
                ⚠️ Matriz de Riesgo ({datosNuevaEstructura.matrizRiesgo?.length || 0})
              </Text>
            </TouchableOpacity>
          </View>
          
          {/* Barra de búsqueda */}
          <View style={styles.busquedaContainer}>
            <TextInput
              style={styles.busqueda}
              placeholder="🔍 Buscar en nueva estructura..."
              value={busqueda}
              onChangeText={setBusqueda}
            />
          </View>
          
          {/* Botones */}
          <View style={styles.botonesContainer}>
            <View style={styles.filaBotones}>
              <TouchableOpacity style={styles.boton} onPress={cargarDatosNuevaEstructura} activeOpacity={0.8}>
                <LinearGradient
                  colors={['#667eea', '#764ba2']}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 1 }}
                  style={styles.botonGradient}
                >
                <Text style={styles.botonTexto}>🔄 Actualizar</Text>
                </LinearGradient>
              </TouchableOpacity>
              <TouchableOpacity style={styles.botonExportar} onPress={exportarExcelNuevaEstructura} activeOpacity={0.8}>
                <LinearGradient
                  colors={['#4ECDC4', '#44A08D']}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 1 }}
                  style={styles.botonGradient}
                >
                <Text style={styles.botonTexto}>📊 Exportar Excel</Text>
                </LinearGradient>
              </TouchableOpacity>
            </View>
            <View style={styles.filaBotones}>
              <TouchableOpacity style={styles.botonResultados} onPress={handleResultadosFinales} activeOpacity={0.8}>
                <LinearGradient
                  colors={['#FF9A56', '#FF6B6B']}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 1 }}
                  style={styles.botonGradient}
                >
                <Text style={styles.botonTexto}>📊 Resultados Finales</Text>
                </LinearGradient>
              </TouchableOpacity>
              <TouchableOpacity style={styles.botonInicio} onPress={handleInicio} activeOpacity={0.8}>
                <LinearGradient
                  colors={['#FF6B6B', '#C44569']}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 1 }}
                  style={styles.botonGradient}
                >
                  <Text style={styles.botonTexto}>🏠 Inicio</Text>
                </LinearGradient>
              </TouchableOpacity>
            </View>
          </View>

          {/* Estadísticas */}
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.estadisticasContainer}>
            <View style={styles.estadisticas}>
              <Text style={styles.estadistica}>
                📈 Total: {tabActiva === 'identificacion' ? 
                  datosNuevaEstructura.identificacion?.length || 0 : 
                  datosNuevaEstructura.matrizRiesgo?.length || 0} registros
              </Text>
              <Text style={styles.estadistica}>
                🔍 Mostrando: {datosFiltrados.length} registros
              </Text>
            </View>
          </ScrollView>

          {/* Nueva Tabla Moderna */}
          <View style={styles.nuevaTablaContainer}>
            {/* Encabezados de la tabla */}
            <View style={styles.tablaHeader}>
              <Text style={styles.tablaTitulo}>
                {tabActiva === 'identificacion' ? '📋 Datos de Identificación' : '📊 Matriz de Riesgo'}
              </Text>
              <Text style={styles.tablaSubtitulo}>
                {datosFiltrados.length} registros encontrados
              </Text>
            </View>

            {/* Contenido de la tabla */}
            <ScrollView 
              horizontal 
              showsHorizontalScrollIndicator={false}
              style={styles.tablaScrollContainer}
              contentContainerStyle={{ alignItems: 'center' }}
            >
              <View style={styles.tablaContent}>
                {/* Encabezados de columnas */}
                <View style={styles.tablaRowHeader}>
                  {tabActiva === 'identificacion' ? (
                    <>
                      <View style={styles.tablaColHeader}>
                        <Text style={styles.tablaColHeaderText}>Unidad de Negocio</Text>
                      </View>
                      <View style={styles.tablaColHeader}>
                        <Text style={styles.tablaColHeaderText}>Planta</Text>
                      </View>
                      <View style={styles.tablaColHeader}>
                        <Text style={styles.tablaColHeaderText}>Turno</Text>
                      </View>
                      <View style={styles.tablaColHeader}>
                        <Text style={styles.tablaColHeaderText}>Área</Text>
                      </View>
                      <View style={styles.tablaColHeader}>
                        <Text style={styles.tablaColHeaderText}>Puesto</Text>
                      </View>
                      <View style={styles.tablaColHeader}>
                        <Text style={styles.tablaColHeaderText}>1era Pregunta</Text>
                      </View>
                      <View style={styles.tablaColHeader}>
                        <Text style={styles.tablaColHeaderText}>2da Pregunta</Text>
                      </View>
                      <View style={styles.tablaColHeader}>
                        <Text style={styles.tablaColHeaderText}>Pregunta 3</Text>
                      </View>
                      <View style={styles.tablaColHeader}>
                        <Text style={styles.tablaColHeaderText}>Pregunta 4</Text>
                      </View>
                      <View style={styles.tablaColHeader}>
                        <Text style={styles.tablaColHeaderText}>Pregunta 5</Text>
                      </View>
                      <View style={styles.tablaColHeader}>
                        <Text style={styles.tablaColHeaderText}>Pregunta 6</Text>
                      </View>
                      <View style={styles.tablaColHeader}>
                        <Text style={styles.tablaColHeaderText}>Pregunta 7</Text>
                      </View>
                      <View style={styles.tablaColHeader}>
                        <Text style={styles.tablaColHeaderText}>Requiere Análisis</Text>
                      </View>
                    </>
                  ) : (
                    <>
                      <View style={styles.tablaColHeader}>
                        <Text style={styles.tablaColHeaderText}>Unidad de Negocio</Text>
                      </View>
                      <View style={styles.tablaColHeader}>
                        <Text style={styles.tablaColHeaderText}>Planta</Text>
                      </View>
                      <View style={styles.tablaColHeader}>
                        <Text style={styles.tablaColHeaderText}>Turno</Text>
                      </View>
                      <View style={styles.tablaColHeader}>
                        <Text style={styles.tablaColHeaderText}>Área</Text>
                      </View>
                      <View style={styles.tablaColHeader}>
                        <Text style={styles.tablaColHeaderText}>Puesto</Text>
                      </View>
                      <View style={styles.tablaColHeader}>
                        <Text style={styles.tablaColHeaderText}>Ponderación 1</Text>
                      </View>
                      <View style={styles.tablaColHeader}>
                        <Text style={styles.tablaColHeaderText}>Ponderación 2</Text>
                      </View>
                      <View style={styles.tablaColHeader}>
                        <Text style={styles.tablaColHeaderText}>Ponderación 3</Text>
                      </View>
                      <View style={styles.tablaColHeader}>
                        <Text style={styles.tablaColHeaderText}>Ponderación 4</Text>
                      </View>
                      <View style={styles.tablaColHeader}>
                        <Text style={styles.tablaColHeaderText}>Ponderación 5</Text>
                      </View>
                      <View style={styles.tablaColHeader}>
                        <Text style={styles.tablaColHeaderText}>Ponderación 6</Text>
                      </View>
                      <View style={styles.tablaColHeader}>
                        <Text style={styles.tablaColHeaderText}>Ponderación 7</Text>
                      </View>
                      <View style={styles.tablaColHeader}>
                        <Text style={styles.tablaColHeaderText}>Nivel</Text>
                      </View>
                      <View style={styles.tablaColHeader}>
                        <Text style={styles.tablaColHeaderText}>Puntaje</Text>
                      </View>
                      <View style={styles.tablaColHeader}>
                        <Text style={styles.tablaColHeaderText}>Fecha</Text>
                      </View>
                    </>
                  )}
                </View>

                {/* Contenedor con scroll vertical para las filas */}
                <ScrollView 
                  showsVerticalScrollIndicator={true}
                  style={styles.tablaRowsContainer}
                  contentContainerStyle={styles.tablaRowsContent}
                >
                  {/* Filas de datos */}
                  {datosFiltrados.map((item: any, index: number) => (
                    <View key={index} style={[styles.tablaRow, index % 2 === 0 && styles.tablaRowAlterna]}>
                      {tabActiva === 'identificacion' ? (
                        <>
                          <View style={styles.tablaCol}>
                            <Text style={styles.tablaColText}>{item.businessUnit || item.unidadDeNegocio || ''}</Text>
                          </View>
                          <View style={styles.tablaCol}>
                            <Text style={styles.tablaColText}>{item.planta || ''}</Text>
                          </View>
                          <View style={styles.tablaCol}>
                            <Text style={styles.tablaColText}>{item.turno || ''}</Text>
                          </View>
                          <View style={styles.tablaCol}>
                            <Text style={styles.tablaColText}>{item.area || ''}</Text>
                          </View>
                          <View style={styles.tablaCol}>
                            <Text style={styles.tablaColText}>{item.puesto || ''}</Text>
                          </View>
                          <View style={styles.tablaCol}>
                            <Text style={styles.tablaColText}>{item.pregunta1 || ''}</Text>
                          </View>
                          <View style={styles.tablaCol}>
                            <Text style={styles.tablaColText}>{item.pregunta2 || ''}</Text>
                          </View>
                          <View style={styles.tablaCol}>
                            <Text style={styles.tablaColText}>{item.pregunta3 || ''}</Text>
                          </View>
                          <View style={styles.tablaCol}>
                            <Text style={styles.tablaColText}>{item.pregunta4 || ''}</Text>
                          </View>
                          <View style={styles.tablaCol}>
                            <Text style={styles.tablaColText}>{item.pregunta5 || ''}</Text>
                          </View>
                          <View style={styles.tablaCol}>
                            <Text style={styles.tablaColText}>{item.pregunta6 || ''}</Text>
                          </View>
                          <View style={styles.tablaCol}>
                            <Text style={styles.tablaColText}>{item.pregunta7 || ''}</Text>
                          </View>
                          <View style={styles.tablaCol}>
                            <View style={[
                              styles.badgeRequerido,
                              item.requiereAnalisis ? styles.badgeSi : styles.badgeNo
                            ]}>
                              <Text style={styles.badgeText}>
                                {item.requiereAnalisis ? 'Sí' : 'No'}
                              </Text>
                            </View>
                          </View>
                        </>
                      ) : (
                        <>
                          <View style={styles.tablaCol}>
                            <Text style={styles.tablaColText}>{item.businessUnit || item.unidadDeNegocio || ''}</Text>
                          </View>
                          <View style={styles.tablaCol}>
                            <Text style={styles.tablaColText}>{item.planta || ''}</Text>
                          </View>
                          <View style={styles.tablaCol}>
                            <Text style={styles.tablaColText}>{item.turno || ''}</Text>
                          </View>
                          <View style={styles.tablaCol}>
                            <Text style={styles.tablaColText}>{item.area || ''}</Text>
                          </View>
                          <View style={styles.tablaCol}>
                            <Text style={styles.tablaColText}>{item.puesto || ''}</Text>
                          </View>
                          <View style={styles.tablaCol}>
                            <Text style={styles.tablaColText}>{item.ponderacion1 || ''}</Text>
                          </View>
                          <View style={styles.tablaCol}>
                            <Text style={styles.tablaColText}>{item.ponderacion2 || ''}</Text>
                          </View>
                          <View style={styles.tablaCol}>
                            <Text style={styles.tablaColText}>{item.ponderacion3 || ''}</Text>
                          </View>
                          <View style={styles.tablaCol}>
                            <Text style={styles.tablaColText}>{item.ponderacion4 || ''}</Text>
                          </View>
                          <View style={styles.tablaCol}>
                            <Text style={styles.tablaColText}>{item.ponderacion5 || ''}</Text>
                          </View>
                          <View style={styles.tablaCol}>
                            <Text style={styles.tablaColText}>{item.ponderacion6 || ''}</Text>
                          </View>
                          <View style={styles.tablaCol}>
                            <Text style={styles.tablaColText}>{item.ponderacion7 || ''}</Text>
                          </View>
                          <View style={styles.tablaCol}>
                            <View style={[
                              styles.badgeNivel,
                              item.nivel === 'ALTO' ? styles.badgeAlto :
                              item.nivel === 'MEDIO' ? styles.badgeMedio : styles.badgeBajo
                            ]}>
                              <Text style={styles.badgeText}>
                                {item.nivel || ''}
                              </Text>
                            </View>
                          </View>
                          <View style={styles.tablaCol}>
                            <Text style={styles.tablaColText}>{item.puntaje || ''}</Text>
                          </View>
                          <View style={styles.tablaCol}>
                            <Text style={styles.tablaColText}>{item.fecha || ''}</Text>
                          </View>
                        </>
                      )}
                    </View>
                  ))}
                </ScrollView>
              </View>
            </ScrollView>
          </View>

          {datosFiltrados.length === 0 && (
            <View style={styles.sinDatos}>
              <Text style={styles.sinDatosTexto}>
                {tabActiva === 'identificacion' ? 
                  (datosNuevaEstructura.identificacion?.length === 0 ? 'No hay datos de identificación con nueva estructura disponibles' : 'No se encontraron resultados de identificación') :
                  (datosNuevaEstructura.matrizRiesgo?.length === 0 ? 'No hay datos de matriz de riesgo con nueva estructura disponibles' : 'No se encontraron resultados de matriz de riesgo')
                }
              </Text>
            </View>
          )}
        </ScrollView>
        
        {/* Modal de Contraseña */}
        <Modal
          visible={modalContrasenaVisible}
          transparent={true}
          animationType="fade"
          onRequestClose={cancelarContrasena}
        >
          <View style={styles.modalOverlay}>
            <View style={styles.modalContrasena}>
              <Text style={styles.modalTitulo}>🔐 Contraseña Requerida</Text>
              <Text style={styles.modalDescripcion}>
                Ingresa la contraseña para reiniciar la base de datos:
              </Text>
              
              <TextInput
                style={styles.inputContrasena}
                placeholder="Contraseña"
                value={contrasena}
                onChangeText={setContrasena}
                secureTextEntry={true}
                autoFocus={true}
                onSubmitEditing={verificarContrasena}
              />
              
              <View style={styles.modalBotones}>
                <TouchableOpacity style={styles.botonCancelar} onPress={cancelarContrasena}>
                  <Text style={styles.botonCancelarTexto}>Cancelar</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.botonConfirmar} onPress={verificarContrasena}>
                  <Text style={styles.botonConfirmarTexto}>Reiniciar</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </Modal>
      </AnimatedBackground>
    </>
  );
}

// Función auxiliar para mostrar N/A en lugar de -
const mostrarValorObligatorio = (valor: any) => {
  if (valor === null || valor === undefined || valor === '' || valor === '-') {
    return 'N/A';
  }
  return valor;
};

// Función auxiliar para mostrar N/A cuando no se requiere análisis
const mostrarValorCondicional = (valor: any, requiereAnalisis: boolean) => {
  if (!requiereAnalisis) {
    return 'N/A';
  }
  if (valor === null || valor === undefined || valor === '' || valor === '-') {
    return 'N/A';
  }
  return valor;
};





const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
  },
  // Estilos de la barra superior
  topBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 15,
    paddingTop: 50,
  },
  topBarContent: {
    flex: 1,
  },
  logoText: {
    fontSize: 24,
    fontWeight: 'bold',
    color: AppColors.textWhite,
    marginBottom: 4,
  },
  topBarTitle: {
    fontSize: 16,
    color: AppColors.textWhite,
    fontWeight: '600',
    lineHeight: 20,
  },

  titulo: {
    fontSize: 24,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 20,
    color: '#333',
  },
  cargando: {
    fontSize: 18,
    textAlign: 'center',
    marginTop: 50,
    color: '#666',
  },
  tabs: {
    flexDirection: 'row',
    marginBottom: 16,
    backgroundColor: 'white',
    borderRadius: 8,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: '#ddd',
  },
  tab: {
    flex: 1,
    padding: 12,
    alignItems: 'center',
  },
  tabActiva: {
    backgroundColor: '#007AFF',
  },
  tabTexto: {
    fontSize: 14,
    fontWeight: '500',
    color: '#666',
  },
  tabTextoActivo: {
    color: 'white',
    fontWeight: 'bold',
  },
  busquedaContainer: {
    marginBottom: 16,
  },
  botonesContainer: {
    marginBottom: 16,
  },
  filaBotones: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 12,
  },
  busqueda: {
    backgroundColor: 'white',
    padding: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#ddd',
    fontSize: 16,
    flex: 1,
  },
  boton: {
    padding: 16,
    borderRadius: 8,
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 50,
    minWidth: 120,
  },
  botonExportar: {
    padding: 16,
    borderRadius: 8,
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 50,
    minWidth: 120,
  },
  botonResultados: {
    padding: 16,
    borderRadius: 8,
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 50,
    minWidth: 120,
  },
  botonReiniciar: {
    padding: 16,
    borderRadius: 8,
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 50,
    minWidth: 120,
  },
  botonInicio: {
    padding: 16,
    borderRadius: 8,
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 50,
    minWidth: 120,
  },
  botonGradient: {
    padding: 16,
    borderRadius: 8,
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 50,
    minWidth: 120,
  },
  botonTexto: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 14,
  },
  estadisticasContainer: {
    marginBottom: 16,
  },
  estadisticas: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 8,
    minWidth: 400,
  },
  estadistica: {
    fontSize: 14,
    color: '#666',
    fontWeight: '500',
  },
  tablaContainer: {
    flex: 1,
    minHeight: 300,
  },
  tabla: {
    backgroundColor: 'white',
    borderRadius: 8,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: '#ddd',
    minWidth: 1400, // Asegura que todas las columnas sean visibles
  },
  filaEncabezado: {
    flexDirection: 'row',
    backgroundColor: '#f8f9fa',
    borderBottomWidth: 2,
    borderBottomColor: '#dee2e6',
  },
  celdaEncabezado: {
    padding: 12,
    borderRightWidth: 1,
    borderRightColor: '#dee2e6',
    justifyContent: 'center',
    alignItems: 'center',
  },
  textoEncabezado: {
    fontWeight: 'bold',
    fontSize: 12,
    color: '#495057',
    textAlign: 'center',
  },
  datosContainer: {
    maxHeight: 400,
  },
  fila: {
    flexDirection: 'row',
    borderBottomWidth: 1,
    borderBottomColor: '#dee2e6',
  },
  celda: {
    padding: 8,
    borderRightWidth: 1,
    borderRightColor: '#dee2e6',
    fontSize: 12,
    color: '#333',
    textAlign: 'center',
  },
  columnaUnidad: {
    width: 140,
  },
  columnaPuesto: {
    width: 120,
  },
  columnaSubpuesto: {
    width: 120,
  },
  columnaPregunta: {
    width: 60,
  },
  columnaPonderacion: {
    width: 60,
  },
  columnaAplica: {
    width: 100,
  },
  columnaNivel: {
    width: 80,
  },
  columnaPuntaje: {
    width: 80,
  },
  columnaFecha: {
    width: 100,
  },
  filaDatos: {
    flexDirection: 'row',
    borderBottomWidth: 1,
    borderBottomColor: '#dee2e6',
  },
  textoCelda: {
    fontSize: 12,
    color: '#333',
    textAlign: 'center',
  },
  sinDatos: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  sinDatosTexto: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
  },
  
  // Estilos del modal de contraseña
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContrasena: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 24,
    width: '90%',
    maxWidth: 400,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  modalTitulo: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 12,
    textAlign: 'center',
  },
  modalDescripcion: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    marginBottom: 20,
    lineHeight: 22,
  },
  inputContrasena: {
    borderWidth: 2,
    borderColor: '#ddd',
    borderRadius: 8,
    padding: 16,
    fontSize: 16,
    width: '100%',
    marginBottom: 24,
    textAlign: 'center',
  },
  modalBotones: {
    flexDirection: 'row',
    gap: 12,
    width: '100%',
  },
  botonCancelar: {
    flex: 1,
    backgroundColor: '#6c757d',
    padding: 16,
    borderRadius: 8,
    alignItems: 'center',
  },
  botonCancelarTexto: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 16,
  },
  botonConfirmar: {
    flex: 1,
    backgroundColor: '#dc3545',
    padding: 16,
    borderRadius: 8,
    alignItems: 'center',
  },
  botonConfirmarTexto: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 16,
  },

  // Estilos para la nueva tabla moderna
  nuevaTablaContainer: {
    backgroundColor: 'rgba(255, 255, 255, 0.95)',
    borderRadius: 16,
    padding: 20,
    marginTop: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.15,
    shadowRadius: 16,
    elevation: 8,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.2)',
  },
  tablaHeader: {
    marginBottom: 20,
    alignItems: 'center',
  },
  tablaTitulo: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#2C3E50',
    marginBottom: 8,
    textAlign: 'center',
  },
  tablaSubtitulo: {
    fontSize: 16,
    color: '#7F8C8D',
    fontWeight: '500',
  },
  tablaScrollContainer: {
    maxHeight: 500,
  },
  tablaContent: {
    minWidth: 1400,
  },
  tablaRowsContainer: {
    maxHeight: 400,
    flex: 1,
    width: '100%',
  },
  tablaRowsContent: {
    flexGrow: 1,
    width: '100%',
  },
  tablaRowHeader: {
    flexDirection: 'row',
    backgroundColor: '#3498DB',
    borderRadius: 12,
    marginBottom: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
    width: '100%',
  },
  tablaColHeader: {
    padding: 16,
    minWidth: 120,
    alignItems: 'center',
    justifyContent: 'center',
    borderRightWidth: 1,
    borderRightColor: 'rgba(255, 255, 255, 0.2)',
    flex: 1,
    width: 120,
  },
  tablaColHeaderText: {
    color: 'white',
    fontSize: 14,
    fontWeight: 'bold',
    textAlign: 'center',
    textShadowColor: 'rgba(0, 0, 0, 0.3)',
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 2,
  },
  tablaRow: {
    flexDirection: 'row',
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    borderRadius: 8,
    marginBottom: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
    width: '100%',
  },
  tablaRowAlterna: {
    backgroundColor: 'rgba(236, 240, 241, 0.8)',
  },
  tablaCol: {
    padding: 12,
    minWidth: 120,
    alignItems: 'center',
    justifyContent: 'center',
    borderRightWidth: 1,
    borderRightColor: 'rgba(0, 0, 0, 0.1)',
    flex: 1,
    width: 120,
  },
  tablaColText: {
    color: '#2C3E50',
    fontSize: 13,
    fontWeight: '500',
    textAlign: 'center',
    width: '100%',
  },
  badgeRequerido: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    minWidth: 60,
    alignItems: 'center',
    justifyContent: 'center',
  },
  badgeSi: {
    backgroundColor: '#E74C3C',
  },
  badgeNo: {
    backgroundColor: '#27AE60',
  },
  badgeNivel: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    minWidth: 60,
    alignItems: 'center',
    justifyContent: 'center',
  },
  badgeAlto: {
    backgroundColor: '#E74C3C',
  },
  badgeMedio: {
    backgroundColor: '#F39C12',
  },
  badgeBajo: {
    backgroundColor: '#27AE60',
  },
  badgeText: {
    color: 'white',
    fontSize: 12,
    fontWeight: 'bold',
    textAlign: 'center',
  },
});

// Componente para la tabla de identificación - Nueva Estructura
const TablaIdentificacionNuevaEstructura = ({ datos, ordenarPor, ordenAscendente, cambiarOrden, obtenerIconoOrden, getBusinessUnitName, selectedBusinessUnit }: any) => (
  <ScrollView horizontal style={styles.tablaContainer}>
    <View style={styles.tabla}>
      {/* Encabezados */}
      <View style={styles.filaEncabezado}>
        <TouchableOpacity 
          style={[styles.celdaEncabezado, styles.columnaUnidad]} 
          onPress={() => cambiarOrden('businessUnit')}
        >
          <Text style={styles.textoEncabezado}>
            Unidad de Negocio {obtenerIconoOrden('businessUnit')}
          </Text>
        </TouchableOpacity>
        <TouchableOpacity 
          style={[styles.celdaEncabezado, styles.columnaPuesto]} 
          onPress={() => cambiarOrden('planta')}
        >
          <Text style={styles.textoEncabezado}>
            Planta {obtenerIconoOrden('planta')}
          </Text>
        </TouchableOpacity>
        <TouchableOpacity 
          style={[styles.celdaEncabezado, styles.columnaSubpuesto]} 
          onPress={() => cambiarOrden('turno')}
        >
          <Text style={styles.textoEncabezado}>
            Turno {obtenerIconoOrden('turno')}
          </Text>
        </TouchableOpacity>
        <TouchableOpacity 
          style={[styles.celdaEncabezado, styles.columnaPuesto]} 
          onPress={() => cambiarOrden('area')}
        >
          <Text style={styles.textoEncabezado}>
            Área {obtenerIconoOrden('area')}
          </Text>
        </TouchableOpacity>
        <TouchableOpacity 
          style={[styles.celdaEncabezado, styles.columnaPuesto]} 
          onPress={() => cambiarOrden('puesto')}
        >
          <Text style={styles.textoEncabezado}>
            Puesto {obtenerIconoOrden('puesto')}
          </Text>
        </TouchableOpacity>
        <TouchableOpacity 
          style={[styles.celdaEncabezado, styles.columnaPregunta]} 
          onPress={() => cambiarOrden('pregunta1')}
        >
          <Text style={styles.textoEncabezado}>
            1era Pregunta Inicial {obtenerIconoOrden('pregunta1')}
          </Text>
        </TouchableOpacity>
        <TouchableOpacity 
          style={[styles.celdaEncabezado, styles.columnaPregunta]} 
          onPress={() => cambiarOrden('pregunta2')}
        >
          <Text style={styles.textoEncabezado}>
            2da Pregunta Inicial {obtenerIconoOrden('pregunta2')}
          </Text>
        </TouchableOpacity>
        <TouchableOpacity 
          style={[styles.celdaEncabezado, styles.columnaPregunta]} 
          onPress={() => cambiarOrden('pregunta3')}
        >
          <Text style={styles.textoEncabezado}>
            Pregunta 3 {obtenerIconoOrden('pregunta3')}
          </Text>
        </TouchableOpacity>
        <TouchableOpacity 
          style={[styles.celdaEncabezado, styles.columnaPregunta]} 
          onPress={() => cambiarOrden('pregunta4')}
        >
          <Text style={styles.textoEncabezado}>
            Pregunta 4 {obtenerIconoOrden('pregunta4')}
          </Text>
        </TouchableOpacity>
        <TouchableOpacity 
          style={[styles.celdaEncabezado, styles.columnaPregunta]} 
          onPress={() => cambiarOrden('pregunta5')}
        >
          <Text style={styles.textoEncabezado}>
            Pregunta 5 {obtenerIconoOrden('pregunta5')}
          </Text>
        </TouchableOpacity>
        <TouchableOpacity 
          style={[styles.celdaEncabezado, styles.columnaPregunta]} 
          onPress={() => cambiarOrden('pregunta6')}
        >
          <Text style={styles.textoEncabezado}>
            Pregunta 6 {obtenerIconoOrden('pregunta6')}
          </Text>
        </TouchableOpacity>
        <TouchableOpacity 
          style={[styles.celdaEncabezado, styles.columnaPregunta]} 
          onPress={() => cambiarOrden('pregunta7')}
        >
          <Text style={styles.textoEncabezado}>
            Pregunta 7 {obtenerIconoOrden('pregunta7')}
          </Text>
        </TouchableOpacity>
        <TouchableOpacity 
          style={[styles.celdaEncabezado, styles.columnaPregunta]} 
          onPress={() => cambiarOrden('pregunta8')}
        >
          <Text style={styles.textoEncabezado}>
            Pregunta 8 {obtenerIconoOrden('pregunta8')}
          </Text>
        </TouchableOpacity>
        <TouchableOpacity 
          style={[styles.celdaEncabezado, styles.columnaPregunta]} 
          onPress={() => cambiarOrden('pregunta9')}
        >
          <Text style={styles.textoEncabezado}>
            Pregunta 9 {obtenerIconoOrden('pregunta9')}
          </Text>
        </TouchableOpacity>
        <TouchableOpacity 
          style={[styles.celdaEncabezado, styles.columnaPregunta]} 
          onPress={() => cambiarOrden('requiereAnalisis')}
        >
          <Text style={styles.textoEncabezado}>
            Requiere Análisis {obtenerIconoOrden('requiereAnalisis')}
          </Text>
        </TouchableOpacity>
        <TouchableOpacity 
          style={[styles.celdaEncabezado, styles.columnaFecha]} 
          onPress={() => cambiarOrden('fecha')}
        >
          <Text style={styles.textoEncabezado}>
            Fecha {obtenerIconoOrden('fecha')}
          </Text>
        </TouchableOpacity>
      </View>

      {/* Filas de datos */}
      {datos.map((item: any, index: number) => (
        <View key={index} style={styles.filaDatos}>
          <View style={[styles.celda, styles.columnaUnidad]}>
            <Text style={styles.textoCelda}>
              {item.businessUnit || ''}
            </Text>
          </View>
          <View style={[styles.celda, styles.columnaPuesto]}>
            <Text style={styles.textoCelda}>
              {item.planta || ''}
            </Text>
          </View>
          <View style={[styles.celda, styles.columnaSubpuesto]}>
            <Text style={styles.textoCelda}>
              {item.turno || ''}
            </Text>
          </View>
          <View style={[styles.celda, styles.columnaPuesto]}>
            <Text style={styles.textoCelda}>
              {item.area || ''}
            </Text>
          </View>
          <View style={[styles.celda, styles.columnaPuesto]}>
            <Text style={styles.textoCelda}>
              {item.puesto || ''}
            </Text>
          </View>
          <View style={[styles.celda, styles.columnaPregunta]}>
            <Text style={styles.textoCelda}>
              {item.pregunta1 || ''}
            </Text>
          </View>
          <View style={[styles.celda, styles.columnaPregunta]}>
            <Text style={styles.textoCelda}>
              {item.pregunta2 || ''}
            </Text>
          </View>
          <View style={[styles.celda, styles.columnaPregunta]}>
            <Text style={styles.textoCelda}>
              {item.pregunta3 || ''}
            </Text>
          </View>
          <View style={[styles.celda, styles.columnaPregunta]}>
            <Text style={styles.textoCelda}>
              {item.pregunta4 || ''}
            </Text>
          </View>
          <View style={[styles.celda, styles.columnaPregunta]}>
            <Text style={styles.textoCelda}>
              {item.pregunta5 || ''}
            </Text>
          </View>
          <View style={[styles.celda, styles.columnaPregunta]}>
            <Text style={styles.textoCelda}>
              {item.pregunta6 || ''}
            </Text>
          </View>
          <View style={[styles.celda, styles.columnaPregunta]}>
            <Text style={styles.textoCelda}>
              {item.pregunta7 || ''}
            </Text>
          </View>
          <View style={[styles.celda, styles.columnaPregunta]}>
            <Text style={styles.textoCelda}>
              {item.pregunta8 || ''}
            </Text>
          </View>
          <View style={[styles.celda, styles.columnaPregunta]}>
            <Text style={styles.textoCelda}>
              {item.pregunta9 || ''}
            </Text>
          </View>
          <View style={[styles.celda, styles.columnaPregunta]}>
            <Text style={styles.textoCelda}>
              {item.requiereAnalisis || ''}
            </Text>
          </View>
          <View style={[styles.celda, styles.columnaFecha]}>
            <Text style={styles.textoCelda}>
              {item.fecha || ''}
            </Text>
          </View>
        </View>
      ))}
    </View>
  </ScrollView>
);

// Componente para la tabla de matriz de riesgo - Nueva Estructura
const TablaMatrizRiesgoNuevaEstructura = ({ datos, ordenarPor, ordenAscendente, cambiarOrden, obtenerIconoOrden, getBusinessUnitName, selectedBusinessUnit }: any) => (
  <ScrollView horizontal style={styles.tablaContainer}>
    <View style={styles.tabla}>
      {/* Encabezados */}
      <View style={styles.filaEncabezado}>
        <TouchableOpacity 
          style={[styles.celdaEncabezado, styles.columnaUnidad]} 
          onPress={() => cambiarOrden('businessUnit')}
        >
          <Text style={styles.textoEncabezado}>
            Unidad de Negocio {obtenerIconoOrden('businessUnit')}
          </Text>
        </TouchableOpacity>
        <TouchableOpacity 
          style={[styles.celdaEncabezado, styles.columnaPuesto]} 
          onPress={() => cambiarOrden('planta')}
        >
          <Text style={styles.textoEncabezado}>
            Planta {obtenerIconoOrden('planta')}
          </Text>
        </TouchableOpacity>
        <TouchableOpacity 
          style={[styles.celdaEncabezado, styles.columnaSubpuesto]} 
          onPress={() => cambiarOrden('turno')}
        >
          <Text style={styles.textoEncabezado}>
            Turno {obtenerIconoOrden('turno')}
          </Text>
        </TouchableOpacity>
        <TouchableOpacity 
          style={[styles.celdaEncabezado, styles.columnaPuesto]} 
          onPress={() => cambiarOrden('area')}
        >
          <Text style={styles.textoEncabezado}>
            Área {obtenerIconoOrden('area')}
          </Text>
        </TouchableOpacity>
        <TouchableOpacity 
          style={[styles.celdaEncabezado, styles.columnaPuesto]} 
          onPress={() => cambiarOrden('puesto')}
        >
          <Text style={styles.textoEncabezado}>
            Puesto {obtenerIconoOrden('puesto')}
          </Text>
        </TouchableOpacity>
        <TouchableOpacity 
          style={[styles.celdaEncabezado, styles.columnaPonderacion]} 
          onPress={() => cambiarOrden('ponderacion1')}
        >
          <Text style={styles.textoEncabezado}>
            Tiempo Pie {obtenerIconoOrden('ponderacion1')}
          </Text>
        </TouchableOpacity>
        <TouchableOpacity 
          style={[styles.celdaEncabezado, styles.columnaPonderacion]} 
          onPress={() => cambiarOrden('ponderacion2')}
        >
          <Text style={styles.textoEncabezado}>
            Cambio Postura {obtenerIconoOrden('ponderacion2')}
          </Text>
        </TouchableOpacity>
        <TouchableOpacity 
          style={[styles.celdaEncabezado, styles.columnaPonderacion]} 
          onPress={() => cambiarOrden('ponderacion3')}
        >
          <Text style={styles.textoEncabezado}>
            Superficie {obtenerIconoOrden('ponderacion3')}
          </Text>
        </TouchableOpacity>
        <TouchableOpacity 
          style={[styles.celdaEncabezado, styles.columnaPonderacion]} 
          onPress={() => cambiarOrden('ponderacion4')}
        >
          <Text style={styles.textoEncabezado}>
            Calzado {obtenerIconoOrden('ponderacion4')}
          </Text>
        </TouchableOpacity>
        <TouchableOpacity 
          style={[styles.celdaEncabezado, styles.columnaPonderacion]} 
          onPress={() => cambiarOrden('ponderacion5')}
        >
          <Text style={styles.textoEncabezado}>
            Espacio {obtenerIconoOrden('ponderacion5')}
          </Text>
        </TouchableOpacity>
        <TouchableOpacity 
          style={[styles.celdaEncabezado, styles.columnaPonderacion]} 
          onPress={() => cambiarOrden('ponderacion6')}
        >
          <Text style={styles.textoEncabezado}>
            Malestares {obtenerIconoOrden('ponderacion6')}
          </Text>
        </TouchableOpacity>
        <TouchableOpacity 
          style={[styles.celdaEncabezado, styles.columnaPonderacion]} 
          onPress={() => cambiarOrden('ponderacion7')}
        >
          <Text style={styles.textoEncabezado}>
            Pausas {obtenerIconoOrden('ponderacion7')}
          </Text>
        </TouchableOpacity>
        <TouchableOpacity 
          style={[styles.celdaEncabezado, styles.columnaNivel]} 
          onPress={() => cambiarOrden('nivel')}
        >
          <Text style={styles.textoEncabezado}>
            Nivel {obtenerIconoOrden('nivel')}
          </Text>
        </TouchableOpacity>
        <TouchableOpacity 
          style={[styles.celdaEncabezado, styles.columnaPuntaje]} 
          onPress={() => cambiarOrden('puntaje')}
        >
          <Text style={styles.textoEncabezado}>
            Puntaje {obtenerIconoOrden('puntaje')}
          </Text>
        </TouchableOpacity>
        <TouchableOpacity 
          style={[styles.celdaEncabezado, styles.columnaFecha]} 
          onPress={() => cambiarOrden('fecha')}
        >
          <Text style={styles.textoEncabezado}>
            Fecha {obtenerIconoOrden('fecha')}
          </Text>
        </TouchableOpacity>
      </View>

      {/* Filas de datos */}
      {datos.map((item: any, index: number) => (
        <View key={index} style={styles.filaDatos}>
          <View style={[styles.celda, styles.columnaUnidad]}>
            <Text style={styles.textoCelda}>
              {item.businessUnit || ''}
            </Text>
          </View>
          <View style={[styles.celda, styles.columnaPuesto]}>
            <Text style={styles.textoCelda}>
              {item.planta || ''}
            </Text>
          </View>
          <View style={[styles.celda, styles.columnaSubpuesto]}>
            <Text style={styles.textoCelda}>
              {item.turno || ''}
            </Text>
          </View>
          <View style={[styles.celda, styles.columnaPuesto]}>
            <Text style={styles.textoCelda}>
              {item.area || ''}
            </Text>
          </View>
          <View style={[styles.celda, styles.columnaPuesto]}>
            <Text style={styles.textoCelda}>
              {item.puesto || ''}
            </Text>
          </View>
          <View style={[styles.celda, styles.columnaPonderacion]}>
            <Text style={styles.textoCelda}>
              {item.ponderacion1 || ''}
            </Text>
          </View>
          <View style={[styles.celda, styles.columnaPonderacion]}>
            <Text style={styles.textoCelda}>
              {item.ponderacion2 || ''}
            </Text>
          </View>
          <View style={[styles.celda, styles.columnaPonderacion]}>
            <Text style={styles.textoCelda}>
              {item.ponderacion3 || ''}
            </Text>
          </View>
          <View style={[styles.celda, styles.columnaPonderacion]}>
            <Text style={styles.textoCelda}>
              {item.ponderacion4 || ''}
            </Text>
          </View>
          <View style={[styles.celda, styles.columnaPonderacion]}>
            <Text style={styles.textoCelda}>
              {item.ponderacion5 || ''}
            </Text>
          </View>
          <View style={[styles.celda, styles.columnaPonderacion]}>
            <Text style={styles.textoCelda}>
              {item.ponderacion6 || ''}
            </Text>
          </View>
          <View style={[styles.celda, styles.columnaPonderacion]}>
            <Text style={styles.textoCelda}>
              {item.ponderacion7 || ''}
            </Text>
          </View>
          <View style={[styles.celda, styles.columnaNivel]}>
            <Text style={styles.textoCelda}>
              {item.nivel || ''}
            </Text>
          </View>
          <View style={[styles.celda, styles.columnaPuntaje]}>
            <Text style={styles.textoCelda}>
              {item.puntaje || ''}
            </Text>
          </View>
          <View style={[styles.celda, styles.columnaFecha]}>
            <Text style={styles.textoCelda}>
              {item.fecha || ''}
            </Text>
          </View>
        </View>
      ))}
    </View>
  </ScrollView>
);
