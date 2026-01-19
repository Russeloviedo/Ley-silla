const fs = require('fs');
const path = require('path');

// 1. Read Soporte Data (JSON)
const soportePath = path.join(__dirname, 'data', 'soporteData.json');
let soporteData = [];
try {
    const raw = fs.readFileSync(soportePath, 'utf8');
    soporteData = JSON.parse(raw);
} catch (e) {
    console.error("Error reading soporteData.json", e);
}

// 2. Define Hardcoded Data (from seleccion-puesto.tsx)
const irrData = [
    // Parte 1 - Turnos A, AD01, A001, A002
    { turno: 'A', area: 'ICV', puesto: 'Separador de Partes' },
    { turno: 'A', area: 'Moldeo', puesto: 'Coord Tecnico de Moldeo (IR)' },
    { turno: 'A', area: 'Moldeo', puesto: 'Ensamblador' },
    { turno: 'A', area: 'Moldeo', puesto: 'Mezclador de Resinas' },
    { turno: 'A', area: 'Moldeo', puesto: 'Mezclador de Resinas Sr.' },
    { turno: 'A', area: 'Moldeo', puesto: 'Operador Universal' },
    { turno: 'A', area: 'Moldeo', puesto: 'Separador de Partes' },
    { turno: 'A', area: 'Moldeo', puesto: 'Tecnico de Moldeo III (IR)' },
    { turno: 'A', area: 'Moldeo', puesto: 'Tecnico de Set Up "I" (IR)' },
    { turno: 'A', area: 'Moldeo', puesto: 'Tecnico de Set Up "III" (IR)' },
    { turno: 'A', area: 'Solenoides', puesto: 'Ensamblador' },
    { turno: 'A', area: 'Solenoides', puesto: 'Separador de Partes' },
    { turno: 'A', area: 'Solenoides', puesto: 'Operador de Maquina' },
    { turno: 'A', area: 'Solenoides', puesto: 'Operador Universal' },
    { turno: 'AD01', area: 'Administracion de Produccion', puesto: 'Control de Produccion (IR)' },
    { turno: 'AD01', area: 'Moldeo', puesto: 'Tecnico de Set Up "I" (IR)' },
    { turno: 'A001', area: 'Administracion de Produccion', puesto: 'Asist de Sup de Ensamble (IR)' },
    { turno: 'A001', area: 'Administracion de Produccion', puesto: 'Asistente de Supervisor Sr IR' },
    { turno: 'A001', area: 'Diafragma', puesto: 'Ensamblador' },
    { turno: 'A001', area: 'Drip Zone', puesto: 'Ensamblador' },
    { turno: 'A001', area: 'Ensamble ASV', puesto: 'Ensamblador' },
    { turno: 'A001', area: 'Ensamble ASV', puesto: 'Operador Universal' },
    { turno: 'A001', area: 'Ensamble PGV', puesto: 'Ensamblador' },
    { turno: 'A001', area: 'Ensamble PGV', puesto: 'Operador Universal' },
    { turno: 'A001', area: 'Ensamble Pro-Spray', puesto: 'Asist de Sup de Ensamble (IR)' },
    { turno: 'A001', area: 'Ensamble Pro-Spray', puesto: 'Ensamblador' },
    { turno: 'A001', area: 'Ensamble Pro-Spray', puesto: 'Operador Universal' },
    { turno: 'A001', area: 'HSBE', puesto: 'Ensamblador' },
    { turno: 'A001', area: 'ICV', puesto: 'Ensamblador' },
    { turno: 'A001', area: 'ICV', puesto: 'Operador de Maquina' },
    { turno: 'A001', area: 'ICV', puesto: 'Operador Universal' },
    { turno: 'A001', area: 'I-25/I-140', puesto: 'Ensamblador' },
    { turno: 'A001', area: 'Moldeo', puesto: 'Tecnico de Procesos' },
    { turno: 'A001', area: 'PGJ', puesto: 'Asist de Sup de Ensamble (IR)' },
    { turno: 'A001', area: 'PGJ', puesto: 'Ensamblador' },
    { turno: 'A001', area: 'PGJ', puesto: 'Operador de Maquina' },
    { turno: 'A001', area: 'PGJ', puesto: 'Operador Universal' },
    { turno: 'A001', area: 'PGV1.5&2', puesto: 'Ensamblador' },
    { turno: 'A001', area: 'PSU', puesto: 'Ensamblador' },
    { turno: 'A001', area: 'Rotor Sub-Assembly', puesto: 'Ensamblador' },
    { turno: 'A001', area: 'SRM', puesto: 'Ensamblador' },
    { turno: 'A001', area: 'SRM', puesto: 'Operador de Maquina' },
    { turno: 'A001', area: 'SRM', puesto: 'Operador Universal' },
    { turno: 'A001', area: 'Swing Joint', puesto: 'Operador Universal' },
    { turno: 'A002', area: 'Administracion de Produccion', puesto: 'Asistente de Supervisor Sr IR' },
    { turno: 'A002', area: 'Ensamble ASV', puesto: 'Asistente de Supervisor Sr IR' },
    { turno: 'A002', area: 'Ensamble ASV', puesto: 'Ensamblador' },
    { turno: 'A002', area: 'Ensamble ASV', puesto: 'Operador Universal' },
    { turno: 'A002', area: 'Ensamble PGV', puesto: 'Asist de Sup de Ensamble (IR)' },
    { turno: 'A002', area: 'Ensamble PGV', puesto: 'Ensamblador' },
    { turno: 'A002', area: 'Ensamble PGV', puesto: 'Operador Universal' },

    // Parte 2 - Continuación A002 y nuevos turnos B, C, D, JR
    { turno: 'A002', area: 'Ensamble Pro-Spray', puesto: 'Asist de Sup de Ensamble (IR)' },
    { turno: 'A002', area: 'Ensamble Pro-Spray', puesto: 'Ensamblador' },
    { turno: 'A002', area: 'Ensamble Pro-Spray', puesto: 'Operador Universal' },
    { turno: 'A002', area: 'I-20', puesto: 'Ensamblador' },
    { turno: 'A002', area: 'PGJ', puesto: 'Ensamblador' },
    { turno: 'A002', area: 'PGJ', puesto: 'Operador de Maquina' },
    { turno: 'A002', area: 'PGV1.5&2', puesto: 'Ensamblador' },
    { turno: 'A002', area: 'PSU', puesto: 'Ensamblador' },
    { turno: 'A002', area: 'Swing Joint', puesto: 'Ensamblador' },
    { turno: 'A002', area: '90540 HCV', puesto: 'Ensamblador' },
    { turno: 'A002', area: '90540 HCV', puesto: 'Operador Universal' },

    // Turno B
    { turno: 'B', area: 'Ensamble PGV', puesto: 'Mezclador de Resinas' },
    { turno: 'B', area: 'HSBE', puesto: 'Separador de Partes' },
    { turno: 'B', area: 'Moldeo', puesto: 'Coord Tecnico de Moldeo (IR)' },
    { turno: 'B', area: 'Moldeo', puesto: 'Ensamblador' },
    { turno: 'B', area: 'Moldeo', puesto: 'Mezclador de Resinas' },
    { turno: 'B', area: 'Moldeo', puesto: 'Mezclador de Resinas Sr.' },
    { turno: 'B', area: 'Moldeo', puesto: 'Operador Universal' },
    { turno: 'B', area: 'Moldeo', puesto: 'Separador de Partes' },
    { turno: 'B', area: 'Moldeo', puesto: 'Tecnico de Moldeo I (IR)' },
    { turno: 'B', area: 'Moldeo', puesto: 'Tecnico de Set Up "I" (IR)' },
    { turno: 'B', area: 'Moldeo', puesto: 'Tecnico de Moldeo III (IR)' },
    { turno: 'B', area: 'Moldeo', puesto: 'Tecnico de Set Up "III" (IR)' },
    { turno: 'B', area: 'Solenoides', puesto: 'Ensamblador' },
    { turno: 'B', area: 'Solenoides', puesto: 'Operador de Maquina' },
    { turno: 'B', area: 'Solenoides', puesto: 'Operador Universal' },
    { turno: 'B', area: 'Solenoides', puesto: 'Separador de Partes' },

    // Turno C
    { turno: 'C', area: 'Moldeo', puesto: 'Coord Tecnico de Moldeo (IR)' },
    { turno: 'C', area: 'Moldeo', puesto: 'Ensamblador' },
    { turno: 'C', area: 'Moldeo', puesto: 'Mezclador de Resinas Sr.' },
    { turno: 'C', area: 'Moldeo', puesto: 'Mezclador de Resinas' },
    { turno: 'C', area: 'Moldeo', puesto: 'Operador Universal' },
    { turno: 'C', area: 'Moldeo', puesto: 'Separador de Partes' },
    { turno: 'C', area: 'Moldeo', puesto: 'Tecnico de Moldeo I (IR)' },
    { turno: 'C', area: 'Moldeo', puesto: 'Tecnico de Set Up "I" (IR)' },
    { turno: 'C', area: 'Moldeo', puesto: 'Tecnico de Moldeo III (IR)' },
    { turno: 'C', area: 'Moldeo', puesto: 'Tecnico de Set Up "III" (IR)' },
    { turno: 'C', area: 'Solenoides', puesto: 'Ensamblador' },
    { turno: 'C', area: 'Solenoides', puesto: 'Operador de Maquina' },
    { turno: 'C', area: 'Solenoides', puesto: 'Operador Universal' },
    { turno: 'C', area: 'Swing Joint', puesto: 'Separador de Partes' },

    // Turno D
    { turno: 'D', area: 'Moldeo', puesto: 'Coord Tecnico de Moldeo (IR)' },
    { turno: 'D', area: 'Moldeo', puesto: 'Ensamblador' },
    { turno: 'D', area: 'Moldeo', puesto: 'Mezclador de Resinas' },
    { turno: 'D', area: 'Moldeo', puesto: 'Mezclador de Resinas Sr.' },
    { turno: 'D', area: 'Moldeo', puesto: 'Operador Universal' },
    { turno: 'D', area: 'Moldeo', puesto: 'Separador de Partes' },
    { turno: 'D', area: 'Moldeo', puesto: 'Tecnico de Moldeo I (IR)' },
    { turno: 'D', area: 'Moldeo', puesto: 'Tecnico de Moldeo II (DD)' },
    { turno: 'D', area: 'Moldeo', puesto: 'Tecnico de Moldeo III (IR)' },
    { turno: 'D', area: 'Moldeo', puesto: 'Tecnico de Set Up "III" (IR)' },
    { turno: 'D', area: 'Solenoides', puesto: 'Ensamblador' },
    { turno: 'D', area: 'Solenoides', puesto: 'Operador de Maquina' },
    { turno: 'D', area: 'Solenoides', puesto: 'Operador Universal' },

    // Turno JR
    { turno: 'JR', area: 'Ensamble Pro-Spray', puesto: 'Ensamblador' },
    { turno: 'JR', area: 'PGJ', puesto: 'Ensamblador' },
    { turno: 'JR', area: 'PSU', puesto: 'Ensamblador' },
    { turno: 'JR', area: 'Rotor Sub-Assembly', puesto: 'Ensamblador' },

    // Planta 2 - Turno A
    { turno: 'A', area: 'Moldeo', puesto: 'Mezclador de Resinas' },
    { turno: 'A', area: 'Moldeo', puesto: 'Operador Universal' },
    { turno: 'A', area: 'Moldeo', puesto: 'Separador de Partes' },
    { turno: 'A', area: 'Moldeo', puesto: 'Tecnico de Moldeo I (IR)' },
    { turno: 'A', area: 'Moldeo', puesto: 'Tecnico de Set Up "I" (IR)' },
    { turno: 'A', area: 'Moldeo', puesto: 'Tecnico de Set Up "III" (IR)' },

    // Planta 2 - Turno A001
    { turno: 'A001', area: 'Administracion de Produccion', puesto: 'Asist de Sup de Ensamble (IR)' }
];

