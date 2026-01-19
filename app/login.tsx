import React, { useState } from 'react';
import { View, Text, StyleSheet, Alert, Dimensions, Image, ScrollView } from 'react-native';
import { router } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { AuthService } from '@/utils/authService';
import { AppColors } from '@/constants/Colors';
import { Typography } from '@/constants/Typography';
import { Spacing, BorderRadius, Shadows } from '@/constants/Spacing';
import AnimatedBackground from '@/components/AnimatedBackground';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import Card from '@/components/ui/Card';

const { width, height } = Dimensions.get('window');

export default function LoginScreen() {
  const [nombre, setNombre] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleContinue = async () => {
    console.log('🔍 handleContinue ejecutándose en login.tsx...');
    console.log('👤 Nombre:', nombre);
    
    if (!nombre.trim()) {
      console.log('❌ Campo vacío');
      Alert.alert('Error', 'Por favor ingresa tu nombre completo');
      return;
    }

    console.log('✅ Campo válido, iniciando verificación...');
    setIsLoading(true);

    try {
      console.log('🔄 Llamando a AuthService.verifyUserBasic...');
      const result = await AuthService.verifyUserBasic(nombre.trim());
      console.log('📊 Resultado:', result);

      if (result.success) {
        console.log('🎉 Verificación exitosa, guardando datos...');
        await AsyncStorage.setItem('temp_nombre', nombre.trim());
        console.log('🚀 Redirigiendo a login-empleado...');
        router.push('/login-empleado');
      } else {
        console.log('❌ Verificación fallida:', result.message);
        Alert.alert('Error', result.message);
      }
    } catch (error) {
      console.error('💥 Error en handleContinue:', error);
      Alert.alert('Error', 'Ocurrió un error durante la verificación');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <AnimatedBackground>
      <ScrollView 
        style={styles.container}
        contentContainerStyle={styles.scrollContent}
        keyboardShouldPersistTaps="handled"
      >
        {/* Logo en la parte superior */}
        <View style={styles.logoContainer}>
          <Image 
            source={require('../logo-bipe360.png')}
            style={styles.logoImage}
            resizeMode="contain"
          />
          <Text style={styles.logoSubtext}>Sistema de Autenticación</Text>
        </View>

        {/* Formulario central */}
        <Card 
          style={styles.formCard}
          variant="elevated"
          padding="large"
        >
          <Text style={styles.title}>Inicio de Sesión</Text>
          <Text style={styles.subtitle}>Paso 1 de 2</Text>
          
          {/* Campo Nombre */}
          <Input
            label="Nombre Completo"
            placeholder="Ingresa tu nombre completo"
            value={nombre}
            onChangeText={setNombre}
            required
            leftIcon={<Text style={styles.inputIcon}>👤</Text>}
            style={styles.inputField}
          />

          {/* Botón de continuar */}
          <Button
            title="CONTINUAR"
            onPress={handleContinue}
            loading={isLoading}
            disabled={!nombre.trim()}
            fullWidth
            size="large"
            style={styles.button}
          />
        </Card>

        {/* Footer */}
        <View style={styles.footer}>
          <Text style={styles.footerText}>© Sistema de Autenticación Bipe360</Text>
        </View>
      </ScrollView>
    </AnimatedBackground>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    paddingBottom: Spacing.layout.page,
  },
  logoContainer: {
    alignItems: 'center',
    paddingTop: Spacing['6xl'],
    paddingBottom: Spacing['4xl'],
    zIndex: 10,
  },
  logoImage: {
    width: 140,
    height: 35,
    marginBottom: Spacing.md,
  },
  logoSubtext: {
    ...Typography.body1,
    color: AppColors.textSecondary,
    fontWeight: '500',
  },
  formCard: {
    marginHorizontal: Spacing.lg,
    marginBottom: Spacing['4xl'],
    zIndex: 5,
  },
  title: {
    ...Typography.h2,
    color: AppColors.primary,
    textAlign: 'center',
    marginBottom: Spacing['2xl'],
  },
  subtitle: {
    ...Typography.body1,
    color: AppColors.textSecondary,
    textAlign: 'center',
    marginBottom: Spacing['3xl'],
    fontWeight: '500',
  },
  inputField: {
    marginBottom: Spacing.lg,
  },
  inputIcon: {
    fontSize: 20,
    color: AppColors.primary,
  },
  button: {
    marginTop: Spacing.lg,
  },
  footer: {
    alignItems: 'center',
    paddingVertical: Spacing.lg,
    zIndex: 10,
  },
  footerText: {
    ...Typography.caption,
    color: AppColors.textSecondary,
    textAlign: 'center',
    fontWeight: '500',
  },
});
