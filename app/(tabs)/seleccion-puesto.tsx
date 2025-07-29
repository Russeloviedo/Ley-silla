import { StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { Text, View } from '@/components/Themed';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useState } from 'react';
import { Picker } from '@react-native-picker/picker';
import { AppColors } from '@/constants/Colors';

const DATA: Record<string, { puesto: string; subpuesto: string }[]> = {
  "DD ENSAMBLE MODULOS.CELDAS": [
    { puesto: "Supervisor", subpuesto: "General" },
    { puesto: "Supervisor Junior", subpuesto: "General" },
    { puesto: "Asistente de Supervisor", subpuesto: "General" },
    { puesto: "Asistente de control de producción", subpuesto: "General" },
    { puesto: "Operador Universal", subpuesto: "General" },
    { puesto: "Ensamblador", subpuesto: "General" },
    { puesto: "Surtidor de materiales", subpuesto: "General" },
    { puesto: "Separador de partes", subpuesto: "General" },
  ],
  "DD MOLDEO": [
    { puesto: "Supervisor", subpuesto: "General" },
    { puesto: "Supervisor Junior", subpuesto: "General" },
    { puesto: "Operador universal", subpuesto: "General" },
    { puesto: "Separador de partes", subpuesto: "General" },
    { puesto: "Coordinador de técnico de moldeo", subpuesto: "General" },
    { puesto: "Técnico de setup", subpuesto: "General" },
    { puesto: "Técnico de moldeo", subpuesto: "General" },
    { puesto: "Mezclador de resinas", subpuesto: "General" },
    { puesto: "Surtidor de materiales", subpuesto: "General" },
    { puesto: "Auxiliar de mantenimiento", subpuesto: "General" },
  ],
  "DD CALIDAD": [
    { puesto: "Inspector de calidad", subpuesto: "General" },
  ],
  "DD ALMACEN": [
    { puesto: "Supervisor de almacén", subpuesto: "General" },
    { puesto: "Supervisor Junior de almacén", subpuesto: "General" },
    { puesto: "Coordinador de almacén", subpuesto: "General" },
    { puesto: "Almacenista", subpuesto: "General" },
    { puesto: "Materialista", subpuesto: "General" },
    { puesto: "Choferes", subpuesto: "General" },
    { puesto: "Coordinador de conteo cíclico", subpuesto: "General" },
    { puesto: "Auxiliar de conteo cíclico", subpuesto: "General" },
  ],
};

export default function SeleccionPuestoScreen() {
  const { unidad } = useLocalSearchParams();
  const router = useRouter();
  const [puesto, setPuesto] = useState('');
  const [subpuesto, setSubpuesto] = useState('');

  const puestos = unidad && DATA[unidad as string]
    ? [...new Set(DATA[unidad as string].map((item: { puesto: string }) => item.puesto))]
    : [];
  const subpuestos = unidad && puesto && DATA[unidad as string]
    ? [...new Set(DATA[unidad as string].filter((item: { puesto: string }) => item.puesto === puesto).map((item: { subpuesto: string }) => item.subpuesto))]
    : [];

  const handleContinuar = () => {
    if (puesto && subpuesto) {
      router.push({ pathname: '/preguntas-iniciales', params: { unidad, puesto, subpuesto } });
    }
  };

  const handleInicio = () => {
    router.replace('/');
  };

  const handleAnalisis = () => {
    router.push({ pathname: '/resultados-finales' });
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
        <Text style={styles.title}>Selección de Puesto y Subpuesto</Text>
        <Text style={styles.subtitle}>Unidad de Negocio Seleccionada:</Text>
        <View style={styles.selectedUnidadContainer}>
          <Text style={styles.selectedUnidad}>{unidad}</Text>
        </View>
        <View style={styles.boxUnidades}>
          <Text style={styles.sectionTitle}>Seleccione el puesto de trabajo:</Text>
          <View style={styles.pickerContainer}>
            <Picker
              selectedValue={puesto}
              onValueChange={value => {
                setPuesto(value);
                setSubpuesto('');
              }}
              style={styles.picker}
            >
              <Picker.Item label="Seleccione un puesto..." value="" />
              {puestos.map((p: string) => <Picker.Item key={p} label={p} value={p} />)}
            </Picker>
          </View>
          
          <Text style={styles.sectionTitle}>Seleccione el subpuesto de trabajo:</Text>
          <View style={styles.pickerContainer}>
            <Picker
              selectedValue={subpuesto}
              onValueChange={value => setSubpuesto(value)}
              enabled={!!puesto}
              style={[styles.picker, !puesto && styles.pickerDisabled]}
            >
              <Picker.Item label={puesto ? "Seleccione un subpuesto..." : "Primero seleccione un puesto"} value="" />
              {subpuestos.map((s: string) => <Picker.Item key={s} label={s} value={s} />)}
            </Picker>
          </View>
        </View>
        <TouchableOpacity
          style={[styles.botonContinuar, (!puesto || !subpuesto) && styles.botonContinuarDeshabilitado]}
          onPress={handleContinuar}
          disabled={!puesto || !subpuesto}
          activeOpacity={0.8}
        >
          <Text style={styles.botonContinuarTexto}>Continuar</Text>
        </TouchableOpacity>
        <Text style={styles.info}>Seleccione puesto y subpuesto para continuar con el análisis de riesgo</Text>
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
  selectedUnidadContainer: {
    backgroundColor: AppColors.accent,
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 12,
    marginBottom: 24,
    shadowColor: AppColors.shadowColor,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  selectedUnidad: {
    fontSize: 18,
    fontWeight: '600',
    color: AppColors.textPrimary,
    textAlign: 'center',
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: AppColors.textPrimary,
    marginBottom: 12,
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
  pickerContainer: {
    width: '100%',
    marginBottom: 20,
  },
  picker: {
    backgroundColor: AppColors.surface,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: AppColors.secondary,
    minHeight: 50,
    shadowColor: AppColors.shadowColor,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  pickerDisabled: {
    borderColor: AppColors.disabled,
    backgroundColor: AppColors.background,
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