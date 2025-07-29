import { useState } from 'react';
import { StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { Text, View } from '@/components/Themed';
import { useLocalSearchParams } from 'expo-router';
import { useRouter } from 'expo-router';

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
    setRespuestas((prev) => ({ ...prev, [id]: valor }));
  };

  // Validar si ambas preguntas han sido respondidas
  const puedeContinuar = respuestas[1] !== null && respuestas[2] !== null;
  const [intento, setIntento] = useState(false);

  const handleContinuar = () => {
    setIntento(true);
    if (!puedeContinuar) return;
    router.push({ pathname: '/diagrama-flujo', params: { unidad, puesto, subpuesto, respuestas: JSON.stringify(respuestas) } });
  };

  return (
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
      <TouchableOpacity
        style={[styles.botonContinuar, !puedeContinuar && styles.botonContinuarDeshabilitado]}
        onPress={handleContinuar}
        disabled={!puedeContinuar}
      >
        <Text style={styles.botonContinuarTexto}>Continuar Evaluación</Text>
      </TouchableOpacity>
      {intento && !puedeContinuar && (
        <Text style={styles.mensajeError}>Por favor responde ambas preguntas para continuar.</Text>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
    backgroundColor: '#f7f7f7',
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
  botonContinuar: {
    backgroundColor: '#00c4cc',
    paddingVertical: 16,
    paddingHorizontal: 30,
    borderRadius: 10,
    marginTop: 24,
    width: '100%',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  botonContinuarTexto: {
    fontSize: 18,
    color: '#222',
    fontWeight: '600',
  },
  botonContinuarDeshabilitado: {
    backgroundColor: '#bdbdbd',
  },
  mensajeError: {
    color: '#f44336',
    fontSize: 15,
    marginTop: 10,
    textAlign: 'center',
  },
}); 