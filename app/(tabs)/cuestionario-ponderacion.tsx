// app/CuestionarioPonderacionScreen.tsx
import { StyleSheet, ScrollView, TouchableOpacity, View, Alert, Image } from 'react-native';
import { Text } from '@/components/Themed';
import { useState, useEffect } from 'react';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { AppColors } from '@/constants/Colors';
import { RespuestasPonderacion, ResultadoNivelRiesgo } from '@/types';
import { validatePonderacionResponses } from '@/utils/errorHandler';
import AnimatedBackground from '@/components/AnimatedBackground';
import { LinearGradient } from 'expo-linear-gradient';

const PONDERACION = [
  {
    id: 1,
    texto: 'Tiempo que la persona trabajadora permanece de pie (sin descanso en posición sedente)',
    opciones: [
      { texto: 'Menor o igual a 30 minutos', puntos: 1 },
      { texto: 'Mayor a 30 minutos y menor o igual a 1 hora', puntos: 2 },
      { texto: 'Mayor a 1 hora', puntos: 3 },
    ],
  },
  {
    id: 2,
    texto: 'Posibilidad de cambiar de postura',
    opciones: [
      { texto: 'Sí, con frecuencia', puntos: 1 },
      { texto: 'Algunas veces', puntos: 2 },
      { texto: 'No puede cambiar de postura', puntos: 3 },
    ],
  },
  {
    id: 3,
    texto: 'Tipo de superficie de trabajo',
    opciones: [
      { texto: 'Piso con recubrimiento blando que amortigua (tapete, alfombra o materiales blandos antifatiga)', puntos: 1 },
      { texto: 'Piso firme pero no duro (ejemplo: madera, duela o hule)', puntos: 2 },
      { texto: 'Piso duro sin recubrimiento (concreto, cerámica, etc.)', puntos: 3 },
    ],
  },
  {
    id: 4,
    texto: 'Características del calzado utilizado',
    opciones: [
      { texto: 'Ergonómico, con buen soporte y amortiguación', puntos: 1 },
      { texto: 'Aceptable, pero no específico', puntos: 2 },
      { texto: 'Inadecuado (duro, sin soporte, inseguro)', puntos: 3 },
    ],
  },
  {
    id: 5,
    texto: 'Espacio disponible para moverse',
    opciones: [
      { texto: 'Amplio y permite libre movimiento o desplazamientos amplios', puntos: 1 },
      { texto: 'Limitado pero sin obstáculos, permite movimientos o desplazamientos cortos', puntos: 2 },
      { texto: 'Muy reducido, con restricción de movimientos o desplazamientos nulos', puntos: 3 },
    ],
  },
  {
    id: 6,
    texto: 'Malestares reportados por la persona trabajadora',
    opciones: [
      { texto: 'Ninguno', puntos: 1 },
      { texto: 'Eventual fatiga en extremidades inferiores; dolor o pesadez ocasional en piernas y/o espalda', puntos: 2 },
      { texto: 'Dolor lumbar frecuente, hinchazón y/o calambres', puntos: 3 },
    ],
  },
  {
    id: 7,
    texto: 'Pausas, tareas alternas o complementarias (sin comprometer la actividad)',
    opciones: [
      { texto: 'Pausas planeadas por tiempos regulares', puntos: 1 },
      { texto: 'Permite algunas pausas no programadas (informales)', puntos: 2 },
      { texto: 'No tiene pausas o no puede sentarse en ningún momento', puntos: 3 },
    ],
  },
];

function getNivelRiesgo(puntaje: number): ResultadoNivelRiesgo {
  const fecha = new Date().toLocaleDateString('es-ES');
  if (puntaje === 7) return { nivel: 'Bajo', puntuacion: puntaje, fecha, color: AppColors.riskLow };
  if (puntaje >= 8 && puntaje <= 14) return { nivel: 'Medio', puntuacion: puntaje, fecha, color: AppColors.riskMedium };
  if (puntaje >= 15) return { nivel: 'Alto', puntuacion: puntaje, fecha, color: AppColors.riskHigh };
  return { nivel: 'Bajo', puntuacion: puntaje, fecha, color: AppColors.riskLow };
}

