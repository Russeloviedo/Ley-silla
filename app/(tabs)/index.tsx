import { StyleSheet, ScrollView, TouchableOpacity, View } from 'react-native';
import { Text } from '@/components/Themed';
import { useState } from 'react';
import { useRouter } from 'expo-router';
import { AppColors } from '@/constants/Colors';
import { UnidadNegocio } from '@/types';
import { validateNavigationParams } from '@/utils/errorHandler';

const UNIDADES_NEGOCIO: UnidadNegocio[] = [
  'IRR ENSAMBLE',
  'IRR MOLDEO',
  'FX',
  'DD ENSAMBLE MODULOS.CELDAS',
  'DD MOLDEO',
  'DD CALIDAD',
  'DD ALMACEN',
  'HCM',
  'ALMACÉN',
  'MANTENIMIENTO',
  'TOOL ROOM',
  'ADMINISTRATIVO',
];

export default function SeleccionUnidadNegocioScreen() {
  const router = useRouter();
  const [seleccion, setSeleccion] = useState<UnidadNegocio | null>(null);

  const handleSeleccion = (unidad: UnidadNegocio) => {
    setSeleccion(unidad);
  };

  const handleContinuar = () => {
    if (seleccion) {
      const params = { unidad: seleccion };
      if (validateNavigationParams(params)) {
        router.push({ pathname: '/seleccion-puesto', params });
      }
    }
  };

  const handleAnalisis = () => {
    router.push({ pathname: '/resultados-finales' });
  };

  return (
    <View style={{ flex: 1, backgroundColor: AppColors.background }}>
      {/* Barra superior */}
      <View style={styles.topBar}>
        <Text style={styles.topBarTitle}>Análisis de Riesgo{`\n`}EHS</Text>
        <TouchableOpacity style={styles.topBarButton}>
          <Text style={styles.topBarButtonText}>?</Text>
        </TouchableOpacity>
      </View>
      <ScrollView contentContainerStyle={styles.container}>
        <Text style={styles.title}>Selección de Unidad de Negocio</Text>
        <Text style={styles.subtitle}>Seleccione la unidad de negocio que desea analizar:</Text>
        <View style={styles.boxUnidades}>
          {UNIDADES_NEGOCIO.map((unidad, idx) => (
            <TouchableOpacity
              key={unidad}
              style={[styles.opcionUnidad, seleccion === unidad && styles.opcionUnidadSeleccionada]}
              onPress={() => handleSeleccion(unidad)}
              activeOpacity={0.85}
            >
              <Text style={styles.iconoUnidad}>{getEmojiForUnidad(unidad)}</Text>
              <Text style={styles.opcionUnidadTexto}>{unidad}</Text>
              <View style={styles.radioOuter}>
                {seleccion === unidad && <View style={styles.radioInner} />}
              </View>
            </TouchableOpacity>
          ))}
        </View>
        <TouchableOpacity
          style={[styles.botonContinuar, !seleccion && styles.botonContinuarDeshabilitado]}
          onPress={handleContinuar}
          disabled={!seleccion}
        >
          <Text style={styles.botonContinuarTexto}>Continuar</Text>
        </TouchableOpacity>
        <Text style={styles.info}>Seleccione una unidad de negocio para continuar con el análisis de riesgo</Text>
      </ScrollView>
      {/* Barra inferior */}
      <View style={styles.bottomBar}>
        <View style={styles.bottomBarItem}>
          <Text style={styles.bottomBarIcon}>🏠</Text>
          <Text style={styles.bottomBarLabel}>Inicio</Text>
        </View>
        <TouchableOpacity 
          style={styles.bottomBarItem} 
          onPress={handleAnalisis}
          activeOpacity={0.7}
        >
          <Text style={styles.bottomBarIcon}>📋</Text>
          <Text style={styles.bottomBarLabel}>Análisis</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

function getEmojiForUnidad(unidad: string): string {
  const unidadLower = unidad.toLowerCase();
  
  // Mapeo de unidades a emojis
  const emojiMap: Record<string, string> = {
    'hcm': '👥',
    'fx': '💸',
    'moldeo': '🏭',
    'ensamble': '🔩',
    'almacén': '📦',
    'almacen': '📦',
    'mantenimiento': '🛠️',
    'tool room': '🧰',
    'administrativo': '📑',
    'soporte': '🖥️',
    'áreas': '🌱',
    'calidad': '✅',
  };
  
  // Buscar coincidencias en el mapeo
  for (const [key, emoji] of Object.entries(emojiMap)) {
    if (unidadLower.includes(key)) {
      return emoji;
    }
  }
  
  return '🏢'; // Emoji por defecto
}

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
    backgroundColor: AppColors.background,
  },
  title: {
    fontSize: 22,
    fontWeight: 'bold',
    marginBottom: 10,
    color: AppColors.textPrimary,
  },
  subtitle: {
    fontSize: 16,
    marginBottom: 20,
    color: AppColors.textSecondary,
    textAlign: 'center',
  },
  button: {
    backgroundColor: '#00c4cc',
    paddingVertical: 16,
    paddingHorizontal: 30,
    borderRadius: 10,
    marginVertical: 8,
    width: '100%',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  buttonText: {
    fontSize: 18,
    color: '#222',
    fontWeight: '600',
  },
  info: {
    marginTop: 30,
    fontSize: 14,
    color: AppColors.textMuted,
    textAlign: 'center',
  },
  topBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: AppColors.primary,
    paddingTop: 36,
    paddingBottom: 16,
    paddingHorizontal: 18,
    borderBottomLeftRadius: 18,
    borderBottomRightRadius: 18,
    elevation: 4,
  },
  topBarTitle: {
    color: AppColors.textWhite,
    fontWeight: 'bold',
    fontSize: 18,
    letterSpacing: 1.1,
    flex: 1,
    lineHeight: 22,
  },
  topBarButton: {
    backgroundColor: AppColors.secondary,
    borderRadius: 16,
    width: 32,
    height: 32,
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: 12,
  },
  topBarButtonText: {
    color: AppColors.textWhite,
    fontWeight: 'bold',
    fontSize: 20,
  },
  boxUnidades: {
    backgroundColor: AppColors.surface,
    borderRadius: 16,
    padding: 24,
    marginBottom: 32,
    width: '100%',
    maxWidth: 420,
    shadowColor: AppColors.shadowColor,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.12,
    shadowRadius: 12,
    elevation: 4,
    alignItems: 'center',
    alignSelf: 'center',
    marginTop: 10,
  },
  opcionUnidad: {
    backgroundColor: AppColors.secondary,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 14,
    paddingHorizontal: 18,
    borderRadius: 14,
    marginVertical: 6,
    marginHorizontal: 4,
    width: '100%',
    shadowColor: AppColors.shadowColor,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.18,
    shadowRadius: 8,
    elevation: 3,
  },
  opcionUnidadSeleccionada: {
    borderWidth: 2,
    borderColor: AppColors.border,
    backgroundColor: AppColors.accent,
  },
  iconoUnidad: {
    fontSize: 28,
    marginRight: 12,
  },
  opcionUnidadTexto: {
    fontSize: 18,
    color: AppColors.textPrimary,
    fontWeight: '700',
    letterSpacing: 1.1,
    flex: 1,
  },
  radioOuter: {
    width: 22,
    height: 22,
    borderRadius: 11,
    borderWidth: 2,
    borderColor: AppColors.border,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: AppColors.surface,
    marginLeft: 10,
  },
  radioInner: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: AppColors.border,
  },
  botonContinuar: {
    backgroundColor: AppColors.primary,
    paddingVertical: 16,
    paddingHorizontal: 30,
    borderRadius: 10,
    marginTop: 10,
    width: '100%',
    alignItems: 'center',
    shadowColor: AppColors.shadowColorDark,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  botonContinuarTexto: {
    fontSize: 18,
    color: AppColors.textWhite,
    fontWeight: '600',
  },
  botonContinuarDeshabilitado: {
    backgroundColor: AppColors.disabled,
  },
  bottomBar: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    backgroundColor: AppColors.background,
    borderTopLeftRadius: 18,
    borderTopRightRadius: 18,
    paddingVertical: 10,
    elevation: 8,
    shadowColor: AppColors.shadowColorDark,
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.08,
    shadowRadius: 6,
  },
  bottomBarItem: {
    alignItems: 'center',
    flex: 1,
  },
  bottomBarIcon: {
    fontSize: 22,
    marginBottom: 2,
  },
  bottomBarLabel: {
    fontSize: 13,
    color: AppColors.primary,
    fontWeight: '600',
  },
});
