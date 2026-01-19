import FontAwesome from '@expo/vector-icons/FontAwesome';
import { DarkTheme, DefaultTheme, ThemeProvider } from '@react-navigation/native';
import { useFonts } from 'expo-font';
import { Stack } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { useEffect, useState } from 'react';
import 'react-native-reanimated';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { View, Text, ActivityIndicator } from 'react-native';

import { useColorScheme } from '@/components/useColorScheme';
import { AuthService } from '@/utils/authService';
import PWANotification from '@/components/PWANotification';

export {
  ErrorBoundary,
} from 'expo-router';

export const unstable_settings = {
  initialRouteName: 'login',
};

SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  const [loaded, error] = useFonts({
    SpaceMono: require('../assets/fonts/SpaceMono-Regular.ttf'),
    ...FontAwesome.font,
  });

  useEffect(() => {
    if (error) throw error;
  }, [error]);

  useEffect(() => {
    if (loaded) {
      SplashScreen.hideAsync();
    }
  }, [loaded]);

  if (!loaded) {
    return null;
  }

  return <RootLayoutNav />;
}

function RootLayoutNav() {
  const colorScheme = useColorScheme();
  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null);

  const checkAuthenticationStatus = async () => {
    try {
      console.log('🔍 Iniciando verificación de autenticación...');
      
      // Verificar si el usuario está autenticado usando AuthService
      const isLoggedIn = await AuthService.isAuthenticated();
      
      console.log('📱 Valores de autenticación:', { isLoggedIn });
      
      // Asegurar que siempre se establezcan valores booleanos, nunca null
      setIsAuthenticated(isLoggedIn === true);
      
      console.log('🔍 Estado de autenticación establecido:', { 
        isAuthenticated: isLoggedIn === true
      });
    } catch (error) {
      console.error('❌ Error checking authentication:', error);
      // En caso de error, establecer valores por defecto
      setIsAuthenticated(false);
    }
  };

  useEffect(() => {
    checkAuthenticationStatus();
    
    // Agregar listener para detectar cambios en AsyncStorage
    const handleStorageChange = () => {
      console.log('🔄 Cambio detectado en AsyncStorage, re-verificando...');
      checkAuthenticationStatus();
    };
    
    // Escuchar cambios en el almacenamiento
    if (typeof window !== 'undefined') {
      window.addEventListener('storage', handleStorageChange);
      
      // También escuchar eventos personalizados
      window.addEventListener('authStateChanged', handleStorageChange);
    }
    
    return () => {
      if (typeof window !== 'undefined') {
        window.removeEventListener('storage', handleStorageChange);
        window.removeEventListener('authStateChanged', handleStorageChange);
      }
    };
  }, []);

  // Timeout de seguridad para evitar loops infinitos
  useEffect(() => {
    const timeout = setTimeout(() => {
      if (isAuthenticated === null) {
        console.log('⚠️ Timeout de seguridad - forzando valores por defecto');
        setIsAuthenticated(false);
      }
    }, 5000); // 5 segundos de timeout

    return () => clearTimeout(timeout);
  }, [isAuthenticated]);

  // Agregar log para depuración
  console.log('🔄 Renderizando RootLayoutNav:', { isAuthenticated });

  if (isAuthenticated === null) {
    console.log('⏳ Estado de carga - mostrando loading');
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#f5f5f5' }}>
        <ActivityIndicator size="large" color="#1976D2" />
        <Text style={{ marginTop: 20, fontSize: 16, color: '#666' }}>Iniciando aplicación...</Text>
      </View>
    );
  }

  console.log('🚀 Renderizando Stack con estado:', { isAuthenticated });

  return (
    <ThemeProvider value={colorScheme === 'dark' ? DarkTheme : DefaultTheme}>
      <PWANotification />
      <Stack
        screenOptions={{
          headerShown: false,
          contentStyle: {
            backgroundColor: 'transparent',
            marginTop: 0,
            paddingTop: 0,
          },
        }}
      >
        {!isAuthenticated ? (
          <>
            {/* Flujo de login simplificado - solo nombre y número de empleado */}
            <Stack.Screen name="login" options={{ headerShown: false }} />
            <Stack.Screen name="login-empleado" options={{ headerShown: false }} />
          </>
        ) : (
          // Usuario autenticado - mostrar aplicación principal
          <>
            <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
            <Stack.Screen name="modal" options={{ presentation: 'modal' }} />
          </>
        )}
      </Stack>
    </ThemeProvider>
  );
}
