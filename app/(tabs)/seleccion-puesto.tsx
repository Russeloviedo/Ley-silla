import { StyleSheet, ScrollView, TouchableOpacity, Image } from 'react-native';
import { Text, View } from '@/components/Themed';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useState } from 'react';
import { Picker } from '@react-native-picker/picker';
import { AppColors } from '@/constants/Colors';
import AnimatedBackground from '@/components/AnimatedBackground';

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
  "HCM PRODUCCIÓN": [
    { puesto: "Separador de partes", subpuesto: "General" },
    { puesto: "Técnico de Set Up", subpuesto: "I" },
    { puesto: "Técnico de Set Up", subpuesto: "II" },
    { puesto: "Técnico de Set Up", subpuesto: "III" },
    { puesto: "Supervisor de ingeniería", subpuesto: "General" },
    { puesto: "Operador operaciones secundarias", subpuesto: "General" },
    { puesto: "Técnico de Moldeo", subpuesto: "I" },
    { puesto: "Técnico de Moldeo", subpuesto: "II" },
    { puesto: "Técnico de Moldeo", subpuesto: "III" },
    { puesto: "Coordinador técnico de moldeo", subpuesto: "General" },
    { puesto: "Ingeniero de Moldeo", subpuesto: "I" },
    { puesto: "Ingeniero de Moldeo", subpuesto: "II" },
    { puesto: "Ingeniero de Moldeo", subpuesto: "III" },
    { puesto: "Mezclador de Resinas", subpuesto: "General" },
    { puesto: "Operador Universal", subpuesto: "General" },
    { puesto: "Surtidor de Material", subpuesto: "General" },
    { puesto: "Supervisor de Moldeo", subpuesto: "General" },
    { puesto: "Ensamblador", subpuesto: "General" },
    { puesto: "Ing. de Manufactura", subpuesto: "I" },
    { puesto: "Ing. de Manufactura", subpuesto: "II" },
    { puesto: "Ing. de Manufactura", subpuesto: "III" },
    { puesto: "Ingeniero Jr.", subpuesto: "General" },
    { puesto: "Practicante", subpuesto: "General" },
    { puesto: "Supervisor de producción", subpuesto: "I" },
    { puesto: "Supervisor de producción", subpuesto: "II" },
    { puesto: "Supervisor de producción", subpuesto: "III" },
  ],
  "HCM CALIDAD": [
    { puesto: "Técnico de calidad", subpuesto: "I" },
    { puesto: "Técnico de calidad", subpuesto: "II" },
    { puesto: "Técnico de calidad", subpuesto: "III" },
    { puesto: "Supervisor de calidad", subpuesto: "I" },
    { puesto: "Supervisor de calidad", subpuesto: "II" },
    { puesto: "Supervisor de calidad", subpuesto: "III" },
    { puesto: "Inspector de calidad", subpuesto: "I" },
    { puesto: "Inspector de calidad", subpuesto: "II" },
    { puesto: "Inspector de calidad", subpuesto: "III" },
    { puesto: "Asistente de supervisor", subpuesto: "General" },
    { puesto: "Gerente de Calidad", subpuesto: "General" },
  ],
  "HCM ALMACÉN": [
    { puesto: "Coordinador de almacén", subpuesto: "General" },
    { puesto: "Almacenista", subpuesto: "I" },
    { puesto: "Almacenista", subpuesto: "II" },
    { puesto: "Almacenista", subpuesto: "III" },
    { puesto: "Supervisor de almacén", subpuesto: "I" },
    { puesto: "Supervisor de almacén", subpuesto: "II" },
    { puesto: "Supervisor de almacén", subpuesto: "III" },
    { puesto: "Materialista", subpuesto: "I" },
    { puesto: "Materialista", subpuesto: "II" },
    { puesto: "Materialista", subpuesto: "III" },
    { puesto: "Gerente de almacén", subpuesto: "General" },
  ],
};

export default function SeleccionPuestoScreen() {
  const { unidad } = useLocalSearchParams();
  const router = useRouter();
  const [puesto, setPuesto] = useState('');
  const [subpuesto, setSubpuesto] = useState('');
  const [showHelpModal, setShowHelpModal] = useState(false);

  const puestos = unidad && DATA[unidad as string]
    ? [...new Set(DATA[unidad as string].map((item: { puesto: string }) => item.puesto))]
    : [];
  const subpuestos = unidad && puesto && DATA[unidad as string]
    ? [...new Set(DATA[unidad as string].filter((item: { puesto: string }) => item.puesto === puesto).map((item: { subpuesto: string }) => item.subpuesto))]
    : [];



  // Navegar automáticamente cuando se seleccione puesto y subpuesto
  const handlePuestoChange = (value: string) => {
    setPuesto(value);
    setSubpuesto('');
  };

  const handleSubpuestoChange = (value: string) => {
    setSubpuesto(value);
    // Navegar automáticamente cuando se complete la selección
    if (puesto && value) {
      router.push({ pathname: '/preguntas-iniciales', params: { unidad, puesto, subpuesto: value } });
    }
  };

  const handleInicio = () => {
    router.replace('/');
  };

  const handleAnalisis = () => {
    router.push({ pathname: '/resultados-finales' });
  };

  const handleAtras = () => {
    router.replace('/');
  };

  const handleHelp = () => {
    setShowHelpModal(true);
  };

  return (
    <AnimatedBackground>
      {/* Barra superior */}
      <View style={styles.topBar}>
        <View style={styles.topBarContent}>
          <Text style={styles.logoText}>EHS</Text>
          <Text style={styles.topBarTitle} numberOfLines={2} ellipsizeMode="tail">Identificación de Posible{`\n`}Riesgo de Bipedestación</Text>
        </View>
        <TouchableOpacity style={styles.topBarButton} onPress={handleHelp}>
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
              onValueChange={handlePuestoChange}
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
              onValueChange={handleSubpuestoChange}
              enabled={!!puesto}
              style={[styles.picker, !puesto && styles.pickerDisabled]}
            >
              <Picker.Item label={puesto ? "Seleccione un subpuesto..." : "Primero seleccione un puesto"} value="" />
              {subpuestos.map((s: string) => <Picker.Item key={s} label={s} value={s} />)}
            </Picker>
          </View>
        </View>
        <Text style={styles.info}>Seleccione puesto y subpuesto para continuar automáticamente</Text>
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
    </AnimatedBackground>
  );
}

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
    backgroundColor: 'transparent',
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
    flex: 0,
  },
  logoText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#fff',
    marginRight: 10,
    backgroundColor: 'rgba(255,255,255,0.2)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  topBarTitle: {
    color: AppColors.textWhite,
    fontWeight: 'bold',
    fontSize: 16,
    letterSpacing: 1.1,
    lineHeight: 22,
    flexShrink: 1,
    backgroundColor: 'transparent',
    maxWidth: 280,
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