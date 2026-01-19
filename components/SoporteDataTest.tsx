import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView, StyleSheet, TouchableOpacity } from 'react-native';
import { SelectionDataService } from '@/utils/selectionDataService';
import { AppColors } from '@/constants/Colors';
import { Typography } from '@/constants/Typography';
import { Spacing, BorderRadius } from '@/constants/Spacing';
import Card from './ui/Card';

export default function SoporteDataTest() {
  const [estadisticas, setEstadisticas] = useState<any>(null);
  const [selectedPlanta, setSelectedPlanta] = useState<string | null>(null);
  const [selectedTurno, setSelectedTurno] = useState<string | null>(null);
  const [selectedArea, setSelectedArea] = useState<string | null>(null);

  useEffect(() => {
    cargarEstadisticas();
  }, []);

  const cargarEstadisticas = () => {
    try {
      const stats = SelectionDataService.getSoporteEstadisticas();
      setEstadisticas(stats);
      console.log('📊 Estadísticas de SOPORTE cargadas:', stats);
    } catch (error) {
      console.error('❌ Error cargando estadísticas:', error);
    }
  };

  const handleSelectPlanta = (planta: string) => {
    setSelectedPlanta(planta);
    setSelectedTurno(null);
    setSelectedArea(null);
  };

  const handleSelectTurno = (turno: string) => {
    setSelectedTurno(turno);
    setSelectedArea(null);
  };

  const handleSelectArea = (area: string) => {
    setSelectedArea(area);
  };

  const renderPlantas = () => {
    if (!estadisticas) return null;
    
    return (
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>📍 Plantas ({estadisticas.totalPlantas})</Text>
        <View style={styles.optionsContainer}>
          {estadisticas.plantas.map((planta: string) => (
            <TouchableOpacity
              key={planta}
              style={[
                styles.option,
                selectedPlanta === planta && styles.selectedOption
              ]}
              onPress={() => handleSelectPlanta(planta)}
            >
              <Text style={[
                styles.optionText,
                selectedPlanta === planta && styles.selectedOptionText
              ]}>
                Planta {planta}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>
    );
  };

  const renderTurnos = () => {
    if (!selectedPlanta) return null;

    const turnos = SelectionDataService.getSoporteTurnos(selectedPlanta);

    return (
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>⏰ Turnos ({turnos.length})</Text>
        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
          <View style={styles.optionsContainer}>
            {turnos.map((turno: string) => (
              <TouchableOpacity
                key={turno}
                style={[
                  styles.option,
                  selectedTurno === turno && styles.selectedOption
                ]}
                onPress={() => handleSelectTurno(turno)}
              >
                <Text style={[
                  styles.optionText,
                  selectedTurno === turno && styles.selectedOptionText
                ]}>
                  {turno}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </ScrollView>
      </View>
    );
  };

  const renderAreas = () => {
    if (!selectedPlanta || !selectedTurno) return null;

    const areas = SelectionDataService.getSoporteAreas(selectedPlanta, selectedTurno);

    return (
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>🏭 Áreas ({areas.length})</Text>
        <View style={styles.optionsContainer}>
          {areas.map((area: string) => (
            <TouchableOpacity
              key={area}
              style={[
                styles.option,
                selectedArea === area && styles.selectedOption
              ]}
              onPress={() => handleSelectArea(area)}
            >
              <Text style={[
                styles.optionText,
                selectedArea === area && styles.selectedOptionText
              ]}>
                {area}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>
    );
  };

  const renderPuestos = () => {
    if (!selectedPlanta || !selectedTurno || !selectedArea) return null;

    const puestos = SelectionDataService.getSoportePuestos(selectedPlanta, selectedTurno, selectedArea);

    return (
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>👤 Puestos ({puestos.length})</Text>
        <View style={styles.puestosContainer}>
          {puestos.map((puesto: string, index: number) => (
            <View key={index} style={styles.puestoItem}>
              <Text style={styles.puestoText}>• {puesto}</Text>
            </View>
          ))}
        </View>
      </View>
    );
  };

  if (!estadisticas) {
    return (
      <View style={styles.container}>
        <Text style={styles.loadingText}>Cargando estadísticas...</Text>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container}>
      <Card style={styles.statsCard} variant="elevated" padding="large">
        <Text style={styles.title}>📊 Datos de SOPORTE Cargados</Text>
        
        <View style={styles.statsGrid}>
          <View style={styles.statItem}>
            <Text style={styles.statValue}>{estadisticas.totalRegistros}</Text>
            <Text style={styles.statLabel}>Total Registros</Text>
          </View>
          <View style={styles.statItem}>
            <Text style={styles.statValue}>{estadisticas.totalPlantas}</Text>
            <Text style={styles.statLabel}>Plantas</Text>
          </View>
          <View style={styles.statItem}>
            <Text style={styles.statValue}>{estadisticas.totalTurnos}</Text>
            <Text style={styles.statLabel}>Turnos</Text>
          </View>
          <View style={styles.statItem}>
            <Text style={styles.statValue}>{estadisticas.totalAreas}</Text>
            <Text style={styles.statLabel}>Áreas</Text>
          </View>
          <View style={styles.statItem}>
            <Text style={styles.statValue}>{estadisticas.totalPuestos}</Text>
            <Text style={styles.statLabel}>Puestos Únicos</Text>
          </View>
        </View>
      </Card>

      {renderPlantas()}
      {renderTurnos()}
      {renderAreas()}
      {renderPuestos()}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: Spacing.lg,
    backgroundColor: AppColors.background,
  },
  loadingText: {
    ...Typography.body1,
    color: AppColors.textSecondary,
    textAlign: 'center',
    marginTop: Spacing['4xl'],
  },
  statsCard: {
    marginBottom: Spacing.xl,
  },
  title: {
    ...Typography.h3,
    color: AppColors.textPrimary,
    textAlign: 'center',
    marginBottom: Spacing.lg,
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-around',
    gap: Spacing.md,
  },
  statItem: {
    alignItems: 'center',
    minWidth: 80,
  },
  statValue: {
    ...Typography.h2,
    color: AppColors.primary,
    fontWeight: 'bold',
  },
  statLabel: {
    ...Typography.caption,
    color: AppColors.textSecondary,
    textAlign: 'center',
    marginTop: Spacing.xs,
  },
  section: {
    marginBottom: Spacing.xl,
  },
  sectionTitle: {
    ...Typography.h4,
    color: AppColors.textPrimary,
    marginBottom: Spacing.md,
  },
  optionsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.sm,
  },
  option: {
    paddingVertical: Spacing.sm,
    paddingHorizontal: Spacing.md,
    backgroundColor: AppColors.surface,
    borderRadius: BorderRadius.md,
    borderWidth: 1,
    borderColor: AppColors.borderLight,
  },
  selectedOption: {
    backgroundColor: AppColors.primary,
    borderColor: AppColors.primary,
  },
  optionText: {
    ...Typography.body2,
    color: AppColors.textPrimary,
  },
  selectedOptionText: {
    color: AppColors.textInverse,
    fontWeight: 'bold',
  },
  puestosContainer: {
    gap: Spacing.xs,
  },
  puestoItem: {
    paddingVertical: Spacing.xs,
    paddingHorizontal: Spacing.sm,
    backgroundColor: AppColors.surface,
    borderRadius: BorderRadius.sm,
    borderLeftWidth: 3,
    borderLeftColor: AppColors.accent,
  },
  puestoText: {
    ...Typography.body2,
    color: AppColors.textPrimary,
  },
});








