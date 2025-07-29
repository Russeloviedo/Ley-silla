import { StyleSheet, ScrollView, TouchableOpacity, View, Image } from 'react-native';
import { Text } from '@/components/Themed';
import { useState } from 'react';
import { useRouter } from 'expo-router';
import { AppColors } from '@/constants/Colors';
import { UnidadNegocio } from '@/types';
import { validateNavigationParams } from '@/utils/errorHandler';
import AnimatedBackground from '@/components/AnimatedBackground';

const UNIDADES_NEGOCIO: UnidadNegocio[] = [
  'IRR ENSAMBLE',
  'IRR MOLDEO',
  'FX',
  'DD ENSAMBLE MODULOS.CELDAS',
  'DD MOLDEO',
  'DD CALIDAD',
  'DD ALMACEN',
  'HCM PRODUCCIÓN',
  'HCM CALIDAD',
  'HCM ALMACÉN',
  'ALMACÉN',
  'MANTENIMIENTO',
  'TOOL ROOM',
  'ADMINISTRATIVO',
];

export default function SeleccionUnidadNegocioScreen() {
  const router = useRouter();
  const [seleccion, setSeleccion] = useState<UnidadNegocio | null>(null);
  const [showHelpModal, setShowHelpModal] = useState(false);

  const handleSeleccion = (unidad: UnidadNegocio) => {
    setSeleccion(unidad);
    // Navegar automáticamente a la siguiente pantalla
    const params = { unidad: unidad };
    if (validateNavigationParams(params)) {
      router.push({ pathname: '/seleccion-puesto', params });
    }
  };



  const handleAnalisis = () => {
    router.push({ pathname: '/resultados-finales' });
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
          <Text style={styles.topBarTitle}>Identificación de Posible{`\n`}Riesgo de Bipedestación</Text>
        </View>
        <TouchableOpacity style={styles.topBarButton} onPress={handleHelp}>
          <Text style={styles.topBarButtonText}>?</Text>
        </TouchableOpacity>
      </View>
      <ScrollView contentContainerStyle={styles.container}>
        <Text style={styles.title}>Selección de Unidad de Negocio</Text>
        <Text style={styles.subtitle}>Seleccione la unidad de negocio que desea analizar:</Text>
        <View style={styles.boxUnidades}>
          {UNIDADES_NEGOCIO.map((unidad, idx) => (
            <TouchableOpacity
              key={unidad}
              style={[styles.opcionUnidad, seleccion === unidad && styles.opcionUnidadSeleccionada]}
              onPress={() => handleSeleccion(unidad)}
              activeOpacity={0.85}
            >
              <Text style={styles.iconoUnidad}>{getEmojiForUnidad(unidad)}</Text>
              <Text style={styles.opcionUnidadTexto}>{unidad}</Text>
              <View style={styles.radioOuter}>
                {seleccion === unidad && <View style={styles.radioInner} />}
              </View>
            </TouchableOpacity>
          ))}
        </View>
        <Text style={styles.info}>Toque una unidad de negocio para continuar automáticamente</Text>
      </ScrollView>
      {/* Barra inferior */}
      <View style={styles.bottomBar}>
        <View style={styles.bottomBarItem}>
          <Text style={styles.bottomBarIcon}>🏠</Text>
          <Text style={styles.bottomBarLabel}>Inicio</Text>
        </View>
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

function getEmojiForUnidad(unidad: string): string {
  const unidadLower = unidad.toLowerCase();
  
  // Mapeo de unidades a emojis
  const emojiMap: Record<string, string> = {
    'hcm': '👥',
    'fx': '💸',
    'moldeo': '🏭',
    'ensamble': '🔩',
    'almacén': '📦',
    'almacen': '📦',
    'mantenimiento': '🛠️',
    'tool room': '🧰',
    'administrativo': '📑',
    'soporte': '🖥️',
    'áreas': '🌱',
    'calidad': '✅',
  };
  
  // Buscar coincidencias en el mapeo
  for (const [key, emoji] of Object.entries(emojiMap)) {
    if (unidadLower.includes(key)) {
      return emoji;
    }
  }
  
  return '🏢'; // Emoji por defecto
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
    marginBottom: 20,
    color: AppColors.textSecondary,
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
  logoText: {
    fontSize: 24,
    fontWeight: 'bold',
    color: AppColors.textWhite,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
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
  boxUnidades: {
    backgroundColor: 'rgba(255, 255, 255, 0.15)',
    borderRadius: 20,
    padding: 24,
    marginBottom: 32,
    width: '100%',
    maxWidth: 420,
    shadowColor: 'rgba(0, 188, 212, 0.3)',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.2,
    shadowRadius: 16,
    elevation: 8,
    alignItems: 'center',
    alignSelf: 'center',
    marginTop: 10,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.3)',
    backdropFilter: 'blur(10px)',
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
    fontSize: 28,
    marginRight: 12,
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
  botonContinuarTexto: {
    fontSize: 18,
    color: AppColors.textWhite,
    fontWeight: '600',
  },
  botonContinuarDeshabilitado: {
    backgroundColor: AppColors.disabled,
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
    shadowColor: 'rgba(0, 188, 212, 0.4)',
    shadowOffset: { width: 0, height: 12 },
    shadowOpacity: 0.3,
    shadowRadius: 20,
    elevation: 12,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.4)',
    backdropFilter: 'blur(15px)',
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
