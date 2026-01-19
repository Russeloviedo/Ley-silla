import AsyncStorage from '@react-native-async-storage/async-storage';
import { HistorialAnalisis } from '@/types';

export interface AnalisisLocalEntry {
  id: string;
  claveUnica: string;
  data: HistorialAnalisis;
  synced: boolean;
  createdAt: string;
  updatedAt: string;
}

const STORAGE_KEY = 'data:analisisLocales';

const parseEntries = (raw: string | null): AnalisisLocalEntry[] => {
  if (!raw) return [];
  try {
    const parsed = JSON.parse(raw);
    if (Array.isArray(parsed)) {
      return parsed.filter(
        (entry) =>
          entry &&
          typeof entry === 'object' &&
          typeof entry.id === 'string' &&
          typeof entry.claveUnica === 'string' &&
          entry.data
      );
    }
    return [];
  } catch (error) {
    console.error('❌ Error al parsear análisis locales:', error);
    return [];
  }
};

const persistEntries = async (entries: AnalisisLocalEntry[]) => {
  try {
    await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(entries));
  } catch (error) {
    console.error('❌ Error al guardar análisis locales en AsyncStorage:', error);
    throw error;
  }
};

export const loadLocalAnalyses = async (): Promise<AnalisisLocalEntry[]> => {
  try {
    const raw = await AsyncStorage.getItem(STORAGE_KEY);
    return parseEntries(raw);
  } catch (error) {
    console.error('❌ Error al cargar análisis locales desde AsyncStorage:', error);
    return [];
  }
};

export const upsertLocalAnalysis = async (
  analisis: HistorialAnalisis,
  claveUnica: string
): Promise<AnalisisLocalEntry[]> => {
  const entries = await loadLocalAnalyses();
  const now = new Date().toISOString();
  const index = entries.findIndex((entry) => entry.claveUnica === claveUnica);

  if (index >= 0) {
    entries[index] = {
      ...entries[index],
      data: analisis,
      synced: false,
      updatedAt: now,
    };
  } else {
    entries.unshift({
      id: `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
      claveUnica,
      data: analisis,
      synced: false,
      createdAt: now,
      updatedAt: now,
    });
  }

  await persistEntries(entries);
  return entries;
};

export const removeLocalAnalysis = async (
  claveUnica: string
): Promise<AnalisisLocalEntry[]> => {
  const entries = await loadLocalAnalyses();
  const filtered = entries.filter((entry) => entry.claveUnica !== claveUnica);
  await persistEntries(filtered);
  return filtered;
};

export const STORAGE_ANALISIS_LOCALES = STORAGE_KEY;

export const clearAllLocalAnalyses = async (): Promise<void> => {
  try {
    await AsyncStorage.removeItem(STORAGE_KEY);
  } catch (error) {
    console.error('❌ Error al limpiar todos los análisis locales de AsyncStorage:', error);
    throw error;
  }
};



