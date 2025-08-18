import React, { useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  StatusBar,
} from 'react-native';
import { useRouter } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import AnimatedBackground from '@/components/AnimatedBackground';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { NAVIGATION_KEYS, K_ANALYSIS_METADATA } from '@/utils/storageKeys';
import { clearNavigationOnly } from '@/utils/storageUtils';
import { useBusinessUnit } from '@/utils/hooks';
import NavigationButtons from '@/components/NavigationButtons';

export default function SeleccionBusinessUnit() {
  const router = useRouter();
  const { businessUnit, updateBusinessUnit } = useBusinessUnit();

  // Limpiar todas las selecciones previas al iniciar un nuevo análisis
  useEffect(() => {
    const limpiarSeleccionesPrevias = async () => {
      try {
        console.log('🧹 Limpiando selecciones de navegación previas...');
        await clearNavigationOnly();
        console.log('✅ Selecciones de navegación limpiadas');
      } catch (error) {
        console.error('❌ Error al limpiar selecciones de navegación:', error);
      }
    };

    limpiarSeleccionesPrevias();
  }, []);

  const businessUnits = [
    { id: 'FX', name: 'FX', emoji: '🏭', colors: ['#FF6B6B', '#FF8E8E'] },
    { id: 'Irrigación', name: 'Irrigación', emoji: '💧', colors: ['#4ECDC4', '#45B7D1'] },
    { id: 'HCM', name: 'HCM', emoji: '⚙️', colors: ['#45B7D1', '#96CEB4'] },
    { id: 'DD', name: 'DD', emoji: '🔧', colors: ['#96CEB4', '#FFEAA7'] },
    { id: 'SOPORTE', name: 'Soporte', emoji: '🛠️', colors: ['#FFEAA7', '#FFD700'] },
  ];

  const handleBusinessUnitSelection = async (selectedBU: string) => {
    try {
      // Guardar en la clave correcta con namespace
      await AsyncStorage.setItem('nav:selectedBusinessUnit', selectedBU);
      console.log('✅ Business unit guardado:', selectedBU);
      
      if (selectedBU === 'Irrigación') {
        router.push({
          pathname: '/seleccion-planta',
          params: { businessUnit: selectedBU }
        });
      } else if (selectedBU === 'DD') {
        router.push({
          pathname: '/seleccion-planta',
          params: { businessUnit: selectedBU }
        });
      } else if (selectedBU === 'FX') {
        router.push({
          pathname: '/seleccion-planta',
          params: { businessUnit: selectedBU }
        });
      } else if (selectedBU === 'HCM') {
        router.push({
          pathname: '/seleccion-planta',
          params: { businessUnit: selectedBU }
        });
      } else if (selectedBU === 'SOPORTE') {
        router.push({
          pathname: '/seleccion-planta',
          params: { businessUnit: selectedBU }
        });
      } else {
        // TODO: Implementar navegación para otras unidades de negocio
        console.log('Unidad de negocio seleccionada:', selectedBU);
        // router.push('/seleccion-puesto');
      }
    } catch (error) {
      console.error('❌ Error al guardar business unit:', error);
    }
  };

  const handleBack = () => {
    router.back();
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
            <Text style={styles.topBarTitle}>Selección de Unidad de Negocio</Text>
          </View>
        </LinearGradient>

        <ScrollView contentContainerStyle={styles.container}>
          <Text style={styles.title}>Selecciona tu Unidad de Negocio</Text>
          <Text style={styles.subtitle}>
            Elige la unidad de negocio donde realizarás el análisis
          </Text>

          <View style={styles.buttonGrid}>
            {businessUnits.map((unit) => (
              <TouchableOpacity
                key={unit.id}
                style={styles.businessUnitButton}
                onPress={() => handleBusinessUnitSelection(unit.id)}
                activeOpacity={0.8}
              >
                <LinearGradient
                  colors={unit.colors as [string, string]}
                  style={styles.gradientButton}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 1 }}
                >
                  <Text style={styles.businessUnitEmoji}>{unit.emoji}</Text>
                  <Text style={styles.businessUnitName}>{unit.name}</Text>
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
  businessUnitButton: {
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
  businessUnitEmoji: {
    fontSize: 48,
    marginBottom: 10,
  },
  businessUnitName: {
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
