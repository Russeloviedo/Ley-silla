import AsyncStorage from '@react-native-async-storage/async-storage';
import * as LocalAuthentication from 'expo-local-authentication';
import { Platform } from 'react-native';
import { DeviceService } from './deviceService';

// Lista de usuarios autorizados (ahora indexada por número de empleado)
const USERS_DATABASE: Record<string, { nombre: string; empleado: string }> = {
  '132': { nombre: 'Evelyn Hurtado', empleado: '132' },
  '1883': { nombre: 'Julian Rueda', empleado: '1883' },
  '2560': { nombre: 'Carlos Pesina', empleado: '2560' },
  '2897': { nombre: 'Ana Ramirez', empleado: '2897' },
  '3035': { nombre: 'Fabiola Perez', empleado: '3035' },
  '4537': { nombre: 'Abdul Molina', empleado: '4537' },
  '4695': { nombre: 'Hector Frias', empleado: '4695' },
  '5150': { nombre: 'Alejandra Arenas', empleado: '5150' },
  '5421': { nombre: 'Nancy Perez', empleado: '5421' },
  '6721': { nombre: 'Marco Diaz', empleado: '6721' },
  '7148': { nombre: 'Elizabeth Galindo', empleado: '7148' },
  '8468': { nombre: 'Pedro Diaz', empleado: '8468' },
  '9544': { nombre: 'Francisco Lopez', empleado: '9544' },
  '10546': { nombre: 'Jose Aguirre', empleado: '10546' },
  '11317': { nombre: 'Rolando Cortez', empleado: '11317' },
  '11588': { nombre: 'Jonathan Morelos', empleado: '11588' },
  '12063': { nombre: 'Jorge Urzua', empleado: '12063' },
  '4361': { nombre: 'Ana Osuna', empleado: '4361' },
  '10335': { nombre: 'Russel Oviedo', empleado: '10335' },
  '11983': { nombre: 'Ayme Mercado', empleado: '11983' },
  '9774': { nombre: 'Jose Jimenez', empleado: '9774' },
  '7090': { nombre: 'Socorro Quintanilla', empleado: '7090' },
  '4370': { nombre: 'Socorro Lozano', empleado: '4370' },
  '11820': { nombre: 'Alejandra Torres', empleado: '11820' },
  '8733': { nombre: 'Patricia Sanchez', empleado: '8733' },
  '9821': { nombre: 'Cristian Ventura', empleado: '9821' },
  '13511': { nombre: 'Lesly Ceballos', empleado: '13511' },
  '8612': { nombre: 'Valeria Macchetto', empleado: '8612' },
  '12098': { nombre: 'Enrique Lopez', empleado: '12098' },
};

export interface UserData {
  nombre: string;
  rfc?: string; // Ahora opcional
  numeroEmpleado: string;
  isAuthenticated: boolean;
  biometricRegistered: boolean;
  registrationDate: string;
  deviceId: string;
  webAuthnCredentials?: any;
}

export interface AuthResult {
  success: boolean;
  message: string;
  userData?: UserData;
}

export class AuthService {
  // Verificación básica de usuario (solo Nombre)
  static async verifyUserBasic(nombre: string): Promise<AuthResult> {
    console.log('🔍 AuthService.verifyUserBasic ejecutándose...');
    console.log('👤 Nombre recibido:', nombre);
    
    // Buscar usuario por nombre en la base de datos
    const userEntry = Object.entries(USERS_DATABASE).find(([_, user]) => 
      user.nombre.toLowerCase() === nombre.toLowerCase()
    );
    
    console.log('👥 Usuario encontrado en DB:', userEntry);

    if (!userEntry) {
      console.log('❌ Nombre no encontrado en la base de datos');
      return {
        success: false,
        message: 'Nombre no encontrado en la base de datos'
      };
    }

    const [numeroEmpleado, user] = userEntry;
    console.log('✅ Usuario verificado correctamente');
    
    return {
      success: true,
      message: 'Usuario verificado correctamente',
      userData: {
        nombre: user.nombre,
        numeroEmpleado: user.empleado,
        isAuthenticated: false,
        biometricRegistered: false,
        registrationDate: new Date().toISOString(),
        deviceId: await DeviceService.getSimpleDeviceId()
      }
    };
  }

