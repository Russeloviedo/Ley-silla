const XLSX = require('xlsx');
const path = require('path');

// Ruta del archivo Excel
const excelFile = path.join(__dirname, 'Estructura inventario de actividades.xlsx');

console.log('🔍 Analizando archivo Excel:', excelFile);

try {
  // Leer el archivo Excel
  const workbook = XLSX.readFile(excelFile);
  
  // Obtener la primera hoja
  const sheetName = workbook.SheetNames[0];
  const worksheet = workbook.Sheets[sheetName];
  
  console.log('📊 Hoja encontrada:', sheetName);
  
  // Convertir a JSON
  const jsonData = XLSX.utils.sheet_to_json(worksheet, { header: 1 });
  
  console.log('\n📋 Estructura del archivo:');
  console.log('Total de filas:', jsonData.length);
  
  if (jsonData.length > 0) {
    console.log('Columnas detectadas:', jsonData[0]);
    console.log('\n📝 Primeras 10 filas de datos:');
    
    // Mostrar las primeras filas para entender la estructura
    for (let i = 1; i < Math.min(11, jsonData.length); i++) {
      if (jsonData[i] && jsonData[i].length > 0) {
        console.log(`Fila ${i}:`, jsonData[i]);
      }
    }
    
    // Analizar la estructura de datos
    console.log('\n🔍 Análisis de estructura:');
    
    // Encontrar encabezados
    const headers = jsonData[0] || [];
    console.log('Encabezados:', headers);
    
    // Analizar tipos de datos por columna
    const columnTypes = {};
    headers.forEach((header, index) => {
      if (header) {
        const values = [];
        for (let row = 1; row < jsonData.length; row++) {
          if (jsonData[row] && jsonData[row][index]) {
            values.push(jsonData[row][index]);
          }
        }
        
        const uniqueValues = [...new Set(values.filter(v => v !== null && v !== undefined))];
        columnTypes[header] = {
          totalValues: values.length,
          uniqueValues: uniqueValues.length,
          sampleValues: uniqueValues.slice(0, 5)
        };
      }
    });
    
    console.log('\n📊 Análisis por columna:');
    Object.entries(columnTypes).forEach(([header, info]) => {
      console.log(`${header}:`);
      console.log(`  - Total de valores: ${info.totalValues}`);
      console.log(`  - Valores únicos: ${info.uniqueValues}`);
      console.log(`  - Ejemplos: ${info.sampleValues.join(', ')}`);
    });
    
    // Buscar patrones de unidades de negocio
    const businessUnits = new Set();
    const plants = new Set();
    const shifts = new Set();
    const areas = new Set();
    const positions = new Set();
    
    for (let row = 1; row < jsonData.length; row++) {
      if (jsonData[row] && jsonData[row].length >= 5) {
        const bu = jsonData[row][0];
        const plant = jsonData[row][1];
        const shift = jsonData[row][2];
        const area = jsonData[row][3];
        const position = jsonData[row][4];
        
        if (bu) businessUnits.add(bu);
        if (plant) plants.add(plant);
        if (shift) shifts.add(shift);
        if (area) areas.add(area);
        if (position) positions.add(position);
      }
    }
    
    console.log('\n🏢 Unidades de Negocio encontradas:');
    console.log(Array.from(businessUnits).sort());
    
    console.log('\n🏭 Plantas encontradas:');
    console.log(Array.from(plants).sort());
    
    console.log('\n⏰ Turnos encontrados:');
    console.log(Array.from(shifts).sort());
    
    console.log('\n📍 Áreas encontradas:');
    console.log(Array.from(areas).sort());
    
    console.log('\n👷 Puestos encontrados:');
    console.log(Array.from(positions).sort());
    
  }
  
} catch (error) {
  console.error('❌ Error al leer el archivo Excel:', error.message);
}

