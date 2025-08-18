import React from 'react';
import { View, StyleSheet, TouchableOpacity } from 'react-native';
import { Text } from '@/components/Themed';
import { useRouter, type Href } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';

interface NavigationButtonsProps {
  showBack?: boolean;
  showHome?: boolean;
  showDatabase?: boolean;
  onBack?: () => void;
  backDestination?: Href; // <- antes era string
  hideAll?: boolean; // Nueva opción para ocultar todos los botones
}

export default function NavigationButtons({
  showBack = true,
  showHome = true,
  showDatabase = true,
  onBack,
  backDestination,
  hideAll = false
}: NavigationButtonsProps) {
  const router = useRouter();

  const handleBack = () => {
    if (onBack) return onBack();
    if (backDestination) return router.push(backDestination); // <- ya es Href
    router.back();
  };

  const handleHome = () => {
    router.push('/'); // literal válido
  };

  const handleDatabase = () => {
    router.push('/nueva-base-datos'); // sin casts
  };

  // Si hideAll es true, no mostrar ningún botón
  if (hideAll) {
    return null;
  }

  return (
    <View style={styles.container}>
      {showBack && (
        <TouchableOpacity style={styles.buttonWrapper} onPress={handleBack} activeOpacity={0.8}>
          <LinearGradient
            colors={['#FF6B9D', '#C44569']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.buttonGradient}
          >
            <Text style={styles.buttonIcon}>⏪</Text>
            <Text style={styles.buttonText}>Retroceder</Text>
          </LinearGradient>
        </TouchableOpacity>
      )}

      {showHome && (
        <TouchableOpacity style={styles.buttonWrapper} onPress={handleHome} activeOpacity={0.8}>
          <LinearGradient
            colors={['#4ECDC4', '#44A08D']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.buttonGradient}
          >
            <Text style={styles.buttonIcon}>🏠</Text>
            <Text style={styles.buttonText}>Principal</Text>
          </LinearGradient>
        </TouchableOpacity>
      )}

      {showDatabase && (
        <TouchableOpacity style={styles.buttonWrapper} onPress={handleDatabase} activeOpacity={0.8}>
          <LinearGradient
            colors={['#A8E6CF', '#7FCDCD']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.buttonGradient}
          >
            <Text style={styles.buttonIcon}>📋</Text>
            <Text style={styles.buttonText}>Registros</Text>
          </LinearGradient>
        </TouchableOpacity>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    paddingHorizontal: 15,
    paddingVertical: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
    borderRadius: 20,
    marginHorizontal: 15,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 8,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
  },
  buttonWrapper: {
    borderRadius: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 6,
    minWidth: 90,
  },
  buttonGradient: {
    paddingVertical: 16,
    paddingHorizontal: 20,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 80,
  },
  buttonIcon: {
    fontSize: 28,
    marginBottom: 8,
    textShadowColor: 'rgba(0, 0, 0, 0.2)',
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 2,
  },
  buttonText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '700',
    textAlign: 'center',
    textShadowColor: 'rgba(0, 0, 0, 0.3)',
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 2,
    letterSpacing: 0.5,
  },
});
