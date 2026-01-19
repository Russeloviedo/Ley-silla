import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Alert } from 'react-native';
import { AuthService } from '@/utils/authService';
import { useServiceWorker } from '@/utils/useServiceWorker';

interface DebugPanelProps {
  visible?: boolean;
}

export default function DebugPanel({ visible = false }: DebugPanelProps) {
  const { isSupported, isInstalled, checkForUpdates, clearCache } = useServiceWorker();
  
  if (!visible) return null;

  const handleClearAuthData = async () => {
    try {
      await AuthService.clearAllAuthData();
      Alert.alert('Éxito', 'Datos de autenticación limpiados');
    } catch (error) {
      Alert.alert('Error', 'No se pudieron limpiar los datos');
    }
  };

  const handleClearAllStorage = async () => {
    try {
      const AsyncStorage = require('@react-native-async-storage/async-storage').default;
      await AsyncStorage.clear();
      Alert.alert('Éxito', 'AsyncStorage completamente limpiado');
    } catch (error) {
      Alert.alert('Error', 'No se pudo limpiar AsyncStorage');
    }
  };

  const handleCheckUpdates = () => {
    checkForUpdates();
    Alert.alert('Info', 'Verificando actualizaciones...');
  };

  const handleClearCache = () => {
    clearCache();
    Alert.alert('Info', 'Limpiando cache...');
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>🔧 Panel de Debug</Text>
      
      {/* Estado PWA */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>📱 PWA Status</Text>
        <Text style={styles.statusText}>
          SW Soportado: {isSupported ? '✅' : '❌'}
        </Text>
        <Text style={styles.statusText}>
          SW Instalado: {isInstalled ? '✅' : '❌'}
        </Text>
      </View>

      {/* Botones de Auth */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>🔐 Autenticación</Text>
        <TouchableOpacity style={styles.button} onPress={handleClearAuthData}>
          <Text style={styles.buttonText}>Limpiar Datos de Auth</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.button} onPress={handleClearAllStorage}>
          <Text style={styles.buttonText}>Limpiar Todo AsyncStorage</Text>
        </TouchableOpacity>
      </View>

      {/* Botones PWA */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>🚀 PWA</Text>
        <TouchableOpacity style={styles.button} onPress={handleCheckUpdates}>
          <Text style={styles.buttonText}>Verificar Actualizaciones</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.button} onPress={handleClearCache}>
          <Text style={styles.buttonText}>Limpiar Cache</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    top: 50,
    right: 10,
    backgroundColor: 'rgba(0, 0, 0, 0.9)',
    padding: 15,
    borderRadius: 8,
    zIndex: 1000,
    maxWidth: 200,
  },
  title: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 15,
    textAlign: 'center',
  },
  section: {
    marginBottom: 15,
  },
  sectionTitle: {
    color: '#4CAF50',
    fontSize: 12,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  statusText: {
    color: 'white',
    fontSize: 11,
    marginBottom: 2,
  },
  button: {
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    padding: 8,
    borderRadius: 4,
    marginBottom: 5,
  },
  buttonText: {
    color: 'white',
    fontSize: 11,
    textAlign: 'center',
  },
});