  // Verificación completa de usuario (Nombre + Número de Empleado)
  static async verifyUser(nombre: string, numeroEmpleado: string): Promise<AuthResult> {
    console.log('🔍 AuthService.verifyUser ejecutándose...');
    console.log('👤 Nombre recibido:', nombre);
    console.log('🆔 Número Empleado recibido:', numeroEmpleado);
    
    const user = USERS_DATABASE[numeroEmpleado];
    console.log('👥 Usuario encontrado en DB:', user);

    if (!user) {
      console.log('❌ Número de empleado no encontrado en la base de datos');
      return {
        success: false,
        message: 'Número de empleado no encontrado en la base de datos'
      };
    }

    if (user.nombre.toLowerCase() !== nombre.toLowerCase()) {
      console.log('❌ Datos no coinciden:');
      console.log('   DB Nombre:', user.nombre, 'vs Recibido:', nombre);
      return {
        success: false,
        message: 'El nombre no coincide con el número de empleado'
      };
    }

    console.log('✅ Usuario verificado correctamente');
    return {
      success: true,
      message: 'Usuario verificado correctamente',
      userData: {
        nombre: user.nombre,
        numeroEmpleado: user.empleado,
        isAuthenticated: false,
        biometricRegistered: false,
        registrationDate: new Date().toISOString(),
        deviceId: await DeviceService.getSimpleDeviceId()
      }
    };
  }

  // Obtener usuario por número de empleado
  static async getUserByEmployeeNumber(numeroEmpleado: string): Promise<UserData | null> {
    try {
      console.log('🔍 Buscando usuario por número de empleado:', numeroEmpleado);
      const userData = await AsyncStorage.getItem(`user_${numeroEmpleado}`);
      console.log('💾 Datos encontrados en AsyncStorage:', userData);
      return userData ? JSON.parse(userData) : null;
    } catch (error) {
      console.error('❌ Error obteniendo usuario por número de empleado:', error);
      return null;
    }
  }

  // Guardar datos del usuario
  static async saveUserData(userData: UserData): Promise<boolean> {
    try {
      console.log('💾 Guardando datos del usuario:', userData);
      await AsyncStorage.setItem(`user_${userData.numeroEmpleado}`, JSON.stringify(userData));
      console.log('✅ Datos guardados exitosamente');
      return true;
    } catch (error) {
      console.error('❌ Error guardando datos del usuario:', error);
      return false;
    }
  }

  // Guardar usuario (alias para compatibilidad)
  static async saveUser(userData: any): Promise<boolean> {
    try {
      console.log('💾 Guardando usuario:', userData);
      await AsyncStorage.setItem(`user_${userData.numeroEmpleado}`, JSON.stringify(userData));
      await AsyncStorage.setItem('current_user', JSON.stringify(userData));
      await AsyncStorage.setItem('is_authenticated', 'true');
      await AsyncStorage.setItem('is_logged_in', 'true');
      console.log('✅ Usuario guardado exitosamente');
      return true;
    } catch (error) {
      console.error('❌ Error guardando usuario:', error);
      return false;
    }
  }

  // Verificar si la biometría está disponible
  static async isBiometricAvailable(): Promise<boolean> {
    try {
      if (Platform.OS === 'web') {
        return await this.isBiometricWebAvailable();
      } else {
        return await this.isBiometricNativeAvailable();
      }
    } catch (error) {
      console.error('Error verificando disponibilidad biométrica:', error);
      return false;
    }
  }

  // Verificación biométrica unificada (Web + Native)
  static async verifyBiometric(): Promise<boolean> {
    try {
      if (Platform.OS === 'web') {
        return await this.verifyBiometricWeb();
      } else {
        return await this.verifyBiometricNative();
      }
    } catch (error) {
      console.error('Error en verificación biométrica:', error);
      return false;
    }
  }

  // Verificar si la biometría nativa está disponible
  private static async isBiometricNativeAvailable(): Promise<boolean> {
    try {
      const hasHardware = await LocalAuthentication.hasHardwareAsync();
      const isEnrolled = await LocalAuthentication.isEnrolledAsync();
      return hasHardware && isEnrolled;
    } catch (error) {
      console.error('Error verificando biometría nativa:', error);
      return false;
    }
  }

