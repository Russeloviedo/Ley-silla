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
import { SelectionDataService } from '@/utils/selectionDataService';

export default function SeleccionArea() {
  const router = useRouter();
  const { businessUnit, planta, turno } = useLocalSearchParams<{ businessUnit: string; planta: string; turno: string }>();

  // Determinar qué áreas mostrar según la unidad de negocio
  const getAreas = () => {
    if (businessUnit === 'FX') {
      return [
        { id: 'FX', name: 'FX', emoji: '🏭', colors: ['#FF6B6B', '#FF8E8E'] },
      ];
    } else if (businessUnit === 'HCM') {
      return [
        { id: 'Moldeo', name: 'Moldeo', emoji: '🏗️', colors: ['#FF6B6B', '#FF8E8E'] },
        { id: 'Ensamble', name: 'Ensamble', emoji: '🔧', colors: ['#4ECDC4', '#45B7D1'] },
      ];
    } else if (businessUnit === 'Irrigación') {
      return [
        { id: 'ICV', name: 'ICV', emoji: '🔌', colors: ['#FF6B6B', '#FF8E8E'] },
        { id: 'Moldeo', name: 'Moldeo', emoji: '🏗️', colors: ['#4ECDC4', '#45B7D1'] },
        { id: 'Solenoides', name: 'Solenoides', emoji: '🧲', colors: ['#45B7D1', '#96CEB4'] },
        { id: 'Administracion de Produccion', name: 'Administracion de Produccion', emoji: '📊', colors: ['#96CEB4', '#FFEAA7'] },
        { id: 'Diafragma', name: 'Diafragma', emoji: '💧', colors: ['#FFEAA7', '#DDA0DD'] },
        { id: 'Drip Zone', name: 'Drip Zone', emoji: '💧', colors: ['#DDA0DD', '#FFB6C1'] },
        { id: 'Ensamble ASV', name: 'Ensamble ASV', emoji: '🔧', colors: ['#FFB6C1', '#98FB98'] },
        { id: 'Ensamble PGV', name: 'Ensamble PGV', emoji: '🔧', colors: ['#98FB98', '#F0E68C'] },
        { id: 'Ensamble Pro-Spray', name: 'Ensamble Pro-Spray', emoji: '🔧', colors: ['#F0E68C', '#E6E6FA'] },
        { id: 'HSBE', name: 'HSBE', emoji: '⚙️', colors: ['#E6E6FA', '#FFA07A'] },
        { id: 'I-25/I-140', name: 'I-25/I-140', emoji: '⚙️', colors: ['#FFA07A', '#20B2AA'] },
        { id: 'I-20', name: 'I-20', emoji: '⚙️', colors: ['#20B2AA', '#9370DB'] },
        { id: 'PGJ', name: 'PGJ', emoji: '🏭', colors: ['#9370DB', '#32CD32'] },
        { id: 'PGV1.5&2', name: 'PGV1.5&2', emoji: '🏭', colors: ['#32CD32', '#FF6347'] },
        { id: 'PSU', name: 'PSU', emoji: '💻', colors: ['#FF6347', '#40E0D0'] },
        { id: 'Rotor Sub-Assembly', name: 'Rotor Sub-Assembly', emoji: '⚙️', colors: ['#40E0D0', '#FFD700'] },
        { id: 'SRM', name: 'SRM', emoji: '🔌', colors: ['#FFD700', '#FF69B4'] },
        { id: 'Swing Joint', name: 'Swing Joint', emoji: '🔗', colors: ['#FF69B4', '#8A2BE2'] },
        { id: '90540 HCV', name: '90540 HCV', emoji: '🔌', colors: ['#8A2BE2', '#DC143C'] },
      ];
    } else if (businessUnit === 'SOPORTE') {
      // Usar datos dinámicos de SOPORTE filtrados por planta y turno
      const areasSoporte = SelectionDataService.getSoporteAreas(planta, turno);
      const colorPairs = [
        ['#FFEAA7', '#FFD700'], // Mantenimiento
        ['#FFA500', '#FF8C00'], // Patrimonial
        ['#FF6347', '#FF4500'], // Facilities
      ];
      return areasSoporte.map((area, index) => ({
        id: area,
        name: area,
        emoji: area === 'Mantenimiento' ? '🔧' : area === 'Patrimonial' ? '🏛️' : '🏢',
        colors: colorPairs[index % colorPairs.length] as [string, string]
      }));
    } else if (businessUnit === 'DD') {
      return [
        { id: 'Celdas', name: 'Celdas', emoji: '🔋', colors: ['#FF6B6B', '#FF8E8E'] },
        { id: 'Moldeo', name: 'Moldeo', emoji: '🏗️', colors: ['#4ECDC4', '#45B7D1'] },
        { id: 'Modulos', name: 'Modulos', emoji: '🏭', colors: ['#45B7D1', '#96CEB4'] },
        { id: 'Moldeo - ensamble', name: 'Moldeo - ensamble', emoji: '🔧', colors: ['#96CEB4', '#FFEAA7'] },
        { id: 'DD Molding/Molding', name: 'DD Molding/Molding', emoji: '⚙️', colors: ['#FFEAA7', '#DDA0DD'] },
        { id: 'DD Molding Assembly', name: 'DD Molding Assembly', emoji: '🔩', colors: ['#DDA0DD', '#FFB6C1'] },
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
    // Navegar de vuelta a la selección de turno
    router.push({
      pathname: '/seleccion-turno',
      params: { businessUnit: businessUnit, planta: planta }
    });
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
