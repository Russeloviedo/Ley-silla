import { ScrollViewStyleReset } from 'expo-router/html';

// This file is web-only and used to configure the root HTML for every
// web page during static rendering.
// The contents of this function only run in Node.js environments and
// do not have access to the DOM or browser APIs.
export default function Root({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <head>
        <meta charSet="utf-8" />
        <meta httpEquiv="X-UA-Compatible" content="IE=edge" />
        <meta name="viewport" content="width=device-width, initial-scale=1, shrink-to-fit=no" />

        {/* 
          Disable body scrolling on web. This makes ScrollView components work closer to how they do on native. 
          However, body scrolling is often nice to have for mobile web. If you want to enable it, remove this line.
        */}
        <ScrollViewStyleReset />

        {/* Favicon y iconos para accesos directos */}
        <link rel="icon" href="/favicon.ico" sizes="any" />
        <link rel="apple-touch-icon" href="/apple-touch-icon.png" />
        <link rel="icon" type="image/png" sizes="96x96" href="/favicon-96x96.png" />
        
        {/* Web App Manifest para PWA */}
        <link rel="manifest" href="/manifest.json" />
        
        {/* Meta tags para iOS */}
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="default" />
        <meta name="apple-mobile-web-app-title" content="Bipedestación" />
        
        {/* Meta tags para Android */}
        <meta name="mobile-web-app-capable" content="yes" />
        <meta name="theme-color" content="#1976D2" />
        
        {/* Meta tags generales */}
        <meta name="application-name" content="Análisis Bipedestación Hunter" />
        <meta name="msapplication-TileColor" content="#1976D2" />
        <meta name="description" content="Sistema de análisis ergonómico para evaluación de puestos de trabajo" />
        
        {/* Meta tags para PWA */}
        <meta name="format-detection" content="telephone=no" />
        <meta name="msapplication-tap-highlight" content="no" />
        
        {/* Preload de recursos críticos */}
        <link rel="preload" href="/data/soporteData.json" as="fetch" crossOrigin="anonymous" />

        {/* Using raw CSS styles as an escape-hatch to ensure the background color never flickers in dark-mode. */}
        <style dangerouslySetInnerHTML={{ __html: responsiveBackground }} />
        {/* Add any additional <head> elements that you want globally available on web... */}
      </head>
      <body>{children}</body>
    </html>
  );
}

const responsiveBackground = `
html, body, #root { 
  height: 100%; 
  margin: 0; 
  padding: 0; 
}

body { 
  background-color: transparent;
  margin: 0;
  padding: 0;
}

#root {
  padding-top: 0;
  margin-top: 0;
  background-color: transparent;
}

/* Eliminar cualquier header o navbar que pueda estar causando espacio */
header, nav, .header, .navbar, .top-bar, .app-bar {
  display: none !important;
}

/* Asegurar que el contenido principal no tenga espacios superiores */
main, .main, .content, .page {
  padding-top: 0 !important;
  margin-top: 0 !important;
  background-color: transparent;
}

/* Eliminar espacios del StatusBar */
[data-status-bar] {
  display: none !important;
}

/* Asegurar que no haya espacios blancos en ningún elemento */
* {
  box-sizing: border-box;
}

/* Forzar el color de fondo en elementos específicos que puedan estar causando el problema */
div[data-testid="expo-router-view"], 
div[role="main"], 
div[class*="container"], 
div[class*="content"] {
  background-color: transparent !important;
  margin: 0 !important;
  padding: 0 !important;
}

@media (prefers-color-scheme: dark) {
  body {
    background-color: transparent;
  }
}`;
