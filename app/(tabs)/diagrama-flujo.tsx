import { useState } from 'react';
import { StyleSheet, View, TouchableOpacity } from 'react-native';
import { Text } from '@/components/Themed';
import { useLocalSearchParams, useRouter } from 'expo-router';

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

  if (final) {
    return (
      <View style={styles.container}>
        {/* Barra superior */}
        <View style={styles.topBar}>
          <View style={styles.topBarInfo}>
            <Text style={styles.topBarTitle}>Resultado del Análisis</Text>
            <Text style={styles.topBarSubtitle}>{unidad} • {puesto}</Text>
          </View>
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
      </View>
    );
  }

  const actual = FLUJO.find((p) => p.id === paso);
  if (!actual) return null;

  return (
    <View style={styles.container}>
      {/* Barra superior con información */}
      <View style={styles.topBar}>
        <View style={styles.topBarInfo}>
          <Text style={styles.topBarTitle}>Diagrama de Flujo</Text>
          <Text style={styles.topBarSubtitle}>{unidad} • {puesto}</Text>
        </View>
        <View style={styles.progressContainer}>
          <Text style={styles.progressText}>{paso}/{FLUJO.length}</Text>
          <View style={styles.progressBar}>
            <View style={[styles.progressFill, { width: `${(paso / FLUJO.length) * 100}%` }]} />
          </View>
        </View>
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
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f7f7f7',
  },
  // Barra superior
  topBar: {
    backgroundColor: '#003b4c',
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
  topBarInfo: {
    marginBottom: 15,
  },
  topBarTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#fff',
    textAlign: 'center',
    marginBottom: 5,
  },
  topBarSubtitle: {
    fontSize: 14,
    color: '#b6e600',
    textAlign: 'center',
    fontWeight: '500',
  },
  progressContainer: {
    alignItems: 'center',
  },
  progressText: {
    fontSize: 14,
    color: '#fff',
    marginBottom: 8,
    fontWeight: '600',
  },
  progressBar: {
    width: '100%',
    height: 6,
    backgroundColor: 'rgba(255,255,255,0.3)',
    borderRadius: 3,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    backgroundColor: '#b6e600',
    borderRadius: 3,
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
}); 