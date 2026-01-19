import { UnidadDeNegocio, Position, SubPosition } from '@/types';
import { SoporteDataProcessor } from './soporteDataProcessor';

export class SelectionDataService {
  // Business Unit to Position mappings
  private static businessUnitPositionMappings: { businessUnit: UnidadDeNegocio; availablePositions: Position[] }[] = [
    {
      businessUnit: 'DD',
      availablePositions: ['Ensamblador', 'Empacador', 'Inspector de Calidad', 'Mecanico de ensamble', 'Asistente de Supervisor', 'Supervisor', 'Operador universal']
    },
    {
      businessUnit: 'FX',
      availablePositions: ['Ensamblador', 'Empacador', 'Inspector de Calidad', 'Mecanico de ensamble', 'Asistente de Supervisor', 'Supervisor', 'Operador universal']
    },
    {
      businessUnit: 'HCM',
      availablePositions: ['Ensamblador', 'Empacador', 'Inspector de Calidad', 'Mecanico de ensamble', 'Asistente de Supervisor', 'Supervisor', 'Operador universal', 'Operador de Maquina']
    },
    {
      businessUnit: 'Irrigación',
      availablePositions: ['Ensamblador', 'Empacador', 'Inspector de Calidad', 'Mecanico de ensamble', 'Asistente de Supervisor', 'Supervisor', 'Operador universal', 'Operador de Maquina', 'Separador de partes', 'Tecnico Set Up', 'Tecnico Procesos', 'Mecanico de moldeo', 'Resinero']
    },
    {
      businessUnit: 'SOPORTE',
      availablePositions: [] // Se carga dinámicamente desde SoporteDataProcessor
    }
  ];

  // Position to SubPosition mappings
  private static positionSubPositionMappings: { position: Position; availableSubPositions: SubPosition[] }[] = [
    {
      position: 'Ensamblador',
      availableSubPositions: ['Nivel 1', 'Nivel 2', 'Nivel 3', 'Nivel 4', 'Nivel 5']
    },
    {
      position: 'Empacador',
      availableSubPositions: ['Nivel 1', 'Nivel 2', 'Nivel 3']
    },
    {
      position: 'Inspector de Calidad',
      availableSubPositions: ['Nivel 1', 'Nivel 2', 'Nivel 3', 'Nivel 4']
    },
    {
      position: 'Mecanico de ensamble',
      availableSubPositions: ['Nivel 1', 'Nivel 2', 'Nivel 3', 'Nivel 4', 'Nivel 5']
    },
    {
      position: 'Asistente de Supervisor',
      availableSubPositions: ['Nivel 1', 'Nivel 2', 'Nivel 3']
    },
    {
      position: 'Supervisor',
      availableSubPositions: ['Nivel 1', 'Nivel 2', 'Nivel 3', 'Nivel 4']
    },
    {
      position: 'Operador universal',
      availableSubPositions: ['Nivel 1', 'Nivel 2', 'Nivel 3', 'Nivel 4']
    },
    {
      position: 'Operador de Maquina',
      availableSubPositions: ['Nivel 1', 'Nivel 2', 'Nivel 3']
    },
    {
      position: 'Separador de partes',
      availableSubPositions: ['Nivel 1', 'Nivel 2']
    },
    {
      position: 'Tecnico Set Up',
      availableSubPositions: ['Nivel 1', 'Nivel 2', 'Nivel 3', 'Nivel 4']
    },
    {
      position: 'Tecnico Procesos',
      availableSubPositions: ['Nivel 1', 'Nivel 2', 'Nivel 3', 'Nivel 4']
    },
    {
      position: 'Mecanico de moldeo',
      availableSubPositions: ['Nivel 1', 'Nivel 2', 'Nivel 3', 'Nivel 4', 'Nivel 5']
    },
    {
      position: 'Resinero',
      availableSubPositions: ['Nivel 1', 'Nivel 2', 'Nivel 3']
    }
  ];

  // Get all business units
  static getBusinessUnits(): UnidadDeNegocio[] {
    return ['DD', 'FX', 'HCM', 'Irrigación', 'SOPORTE'];
  }

  // Get available positions for a business unit
  static getAvailablePositions(businessUnit: UnidadDeNegocio): Position[] {
    // Si es SOPORTE, usar el procesador de datos
    if (businessUnit === 'SOPORTE') {
      return SoporteDataProcessor.getPuestos() as Position[];
    }
    
    const mapping = this.businessUnitPositionMappings.find(m => m.businessUnit === businessUnit);
    return mapping ? mapping.availablePositions : [];
  }

  // Métodos específicos para SOPORTE
  static getSoportePlantas(): string[] {
    return SoporteDataProcessor.getPlantas();
  }

  static getSoporteTurnos(planta?: string): string[] {
    if (planta) {
      return SoporteDataProcessor.getTurnosByPlanta(planta);
    }
    return SoporteDataProcessor.getTurnos();
  }

  static getSoporteAreas(planta: string, turno: string): string[] {
    return SoporteDataProcessor.getAreasByPlantaAndTurno(planta, turno);
  }

  static getSoportePuestos(planta: string, turno: string, area: string): string[] {
    return SoporteDataProcessor.getPuestosByPlantaTurnoArea(planta, turno, area);
  }

  static getSoporteEstadisticas() {
    return SoporteDataProcessor.getEstadisticas();
  }

  // Get available sub-positions for a position
  static getAvailableSubPositions(position: Position): SubPosition[] {
    const mapping = this.positionSubPositionMappings.find(m => m.position === position);
    return mapping ? mapping.availableSubPositions : [];
  }

  // Get all positions
  static getAllPositions(): Position[] {
    return ['Ensamblador', 'Empacador', 'Inspector de Calidad', 'Mecanico de ensamble', 'Asistente de Supervisor', 'Supervisor', 'Operador universal', 'Operador de Maquina', 'Separador de partes', 'Tecnico Set Up', 'Tecnico Procesos', 'Mecanico de moldeo', 'Resinero'];
  }

  // Get all sub-positions
  static getAllSubPositions(): SubPosition[] {
    return ['Nivel 1', 'Nivel 2', 'Nivel 3', 'Nivel 4', 'Nivel 5'];
  }
}
