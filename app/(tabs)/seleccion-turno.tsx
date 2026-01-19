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

export default function SeleccionTurno() {
  const router = useRouter();
  const { businessUnit, planta } = useLocalSearchParams<{ businessUnit: string; planta: string }>();

  // Determinar qué turnos mostrar según la unidad de negocio
  const getTurnos = () => {
    if (businessUnit === 'FX') {
      return [
        { id: 'A001', name: 'Turno A001', emoji: '🌅', color: '#FF6B6B' },
        { id: 'LS01', name: 'Turno LS01', emoji: '🌆', color: '#4ECDC4' },
        { id: 'LS02', name: 'Turno LS02', emoji: '🌆', color: '#45B7D1' },
      ];
    } else if (businessUnit === 'HCM') {
      return [
        { id: 'A', name: 'Turno A', emoji: '🌅', color: '#FF6B6B' },
        { id: 'C', name: 'Turno C', emoji: '🌅', color: '#FF8E8E' },
        { id: 'LS01', name: 'Turno LS01', emoji: '🌆', color: '#4ECDC4' },
        { id: 'LS02', name: 'Turno LS02', emoji: '🌆', color: '#45B7D1' },
        { id: 'LS03', name: 'Turno LS03', emoji: '🌆', color: '#96CEB4' },
      ];
    } else if (businessUnit === 'SOPORTE') {
      // Usar datos dinámicos de SOPORTE filtrados por planta
      const turnosSoporte = SelectionDataService.getSoporteTurnos(planta);
      const colors = ['#FFEAA7', '#FFD700', '#FFA500', '#FF8C00', '#FF6347', '#FF4500', '#FF1493'];
      return turnosSoporte.map((turno, index) => ({
        id: turno,
        name: `Turno ${turno}`,
        emoji: turno.includes('A') ? '🌅' : turno.includes('B') ? '🌆' : '⭐',
        color: colors[index % colors.length]
      }));
    } else if (businessUnit === 'DD') {
      return [
        { id: 'AD01', name: 'Turno AD01', emoji: '🌅', color: '#FF6B6B' },
        { id: 'AM01', name: 'Turno AM01', emoji: '🌅', color: '#FF8E8E' },
        { id: 'A001', name: 'Turno A001', emoji: '🌅', color: '#FFB3B3' },
        { id: 'A002', name: 'Turno A002', emoji: '🌅', color: '#FFD6D6' },
        { id: 'LS01', name: 'Turno LS01', emoji: '🌆', color: '#4ECDC4' },
        { id: 'LS02', name: 'Turno LS02', emoji: '🌆', color: '#45B7D1' },
        { id: 'LS03', name: 'Turno LS03', emoji: '🌆', color: '#96CEB4' },
      ];
    } else if (businessUnit === 'Irrigación') {
      return [
        { id: 'A', name: 'Turno A', emoji: '🌅', color: '#FF6B6B' },
        { id: 'AD01', name: 'Turno AD01', emoji: '🌅', color: '#FF8E8E' },
        { id: 'A001', name: 'Turno A001', emoji: '🌅', color: '#FFB3B3' },
        { id: 'A002', name: 'Turno A002', emoji: '🌅', color: '#FFD6D6' },
        { id: 'B', name: 'Turno B', emoji: '🌅', color: '#FFE6E6' },
        { id: 'C', name: 'Turno C', emoji: '🌅', color: '#4ECDC4' },
        { id: 'D', name: 'Turno D', emoji: '🌅', color: '#45B7D1' },
        { id: 'JR', name: 'Turno JR', emoji: '⭐', color: '#96CEB4' },
      ];
    } else {
      // Turnos por defecto para otras unidades
      return [
        { id: 'A001', name: 'Turno A001', emoji: '🌅', color: '#FF6B6B' },
        { id: 'A002', name: 'Turno A002', emoji: '🌅', color: '#FF8E8E' },
        { id: 'AD01', name: 'Turno AD01', emoji: '🌅', color: '#FFB3B3' },
        { id: 'AD02', name: 'Turno AD02', emoji: '🌅', color: '#FFD6D6' },
        { id: 'AD03', name: 'Turno AD03', emoji: '🌅', color: '#FFE6E6' },
        { id: 'AM01', name: 'Turno AM01', emoji: '🌅', color: '#FF6B6B' },
        { id: 'LS01', name: 'Turno LS01', emoji: '🌆', color: '#4ECDC4' },
        { id: 'LS02', name: 'Turno LS02', emoji: '🌆', color: '#45B7D1' },
        { id: 'LS03', name: 'Turno LS03', emoji: '🌆', color: '#96CEB4' },
        { id: 'PP', name: 'Turno PP', emoji: '⭐', color: '#DDA0DD' },
        { id: 'PP3', name: 'Turno PP3', emoji: '⭐', color: '#FFEAA7' },
      ];
    }
  };

  const turnos = getTurnos();

  const handleTurnoSelection = async (turno: string) => {
    try {
      // Guardar el turno seleccionado
              await AsyncStorage.setItem('nav:selectedShift', turno);
      
      // Navegar a la selección de área
      router.push({
        pathname: '/seleccion-area',
        params: { businessUnit: businessUnit, planta: planta, turno: turno }
      });
    } catch (error) {
      console.error('Error al guardar el turno seleccionado:', error);
    }
  };

  const handleBack = () => {
    // Navegar de vuelta a la selección de planta
    router.push({
      pathname: '/seleccion-planta',
      params: { businessUnit: businessUnit }
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
              Selección de Turno - {getBusinessUnitName(businessUnit || '')} - Planta {planta}
            </Text>
          </View>
        </LinearGradient>

        <ScrollView contentContainerStyle={styles.container}>
          <Text style={styles.title}>Selecciona el Turno</Text>
          <Text style={styles.subtitle}>
            Elige el turno en la Planta {planta} de {getBusinessUnitName(businessUnit || '')}
          </Text>

          <View style={styles.buttonGrid}>
            {turnos.map((turno) => (
              <TouchableOpacity
                key={turno.id}
                style={[styles.turnoButton, { backgroundColor: turno.color }]}
                onPress={() => handleTurnoSelection(turno.id)}
                activeOpacity={0.8}
              >
                <Text style={styles.turnoEmoji}>{turno.emoji}</Text>
                <Text style={styles.turnoName}>{turno.name}</Text>
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
  turnoButton: {
    width: 120,
    height: 120,
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
  turnoEmoji: {
    fontSize: 36,
    marginBottom: 8,
  },
  turnoName: {
    fontSize: 14,
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
    fontSize: 16,
    fontWeight: 'bold',
    flex: 1,
  },
});
