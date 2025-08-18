// utils/firestoreService.ts
import { HistorialAnalisis } from '@/types';

// Configuración de Firestore
const FIRESTORE_BASE_URL = 'https://firestore.googleapis.com/v1/projects/departamentoehsmexico/databases/(default)/documents';
const IDENTIFICACION_URL = `${FIRESTORE_BASE_URL}/identificacion`;
const MATRIZ_RIESGO_URL = `${FIRESTORE_BASE_URL}/matriz_riesgo`;
const ANALISIS_ANTERIOR_URL = `${FIRESTORE_BASE_URL}/analisis_bipedestacion`;

// Nueva colección para la estructura de 5 niveles
const NUEVA_ESTRUCTURA_URL = `${FIRESTORE_BASE_URL}/nueva_estructura`;

// Helpers de lectura tolerantes (string o integer)
const readString = (f: any, k: string): string => f?.[k]?.stringValue ?? '';
const readTS = (f: any, k: string): string => f?.[k]?.timestampValue ?? '';
const readNumberFlexible = (f: any, k: string): number => {
  if (f?.[k]?.integerValue != null) return Number(f[k].integerValue);
  const s = f?.[k]?.stringValue;
  if (s == null) return 0;
  const m = String(s).match(/-?\d+/);
  return m ? Number(m[0]) : 0;
};

export class FirestoreService {
  // Obtener datos de la colección anterior (respaldo)
  static async getAnalisisAnteriorData(limit: number = 1000): Promise<any[]> {
    try {
      console.log('📥 Obteniendo datos de la colección anterior...');
      const order = encodeURIComponent('timestamp desc');
      const url = `${ANALISIS_ANTERIOR_URL}?orderBy=${order}&pageSize=${limit}`;
      const response = await fetch(url, { method: 'GET', headers: { 'Content-Type': 'application/json' } });

      if (!response.ok) throw new Error(`HTTP ${response.status}: ${response.statusText}`);

      const result = await response.json();
      const documents = result.documents || [];

      const analisisData = documents.map((doc: any) => {
        const fields = doc.fields || {};
        return {
          // New 5-selection fields (prob vacíos en legacy)
          businessUnit: readString(fields, 'businessUnit'),
          plant: readString(fields, 'plant'),
          shift: readString(fields, 'shift'),
          area: readString(fields, 'area'),
          position: readString(fields, 'position'),
          
          // Legacy fields
          unidad: readString(fields, 'unidad'),
          puesto: readString(fields, 'puesto'),
          subpuesto: readString(fields, 'subpuesto'),
          flujo: readString(fields, 'flujo'),
          puntaje: readNumberFlexible(fields, 'puntaje'),
          nivel: readString(fields, 'nivel'),
          fecha: readString(fields, 'fecha'),
          pregunta1: readString(fields, 'pregunta1'),
          pregunta2: readString(fields, 'pregunta2'),
          pregunta3: readString(fields, 'pregunta3'),
          pregunta4: readString(fields, 'pregunta4'),
          pregunta5: readString(fields, 'pregunta5'),
          pregunta6: readString(fields, 'pregunta6'),
          pregunta7: readString(fields, 'pregunta7'),
          pregunta8: readString(fields, 'pregunta8'),
          pregunta9: readString(fields, 'pregunta9'),
          ponderacion1: readNumberFlexible(fields, 'ponderacion1'),
          ponderacion2: readNumberFlexible(fields, 'ponderacion2'),
          ponderacion3: readNumberFlexible(fields, 'ponderacion3'),
          ponderacion4: readNumberFlexible(fields, 'ponderacion4'),
          ponderacion5: readNumberFlexible(fields, 'ponderacion5'),
          ponderacion6: readNumberFlexible(fields, 'ponderacion6'),
          ponderacion7: readNumberFlexible(fields, 'ponderacion7'),
          timestamp: readTS(fields, 'timestamp')
        };
      });

      console.log(`✅ Obtenidos ${analisisData.length} registros de la colección anterior`);
      return analisisData;
    } catch (error) {
      console.error('❌ Error al obtener datos de la colección anterior:', error);
      return [];
    }
  }

