import { StyleSheet, ScrollView, TouchableOpacity, View, Image, Animated } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Text } from '@/components/Themed';
import { useState, useRef, useEffect } from 'react';
import { router } from 'expo-router';
import { AppColors } from '@/constants/Colors';
import AnimatedBackground from '@/components/AnimatedBackground';
import { LinearGradient } from 'expo-linear-gradient';

import { AuthService } from '@/utils/authService';

export default function IndexScreen() {

  
  // Animación de pulso para el logo
  const pulseAnim = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    // Crear animación de pulso continua
    const pulseAnimation = Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, {
          toValue: 1.1,
          duration: 1500,
          useNativeDriver: true,
        }),
        Animated.timing(pulseAnim, {
          toValue: 1,
          duration: 1500,
          useNativeDriver: true,
        }),
      ])
    );

    pulseAnimation.start();

    // Cleanup al desmontar
    return () => {
      pulseAnimation.stop();
    };
  }, [pulseAnim]);

  const handleNuevoAnalisisCompleto = async () => {
    try {
      console.log('🔄 Iniciando nuevo análisis con refresh...');
      
      // Limpiar datos temporales del análisis
      await AsyncStorage.multiRemove([
        'temp_business_unit',
        'temp_planta',
        'temp_area',
        'temp_puesto',
        'temp_turno',
        'temp_analisis_data'
      ]);
      console.log('✅ Datos temporales de análisis limpiados');
      
      // Primero navegar a la selección de unidad de negocio
      router.push('/seleccion-business-unit');
      
      // Después de un pequeño delay, hacer refresh como F5
      setTimeout(() => {
        if (typeof window !== 'undefined') {
          console.log('🔄 Ejecutando refresh como F5...');
          try {
            // Intentar refresh completo
            window.location.reload();
          } catch (refreshError) {
            console.log('⚠️ Refresh falló, usando método alternativo...');
            // Método alternativo: limpiar y recargar
            window.location.href = window.location.href;
          }
        }
      }, 200);
      
    } catch (error) {
      console.error('❌ Error en nuevo análisis:', error);
      // Continuar con la navegación incluso si hay error
      router.push('/seleccion-business-unit');
    }
  };



  return (
    <>
      <AnimatedBackground>
        {/* Logo Bipe360 en la parte superior */}
        <View style={styles.logoTopContainer}>
          <Animated.Image
            source={require('@/assets/images/logo-bipe360.png')}
            style={[
              styles.logoTop,
              {
                transform: [{ scale: pulseAnim }]
              }
            ]}
            resizeMode="contain"
          />
          

        </View>

        <ScrollView contentContainerStyle={styles.container}>
          {/* Contenido principal */}
          <View style={styles.contentContainer}>
            <Text style={styles.title}>Análisis de Puestos</Text>
            <Text style={styles.subtitle}>
              Sistema de evaluación de riesgos ergonómicos para puestos de trabajo
            </Text>

            {/* Botón principal - Iniciar Nuevo Análisis + Refresh */}
            <TouchableOpacity
              style={styles.primaryButton}
              onPress={handleNuevoAnalisisCompleto}
              activeOpacity={0.8}
            >
              <LinearGradient
                colors={['#667eea', '#764ba2']}
                style={styles.gradientPrimaryButton}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
              >
                <View style={styles.buttonContent}>
                  <Text style={styles.buttonEmoji}>🚀</Text>
                  <Text style={styles.buttonText}>Iniciar Nuevo Análisis</Text>
                </View>
              </LinearGradient>
            </TouchableOpacity>

            {/* Botón Análisis - Redirige a la sección de análisis existente */}
            <TouchableOpacity
              style={styles.secondaryButton}
              onPress={() => router.push('/analisis')}
              activeOpacity={0.8}
            >
              <LinearGradient
                colors={['#4ECDC4', '#44A08D']}
                style={styles.gradientSecondaryButton}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
              >
                <View style={styles.buttonContent}>
                  <Text style={styles.buttonEmoji}>📊</Text>
                  <Text style={styles.buttonText}>Análisis</Text>
                </View>
              </LinearGradient>
            </TouchableOpacity>

            {/* Texto de instrucción */}
            <Text style={styles.instruction}>
              Selecciona "Iniciar Nuevo Análisis" para comenzar una nueva evaluación (incluye refresh) o "Análisis" para ver análisis previos
            </Text>
          </View>


          {/* Footer */}
          <View style={styles.footer}>
            <Text style={styles.footerText}>© Desarrollado por el Equipo de EHS México</Text>
            

            
            {/* Botón de Cerrar Sesión */}
            <TouchableOpacity
              style={[styles.logoutButton, { backgroundColor: '#ff6b35', marginTop: 10 }]}
              onPress={async () => {
                console.log('🔒 Cerrar sesión - limpiando datos...');
                await AsyncStorage.multiRemove([
                  'current_user',
                  'is_authenticated',
                  'is_logged_in'
                ]);
                console.log('✅ Datos limpiados, redirigiendo al login...');
                router.replace('/login');
              }}
              activeOpacity={0.7}
            >
              <Text style={styles.logoutButtonText}>Cerrar Sesión</Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </AnimatedBackground>
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    paddingHorizontal: 20,
    paddingBottom: 40,
    marginTop: 0,
    paddingTop: 0,
  },
  contentContainer: {
    alignItems: 'center',
    paddingTop: 0,
    marginTop: 0,
  },
  logoTopContainer: {
    alignItems: 'center',
    marginTop: 0,
    marginBottom: 20,
    paddingTop: 0,
  },
  logoTop: {
    width: 120,
    height: 120,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: AppColors.textPrimary,
    textAlign: 'center',
    marginBottom: 10,
    marginTop: 0,
  },
  subtitle: {
    fontSize: 16,
    color: AppColors.textSecondary,
    textAlign: 'center',
    marginBottom: 40,
    lineHeight: 24,
    paddingHorizontal: 20,
  },
  instruction: {
    fontSize: 14,
    color: '#000000',
    textAlign: 'center',
    marginBottom: 30,
    fontStyle: 'italic',
  },
  footer: {
    alignItems: 'center',
    paddingVertical: 20,
  },
  footerText: {
    fontSize: 14,
    color: '#FFFFFF',
    textAlign: 'center',
  },
  buttonContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  buttonEmoji: {
    fontSize: 24,
    marginRight: 15,
  },
  buttonText: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  primaryButton: {
    borderRadius: 25,
    paddingVertical: 18,
    paddingHorizontal: 40,
    marginTop: 15,
    overflow: 'hidden',
  },
  gradientPrimaryButton: {
    flex: 1,
    borderRadius: 25,
    paddingVertical: 18,
    paddingHorizontal: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  secondaryButton: {
    borderRadius: 25,
    paddingVertical: 18,
    paddingHorizontal: 40,
    marginTop: 15,
    overflow: 'hidden',
  },
  gradientSecondaryButton: {
    flex: 1,
    borderRadius: 25,
    paddingVertical: 18,
    paddingHorizontal: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  logoutButton: {
    backgroundColor: '#dc3545',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 20,
    marginTop: 80,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 5,
  },
  logoutButtonText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '600',
  },
});
