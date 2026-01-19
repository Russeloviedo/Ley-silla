import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Alert } from 'react-native';
import { AppColors } from '@/constants/Colors';
import { Typography } from '@/constants/Typography';
import { Spacing, BorderRadius, Shadows } from '@/constants/Spacing';
import { useServiceWorker } from '@/utils/useServiceWorker';

interface PWANotificationProps {
  onInstall?: () => void;
  onUpdate?: () => void;
}

export default function PWANotification({ onInstall, onUpdate }: PWANotificationProps) {
  const { isSupported, isInstalled, isUpdated, updateServiceWorker, checkForUpdates } = useServiceWorker();
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const [showInstallPrompt, setShowInstallPrompt] = useState(false);

  useEffect(() => {
    // Escuchar el evento beforeinstallprompt
    const handleBeforeInstallPrompt = (e: any) => {
      e.preventDefault();
      setDeferredPrompt(e);
      setShowInstallPrompt(true);
    };

    // Escuchar el evento appinstalled
    const handleAppInstalled = () => {
      console.log('✅ PWA instalada correctamente');
      setShowInstallPrompt(false);
      setDeferredPrompt(null);
      onInstall?.();
    };

    if (typeof window !== 'undefined') {
      window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
      window.addEventListener('appinstalled', handleAppInstalled);
    }

    return () => {
      if (typeof window !== 'undefined') {
        window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
        window.removeEventListener('appinstalled', handleAppInstalled);
      }
    };
  }, [onInstall]);

  const handleInstallClick = async () => {
    if (deferredPrompt) {
      deferredPrompt.prompt();
      const { outcome } = await deferredPrompt.userChoice;
      
      if (outcome === 'accepted') {
        console.log('✅ Usuario aceptó instalar la PWA');
      } else {
        console.log('❌ Usuario rechazó instalar la PWA');
      }
      
      setDeferredPrompt(null);
      setShowInstallPrompt(false);
    }
  };

  const handleUpdateClick = () => {
    updateServiceWorker();
    onUpdate?.();
  };

  const handleCheckUpdates = () => {
    checkForUpdates();
  };

  if (!isSupported) {
    return null;
  }

  return (
    <View style={styles.container}>
      {/* Notificación de actualización disponible */}
      {isUpdated && (
        <View style={[styles.notification, styles.updateNotification]}>
          <View style={styles.notificationContent}>
            <Text style={styles.notificationIcon}>🔄</Text>
            <View style={styles.notificationText}>
              <Text style={styles.notificationTitle}>Actualización Disponible</Text>
              <Text style={styles.notificationMessage}>
                Hay una nueva versión de la aplicación disponible
              </Text>
            </View>
          </View>
          <View style={styles.notificationActions}>
            <TouchableOpacity
              style={[styles.actionButton, styles.updateButton]}
              onPress={handleUpdateClick}
            >
              <Text style={styles.actionButtonText}>Actualizar</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.actionButton, styles.secondaryButton]}
              onPress={handleCheckUpdates}
            >
              <Text style={[styles.actionButtonText, styles.secondaryButtonText]}>Verificar</Text>
            </TouchableOpacity>
          </View>
        </View>
      )}

      {/* Notificación de instalación */}
      {showInstallPrompt && !isInstalled && (
        <View style={[styles.notification, styles.installNotification]}>
          <View style={styles.notificationContent}>
            <Text style={styles.notificationIcon}>📱</Text>
            <View style={styles.notificationText}>
              <Text style={styles.notificationTitle}>Instalar Aplicación</Text>
              <Text style={styles.notificationMessage}>
                Instala esta aplicación para una mejor experiencia
              </Text>
            </View>
          </View>
          <View style={styles.notificationActions}>
            <TouchableOpacity
              style={[styles.actionButton, styles.installButton]}
              onPress={handleInstallClick}
            >
              <Text style={styles.actionButtonText}>Instalar</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.actionButton, styles.secondaryButton]}
              onPress={() => setShowInstallPrompt(false)}
            >
              <Text style={[styles.actionButtonText, styles.secondaryButtonText]}>Ahora no</Text>
            </TouchableOpacity>
          </View>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    zIndex: 1000,
  },
  notification: {
    margin: Spacing.md,
    borderRadius: BorderRadius.lg,
    ...Shadows.lg,
    overflow: 'hidden',
  },
  updateNotification: {
    backgroundColor: AppColors.warning + '20',
    borderLeftWidth: 4,
    borderLeftColor: AppColors.warning,
  },
  installNotification: {
    backgroundColor: AppColors.primary + '20',
    borderLeftWidth: 4,
    borderLeftColor: AppColors.primary,
  },
  notificationContent: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: Spacing.md,
  },
  notificationIcon: {
    fontSize: 24,
    marginRight: Spacing.sm,
  },
  notificationText: {
    flex: 1,
  },
  notificationTitle: {
    ...Typography.h4,
    color: AppColors.textPrimary,
    marginBottom: Spacing.xs,
  },
  notificationMessage: {
    ...Typography.body2,
    color: AppColors.textSecondary,
  },
  notificationActions: {
    flexDirection: 'row',
    paddingHorizontal: Spacing.md,
    paddingBottom: Spacing.md,
    gap: Spacing.sm,
  },
  actionButton: {
    flex: 1,
    paddingVertical: Spacing.sm,
    paddingHorizontal: Spacing.md,
    borderRadius: BorderRadius.md,
    alignItems: 'center',
  },
  updateButton: {
    backgroundColor: AppColors.warning,
  },
  installButton: {
    backgroundColor: AppColors.primary,
  },
  secondaryButton: {
    backgroundColor: AppColors.backgroundSecondary,
    borderWidth: 1,
    borderColor: AppColors.border,
  },
  actionButtonText: {
    ...Typography.caption,
    color: AppColors.background,
    fontWeight: '600',
  },
  secondaryButtonText: {
    color: AppColors.textPrimary,
  },
});