  // Obtener datos de la nueva colección de estructura de 5 niveles
  static async getNuevaEstructuraData(limit: number = 1000): Promise<any[]> {
    try {
      console.log('📥 Obteniendo datos de la nueva colección de estructura de 5 niveles...');
      const order = encodeURIComponent('timestamp desc');
      const url = `${NUEVA_ESTRUCTURA_URL}?orderBy=${order}&pageSize=${limit}`;
      const response = await fetch(url, { method: 'GET', headers: { 'Content-Type': 'application/json' } });

      if (!response.ok) throw new Error(`HTTP ${response.status}: ${response.statusText}`);

      const result = await response.json();
      const documents = result.documents || [];

      const nuevaEstructuraData = documents.map((doc: any) => {
        const fields = doc.fields || {};
        return {
          // Campos de la nueva estructura de 5 niveles
          unidadDeNegocio: readString(fields, 'unidadDeNegocio'),
          planta: readString(fields, 'planta'),
          turno: readString(fields, 'turno'),
          area: readString(fields, 'area'),
          puesto: readString(fields, 'puesto'),
          
          // Campos de identificación
          pregunta1: readString(fields, 'pregunta1'),
          pregunta2: readString(fields, 'pregunta2'),
          pregunta3: readString(fields, 'pregunta3'),
          pregunta4: readString(fields, 'pregunta4'),
          pregunta5: readString(fields, 'pregunta5'),
          pregunta6: readString(fields, 'pregunta6'),
          pregunta7: readString(fields, 'pregunta7'),
          pregunta8: readString(fields, 'pregunta8'),
          pregunta9: readString(fields, 'pregunta9'),
          flujo: readString(fields, 'flujo'),

          // Campos de matriz de riesgo (guardados como string "N/A" o "N pt")
          ponderacion1: readNumberFlexible(fields, 'ponderacion1'),
          ponderacion2: readNumberFlexible(fields, 'ponderacion2'),
          ponderacion3: readNumberFlexible(fields, 'ponderacion3'),
          ponderacion4: readNumberFlexible(fields, 'ponderacion4'),
          ponderacion5: readNumberFlexible(fields, 'ponderacion5'),
          ponderacion6: readNumberFlexible(fields, 'ponderacion6'),
          ponderacion7: readNumberFlexible(fields, 'ponderacion7'),
          nivel: readString(fields, 'nivel'),
          puntaje: readNumberFlexible(fields, 'puntaje'),
          
          // Campos adicionales
          fecha: readString(fields, 'fecha'),
          timestamp: readTS(fields, 'timestamp')
        };
      });

      console.log(`✅ Obtenidos ${nuevaEstructuraData.length} registros de la nueva estructura`);
      return nuevaEstructuraData;
    } catch (error) {
      console.error('❌ Error al obtener datos de la nueva estructura:', error);
      return [];
    }
  }

  // Migrar datos de la colección anterior a las nuevas colecciones
  static async migrarDatosAnteriores(): Promise<{ migrados: number; errores: number }> {
    try {
      console.log('🔄 Iniciando migración de datos...');
      const datosAnteriores = await this.getAnalisisAnteriorData(1000);
      let migrados = 0;
      let errores = 0;

      for (const analisis of datosAnteriores) {
        try {
          await this.saveAnalysis(analisis);
          migrados++;
        } catch (error) {
          console.error('Error al migrar análisis:', error);
          errores++;
        }
      }

      console.log(`✅ Migración completada: ${migrados} migrados, ${errores} errores`);
      return { migrados, errores };
    } catch (error) {
      console.error('❌ Error en la migración:', error);
      throw error;
    }
  }

  // Guardar un análisis en Firestore - Nueva lógica para estructura de 5 niveles
  static async saveAnalysis(analysis: HistorialAnalisis): Promise<{ identificacionId: string; matrizRiesgoId: string }> {
    try {
      console.log('📤 Guardando análisis en Firestore usando fetch directo...');
              const isNuevaEstructura = analysis.unidadDeNegocio || analysis.planta || analysis.area;
      
      if (isNuevaEstructura) {
        console.log('🆕 Guardando en nueva colección de estructura de 5 niveles...');
        return await this.saveAnalysisNuevaEstructura(analysis);
      } else {
        console.log('📋 Guardando en colecciones legacy...');
        return await this.saveAnalysisLegacy(analysis);
      }
    } catch (error) {
      console.error('❌ Error al guardar en Firestore:', error);
      throw error;
    }
  }