const hcmData = [
    { turno: 'A', area: 'Moldeo', puesto: 'Separador de Partes' },
    { turno: 'A', area: 'Moldeo', puesto: 'Tecnico de Moldeo I (HCM)' },
    { turno: 'C', area: 'Moldeo', puesto: 'Separador de partes (HCM)' },
    { turno: 'C', area: 'Moldeo', puesto: 'Tecnico de Moldeo I (HCM)' },
    { turno: 'LS01', area: 'Moldeo', puesto: 'Coord Tecnico de Moldeo (HCM)' },
    { turno: 'LS01', area: 'Moldeo', puesto: 'Ensamblador' },
    { turno: 'LS01', area: 'Moldeo', puesto: 'Mezclador de Resinas (HCM)' },
    { turno: 'LS01', area: 'Moldeo', puesto: 'Mezclador de Resinas Sr. (HCM)' },
    { turno: 'LS01', area: 'Ensamble', puesto: 'Operador Ops Secundarias (HCM)' },
    { turno: 'LS01', area: 'Moldeo', puesto: 'Operador Universal (HCM)' },
    { turno: 'LS01', area: 'Moldeo', puesto: 'Separador de Partes' },
    { turno: 'LS01', area: 'Moldeo', puesto: 'Surtidor de Materiales (HCM)' },
    { turno: 'LS01', area: 'Moldeo', puesto: 'Tecnico de Set Up "III" (HCM)' },
    { turno: 'LS02', area: 'Moldeo', puesto: 'Coord Tecnico de Moldeo (HCM)' },
    { turno: 'LS02', area: 'Moldeo', puesto: 'Ensamblador' },
    { turno: 'LS02', area: 'Moldeo', puesto: 'Mezclador de Resinas (HCM)' },
    { turno: 'LS02', area: 'Moldeo', puesto: 'Mezclador de Resinas Sr. (HCM)' },
    { turno: 'LS02', area: 'Moldeo', puesto: 'Operador Universal (HCM)' },
    { turno: 'LS02', area: 'Moldeo', puesto: 'Separador de Partes' },
    { turno: 'LS02', area: 'Moldeo', puesto: 'Surtidor de Materiales (HCM)' },
    { turno: 'LS02', area: 'Moldeo', puesto: 'Tecnico de Set Up "I" (HCM)' },
    { turno: 'LS02', area: 'Moldeo', puesto: 'Tecnico de Set Up "III" (HCM)' },
    { turno: 'LS03', area: 'Moldeo', puesto: 'Coord Tecnico de Moldeo (HCM)' },
    { turno: 'LS03', area: 'Moldeo', puesto: 'Mezclador de Resinas (HCM)' },
    { turno: 'LS03', area: 'Moldeo', puesto: 'Mezclador de Resinas Sr. (HCM)' },
    { turno: 'LS03', area: 'Ensamble', puesto: 'Operador Ops Secundarias (HCM)' },
    { turno: 'LS03', area: 'Moldeo', puesto: 'Operador Universal (HCM)' },
    { turno: 'LS03', area: 'Moldeo', puesto: 'Separador de Partes' },
    { turno: 'LS03', area: 'Moldeo', puesto: 'Surtidor de Materiales (HCM)' },
    { turno: 'LS03', area: 'Moldeo', puesto: 'Tecnico de Set Up "I" (HCM)' },
    { turno: 'LS03', area: 'Moldeo', puesto: 'Tecnico de Set Up "III" (HCM)' }
];

