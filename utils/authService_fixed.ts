import AsyncStorage from '@react-native-async-storage/async-storage';
import * as LocalAuthentication from 'expo-local-authentication';
import { Platform } from 'react-native';
import { DeviceService } from './deviceService';

// Lista de usuarios autorizados
const USERS_DATABASE: Record<string, { nombre: string; empleado: string }> = {
  'HUGE671227940': { nombre: 'Evelyn Hurtado', empleado: '132' },
  'RUGJ690619GX9': { nombre: 'Julian Rueda', empleado: '1883' },
  'PEVC841204C53': { nombre: 'Carlos Pesina', empleado: '2560' },
  'RASA860125SA0': { nombre: 'Ana Ramirez', empleado: '2897' },
  'PECF830823K25': { nombre: 'Fabiola Perez', empleado: '3035' },
  'MODA910222297': { nombre: 'Abdul Molina', empleado: '4537' },
  'FILH880428MI6': { nombre: 'Hector Frias', empleado: '4695' },
  'AECA8107173C8': { nombre: 'Alejandra Arenas', empleado: '5150' },
  'PEBN830723DT6': { nombre: 'Nancy Perez', empleado: '5421' },
  'DIIM7604193E7': { nombre: 'Marco Diaz', empleado: '6721' },
  'GAEE8108202TA': { nombre: 'Elizabeth Galindo', empleado: '7148' },
  'DIMP8912228B8': { nombre: 'Pedro Diaz', empleado: '8468' },
  'LODF920207L60': { nombre: 'Francisco Lopez', empleado: '9544' },
  'AURM900818MB3': { nombre: 'Jose Aguirre', empleado: '10546' },
  'COSR030313MS5': { nombre: 'Rolando Cortez', empleado: '11317' },
  'MOTJ900914PW2': { nombre: 'Jonathan Morelos', empleado: '11588' },
  'UUCJ971015US2': { nombre: 'Jorge Urzua', empleado: '12063' },
  'OUAA700203IB8': { nombre: 'Ana Osuna', empleado: '4361' },
  'OIBJ940121KHA': { nombre: 'Russel Oviedo', empleado: '10335' },
  'MEOA991202356': { nombre: 'Ayme Mercado', empleado: '11983' },
  'JIGM950311SE0': { nombre: 'Jose Jimenez', empleado: '9774' },
  'QUSS700617UW5': { nombre: 'Socorro Quintanilla', empleado: '7090' },
  'LOXS7212267Y3': { nombre: 'Socorro Lozano', empleado: '4370' },
  'AAAA7506268L5': { nombre: 'Alejandra Torres', empleado: '11820' },
  'SAAP7707311M6': { nombre: 'Patricia Sanchez', empleado: '8733' },
  'MOVC990416FM0': { nombre: 'Cristian Ventura', empleado: '9821' },
  'CEGL011025T96': { nombre: 'Lesly Ceballos', empleado: '13511' },
  'MACV970514J32': { nombre: 'Valeria Macchetto', empleado: '8612' },
};

export interface UserData {
  nombre: string;
  rfc: string;
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
  requiresSecondPassword?: boolean;
}

export class AuthService {
  // Verificación básica de usuario (RFC + Nombre)
  static async verifyUserBasic(rfc: string, nombre: string): Promise<AuthResult> {
    const user = USERS_DATABASE[rfc];

    if (!user) {
      return {
        success: false,
        message: 'RFC no encontrado en la base de datos'
      };
    }

    if (user.nombre !== nombre) {
      return {
        success: false,
        message: 'El nombre no coincide con el RFC'
      };
    }

    const existingUser = await this.getUserByRFC(rfc);
    if (existingUser) {
      // Verificar si es el mismo dispositivo
      const isSameDevice = await DeviceService.isSameDevice(existingUser.deviceId);
      
      if (isSameDevice) {
        // Es el mismo dispositivo, permitir acceso directo
        return {
          success: true,
          message: 'Usuario verificado correctamente (mismo dispositivo)',
          userData: existingUser
        };
      } else {
        // Es un dispositivo diferente, redirigir a segunda verificación
        return {
          success: false,
          message: 'Usuario ya registrado en otro dispositivo',
          requiresSecondPassword: true
        };
      }
    }

    return {
      success: true,
      message: 'Usuario verificado correctamente',
      userData: {
        nombre: user.nombre,
        rfc: rfc,
        numeroEmpleado: user.empleado,
        isAuthenticated: false,
        biometricRegistered: false,
        registrationDate: new Date().toISOString(),
        deviceId: await DeviceService.getSimpleDeviceId()
      }
    };
  }

