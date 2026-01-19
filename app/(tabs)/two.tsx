import { StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { Text, View } from '@/components/Themed';
import { useLocalSearchParams } from 'expo-router';
import { useRouter } from 'expo-router';

const PUESTOS_GENERICOS = [
  'Operador de Maquinaria',
  'Supervisor de Línea',
  'Técnico de Mantenimiento',
  'Inspector de Calidad',
  'Almacenista',
  'Administrativo',
  'Jefe de Turno',
  'Auxiliar de Producción',
];

export default function SeleccionPuestoScreen() {
  const { unidad } = useLocalSearchParams();
  const router = useRouter();

  const handleSeleccion = (puesto: string) => {
    router.push({ pathname: '/two', params: { unidad, puesto } });
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.title}>Selección de Puesto de Trabajo</Text>
      <Text style={styles.subtitle}>Unidad de Negocio Seleccionada:</Text>
      <Text style={styles.selected}>{unidad}</Text>
      <Text style={styles.subtitle}>Seleccione el puesto de trabajo:</Text>
      {PUESTOS_GENERICOS.map((puesto) => (
        <TouchableOpacity
          key={puesto}
          style={styles.button}
          onPress={() => handleSeleccion(puesto)}
        >
          <Text style={styles.buttonText}>{puesto}</Text>
        </TouchableOpacity>
      ))}
              <Text style={styles.info}>Seleccione un puesto de trabajo para continuar con la identificación de posible riesgo de bipedestación</Text>
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
    marginBottom: 8,
    color: '#444',
    textAlign: 'center',
  },
  selected: {
    fontSize: 18,
    fontWeight: '600',
    color: '#00c4cc',
    backgroundColor: '#222',
    padding: 8,
    borderRadius: 8,
    marginBottom: 16,
    textAlign: 'center',
  },
  button: {
    backgroundColor: '#00c4cc',
    paddingVertical: 16,
    paddingHorizontal: 30,
    borderRadius: 10,
    marginVertical: 8,
    width: '100%',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  buttonText: {
    fontSize: 18,
    color: '#222',
    fontWeight: '600',
  },
  info: {
    marginTop: 30,
    fontSize: 14,
    color: '#888',
    textAlign: 'center',
  },
});
