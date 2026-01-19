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
import NavigationButtons from '@/components/NavigationButtons';
import { SelectionDataService } from '@/utils/selectionDataService';

export default function SeleccionPlanta() {
  const router = useRouter();
  const { businessUnit } = useLocalSearchParams<{ businessUnit: string }>();

  // Determinar qué plantas mostrar según la unidad de negocio
  const getPlantas = () => {
    if (businessUnit === 'DD') {
      return [
        { id: '3', name: 'Planta 3', emoji: '🏭', colors: ['#96CEB4', '#FFEAA7'] }
      ];
    } else if (businessUnit === 'FX') {
      return [
        { id: '2', name: 'Planta 2', emoji: '🏭', colors: ['#4ECDC4', '#45B7D1'] }
      ];
    } else if (businessUnit === 'HCM') {
      return [
        { id: '2', name: 'Planta 2', emoji: '🏭', colors: ['#45B7D1', '#96CEB4'] }
      ];
    } else if (businessUnit === 'Irrigación') {
      return [
        { id: '1', name: 'Planta 1', emoji: '🏭', colors: ['#FF6B6B', '#FF8E8E'] },
        { id: '2', name: 'Planta 2', emoji: '🏭', colors: ['#4ECDC4', '#45B7D1'] },
      ];
    } else if (businessUnit === 'SOPORTE') {
      // Usar datos dinámicos de SOPORTE
      const plantasSoporte = SelectionDataService.getSoportePlantas();
      return plantasSoporte.map((planta, index) => ({
        id: planta,
        name: `Planta ${planta}`,
        emoji: '🏭',
        colors: ['#FFEAA7', '#FFD700'] as [string, string]
      }));
    } else {
      // Plantas por defecto para otras unidades
      return [
        { id: '1', name: 'Planta 1', emoji: '🏭', colors: ['#FF6B6B', '#FF8E8E'] },
        { id: '2', name: 'Planta 2', emoji: '🏭', colors: ['#4ECDC4', '#45B7D1'] },
      ];
    }
  };

  const plantas = getPlantas();

  const handlePlantaSelection = async (planta: string) => {
    try {
      // Guardar la planta seleccionada
              await AsyncStorage.setItem('nav:selectedPlant', planta);
      
      // Navegar a la selección de turno
      router.push({
        pathname: '/seleccion-turno',
        params: { businessUnit: businessUnit, planta: planta }
      });
    } catch (error) {
      console.error('Error al guardar la planta seleccionada:', error);
    }
  };

  const handleBack = () => {
    // Navegar de vuelta a la selección de unidad de negocio
    router.push('/seleccion-business-unit');
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
              Selección de Planta - {getBusinessUnitName(businessUnit || '')}
            </Text>
          </View>
        </LinearGradient>

        <ScrollView contentContainerStyle={styles.container}>
          <Text style={styles.title}>Selecciona la Planta</Text>
          <Text style={styles.subtitle}>
            Elige la planta de {getBusinessUnitName(businessUnit || '')} donde realizarás el análisis
          </Text>

          <View style={styles.buttonGrid}>
            {plantas.map((planta) => (
              <TouchableOpacity
                key={planta.id}
                style={styles.plantaButton}
                onPress={() => handlePlantaSelection(planta.id)}
                activeOpacity={0.8}
              >
                <LinearGradient
                  colors={planta.colors as [string, string]}
                  style={styles.gradientButton}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 1 }}
                >
                  <Text style={styles.plantaEmoji}>{planta.emoji}</Text>
                  <Text style={styles.plantaName}>{planta.name}</Text>
                </LinearGradient>
              </TouchableOpacity>
            ))}
          </View>
        </ScrollView>
        
        {/* Botones de navegación - OCULTOS */}
        <NavigationButtons 
          hideAll={true}
        />
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
    gap: 20,
    paddingHorizontal: 10,
  },
  plantaButton: {
    width: 140,
    height: 140,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    marginBottom: 20,
  },
  gradientButton: {
    width: '100%',
    height: '100%',
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  plantaEmoji: {
    fontSize: 48,
    marginBottom: 10,
  },
  plantaName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#FFFFFF',
    textAlign: 'center',
    textShadowColor: 'rgba(0, 0, 0, 0.3)',
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 2,
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
    fontSize: 18,
    fontWeight: 'bold',
    flex: 1,
  },
});
