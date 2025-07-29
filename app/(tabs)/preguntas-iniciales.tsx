import { useState } from 'react';
import { StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { Text, View } from '@/components/Themed';
import { useLocalSearchParams } from 'expo-router';
import { useRouter } from 'expo-router';
import { AppColors } from '@/constants/Colors';

const PREGUNTAS = [
  {
    id: 1,
    texto: '¿Cuál es el horario del puesto a analizar?',
    opciones: ['8 horas', '10 horas', '12 horas'],
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

  const handleAtras = () => {
    router.push({ pathname: '/seleccion-puesto', params: { unidad, puesto, subpuesto } });
  };

  return (
    <View style={{ flex: 1, backgroundColor: AppColors.background }}>
      {/* Barra superior */}
      <View style={styles.topBar}>
        <Text style={styles.topBarTitle}>Análisis de Riesgo{`\n`}EHS</Text>
        <TouchableOpacity style={styles.topBarButton}>
          <Text style={styles.topBarButtonText}>?</Text>
        </TouchableOpacity>
      </View>
      <ScrollView contentContainerStyle={styles.container}>
        <Text style={styles.title}>Evaluación Inicial</Text>
        <Text style={styles.subtitle}>Por favor responda las siguientes preguntas para determinar si se continúa con el análisis de riesgo.</Text>
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
    shadowColor: '#00c4cc',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.12,
    shadowRadius: 12,
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
    shadowColor: '#00c4cc',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.18,
    shadowRadius: 8,
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
    backgroundColor: AppColors.primary,
    paddingTop: 36,
    paddingBottom: 16,
    paddingHorizontal: 18,
    borderBottomLeftRadius: 18,
    borderBottomRightRadius: 18,
    elevation: 4,
  },
  topBarTitle: {
    color: AppColors.textWhite,
    fontWeight: 'bold',
    fontSize: 18,
    letterSpacing: 1.1,
    flex: 1,
    lineHeight: 22,
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
  info: {
    marginTop: 30,
    fontSize: 14,
    color: AppColors.textMuted,
    textAlign: 'center',
  },
}); 