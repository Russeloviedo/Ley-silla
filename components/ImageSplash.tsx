import React, { useState, useEffect } from 'react';
import { View, StyleSheet, Dimensions, TouchableOpacity, Platform } from 'react-native';
import { Text } from '@/components/Themed';
import { useRouter } from 'expo-router';
import { AppColors } from '@/constants/Colors';

const { width, height } = Dimensions.get('window');

interface ImageSplashProps {
  onSplashEnd?: () => void;
}

export default function ImageSplash({ onSplashEnd }: ImageSplashProps) {
  const [isFinished, setIsFinished] = useState(false);
  const [showContent, setShowContent] = useState(false);
  const router = useRouter();

  useEffect(() => {
    console.log('ImageSplash component mounted');
    
    // Mostrar contenido después de 300ms
    const contentTimer = setTimeout(() => {
      setShowContent(true);
    }, 300);

    // Terminar después de 3 segundos
    const finishTimer = setTimeout(() => {
      console.log('ImageSplash finished');
      setIsFinished(true);
      if (onSplashEnd) {
        onSplashEnd();
      } else {
        setTimeout(() => {
          router.replace('/(tabs)');
        }, 500);
      }
    }, 3000);

    return () => {
      console.log('ImageSplash component unmounted');
      clearTimeout(contentTimer);
      clearTimeout(finishTimer);
    };
  }, [onSplashEnd, router]);

  const handleSkip = () => {
    console.log('Skip splash screen');
    setIsFinished(true);
    if (onSplashEnd) {
      onSplashEnd();
    } else {
      setTimeout(() => {
        router.replace('/(tabs)');
      }, 500);
    }
  };

  return (
    <View style={styles.container}>
      {/* Fondo sólido para diagnosticar */}
      <View style={styles.backgroundContainer}>
        <div 
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            width: '100%',
            height: '100%',
            backgroundColor: '#1a365d',
            zIndex: 1,
          }}
        />
        
        {/* Intento de imagen */}
        <div 
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            width: '100%',
            height: '100%',
            backgroundImage: 'url(/assets/images/logos-inicio.png)',
            backgroundSize: 'cover',
            backgroundPosition: 'center',
            backgroundRepeat: 'no-repeat',
            zIndex: 2,
          }}
        />
        
        {/* Overlay oscuro */}
        <div 
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            width: '100%',
            height: '100%',
            backgroundColor: 'rgba(0, 0, 0, 0.5)',
            zIndex: 3,
          }}
        />
      </View>

      {/* Logo y título con animación */}
      <View style={[styles.content, { zIndex: 4 }]}>
        <Text style={[styles.title, showContent && styles.titleVisible]}>EHS</Text>
        <Text style={[styles.subtitle, showContent && styles.subtitleVisible]}>
          Departamento EHS México
        </Text>
        <Text style={[styles.appName, showContent && styles.appNameVisible]}>
          Análisis de Bipedestación
        </Text>
      </View>

      {/* Botón para saltar */}
      <TouchableOpacity style={[styles.skipButton, { zIndex: 5 }]} onPress={handleSkip}>
        <Text style={styles.skipText}>Saltar</Text>
      </TouchableOpacity>

      {/* Mensaje de carga cuando termina */}
      {isFinished && (
        <View style={[styles.loadingContainer, { zIndex: 6 }]}>
          <Text style={styles.loadingText}>Cargando aplicación...</Text>
        </View>
      )}

      {/* Debug info */}
      <View style={[styles.debugContainer, { zIndex: 7 }]}>
        <Text style={styles.debugText}>Debug: Splash Screen Activo</Text>
        <Text style={styles.debugText}>ShowContent: {showContent ? 'true' : 'false'}</Text>
        <Text style={styles.debugText}>IsFinished: {isFinished ? 'true' : 'false'}</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000',
  },
  backgroundContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  title: {
    fontSize: 48,
    fontWeight: 'bold',
    color: '#fff',
    textAlign: 'center',
    marginBottom: 10,
    opacity: 0,
  },
  titleVisible: {
    opacity: 1,
  },
  subtitle: {
    fontSize: 18,
    color: '#fff',
    textAlign: 'center',
    marginBottom: 20,
    opacity: 0,
  },
  subtitleVisible: {
    opacity: 1,
  },
  appName: {
    fontSize: 24,
    color: AppColors.primary,
    textAlign: 'center',
    fontWeight: '600',
    opacity: 0,
  },
  appNameVisible: {
    opacity: 1,
  },
  skipButton: {
    position: 'absolute',
    top: 60,
    right: 20,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.3)',
  },
  skipText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
  },
  loadingContainer: {
    position: 'absolute',
    bottom: 50,
    left: 0,
    right: 0,
    alignItems: 'center',
  },
  loadingText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '500',
  },
  debugContainer: {
    position: 'absolute',
    top: 100,
    left: 20,
    backgroundColor: 'rgba(0, 0, 0, 0.8)',
    padding: 10,
    borderRadius: 5,
  },
  debugText: {
    color: '#fff',
    fontSize: 12,
    marginBottom: 2,
  },
}); 