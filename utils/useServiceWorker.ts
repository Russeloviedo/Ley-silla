import { useEffect, useState } from 'react';

interface ServiceWorkerState {
  isSupported: boolean;
  isInstalled: boolean;
  isUpdated: boolean;
  registration: ServiceWorkerRegistration | null;
  error: string | null;
}

export function useServiceWorker() {
  const [state, setState] = useState<ServiceWorkerState>({
    isSupported: 'serviceWorker' in navigator,
    isInstalled: false,
    isUpdated: false,
    registration: null,
    error: null,
  });

  useEffect(() => {
    if (!state.isSupported) {
      console.log('⚠️ Service Worker no soportado en este navegador');
      return;
    }

    let isMounted = true;

    const registerServiceWorker = async () => {
      try {
        console.log('🔧 Registrando Service Worker...');
        
        const registration = await navigator.serviceWorker.register('/sw.js', {
          scope: '/',
        });

        if (isMounted) {
          setState(prev => ({
            ...prev,
            isInstalled: true,
            registration,
          }));
        }

        console.log('✅ Service Worker registrado correctamente');

        // Verificar si hay una actualización disponible
        registration.addEventListener('updatefound', () => {
          const newWorker = registration.installing;
          
          if (newWorker) {
            newWorker.addEventListener('statechange', () => {
              if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
                console.log('🔄 Nueva versión disponible');
                if (isMounted) {
                  setState(prev => ({
                    ...prev,
                    isUpdated: true,
                  }));
                }
              }
            });
          }
        });

        // Escuchar cambios en el Service Worker
        navigator.serviceWorker.addEventListener('controllerchange', () => {
          console.log('🔄 Service Worker actualizado, recargando página...');
          window.location.reload();
        });

      } catch (error) {
        console.error('❌ Error registrando Service Worker:', error);
        if (isMounted) {
          setState(prev => ({
            ...prev,
            error: error instanceof Error ? error.message : 'Error desconocido',
          }));
        }
      }
    };

    registerServiceWorker();

    return () => {
      isMounted = false;
    };
  }, [state.isSupported]);

  const updateServiceWorker = () => {
    if (state.registration?.waiting) {
      state.registration.waiting.postMessage({ type: 'SKIP_WAITING' });
    }
  };

  const checkForUpdates = async () => {
    if (state.registration) {
      try {
        await state.registration.update();
        console.log('🔍 Verificando actualizaciones...');
      } catch (error) {
        console.error('❌ Error verificando actualizaciones:', error);
      }
    }
  };

  const clearCache = async () => {
    if ('caches' in window) {
      try {
        const cacheNames = await caches.keys();
        await Promise.all(
          cacheNames.map(cacheName => caches.delete(cacheName))
        );
        console.log('🗑️ Cache limpiado correctamente');
        window.location.reload();
      } catch (error) {
        console.error('❌ Error limpiando cache:', error);
      }
    }
  };

  return {
    ...state,
    updateServiceWorker,
    checkForUpdates,
    clearCache,
  };
}







