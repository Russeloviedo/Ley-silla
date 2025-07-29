import { useState } from 'react';
import { StyleSheet, View, TouchableOpacity, ScrollView, Image } from 'react-native';
import { Text } from '@/components/Themed';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { AppColors } from '@/constants/Colors';
import AnimatedBackground from '@/components/AnimatedBackground';

const FLUJO = [
  {
    id: 1,
    texto: '¿En el centro de trabajo hay personas trabajadoras que realizan sus actividades en bipedestación dinámica y/o estática?',
    si: 2,
    no: 'NO_DECRETO',
  },
  {
    id: 2,
    texto: '¿La bipedestación es prolongada?',
    si: 3,
    no: 'NO_DECRETO',
  },
  {
    id: 3,
    texto: '¿La persona trabajadora puede realizar sus actividades sentada?',
    si: 4,
    no: 5,
  },
  {
    id: 4,
    texto: '¿En su lugar de trabajo existe el espacio para colocar un asiento o silla con respaldo?',
    si: 'SILLA_CARACTERISTICAS',
    no: 'SILLA_DETERMINADO',
  },
  {
    id: 5,
    texto: '¿La persona trabajadora requiere estar cerca de su lugar de trabajo?',
    si: 'SILLA_CERCA',
    no: 'SILLA_DETERMINADO',
  },
];

const RECOMENDACIONES = {
  NO_DECRETO: 'No aplica el Decreto',
  SILLA_DETERMINADO: 'Se debe proporcionar el asiento o silla con respaldo a la persona trabajadora en un lugar determinado dentro del centro de trabajo.',
  SILLA_CERCA: 'Se debe proporcionar el asiento o silla con respaldo a la persona trabajadora en un lugar cercano a su lugar de trabajo.',
  SILLA_CARACTERISTICAS: 'Se debe proporcionar el asiento o silla con respaldo a la persona trabajadora con las características determinadas para su espacio de trabajo.',
};

