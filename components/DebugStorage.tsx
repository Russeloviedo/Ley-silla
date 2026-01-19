import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView, TouchableOpacity, StyleSheet } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { NAVIGATION_KEYS, ANALYSIS_METADATA_KEYS } from '@/utils/storageKeys';

export default function DebugStorage() {
  const [storageContent, setStorageContent] = useState<{[key: string]: string}>({});
  const [loading, setLoading] = useState(true);

  const loadStorageContent = async () => {
    try {
      setLoading(true);
      
      // Obtener todas las claves relevantes
      const allKeys = [
        ...Object.values(NAVIGATION_KEYS),
        ...Object.values(ANALYSIS_METADATA_KEYS),
        'selectedBusinessUnit', // Clave antigua
        'selectedPlanta',
        'selectedTurno',
        'selectedArea',
        'selectedPuesto'
      ];

      const content: {[key: string]: string} = {};
      
      for (const key of allKeys) {
        try {
          const value = await AsyncStorage.getItem(key);
          if (value !== null) {
            content[key] = value;
          }
        } catch (error) {
          content[key] = `Error: ${error}`;
        }
      }

      setStorageContent(content);
    } catch (error) {
      console.error('Error al cargar contenido del storage:', error);
    } finally {
      setLoading(false);
    }
  };

  const clearAllStorage = async () => {
    try {
      await AsyncStorage.clear();
      await loadStorageContent();
      console.log('✅ Storage limpiado completamente');
    } catch (error) {
      console.error('❌ Error al limpiar storage:', error);
    }
  };

  useEffect(() => {
    loadStorageContent();
  }, []);

  if (loading) {
    return (
      <View style={styles.container}>
        <Text style={styles.title}>Cargando contenido del Storage...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>🔍 Debug Storage</Text>
      
      <TouchableOpacity style={styles.refreshButton} onPress={loadStorageContent}>
        <Text style={styles.refreshButtonText}>🔄 Actualizar</Text>
      </TouchableOpacity>
      
      <TouchableOpacity style={styles.clearButton} onPress={clearAllStorage}>
        <Text style={styles.clearButtonText}>🗑️ Limpiar Todo</Text>
      </TouchableOpacity>

      <ScrollView style={styles.scrollView}>
        <Text style={styles.sectionTitle}>📋 Contenido del AsyncStorage:</Text>
        
        {Object.keys(storageContent).length === 0 ? (
          <Text style={styles.emptyText}>No hay contenido en el storage</Text>
        ) : (
          Object.entries(storageContent).map(([key, value]) => (
            <View key={key} style={styles.itemContainer}>
              <Text style={styles.keyText}>{key}:</Text>
              <Text style={styles.valueText}>{value}</Text>
            </View>
          ))
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: '#f5f5f5',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 20,
    color: '#333',
  },
  refreshButton: {
    backgroundColor: '#4CAF50',
    padding: 15,
    borderRadius: 8,
    marginBottom: 10,
    alignItems: 'center',
  },
  refreshButtonText: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 16,
  },
  clearButton: {
    backgroundColor: '#f44336',
    padding: 15,
    borderRadius: 8,
    marginBottom: 20,
    alignItems: 'center',
  },
  clearButtonText: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 16,
  },
  scrollView: {
    flex: 1,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 15,
    color: '#333',
  },
  itemContainer: {
    backgroundColor: 'white',
    padding: 15,
    borderRadius: 8,
    marginBottom: 10,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  keyText: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#666',
    marginBottom: 5,
  },
  valueText: {
    fontSize: 16,
    color: '#333',
    fontFamily: 'monospace',
  },
  emptyText: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    fontStyle: 'italic',
  },
});
