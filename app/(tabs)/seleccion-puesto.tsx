import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  StatusBar,
} from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import AnimatedBackground from '@/components/AnimatedBackground';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { SelectionDataService } from '@/utils/selectionDataService';

export default function SeleccionPuesto() {
  const router = useRouter();
  const { businessUnit, planta, turno, area } = useLocalSearchParams<{ businessUnit: string; planta: string; turno: string; area: string }>();

  // Función para obtener puestos de IRR basados en área y turno
  const getIRRPuestos = (area: string, turno: string) => {
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

    const puestosFiltrados = irrData
      .filter(item => item.area === area && item.turno === turno)
      .map(item => item.puesto);

    // Eliminar duplicados
    const puestosUnicos = [...new Set(puestosFiltrados)];

    const colorPairs = [
      ['#FF6B6B', '#FF8E8E'], ['#4ECDC4', '#45B7D1'], ['#45B7D1', '#96CEB4'],
      ['#96CEB4', '#FFEAA7'], ['#FFEAA7', '#DDA0DD'], ['#DDA0DD', '#FFB6C1'],
      ['#FFB6C1', '#98FB98'], ['#98FB98', '#F0E68C'], ['#F0E68C', '#E6E6FA'],
      ['#E6E6FA', '#FFA07A'], ['#FFA07A', '#20B2AA'], ['#20B2AA', '#9370DB'],
      ['#9370DB', '#32CD32'], ['#32CD32', '#FF6347'], ['#FF6347', '#40E0D0'],
      ['#40E0D0', '#FFD700'], ['#FFD700', '#FF69B4'], ['#FF69B4', '#8A2BE2'],
      ['#8A2BE2', '#DC143C']
    ];

    return puestosUnicos.map((puesto, index) => ({
      id: puesto,
      name: puesto,
      emoji: puesto.includes('Moldeo') ? '🏗️' : 
            puesto.includes('Resinas') ? '🧪' : 
            puesto.includes('Operador') ? '🎮' : 
            puesto.includes('Ensamblador') ? '🔧' : 
            puesto.includes('Coord') ? '👔' : 
            puesto.includes('Separador') ? '📋' : 
            puesto.includes('Tecnico') ? '⚙️' : 
            puesto.includes('Asist') ? '👷' : 
            puesto.includes('Control') ? '📊' : '🔧',
      colors: colorPairs[index % colorPairs.length] as [string, string]
    }));
  };

  // Función para obtener puestos de HCM basados en área y turno
  const getHCMPuestos = (area: string, turno: string) => {
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

    const puestosFiltrados = hcmData
      .filter(item => item.area === area && item.turno === turno)
      .map(item => item.puesto);

    // Eliminar duplicados
    const puestosUnicos = [...new Set(puestosFiltrados)];

    const colorPairs = [
      ['#FF6B6B', '#FF8E8E'], ['#4ECDC4', '#45B7D1'], ['#45B7D1', '#96CEB4'],
      ['#96CEB4', '#FFEAA7'], ['#FFEAA7', '#DDA0DD'], ['#DDA0DD', '#FFB6C1'],
      ['#FFB6C1', '#98FB98'], ['#98FB98', '#F0E68C'], ['#F0E68C', '#E6E6FA'],
      ['#E6E6FA', '#FFA07A'], ['#FFA07A', '#20B2AA'], ['#20B2AA', '#9370DB'],
      ['#9370DB', '#32CD32'], ['#32CD32', '#FF6347'], ['#FF6347', '#40E0D0'],
      ['#40E0D0', '#FFD700'], ['#FFD700', '#FF69B4'], ['#FF69B4', '#8A2BE2'],
      ['#8A2BE2', '#DC143C']
    ];

    return puestosUnicos.map((puesto, index) => ({
      id: puesto,
      name: puesto,
      emoji: puesto.includes('Moldeo') ? '🏗️' : 
            puesto.includes('Resinas') ? '🧪' : 
            puesto.includes('Operador') ? '🎮' : 
            puesto.includes('Ensamblador') ? '🔧' : 
            puesto.includes('Coord') ? '👔' : 
            puesto.includes('Separador') ? '📋' : 
            puesto.includes('Surtidor') ? '📦' : 
            puesto.includes('Set Up') ? '⚙️' : '🔧',
      colors: colorPairs[index % colorPairs.length] as [string, string]
    }));
  };

  // Función para obtener puestos de FX basados en área y turno
  const getFXPuestos = (area: string, turno: string) => {
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

    const puestosFiltrados = fxData
      .filter(item => item.area === area && item.turno === turno)
      .map(item => item.puesto);

    // Eliminar duplicados
    const puestosUnicos = [...new Set(puestosFiltrados)];

    const colorPairs = [
      ['#FF6B6B', '#FF8E8E'], ['#4ECDC4', '#45B7D1'], ['#45B7D1', '#96CEB4'],
      ['#96CEB4', '#FFEAA7'], ['#FFEAA7', '#DDA0DD'], ['#DDA0DD', '#FFB6C1'],
      ['#FFB6C1', '#98FB98'], ['#98FB98', '#F0E68C'], ['#F0E68C', '#E6E6FA'],
      ['#E6E6FA', '#FFA07A'], ['#FFA07A', '#20B2AA'], ['#20B2AA', '#9370DB'],
      ['#9370DB', '#32CD32'], ['#32CD32', '#FF6347'], ['#FF6347', '#40E0D0'],
      ['#40E0D0', '#FFD700'], ['#FFD700', '#FF69B4'], ['#FF69B4', '#8A2BE2'],
      ['#8A2BE2', '#DC143C']
    ];

    return puestosUnicos.map((puesto, index) => ({
      id: puesto,
      name: puesto,
      emoji: puesto.includes('Pintor') ? '🎨' : 
            puesto.includes('CNC') ? '⚙️' : 
            puesto.includes('Operador') ? '🎮' : 
            puesto.includes('Ensamblador') ? '🔧' : 
            puesto.includes('Coordinador') ? '👔' : 
            puesto.includes('Aprendiz') ? '🎓' : 
            puesto.includes('Pulidor') ? '✨' : 
            puesto.includes('Sup') ? '👨‍💼' : 
            puesto.includes('Asist') ? '👷' : '⚙️',
      colors: colorPairs[index % colorPairs.length] as [string, string]
    }));
  };

  // Función para obtener puestos de DD basados en área y turno
  const getDDPuestos = (area: string, turno: string) => {
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
      { turno: 'LS03', area: 'DD Molding/Molding', puesto: 'Tecnico de Set Up "III" (DD)' }
    ];

    const puestosFiltrados = ddData
      .filter(item => item.area === area && item.turno === turno)
      .map(item => item.puesto);

    // Eliminar duplicados
    const puestosUnicos = [...new Set(puestosFiltrados)];

    const colorPairs = [
      ['#FF6B6B', '#FF8E8E'], ['#4ECDC4', '#45B7D1'], ['#45B7D1', '#96CEB4'],
      ['#96CEB4', '#FFEAA7'], ['#FFEAA7', '#DDA0DD'], ['#DDA0DD', '#FFB6C1'],
      ['#FFB6C1', '#98FB98'], ['#98FB98', '#F0E68C'], ['#F0E68C', '#E6E6FA'],
      ['#E6E6FA', '#FFA07A'], ['#FFA07A', '#20B2AA'], ['#20B2AA', '#9370DB'],
      ['#9370DB', '#32CD32'], ['#32CD32', '#FF6347'], ['#FF6347', '#40E0D0'],
      ['#40E0D0', '#FFD700'], ['#FFD700', '#FF69B4'], ['#FF69B4', '#8A2BE2'],
      ['#8A2BE2', '#DC143C']
    ];

    return puestosUnicos.map((puesto, index) => ({
      id: puesto,
      name: puesto,
      emoji: puesto.includes('Mecánico') ? '🔧' : 
            puesto.includes('Coord') ? '👔' : 
            puesto.includes('Asist') ? '👷' : 
            puesto.includes('Tecnico') ? '⚙️' : 
            puesto.includes('Operador') ? '🎮' : 
            puesto.includes('Ensamblador') ? '🔧' : 
            puesto.includes('Mezclador') ? '🧪' : 
            puesto.includes('Surtidor') ? '📦' : 
            puesto.includes('Separador') ? '📋' : 
            puesto.includes('Auxiliar') ? '👷' : 
            puesto.includes('Limpiador') ? '🧹' : '⚙️',
      colors: colorPairs[index % colorPairs.length] as [string, string]
    }));
  };

  // Determinar qué puestos mostrar según la unidad de negocio
  const getPuestos = () => {
    if (businessUnit === 'DD') {
      return getDDPuestos(area || '', turno || '');
    } else if (businessUnit === 'FX') {
      return getFXPuestos(area || '', turno || '');
    } else if (businessUnit === 'HCM') {
      return getHCMPuestos(area || '', turno || '');
    } else if (businessUnit === 'Irrigación') {
      return getIRRPuestos(area || '', turno || '');
    } else if (businessUnit === 'SOPORTE') {
      // Usar datos dinámicos de SOPORTE filtrados por planta, turno y área
      const puestosSoporte = SelectionDataService.getSoportePuestos(planta, turno, area);
      const colorPairs = [
        ['#FFEAA7', '#FFD700'], ['#FFA500', '#FF8C00'], ['#FF6347', '#FF4500'],
        ['#FF1493', '#DC143C'], ['#8A2BE2', '#4B0082'], ['#20B2AA', '#008B8B'],
        ['#32CD32', '#228B22'], ['#FFD700', '#FFA500'], ['#FF69B4', '#FF1493'],
        ['#9370DB', '#8A2BE2'], ['#40E0D0', '#00CED1'], ['#FF6347', '#DC143C']
      ];
      return puestosSoporte.map((puesto, index) => ({
        id: puesto,
        name: puesto,
        emoji: puesto.includes('Mecánico') ? '🔧' : 
              puesto.includes('Coordinador') ? '👔' : 
              puesto.includes('Guardia') ? '🛡️' : 
              puesto.includes('Auxiliar') ? '👷' : '⚙️',
        colors: colorPairs[index % colorPairs.length] as [string, string]
      }));
    } else {
      // Puestos por defecto para otras unidades
      return [
        { id: 'Supervisor de producción Sr.', name: 'Supervisor de producción Sr.', emoji: '👨‍💼', colors: ['#FF6B6B', '#FF8E8E'] },
        { id: 'Supervisor de producción ll', name: 'Supervisor de producción ll', emoji: '👨‍💼', colors: ['#FF8E8E', '#FFB3B3'] },
        { id: 'Asistente de supervisor de ensamble DD', name: 'Asistente de supervisor de ensamble DD', emoji: '👔', colors: ['#FFB3B3', '#FFD6D6'] },
        { id: 'Asistente de control de producción', name: 'Asistente de control de producción', emoji: '👔', colors: ['#FFD6D6', '#FFE6E6'] },
        { id: 'Practicante', name: 'Practicante', emoji: '🎓', colors: ['#FFE6E6', '#4ECDC4'] },
        { id: 'Operador universal', name: 'Operador universal', emoji: '🎮', colors: ['#4ECDC4', '#45B7D1'] },
        { id: 'Ensamblador', name: 'Ensamblador', emoji: '🔧', colors: ['#45B7D1', '#96CEB4'] },
        { id: 'Surtidor de materiales', name: 'Surtidor de materiales', emoji: '📦', colors: ['#96CEB4', '#FFEAA7'] },
        { id: 'Supervisor de producción lll', name: 'Supervisor de producción lll', emoji: '👨‍💼', colors: ['#FFEAA7', '#DDA0DD'] },
        { id: 'Principal supervisor de Moldeo', name: 'Principal supervisor de Moldeo', emoji: '👨‍💼', colors: ['#DDA0DD', '#FFB6C1'] },
        { id: 'Supervisor de Moldeo lll', name: 'Supervisor de Moldeo lll', emoji: '👨‍💼', colors: ['#FFB6C1', '#98FB98'] },
        { id: 'Supervisor de Moldeo Jr.', name: 'Supervisor de Moldeo Jr.', emoji: '👨‍💼', colors: ['#98FB98', '#F0E68C'] },
        { id: 'Separador de partes', name: 'Separador de partes', emoji: '📋', colors: ['#F0E68C', '#E6E6FA'] },
        { id: 'Coordinador gestion herramientas mfg', name: 'Coordinador gestión herramientas mfg', emoji: '🔧', colors: ['#E6E6FA', '#FFA07A'] },
        { id: 'Coordinador tecnicos de moldeo', name: 'Coordinador técnicos de moldeo', emoji: '🔧', colors: ['#FFA07A', '#20B2AA'] },
        { id: 'Limpiador de moldes', name: 'Limpiador de moldes', emoji: '🧹', colors: ['#20B2AA', '#9370DB'] },
        { id: 'Mezclador de resinas', name: 'Mezclador de resinas', emoji: '🧪', colors: ['#9370DB', '#32CD32'] },
        { id: 'Mezclador de resinas sr.', name: 'Mezclador de resinas sr.', emoji: '🧪', colors: ['#32CD32', '#FF6347'] },
        { id: 'Tecnico de moldeo l', name: 'Técnico de moldeo l', emoji: '🔧', colors: ['#FF6347', '#40E0D0'] },
        { id: 'Tecnico de moldeo ll', name: 'Técnico de moldeo ll', emoji: '🔧', colors: ['#40E0D0', '#FFD700'] },
        { id: 'Tecnico de moldeo lll', name: 'Técnico de moldeo lll', emoji: '🔧', colors: ['#FFD700', '#FF69B4'] },
        { id: 'Tecnico de set up l', name: 'Técnico de set up l', emoji: '🔧', colors: ['#FF69B4', '#8A2BE2'] },
        { id: 'Tecnico de set up lll', name: 'Técnico de set up lll', emoji: '🔧', colors: ['#8A2BE2', '#DC143C'] },
        { id: 'Auxiliar de mantenimiento', name: 'Auxiliar de mantenimiento', emoji: '🔧', colors: ['#DC143C', '#FF6B6B'] },
      ];
    }
  };

  const puestos = getPuestos();

  const handlePuestoSelection = async (puesto: string) => {
    try {
      // Guardar el puesto seleccionado
      await AsyncStorage.setItem('nav:selectedPosition', puesto);
      
      // Navegar al cuestionario de evaluación inicial con todos los parámetros
      router.push({ 
        pathname: '/preguntas-iniciales',
        params: {
          unidad: businessUnit,
          planta: planta,
          turno: turno,
          area: area,
          puesto: puesto
        }
      });
    } catch (error) {
      console.error('Error al guardar el puesto seleccionado:', error);
    }
  };

  const handleBack = () => {
    // Navegar de vuelta a la selección de área
    router.push({
      pathname: '/seleccion-area',
      params: { businessUnit: businessUnit, planta: planta, turno: turno }
    });
  };

  const getBusinessUnitName = (id: string) => {
    const businessUnits: { [key: string]: string } = {
      'FX': 'FX',
      'Irrigación': 'Irrigación',
      'HCM': 'HCM',
      'DD': 'DD',
      'SOPORTE': 'Soporte'
    };
    return businessUnits[id] || id;
  };

  return (
    <>
      <StatusBar hidden={true} backgroundColor="#00BCD4" barStyle="light-content" />
      <AnimatedBackground>
        {/* Barra superior */}
        <LinearGradient
        colors={['#00BCD4', '#00796B']}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.topBar}
      >
        <View style={styles.topBarContent}>
            <TouchableOpacity onPress={handleBack} style={styles.backButton}>
              <Text style={styles.backButtonText}>←</Text>
        </TouchableOpacity>
            <Text style={styles.topBarTitle}>
              Selección de Puesto - {getBusinessUnitName(businessUnit || '')} - Planta {planta} - Turno {turno} - Área {area}
            </Text>
          </View>
        </LinearGradient>

        <ScrollView contentContainerStyle={styles.container}>
          <Text style={styles.title}>Selecciona el Puesto</Text>
          <Text style={styles.subtitle}>
            Elige el puesto en el Área {area} del Turno {turno} de la Planta {planta} de {getBusinessUnitName(businessUnit || '')}
          </Text>

          <View style={styles.buttonGrid}>
            {puestos.map((puesto) => (
              <TouchableOpacity 
                key={puesto.id}
                style={styles.puestoButton}
                onPress={() => handlePuestoSelection(puesto.id)}
                activeOpacity={0.8}
              >
                <LinearGradient
                  colors={puesto.colors as [string, string]}
                  style={styles.gradientButton}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 1 }}
                >
                  <Text style={styles.puestoEmoji}>{puesto.emoji}</Text>
                  <Text style={styles.puestoName}>{puesto.name}</Text>
                </LinearGradient>
              </TouchableOpacity>
            ))}
          </View>
        </ScrollView>
    </AnimatedBackground>
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
    backgroundColor: 'transparent',
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#2C3E50',
    textAlign: 'center',
    marginBottom: 10,
    textShadowColor: 'rgba(0, 0, 0, 0.1)',
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 3,
  },
  subtitle: {
    fontSize: 16,
    color: '#7F8C8D',
    textAlign: 'center',
    marginBottom: 40,
    paddingHorizontal: 20,
  },
  buttonGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 15,
    paddingHorizontal: 10,
  },
  puestoButton: {
    width: 130,
    height: 130,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    marginBottom: 15,
  },
  gradientButton: {
    width: '100%',
    height: '100%',
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  puestoEmoji: {
    fontSize: 36,
    marginBottom: 8,
  },
  puestoName: {
    fontSize: 13,
    fontWeight: 'bold',
    color: '#FFFFFF',
    textAlign: 'center',
    textShadowColor: 'rgba(0, 0, 0, 0.3)',
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 2,
    paddingHorizontal: 6,
  },
  topBar: {
    height: 120,
    justifyContent: 'flex-end',
    paddingBottom: 20,
  },
  topBarContent: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  backButton: {
    marginRight: 15,
    padding: 8,
  },
  backButtonText: {
    color: '#FFFFFF',
    fontSize: 24,
    fontWeight: 'bold',
  },
  topBarTitle: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: 'bold',
    flex: 1,
  },
});
