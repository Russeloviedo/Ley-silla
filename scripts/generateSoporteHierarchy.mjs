#!/usr/bin/env node

import { readFileSync, writeFileSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const dataPath = join(__dirname, '..', 'data', 'soporteData.json');
const outputPath = join(__dirname, '..', 'data', 'soporteHierarchy.json');

const raw = JSON.parse(readFileSync(dataPath, 'utf8'));

const hierarchy = {
  businessUnit: {
    id: 'SOPORTE',
    name: 'Soporte',
    emoji: '🛠️',
    color: '#FFEAA7'
  },
  plants: []
};

const plantMap = new Map();

for (const entry of raw) {
  const plantId = entry.planta;
  if (!plantMap.has(plantId)) {
    const plantObj = { id: plantId, shifts: [] };
    plantMap.set(plantId, plantObj);
    hierarchy.plants.push(plantObj);
  }
  const plantObj = plantMap.get(plantId);

  const shiftId = entry.turno;
  let shiftObj = plantObj.shifts.find((s) => s.id === shiftId);
  if (!shiftObj) {
    shiftObj = { id: shiftId, areas: [] };
    plantObj.shifts.push(shiftObj);
  }

  const areaId = entry.area;
  let areaObj = shiftObj.areas.find((a) => a.id === areaId);
  if (!areaObj) {
    areaObj = { id: areaId, positions: [] };
    shiftObj.areas.push(areaObj);
  }

  if (!areaObj.positions.includes(entry.puesto)) {
    areaObj.positions.push(entry.puesto);
  }
}

for (const plant of hierarchy.plants) {
  plant.shifts.sort((a, b) => a.id.localeCompare(b.id));
  for (const shift of plant.shifts) {
    shift.areas.sort((a, b) => a.id.localeCompare(b.id));
    for (const area of shift.areas) {
      area.positions.sort((a, b) => a.localeCompare(b));
    }
  }
}

writeFileSync(outputPath, JSON.stringify(hierarchy, null, 2), 'utf8');
console.log(`✅ Hierarchy written to ${outputPath}`);




