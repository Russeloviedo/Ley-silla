// Service Worker para Análisis Bipedestación Hunter
const CACHE_NAME = 'analisis-bipedestacion-v1.0.0';
const STATIC_CACHE = 'static-v1.0.0';
const DYNAMIC_CACHE = 'dynamic-v1.0.0';

// Archivos críticos para cache
const STATIC_FILES = [
  '/',
  '/static/js/bundle.js',
  '/static/css/main.css',
  '/manifest.json',
  '/data/soporteData.json',
  '/icon-192x192.png',
  '/icon-512x512.png'
];

// Instalación del Service Worker
self.addEventListener('install', (event) => {
  console.log('🔧 Service Worker: Instalando...');
  
  event.waitUntil(
    caches.open(STATIC_CACHE)
      .then((cache) => {
        console.log('📦 Service Worker: Cacheando archivos estáticos');
        return cache.addAll(STATIC_FILES);
      })
      .then(() => {
        console.log('✅ Service Worker: Instalación completada');
        return self.skipWaiting();
      })
      .catch((error) => {
        console.error('❌ Service Worker: Error en instalación:', error);
      })
  );
});

// Activación del Service Worker
self.addEventListener('activate', (event) => {
  console.log('🚀 Service Worker: Activando...');
  
  event.waitUntil(
    caches.keys()
      .then((cacheNames) => {
        return Promise.all(
          cacheNames
            .filter((cacheName) => {
              return cacheName !== STATIC_CACHE && cacheName !== DYNAMIC_CACHE;
            })
            .map((cacheName) => {
              console.log('🗑️ Service Worker: Eliminando cache obsoleto:', cacheName);
              return caches.delete(cacheName);
            })
        );
      })
      .then(() => {
        console.log('✅ Service Worker: Activación completada');
        return self.clients.claim();
      })
  );
});

// Interceptar requests
self.addEventListener('fetch', (event) => {
  const { request } = event;
  const url = new URL(request.url);
  
  // Solo procesar requests HTTP/HTTPS
  if (!request.url.startsWith('http')) {
    return;
  }

  // Estrategia: Cache First para archivos estáticos
  if (isStaticFile(request)) {
    event.respondWith(cacheFirst(request));
  }
  // Estrategia: Network First para datos dinámicos
  else if (isDataRequest(request)) {
    event.respondWith(networkFirst(request));
  }
  // Estrategia: Stale While Revalidate para otros recursos
  else {
    event.respondWith(staleWhileRevalidate(request));
  }
});

// Verificar si es un archivo estático
function isStaticFile(request) {
  const url = new URL(request.url);
  return url.pathname.match(/\.(js|css|png|jpg|jpeg|gif|svg|ico|woff|woff2|ttf)$/);
}

// Verificar si es una request de datos
function isDataRequest(request) {
  const url = new URL(request.url);
  return url.pathname.includes('/data/') || 
         url.pathname.includes('soporteData') ||
         url.pathname.includes('api/');
}

// Estrategia Cache First
async function cacheFirst(request) {
  try {
    const cachedResponse = await caches.match(request);
    if (cachedResponse) {
      console.log('📦 Service Worker: Sirviendo desde cache:', request.url);
      return cachedResponse;
    }

    const networkResponse = await fetch(request);
    if (networkResponse.ok) {
      const cache = await caches.open(STATIC_CACHE);
      cache.put(request, networkResponse.clone());
      console.log('💾 Service Worker: Guardando en cache:', request.url);
    }
    
    return networkResponse;
  } catch (error) {
    console.error('❌ Service Worker: Error en cacheFirst:', error);
    return new Response('Error de conexión', { status: 503 });
  }
}

// Estrategia Network First
async function networkFirst(request) {
  try {
    const networkResponse = await fetch(request);
    if (networkResponse.ok) {
      const cache = await caches.open(DYNAMIC_CACHE);
      cache.put(request, networkResponse.clone());
      console.log('🌐 Service Worker: Datos actualizados desde red:', request.url);
    }
    return networkResponse;
  } catch (error) {
    console.log('📦 Service Worker: Red no disponible, sirviendo desde cache:', request.url);
    const cachedResponse = await caches.match(request);
    return cachedResponse || new Response('Datos no disponibles offline', { 
      status: 503,
      headers: { 'Content-Type': 'application/json' }
    });
  }
}

// Estrategia Stale While Revalidate
async function staleWhileRevalidate(request) {
  const cache = await caches.open(DYNAMIC_CACHE);
  const cachedResponse = await cache.match(request);
  
  const fetchPromise = fetch(request).then((networkResponse) => {
    if (networkResponse.ok) {
      cache.put(request, networkResponse.clone());
    }
    return networkResponse;
  }).catch(() => cachedResponse);

  return cachedResponse || fetchPromise;
}

// Manejar mensajes del cliente
self.addEventListener('message', (event) => {
  if (event.data && event.data.type === 'SKIP_WAITING') {
    self.skipWaiting();
  }
  
  if (event.data && event.data.type === 'GET_VERSION') {
    event.ports[0].postMessage({ version: CACHE_NAME });
  }
});

// Notificaciones push (preparado para futuras implementaciones)
self.addEventListener('push', (event) => {
  if (event.data) {
    const data = event.data.json();
    const options = {
      body: data.body,
      icon: '/icon-192x192.png',
      badge: '/icon-72x72.png',
      vibrate: [100, 50, 100],
      data: data.data,
      actions: [
        {
          action: 'open',
          title: 'Abrir aplicación',
          icon: '/icon-96x96.png'
        },
        {
          action: 'close',
          title: 'Cerrar',
          icon: '/icon-96x96.png'
        }
      ]
    };
    
    event.waitUntil(
      self.registration.showNotification(data.title, options)
    );
  }
});

// Manejar clics en notificaciones
self.addEventListener('notificationclick', (event) => {
  event.notification.close();
  
  if (event.action === 'open') {
    event.waitUntil(
      clients.openWindow('/')
    );
  }
});

console.log('🔧 Service Worker: Cargado correctamente');