export default function DiagramaFlujoScreen() {
  const { unidad, puesto, subpuesto, respuestas } = useLocalSearchParams();
  const [paso, setPaso] = useState(1);
  const [final, setFinal] = useState<string | null>(null);
  const [historial, setHistorial] = useState<number[]>([]);
  const [respuestasFlujo, setRespuestasFlujo] = useState<{ [key: number]: string }>({});
  const router = useRouter();
  const [showHelpModal, setShowHelpModal] = useState(false);

  const handleRespuesta = (valor: 'si' | 'no') => {
    const actual = FLUJO.find((p) => p.id === paso);
    if (!actual) return;
    
    // Guardar la respuesta del flujo
    setRespuestasFlujo(prev => ({ ...prev, [paso]: valor === 'si' ? 'Sí' : 'No' }));
    
    const next = actual[valor];
    if (typeof next === 'number') {
      setHistorial((prev) => [...prev, paso]);
      setPaso(next);
    } else {
      setHistorial((prev) => [...prev, paso]);
      setFinal(next);
    }
  };

  const handleVolver = () => {
    if (historial.length > 0) {
      const prev = [...historial];
      const anterior = prev.pop();
      setHistorial(prev);
      setFinal(null);
      if (anterior) setPaso(anterior);
    }
  };

  const handleContinuar = () => {
    router.push({ 
      pathname: '/cuestionario-ponderacion', 
      params: { 
        unidad, 
        puesto, 
        subpuesto, 
        flujo: final, 
        respuestas,
        respuestasFlujo: JSON.stringify(respuestasFlujo)
      } 
    });
  };

  const handleInicio = () => {
    router.replace('/');
  };

  const handleAnalisis = () => {
    router.push({ pathname: '/resultados-finales' });
  };

  const handleAtras = () => {
    router.push({ pathname: '/preguntas-iniciales', params: { unidad, puesto, subpuesto } });
  };

  const handleHelp = () => {
    setShowHelpModal(true);
  };

  if (final) {
    return (
      <AnimatedBackground>
        <View style={styles.container}>
          {/* Barra superior */}
          <View style={styles.topBar}>
            <View style={styles.topBarContent}>
              <Image 
                source={require('@/assets/images/logo-ehs.png')} 
                style={styles.logoImage}
                resizeMode="contain"
              />
              <Text style={styles.topBarTitle}>Identificación de Posible{`\n`}Riesgo de Bipedestación</Text>
            </View>
            <TouchableOpacity style={styles.topBarButton} onPress={handleHelp}>
              <Text style={styles.topBarButtonText}>?</Text>
            </TouchableOpacity>
          </View>

          {/* Contenido del resultado */}
          <View style={styles.content}>
            <View style={styles.resultadoBox}>
              <View style={styles.resultadoIcon}>
                <Text style={styles.resultadoIconText}>
                  {final === 'NO_DECRETO' ? '📋' : '✅'}
                </Text>
              </View>
              <Text style={styles.resultadoTitulo}>
                {final === 'NO_DECRETO' ? 'No Aplica Decreto' : 'Recomendación'}
              </Text>
              <Text style={styles.resultado}>{RECOMENDACIONES[final as keyof typeof RECOMENDACIONES]}</Text>
            </View>

            <TouchableOpacity 
              style={styles.botonContinuar} 
              onPress={handleContinuar}
              activeOpacity={0.8}
            >
              <Text style={styles.botonContinuarIcon}>📊</Text>
              <Text style={styles.botonContinuarTexto}>
                {final === 'NO_DECRETO' 
                  ? 'Realizar Cuestionario de Ponderación' 
                  : 'Ir al Cuestionario de Ponderación'
                }
              </Text>
            </TouchableOpacity>
          </View>
          {/* Barra inferior */}
          <View style={styles.bottomBar}>
            <TouchableOpacity 
              style={styles.bottomBarItem} 
              onPress={handleAtras}
              activeOpacity={0.7}
            >
              <Text style={styles.bottomBarIcon}>⬅️</Text>
              <Text style={styles.bottomBarLabel}>Atrás</Text>
            </TouchableOpacity>
            <TouchableOpacity 
              style={styles.bottomBarItem} 
              onPress={handleInicio}
              activeOpacity={0.7}
            >
              <Text style={styles.bottomBarIcon}>🏠</Text>
              <Text style={styles.bottomBarLabel}>Inicio</Text>
            </TouchableOpacity>
            <TouchableOpacity 
              style={styles.bottomBarItem} 
              onPress={handleAnalisis}
              activeOpacity={0.7}
            >
              <Text style={styles.bottomBarIcon}>📋</Text>
              <Text style={styles.bottomBarLabel}>Análisis</Text>
            </TouchableOpacity>
          </View>
        </View>
      </AnimatedBackground>
    );
  }

  const actual = FLUJO.find((p) => p.id === paso);
  if (!actual) return null;

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
            <Text style={styles.topBarTitle}>Identificación de Posible{`\n`}Riesgo de Bipedestación</Text>
          </View>
          <TouchableOpacity style={styles.topBarButton} onPress={handleHelp}>
            <Text style={styles.topBarButtonText}>?</Text>
          </TouchableOpacity>
        </View>

        {/* Contenido principal */}
        <View style={styles.content}>
          <View style={styles.preguntaBox}>
            <View style={styles.numeroPreguntaBox}>
              <Text style={styles.numeroPregunta}>{paso}</Text>
            </View>
            <Text style={styles.preguntaTexto}>{actual.texto}</Text>
          </View>

          {/* Botones de respuesta */}
          <View style={styles.opciones}>
            <TouchableOpacity 
              style={[styles.boton, styles.botonSi]} 
              onPress={() => handleRespuesta('si')} 
              activeOpacity={0.8}
            >
              <Text style={styles.botonIcon}>✅</Text>
              <Text style={styles.botonTexto}>Sí</Text>
            </TouchableOpacity>
            
            <TouchableOpacity 
              style={[styles.boton, styles.botonNo]} 
              onPress={() => handleRespuesta('no')} 
              activeOpacity={0.8}
            >
              <Text style={styles.botonIcon}>❌</Text>
              <Text style={styles.botonTexto}>No</Text>
            </TouchableOpacity>
          </View>

          {/* Botón volver */}
          {historial.length > 0 && (
            <TouchableOpacity style={styles.botonVolver} onPress={handleVolver}>
              <Text style={styles.botonVolverIcon}>⬅️</Text>
              <Text style={styles.botonVolverTexto}>Volver</Text>
            </TouchableOpacity>
          )}
        </View>
        {/* Barra inferior */}
        <View style={styles.bottomBar}>
          <TouchableOpacity 
            style={styles.bottomBarItem} 
            onPress={handleAtras}
            activeOpacity={0.7}
          >
            <Text style={styles.bottomBarIcon}>⬅️</Text>
            <Text style={styles.bottomBarLabel}>Atrás</Text>
          </TouchableOpacity>
          <TouchableOpacity 
            style={styles.bottomBarItem} 
            onPress={handleInicio}
            activeOpacity={0.7}
          >
            <Text style={styles.bottomBarIcon}>🏠</Text>
            <Text style={styles.bottomBarLabel}>Inicio</Text>
          </TouchableOpacity>
          <TouchableOpacity 
            style={styles.bottomBarItem} 
            onPress={handleAnalisis}
            activeOpacity={0.7}
          >
            <Text style={styles.bottomBarIcon}>📋</Text>
            <Text style={styles.bottomBarLabel}>Análisis</Text>
          </TouchableOpacity>
        </View>

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
    fontSize: 16,
    fontWeight: 'bold',
    color: '#fff',
    textAlign: 'left',
    flex: 1,
    lineHeight: 20,
  },

  // Contenido principal
  content: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
  },
  // Tarjeta de pregunta
  preguntaBox: {
    backgroundColor: '#fff',
    borderRadius: 20,
    padding: 30,
    marginBottom: 40,
    width: '100%',
    maxWidth: 400,
    shadowColor: '#003b4c',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.12,
    shadowRadius: 16,
    elevation: 8,
    alignItems: 'center',
  },
  numeroPreguntaBox: {
    backgroundColor: '#00c4cc',
    borderRadius: 60,
    width: 60,
    height: 60,
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
  },
  // Botones de respuesta
  opciones: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 20,
    marginBottom: 30,
  },
  boton: {
    minWidth: 140,
    backgroundColor: '#fff',
    paddingVertical: 20,
    paddingHorizontal: 30,
    borderRadius: 16,
    alignItems: 'center',
    shadowColor: '#003b4c',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
    borderWidth: 2,
    borderColor: 'transparent',
  },
  botonSi: {
    backgroundColor: '#4caf50',
    borderColor: '#4caf50',
  },
  botonNo: {
    backgroundColor: '#f44336',
    borderColor: '#f44336',
  },
  botonIcon: {
    fontSize: 24,
    marginBottom: 8,
  },
  botonTexto: {
    fontSize: 18,
    color: '#fff',
    fontWeight: 'bold',
    letterSpacing: 1.1,
  },
  // Botón volver
  botonVolver: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#6c757d',
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  botonVolverIcon: {
    fontSize: 16,
    marginRight: 8,
  },
  botonVolverTexto: {
    fontSize: 16,
    color: '#fff',
    fontWeight: '600',
  },
  // Estilos para el resultado final
  resultadoBox: {
    backgroundColor: '#fff',
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
  },
  resultadoIcon: {
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
  resultadoIconText: {
    fontSize: 32,
  },
  resultadoTitulo: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#003b4c',
    textAlign: 'center',
    marginBottom: 15,
  },
  resultado: {
    fontSize: 16,
    color: '#444',
    textAlign: 'center',
    lineHeight: 24,
    fontWeight: '500',
  },
  botonContinuar: {
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
  },
  botonContinuarIcon: {
    fontSize: 20,
    marginRight: 10,
  },
  botonContinuarTexto: {
    fontSize: 16,
    color: '#fff',
    fontWeight: 'bold',
  },
  // Barra inferior
  bottomBar: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    backgroundColor: AppColors.background,
    borderTopLeftRadius: 18,
    borderTopRightRadius: 18,
    paddingVertical: 10,
    elevation: 8,
    shadowColor: AppColors.shadowColorDark,
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.08,
    shadowRadius: 6,
  },
  bottomBarItem: {
    alignItems: 'center',
    flex: 1,
  },
  bottomBarIcon: {
    fontSize: 22,
    marginBottom: 2,
  },
  bottomBarLabel: {
    fontSize: 13,
    color: AppColors.primary,
    fontWeight: '600',
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
    backgroundColor: '#fff',
    borderRadius: 20,
    padding: 20,
    margin: 20,
    width: '90%',
    maxWidth: 400,
    maxHeight: '80%',
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