const fxData = [
    { turno: 'A001', area: 'FX', puesto: 'Asist de Sup de Ensamble (FX)' },
    { turno: 'A001', area: 'FX', puesto: 'Tecnico en Pintura' },
    { turno: 'LS01', area: 'FX', puesto: 'Aprendiz de Pintor' },
    { turno: 'LS01', area: 'FX', puesto: 'Asist de Sup de Ensamble (FX)' },
    { turno: 'LS01', area: 'FX', puesto: 'Coordinador Técnicos CNC' },
    { turno: 'LS01', area: 'FX', puesto: 'Ensamblador' },
    { turno: 'LS01', area: 'FX', puesto: 'Operador CNC (FX)' },
    { turno: 'LS01', area: 'FX', puesto: 'Operador Universal (FX)' },
    { turno: 'LS01', area: 'FX', puesto: 'Pintor I' },
    { turno: 'LS01', area: 'FX', puesto: 'Pintor II' },
    { turno: 'LS01', area: 'FX', puesto: 'Pulidor (FX)' },
    { turno: 'LS01', area: 'FX', puesto: 'Tecnico "II" CNC' },
    { turno: 'LS02', area: 'FX', puesto: 'Aprendiz de Pintor' },
    { turno: 'LS02', area: 'FX', puesto: 'Asist de Sup de Ensamble (FX)' },
    { turno: 'LS02', area: 'FX', puesto: 'Coordinador Técnicos CNC' },
    { turno: 'LS02', area: 'FX', puesto: 'Ensamblador' },
    { turno: 'LS02', area: 'FX', puesto: 'Operador CNC (FX)' },
    { turno: 'LS02', area: 'FX', puesto: 'Operador Universal (FX)' },
    { turno: 'LS02', area: 'FX', puesto: 'Pintor I' },
    { turno: 'LS02', area: 'FX', puesto: 'Pintor II' },
    { turno: 'LS02', area: 'FX', puesto: 'Pulidor (FX)' },
    { turno: 'LS02', area: 'FX', puesto: 'Sup. de Produccion "II"(FX)' }
];

