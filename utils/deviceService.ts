import AsyncStorage from '@react-native-async-storage/async-storage';
import { Platform } from 'react-native';
import * as Device from 'expo-device';
import * as Application from 'expo-application';

export interface DeviceInfo {
  deviceId: string;
  platform: string;
  deviceName: string;
  appVersion: string;
  buildNumber: string;
  deviceYearClass?: number;
  totalMemory?: number;
  fingerprint: string;
}

export class DeviceService {
  private static DEVICE_ID_KEY = 'device_unique_id';
  private static DEVICE_INFO_KEY = 'device_info';

  // Generar o recuperar ID único del dispositivo
  static async getDeviceId(): Promise<string> {
    try {
      // Intentar recuperar ID existente
      let deviceId = await AsyncStorage.getItem(this.DEVICE_ID_KEY);
      
      if (!deviceId) {
        // Generar nuevo ID si no existe
        deviceId = await this.generateDeviceId();
        await AsyncStorage.setItem(this.DEVICE_ID_KEY, deviceId);
      }
      
      return deviceId;
    } catch (error) {
      console.error('Error obteniendo Device ID:', error);
      // Fallback: generar ID temporal
      return this.generateTemporaryId();
    }
  }

  // Generar ID único basado en características del dispositivo
  private static async generateDeviceId(): Promise<string> {
    try {
      // Obtener info del dispositivo SIN llamar a getDeviceInfo para evitar bucle
      const platform = Platform.OS;
      const deviceName = Device.deviceName || 'Unknown Device';
      const appVersion = Application.nativeApplicationVersion || '1.0.0';
      const buildNumber = Application.nativeBuildVersion || '1';
      
      // Crear hash único basado en características del dispositivo
      const deviceString = `${platform}_${deviceName}_${appVersion}_${buildNumber}`;
      
      // Generar hash simple (en producción usar crypto)
      let hash = 0;
      for (let i = 0; i < deviceString.length; i++) {
        const char = deviceString.charCodeAt(i);
        hash = ((hash << 5) - hash) + char;
        hash = hash & hash; // Convertir a 32-bit integer
      }
      
      return `device_${Math.abs(hash).toString(36)}_${Date.now().toString(36)}`;
    } catch (error) {
      console.error('Error generando Device ID:', error);
      return this.generateTemporaryId();
    }
  }

  // Generar ID temporal como fallback
  private static generateTemporaryId(): string {
    return `temp_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  // Obtener información completa del dispositivo
  static async getDeviceInfo(): Promise<DeviceInfo> {
    try {
      // Intentar recuperar info guardada
      const savedInfo = await AsyncStorage.getItem(this.DEVICE_INFO_KEY);
      if (savedInfo) {
        return JSON.parse(savedInfo);
      }

      // Generar nueva info del dispositivo SIN llamar a getDeviceId para evitar bucle
      const deviceId = await this.getDeviceId();
      const deviceInfo: DeviceInfo = {
        deviceId: deviceId,
        platform: Platform.OS,
        deviceName: Device.deviceName || 'Unknown Device',
        appVersion: Application.nativeApplicationVersion || '1.0.0',
        buildNumber: Application.nativeBuildVersion || '1',
        deviceYearClass: Device.deviceYearClass,
        totalMemory: Device.totalMemory,
        fingerprint: await this.generateDeviceFingerprint()
      };

      // Guardar info del dispositivo
      await AsyncStorage.setItem(this.DEVICE_INFO_KEY, JSON.stringify(deviceInfo));
      
      return deviceInfo;
    } catch (error) {
      console.error('Error obteniendo Device Info:', error);
      // Retornar info básica como fallback SIN llamar a getDeviceId
      return {
        deviceId: this.generateTemporaryId(),
        platform: Platform.OS,
        deviceName: 'Unknown Device',
        appVersion: '1.0.0',
        buildNumber: '1',
        fingerprint: 'unknown'
      };
    }
  }

  // Generar fingerprint único del dispositivo
  private static async generateDeviceFingerprint(): Promise<string> {
    try {
      const fingerprint = [
        Platform.OS,
        Platform.Version,
        Device.deviceName,
        Device.deviceYearClass,
        Device.totalMemory,
        Application.nativeApplicationVersion,
        Application.nativeBuildVersion
      ].filter(Boolean).join('_');
      
      // Hash simple del fingerprint
      let hash = 0;
      for (let i = 0; i < fingerprint.length; i++) {
        const char = fingerprint.charCodeAt(i);
        hash = ((hash << 5) - hash) + char;
        hash = hash & hash;
      }
      
      return `fp_${Math.abs(hash).toString(36)}`;
    } catch (error) {
      console.error('Error generando fingerprint:', error);
      return 'fp_unknown';
    }
  }

  // Verificar si el dispositivo actual coincide con uno guardado
  static async isSameDevice(savedDeviceId: string): Promise<boolean> {
    try {
      const currentDeviceId = await this.getDeviceId();
      return currentDeviceId === savedDeviceId;
    } catch (error) {
      console.error('Error verificando dispositivo:', error);
      return false;
    }
  }

  // Limpiar información del dispositivo (para logout)
  static async clearDeviceInfo(): Promise<void> {
    try {
      // NO eliminar el Device ID - debe persistir
      // Solo limpiar info temporal
      await AsyncStorage.removeItem(this.DEVICE_INFO_KEY);
    } catch (error) {
      console.error('Error limpiando Device Info:', error);
    }
  }

  // Obtener Device ID sin generar uno nuevo
  static async getExistingDeviceId(): Promise<string | null> {
    try {
      return await AsyncStorage.getItem(this.DEVICE_ID_KEY);
    } catch (error) {
      console.error('Error obteniendo Device ID existente:', error);
      return null;
    }
  }

  // Método simplificado para obtener solo el Device ID básico
  static async getSimpleDeviceId(): Promise<string> {
    try {
      let deviceId = await AsyncStorage.getItem(this.DEVICE_ID_KEY);
      
      if (!deviceId) {
        // Generar ID simple sin llamadas recursivas
        deviceId = `device_${Platform.OS}_${Date.now()}_${Math.random().toString(36).substr(2, 5)}`;
        await AsyncStorage.setItem(this.DEVICE_ID_KEY, deviceId);
      }
      
      return deviceId;
    } catch (error) {
      console.error('Error obteniendo Device ID simple:', error);
      return `temp_${Date.now()}_${Math.random().toString(36).substr(2, 5)}`;
    }
  }
}
