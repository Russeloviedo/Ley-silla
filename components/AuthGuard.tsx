import React, { useEffect, useState } from 'react';
import { View, ActivityIndicator, StyleSheet } from 'react-native';
import { router } from 'expo-router';
import { AuthService } from '@/utils/authService';

interface AuthGuardProps {
  children: React.ReactNode;
}

export default function AuthGuard({ children }: AuthGuardProps) {
  const [isLoading, setIsLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    checkAuthStatus();
  }, []);

  const checkAuthStatus = async () => {
    try {
      console.log('🔒 AuthGuard: Verificando estado de autenticación...');
      
      const isAuth = await AuthService.isAuthenticated();
      const currentUser = await AuthService.getCurrentUser();
      
      console.log('🔒 AuthGuard: Estado:', { isAuth, currentUser });
      
      if (isAuth && currentUser) {
        console.log('🔒 AuthGuard: Usuario autenticado, permitiendo acceso');
        setIsAuthenticated(true);
      } else {
        console.log('🔒 AuthGuard: Usuario no autenticado, redirigiendo al login');
        // NO llamar a logout aquí para evitar bucles
        // Solo limpiar el estado local
        setIsAuthenticated(false);
        router.replace('/login');
        return;
      }
    } catch (error) {
      console.error('🔒 AuthGuard: Error verificando autenticación:', error);
      router.replace('/login');
      return;
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#1976D2" />
      </View>
    );
  }

  if (!isAuthenticated) {
    return null; // El router ya está redirigiendo
  }

  return <>{children}</>;
}

const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f5f5f5',
  },
});
