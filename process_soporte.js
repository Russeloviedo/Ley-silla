const fs = require('fs');
const path = require('path');

const dataPath = path.join(__dirname, 'data', 'soporteData.json');
const rawData = fs.readFileSync(dataPath, 'utf8');
const soporteData = JSON.parse(rawData);

// Structure: Planta -> Turno -> Area -> [Puestos]
const hierarchy = {};

soporteData.forEach(item => {
    const { planta, turno, area, puesto } = item;

    if (!hierarchy[planta]) hierarchy[planta] = {};
    if (!hierarchy[planta][turno]) hierarchy[planta][turno] = {};
    if (!hierarchy[planta][turno][area]) hierarchy[planta][turno][area] = new Set();

    hierarchy[planta][turno][area].add(puesto);
});

console.log('## 6. SOPORTE (Business Unit - Dinámico)');
console.log('> Datos extraídos directamente de `data/soporteData.json`.');
console.log('');

Object.keys(hierarchy).sort().forEach(planta => {
    console.log(`### Planta ${planta}`);

    const turnos = hierarchy[planta];
    Object.keys(turnos).sort().forEach(turno => {
        console.log(`#### Turno ${turno}`);

        // Check if we can group areas or just list them
        const areas = turnos[turno];
        Object.keys(areas).sort().forEach(area => {
            console.log(`- **${area}**: `);
            const puestos = Array.from(areas[area]).sort();
            puestos.forEach(puesto => {
                console.log(`  - ${puesto}`);
            });
        });
        console.log('');
    });
    console.log('---');
});