  // Verificación biométrica nativa (Expo)
  private static async verifyBiometricNative(): Promise<boolean> {
    try {
      const result = await LocalAuthentication.authenticateAsync({
        promptMessage: 'Autenticación biométrica requerida',
        fallbackLabel: 'Usar contraseña',
        cancelLabel: 'Cancelar',
      });

      return result.success;
    } catch (error) {
      console.error('Error en verificación biométrica nativa:', error);
      return false;
    }
  }

  // Verificar si la biometría web está disponible
  private static async isBiometricWebAvailable(): Promise<boolean> {
    try {
      // Verificación real de WebAuthn
      if (navigator.credentials && window.PublicKeyCredential) {
        // Verificar si el dispositivo soporta WebAuthn
        const isAvailable = await PublicKeyCredential.isUserVerifyingPlatformAuthenticatorAvailable();
        console.log('🔍 WebAuthn disponible:', isAvailable);
        
        // Verificar si es HTTPS (requerido para WebAuthn)
        const isSecure = window.location.protocol === 'https:' || window.location.hostname === 'localhost';
        console.log('🔒 Conexión segura:', isSecure);
        
        return isAvailable && isSecure;
      }
      console.log('❌ WebAuthn no soportado en este navegador');
      return false;
    } catch (error) {
      console.error('Error verificando biometría web:', error);
      return false;
    }
  }

  // Verificación biométrica web (WebAuthn)
  private static async verifyBiometricWeb(): Promise<boolean> {
    try {
      // Implementación real para WebAuthn
      if (navigator.credentials && window.PublicKeyCredential) {
        // Crear credenciales de prueba para solicitar autenticación
        const challenge = new Uint8Array(32);
        crypto.getRandomValues(challenge);
        
        const publicKeyOptions: PublicKeyCredentialCreationOptions = {
          challenge: challenge,
          rp: {
            name: "Bipe360",
            id: window.location.hostname,
          },
          user: {
            id: new Uint8Array(16),
            name: "usuario@bipe360.com",
            displayName: "Usuario Bipe360",
          },
          pubKeyCredParams: [{
            type: "public-key",
            alg: -7, // ES256
          }],
          timeout: 60000,
          attestation: "direct" as AttestationConveyancePreference,
          authenticatorSelection: {
            authenticatorAttachment: "platform",
            userVerification: "required",
          },
        };

        try {
          const credential = await navigator.credentials.create({
            publicKey: publicKeyOptions
          });
          
          if (credential) {
            console.log('✅ Credencial WebAuthn creada exitosamente');
            return true;
          }
        } catch (createError) {
          console.log('🔐 Usuario canceló o falló la autenticación WebAuthn');
          return false;
        }
      }
      return false;
    } catch (error) {
      console.error('Error en verificación biométrica web:', error);
      return false;
    }
  }

  // Registro biométrico unificado (Web + Native)
  static async registerBiometric(userData: UserData): Promise<boolean> {
    try {
      if (Platform.OS === 'web') {
        return await this.registerBiometricWeb(userData);
      } else {
        return await this.registerBiometricNative(userData);
      }
    } catch (error) {
      console.error('Error en registro biométrico:', error);
      return false;
    }
  }

  // Registro biométrico nativo (Expo)
  private static async registerBiometricNative(userData: UserData): Promise<boolean> {
    try {
      const result = await LocalAuthentication.authenticateAsync({
        promptMessage: 'Registro biométrico requerido',
        fallbackLabel: 'Usar contraseña',
        cancelLabel: 'Cancelar',
      });

      if (result.success) {
        // Marcar como registrado biométricamente
        userData.biometricRegistered = true;
        userData.isAuthenticated = true;
        await this.saveUserData(userData);
        return true;
      }

      return false;
    } catch (error) {
      console.error('Error en registro biométrico nativo:', error);
      return false;
    }
  }

