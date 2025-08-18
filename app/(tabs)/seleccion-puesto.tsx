import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  StatusBar,
} from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import AnimatedBackground from '@/components/AnimatedBackground';
import AsyncStorage from '@react-native-async-storage/async-storage';

export default function SeleccionPuesto() {
  const router = useRouter();
  const { businessUnit, planta, turno, area } = useLocalSearchParams<{ businessUnit: string; planta: string; turno: string; area: string }>();

  // Determinar qué puestos mostrar según la unidad de negocio
  const getPuestos = () => {
    if (businessUnit === 'FX') {
      return [
        { id: 'Operador universal', name: 'Operador universal', emoji: '🎮', colors: ['#4ECDC4', '#45B7D1'] },
        { id: 'Ensamblador', name: 'Ensamblador', emoji: '🔧', colors: ['#45B7D1', '#96CEB4'] },
        { id: 'Asistente de Supervisor', name: 'Asistente de Supervisor', emoji: '👔', colors: ['#FFB3B3', '#FFD6D6'] },
        { id: 'Tecnico CNC', name: 'Técnico CNC', emoji: '⚙️', colors: ['#9370DB', '#8A2BE2'] },
        { id: 'Coordinador CNC', name: 'Coordinador CNC', emoji: '🔧', colors: ['#20B2AA', '#008B8B'] },
      ];
    } else if (businessUnit === 'HCM') {
      return [
        { id: 'TECNICO DE MOLDEO', name: 'TÉCNICO DE MOLDEO', emoji: '🔧', colors: ['#FF6B6B', '#FF8E8E'] },
        { id: 'SEPARADOR DE PARTES', name: 'SEPARADOR DE PARTES', emoji: '📋', colors: ['#FF8E8E', '#FFB3B3'] },
        { id: 'TECNICO DE MOLDEO I', name: 'TÉCNICO DE MOLDEO I', emoji: '🔧', colors: ['#FFB3B3', '#FFD6D6'] },
        { id: 'COORDINADOR TECNICO DE MOLDEO', name: 'COORDINADOR TÉCNICO DE MOLDEO', emoji: '👔', colors: ['#FFD6D6', '#FFE6E6'] },
        { id: 'ENSAMBLADOR', name: 'ENSAMBLADOR', emoji: '🔧', colors: ['#FFE6E6', '#4ECDC4'] },
        { id: 'MEZCLADOR DE RESINAS', name: 'MEZCLADOR DE RESINAS', emoji: '🧪', colors: ['#4ECDC4', '#45B7D1'] },
        { id: 'SURTIDOR DE MATERIAL', name: 'SURTIDOR DE MATERIAL', emoji: '📦', colors: ['#45B7D1', '#96CEB4'] },
        { id: 'TECNICO DE SET UP I', name: 'TÉCNICO DE SET UP I', emoji: '🔧', colors: ['#96CEB4', '#FFEAA7'] },
        { id: 'OPERADOR UNIVERSAL', name: 'OPERADOR UNIVERSAL', emoji: '🎮', colors: ['#FFEAA7', '#DDA0DD'] },
        { id: 'SUPERVISOR DE MOLDEO', name: 'SUPERVISOR DE MOLDEO', emoji: '👨‍💼', colors: ['#DDA0DD', '#FFB6C1'] },
        { id: 'OPERADOR OPS SECUNDARIA', name: 'OPERADOR OPS SECUNDARIA', emoji: '⚙️', colors: ['#FFB6C1', '#FF6B6B'] },
      ];
    } else {
      // Puestos por defecto para otras unidades
      return [
        { id: 'Supervisor de producción Sr.', name: 'Supervisor de producción Sr.', emoji: '👨‍💼', colors: ['#FF6B6B', '#FF8E8E'] },
        { id: 'Supervisor de producción ll', name: 'Supervisor de producción ll', emoji: '👨‍💼', colors: ['#FF8E8E', '#FFB3B3'] },
        { id: 'Asistente de supervisor de ensamble DD', name: 'Asistente de supervisor de ensamble DD', emoji: '👔', colors: ['#FFB3B3', '#FFD6D6'] },
        { id: 'Asistente de control de producción', name: 'Asistente de control de producción', emoji: '👔', colors: ['#FFD6D6', '#FFE6E6'] },
        { id: 'Practicante', name: 'Practicante', emoji: '🎓', colors: ['#FFE6E6', '#4ECDC4'] },
        { id: 'Operador universal', name: 'Operador universal', emoji: '🎮', colors: ['#4ECDC4', '#45B7D1'] },
        { id: 'Ensamblador', name: 'Ensamblador', emoji: '🔧', colors: ['#45B7D1', '#96CEB4'] },
        { id: 'Surtidor de materiales', name: 'Surtidor de materiales', emoji: '📦', colors: ['#96CEB4', '#FFEAA7'] },
        { id: 'Supervisor de producción lll', name: 'Supervisor de producción lll', emoji: '👨‍💼', colors: ['#FFEAA7', '#DDA0DD'] },
        { id: 'Principal supervisor de Moldeo', name: 'Principal supervisor de Moldeo', emoji: '👨‍💼', colors: ['#DDA0DD', '#FFB6C1'] },
        { id: 'Supervisor de Moldeo lll', name: 'Supervisor de Moldeo lll', emoji: '👨‍💼', colors: ['#FFB6C1', '#98FB98'] },
        { id: 'Supervisor de Moldeo Jr.', name: 'Supervisor de Moldeo Jr.', emoji: '👨‍💼', colors: ['#98FB98', '#F0E68C'] },
        { id: 'Separador de partes', name: 'Separador de partes', emoji: '📋', colors: ['#F0E68C', '#E6E6FA'] },
        { id: 'Coordinador gestion herramientas mfg', name: 'Coordinador gestión herramientas mfg', emoji: '🔧', colors: ['#E6E6FA', '#FFA07A'] },
        { id: 'Coordinador tecnicos de moldeo', name: 'Coordinador técnicos de moldeo', emoji: '🔧', colors: ['#FFA07A', '#20B2AA'] },
        { id: 'Limpiador de moldes', name: 'Limpiador de moldes', emoji: '🧹', colors: ['#20B2AA', '#9370DB'] },
        { id: 'Mezclador de resinas', name: 'Mezclador de resinas', emoji: '🧪', colors: ['#9370DB', '#32CD32'] },
        { id: 'Mezclador de resinas sr.', name: 'Mezclador de resinas sr.', emoji: '🧪', colors: ['#32CD32', '#FF6347'] },
        { id: 'Tecnico de moldeo l', name: 'Técnico de moldeo l', emoji: '🔧', colors: ['#FF6347', '#40E0D0'] },
        { id: 'Tecnico de moldeo ll', name: 'Técnico de moldeo ll', emoji: '🔧', colors: ['#40E0D0', '#FFD700'] },
        { id: 'Tecnico de moldeo lll', name: 'Técnico de moldeo lll', emoji: '🔧', colors: ['#FFD700', '#FF69B4'] },
        { id: 'Tecnico de set up l', name: 'Técnico de set up l', emoji: '🔧', colors: ['#FF69B4', '#8A2BE2'] },
        { id: 'Tecnico de set up lll', name: 'Técnico de set up lll', emoji: '🔧', colors: ['#8A2BE2', '#DC143C'] },
        { id: 'Auxiliar de mantenimiento', name: 'Auxiliar de mantenimiento', emoji: '🔧', colors: ['#DC143C', '#FF6B6B'] },
      ];
    }
  };

  const puestos = getPuestos();

  const handlePuestoSelection = async (puesto: string) => {
    try {
      // Guardar el puesto seleccionado
              await AsyncStorage.setItem('nav:selectedPosition', puesto);
      
      // Navegar al cuestionario de evaluación inicial
      router.push('/preguntas-iniciales');
    } catch (error) {
      console.error('Error al guardar el puesto seleccionado:', error);
    }
  };

  const handleBack = () => {
    router.back();
  };

  const getBusinessUnitName = (id: string) => {
    const businessUnits: { [key: string]: string } = {
      'FX': 'FX',
      'Irrigación': 'Irrigación',
      'HCM': 'HCM',
      'DD': 'DD',
      'SOPORTE': 'Soporte'
    };
    return businessUnits[id] || id;
  };

  return (
    <>
      <StatusBar hidden={true} backgroundColor="#00BCD4" barStyle="light-content" />
      <AnimatedBackground>
        {/* Barra superior */}
        <LinearGradient
        colors={['#00BCD4', '#00796B']}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.topBar}
      >
        <View style={styles.topBarContent}>
            <TouchableOpacity onPress={handleBack} style={styles.backButton}>
              <Text style={styles.backButtonText}>←</Text>
        </TouchableOpacity>
            <Text style={styles.topBarTitle}>
              Selección de Puesto - {getBusinessUnitName(businessUnit || '')} - Planta {planta} - Turno {turno} - Área {area}
            </Text>
          </View>
        </LinearGradient>

        <ScrollView contentContainerStyle={styles.container}>
          <Text style={styles.title}>Selecciona el Puesto</Text>
          <Text style={styles.subtitle}>
            Elige el puesto en el Área {area} del Turno {turno} de la Planta {planta} de {getBusinessUnitName(businessUnit || '')}
          </Text>

          <View style={styles.buttonGrid}>
            {puestos.map((puesto) => (
              <TouchableOpacity 
                key={puesto.id}
                style={styles.puestoButton}
                onPress={() => handlePuestoSelection(puesto.id)}
                activeOpacity={0.8}
              >
                <LinearGradient
                  colors={puesto.colors as [string, string]}
                  style={styles.gradientButton}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 1 }}
                >
                  <Text style={styles.puestoEmoji}>{puesto.emoji}</Text>
                  <Text style={styles.puestoName}>{puesto.name}</Text>
                </LinearGradient>
              </TouchableOpacity>
            ))}
          </View>
        </ScrollView>
    </AnimatedBackground>
    </>
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
    fontSize: 28,
    fontWeight: 'bold',
    color: '#2C3E50',
    textAlign: 'center',
    marginBottom: 10,
    textShadowColor: 'rgba(0, 0, 0, 0.1)',
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 3,
  },
  subtitle: {
    fontSize: 16,
    color: '#7F8C8D',
    textAlign: 'center',
    marginBottom: 40,
    paddingHorizontal: 20,
  },
  buttonGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 15,
    paddingHorizontal: 10,
  },
  puestoButton: {
    width: 130,
    height: 130,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    marginBottom: 15,
  },
  gradientButton: {
    width: '100%',
    height: '100%',
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  puestoEmoji: {
    fontSize: 36,
    marginBottom: 8,
  },
  puestoName: {
    fontSize: 13,
    fontWeight: 'bold',
    color: '#FFFFFF',
    textAlign: 'center',
    textShadowColor: 'rgba(0, 0, 0, 0.3)',
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 2,
    paddingHorizontal: 6,
  },
  topBar: {
    height: 120,
    justifyContent: 'flex-end',
    paddingBottom: 20,
  },
  topBarContent: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  backButton: {
    marginRight: 15,
    padding: 8,
  },
  backButtonText: {
    color: '#FFFFFF',
    fontSize: 24,
    fontWeight: 'bold',
  },
  topBarTitle: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: 'bold',
    flex: 1,
  },
});
