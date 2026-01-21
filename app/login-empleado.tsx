import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert, Dimensions, ScrollView } from 'react-native';
import { router } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { AuthService } from '@/utils/authService';
import AnimatedBackground from '@/components/AnimatedBackground';

const { width, height } = Dimensions.get('window');

export default function LoginEmpleadoScreen() {
  const [numeroEmpleado, setNumeroEmpleado] = useState('');
  const [nombre, setNombre] = useState('');

  useEffect(() => {
    loadPreviousData();
  }, []);

  const loadPreviousData = async () => {
    try {
      const tempNombre = await AsyncStorage.getItem('temp_nombre');
      if (tempNombre) setNombre(tempNombre);
    } catch (error) {
      console.error('Error cargando datos:', error);
    }
  };

  const handleContinue = async () => {
    console.log('🔍 handleContinue ejecutándose en login-empleado.tsx...');
    console.log('👤 Nombre:', nombre);
    console.log('🆔 Número Empleado:', numeroEmpleado);

    if (!numeroEmpleado.trim()) {
      console.log('❌ Número de empleado vacío');
      Alert.alert('Error', 'Por favor ingresa tu número de empleado');
      return;
    }

    console.log('✅ Número de empleado válido, iniciando verificación...');

    try {
      console.log('🔄 Llamando a AuthService.verifyUser...');
      const result = await AuthService.verifyUser(nombre, numeroEmpleado.trim());
      console.log('📊 Resultado:', result);

      if (result.success) {
        console.log('🎉 Verificación exitosa, guardando datos...');
        await AuthService.saveUser(result.userData!);
        // Marcar como autenticado
        await AsyncStorage.setItem('is_authenticated', 'true');
        await AsyncStorage.setItem('is_logged_in', 'true');
        console.log('🚀 Redirigiendo a la aplicación principal...');
        router.replace('/(tabs)');
      } else {
        console.log('❌ Verificación fallida:', result.message);
        Alert.alert('Error', result.message);
      }
    } catch (error) {
      console.error('💥 Error en handleContinue:', error);
      Alert.alert('Error', 'Ocurrió un error durante la verificación');
    }
  };

  const handleBack = () => {
    router.back();
  };

  return (
    <AnimatedBackground>
      <ScrollView style={styles.scroll} contentContainerStyle={styles.scrollContent} keyboardShouldPersistTaps="handled">
        {/* Logo en la parte superior */}
        <View style={styles.logoContainer}>
          <Text style={styles.logoEmoji}>👤</Text>
          <Text style={styles.logoText}>Verificación</Text>
          <Text style={styles.logoSubtext}>Acceso de Empleado</Text>
        </View>

        {/* Formulario central */}
        <View style={styles.formContainer}>
          <Text style={styles.title}>Verificación de Empleado</Text>
          <Text style={styles.subtitle}>Confirma tu identidad</Text>

          {/* Información del usuario */}
          <View style={styles.userInfoSection}>
            <View style={styles.userInfoRow}>
              <Text style={styles.userInfoLabel}>Nombre:</Text>
              <Text style={styles.userInfoText}>{nombre}</Text>
            </View>
          </View>

          {/* Campo Número de Empleado */}
          <View style={styles.inputContainer}>
            <View style={styles.inputWrapper}>
              <Text style={styles.inputIcon}>🆔</Text>
              <TextInput
                style={styles.input}
                value={numeroEmpleado}
                onChangeText={setNumeroEmpleado}
                placeholder="Ingresa tu número de empleado"
                placeholderTextColor="#999"
                keyboardType="numeric"
                maxLength={10}
              />
            </View>
          </View>

          {/* Botones de navegación */}
          <View style={styles.buttonRow}>
            <TouchableOpacity
              style={styles.backButtonContainer}
              onPress={handleBack}
              activeOpacity={0.8}
            >
              <Text style={styles.backButtonText}>ATRÁS</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.continueButtonContainer}
              onPress={handleContinue}
              activeOpacity={0.8}
            >
              <Text style={styles.continueButtonText}>CONTINUAR</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Footer */}
        <View style={styles.footer}>
          <Text style={styles.footerText}>© Sistema de Análisis Bipedestación</Text>
        </View>
      </ScrollView>
    </AnimatedBackground>
  );
}

const styles = StyleSheet.create({
  scroll: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    paddingBottom: 32,
  },
  logoContainer: {
    alignItems: 'center',
    paddingTop: 60,
    paddingBottom: 40,
    zIndex: 10,
  },
  logoEmoji: {
    fontSize: 50,
    marginBottom: 10,
    textShadowColor: 'rgba(0, 0, 0, 0.1)',
    textShadowOffset: { width: 2, height: 2 },
    textShadowRadius: 4,
  },
  logoText: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#1976D2',
    marginBottom: 5,
    textShadowColor: 'rgba(255, 255, 255, 0.8)',
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 2,
  },
  logoSubtext: {
    fontSize: 16,
    color: '#666',
    fontWeight: '500',
  },
  formContainer: {
    backgroundColor: 'rgba(255, 255, 255, 0.95)',
    borderRadius: 25,
    padding: 30,
    marginHorizontal: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.1,
    shadowRadius: 16,
    elevation: 8,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.3)',
    zIndex: 5,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#1976D2',
    textAlign: 'center',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    marginBottom: 25,
    fontWeight: '500',
  },
  userInfoSection: {
    backgroundColor: 'rgba(25, 118, 210, 0.1)',
    borderRadius: 15,
    padding: 20,
    marginBottom: 25,
    borderWidth: 1,
    borderColor: 'rgba(25, 118, 210, 0.2)',
  },
  userInfoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 10,
  },
  userInfoLabel: {
    fontSize: 16,
    color: '#666',
    fontWeight: '600',
  },
  userInfoText: {
    fontSize: 16,
    color: '#1976D2',
    fontWeight: '600',
  },
  inputContainer: {
    marginBottom: 25,
  },
  inputWrapper: {
    backgroundColor: 'white',
    borderRadius: 15,
    borderWidth: 2,
    borderColor: '#E3F2FD',
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 15,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  inputIcon: {
    fontSize: 20,
    marginRight: 12,
    color: '#1976D2',
  },
  input: {
    flex: 1,
    padding: 18,
    fontSize: 16,
    color: '#333',
    fontWeight: '500',
  },
  buttonRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 15,
    marginTop: 10,
  },
  backButtonContainer: {
    flex: 1,
    backgroundColor: '#6c757d',
    borderRadius: 15,
    padding: 18,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 6,
  },
  continueButtonContainer: {
    flex: 1,
    backgroundColor: '#1976D2',
    borderRadius: 15,
    padding: 18,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 6,
  },
  backButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
    textTransform: 'uppercase',
  },
  continueButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
    textTransform: 'uppercase',
  },
  footer: {
    alignItems: 'center',
    paddingVertical: 20,
    marginTop: 'auto',
    zIndex: 10,
  },
  footerText: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
    fontWeight: '500',
  },
});