// DD Data (from previous turn view)
const ddData = [
    { turno: 'AD01', area: 'Celdas', puesto: 'Asistente Control Produccion' },
    { turno: 'AD01', area: 'Moldeo', puesto: 'Tecnico de Procesos' },
    { turno: 'AM01', area: 'Moldeo', puesto: 'Coord Tecnico de Moldeo (DD)' },
    { turno: 'A001', area: 'Moldeo', puesto: 'Asist de Sup de Ensamble (DD)' },
    { turno: 'A001', area: 'Moldeo', puesto: 'Auxiliar de Mantenimiento' },
    { turno: 'A001', area: 'Moldeo', puesto: 'Limpiador de Moldes (DD)' },
    { turno: 'A002', area: 'Moldeo', puesto: 'Asist de Sup de Ensamble (DD)' },
    { turno: 'LS01', area: 'Celdas', puesto: 'Asist de Sup de Ensamble (DD)' },
    { turno: 'LS01', area: 'Modulos', puesto: 'Asist de Sup de Ensamble (DD)' },
    { turno: 'LS01', area: 'Modulos', puesto: 'Asistente Control Produccion' },
    { turno: 'LS01', area: 'Moldeo', puesto: 'Asistente Control Produccion' },
    { turno: 'LS01', area: 'Moldeo', puesto: 'Coord Tecnico de Moldeo (DD)' },
    { turno: 'LS01', area: 'Celdas', puesto: 'Ensamblador' },
    { turno: 'LS01', area: 'Modulos', puesto: 'Ensamblador' },
    { turno: 'LS01', area: 'Moldeo', puesto: 'Ensamblador' },
    { turno: 'LS01', area: 'Moldeo', puesto: 'Mezclador de Resinas (DD)' },
    { turno: 'LS01', area: 'Moldeo', puesto: 'Mezclador de Resinas Sr. (DD)' },
    { turno: 'LS01', area: 'Celdas', puesto: 'Operador Universal (DD)' },
    { turno: 'LS01', area: 'Modulos', puesto: 'Operador Universal (DD)' },
    { turno: 'LS01', area: 'Moldeo', puesto: 'Operador Universal (DD)' },
    { turno: 'LS01', area: 'Moldeo - ensamble', puesto: 'Operador Universal (DD)' },
    { turno: 'LS01', area: 'Moldeo', puesto: 'Separador de Partes' },
    { turno: 'LS01', area: 'Moldeo - ensamble', puesto: 'Separador de Partes' },
    { turno: 'LS01', area: 'Celdas', puesto: 'Surtidor de Materiales (DD)' },
    { turno: 'LS01', area: 'Modulos', puesto: 'Surtidor de Materiales (DD)' },
    { turno: 'LS01', area: 'Moldeo', puesto: 'Surtidor de Materiales (DD)' },
    { turno: 'LS01', area: 'DD Molding/Molding', puesto: 'Tecnico de Moldeo I (DD)' },
    { turno: 'LS01', area: 'DD Molding Assembly', puesto: 'Tecnico de Moldeo II (DD)' },
    { turno: 'LS01', area: 'DD Molding/Molding', puesto: 'Tecnico de Moldeo III (DD)' },
    { turno: 'LS01', area: 'DD Molding/Molding', puesto: 'Tecnico de Set Up "I" (DD)' },
    { turno: 'LS01', area: 'DD Molding/Molding', puesto: 'Tecnico de Set Up "III" (DD)' },
    { turno: 'LS02', area: 'Celdas', puesto: 'Asist de Sup de Ensamble (DD)' },
    { turno: 'LS02', area: 'Modulos', puesto: 'Asist de Sup de Ensamble (DD)' },
    { turno: 'LS02', area: 'Moldeo', puesto: 'Asistente Control Produccion' },
    { turno: 'LS02', area: 'Celdas', puesto: 'Auxiliar Control de Produccion' },
    { turno: 'LS02', area: 'Moldeo', puesto: 'Coord Tecnico de Moldeo (DD)' },
    { turno: 'LS02', area: 'Celdas', puesto: 'Ensamblador' },
    { turno: 'LS02', area: 'Modulos', puesto: 'Ensamblador' },
    { turno: 'LS02', area: 'Moldeo', puesto: 'Mezclador de Resinas (DD)' },
    { turno: 'LS02', area: 'Moldeo', puesto: 'Mezclador de Resinas Sr. (DD)' },
    { turno: 'LS02', area: 'Celdas', puesto: 'Operador Universal (DD)' },
    { turno: 'LS02', area: 'Modulos', puesto: 'Operador Universal (DD)' },
    { turno: 'LS02', area: 'Moldeo', puesto: 'Operador Universal (DD)' },
    { turno: 'LS02', area: 'Celdas', puesto: 'Separador de Partes' },
    { turno: 'LS02', area: 'Moldeo', puesto: 'Separador de Partes' },
    { turno: 'LS02', area: 'Moldeo - ensamble', puesto: 'Separador de Partes' },
    { turno: 'LS02', area: 'Celdas', puesto: 'Surtidor de Materiales (DD)' },
    { turno: 'LS02', area: 'Modulos', puesto: 'Surtidor de Materiales (DD)' },
    { turno: 'LS02', area: 'DD Molding/Molding', puesto: 'Tecnico de Moldeo I (DD)' },
    { turno: 'LS02', area: 'DD Molding/Molding', puesto: 'Tecnico de Moldeo II (DD)' },
    { turno: 'LS02', area: 'Moldeo', puesto: 'Tecnico de Moldeo III (DD)' },
    { turno: 'LS02', area: 'DD Molding/Molding', puesto: 'Tecnico de Set Up "I" (DD)' },
    { turno: 'LS02', area: 'DD Molding/Molding', puesto: 'Tecnico de Set Up "III" (DD)' },
    { turno: 'LS03', area: 'Celdas', puesto: 'Asist de Sup de Ensamble (DD)' },
    { turno: 'LS03', area: 'Celdas', puesto: 'Asistente Control Produccion' },
    { turno: 'LS03', area: 'Moldeo', puesto: 'Coord Tecnico de Moldeo (DD)' },
    { turno: 'LS03', area: 'Celdas', puesto: 'Ensamblador' },
    { turno: 'LS03', area: 'Moldeo - ensamble', puesto: 'Ensamblador' },
    { turno: 'LS03', area: 'Moldeo', puesto: 'Mezclador de Resinas (DD)' },
    { turno: 'LS03', area: 'Moldeo', puesto: 'Mezclador de Resinas Sr. (DD)' },
    { turno: 'LS03', area: 'Celdas', puesto: 'Operador Universal (DD)' },
    { turno: 'LS03', area: 'Moldeo', puesto: 'Operador Universal (DD)' },
    { turno: 'LS03', area: 'Moldeo', puesto: 'Separador de Partes' },
    { turno: 'LS03', area: 'Moldeo - ensamble', puesto: 'Separador de Partes' },
    { turno: 'LS03', area: 'Celdas', puesto: 'Surtidor de Materiales (DD)' },
    { turno: 'LS03', area: 'Moldeo - ensamble', puesto: 'Surtidor de Materiales (DD)' },
    { turno: 'LS03', area: 'DD Molding/Molding', puesto: 'Tecnico de Moldeo I (DD)' },
    { turno: 'LS03', area: 'DD Molding/Molding', puesto: 'Tecnico de Moldeo II (DD)' },
    { turno: 'LS03', area: 'DD Molding/Molding', puesto: 'Tecnico de Moldeo III (DD)' },
    { turno: 'LS03', area: 'DD Molding/Molding', puesto: 'Tecnico de Set Up "I" (DD)' },
    { turno: 'LS03', area: 'DD Molding/Molding', puesto: 'Tecnico de Set Up "III" (DD)' },
    { turno: 'LS03', area: 'DD Molding/Molding', puesto: 'Tecnico de Set Up "III" (DD)' },
];

