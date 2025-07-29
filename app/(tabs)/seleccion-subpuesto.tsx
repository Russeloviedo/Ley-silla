import { StyleSheet, ScrollView, TouchableOpacity, Image } from 'react-native';
import { Text, View } from '@/components/Themed';
import { useLocalSearchParams } from 'expo-router';
import { useRouter } from 'expo-router';
import { useState } from 'react';
import { AppColors } from '@/constants/Colors';
import AnimatedBackground from '@/components/AnimatedBackground';

const SUBPUESTOS_GENERICOS = [
  { key: 'Operador de Excavadora', icon: '🚜' },
  { key: 'Operador de Grúa', icon: '🏗️' },
  { key: 'Operador de Bulldozer', icon: '🚧' },
  { key: 'Operador de Cargador Frontal', icon: '🚚' },
  { key: 'Operador de Retroexcavadora', icon: '⛏️' },
];

export default function SeleccionSubpuestoScreen() {
  const { unidad, puesto } = useLocalSearchParams();
  const router = useRouter();
  const [seleccion, setSeleccion] = useState<string | null>(null);

  const handleSeleccion = (subpuesto: string) => {
    setSeleccion(subpuesto);
    // Navegar automáticamente a la siguiente pantalla
    router.push({ pathname: '/preguntas-iniciales', params: { unidad, puesto, subpuesto } });
  };

  const handleInicio = () => {
    router.replace('/');
  };

  const handleAnalisis = () => {
    router.push({ pathname: '/resultados-finales' });
  };

  return (
    <AnimatedBackground>
      <View style={{ flex: 1, backgroundColor: 'transparent' }}>
        {/* Barra superior */}
        <View style={styles.topBar}>
          <View style={styles.topBarContent}>
            <Image 
              source={require('@/assets/images/logo-ehs.png')} 
              style={styles.logoImage}
              resizeMode="cover"
            />
            <Text style={styles.topBarTitle}>Identificación de Posible{`\n`}Riesgo de Bipedestación</Text>
          </View>
          <TouchableOpacity style={styles.topBarButton}>
            <Text style={styles.topBarButtonText}>?</Text>
          </TouchableOpacity>
        </View>
        <ScrollView contentContainerStyle={styles.container}>
          <Text style={styles.title}>Selección de Subpuesto de Trabajo</Text>
          <Text style={styles.subtitle}>Unidad de Negocio Seleccionada:</Text>
          <View style={styles.selectedContainer}>
            <Text style={styles.selectedText}>{unidad}</Text>
          </View>
          <Text style={styles.subtitle}>Puesto Seleccionado:</Text>
          <View style={styles.selectedContainer}>
            <Text style={styles.selectedText}>{puesto}</Text>
          </View>
          <Text style={styles.subtitle}>Seleccione el subpuesto de trabajo:</Text>
          <View style={styles.boxUnidades}>
            {SUBPUESTOS_GENERICOS.map((subpuesto) => (
              <TouchableOpacity
                key={subpuesto.key}
                style={[styles.opcionUnidad, seleccion === subpuesto.key && styles.opcionUnidadSeleccionada]}
                onPress={() => handleSeleccion(subpuesto.key)}
                activeOpacity={0.85}
              >
                <View style={styles.iconoUnidad}><Text style={styles.iconoText}>{subpuesto.icon}</Text></View>
                <Text style={styles.opcionUnidadTexto}>{subpuesto.key}</Text>
                <View style={styles.radioOuter}>
                  {seleccion === subpuesto.key && <View style={styles.radioInner} />}
                </View>
              </TouchableOpacity>
            ))}
          </View>
          <Text style={styles.info}>Toque un subpuesto para continuar automáticamente</Text>
        </ScrollView>
        {/* Barra inferior */}
        <View style={styles.bottomBar}>
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
    color: AppColors.textPrimary,
  },
  subtitle: {
    fontSize: 16,
    marginBottom: 12,
    color: AppColors.textSecondary,
    textAlign: 'center',
  },
  selectedContainer: {
    backgroundColor: AppColors.accent,
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 12,
    marginBottom: 16,
    shadowColor: AppColors.shadowColor,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  selectedText: {
    fontSize: 18,
    fontWeight: '600',
    color: AppColors.textPrimary,
    textAlign: 'center',
  },
  info: {
    marginTop: 30,
    fontSize: 14,
    color: AppColors.textMuted,
    textAlign: 'center',
  },
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
  boxUnidades: {
    backgroundColor: AppColors.surface,
    borderRadius: 16,
    padding: 24,
    marginBottom: 32,
    width: '100%',
    maxWidth: 420,
    shadowColor: AppColors.shadowColor,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.12,
    shadowRadius: 12,
    elevation: 4,
    alignItems: 'center',
    alignSelf: 'center',
    marginTop: 10,
  },
  opcionUnidad: {
    backgroundColor: AppColors.secondary,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 14,
    paddingHorizontal: 18,
    borderRadius: 14,
    marginVertical: 6,
    marginHorizontal: 4,
    width: '100%',
    shadowColor: AppColors.shadowColor,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.18,
    shadowRadius: 8,
    elevation: 3,
  },
  opcionUnidadSeleccionada: {
    borderWidth: 2,
    borderColor: AppColors.border,
    backgroundColor: AppColors.accent,
  },
  iconoUnidad: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: AppColors.surface,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 15,
    shadowColor: AppColors.shadowColor,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  iconoText: {
    fontSize: 24,
  },
  opcionUnidadTexto: {
    fontSize: 18,
    color: AppColors.textPrimary,
    fontWeight: '700',
    letterSpacing: 1.1,
    flex: 1,
  },
  radioOuter: {
    width: 22,
    height: 22,
    borderRadius: 11,
    borderWidth: 2,
    borderColor: AppColors.border,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: AppColors.surface,
    marginLeft: 10,
  },
  radioInner: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: AppColors.border,
  },
  botonContinuar: {
    backgroundColor: AppColors.primary,
    paddingVertical: 16,
    paddingHorizontal: 30,
    borderRadius: 10,
    marginTop: 10,
    width: '100%',
    alignItems: 'center',
    shadowColor: AppColors.shadowColorDark,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  botonContinuarDeshabilitado: {
    backgroundColor: AppColors.disabled,
  },
  botonContinuarTexto: {
    fontSize: 18,
    color: AppColors.textWhite,
    fontWeight: '600',
  },
}); 