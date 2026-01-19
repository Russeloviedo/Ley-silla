const XLSX = require('xlsx');
const path = require('path');
const fs = require('fs');

// Ruta del archivo Excel
const excelFile = path.join(__dirname, 'Estructura inventario de actividades.xlsx');

console.log('🚀 Generando sistema completo desde Excel...');

try {
  // Leer el archivo Excel
  const workbook = XLSX.readFile(excelFile);
  const sheetName = workbook.SheetNames[0];
  const worksheet = workbook.Sheets[sheetName];
  
  // Convertir a JSON
  const jsonData = XLSX.utils.sheet_to_json(worksheet, { header: 1 });
  
  // Extraer encabezados
  const headers = jsonData[0] || [];
  console.log('📋 Encabezados detectados:', headers);
  
  // Estructuras de datos
  const businessUnits = new Set();
  const plants = new Set();
  const shifts = new Set();
  const areas = new Set();
  const positions = new Set();
  
  // Mapeos jerárquicos
  const businessUnitPlantMappings = [];
  const shiftMappings = [];
  const areaMappings = [];
  const positionMappings = [];
  
  // Procesar cada fila de datos
  for (let row = 1; row < jsonData.length; row++) {
    const rowData = jsonData[row];
    if (rowData && rowData.length >= 6) {
      const bu = rowData[0];
      const plant = rowData[2];
      const shift = rowData[3];
      const area = rowData[4];
      const position = rowData[5];
      
      if (bu && plant && shift && area && position) {
        // Agregar valores únicos
        businessUnits.add(bu);
        plants.add(plant);
        shifts.add(shift);
        areas.add(area);
        positions.add(position);
        
        // Crear mapeos jerárquicos
        const buPlantKey = `${bu}-${plant}`;
        const buPlantShiftKey = `${bu}-${plant}-${shift}`;
        const buPlantShiftAreaKey = `${bu}-${plant}-${shift}-${area}`;
        
        // Business Unit -> Plant mapping
        if (!businessUnitPlantMappings.find(m => m.businessUnit === bu && m.availablePlants.includes(plant))) {
          const existingMapping = businessUnitPlantMappings.find(m => m.businessUnit === bu);
          if (existingMapping) {
            if (!existingMapping.availablePlants.includes(plant)) {
              existingMapping.availablePlants.push(plant);
            }
          } else {
            businessUnitPlantMappings.push({
              businessUnit: bu,
              availablePlants: [plant]
            });
          }
        }
        
        // Shift mapping
        if (!shiftMappings.find(m => m.businessUnit === bu && m.plant === plant && m.availableShifts.includes(shift))) {
          const existingMapping = shiftMappings.find(m => m.businessUnit === bu && m.plant === plant);
          if (existingMapping) {
            if (!existingMapping.availableShifts.includes(shift)) {
              existingMapping.availableShifts.push(shift);
            }
          } else {
            shiftMappings.push({
              businessUnit: bu,
              plant: plant,
              availableShifts: [shift]
            });
          }
        }
        
        // Area mapping
        if (!areaMappings.find(m => m.businessUnit === bu && m.plant === plant && m.shift === shift && m.availableAreas.includes(area))) {
          const existingMapping = areaMappings.find(m => m.businessUnit === bu && m.plant === plant && m.shift === shift);
          if (existingMapping) {
            if (!existingMapping.availableAreas.includes(area)) {
              existingMapping.availableAreas.push(area);
            }
          } else {
            areaMappings.push({
              businessUnit: bu,
              plant: plant,
              shift: shift,
              availableAreas: [area]
            });
          }
        }
        
        // Position mapping
        if (!positionMappings.find(m => m.businessUnit === bu && m.plant === plant && m.shift === shift && m.area === area && m.availablePositions.includes(position))) {
          const existingMapping = positionMappings.find(m => m.businessUnit === bu && m.plant === plant && m.shift === shift && m.area === area);
          if (existingMapping) {
            if (!existingMapping.availablePositions.includes(position)) {
              existingMapping.availablePositions.push(position);
            }
          } else {
            positionMappings.push({
              businessUnit: bu,
              plant: plant,
              shift: shift,
              area: area,
              availablePositions: [position]
            });
          }
        }
      }
    }
  }
  
  // Ordenar todos los arrays
  const sortedBusinessUnits = Array.from(businessUnits).sort();
  const sortedPlants = Array.from(plants).sort();
  const sortedShifts = Array.from(shifts).sort();
  const sortedAreas = Array.from(areas).sort();
  const sortedPositions = Array.from(positions).sort();
  
  // Ordenar mapeos
  businessUnitPlantMappings.sort((a, b) => a.businessUnit.localeCompare(b.businessUnit));
  shiftMappings.sort((a, b) => a.businessUnit.localeCompare(b.businessUnit) || a.plant.toString().localeCompare(b.plant.toString()));
  areaMappings.sort((a, b) => a.businessUnit.localeCompare(b.businessUnit) || a.plant.toString().localeCompare(b.plant.toString()) || a.shift.toString().localeCompare(b.shift.toString()));
  positionMappings.sort((a, b) => a.businessUnit.localeCompare(b.businessUnit) || a.plant.toString().localeCompare(b.plant.toString()) || a.shift.toString().localeCompare(b.shift.toString()) || a.area.localeCompare(b.area));
  
  // Generar archivo de tipos TypeScript
  const typesContent = `// Tipos generados automáticamente desde Excel
export type BusinessUnit = ${sortedBusinessUnits.map(bu => `'${bu}'`).join(' | ')};

export type Plant = ${sortedPlants.map(plant => typeof plant === 'number' ? plant : `'${plant}'`).join(' | ')};

export type Shift = ${sortedShifts.map(shift => typeof shift === 'number' ? shift : `'${shift}'`).join(' | ')};

export type Area = ${sortedAreas.map(area => `'${area}'`).join(' | ')};

export type Position = ${sortedPositions.map(pos => `'${pos}'`).join(' | ')};

export interface BusinessUnitPlantMapping {
  businessUnit: BusinessUnit;
  availablePlants: Plant[];
}

export interface ShiftMapping {
  businessUnit: BusinessUnit;
  plant: Plant;
  availableShifts: Shift[];
}

export interface AreaMapping {
  businessUnit: BusinessUnit;
  plant: Plant;
  shift: Shift;
  availableAreas: Area[];
}

export interface PositionMapping {
  businessUnit: BusinessUnit;
  plant: Plant;
  shift: Shift;
  area: Area;
  availablePositions: Position[];
}
`;

  // Generar archivo del servicio de datos
  const serviceContent = `import { BusinessUnit, Plant, Shift, Area, Position, BusinessUnitPlantMapping, ShiftMapping, AreaMapping, PositionMapping } from '@/types';

export class SelectionDataService {
  // Business Unit to Plant mappings
  private static businessUnitPlantMappings: BusinessUnitPlantMapping[] = ${JSON.stringify(businessUnitPlantMappings, null, 2)};

  // Shift mappings - each plant has specific shifts available
  private static shiftMappings: ShiftMapping[] = ${JSON.stringify(shiftMappings, null, 2)};

  // Area mappings - based on business unit, plant, and shift
  private static areaMappings: AreaMapping[] = ${JSON.stringify(areaMappings, null, 2)};

  // Position mappings - based on business unit, plant, shift, and area
  private static positionMappings: PositionMapping[] = ${JSON.stringify(positionMappings, null, 2)};

  // Get all available plants
  static getAllPlants(): Plant[] {
    return ${JSON.stringify(sortedPlants)};
  }

  // Get available plants for a business unit
  static getAvailablePlants(businessUnit: BusinessUnit): Plant[] {
    const mapping = this.businessUnitPlantMappings.find(m => m.businessUnit === businessUnit);
    return mapping ? mapping.availablePlants : [];
  }

  // Get available shifts for a business unit and plant
  static getAvailableShifts(businessUnit: BusinessUnit, plant: Plant): Shift[] {
    const mapping = this.shiftMappings.find(m => m.businessUnit === businessUnit && m.plant === plant);
    return mapping ? mapping.availableShifts : [];
  }

  // Get available areas for a business unit, plant, and shift
  static getAvailableAreas(businessUnit: BusinessUnit, plant: Plant, shift: Shift): Area[] {
    const mapping = this.areaMappings.find(m => m.businessUnit === businessUnit && m.plant === plant && m.shift === shift);
    return mapping ? mapping.availableAreas : [];
  }

  // Get available positions for a business unit, plant, shift, and area
  static getAvailablePositions(businessUnit: BusinessUnit, plant: Plant, shift: Shift, area: Area): Position[] {
    const mapping = this.positionMappings.find(m => 
      m.businessUnit === businessUnit && 
      m.plant === plant && 
      m.shift === shift && 
      m.area === area
    );
    return mapping ? mapping.availablePositions : [];
  }

  // Get all business units
  static getBusinessUnits(): BusinessUnit[] {
    return ${JSON.stringify(sortedBusinessUnits)};
  }

  static getAllShifts(): Shift[] {
    return ${JSON.stringify(sortedShifts)};
  }

  static getAllAreas(): Area[] {
    return ${JSON.stringify(sortedAreas)};
  }

  static getAllPositions(): Position[] {
    return ${JSON.stringify(sortedPositions)};
  }
}
`;

  // Escribir archivos
  fs.writeFileSync(path.join(__dirname, '..', 'types', 'index.ts'), typesContent);
  fs.writeFileSync(path.join(__dirname, '..', 'utils', 'selectionDataService.ts'), serviceContent);
  
  console.log('\n✅ Sistema generado exitosamente!');
  console.log('\n📊 Resumen de la integración:');
  console.log(`🏢 Unidades de Negocio: ${sortedBusinessUnits.length} (${sortedBusinessUnits.join(', ')})`);
  console.log(`🏭 Plantas: ${sortedPlants.length}`);
  console.log(`⏰ Turnos: ${sortedShifts.length}`);
  console.log(`📍 Áreas: ${sortedAreas.length}`);
  console.log(`👷 Puestos: ${sortedPositions.length}`);
  console.log(`📋 Total de mapeos de posiciones: ${positionMappings.length}`);
  
  console.log('\n📁 Archivos generados:');
  console.log('  - types/index.ts');
  console.log('  - utils/selectionDataService.ts');
  
  console.log('\n🚀 El sistema está listo para usar!');
  
} catch (error) {
  console.error('❌ Error al generar el sistema:', error.message);
}
