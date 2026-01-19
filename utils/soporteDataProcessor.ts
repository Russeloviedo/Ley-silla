// Procesador de datos de SOPORTE
import soporteDataRaw from '../data/soporteData.json';

export interface PuestoSoporte {
  unidadNegocio: string;
  planta: string;
  turno: string;
  area: string;
  puesto: string;
}

export class SoporteDataProcessor {
  private static data: PuestoSoporte[] = (() => {
    try {
      // Verificar que soporteDataRaw es un array
      if (Array.isArray(soporteDataRaw)) {
        console.log('✅ Datos de SOPORTE cargados correctamente:', soporteDataRaw.length, 'registros');
        return soporteDataRaw as PuestoSoporte[];
      } else {
        console.error('❌ Error: soporteDataRaw no es un array:', typeof soporteDataRaw);
        return [];
      }
    } catch (error) {
      console.error('❌ Error al cargar datos de SOPORTE:', error);
      return [];
    }
  })();

  // Obtener todas las plantas únicas para SOPORTE
  static getPlantas(): string[] {
    const plantas = new Set<string>();
    this.data.forEach(item => plantas.add(item.planta));
    return Array.from(plantas).sort();
  }

  // Obtener todos los turnos únicos para SOPORTE
  static getTurnos(): string[] {
    const turnos = new Set<string>();
    this.data.forEach(item => turnos.add(item.turno));
    return Array.from(turnos).sort();
  }

  // Obtener todas las áreas únicas para SOPORTE
  static getAreas(): string[] {
    const areas = new Set<string>();
    this.data.forEach(item => areas.add(item.area));
    return Array.from(areas).sort();
  }

  // Obtener todos los puestos únicos para SOPORTE
  static getPuestos(): string[] {
    const puestos = new Set<string>();
    this.data.forEach(item => puestos.add(item.puesto));
    return Array.from(puestos).sort();
  }

  // Obtener turnos por planta
  static getTurnosByPlanta(planta: string): string[] {
    const turnos = new Set<string>();
    this.data
      .filter(item => item.planta === planta)
      .forEach(item => turnos.add(item.turno));
    return Array.from(turnos).sort();
  }

  // Obtener áreas por planta y turno
  static getAreasByPlantaAndTurno(planta: string, turno: string): string[] {
    const areas = new Set<string>();
    this.data
      .filter(item => item.planta === planta && item.turno === turno)
      .forEach(item => areas.add(item.area));
    return Array.from(areas).sort();
  }

  // Obtener puestos por planta, turno y área
  static getPuestosByPlantaTurnoArea(planta: string, turno: string, area: string): string[] {
    const puestos = new Set<string>();
    this.data
      .filter(item => 
        item.planta === planta && 
        item.turno === turno && 
        item.area === area
      )
      .forEach(item => puestos.add(item.puesto));
    return Array.from(puestos).sort();
  }

  // Obtener estadísticas
  static getEstadisticas() {
    return {
      totalRegistros: this.data.length,
      totalPlantas: this.getPlantas().length,
      totalTurnos: this.getTurnos().length,
      totalAreas: this.getAreas().length,
      totalPuestos: this.getPuestos().length,
      plantas: this.getPlantas(),
      turnos: this.getTurnos(),
      areas: this.getAreas(),
    };
  }

  // Validar existencia de combinación
  static existeCombinacion(planta: string, turno: string, area: string, puesto: string): boolean {
    return this.data.some(item =>
      item.planta === planta &&
      item.turno === turno &&
      item.area === area &&
      item.puesto === puesto
    );
  }

  // Obtener todos los datos
  static getAllData(): PuestoSoporte[] {
    return this.data;
  }

  // Buscar puestos por filtros
  static buscarPuestos(filtros: {
    planta?: string;
    turno?: string;
    area?: string;
    puesto?: string;
  }): PuestoSoporte[] {
    let resultado = this.data;

    if (filtros.planta) {
      resultado = resultado.filter(item => item.planta === filtros.planta);
    }
    if (filtros.turno) {
      resultado = resultado.filter(item => item.turno === filtros.turno);
    }
    if (filtros.area) {
      resultado = resultado.filter(item => item.area === filtros.area);
    }
    if (filtros.puesto) {
      resultado = resultado.filter(item => item.puesto === filtros.puesto);
    }

    return resultado;
  }
}

// Log de estadísticas al cargar el módulo
console.log('📊 Estadísticas completas de SOPORTE:', SoporteDataProcessor.getEstadisticas());