  // Registro biométrico web (WebAuthn)
  private static async registerBiometricWeb(userData: UserData): Promise<boolean> {
    try {
      // Implementación real para WebAuthn
      if (navigator.credentials && window.PublicKeyCredential) {
        // Crear credenciales reales para solicitar autenticación
        const challenge = new Uint8Array(32);
        crypto.getRandomValues(challenge);
        
        const publicKeyOptions: PublicKeyCredentialCreationOptions = {
          challenge: challenge,
          rp: {
            name: "Bipe360",
            id: window.location.hostname,
          },
          user: {
            id: new Uint8Array(16),
            name: userData.rfc,
            displayName: userData.nombre,
          },
          pubKeyCredParams: [{
            type: "public-key",
            alg: -7, // ES256
          }],
          timeout: 60000,
          attestation: "direct" as AttestationConveyancePreference,
          authenticatorSelection: {
            authenticatorAttachment: "platform",
            userVerification: "required",
          },
        };

        try {
          console.log('🔐 Solicitando autenticación biométrica del dispositivo...');
          const credential = await navigator.credentials.create({
            publicKey: publicKeyOptions
          });
          
          if (credential) {
            console.log('✅ Registro biométrico WebAuthn exitoso');
            // Marcar como registrado biométricamente
            userData.biometricRegistered = true;
            userData.isAuthenticated = true;
            userData.webAuthnCredentials = credential;
            await this.saveUserData(userData);
            return true;
          }
        } catch (createError) {
          console.log('🔐 Usuario canceló o falló el registro biométrico WebAuthn');
          return false;
        }
      }
      return false;
    } catch (error) {
      console.error('Error en registro biométrico web:', error);
      return false;
    }
  }

  // Cerrar sesión
  static async logout(): Promise<void> {
    try {
      console.log('🔒 Cerrando sesión...');
      
      // Limpiar datos de sesión
      await AsyncStorage.removeItem('current_user');
      await AsyncStorage.removeItem('is_authenticated');
      await AsyncStorage.removeItem('is_logged_in');
      
      // Limpiar datos temporales del login
      await AsyncStorage.multiRemove([
        'temp_nombre',
        'temp_rfc', 
        'temp_numero_empleado'
      ]);
      
      // Limpiar info temporal del dispositivo
      await DeviceService.clearDeviceInfo();
      
      console.log('✅ Sesión cerrada correctamente');
      
      // Redirigir al login después de limpiar
      if (typeof window !== 'undefined') {
        // Solo en web
        window.location.href = '/login';
      }
    } catch (error) {
      console.error('❌ Error cerrando sesión:', error);
    }
  }

  // Verificar si el usuario está autenticado
  static async isAuthenticated(): Promise<boolean> {
    try {
      const isAuth = await AsyncStorage.getItem('is_authenticated');
      const isLoggedIn = await AsyncStorage.getItem('is_logged_in');
      
      // Verificar ambos indicadores de autenticación
      const authenticated = isAuth === 'true' || isLoggedIn === 'true';
      
      console.log('🔍 Verificando autenticación:', { isAuth, isLoggedIn, authenticated });
      
      return authenticated;
    } catch (error) {
      console.error('Error verificando autenticación:', error);
      return false;
    }
  }

  // Obtener usuario actual
  static async getCurrentUser(): Promise<UserData | null> {
    try {
      const currentUser = await AsyncStorage.getItem('current_user');
      if (!currentUser) {
        console.log('🔍 No hay usuario actual en AsyncStorage');
        return null;
      }
      
      const parsedUser = JSON.parse(currentUser);
      console.log('👤 Usuario actual obtenido:', parsedUser);
      return parsedUser;
    } catch (error) {
      console.error('❌ Error obteniendo usuario actual:', error);
      return null;
    }
  }

  // Método para limpiar todos los datos de autenticación (solo para desarrollo)
  static async clearAllAuthData(): Promise<void> {
    try {
      console.log('🧹 Limpiando todos los datos de autenticación...');
      
      // Obtener todas las claves de AsyncStorage
      const keys = await AsyncStorage.getAllKeys();
      const authKeys = keys.filter(key => 
        key.startsWith('user_') || 
        key.includes('auth') || 
        key.includes('login') ||
        key.includes('biometric') ||
        key.includes('device')
      );
      
      if (authKeys.length > 0) {
        await AsyncStorage.multiRemove(authKeys);
        console.log('✅ Datos de autenticación limpiados:', authKeys);
      } else {
        console.log('ℹ️ No se encontraron datos de autenticación para limpiar');
      }
    } catch (error) {
      console.error('❌ Error limpiando datos de autenticación:', error);
    }
  }
}
