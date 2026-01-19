#!/usr/bin/env node

/**
 * Script para eliminar documentos duplicados en la colección `nueva_estructura`
 * de Firestore. Identifica duplicados cuando se repiten exactamente los campos:
 *  - unidad_de_negocio / unidadDeNegocio / businessUnit
 *  - planta
 *  - turno
 *  - area
 *  - puesto
 *  - respuestas_ci (mapa u objeto)
 *  - cuestionario_ponderacion (mapa u objeto)
 *
 * ⚠️ Por defecto corre en modo "dry-run" y solo muestra qué documentos eliminaría.
 *     Usa el flag `--execute` para borrar realmente los duplicados.
 *
 * Requisitos:
 *  1. Node 18+ (para `fetch` nativo).
 *  2. Variables de entorno `FIREBASE_API_KEY` y `FIREBASE_PROJECT_ID` configuradas.
 *     Si no están definidas, se tomarán de utils/firebase.ts si el build la transpila,
 *     pero se recomienda exportarlas explícitamente:
 *       - PowerShell:   `$Env:FIREBASE_API_KEY="..."; $Env:FIREBASE_PROJECT_ID="..."`
 *       - cmd:          `set FIREBASE_API_KEY=...`
 *       - bash:         `export FIREBASE_API_KEY=...`
 *
 * Uso:
 *   node scripts/removeFirestoreDuplicates.mjs            # Modo dry-run
 *   node scripts/removeFirestoreDuplicates.mjs --execute  # Elimina duplicados
 */

const {
  FIREBASE_API_KEY: ENV_API_KEY,
  FIREBASE_PROJECT_ID: ENV_PROJECT_ID,
} = process.env;

// Valores por defecto (visibles en utils/firebase.ts). Se usan solo si no hay variables de entorno.
const DEFAULT_API_KEY = 'AIzaSyBc3vTedJPhgrOz1Hn6nFLWE1HWMGHGVFs';
const DEFAULT_PROJECT_ID = 'departamentoehsmexico';

const FIREBASE_API_KEY = ENV_API_KEY || DEFAULT_API_KEY;
const FIREBASE_PROJECT_ID = ENV_PROJECT_ID || DEFAULT_PROJECT_ID;

if (!FIREBASE_API_KEY || !FIREBASE_PROJECT_ID) {
  console.error('❌ Faltan FIREBASE_API_KEY o FIREBASE_PROJECT_ID. Establece las variables de entorno antes de continuar.');
  process.exit(1);
}

const SHOULD_EXECUTE = process.argv.includes('--execute');
const COLLECTION_PATH = 'nueva_estructura';
const BASE_URL = `https://firestore.googleapis.com/v1/projects/${FIREBASE_PROJECT_ID}/databases/(default)/documents`;

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

const FIELD_ALIASES = {
  unidadNegocio: ['unidadDeNegocio', 'unidad_de_negocio', 'businessUnit', 'unidad'],
  planta: ['planta', 'plant'],
  turno: ['turno', 'shift'],
  area: ['area'],
  puesto: ['puesto', 'position'],
  respuestasCI: ['respuestas_ci', 'respuestasCi', 'respuestasCI'],
  cuestionario: ['cuestionario_ponderacion', 'cuestionarioPonderacion', 'ponderaciones', 'ponderacion'],
};

const isTruthyValue = (value) => {
  if (value == null) return false;
  if (typeof value === 'string') {
    const trimmed = value.trim();
    if (!trimmed) return false;
    const normalized = trimmed.toUpperCase();
    return normalized !== 'N/A' && normalized !== 'SIN ESPECIFICAR';
  }
  if (Array.isArray(value)) return value.length > 0;
  if (typeof value === 'object') return Object.keys(value).length > 0;
  return true;
};

const stringifyForKey = (value) => {
  if (value == null) return '';
  if (typeof value === 'string') return value.trim().toUpperCase();
  if (typeof value === 'object') {
    const ordered = Array.isArray(value)
      ? value.map((v) => stringifyForKey(v))
      : Object.keys(value)
          .sort()
          .reduce((acc, key) => {
            acc[key] = stringifyForKey(value[key]);
            return acc;
          }, {});
    return JSON.stringify(ordered);
  }
  return String(value);
};

const decodeFirestoreValue = (fieldValue) => {
  if (!fieldValue || typeof fieldValue !== 'object') return null;

  if ('stringValue' in fieldValue) return fieldValue.stringValue;
  if ('integerValue' in fieldValue) return Number(fieldValue.integerValue);
  if ('doubleValue' in fieldValue) return Number(fieldValue.doubleValue);
  if ('booleanValue' in fieldValue) return Boolean(fieldValue.booleanValue);
  if ('timestampValue' in fieldValue) return fieldValue.timestampValue;
  if ('arrayValue' in fieldValue) {
    const { values = [] } = fieldValue.arrayValue || {};
    return values.map((item) => decodeFirestoreValue(item));
  }
  if ('mapValue' in fieldValue) {
    const { fields = {} } = fieldValue.mapValue || {};
    return Object.fromEntries(
      Object.entries(fields).map(([key, val]) => [key, decodeFirestoreValue(val)])
    );
  }
  if ('nullValue' in fieldValue) return null;
  return fieldValue;
};

const readField = (fields, aliases) => {
  for (const alias of aliases) {
    if (fields[alias] != null) {
      return decodeFirestoreValue(fields[alias]);
    }
  }
  return null;
};

