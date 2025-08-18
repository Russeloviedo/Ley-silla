import { StyleSheet, ScrollView, TouchableOpacity, View, Image } from 'react-native';
import { Text } from '@/components/Themed';
import { useState, useEffect } from 'react';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { AppColors } from '@/constants/Colors';
import AnimatedBackground from '@/components/AnimatedBackground';
import { LinearGradient } from 'expo-linear-gradient';

const PREGUNTAS = [
  {
    id: 1,
    texto: '¿Cuántas son las horas del puesto a analizar?',
    opciones: ['8 horas', '9 horas', '10 horas', '12 horas'],
  },
  {
    id: 2,
    texto: '¿Tiene descansos además de los que se le otorgan para sus comidas?',
    opciones: ['Sí', 'No'],
  },
];

export default function PreguntasInicialesScreen() {
  const { unidad, puesto, subpuesto } = useLocalSearchParams();
  const [respuestas, setRespuestas] = useState<{ [key: number]: string | null }>({ 1: null, 2: null });
  const router = useRouter();
  const [showHelpModal, setShowHelpModal] = useState(false);

  // Limpiar respuestas al montar el componente para asegurar un nuevo análisis
  useEffect(() => {
    console.log('🧹 Limpiando respuestas previas para nuevo análisis...');
    setRespuestas({ 1: null, 2: null });
  }, []);

  const handleRespuesta = (id: number, valor: string) => {
    const nuevasRespuestas = { ...respuestas, [id]: valor };
    setRespuestas(nuevasRespuestas);
    
    // Verificar si ambas preguntas han sido respondidas
    const todasRespondidas = nuevasRespuestas[1] !== null && nuevasRespuestas[2] !== null;
    
    // Navegar automáticamente si ambas preguntas están respondidas
    if (todasRespondidas) {
      router.push({ 
        pathname: '/diagrama-flujo', 
        params: { 
          unidad, 
          puesto, 
          subpuesto, 
          respuestas: JSON.stringify(nuevasRespuestas) 
        } 
      });
    }
  };



  const handleInicio = () => {
    router.replace('/');
  };

  const handleAnalisis = () => {
    router.push({ pathname: '/resultados-finales' });
  };

  const handleBaseDatos = () => {
            router.push({ pathname: '/nueva-base-datos' });
  };

  const handleAtras = () => {
    router.push({ pathname: '/seleccion-puesto', params: { unidad, puesto, subpuesto } });
  };

  const handleHelp = () => {
    setShowHelpModal(true);
  };

  return (
    <>
      <AnimatedBackground>
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
              resizeMode="contain"
            />
            <Text style={styles.topBarTitle}>Identificación de Posible{`\n`}Riesgo de Bipedestación</Text>
          </View>
          <TouchableOpacity style={styles.topBarButton} onPress={handleHelp}>
            <Text style={styles.topBarButtonText}>?</Text>
          </TouchableOpacity>
        </LinearGradient>
        <ScrollView contentContainerStyle={styles.container}>
          <Text style={styles.title}>Evaluación Inicial</Text>
          <Text style={styles.subtitle}>Por favor responda las siguientes preguntas para determinar si se continúa con la identificación de posible riesgo de bipedestación.</Text>
        {PREGUNTAS.map((pregunta) => (
          <View key={pregunta.id} style={styles.preguntaBox}>
            <View style={styles.numeroPreguntaBox}>
              <Text style={styles.numeroPregunta}>{`Pregunta ${pregunta.id}`}</Text>
            </View>
            <Text style={styles.preguntaTexto}>{pregunta.texto}</Text>
            <View style={styles.opciones}>
              {pregunta.opciones.map((opcion) => (
                <TouchableOpacity
                  key={opcion}
                  style={[styles.opcion, respuestas[pregunta.id] === opcion && styles.opcionSeleccionada]}
                  onPress={() => handleRespuesta(pregunta.id, opcion)}
                  activeOpacity={0.85}
                >
                  <Text style={styles.opcionTexto}>{opcion}</Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>
        ))}
        <Text style={styles.info}>Responda ambas preguntas para continuar automáticamente</Text>
        </ScrollView>
      </AnimatedBackground>

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
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
    backgroundColor: AppColors.background,
  },
  title: {
    fontSize: 22,
    fontWeight: 'bold',
    marginBottom: 10,
    color: '#222',
  },
  subtitle: {
    fontSize: 16,
    marginBottom: 20,
    color: '#444',
    textAlign: 'center',
  },
  preguntaBox: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 24,
    marginBottom: 32,
    width: '100%',
    maxWidth: 420,
    boxShadow: '0px 4px 12px rgba(0, 196, 204, 0.12)',
    elevation: 4,
    alignItems: 'center',
    alignSelf: 'center',
  },
  numeroPreguntaBox: {
    backgroundColor: '#00c4cc',
    borderRadius: 50,
    paddingHorizontal: 18,
    paddingVertical: 6,
    marginBottom: 12,
    alignSelf: 'center',
  },
  numeroPregunta: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 18,
    letterSpacing: 1.2,
  },
  preguntaTexto: {
    fontSize: 19,
    color: '#222',
    textAlign: 'center',
    fontWeight: '500',
    marginBottom: 0,
  },
  opciones: {
    flexDirection: 'row',
    justifyContent: 'center',
    flexWrap: 'wrap',
    gap: 12,
    marginBottom: 10,
  },
  opcion: {
    backgroundColor: '#00c4cc',
    paddingVertical: 14,
    paddingHorizontal: 18,
    borderRadius: 14,
    marginHorizontal: 4,
    marginVertical: 4,
    alignItems: 'center',
    boxShadow: '0px 2px 8px rgba(0, 196, 204, 0.18)',
    elevation: 3,
  },
  opcionSeleccionada: {
    backgroundColor: '#b6e600',
  },
  opcionTexto: {
    fontSize: 18,
    color: '#222',
    fontWeight: '700',
    letterSpacing: 1.1,
  },
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
  info: {
    marginTop: 30,
    fontSize: 14,
    color: AppColors.textMuted,
    textAlign: 'center',
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
    boxShadow: '0px 8px 16px rgba(0, 0, 0, 0.25)',
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