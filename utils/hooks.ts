import React, { useState, useEffect } from 'react';
import { useFocusEffect } from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { K_SELECTED_BUSINESS_UNIT, K_ANALYSIS_METADATA } from './storageKeys';

/**
 * Hook personalizado para obtener la unidad de negocio seleccionada
 * Lee primero de data:meta.businessUnit, luego de nav:selectedBusinessUnit como fallback
 * Usa useFocusEffect para evitar renders prematuros
 */
export const useBusinessUnit = () => {
  const [businessUnit, setBusinessUnit] = useState<string>('');
  const [loading, setLoading] = useState(true);

  const loadBusinessUnit = async () => {
    try {
      setLoading(true);
      
      // Intentar leer primero de la clave de navegación (donde se guarda)
      let bu = await AsyncStorage.getItem(K_SELECTED_BUSINESS_UNIT);
      
      // Si no existe en navegación, usar metadata como fallback
      if (!bu) {
        bu = await AsyncStorage.getItem(K_ANALYSIS_METADATA);
      }
      
      setBusinessUnit(bu || '');
      console.log('🔍 Business Unit cargado:', bu);
    } catch (error) {
      console.error('❌ Error al cargar Business Unit:', error);
      setBusinessUnit('');
    } finally {
      setLoading(false);
    }
  };

  // Recargar cuando la pantalla obtiene foco
  useFocusEffect(
    React.useCallback(() => {
      loadBusinessUnit();
    }, [])
  );

  // Función para actualizar el business unit
  const updateBusinessUnit = async (newBusinessUnit: string) => {
    try {
      // Guardar en ambas claves para persistencia doble
      await Promise.all([
        AsyncStorage.setItem(K_SELECTED_BUSINESS_UNIT, newBusinessUnit),
        AsyncStorage.setItem(K_ANALYSIS_METADATA, newBusinessUnit)
      ]);
      
      setBusinessUnit(newBusinessUnit);
      console.log('✅ Business Unit actualizado en ambas claves:', newBusinessUnit);
    } catch (error) {
      console.error('❌ Error al actualizar Business Unit:', error);
    }
  };

  return {
    businessUnit,
    loading,
    updateBusinessUnit,
    refresh: loadBusinessUnit
  };
};

/**
 * Hook para obtener múltiples valores de metadata del análisis
 */
export const useAnalysisMetadata = () => {
  const [metadata, setMetadata] = useState({
    businessUnit: '',
    plant: '',
    shift: '',
    area: '',
    position: ''
  });
  const [loading, setLoading] = useState(true);

  const loadMetadata = async () => {
    try {
      setLoading(true);
      
      const [businessUnit, plant, shift, area, position] = await Promise.all([
        AsyncStorage.getItem('data:meta.businessUnit'),
        AsyncStorage.getItem('data:meta.plant'),
        AsyncStorage.getItem('data:meta.shift'),
        AsyncStorage.getItem('data:meta.area'),
        AsyncStorage.getItem('data:meta.position')
      ]);
      
      setMetadata({
        businessUnit: businessUnit || '',
        plant: plant || '',
        shift: shift || '',
        area: area || '',
        position: position || ''
      });
    } catch (error) {
      console.error('❌ Error al cargar metadata del análisis:', error);
    } finally {
      setLoading(false);
    }
  };

  useFocusEffect(
    React.useCallback(() => {
      loadMetadata();
    }, [])
  );

  return {
    metadata,
    loading,
    refresh: loadMetadata
  };
};