const getFirestoreDocuments = async () => {
  const documents = [];
  let pageToken;

  do {
    const url = new URL(`${BASE_URL}/${COLLECTION_PATH}`);
    url.searchParams.set('pageSize', '300');
    url.searchParams.set('key', FIREBASE_API_KEY);
    if (pageToken) url.searchParams.set('pageToken', pageToken);

    const response = await fetch(url);
    if (!response.ok) {
      const message = await response.text();
      throw new Error(`Error al leer documentos: ${response.status} ${response.statusText} - ${message}`);
    }

    const data = await response.json();
    if (Array.isArray(data.documents)) {
      documents.push(...data.documents);
    }
    pageToken = data.nextPageToken;
    if (pageToken) {
      await sleep(300); // Evitar rate limiting
    }
  } while (pageToken);

  return documents;
};

const buildDuplicateKey = (fields) => {
  const unidad = readField(fields, FIELD_ALIASES.unidadNegocio);
  const planta = readField(fields, FIELD_ALIASES.planta);
  const turno = readField(fields, FIELD_ALIASES.turno);
  const area = readField(fields, FIELD_ALIASES.area);
  const puesto = readField(fields, FIELD_ALIASES.puesto);
  const respuestasCI = readField(fields, FIELD_ALIASES.respuestasCI);
  const cuestionario = readField(fields, FIELD_ALIASES.cuestionario);

  return [
    stringifyForKey(unidad),
    stringifyForKey(planta),
    stringifyForKey(turno),
    stringifyForKey(area),
    stringifyForKey(puesto),
    stringifyForKey(respuestasCI),
    stringifyForKey(cuestionario),
  ].join('||');
};

const countNonEmptyFields = (fields) => {
  return Object.values(fields).reduce((acc, fieldValue) => {
    const decoded = decodeFirestoreValue(fieldValue);
    return acc + (isTruthyValue(decoded) ? 1 : 0);
  }, 0);
};

const maybeDeleteDocument = async (docName, dryRun) => {
  if (dryRun) return { status: 'skipped' };

  const url = new URL(`https://firestore.googleapis.com/v1/${docName}`);
  url.searchParams.set('key', FIREBASE_API_KEY);

  const response = await fetch(url, { method: 'DELETE' });
  if (!response.ok) {
    const message = await response.text();
    throw new Error(`Error al eliminar ${docName}: ${response.status} ${response.statusText} - ${message}`);
  }
  return { status: 'deleted' };
};

const main = async () => {
  console.log('🚀 Iniciando búsqueda de duplicados en Firestore');
  console.log(`   Proyecto: ${FIREBASE_PROJECT_ID}`);
  console.log(`   Colección: ${COLLECTION_PATH}`);
  console.log(`   Modo: ${SHOULD_EXECUTE ? 'EJECUCIÓN (eliminará duplicados)' : 'DRY-RUN (solo reporte)'}`);

  try {
    const documents = await getFirestoreDocuments();
    console.log(`📦 Documentos recuperados: ${documents.length}`);

    const grupos = new Map();
    for (const doc of documents) {
      const { name, fields = {} } = doc;
      const duplicateKey = buildDuplicateKey(fields);
      const completeness = countNonEmptyFields(fields);

      if (!duplicateKey || duplicateKey === '|||||||') continue; // Sin datos clave

      const entry = {
        id: name.split('/').pop(),
        name,
        timestamp: decodeFirestoreValue(fields.timestamp) || '',
        completeness,
        fields,
      };

      if (!grupos.has(duplicateKey)) {
        grupos.set(duplicateKey, []);
      }
      grupos.get(duplicateKey).push(entry);
    }

    let duplicatesFound = 0;
    const actions = [];

    grupos.forEach((entries, key) => {
      if (entries.length <= 1) return;

      const sorted = entries.sort((a, b) => {
        if (b.completeness !== a.completeness) {
          return b.completeness - a.completeness;
        }
        return new Date(b.timestamp || 0) - new Date(a.timestamp || 0);
      });

      const keeper = sorted[0];
      const duplicates = sorted.slice(1);
      duplicatesFound += duplicates.length;

      actions.push({
        clave: key,
        keeper,
        duplicates,
      });
    });

    if (duplicatesFound === 0) {
      console.log('✅ No se encontraron documentos duplicados según los criterios definidos.');
      return;
    }

    console.log(`⚠️ Se encontraron ${duplicatesFound} duplicados distribuidos en ${actions.length} combinaciones únicas.`);

    for (const action of actions) {
      console.log('\n🔑 Clave duplicada:', action.clave);
      console.log(`   Documento que se conserva: ${action.keeper.id} (completitud: ${action.keeper.completeness})`);
      for (const dup of action.duplicates) {
        console.log(`   → Duplicado detectado: ${dup.id} (completitud: ${dup.completeness})`);
        try {
          const result = await maybeDeleteDocument(dup.name, !SHOULD_EXECUTE);
          console.log(`     Resultado: ${result.status}`);
        } catch (error) {
          console.error(`     ❌ Error eliminando ${dup.id}: ${error.message}`);
        }
      }
    }

    if (!SHOULD_EXECUTE) {
      console.log('\nℹ️ Elimina los duplicados ejecutando nuevamente con el flag --execute.');
    } else {
      console.log('\n✅ Limpieza completada. Revisa la consola de Firebase para confirmar los cambios.');
    }
  } catch (error) {
    console.error(`❌ Error durante la limpieza: ${error.message}`);
    process.exit(1);
  }
};

main();




