import React, { useEffect, useRef } from 'react';
import { View, StyleSheet, Animated, Dimensions, Text } from 'react-native';

const { width, height } = Dimensions.get('window');

interface AnimatedBackgroundProps {
  children: React.ReactNode;
}

export default function AnimatedBackground({ children }: AnimatedBackgroundProps) {
  const silla1Anim = useRef(new Animated.Value(0)).current;
  const silla2Anim = useRef(new Animated.Value(0)).current;
  const silla3Anim = useRef(new Animated.Value(0)).current;
  const silla4Anim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const animateSillas = () => {
      // Animación para silla 1 (mueve de izquierda a derecha)
      Animated.loop(
        Animated.sequence([
          Animated.timing(silla1Anim, {
            toValue: 1,
            duration: 8000,
            useNativeDriver: true,
          }),
          Animated.timing(silla1Anim, {
            toValue: 0,
            duration: 8000,
            useNativeDriver: true,
          }),
        ])
      ).start();

      // Animación para silla 2 (mueve de derecha a izquierda)
      Animated.loop(
        Animated.sequence([
          Animated.timing(silla2Anim, {
            toValue: 1,
            duration: 10000,
            useNativeDriver: true,
          }),
          Animated.timing(silla2Anim, {
            toValue: 0,
            duration: 10000,
            useNativeDriver: true,
          }),
        ])
      ).start();

      // Animación para silla 3 (mueve de abajo hacia arriba)
      Animated.loop(
        Animated.sequence([
          Animated.timing(silla3Anim, {
            toValue: 1,
            duration: 12000,
            useNativeDriver: true,
          }),
          Animated.timing(silla3Anim, {
            toValue: 0,
            duration: 12000,
            useNativeDriver: true,
          }),
        ])
      ).start();

      // Animación para silla 4 (mueve de arriba hacia abajo)
      Animated.loop(
        Animated.sequence([
          Animated.timing(silla4Anim, {
            toValue: 1,
            duration: 15000,
            useNativeDriver: true,
          }),
          Animated.timing(silla4Anim, {
            toValue: 0,
            duration: 15000,
            useNativeDriver: true,
          }),
        ])
      ).start();
    };

    animateSillas();
  }, [silla1Anim, silla2Anim, silla3Anim, silla4Anim]);

  return (
    <View style={styles.container}>
      {/* Fondo base con gradiente */}
      <View style={styles.backgroundGradient} />
      
      {/* Sillas animadas */}
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
            ],
            opacity: silla1Anim.interpolate({
              inputRange: [0, 0.2, 0.8, 1],
              outputRange: [0.3, 0.6, 0.6, 0.3],
            }),
          },
        ]}
      >
        <Text style={styles.sillaEmoji}>🪑</Text>
      </Animated.View>

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
            ],
            opacity: silla2Anim.interpolate({
              inputRange: [0, 0.2, 0.8, 1],
              outputRange: [0.2, 0.5, 0.5, 0.2],
            }),
          },
        ]}
      >
        <Text style={styles.sillaEmoji}>🪑</Text>
      </Animated.View>

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
            ],
            opacity: silla3Anim.interpolate({
              inputRange: [0, 0.2, 0.8, 1],
              outputRange: [0.2, 0.4, 0.4, 0.2],
            }),
          },
        ]}
      >
        <Text style={styles.sillaEmoji}>🪑</Text>
      </Animated.View>

      <Animated.View
        style={[
          styles.silla,
          styles.silla4,
          {
            transform: [
              {
                translateY: silla4Anim.interpolate({
                  inputRange: [0, 1],
                  outputRange: [-50, height + 50],
                }),
              },
            ],
            opacity: silla4Anim.interpolate({
              inputRange: [0, 0.2, 0.8, 1],
              outputRange: [0.3, 0.5, 0.5, 0.3],
            }),
          },
        ]}
      >
        <Text style={styles.sillaEmoji}>🪑</Text>
      </Animated.View>

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
  },
  backgroundGradient: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: '#f0f8ff', // Azul muy claro
    opacity: 0.8,
  },
  silla: {
    position: 'absolute',
    zIndex: 1,
  },
  silla1: {
    top: '20%',
  },
  silla2: {
    top: '60%',
  },
  silla3: {
    left: '20%',
  },
  silla4: {
    left: '70%',
  },
  sillaEmoji: {
    fontSize: 40,
    opacity: 0.7,
  },
  content: {
    flex: 1,
    zIndex: 2,
  },
}); 