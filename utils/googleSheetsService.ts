import { Alert } from 'react-native';

const GOOGLE_SCRIPT_URL = 'https://script.google.com/macros/s/AKfycbzeg-xbS16QdqO3LgGbxNUXvQJX357UgLmN8daGK58DCHWYP9zE5r7TaL2YQDGWRq4p9A/exec';

export const GoogleSheetsService = {
    /**
     * Sincroniza datos con Google Sheets
     * @param tipo 'identificacion' | 'matriz'
     * @param datos Array de objetos con los datos a sincronizar
     */
    syncData: async (tipo: 'identificacion' | 'matriz', datos: any[]) => {
        if (!datos || datos.length === 0) {
            console.log('⚠️ No hay datos para sincronizar');
            return { success: false, message: 'No hay datos para sincronizar' };
        }

        try {
            console.log(`🚀 Iniciando sincronización de ${datos.length} registros de tipo: ${tipo}...`);

            const response = await fetch(GOOGLE_SCRIPT_URL, {
                method: 'POST',
                mode: 'no-cors', // Importante para Google Apps Script
                headers: {
                    'Content-Type': 'text/plain',
                },
                body: JSON.stringify({
                    tipo: tipo,
                    datos: datos
                }),
            });

            // Con no-cors, la respuesta es opaca (type: 'opaque'). 
            // No podemos leer el status ni el body.
            // Si llega aquí sin lanzar excepción, asumimos que la petición salió.
            console.log('📡 Petición enviada (modo no-cors). Asumiendo éxito.');

            return { success: true, count: datos.length, message: 'Enviado (sin confirmación de servidor)' };

        } catch (error) {
            console.error('❌ Error en sincronización:', error);
            return { success: false, message: error instanceof Error ? error.message : 'Error desconocido de red' };
        }
    }
};