  // Verificación completa de usuario (RFC + Nombre + Número de Empleado)
  static async verifyUser(rfc: string, nombre: string, numeroEmpleado: string): Promise<AuthResult> {
    const user = USERS_DATABASE[rfc];

    if (!user) {
      return {
        success: false,
        message: 'RFC no encontrado en la base de datos'
      };
    }

    if (user.nombre !== nombre || user.empleado !== numeroEmpleado) {
      return {
        success: false,
        message: 'Los datos no coinciden con nuestros registros'
      };
    }

    const existingUser = await this.getUserByRFC(rfc);
    if (existingUser) {
      // Verificar si es el mismo dispositivo
      const isSameDevice = await DeviceService.isSameDevice(existingUser.deviceId);
      
      if (isSameDevice) {
        // Es el mismo dispositivo, permitir acceso directo
        return {
          success: true,
          message: 'Usuario verificado correctamente (mismo dispositivo)',
          userData: existingUser
        };
      } else {
        // Es un dispositivo diferente, redirigir a segunda verificación
        return {
          success: false,
          message: 'Usuario ya registrado en otro dispositivo',
          requiresSecondPassword: true
        };
      }
    }

    return {
      success: true,
      message: 'Usuario verificado correctamente',
      userData: {
        nombre: user.nombre,
        rfc: rfc,
        numeroEmpleado: user.empleado,
        isAuthenticated: false,
        biometricRegistered: false,
        registrationDate: new Date().toISOString(),
        deviceId: await DeviceService.getSimpleDeviceId()
      }
    };
  }

  // Obtener usuario por RFC
  static async getUserByRFC(rfc: string): Promise<UserData | null> {
    try {
      const userData = await AsyncStorage.getItem(`user_${rfc}`);
      return userData ? JSON.parse(userData) : null;
    } catch (error) {
      console.error('Error obteniendo usuario por RFC:', error);
      return null;
    }
  }

  // Guardar datos del usuario
  static async saveUserData(userData: UserData): Promise<boolean> {
    try {
      await AsyncStorage.setItem(`user_${userData.rfc}`, JSON.stringify(userData));
      return true;
    } catch (error) {
      console.error('Error guardando datos del usuario:', error);
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

  // Verificación biométrica web (WebAuthn)
  private static async verifyBiometricWeb(): Promise<boolean> {
    try {
      // Implementación básica para WebAuthn
      if (navigator.credentials && window.PublicKeyCredential) {
        // Verificar si el dispositivo soporta WebAuthn
        return await PublicKeyCredential.isUserVerifyingPlatformAuthenticatorAvailable();
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
      // Implementación básica para WebAuthn
      if (navigator.credentials && window.PublicKeyCredential) {
        // Simular registro exitoso para desarrollo
        userData.biometricRegistered = true;
        userData.isAuthenticated = true;
        await this.saveUserData(userData);
        return true;
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
      // Limpiar datos de sesión
      await AsyncStorage.removeItem('current_user');
      await AsyncStorage.removeItem('is_authenticated');
      
      // Limpiar info temporal del dispositivo
      await DeviceService.clearDeviceInfo();
      
      console.log('Sesión cerrada correctamente');
    } catch (error) {
      console.error('Error cerrando sesión:', error);
    }
  }

  // Verificar si el usuario está autenticado
  static async isAuthenticated(): Promise<boolean> {
    try {
      const isAuth = await AsyncStorage.getItem('is_authenticated');
      return isAuth === 'true';
    } catch (error) {
      console.error('Error verificando autenticación:', error);
      return false;
    }
  }

  // Obtener usuario actual
  static async getCurrentUser(): Promise<UserData | null> {
    try {
      const currentUser = await AsyncStorage.getItem('current_user');
      return currentUser ? JSON.parse(currentUser) : null;
    } catch (error) {
      console.error('Error obteniendo usuario actual:', error);
      return null;
    }
  }
}