export default function CuestionarioPonderacionScreen() {
  const { unidad, puesto, subpuesto, flujo, respuestas, respuestasFlujo } = useLocalSearchParams();

  useEffect(() => {
    console.log('🧹 Limpiando respuestas de ponderación previas para nuevo análisis...');
  }, []);

  const [respuestasPonderacion, setRespuestasPonderacion] = useState<RespuestasPonderacion>({
    1: null, 2: null, 3: null, 4: null, 5: null, 6: null, 7: null
  });
  const router = useRouter();
  const [showHelpModal, setShowHelpModal] = useState(false);

  useEffect(() => {
    console.log('🧹 Limpiando respuestas de ponderación para nuevo análisis...');
    setRespuestasPonderacion({ 1: null, 2: null, 3: null, 4: null, 5: null, 6: null, 7: null });
  }, []);

  const handleRespuesta = (id: number, puntos: number) => {
    setRespuestasPonderacion((prev) => ({ ...prev, [id]: puntos }));
  };

  const puntajeTotal = Object.values(respuestasPonderacion).reduce(
    (acc: number, val) => acc + (typeof val === 'number' ? val : 0), 0
  );
  const nivel = getNivelRiesgo(puntajeTotal);

  const handleFinalizar = () => {
    console.log('Intentando finalizar con respuestas:', respuestasPonderacion);

    if (!validatePonderacionResponses(respuestasPonderacion)) {
      console.warn('No todas las preguntas han sido respondidas');
      Alert.alert(
        'Preguntas incompletas',
        'Por favor responde todas las preguntas antes de continuar.',
        [{ text: 'OK', style: 'default' }]
      );
      return;
    }

    const params = {
      unidad,
      puesto,
      subpuesto,
      flujo,
      puntaje: puntajeTotal,
      nivel: nivel.nivel,
      respuestas,
      respuestasPonderacion: JSON.stringify(respuestasPonderacion),
      respuestasFlujo,
    };

    console.log('Navegando a resultados con params:', params);
    console.log('🔍 Flujo recibido en cuestionario:', flujo);
    console.log('🔍 Tipo de flujo:', typeof flujo);
    console.log('🔍 Flujo es array?', Array.isArray(flujo));
    if (Array.isArray(flujo)) console.log('🔍 Elementos del array flujo:', flujo);

    console.log('🚨 DEBUG CUESTIONARIO PONDERACIÓN:', {
      flujoRecibido: flujo,
      tipoFlujo: typeof flujo,
      esArray: Array.isArray(flujo),
      valorFinal: Array.isArray(flujo) ? flujo[0] : flujo,
      esNoDecreto: Array.isArray(flujo) ? flujo[0] === 'NO_DECRETO' : flujo === 'NO_DECRETO'
    });

    try {
      router.push({ pathname: '/resultados-finales', params });
    } catch (error) {
      console.error('Error al navegar:', error);
      Alert.alert(
        'Error de navegación',
        'No se pudo abrir la página de resultados. Inténtalo de nuevo.',
        [{ text: 'OK', style: 'default' }]
      );
    }
  };

  const handleInicio = () => router.replace('/');

  const handleBaseDatos = () => {
    router.push({ pathname: '/nueva-base-datos' });
  };

  const handleAtras = () => {
    router.push({ pathname: '/diagrama-flujo', params: { unidad, puesto, subpuesto, respuestas } });
  };

  const handleHelp = () => setShowHelpModal(true);

  return (
    <AnimatedBackground>
      <View style={styles.container}>
        {/* Barra superior con información */}
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
            <Text style={styles.topBarTitle}>Identificación de Posible{`\n`}Riesgo de Bipedestación</Text>
          </View>
          <TouchableOpacity style={styles.topBarButton} onPress={handleHelp}>
            <Text style={styles.topBarButtonText}>?</Text>
          </TouchableOpacity>
        </LinearGradient>

        {/* Contenido principal */}
        <ScrollView style={styles.scrollView} contentContainerStyle={styles.scrollContent}>
          {PONDERACION.map((pregunta) => (
            <View key={pregunta.id} style={styles.preguntaBox}>
              <View style={styles.numeroPreguntaBox}>
                <Text style={styles.numeroPregunta}>{pregunta.id}</Text>
              </View>
              <Text style={styles.preguntaTexto}>{pregunta.texto}</Text>

              <View style={styles.opcionesContainer}>
                {pregunta.opciones.map((op, idx) => (
                  <TouchableOpacity
                    key={idx}
                    style={[
                      styles.opcion,
                      respuestasPonderacion[pregunta.id] === op.puntos && styles.opcionSeleccionada
                    ]}
                    onPress={() => handleRespuesta(pregunta.id, op.puntos)}
                    activeOpacity={0.8}
                  >
                    <View style={styles.opcionContent}>
                      <Text style={styles.opcionPuntos}>{op.puntos} pt</Text>
                      <Text style={styles.opcionTexto}>{op.texto}</Text>
                    </View>
                    {respuestasPonderacion[pregunta.id] === op.puntos && (
                      <Text style={styles.opcionCheck}>✅</Text>
                    )}
                  </TouchableOpacity>
                ))}
              </View>
            </View>
          ))}

          {/* Resultado actual */}
          <View style={styles.resultadoBox}>
            <View style={styles.resultadoHeader}>
              <Text style={styles.resultadoTitulo}>Resultado Actual</Text>
              <View style={[styles.nivelRiesgo, { backgroundColor: nivel.color }]}>
                <Text style={styles.nivelRiesgoTexto}>{nivel.nivel}</Text>
              </View>
            </View>
            <Text style={styles.puntajeTexto}>Puntaje: {puntajeTotal}/21</Text>
          </View>

          {/* Botón finalizar */}
          <TouchableOpacity
            style={[
              styles.botonFinalizar,
              Object.values(respuestasPonderacion).filter(val => val !== 0).length !== 7 && styles.botonFinalizarDeshabilitado
            ]}
            onPress={handleFinalizar}
            disabled={Object.values(respuestasPonderacion).filter(val => val !== 0).length !== 7}
            activeOpacity={0.8}
          >
            <Text style={styles.botonFinalizarIcon}>📊</Text>
            <Text style={styles.botonFinalizarTexto}>Ver Resultados Finales</Text>
          </TouchableOpacity>
        </ScrollView>

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
    paddingTop: 36,
    paddingBottom: 16,
    paddingHorizontal: 18,
    borderBottomLeftRadius: 18,
    borderBottomRightRadius: 18,
    elevation: 4,
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
  topBarTitle: {
    color: AppColors.textWhite,
    fontWeight: 'bold',
    fontSize: 16,
    letterSpacing: 1.1,
    flex: 1,
    lineHeight: 20,
  },
  // Scroll view
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: 20,
    paddingBottom: 40,
  },
  // Tarjeta de pregunta
  preguntaBox: {
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 20,
    padding: 30,
    marginBottom: 30,
    width: '100%',
    shadowColor: '#003b4c',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.12,
    shadowRadius: 16,
    elevation: 8,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.2)',
  },
  numeroPreguntaBox: {
    backgroundColor: '#00c4cc',
    borderRadius: 60,
    width: 80,
    height: 80,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 20,
    shadowColor: '#00c4cc',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  numeroPregunta: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 24,
    letterSpacing: 1.2,
  },
  preguntaTexto: {
    fontSize: 20,
    color: '#222',
    textAlign: 'center',
    fontWeight: '600',
    lineHeight: 28,
    marginBottom: 25,
  },
  opcionesContainer: {
    width: '100%',
  },
  opcion: {
    backgroundColor: 'rgba(255, 255, 255, 0.15)',
    paddingVertical: 18,
    paddingHorizontal: 24,
    borderRadius: 16,
    borderWidth: 2,
    borderColor: 'rgba(255, 255, 255, 0.3)',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    elevation: 4,
    minWidth: 140,
    marginBottom: 15, // reemplaza "gap"
  },
  opcionSeleccionada: {
    backgroundColor: 'rgba(0, 196, 204, 0.3)',
    borderColor: '#00c4cc',
    shadowColor: '#00c4cc',
    shadowOpacity: 0.2,
    borderWidth: 3,
  },
  opcionContent: {
    flex: 1,
  },
  opcionPuntos: {
    fontSize: 16,
    color: '#00c4cc',
    fontWeight: 'bold',
    marginBottom: 6,
  },
  opcionTexto: {
    fontSize: 16,
    color: '#333',
    fontWeight: '500',
    lineHeight: 24,
  },
  opcionCheck: {
    fontSize: 24,
    marginLeft: 15,
  },
  // Resultado actual
  resultadoBox: {
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 20,
    padding: 30,
    marginBottom: 30,
    width: '100%',
    maxWidth: 400,
    shadowColor: '#003b4c',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.12,
    shadowRadius: 16,
    elevation: 8,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.2)',
  },
  resultadoHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    width: '100%',
    marginBottom: 15,
  },
  resultadoTitulo: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#003b4c',
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
  puntajeTexto: {
    fontSize: 18,
    color: '#666',
    fontWeight: '600',
  },
  // Botón finalizar
  botonFinalizar: {
    backgroundColor: '#b80404',
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
    width: '100%',
    justifyContent: 'center',
  },
  botonFinalizarIcon: {
    fontSize: 20,
    marginRight: 10,
  },
  botonFinalizarTexto: {
    fontSize: 16,
    color: '#fff',
    fontWeight: 'bold',
  },
  botonFinalizarDeshabilitado: {
    backgroundColor: '#ccc',
    shadowOpacity: 0,
    elevation: 0,
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
  // Estilos del modal de ayuda
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
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    borderRadius: 20,
    padding: 20,
    margin: 20,
    width: '90%',
    maxWidth: 400,
    maxHeight: '80%',
    elevation: 12,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.4)',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
    paddingBottom: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  modalTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    color: AppColors.primary,
  },
  modalCloseButton: {
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: '#f0f0f0',
    alignItems: 'center',
    justifyContent: 'center',
  },
  modalCloseText: {
    fontSize: 18,
    color: '#666',
    fontWeight: 'bold',
  },
  modalScrollView: {
    flex: 1,
  },
  definitionItem: {
    marginBottom: 20,
    paddingBottom: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  definitionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: AppColors.primary,
    marginBottom: 8,
  },
  definitionText: {
    fontSize: 14,
    color: '#333',
    lineHeight: 20,
    textAlign: 'justify',
  },
});
