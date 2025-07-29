import { StyleSheet, ScrollView, View, TouchableOpacity, FlatList, Platform, Alert, TextInput, Image } from 'react-native';
import { Text } from '@/components/Themed';
import { useLocalSearchParams } from 'expo-router';
import { useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as XLSX from 'xlsx';
import * as FileSystem from 'expo-file-system';
import * as Sharing from 'expo-sharing';
import { AppColors } from '@/constants/Colors';
import { HistorialAnalisis, NivelRiesgo } from '@/types';
import { safeJsonParse, handleStorageError, showErrorToUser } from '@/utils/errorHandler';
import AnimatedBackground from '@/components/AnimatedBackground';

const RECOMENDACIONES = {
  NO_DECRETO: 'No aplica el Decreto. Según las respuestas, la situación del trabajador no está contemplada por el decreto sobre bipedestación.',
  SILLA_DETERMINADO: 'Se debe proporcionar el asiento o silla con respaldo a la persona trabajadora en un lugar determinado dentro del centro de trabajo.',
  SILLA_CERCA: 'Se debe proporcionar el asiento o silla con respaldo a la persona trabajadora en un lugar cercano a su lugar de trabajo.',
  SILLA_CARACTERISTICAS: 'Se debe proporcionar el asiento o silla con respaldo a la persona trabajadora con las características determinadas para su espacio de trabajo.',
};

const STORAGE_KEY = 'historial_analisis_riesgo';

// Función para obtener el color del nivel de riesgo
function getNivelRiesgoColor(nivel: string): string {
  switch (nivel?.toLowerCase()) {
    case 'bajo':
      return '#4caf50';
    case 'medio':
      return '#ffeb3b';
    case 'alto':
      return '#f44336';
    default:
      return '#ccc';
  }
}

export default function ResultadosFinalesScreen() {
  const params = useLocalSearchParams();
  const { unidad, puesto, subpuesto, flujo, puntaje, nivel, respuestasFlujo } = params;
  const [showGlosario, setShowGlosario] = useState(false);
  const [historial, setHistorial] = useState<HistorialAnalisis[]>([]);
  const [showBorrarModal, setShowBorrarModal] = useState(false);
  const [codigoConfirmacion, setCodigoConfirmacion] = useState('');
  const [showHelpModal, setShowHelpModal] = useState(false);

  // Debug: verificar estado del modal
  useEffect(() => {
    console.log('Estado del modal de ayuda:', showHelpModal);
  }, [showHelpModal]);

  // Validar que tenemos los parámetros necesarios
  useEffect(() => {
    console.log('Parámetros recibidos en resultados finales:', params);
    if (!unidad || !puesto || !subpuesto || !puntaje || !nivel) {
      console.warn('Faltan parámetros requeridos:', { unidad, puesto, subpuesto, puntaje, nivel });
      Alert.alert(
        'Datos incompletos',
        'No se recibieron todos los datos necesarios para mostrar los resultados.',
        [{ text: 'OK', style: 'default' }]
      );
    }
  }, [params]);

  // Guardar el análisis actual al historial al montar
  useEffect(() => {
    const guardarHistorial = async () => {
      // Extraer respuestas de preguntas iniciales, ponderación y flujo
      let respuestasIniciales: any = {};
      let respuestasPonderacion: any = {};
      let respuestasFlujoData: any = {};
      
      try {
        respuestasIniciales = safeJsonParse(params.respuestas as string, {});
        respuestasPonderacion = safeJsonParse(params.respuestasPonderacion as string, {});
        respuestasFlujoData = safeJsonParse(respuestasFlujo as string, {});
      } catch (error) {
        console.warn('Error al parsear respuestas:', error);
      }
      
      // Convertir tipos para que coincidan con HistorialAnalisis
      const puntajeNumero = typeof puntaje === 'string' ? parseInt(puntaje, 10) : Number(puntaje) || 0;
      const nivelString = Array.isArray(nivel) ? nivel[0] : String(nivel || 'Desconocido');
      const unidadString = Array.isArray(unidad) ? unidad[0] : String(unidad || '');
      const puestoString = Array.isArray(puesto) ? puesto[0] : String(puesto || '');
      const subpuestoString = Array.isArray(subpuesto) ? subpuesto[0] : String(subpuesto || '');
      const flujoString = Array.isArray(flujo) ? flujo[0] : String(flujo || '');
      
      // Mapear respuestas a campos individuales
      const nuevo: HistorialAnalisis = {
        unidad: unidadString,
        puesto: puestoString,
        subpuesto: subpuestoString,
        flujo: flujoString,
        puntaje: puntajeNumero,
        nivel: nivelString as NivelRiesgo,
        fecha: new Date().toLocaleString(),
        // Preguntas iniciales (1-2) - sin cambios
        pregunta1: respuestasIniciales[1] || '',
        pregunta2: respuestasIniciales[2] || '',
        // Preguntas 3-9 mapeadas desde el diagrama de flujo
        pregunta3: flujoString === 'NO_DECRETO' ? 'N/A' : (respuestasFlujoData[1] || ''), // ¿Hay personas trabajadoras en bipedestación?
        pregunta4: flujoString === 'NO_DECRETO' ? 'N/A' : (respuestasFlujoData[2] || ''), // ¿La bipedestación es prolongada?
        pregunta5: flujoString === 'NO_DECRETO' ? 'N/A' : (respuestasFlujoData[3] || ''), // ¿Puede realizar actividades sentada?
        pregunta6: flujoString === 'NO_DECRETO' ? 'N/A' : (respuestasFlujoData[4] || ''), // ¿Existe espacio para silla?
        pregunta7: flujoString === 'NO_DECRETO' ? 'N/A' : (respuestasFlujoData[5] || ''), // ¿Requiere estar cerca del trabajo?
        pregunta8: 'N/A', // Siempre N/A - no existe en el diagrama de flujo
        pregunta9: 'N/A', // Siempre N/A - no existe en el diagrama de flujo
        // Ponderaciones (1-7)
        ponderacion1: respuestasPonderacion[1] || 0,
        ponderacion2: respuestasPonderacion[2] || 0,
        ponderacion3: respuestasPonderacion[3] || 0,
        ponderacion4: respuestasPonderacion[4] || 0,
        ponderacion5: respuestasPonderacion[5] || 0,
        ponderacion6: respuestasPonderacion[6] || 0,
        ponderacion7: respuestasPonderacion[7] || 0,
      };
      try {
        const actual = await AsyncStorage.getItem(STORAGE_KEY);
        let arr = actual ? JSON.parse(actual) : [];
        arr.push(nuevo);
        await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(arr));
        setHistorial(arr);
        console.log('Historial guardado exitosamente');
      } catch (error) {
        console.error('Error al guardar historial:', error);
        const storageError = handleStorageError(error, 'guardar historial');
        showErrorToUser(storageError, 'Error al guardar');
        setHistorial([nuevo]);
      }
    };
    guardarHistorial();
  }, [unidad, puesto, subpuesto, flujo, puntaje, nivel, params.respuestas, params.respuestasPonderacion, respuestasFlujo]);

  // Leer historial al montar
  useEffect(() => {
    const leerHistorial = async () => {
      try {
        const actual = await AsyncStorage.getItem(STORAGE_KEY);
        let arr = actual ? JSON.parse(actual) : [];
        setHistorial(arr);
      } catch (e) {
        setHistorial([]);
      }
    };
    leerHistorial();
  }, []);

  // Función para mostrar el modal de ayuda
  const handleHelp = () => {
    console.log('handleHelp ejecutado');
    setShowHelpModal(true);
  };

  // Función para borrar el historial
  const borrarHistorial = async () => {
    if (codigoConfirmacion === '123') {
      try {
        await AsyncStorage.removeItem(STORAGE_KEY);
        setHistorial([]);
        setShowBorrarModal(false);
        setCodigoConfirmacion('');
        Alert.alert(
          'Historial borrado',
          'Todos los datos del historial han sido eliminados exitosamente.',
          [{ text: 'OK', style: 'default' }]
        );
      } catch (error) {
        console.error('Error al borrar historial:', error);
        const storageError = handleStorageError(error, 'borrar historial');
        showErrorToUser(storageError, 'Error al borrar');
      }
    } else {
      Alert.alert(
        'Código incorrecto',
        'El código de confirmación ingresado no es correcto. Inténtalo de nuevo.',
        [{ text: 'OK', style: 'default' }]
      );
      setCodigoConfirmacion('');
    }
  };

  // Función auxiliar para determinar si una pregunta debe aparecer como N/A
  const getRespuestaConNA = (respuesta: string, preguntaNumero: number, flujo: string): string => {
    // Si no hay flujo o es "NO_DECRETO", todas las preguntas del diagrama de flujo son N/A
    if (!flujo || flujo.toLowerCase().includes('no aplica') || flujo === 'NO_DECRETO') {
      if (preguntaNumero >= 3 && preguntaNumero <= 9) {
        return 'N/A';
      }
    }
    
    // Si hay respuesta, devolverla
    if (respuesta && respuesta.trim() !== '') {
      return respuesta;
    }
    
    // Si no hay respuesta y es una pregunta del diagrama de flujo (3-7), devolver N/A
    if (preguntaNumero >= 3 && preguntaNumero <= 7) {
      return 'N/A';
    }
    
    // Las preguntas 8 y 9 SIEMPRE deben aparecer como N/A porque no existen en el diagrama de flujo
    if (preguntaNumero === 8 || preguntaNumero === 9) {
      return 'N/A';
    }
    
    // Si no hay respuesta y no es N/A por el flujo, devolver vacío
    return '';
  };

  // Exportar historial a Excel compatible con web y móvil (NUEVO FORMATO)
  const exportarExcel = async () => {
    // --- Hoja 1: Identificación ---
    const headersIdent = [
      'UNIDAD DE NEGOCIO',
      'PUESTO DE TRABAJO',
      'SUBPUESTO DE TRABAJO',
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
    ];
    // --- Hoja 2: Matriz de Riesgo ---
    const headersRiesgo = [
      'UNIDAD DE NEGOCIO',
      'PUESTO DE TRABAJO',
      'SUBPUESTO DE TRABAJO',
      'PONDERACION 1',
      'PONDERACION 2',
      'PONDERACION 3',
      'PONDERACION 4',
      'PONDERACION 5',
      'PONDERACION 6',
      'PONDERACION 7',
      'NIVEL DE RIESGO',
    ];

    // Mapear historial a formato de la hoja 1 (identificacion)
    const dataIdent = historial.map((item) => ({
      'UNIDAD DE NEGOCIO': item.unidad || '',
      'PUESTO DE TRABAJO': item.puesto || '',
      'SUBPUESTO DE TRABAJO': item.subpuesto || '',
      'PREGUNTA 1': item.pregunta1 === '8 horas' || item.pregunta1 === '10 horas' || item.pregunta1 === '12 horas' ? item.pregunta1 : '',
      'PREGUNTA 2': item.pregunta2 === 'Sí' ? 'Sí' : item.pregunta2 === 'No' ? 'No' : '',
      'PREGUNTA 3': getRespuestaConNA(item.pregunta3, 3, item.flujo), // ¿Hay personas trabajadoras en bipedestación?
      'PREGUNTA 4': getRespuestaConNA(item.pregunta4, 4, item.flujo), // ¿La bipedestación es prolongada?
      'PREGUNTA 5': getRespuestaConNA(item.pregunta5, 5, item.flujo), // ¿Puede realizar actividades sentada?
      'PREGUNTA 6': getRespuestaConNA(item.pregunta6, 6, item.flujo), // ¿Existe espacio para silla?
      'PREGUNTA 7': getRespuestaConNA(item.pregunta7, 7, item.flujo), // ¿Requiere estar cerca del trabajo?
      'PREGUNTA 8': getRespuestaConNA(item.pregunta8, 8, item.flujo), // Vacío - pero puede ser N/A
      'PREGUNTA 9': getRespuestaConNA(item.pregunta9, 9, item.flujo), // Vacío - pero puede ser N/A
      'REQUIERE ANALISIS': (item.flujo ? (item.flujo.toLowerCase().includes('no aplica') ? 'No' : 'Sí') : ''),
    }));

    // Filtrar y mapear historial a formato de la hoja 2 (matriz de riesgo)
    const dataRiesgo = historial
      .filter((item) => {
        // Solo incluir elementos que no sean "No aplica"
        return item.flujo && !item.flujo.toLowerCase().includes('no aplica');
      })
      .map((item) => ({
        'UNIDAD DE NEGOCIO': item.unidad || '',
        'PUESTO DE TRABAJO': item.puesto || '',
        'SUBPUESTO DE TRABAJO': item.subpuesto || '',
        'PONDERACION 1': item.ponderacion1 || '',
        'PONDERACION 2': item.ponderacion2 || '',
        'PONDERACION 3': item.ponderacion3 || '',
        'PONDERACION 4': item.ponderacion4 || '',
        'PONDERACION 5': item.ponderacion5 || '',
        'PONDERACION 6': item.ponderacion6 || '',
        'PONDERACION 7': item.ponderacion7 || '',
        'NIVEL DE RIESGO': item.nivel || '',
      }));

    // Crear hojas
    const wsIdent = XLSX.utils.json_to_sheet(dataIdent, { header: headersIdent });
    const wsRiesgo = XLSX.utils.json_to_sheet(dataRiesgo, { header: headersRiesgo });
    // Crear libro y agregar hojas
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, wsIdent, 'identificacion');
    XLSX.utils.book_append_sheet(wb, wsRiesgo, 'matriz de riesgo');

    // Exportar según plataforma
    if (Platform.OS === 'web') {
      const wbout = XLSX.write(wb, { type: 'array', bookType: 'xlsx' });
      const blob = new Blob([wbout], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
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
      await FileSystem.writeAsStringAsync(uri, wbout, { encoding: FileSystem.EncodingType.Base64 });
      await Sharing.shareAsync(uri, { mimeType: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet', dialogTitle: 'Compartir Matriz de Riesgo' });
    }
  };

  return (
    <AnimatedBackground>
      <View style={styles.container}>
        {/* Barra superior con información */}
        <View style={styles.topBar}>
          <View style={styles.topBarContent}>
            <Image 
              source={require('@/assets/images/logo-ehs.png')} 
              style={styles.logoImage}
              resizeMode="cover"
            />
            <View style={styles.topBarInfo}>
              <Text style={styles.topBarTitle}>Resultados Finales</Text>
              <Text style={styles.topBarSubtitle}>{unidad} • {puesto}</Text>
            </View>
          </View>
          <TouchableOpacity style={styles.topBarButton} onPress={handleHelp}>
            <Text style={styles.topBarButtonText}>?</Text>
          </TouchableOpacity>
        </View>

        {/* Contenido principal */}
        <ScrollView style={styles.scrollView} contentContainerStyle={styles.scrollContent}>
          {/* Resumen del análisis actual */}
          <View style={styles.resumenBox}>
            <View style={styles.resumenHeader}>
              <Text style={styles.resumenTitulo}>Resumen del Análisis</Text>
              <View style={styles.resumenIcon}>
                <Text style={styles.resumenIconText}>📊</Text>
              </View>
            </View>
            
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>Unidad:</Text>
              <Text style={styles.infoValue}>{unidad}</Text>
            </View>
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>Puesto:</Text>
              <Text style={styles.infoValue}>{puesto}</Text>
            </View>
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>Subpuesto:</Text>
              <Text style={styles.infoValue}>{subpuesto}</Text>
            </View>
          </View>

          {/* Resultado del diagrama de flujo */}
          <View style={styles.resultadoFlujoBox}>
            <View style={styles.resultadoFlujoHeader}>
              <Text style={styles.resultadoFlujoTitulo}>Resultado del Diagrama de Flujo</Text>
              <TouchableOpacity 
                style={styles.botonGlosario} 
                onPress={() => setShowGlosario((v) => !v)}
                activeOpacity={0.8}
              >
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

          {/* Puntaje y nivel de riesgo */}
          <View style={styles.riesgoBox}>
            <View style={styles.riesgoHeader}>
              <Text style={styles.riesgoTitulo}>Evaluación de Riesgo</Text>
              <View style={styles.riesgoIcon}>
                <Text style={styles.riesgoIconText}>⚠️</Text>
              </View>
            </View>
            
            <View style={styles.riesgoInfo}>
              <View style={styles.riesgoItem}>
                <Text style={styles.riesgoLabel}>Puntaje Total:</Text>
                <Text style={styles.riesgoValue}>{puntaje}/21</Text>
              </View>
              <View style={styles.riesgoItem}>
                <Text style={styles.riesgoLabel}>Nivel de Riesgo:</Text>
                <View style={[styles.nivelRiesgo, { backgroundColor: getNivelRiesgoColor(Array.isArray(nivel) ? nivel[0] : String(nivel || 'Desconocido')) }]}>
                  <Text style={styles.nivelRiesgoTexto}>{Array.isArray(nivel) ? nivel[0] : nivel}</Text>
                </View>
              </View>
            </View>
          </View>

          {/* Historial de análisis */}
          <View style={styles.historialBox}>
            <View style={styles.historialHeader}>
              <Text style={styles.historialTitulo}>Historial de Análisis</Text>
              <Text style={styles.historialCount}>({historial.length} registros)</Text>
            </View>
            
            <ScrollView horizontal showsHorizontalScrollIndicator={false}>
              <View style={styles.tablaContainer}>
                <View style={styles.tablaHeader}>
                  <Text style={styles.tablaHeaderText}>Fecha</Text>
                  <Text style={styles.tablaHeaderText}>Unidad</Text>
                  <Text style={styles.tablaHeaderText}>Puesto</Text>
                  <Text style={styles.tablaHeaderText}>Flujo</Text>
                  <Text style={styles.tablaHeaderText}>Puntaje</Text>
                  <Text style={styles.tablaHeaderText}>Riesgo</Text>
                </View>
                {historial.slice(-5).map((row, idx) => (
                  <View key={idx} style={styles.tablaRow}>
                    <Text style={styles.tablaCell}>{row.fecha.split(' ')[0]}</Text>
                    <Text style={styles.tablaCell}>{row.unidad}</Text>
                    <Text style={styles.tablaCell}>{row.puesto}</Text>
                    <Text style={styles.tablaCell}>{row.flujo}</Text>
                    <Text style={styles.tablaCell}>{row.puntaje}</Text>
                    <Text style={styles.tablaCell}>{row.nivel}</Text>
                  </View>
                ))}
              </View>
            </ScrollView>
          </View>

          {/* Botones de acción */}
          <View style={styles.botonesContainer}>
            <TouchableOpacity 
              style={styles.botonExportar} 
              onPress={exportarExcel}
              activeOpacity={0.8}
            >
              <Text style={styles.botonIcon}>📊</Text>
              <Text style={styles.botonExportarTexto}>Exportar a Excel</Text>
            </TouchableOpacity>
            
            <TouchableOpacity 
              style={styles.botonBorrar} 
              onPress={() => setShowBorrarModal(true)}
              activeOpacity={0.8}
            >
              <Text style={styles.botonIcon}>🗑️</Text>
              <Text style={styles.botonBorrarTexto}>Borrar Historial</Text>
            </TouchableOpacity>
            
            <TouchableOpacity 
              style={styles.botonNuevoAnalisis} 
              onPress={() => {
                if (typeof window !== 'undefined') {
                  window.location.href = '/';
                } else {
                  const { useRouter } = require('expo-router');
                  const router = useRouter();
                  router.replace('/');
                }
              }}
              activeOpacity={0.8}
            >
              <Text style={styles.botonIcon}>🔄</Text>
              <Text style={styles.botonNuevoAnalisisTexto}>Nuevo Análisis</Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
         
         {/* Modal de confirmación para borrar historial */}
         {showBorrarModal && (
           <View style={styles.modalOverlay}>
             <View style={styles.modalContent}>
               <Text style={styles.modalTitle}>Confirmar Borrado</Text>
               <Text style={styles.modalText}>
                 Esta acción eliminará permanentemente todos los datos del historial.
               </Text>
               <Text style={styles.modalText}>
                 Ingresa el código de confirmación: <Text style={styles.codigoText}>123</Text>
               </Text>
               <TextInput
                 style={styles.inputCodigo}
                 value={codigoConfirmacion}
                 onChangeText={setCodigoConfirmacion}
                 placeholder="Ingresa el código"
                 keyboardType="numeric"
                 secureTextEntry={false}
                 maxLength={3}
               />
               <View style={styles.modalButtons}>
                 <TouchableOpacity 
                   style={[styles.modalButton, styles.modalButtonCancelar]} 
                   onPress={() => {
                     setShowBorrarModal(false);
                     setCodigoConfirmacion('');
                   }}
                 >
                   <Text style={styles.modalButtonTexto}>Cancelar</Text>
                 </TouchableOpacity>
                 <TouchableOpacity 
                   style={[styles.modalButton, styles.modalButtonConfirmar]} 
                   onPress={borrarHistorial}
                 >
                   <Text style={styles.modalButtonTexto}>Borrar</Text>
                 </TouchableOpacity>
               </View>
             </View>
           </View>
         )}

        {/* Modal de Ayuda */}
        {showHelpModal && (
          <View style={styles.modalOverlay}>
            <View style={styles.modalContent}>
              <View style={styles.modalHeader}>
                <Text style={styles.modalTitle}>Definiciones</Text>
                <TouchableOpacity 
                  style={styles.modalCloseButton} 
                  onPress={() => setShowHelpModal(false)}
                >
                  <Text style={styles.modalCloseText}>✕</Text>
                </TouchableOpacity>
              </View>
              <ScrollView style={styles.modalScrollView}>
                <View style={styles.definitionItem}>
                  <Text style={styles.definitionTitle}>Bipedestación</Text>
                  <Text style={styles.definitionText}>
                    La postura de pie de las personas trabajadoras.
                  </Text>
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
    backgroundColor: '#00BCD4',
    paddingTop: 50,
    paddingBottom: 20,
    paddingHorizontal: 20,
    borderBottomLeftRadius: 25,
    borderBottomRightRadius: 25,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 8,
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
    backgroundColor: '#fff',
    borderRadius: 20,
    padding: 25,
    marginBottom: 20,
    width: '100%',
    shadowColor: '#003b4c',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.12,
    shadowRadius: 16,
    elevation: 8,
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
    shadowColor: '#00c4cc',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
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
    backgroundColor: '#fff',
    borderRadius: 20,
    padding: 25,
    marginBottom: 20,
    width: '100%',
    shadowColor: '#003b4c',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.12,
    shadowRadius: 16,
    elevation: 8,
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
    shadowColor: '#00c4cc',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 3,
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
    backgroundColor: '#fff',
    borderRadius: 20,
    padding: 25,
    marginBottom: 20,
    width: '100%',
    shadowColor: '#003b4c',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.12,
    shadowRadius: 16,
    elevation: 8,
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
    shadowColor: '#ff9800',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  riesgoIconText: {
    fontSize: 24,
  },
  riesgoInfo: {
    gap: 15,
  },
  riesgoItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
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
  // Historial
  historialBox: {
    backgroundColor: '#fff',
    borderRadius: 20,
    padding: 25,
    marginBottom: 20,
    width: '100%',
    shadowColor: '#003b4c',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.12,
    shadowRadius: 16,
    elevation: 8,
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
    backgroundColor: '#fff',
    borderRadius: 6,
    paddingVertical: 10,
    paddingHorizontal: 8,
    marginBottom: 6,
    borderWidth: 1,
    borderColor: '#f0f0f0',
  },
  tablaCell: {
    fontSize: 11,
    color: '#666',
    flex: 1,
    textAlign: 'center',
    fontWeight: '500',
  },
  // Botones de acción
  botonesContainer: {
    gap: 15,
    width: '100%',
  },
  botonExportar: {
    backgroundColor: '#00c4cc',
    paddingVertical: 18,
    paddingHorizontal: 30,
    borderRadius: 16,
    alignItems: 'center',
    shadowColor: '#00c4cc',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 4,
    flexDirection: 'row',
    justifyContent: 'center',
  },
  botonIcon: {
    fontSize: 20,
    marginRight: 10,
  },
  botonExportarTexto: {
    fontSize: 16,
    color: '#fff',
    fontWeight: 'bold',
  },
  botonBorrar: {
    backgroundColor: '#f44336',
    paddingVertical: 18,
    paddingHorizontal: 30,
    borderRadius: 16,
    alignItems: 'center',
    shadowColor: '#f44336',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 4,
    flexDirection: 'row',
    justifyContent: 'center',
  },
  botonBorrarTexto: {
    fontSize: 16,
    color: '#fff',
    fontWeight: 'bold',
  },
  botonNuevoAnalisis: {
    backgroundColor: '#4caf50',
    paddingVertical: 18,
    paddingHorizontal: 30,
    borderRadius: 16,
    alignItems: 'center',
    shadowColor: '#4caf50',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 4,
    flexDirection: 'row',
    justifyContent: 'center',
  },
  botonNuevoAnalisisTexto: {
    fontSize: 16,
    color: '#fff',
    fontWeight: 'bold',
  },
  // Modal de confirmación
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
    backgroundColor: '#fff',
    borderRadius: 20,
    padding: 30,
    margin: 20,
    width: '90%',
    maxWidth: 400,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.25,
    shadowRadius: 16,
    elevation: 8,
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
  modalText: {
    fontSize: 16,
    color: '#333',
    textAlign: 'center',
    marginBottom: 15,
    lineHeight: 24,
  },
  codigoText: {
    fontWeight: 'bold',
    color: '#f44336',
    fontSize: 20,
  },
  inputCodigo: {
    borderWidth: 2,
    borderColor: '#ddd',
    borderRadius: 12,
    padding: 15,
    fontSize: 18,
    textAlign: 'center',
    marginVertical: 20,
    backgroundColor: '#f9f9f9',
  },
  modalButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 25,
    gap: 15,
  },
  modalButton: {
    flex: 1,
    paddingVertical: 15,
    paddingHorizontal: 20,
    borderRadius: 12,
    alignItems: 'center',
  },
  modalButtonCancelar: {
    backgroundColor: '#6c757d',
  },
  modalButtonConfirmar: {
    backgroundColor: '#f44336',
  },
  modalButtonTexto: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#fff',
  },
  // Botón de ayuda
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
  // Botón de cerrar modal
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
  // Modal de Ayuda
  modalScrollView: {
    maxHeight: 300, // Limit the height of the scroll view
  },
  definitionItem: {
    backgroundColor: '#f0f9eb', // Light green background
    borderRadius: 10,
    padding: 15,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: '#a5d6a7', // Lighter green border
  },
  definitionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#2e7d32', // Darker green
    marginBottom: 5,
  },
  definitionText: {
    fontSize: 14,
    color: '#388e3c', // Darker green text
    lineHeight: 22,
  },
}); 