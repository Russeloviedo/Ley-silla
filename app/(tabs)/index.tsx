import React, { useEffect, useRef } from 'react';
import { StyleSheet, ScrollView, TouchableOpacity, View, Image, StatusBar, Animated } from 'react-native';
import { Text } from '@/components/Themed';
import { useRouter } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import AnimatedBackground from '@/components/AnimatedBackground';
import { clearAnswersOnly } from '@/utils/storageUtils';

export default function IndexScreen() {
  const router = useRouter();

  const handleIniciarAnalisis = async () => {
    try {
      // Limpiar respuestas y datos de análisis, preservando unidad de negocio
      await clearAnswersOnly();
      console.log('✅ Respuestas y datos de análisis limpiados, unidad de negocio preservada');
      
      // Navegar a la selección de unidad de negocio
      router.push('/seleccion-business-unit');
    } catch (error) {
      console.error('❌ Error al limpiar datos:', error);
      // Continuar con la navegación incluso si hay error
      router.push('/seleccion-business-unit');
    }
  };

  const handleAnalisis = () => {
    router.push('/(tabs)/analisis');
  };



  // Animación de latido para el logo
  const pulseAnim = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    const pulseAnimation = () => {
      Animated.sequence([
        Animated.timing(pulseAnim, {
          toValue: 1.1,
          duration: 800,
          useNativeDriver: true,
        }),
        Animated.timing(pulseAnim, {
          toValue: 1,
          duration: 800,
          useNativeDriver: true,
        }),
      ]).start(() => pulseAnimation());
    };

    pulseAnimation();
  }, [pulseAnim]);

  return (
                    <>
                  <AnimatedBackground>
        {/* Logo Bipe360 en la parte superior */}
        <View style={styles.logoTopContainer}>
          <Animated.Image 
            source={require('../../logo-bipe360.png')} 
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
            <Text style={styles.title}>Bienvenido al Sistema de Análisis</Text>
            <Text style={styles.subtitle}>
              Sistema integral para la identificación y evaluación de riesgos de bipedestación 
              según la normativa vigente. Realiza análisis completos y obtén reportes detallados.
            </Text>

            {/* Botón principal */}
            <TouchableOpacity
              style={styles.mainButton}
              onPress={handleIniciarAnalisis}
              activeOpacity={0.8}
            >
              <LinearGradient
                colors={['#003333', '#006666']}
                style={styles.gradientMainButton}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
              >
                <View style={styles.buttonContent}>
                  <Text style={styles.buttonEmoji}>🚀</Text>
                  <Text style={styles.buttonText}>Iniciar Nuevo Análisis</Text>
                </View>
              </LinearGradient>
            </TouchableOpacity>

            {/* Botón Análisis */}
            <TouchableOpacity
              style={styles.secondaryButton}
              onPress={handleAnalisis}
              activeOpacity={0.8}
            >
              <LinearGradient
                colors={['#4A90E2', '#7BB3F0']}
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

          </View>

          {/* Instrucción inferior */}
          <Text style={styles.instruction}>
            Selecciona "Iniciar Nuevo Análisis" para comenzar tu evaluación
          </Text>

          {/* Footer */}
          <View style={styles.footer}>
            <Text style={styles.footerText}>© Desarrollado por el Equipo de EHS México</Text>
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
  logoTopContainer: {
    alignItems: 'center',
    paddingTop: 40,
    paddingBottom: 20,
  },
  logoTop: {
    width: 350,
    height: 140,
  },
  contentContainer: {
    alignItems: 'center',
    marginBottom: 40,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#2C3E50',
    textAlign: 'center',
    marginBottom: 15,
  },
  subtitle: {
    fontSize: 16,
    color: '#000000',
    textAlign: 'center',
    marginBottom: 40,
    paddingHorizontal: 20,
    lineHeight: 24,
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
  mainButton: {
    borderRadius: 25,
    paddingVertical: 20,
    paddingHorizontal: 40,
    overflow: 'hidden',
  },
  secondaryButton: {
    borderRadius: 25,
    paddingVertical: 18,
    paddingHorizontal: 40,
    marginTop: 15,
    overflow: 'hidden',
  },
  gradientMainButton: {
    flex: 1,
    borderRadius: 25,
    paddingVertical: 20,
    paddingHorizontal: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  gradientSecondaryButton: {
    flex: 1,
    borderRadius: 25,
    paddingVertical: 18,
    paddingHorizontal: 40,
    alignItems: 'center',
    justifyContent: 'center',
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
});
