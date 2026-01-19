import React, { useEffect, useRef, useCallback } from 'react';
import { View, StyleSheet, Animated, Dimensions, Text, Platform } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useFocusEffect } from '@react-navigation/native';

const { width, height } = Dimensions.get('window');

// Configuración global para animaciones
const animationConfig = {
  useNativeDriver: false,
};

interface AnimatedBackgroundProps {
  children: React.ReactNode;
}

export default function AnimatedBackground({ children }: AnimatedBackgroundProps) {
  // Animaciones principales
  const silla1Anim = useRef(new Animated.Value(0)).current;
  const silla2Anim = useRef(new Animated.Value(0)).current;
  const silla3Anim = useRef(new Animated.Value(0)).current;
  const silla4Anim = useRef(new Animated.Value(0)).current;
  
  // Animaciones adicionales para efectos modernos
  const floatAnim = useRef(new Animated.Value(0)).current;
  const rotateAnim = useRef(new Animated.Value(0)).current;
  const scaleAnim = useRef(new Animated.Value(1)).current;
  const particleAnim = useRef(new Animated.Value(0)).current;

  // Referencias para las animaciones activas
  const activeAnimations = useRef<Animated.CompositeAnimation[]>([]);

  // Función para resetear todas las animaciones
  const resetAnimations = useCallback(() => {
    // Detener todas las animaciones activas
    activeAnimations.current.forEach(animation => {
      if (animation) {
        animation.stop();
      }
    });
    activeAnimations.current = [];

    // Resetear valores de animación
    silla1Anim.setValue(0);
    silla2Anim.setValue(0);
    silla3Anim.setValue(0);
    silla4Anim.setValue(0);
    floatAnim.setValue(0);
    rotateAnim.setValue(0);
    scaleAnim.setValue(1);
    particleAnim.setValue(0);
  }, [silla1Anim, silla2Anim, silla3Anim, silla4Anim, floatAnim, rotateAnim, scaleAnim, particleAnim]);

  // Función para iniciar animaciones
  const startAnimations = useCallback(() => {
    // Limpiar animaciones previas
    resetAnimations();

    // Silla 1 - Movimiento horizontal con flotación
    const silla1Animation = Animated.loop(
      Animated.sequence([
        Animated.timing(silla1Anim, {
          toValue: 1,
          duration: 12000,
          ...animationConfig,
        }),
        Animated.timing(silla1Anim, {
          toValue: 0,
          duration: 12000,
          ...animationConfig,
        }),
      ])
    );
    silla1Animation.start();
    activeAnimations.current.push(silla1Animation);

    // Silla 2 - Movimiento diagonal con rotación
    const silla2Animation = Animated.loop(
      Animated.sequence([
        Animated.timing(silla2Anim, {
          toValue: 1,
          duration: 15000,
          ...animationConfig,
        }),
        Animated.timing(silla2Anim, {
          toValue: 0,
          duration: 15000,
          ...animationConfig,
        }),
      ])
    );
    silla2Animation.start();
    activeAnimations.current.push(silla2Animation);

    // Silla 3 - Movimiento vertical con escalado
    const silla3Animation = Animated.loop(
      Animated.sequence([
        Animated.timing(silla3Anim, {
          toValue: 1,
          duration: 18000,
          ...animationConfig,
        }),
        Animated.timing(silla3Anim, {
          toValue: 0,
          duration: 18000,
          ...animationConfig,
        }),
      ])
    );
    silla3Animation.start();
    activeAnimations.current.push(silla3Animation);

    // Silla 4 - Movimiento circular
    const silla4Animation = Animated.loop(
      Animated.sequence([
        Animated.timing(silla4Anim, {
          toValue: 1,
          duration: 20000,
          ...animationConfig,
        }),
        Animated.timing(silla4Anim, {
          toValue: 0,
          duration: 20000,
          ...animationConfig,
        }),
      ])
    );
    silla4Animation.start();
    activeAnimations.current.push(silla4Animation);

    // Efecto de flotación global
    const floatAnimation = Animated.loop(
      Animated.sequence([
        Animated.timing(floatAnim, {
          toValue: 1,
          duration: 3000,
          ...animationConfig,
        }),
        Animated.timing(floatAnim, {
          toValue: 0,
          duration: 3000,
          ...animationConfig,
        }),
      ])
    );
    floatAnimation.start();
    activeAnimations.current.push(floatAnimation);

    // Efecto de rotación
    const rotateAnimation = Animated.loop(
      Animated.timing(rotateAnim, {
        toValue: 1,
        duration: 25000,
        ...animationConfig,
      })
    );
    rotateAnimation.start();
    activeAnimations.current.push(rotateAnimation);

    // Efecto de escalado
    const scaleAnimation = Animated.loop(
      Animated.sequence([
        Animated.timing(scaleAnim, {
          toValue: 1.2,
          duration: 4000,
          ...animationConfig,
        }),
        Animated.timing(scaleAnim, {
          toValue: 1,
          duration: 4000,
          ...animationConfig,
        }),
      ])
    );
    scaleAnimation.start();
    activeAnimations.current.push(scaleAnimation);

    // Efecto de partículas
    const particleAnimation = Animated.loop(
      Animated.timing(particleAnim, {
        toValue: 1,
        duration: 8000,
        ...animationConfig,
      })
    );
    particleAnimation.start();
    activeAnimations.current.push(particleAnimation);
  }, [silla1Anim, silla2Anim, silla3Anim, silla4Anim, floatAnim, rotateAnim, scaleAnim, particleAnim, resetAnimations]);

  // Usar useFocusEffect para reiniciar animaciones cuando la página recibe foco
  useFocusEffect(
    useCallback(() => {
      // Iniciar animaciones cuando la página recibe foco
      startAnimations();

      // Cleanup cuando la página pierde foco
      return () => {
        resetAnimations();
      };
    }, [startAnimations, resetAnimations])
  );

  // Cleanup adicional cuando el componente se desmonta
  useEffect(() => {
    return () => {
      resetAnimations();
    };
  }, [resetAnimations]);

  return (
    <View style={styles.container}>
      {/* Gradiente moderno de fondo */}
      <LinearGradient
        colors={[
          '#E0F7FA', // Turquesa muy claro
          '#B2EBF2', // Turquesa claro
          '#80DEEA', // Turquesa medio
          '#4DD0E1', // Turquesa
          '#26C6DA', // Turquesa oscuro
          '#00BCD4', // Turquesa principal
          '#00ACC1', // Turquesa más oscuro
        ]}
        style={styles.backgroundGradient}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
      />
      
      {/* Gradiente adicional para profundidad */}
      <LinearGradient
        colors={[
          'rgba(182, 230, 0, 0.1)', // Verde claro transparente
          'rgba(0, 188, 212, 0.05)', // Turquesa transparente
          'transparent',
        ]}
        style={styles.overlayGradient}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
      />
      
      {/* Partículas flotantes */}
      <Animated.View
        style={[
          styles.particle,
          styles.particle1,
          {
            opacity: particleAnim.interpolate({
              inputRange: [0, 0.5, 1],
              outputRange: [0.3, 0.8, 0.3],
            }),
            transform: [
              {
                translateY: particleAnim.interpolate({
                  inputRange: [0, 1],
                  outputRange: [0, -20],
                }),
              },
            ],
          },
        ]}
      >
        <Text style={styles.particleText}>✨</Text>
      </Animated.View>

      <Animated.View
        style={[
          styles.particle,
          styles.particle2,
          {
            opacity: particleAnim.interpolate({
              inputRange: [0, 0.5, 1],
              outputRange: [0.2, 0.6, 0.2],
            }),
            transform: [
              {
                translateY: particleAnim.interpolate({
                  inputRange: [0, 1],
                  outputRange: [0, -15],
                }),
              },
            ],
          },
        ]}
      >
        <Text style={styles.particleText}>💫</Text>
      </Animated.View>

      {/* Silla 1 - Movimiento horizontal con flotación */}
      <Animated.View
        style={[
          styles.silla,
          styles.silla1,
          {
            transform: [
              {
                translateX: silla1Anim.interpolate({
                  inputRange: [0, 1],
                  outputRange: [-50, width + 50],
                }),
              },
              {
                translateY: floatAnim.interpolate({
                  inputRange: [0, 1],
                  outputRange: [0, -10],
                }),
              },
              {
                rotate: rotateAnim.interpolate({
                  inputRange: [0, 1],
                  outputRange: ['0deg', '360deg'],
                }),
              },
            ],
            opacity: silla1Anim.interpolate({
              inputRange: [0, 0.2, 0.8, 1],
              outputRange: [0.3, 0.7, 0.7, 0.3],
            }),
          },
        ]}
      >
        <Text style={styles.sillaEmoji}>🪑</Text>
      </Animated.View>

      {/* Silla 2 - Movimiento diagonal con rotación */}
      <Animated.View
        style={[
          styles.silla,
          styles.silla2,
          {
            transform: [
              {
                translateX: silla2Anim.interpolate({
                  inputRange: [0, 1],
                  outputRange: [width + 50, -50],
                }),
              },
              {
                translateY: silla2Anim.interpolate({
                  inputRange: [0, 1],
                  outputRange: [0, -100],
                }),
              },
              {
                rotate: rotateAnim.interpolate({
                  inputRange: [0, 1],
                  outputRange: ['0deg', '-360deg'],
                }),
              },
              {
                scale: scaleAnim,
              },
            ],
            opacity: silla2Anim.interpolate({
              inputRange: [0, 0.2, 0.8, 1],
              outputRange: [0.2, 0.6, 0.6, 0.2],
            }),
          },
        ]}
      >
        <Text style={styles.sillaEmoji}>🪑</Text>
      </Animated.View>

      {/* Silla 3 - Movimiento vertical con escalado */}
      <Animated.View
        style={[
          styles.silla,
          styles.silla3,
          {
            transform: [
              {
                translateY: silla3Anim.interpolate({
                  inputRange: [0, 1],
                  outputRange: [height + 50, -50],
                }),
              },
              {
                translateX: silla3Anim.interpolate({
                  inputRange: [0, 1],
                  outputRange: [0, 50],
                }),
              },
              {
                scale: scaleAnim,
              },
            ],
            opacity: silla3Anim.interpolate({
              inputRange: [0, 0.2, 0.8, 1],
              outputRange: [0.2, 0.5, 0.5, 0.2],
            }),
          },
        ]}
      >
        <Text style={styles.sillaEmoji}>🪑</Text>
      </Animated.View>

      {/* Silla 4 - Movimiento circular */}
      <Animated.View
        style={[
          styles.silla,
          styles.silla4,
          {
            transform: [
              {
                translateX: silla4Anim.interpolate({
                  inputRange: [0, 0.25, 0.5, 0.75, 1],
                  outputRange: [0, 100, 0, -100, 0],
                }),
              },
              {
                translateY: silla4Anim.interpolate({
                  inputRange: [0, 0.25, 0.5, 0.75, 1],
                  outputRange: [0, -100, 0, 100, 0],
                }),
              },
              {
                rotate: rotateAnim.interpolate({
                  inputRange: [0, 1],
                  outputRange: ['0deg', '720deg'],
                }),
              },
            ],
            opacity: silla4Anim.interpolate({
              inputRange: [0, 0.2, 0.8, 1],
              outputRange: [0.3, 0.6, 0.6, 0.3],
            }),
          },
        ]}
      >
        <Text style={styles.sillaEmoji}>🪑</Text>
      </Animated.View>

      {/* Efectos de luz */}
      <Animated.View
        style={[
          styles.lightEffect,
          styles.light1,
          {
            opacity: floatAnim.interpolate({
              inputRange: [0, 0.5, 1],
              outputRange: [0.1, 0.3, 0.1],
            }),
            transform: [
              {
                scale: scaleAnim,
              },
            ],
          },
        ]}
      />

      <Animated.View
        style={[
          styles.lightEffect,
          styles.light2,
          {
            opacity: floatAnim.interpolate({
              inputRange: [0, 0.5, 1],
              outputRange: [0.05, 0.2, 0.05],
            }),
            transform: [
              {
                scale: scaleAnim,
              },
            ],
          },
        ]}
      />

      {/* Contenido principal */}
      <View style={styles.content}>
        {children}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    position: 'relative',
    marginTop: 0,
    paddingTop: 0,
    top: 0,
  },
  backgroundGradient: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
  overlayGradient: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
  silla: {
    position: 'absolute',
    zIndex: 1,
  },
  silla1: {
    top: '15%',
  },
  silla2: {
    top: '65%',
  },
  silla3: {
    left: '15%',
  },
  silla4: {
    left: '75%',
  },
  sillaEmoji: {
    fontSize: 45,
    opacity: 0.8,
    textShadow: '1px 1px 3px rgba(0, 0, 0, 0.3)',
  },
  particle: {
    position: 'absolute',
    zIndex: 1,
  },
  particle1: {
    top: '25%',
    left: '10%',
  },
  particle2: {
    top: '75%',
    right: '15%',
  },
  particleText: {
    fontSize: 20,
    opacity: 0.6,
  },
  lightEffect: {
    position: 'absolute',
    borderRadius: 100,
    zIndex: 0,
  },
  light1: {
    top: '30%',
    left: '20%',
    width: 150,
    height: 150,
    backgroundColor: 'rgba(0, 188, 212, 0.1)',
  },
  light2: {
    bottom: '20%',
    right: '25%',
    width: 120,
    height: 120,
    backgroundColor: 'rgba(182, 230, 0, 0.1)',
  },
  content: {
    flex: 1,
    zIndex: 2,
    marginTop: 0,
    paddingTop: 0,
  },
}); 