// 3. Setup Counters
let counts = {
    'Planta 1': 0,
    'Planta 2': 0,
    'Planta 3': 0,
    'Planta 4': 0,
    'Total': 0
};

// 4. Calculate Soporte
// Data: { unidadNegocio: 'SOPORTE', planta: '1', ... }
soporteData.forEach(item => {
    if (item.planta === '1') counts['Planta 1']++;
    else if (item.planta === '2') counts['Planta 2']++;
    else if (item.planta === '3') counts['Planta 3']++;
    // Planta 4?
    else if (item.planta === '4') counts['Planta 4']++;
});

// 5. Calculate Irrigación (Available in Plant 1 AND Plant 2)
// Since app logic does NOT filter by plant, the entire set is available in both.
const irrCount = irrData.length;
counts['Planta 1'] += irrCount;
counts['Planta 2'] += irrCount;

// 6. Calculate FX and HCM (Available ONLY in Plant 2)
const fxCount = fxData.length;
const hcmCount = hcmData.length;
counts['Planta 2'] += fxCount;
counts['Planta 2'] += hcmCount;

// 7. Calculate DD (Available ONLY in Plant 3)
const ddCount = ddData.length;
counts['Planta 3'] += ddCount;

// 8. Total
counts['Total'] = counts['Planta 1'] + counts['Planta 2'] + counts['Planta 3'] + counts['Planta 4'];

console.log(JSON.stringify(counts, null, 2));