  // Guardar análisis en la nueva colección de estructura de 5 niveles
  private static async saveAnalysisNuevaEstructura(analysis: HistorialAnalisis): Promise<{ identificacionId: string; matrizRiesgoId: string }> {
    try {
      console.log('🆕 Guardando análisis de nueva estructura en Firestore...');

      const esNoDecreto = String(analysis.flujo || '').trim().toUpperCase() === 'NO_DECRETO';
      
      // Preparar datos para la nueva colección
      const nuevaEstructuraData = {
        fields: {
          // Campos de la nueva estructura de 5 niveles
          unidadDeNegocio: { stringValue: analysis.unidadDeNegocio || '' },
          planta: { stringValue: analysis.planta || '' },
          turno: { stringValue: analysis.turno || '' },
          area: { stringValue: analysis.area || '' },
          puesto: { stringValue: analysis.puesto || '' },
          
          // Respuestas del cuestionario de ponderación (strings)
          ponderacion1: { stringValue: esNoDecreto ? 'N/A' : (analysis.ponderacion1 || '') },
          ponderacion2: { stringValue: esNoDecreto ? 'N/A' : (analysis.ponderacion2 || '') },
          ponderacion3: { stringValue: esNoDecreto ? 'N/A' : (analysis.ponderacion3 || '') },
          ponderacion4: { stringValue: esNoDecreto ? 'N/A' : (analysis.ponderacion4 || '') },
          ponderacion5: { stringValue: esNoDecreto ? 'N/A' : (analysis.ponderacion5 || '') },
          ponderacion6: { stringValue: esNoDecreto ? 'N/A' : (analysis.ponderacion6 || '') },
          ponderacion7: { stringValue: esNoDecreto ? 'N/A' : (analysis.ponderacion7 || '') },
          
          // Resultados finales
          nivel: { stringValue: esNoDecreto ? 'N/A' : (analysis.nivel || '') },
          puntaje: { stringValue: esNoDecreto ? 'N/A' : (analysis.puntaje || '') },
          
          // Campo de flujo de decisión
          flujo: { stringValue: analysis.flujo || '' },
          
          // Respuestas de las preguntas iniciales y del diagrama de flujo
          pregunta1: { stringValue: analysis.pregunta1 || '' },
          pregunta2: { stringValue: analysis.pregunta2 || '' },
          pregunta3: { stringValue: analysis.pregunta3 || '' },
          pregunta4: { stringValue: analysis.pregunta4 || '' },
          pregunta5: { stringValue: analysis.pregunta5 || '' },
          pregunta6: { stringValue: analysis.pregunta6 || '' },
          pregunta7: { stringValue: analysis.pregunta7 || '' },
          pregunta8: { stringValue: analysis.pregunta8 || '' },
          pregunta9: { stringValue: analysis.pregunta9 || '' },
          
          // Campo para determinar si requiere análisis
          requiereAnalisis: { stringValue: esNoDecreto ? 'No' : 'Sí' },
          
          // Campos adicionales
          fecha: { stringValue: analysis.fecha || '' },
          timestamp: { timestampValue: new Date().toISOString() }
        }
      };

      // Guardar en la nueva colección
      const response = await fetch(NUEVA_ESTRUCTURA_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(nuevaEstructuraData)
      });

      if (!response.ok) throw new Error(`HTTP ${response.status}: ${response.statusText}`);

      const result = await response.json();
      const documentId = result.name.split('/').pop();

      console.log('✅ Análisis de nueva estructura guardado con ID:', documentId);
      return { identificacionId: documentId, matrizRiesgoId: documentId };
    } catch (error) {
      console.error('❌ Error al guardar análisis de nueva estructura:', error);
      throw error;
    }
  }

  // Guardar análisis en colecciones legacy (para compatibilidad)
  private static async saveAnalysisLegacy(analysis: HistorialAnalisis): Promise<{ identificacionId: string; matrizRiesgoId: string }> {
    try {
      console.log('📋 Guardando análisis legacy en Firestore...');

      const esNoDecreto = String(analysis.flujo || '').trim().toUpperCase() === 'NO_DECRETO';
      
      // Preparar datos para la colección de identificación
      const identificacionData = {
        fields: {
          // Legacy fields
          unidad: { stringValue: analysis.unidad || '' },
          puesto: { stringValue: analysis.puesto || '' },
          subpuesto: { stringValue: analysis.subpuesto || '' },
          
          pregunta1: { stringValue: analysis.pregunta1 || '' },
          pregunta2: { stringValue: analysis.pregunta2 || '' },
          pregunta3: { stringValue: analysis.pregunta3 || '' },
          pregunta4: { stringValue: analysis.pregunta4 || '' },
          pregunta5: { stringValue: analysis.pregunta5 || '' },
          pregunta6: { stringValue: analysis.pregunta6 || '' },
          pregunta7: { stringValue: analysis.pregunta7 || '' },
          pregunta8: { stringValue: analysis.pregunta8 || '' },
          pregunta9: { stringValue: analysis.pregunta9 || '' },
          aplicaDecreto: { stringValue: esNoDecreto ? 'No' : 'Sí' },
          timestamp: { timestampValue: new Date().toISOString() }
        }
      };

      // Preparar datos para la colección de matriz de riesgo
      const matrizRiesgoData = {
        fields: {
          unidad: { stringValue: analysis.unidad || '' },
          puesto: { stringValue: analysis.puesto || '' },
          subpuesto: { stringValue: analysis.subpuesto || '' },
          
          ponderacion1: { stringValue: esNoDecreto ? 'N/A' : (analysis.ponderacion1 || '') },
          ponderacion2: { stringValue: esNoDecreto ? 'N/A' : (analysis.ponderacion2 || '') },
          ponderacion3: { stringValue: esNoDecreto ? 'N/A' : (analysis.ponderacion3 || '') },
          ponderacion4: { stringValue: esNoDecreto ? 'N/A' : (analysis.ponderacion4 || '') },
          ponderacion5: { stringValue: esNoDecreto ? 'N/A' : (analysis.ponderacion5 || '') },
          ponderacion6: { stringValue: esNoDecreto ? 'N/A' : (analysis.ponderacion6 || '') },
          ponderacion7: { stringValue: esNoDecreto ? 'N/A' : (analysis.ponderacion7 || '') },
          nivel: { stringValue: esNoDecreto ? 'N/A' : (analysis.nivel || '') },
          puntaje: { stringValue: esNoDecreto ? 'N/A' : (analysis.puntaje || '') },
          timestamp: { timestampValue: new Date().toISOString() }
        }
      };

      // Guardar en identificación
      const responseIdent = await fetch(IDENTIFICACION_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(identificacionData)
      });
      if (!responseIdent.ok) throw new Error(`HTTP ${responseIdent.status}: ${responseIdent.statusText}`);
      const resultIdent = await responseIdent.json();
      const identificacionId = resultIdent.name.split('/').pop();

      // Guardar en matriz de riesgo
      const responseMatriz = await fetch(MATRIZ_RIESGO_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(matrizRiesgoData)
      });
      if (!responseMatriz.ok) throw new Error(`HTTP ${responseMatriz.status}: ${responseMatriz.statusText}`);
      const resultMatriz = await responseMatriz.json();
      const matrizRiesgoId = resultMatriz.name.split('/').pop();

      console.log('✅ Análisis legacy guardado con IDs:', { identificacionId, matrizRiesgoId });
      return { identificacionId, matrizRiesgoId };
    } catch (error) {
      console.error('❌ Error al guardar análisis legacy:', error);
      throw error;
    }
  }

  // Obtener datos de identificación desde Firestore (legacy)
  static async getIdentificacionData(limit: number = 1000): Promise<any[]> {
    try {
      console.log('📥 Obteniendo datos de identificación desde Firestore...');
      const order = encodeURIComponent('timestamp desc');
      const url = `${IDENTIFICACION_URL}?orderBy=${order}&pageSize=${limit}`;
      const response = await fetch(url, { method: 'GET', headers: { 'Content-Type': 'application/json' } });

      if (!response.ok) throw new Error(`HTTP ${response.status}: ${response.statusText}`);

      const result = await response.json();
      const documents = result.documents || [];

      const identificacionData = documents.map((doc: any) => {
        const fields = doc.fields || {};
        return {
          unidad: readString(fields, 'unidad'),
          puesto: readString(fields, 'puesto'),
          subpuesto: readString(fields, 'subpuesto'),
          pregunta1: readString(fields, 'pregunta1'),
          pregunta2: readString(fields, 'pregunta2'),
          pregunta3: readString(fields, 'pregunta3'),
          pregunta4: readString(fields, 'pregunta4'),
          pregunta5: readString(fields, 'pregunta5'),
          pregunta6: readString(fields, 'pregunta6'),
          pregunta7: readString(fields, 'pregunta7'),
          pregunta8: readString(fields, 'pregunta8'),
          pregunta9: readString(fields, 'pregunta9'),
          aplicaDecreto: readString(fields, 'aplicaDecreto'),
          timestamp: readTS(fields, 'timestamp')
        };
      });

      console.log(`✅ Obtenidos ${identificacionData.length} registros de identificación`);
      return identificacionData;
    } catch (error) {
      console.error('❌ Error al obtener datos de identificación:', error);
      return [];
    }
  }

  // Obtener datos de matriz de riesgo desde Firestore (legacy)
  static async getMatrizRiesgoData(limit: number = 1000): Promise<any[]> {
    try {
      console.log('📥 Obteniendo datos de matriz de riesgo desde Firestore...');
      const order = encodeURIComponent('timestamp desc');
      const url = `${MATRIZ_RIESGO_URL}?orderBy=${order}&pageSize=${limit}`;
      const response = await fetch(url, { method: 'GET', headers: { 'Content-Type': 'application/json' } });

      if (!response.ok) throw new Error(`HTTP ${response.status}: ${response.statusText}`);

      const result = await response.json();
      const documents = result.documents || [];

      const matrizRiesgoData = documents.map((doc: any) => {
        const fields = doc.fields || {};
        return {
          unidad: readString(fields, 'unidad'),
          puesto: readString(fields, 'puesto'),
          subpuesto: readString(fields, 'subpuesto'),
          ponderacion1: readNumberFlexible(fields, 'ponderacion1'),
          ponderacion2: readNumberFlexible(fields, 'ponderacion2'),
          ponderacion3: readNumberFlexible(fields, 'ponderacion3'),
          ponderacion4: readNumberFlexible(fields, 'ponderacion4'),
          ponderacion5: readNumberFlexible(fields, 'ponderacion5'),
          ponderacion6: readNumberFlexible(fields, 'ponderacion6'),
          ponderacion7: readNumberFlexible(fields, 'ponderacion7'),
          nivel: readString(fields, 'nivel'),
          puntaje: readNumberFlexible(fields, 'puntaje'),
          timestamp: readTS(fields, 'timestamp')
        };
      });

      console.log(`✅ Obtenidos ${matrizRiesgoData.length} registros de matriz de riesgo`);
      return matrizRiesgoData;
    } catch (error) {
      console.error('❌ Error al obtener datos de matriz de riesgo:', error);
      return [];
    }
  }

  // Obtener datos combinados de identificación y matriz de riesgo para la nueva estructura
  static async getIdentificacionDataCombinada(limit: number = 1000): Promise<any[]> {
    try {
      console.log('📥 Obteniendo datos combinados de identificación para nueva estructura...');
      const nuevaEstructuraData = await this.getNuevaEstructuraData(limit);
      const legacyData = await this.getIdentificacionData(limit);

      const legacyConverted = legacyData.map(item => ({
        unidadDeNegocio: item.unidad || '',
        planta: item.puesto || '',    // legacy: puesto ≈ planta
        turno: item.subpuesto || '',  // legacy: subpuesto ≈ turno
        area: '',                     // N/D en legacy
        puesto: '',                   // N/D en legacy
        pregunta1: item.pregunta1 || '',
        pregunta2: item.pregunta2 || '',
        pregunta3: item.pregunta3 || '',
        pregunta4: item.pregunta4 || '',
        pregunta5: item.pregunta5 || '',
        pregunta6: item.pregunta6 || '',
        pregunta7: item.pregunta7 || '',
        pregunta8: item.pregunta8 || '',
        pregunta9: item.pregunta9 || '',
        flujo: item.aplicaDecreto === 'No' ? 'NO_DECRETO' : 'SÍ_DECRETO',
        requiereAnalisis: item.aplicaDecreto === 'No' ? 'No' : 'Sí',
        fecha: item.fecha || '',
        timestamp: item.timestamp
      }));

      const combinedData = [...nuevaEstructuraData, ...legacyConverted];
      console.log(`✅ Obtenidos ${combinedData.length} registros combinados de identificación`);
      return combinedData;
    } catch (error) {
      console.error('❌ Error al obtener datos combinados de identificación:', error);
      return [];
    }
  }

  // Obtener datos combinados de matriz de riesgo para la nueva estructura
  static async getMatrizRiesgoDataCombinada(limit: number = 1000): Promise<any[]> {
    try {
      console.log('📥 Obteniendo datos combinados de matriz de riesgo para nueva estructura...');
      const nuevaEstructuraData = await this.getNuevaEstructuraData(limit);
      const legacyData = await this.getMatrizRiesgoData(limit);

      const legacyConverted = legacyData.map(item => ({
        unidadDeNegocio: item.unidad || '',
        planta: item.puesto || '',    // legacy: puesto ≈ planta
        turno: item.subpuesto || '',  // legacy: subpuesto ≈ turno
        area: '',                     // N/D en legacy
        puesto: '',                   // N/D en legacy
        ponderacion1: item.ponderacion1 || 0,
        ponderacion2: item.ponderacion2 || 0,
        ponderacion3: item.ponderacion3 || 0,
        ponderacion4: item.ponderacion4 || 0,
        ponderacion5: item.ponderacion5 || 0,
        ponderacion6: item.ponderacion6 || 0,
        ponderacion7: item.ponderacion7 || 0,
        nivel: item.nivel || '',
        puntaje: item.puntaje || 0,
        fecha: item.fecha || '',
        timestamp: item.timestamp
      }));

      const combinedData = [...nuevaEstructuraData, ...legacyConverted];
      console.log(`✅ Obtenidos ${combinedData.length} registros combinados de matriz de riesgo`);
      return combinedData;
    } catch (error) {
      console.error('❌ Error al obtener datos combinados de matriz de riesgo:', error);
      return [];
    }
  }

  // Obtener análisis globales de la nueva colección
  static async getAnalisisGlobales(limit: number = 1000): Promise<any[]> {
    try {
      console.log('📥 Obteniendo análisis globales...');
      
      // URL de la nueva colección global
      const url = `${NUEVA_ESTRUCTURA_URL}?orderBy=timestamp desc&pageSize=${limit}`;
      const response = await fetch(url, { method: 'GET', headers: { 'Content-Type': 'application/json' } });

      if (!response.ok) throw new Error(`HTTP ${response.status}: ${response.statusText}`);

      const result = await response.json();
      const documents = result.documents || [];

      // Mapa para evitar duplicaciones basadas en combinación única de campos
      const analisisUnicos = new Map();
      
      const analisisGlobales = documents.map((doc: any) => {
        const fields = doc.fields || {};
        const analisis = {
          id: doc.name?.split('/').pop() || '',
          unidadDeNegocio: readString(fields, 'unidadDeNegocio'),
          planta: readString(fields, 'planta'),
          turno: readString(fields, 'turno'),
          area: readString(fields, 'area'),
          puesto: readString(fields, 'puesto'),
          flujo: readString(fields, 'flujo'),
          // Preguntas de identificación
          pregunta1: readString(fields, 'pregunta1'),
          pregunta2: readString(fields, 'pregunta2'),
          pregunta3: readString(fields, 'pregunta3'),
          pregunta4: readString(fields, 'pregunta4'),
          pregunta5: readString(fields, 'pregunta5'),
          pregunta6: readString(fields, 'pregunta6'),
          pregunta7: readString(fields, 'pregunta7'),
          pregunta8: readString(fields, 'pregunta8'),
          pregunta9: readString(fields, 'pregunta9'),
          // Ponderaciones
          ponderacion1: readString(fields, 'ponderacion1'),
          ponderacion2: readString(fields, 'ponderacion2'),
          ponderacion3: readString(fields, 'ponderacion3'),
          ponderacion4: readString(fields, 'ponderacion4'),
          ponderacion5: readString(fields, 'ponderacion5'),
          ponderacion6: readString(fields, 'ponderacion6'),
          ponderacion7: readString(fields, 'ponderacion7'),
          puntaje: readString(fields, 'puntaje'),
          nivel: readString(fields, 'nivel'),
          requiereAnalisis: readString(fields, 'requiereAnalisis'),
          // Fechas
          fechaHora: readString(fields, 'fecha') || readTS(fields, 'timestamp'),
          timestamp: readTS(fields, 'timestamp')
        };

        // Crear clave única para evitar duplicaciones
        const claveUnica = `${analisis.unidadDeNegocio}|${analisis.planta}|${analisis.turno}|${analisis.area}|${analisis.puesto}|${analisis.flujo}`;
        
        // Solo agregar si no existe o si el existente tiene datos más completos
        if (!analisisUnicos.has(claveUnica)) {
          analisisUnicos.set(claveUnica, analisis);
        } else {
          const existente = analisisUnicos.get(claveUnica);
          // Si el existente tiene menos datos que el nuevo, reemplazarlo
          const datosExistentes = Object.values(existente).filter(val => val && val !== 'N/A' && val !== '').length;
          const datosNuevos = Object.values(analisis).filter(val => val && val !== 'N/A' && val !== '').length;
          
          if (datosNuevos > datosExistentes) {
            analisisUnicos.set(claveUnica, analisis);
          }
        }

        return analisis;
      });

      // Convertir el mapa a array y ordenar por timestamp
      const analisisFinales = Array.from(analisisUnicos.values())
        .sort((a, b) => {
          const timestampA = new Date(a.timestamp || '').getTime();
          const timestampB = new Date(b.timestamp || '').getTime();
          return timestampB - timestampA; // Más reciente primero
        });

      console.log(`✅ Obtenidos ${analisisFinales.length} análisis globales únicos (de ${documents.length} total)`);
      return analisisFinales;
    } catch (error) {
      console.error('❌ Error al obtener análisis globales:', error);
      return [];
    }
  }

  // Limpiar análisis duplicados existentes
  static async limpiarAnalisisDuplicados(): Promise<{ eliminados: number; mantenidos: number }> {
    try {
      console.log('🧹 Iniciando limpieza de análisis duplicados...');
      
      // Obtener todos los análisis
      const url = `${NUEVA_ESTRUCTURA_URL}?pageSize=1000`;
      const response = await fetch(url, { method: 'GET', headers: { 'Content-Type': 'application/json' } });

      if (!response.ok) throw new Error(`HTTP ${response.status}: ${response.statusText}`);

      const result = await response.json();
      const documents = result.documents || [];

      // Agrupar por clave única
      const grupos = new Map<string, Array<{
        id: string;
        timestamp: string;
        datosCompletos: number;
        doc: any;
      }>>();
      const duplicados: Array<{
        id: string;
        timestamp: string;
        datosCompletos: number;
        doc: any;
      }> = [];

      documents.forEach((doc: any) => {
        const fields = doc.fields || {};
        const claveUnica = `${readString(fields, 'unidadDeNegocio')}|${readString(fields, 'planta')}|${readString(fields, 'turno')}|${readString(fields, 'area')}|${readString(fields, 'puesto')}|${readString(fields, 'flujo')}`;
        
        if (!grupos.has(claveUnica)) {
          grupos.set(claveUnica, []);
        }
        grupos.get(claveUnica)!.push({
          id: doc.name?.split('/').pop() || '',
          timestamp: readTS(fields, 'timestamp'),
          datosCompletos: Object.values(fields).filter(val => val && val !== 'N/A' && val !== '').length,
          doc
        });
      });

      // Identificar duplicados
      grupos.forEach((docs, clave) => {
        if (docs.length > 1) {
          // Ordenar por timestamp (más reciente primero) y por datos completos
          docs.sort((a: any, b: any) => {
            if (a.datosCompletos !== b.datosCompletos) {
              return b.datosCompletos - a.datosCompletos; // Más datos primero
            }
            return new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime(); // Más reciente primero
          });
          
          // El primero se mantiene, los demás son duplicados
          const mantenido = docs[0];
          const duplicadosGrupo = docs.slice(1);
          
          duplicados.push(...duplicadosGrupo);
          console.log(`🔍 Grupo ${clave}: mantenido ${mantenido.id}, duplicados: ${duplicadosGrupo.map((d: any) => d.id).join(', ')}`);
        }
      });

      console.log(`📊 Total de duplicados encontrados: ${duplicados.length}`);

      // Eliminar duplicados (solo si hay más de 1)
      if (duplicados.length > 0) {
        for (const duplicado of duplicados) {
          try {
            const deleteUrl = `${NUEVA_ESTRUCTURA_URL}/${duplicado.id}`;
            const deleteResponse = await fetch(deleteUrl, { method: 'DELETE' });
            
            if (deleteResponse.ok) {
              console.log(`✅ Duplicado eliminado: ${duplicado.id}`);
            } else {
              console.warn(`⚠️ No se pudo eliminar duplicado ${duplicado.id}: ${deleteResponse.status}`);
            }
          } catch (error) {
            console.error(`❌ Error al eliminar duplicado ${duplicado.id}:`, error);
          }
        }
      }

      return {
        eliminados: duplicados.length,
        mantenidos: documents.length - duplicados.length
      };
    } catch (error) {
      console.error('❌ Error al limpiar análisis duplicados:', error);
      throw error;
    }
  }

  // Eliminar análisis completamente vacíos automáticamente
  static async eliminarAnalisisVacios(): Promise<{ eliminados: number; mantenidos: number }> {
    try {
      console.log('🧹 Iniciando limpieza automática de análisis vacíos...');
      
      // Obtener todos los análisis
      const url = `${NUEVA_ESTRUCTURA_URL}?pageSize=1000`;
      const response = await fetch(url, { method: 'GET', headers: { 'Content-Type': 'application/json' } });

      if (!response.ok) throw new Error(`HTTP ${response.status}: ${response.statusText}`);

      const result = await response.json();
      const documents = result.documents || [];

      const analisisAEliminar: Array<{
        id: string;
        doc: any;
      }> = [];
      const analisisAMantener: Array<{
        id: string;
        doc: any;
      }> = [];

      documents.forEach((doc: any) => {
        const fields = doc.fields || {};
        
        // Verificar si es un análisis completamente vacío
        const esAnalisisVacio = this.esAnalisisCompletamenteVacio(fields);
        
        if (esAnalisisVacio) {
          analisisAEliminar.push({
            id: doc.name?.split('/').pop() || '',
            doc
          });
          console.log(`🗑️ Análisis vacío detectado para eliminar: ${doc.name?.split('/').pop()}`);
        } else {
          analisisAMantener.push({
            id: doc.name?.split('/').pop() || '',
            doc
          });
        }
      });

      console.log(`📊 Total de análisis vacíos encontrados: ${analisisAEliminar.length}`);
      console.log(`📊 Total de análisis válidos: ${analisisAMantener.length}`);

      // Eliminar análisis vacíos
      if (analisisAEliminar.length > 0) {
        for (const analisis of analisisAEliminar) {
          try {
            const deleteUrl = `${NUEVA_ESTRUCTURA_URL}/${analisis.id}`;
            const deleteResponse = await fetch(deleteUrl, { method: 'DELETE' });
            
            if (deleteResponse.ok) {
              console.log(`✅ Análisis vacío eliminado: ${analisis.id}`);
            } else {
              console.warn(`⚠️ No se pudo eliminar análisis vacío ${analisis.id}: ${deleteResponse.status}`);
            }
          } catch (error) {
            console.error(`❌ Error al eliminar análisis vacío ${analisis.id}:`, error);
          }
        }
      }

      return {
        eliminados: analisisAEliminar.length,
        mantenidos: analisisAMantener.length
      };
    } catch (error) {
      console.error('❌ Error al eliminar análisis vacíos:', error);
      throw error;
    }
  }

  // Función auxiliar para verificar si un análisis está completamente vacío
  private static esAnalisisCompletamenteVacio(fields: any): boolean {
    try {
      // Verificar identificación - todas las preguntas deben ser "N/A"
      const preguntas = [
        readString(fields, 'pregunta1'),
        readString(fields, 'pregunta2'),
        readString(fields, 'pregunta3'),
        readString(fields, 'pregunta4'),
        readString(fields, 'pregunta5'),
        readString(fields, 'pregunta6'),
        readString(fields, 'pregunta7'),
        readString(fields, 'pregunta8'),
        readString(fields, 'pregunta9')
      ];
      
      const todasPreguntasVacias = preguntas.every(p => p === 'N/A' || p === '');
      
      // Verificar flujo - debe ser "SIN ESPECIFICAR"
      const flujo = readString(fields, 'flujo');
      const flujoSinEspecificar = flujo === 'SIN ESPECIFICAR';
      
      // Verificar matriz de riesgo - todas las ponderaciones deben ser "N/A"
      const ponderaciones = [
        readString(fields, 'ponderacion1'),
        readString(fields, 'ponderacion2'),
        readString(fields, 'ponderacion3'),
        readString(fields, 'ponderacion4'),
        readString(fields, 'ponderacion5'),
        readString(fields, 'ponderacion6'),
        readString(fields, 'ponderacion7')
      ];
      
      const todasPonderacionesVacias = ponderaciones.every(p => p === 'N/A' || p === '');
      
      // Verificar puntaje y nivel - ambos deben ser "N/A"
      const puntaje = readString(fields, 'puntaje');
      const nivel = readString(fields, 'nivel');
      const puntajeYNivelVacios = (puntaje === 'N/A' || puntaje === '') && (nivel === 'N/A' || nivel === '');
      
      // Solo es vacío si TODAS las condiciones se cumplen
      const esVacio = todasPreguntasVacias && flujoSinEspecificar && 
                      todasPonderacionesVacias && puntajeYNivelVacios;
      
      if (esVacio) {
        console.log('🔍 Análisis detectado como vacío:', {
          todasPreguntasVacias,
          flujoSinEspecificar,
          todasPonderacionesVacias,
          puntajeYNivelVacios,
          preguntas,
          flujo,
          ponderaciones,
          puntaje,
          nivel
        });
      }
      
      return esVacio;
    } catch (error) {
      console.error('❌ Error al verificar si análisis está vacío:', error);
      return false; // En caso de error, no eliminar
    }
  }

}
