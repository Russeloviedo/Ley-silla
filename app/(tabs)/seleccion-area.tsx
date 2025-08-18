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

export default function SeleccionArea() {
  const router = useRouter();
  const { businessUnit, planta, turno } = useLocalSearchParams<{ businessUnit: string; planta: string; turno: string }>();

  // Determinar qué áreas mostrar según la unidad de negocio
  const getAreas = () => {
    if (businessUnit === 'FX') {
      return [
        { id: 'SP', name: 'SP', emoji: '🏭', colors: ['#FF6B6B', '#FF8E8E'] },
        { id: 'UP LIGHT', name: 'UP LIGHT', emoji: '💡', colors: ['#FF8E8E', '#FFB3B3'] },
        { id: 'PATH LIGHT', name: 'PATH LIGHT', emoji: '🛤️', colors: ['#FFB3B3', '#FFD6D6'] },
        { id: 'ESPECIALES', name: 'ESPECIALES', emoji: '⭐', colors: ['#FFD6D6', '#FFE6E6'] },
        { id: 'VOLTAJE', name: 'VOLTAJE', emoji: '⚡', colors: ['#FFE6E6', '#4ECDC4'] },
        { id: 'RS', name: 'RS', emoji: '🔌', colors: ['#4ECDC4', '#45B7D1'] },
        { id: 'ACCESORIOS', name: 'ACCESORIOS', emoji: '🔧', colors: ['#45B7D1', '#96CEB4'] },
        { id: 'GOODIE BAG', name: 'GOODIE BAG', emoji: '🎒', colors: ['#96CEB4', '#FFEAA7'] },
        { id: 'EVOLINE', name: 'EVOLINE', emoji: '📈', colors: ['#FFEAA7', '#DDA0DD'] },
        { id: 'EPOXI', name: 'EPOXI', emoji: '🧪', colors: ['#DDA0DD', '#FFB6C1'] },
        { id: 'ENGOMADO', name: 'ENGOMADO', emoji: '🟡', colors: ['#FFB6C1', '#98FB98'] },
        { id: 'PINTURA', name: 'PINTURA', emoji: '🎨', colors: ['#98FB98', '#F0E68C'] },
        { id: 'PULIDO', name: 'PULIDO', emoji: '✨', colors: ['#F0E68C', '#E6E6FA'] },
        { id: 'TOMBOLEO', name: 'TOMBOLEO', emoji: '🎲', colors: ['#E6E6FA', '#FFA07A'] },
        { id: 'ANTIQUE', name: 'ANTIQUE', emoji: '🏺', colors: ['#FFA07A', '#20B2AA'] },
        { id: 'PX', name: 'PX', emoji: '🔧', colors: ['#20B2AA', '#9370DB'] },
        { id: 'CNC', name: 'CNC', emoji: '⚙️', colors: ['#9370DB', '#FF6B6B'] },
      ];
    } else if (businessUnit === 'HCM') {
      return [
        { id: 'MOLDEO', name: 'MOLDEO', emoji: '🏗️', colors: ['#FF6B6B', '#FF8E8E'] },
        { id: 'ENSAMBLE', name: 'ENSAMBLE', emoji: '🔧', colors: ['#4ECDC4', '#45B7D1'] },
      ];
    } else if (businessUnit === 'Irrigación') {
      return [
        { id: 'PGJ', name: 'PGJ', emoji: '🏭', colors: ['#FF6B6B', '#FF8E8E'] },
        { id: 'PROSPRAY', name: 'PROSPRAY', emoji: '💧', colors: ['#4ECDC4', '#45B7D1'] },
        { id: 'VALVULAS', name: 'VALVULAS', emoji: '🔧', colors: ['#45B7D1', '#96CEB4'] },
        { id: 'I-20-25-40', name: 'I-20-25-40', emoji: '⚙️', colors: ['#FFD93D', '#FFB347'] },
        { id: 'I-20-25-41', name: 'I-20-25-41', emoji: '⚙️', colors: ['#6BCF7F', '#32CD32'] },
        { id: 'I-20-25-42', name: 'I-20-25-42', emoji: '⚙️', colors: ['#4D96FF', '#87CEEB'] },
        { id: 'I-20-25-43', name: 'I-20-25-43', emoji: '⚙️', colors: ['#FF6B9D', '#FF69B4'] },
        { id: 'I-20-25-44', name: 'I-20-25-44', emoji: '⚙️', colors: ['#A8E6CF', '#98FB98'] },
        { id: 'I-20-25-45', name: 'I-20-25-45', emoji: '⚙️', colors: ['#FFB347', '#FFD700'] },
        { id: 'I-20-25-46', name: 'I-20-25-46', emoji: '⚙️', colors: ['#DDA0DD', '#9370DB'] },
        { id: 'GOLF', name: 'GOLF', emoji: '🏌️', colors: ['#98FB98', '#32CD32'] },
        { id: 'SRN', name: 'SRN', emoji: '🔌', colors: ['#F0E68C', '#FFD700'] },
        { id: 'SENSORES', name: 'SENSORES', emoji: '📡', colors: ['#87CEEB', '#4D96FF'] },
        { id: 'AUTOMATIZACION PGJ', name: 'AUTOMATIZACION PGJ', emoji: '🤖', colors: ['#FF69B4', '#FF1493'] },
        { id: 'HIGH POP', name: 'HIGH POP', emoji: '🚀', colors: ['#32CD32', '#228B22'] },
        { id: 'ACCUSYNC', name: 'ACCUSYNC', emoji: '⚡', colors: ['#FFD700', '#FFA500'] },
        { id: 'PSU ULTRA', name: 'PSU ULTRA', emoji: '💻', colors: ['#9370DB', '#8A2BE2'] },
        { id: 'SUB-ENSAMBLE I SERIES', name: 'SUB-ENSAMBLE I SERIES', emoji: '🔩', colors: ['#20B2AA', '#008B8B'] },
        { id: 'MOLDEO P1', name: 'MOLDEO P1', emoji: '🏗️', colors: ['#FF6347', '#DC143C'] },
        { id: 'MOLDEOP2', name: 'MOLDEOP2', emoji: '🏗️', colors: ['#8A2BE2', '#4B0082'] },
        { id: 'SOLENOIDES', name: 'SOLENOIDES', emoji: '🧲', colors: ['#DC143C', '#8B0000'] },
      ];
    } else {
      // Áreas por defecto para otras unidades
      return [
        { id: 'MODULOS', name: 'MODULOS', emoji: '🏭', colors: ['#FF6B6B', '#FF8E8E'] },
        { id: 'CELDAS', name: 'CELDAS', emoji: '🔋', colors: ['#4ECDC4', '#45B7D1'] },
        { id: 'MOLDEO', name: 'MOLDEO', emoji: '🏗️', colors: ['#45B7D1', '#96CEB4'] },
      ];
    }
  };

  const areas = getAreas();

  const handleAreaSelection = async (area: string) => {
    try {
      // Guardar el área seleccionada
              await AsyncStorage.setItem('nav:selectedArea', area);
      
      // Navegar a la selección de puesto
      router.push({
        pathname: '/seleccion-puesto',
        params: { businessUnit: businessUnit, planta: planta, turno: turno, area: area }
      });
    } catch (error) {
      console.error('Error al guardar el área seleccionada:', error);
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
              Selección de Área - {getBusinessUnitName(businessUnit || '')} - Planta {planta} - Turno {turno}
            </Text>
          </View>
        </LinearGradient>

        <ScrollView contentContainerStyle={styles.container}>
          <Text style={styles.title}>Selecciona el Área</Text>
          <Text style={styles.subtitle}>
            Elige el área en el Turno {turno} de la Planta {planta} de {getBusinessUnitName(businessUnit || '')}
          </Text>

          <View style={styles.buttonGrid}>
            {areas.map((area) => (
              <TouchableOpacity
                key={area.id}
                style={styles.areaButton}
                onPress={() => handleAreaSelection(area.id)}
                activeOpacity={0.8}
              >
                <LinearGradient
                  colors={area.colors as [string, string]}
                  style={styles.gradientButton}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 1 }}
                >
                  <Text style={styles.areaEmoji}>{area.emoji}</Text>
                  <Text style={styles.areaName}>{area.name}</Text>
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
    gap: 12,
    paddingHorizontal: 10,
  },
  areaButton: {
    width: 110,
    height: 110,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    marginBottom: 12,
  },
  gradientButton: {
    width: '100%',
    height: '100%',
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
  },
  areaEmoji: {
    fontSize: 32,
    marginBottom: 6,
  },
  areaName: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#FFFFFF',
    textAlign: 'center',
    textShadowColor: 'rgba(0, 0, 0, 0.3)',
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 2,
    paddingHorizontal: 4,
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
    fontSize: 14,
    fontWeight: 'bold',
    flex: 1,
  },
});
