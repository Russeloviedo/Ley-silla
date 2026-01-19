import React from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert } from 'react-native';
import { CleanupService } from '@/utils/cleanupService';

interface FormData {
  nombre: string;
  email: string;
  telefono: string;
  empresa: string;
  departamento: string;
}

const initialState: FormData = {
  nombre: '',
  email: '',
  telefono: '',
  empresa: '',
  departamento: ''
};

export default function CleanFormExample() {
  // Usar el hook personalizado para formularios limpios
  const {
    formData,
    setFormData,
    formKey,
    currentAnalysisId,
    resetForm,
    clearField,
    clearFields
  } = CleanupService.useFormWithCleanup<FormData>(initialState);

  // Función para manejar cambios en los campos
  const handleFieldChange = (field: keyof FormData, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  // Función para limpiar campo específico
  const handleClearField = (field: keyof FormData) => {
    clearField(field);
    Alert.alert('Campo limpiado', `El campo ${field} ha sido limpiado`);
  };

  // Función para limpiar múltiples campos
  const handleClearMultipleFields = () => {
    clearFields(['email', 'telefono']);
    Alert.alert('Campos limpiados', 'Email y teléfono han sido limpiados');
  };

  // Función para resetear todo el formulario
  const handleResetForm = () => {
    resetForm();
    Alert.alert('Formulario reseteado', 'Todos los campos han sido limpiados');
  };

  // Función para iniciar nuevo análisis
  const handleNuevoAnalisis = async () => {
    try {
      // 1. Limpiar completamente el navegador
      await CleanupService.cleanBrowserCompletely();
      
      // 2. Resetear el formulario
      resetForm();
      
      // 3. Mostrar confirmación
      Alert.alert(
        'Nuevo Análisis Iniciado',
        'Todos los datos han sido limpiados completamente. El formulario está listo para un nuevo análisis.',
        [{ text: 'OK', style: 'default' }]
      );
      
      console.log('✅ Nuevo análisis iniciado con formulario limpio');
    } catch (error) {
      console.error('❌ Error al iniciar nuevo análisis:', error);
      Alert.alert('Error', 'No se pudo limpiar completamente. Inténtalo de nuevo.');
    }
  };

  // Función para generar nombres únicos de campos
  const getUniqueFieldName = (baseName: string) => {
    return CleanupService.generateUniqueFieldName(baseName, currentAnalysisId, baseName);
  };

  // Función para obtener props de autocompletado
  const getAutocompleteProps = (fieldId: string) => {
    return CleanupService.getAutocompleteProps(currentAnalysisId, fieldId);
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Formulario de Análisis Limpio</Text>
      <Text style={styles.subtitle}>ID de Análisis: {currentAnalysisId}</Text>
      <Text style={styles.subtitle}>Key del Formulario: {formKey}</Text>

      {/* Formulario con key dinámica para forzar re-renderizado limpio */}
      <View key={formKey} style={styles.form}>
        {/* Campo Nombre */}
        <View style={styles.fieldContainer}>
          <Text style={styles.label}>Nombre:</Text>
          <TextInput
            style={styles.input}
            value={formData.nombre}
            onChangeText={(value) => handleFieldChange('nombre', value)}
            placeholder="Ingresa tu nombre"
            {...getAutocompleteProps('nombre')}
            name={getUniqueFieldName('nombre')}
          />
          <TouchableOpacity
            style={styles.clearButton}
            onPress={() => handleClearField('nombre')}
          >
            <Text style={styles.clearButtonText}>🗑️</Text>
          </TouchableOpacity>
        </View>

        {/* Campo Email */}
        <View style={styles.fieldContainer}>
          <Text style={styles.label}>Email:</Text>
          <TextInput
            style={styles.input}
            value={formData.email}
            onChangeText={(value) => handleFieldChange('email', value)}
            placeholder="Ingresa tu email"
            keyboardType="email-address"
            {...getAutocompleteProps('email')}
            name={getUniqueFieldName('email')}
          />
          <TouchableOpacity
            style={styles.clearButton}
            onPress={() => handleClearField('email')}
          >
            <Text style={styles.clearButtonText}>🗑️</Text>
          </TouchableOpacity>
        </View>

        {/* Campo Teléfono */}
        <View style={styles.fieldContainer}>
          <Text style={styles.label}>Teléfono:</Text>
          <TextInput
            style={styles.input}
            value={formData.telefono}
            onChangeText={(value) => handleFieldChange('telefono', value)}
            placeholder="Ingresa tu teléfono"
            keyboardType="phone-pad"
            {...getAutocompleteProps('telefono')}
            name={getUniqueFieldName('telefono')}
          />
          <TouchableOpacity
            style={styles.clearButton}
            onPress={() => handleClearField('telefono')}
          >
            <Text style={styles.clearButtonText}>🗑️</Text>
          </TouchableOpacity>
        </View>

        {/* Campo Empresa */}
        <View style={styles.fieldContainer}>
          <Text style={styles.label}>Empresa:</Text>
          <TextInput
            style={styles.input}
            value={formData.empresa}
            onChangeText={(value) => handleFieldChange('empresa', value)}
            placeholder="Ingresa el nombre de tu empresa"
            {...getAutocompleteProps('empresa')}
            name={getUniqueFieldName('empresa')}
          />
          <TouchableOpacity
            style={styles.clearButton}
            onPress={() => handleClearField('empresa')}
          >
            <Text style={styles.clearButtonText}>🗑️</Text>
          </TouchableOpacity>
        </View>

        {/* Campo Departamento */}
        <View style={styles.fieldContainer}>
          <Text style={styles.label}>Departamento:</Text>
          <TextInput
            style={styles.input}
            value={formData.departamento}
            onChangeText={(value) => handleFieldChange('departamento', value)}
            placeholder="Ingresa tu departamento"
            {...getAutocompleteProps('departamento')}
            name={getUniqueFieldName('departamento')}
          />
          <TouchableOpacity
            style={styles.clearButton}
            onPress={() => handleClearField('departamento')}
          >
            <Text style={styles.clearButtonText}>🗑️</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Botones de control */}
      <View style={styles.buttonContainer}>
        <TouchableOpacity style={styles.button} onPress={handleClearMultipleFields}>
          <Text style={styles.buttonText}>Limpiar Email y Teléfono</Text>
        </TouchableOpacity>
        
        <TouchableOpacity style={styles.button} onPress={handleResetForm}>
          <Text style={styles.buttonText}>Resetear Formulario</Text>
        </TouchableOpacity>
        
        <TouchableOpacity style={[styles.button, styles.primaryButton]} onPress={handleNuevoAnalisis}>
          <Text style={styles.primaryButtonText}>🚀 Nuevo Análisis</Text>
        </TouchableOpacity>
      </View>

      {/* Información del estado */}
      <View style={styles.infoContainer}>
        <Text style={styles.infoTitle}>Estado del Formulario:</Text>
        <Text style={styles.infoText}>Campos llenos: {Object.values(formData).filter(v => v !== '').length}/5</Text>
        <Text style={styles.infoText}>Formulario limpio: {Object.values(formData).every(v => v === '') ? 'Sí' : 'No'}</Text>
      </View>
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
    marginBottom: 10,
    color: '#333',
  },
  subtitle: {
    fontSize: 12,
    textAlign: 'center',
    marginBottom: 20,
    color: '#666',
    fontFamily: 'monospace',
  },
  form: {
    backgroundColor: 'white',
    padding: 20,
    borderRadius: 10,
    marginBottom: 20,
    boxShadow: '0px 2px 4px rgba(0, 0, 0, 0.1)',
    elevation: 3,
  },
  fieldContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 15,
  },
  label: {
    width: 100,
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
  },
  input: {
    flex: 1,
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 5,
    padding: 10,
    fontSize: 16,
    backgroundColor: '#fafafa',
  },
  clearButton: {
    marginLeft: 10,
    padding: 8,
    backgroundColor: '#ff6b6b',
    borderRadius: 5,
  },
  clearButtonText: {
    color: 'white',
    fontSize: 16,
  },
  buttonContainer: {
    gap: 10,
    marginBottom: 20,
  },
  button: {
    backgroundColor: '#6c757d',
    padding: 15,
    borderRadius: 8,
    alignItems: 'center',
  },
  buttonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
  primaryButton: {
    backgroundColor: '#28a745',
  },
  primaryButtonText: {
    color: 'white',
    fontSize: 18,
    fontWeight: 'bold',
  },
  infoContainer: {
    backgroundColor: 'white',
    padding: 15,
    borderRadius: 8,
    borderLeftWidth: 4,
    borderLeftColor: '#007bff',
  },
  infoTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 10,
    color: '#333',
  },
  infoText: {
    fontSize: 14,
    color: '#666',
    marginBottom: 5,
  },
});

