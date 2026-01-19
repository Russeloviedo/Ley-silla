import React, { useState, useEffect } from 'react';
import {
    View,
    Text,
    StyleSheet,
    ScrollView,
    StatusBar,
    TouchableOpacity,
    Alert,
    TextInput, // Importar TextInput
} from 'react-native';
import { useRouter } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import AnimatedBackground from '@/components/AnimatedBackground';
import AsyncStorage from '@react-native-async-storage/async-storage';
import NavigationButtons from '@/components/NavigationButtons';
import { Picker } from '@react-native-picker/picker';
import { SoporteDataProcessor } from '@/utils/soporteDataProcessor';
import { SelectionDataService } from '@/utils/selectionDataService';
import { AppColors } from '@/constants/Colors';

export default function SeleccionPersonalizada() {
    const router = useRouter();

    // Estados para las selecciones
    const [selectedBU, setSelectedBU] = useState<string>('');
    const [selectedPlanta, setSelectedPlanta] = useState<string>('');
    const [selectedTurno, setSelectedTurno] = useState<string>('');
    const [selectedArea, setSelectedArea] = useState<string>('');
    const [selectedPuesto, setSelectedPuesto] = useState<string>('');
    const [customPuesto, setCustomPuesto] = useState<string>(''); // Nuevo estado para puesto personalizado
    const [isCustomPuesto, setIsCustomPuesto] = useState<boolean>(false); // Bandera para mostrar input

    // Listas de opciones completas
    const [allBUs, setAllBUs] = useState<string[]>([]);
    const [allPlantas, setAllPlantas] = useState<string[]>([]);
    const [allTurnos, setAllTurnos] = useState<string[]>([]);
    const [allAreas, setAllAreas] = useState<string[]>([]);
    const [allPuestos, setAllPuestos] = useState<string[]>([]);

    useEffect(() => {
        cargarDatos();
    }, []);

    const cargarDatos = () => {
        // 1. Business Units (Manual + Soporte)
        const buList = SelectionDataService.getBusinessUnits();
        setAllBUs(buList);

        // 2. Plantas (Limpiamos "Planta " para dejar solo números)
        const plantasSoporte = SoporteDataProcessor.getPlantas();
        const plantasLimpias = plantasSoporte.map(p => p.replace(/Planta\s+/i, '').trim());

        // Plantas genéricas (solo números)
        const plantasExtras = ['1', '2', '3', '4'];

        // Unir, únicos y ordenar numéricamente
        const setPlantas = new Set([...plantasLimpias, ...plantasExtras]);
        const plantasFinal = Array.from(setPlantas).sort((a, b) => {
            // Intento de orden numérico
            const numA = parseInt(a);
            const numB = parseInt(b);
            return !isNaN(numA) && !isNaN(numB) ? numA - numB : a.localeCompare(b);
        });

        setAllPlantas(plantasFinal);

        // 3. Turnos (De Soporte + Genéricos)
        const turnosSoporte = SoporteDataProcessor.getTurnos();
        const turnosExtras = ['Turno 1', 'Turno 2', 'Turno 3', 'Turno 4', 'Turno 5', 'Mixto'];
        const turnosFinal = Array.from(new Set([...turnosSoporte, ...turnosExtras])).sort();
        setAllTurnos(turnosFinal);

        // 4. Áreas (De Soporte)
        const areasSoporte = SoporteDataProcessor.getAreas();
        setAllAreas(areasSoporte);

        // 5. Puestos (Soporte + SelectionDataService)
        const puestosSoporte = SoporteDataProcessor.getPuestos();
        const puestosGenericos = SelectionDataService.getAllPositions();
        const puestosSet = new Set([...puestosSoporte, ...puestosGenericos]);
        // Ordenar alfabéticamente
        const puestosOrdenados = Array.from(puestosSet).sort();

        // Agregar opción de personalizar al principio
        const puestosFinal = ['Personalizar Puesto', ...puestosOrdenados];
        setAllPuestos(puestosFinal);
    };

    const handleGuardarContinuar = async () => {
        // Validar campos básicos
        if (!selectedBU || !selectedPlanta || !selectedTurno || !selectedArea || !selectedPuesto) {
            Alert.alert('Campos incompletos', 'Por favor selecciona todas las opciones para continuar.');
            return;
        }

        // Validar puesto personalizado si aplica
        let puestoFinal = selectedPuesto;
        if (selectedPuesto === 'Personalizar Puesto') {
            if (!customPuesto.trim()) {
                Alert.alert('Puesto personalizado vacío', 'Por favor escribe el nombre del puesto.');
                return;
            }
            puestoFinal = customPuesto.trim();
        }

        try {
            console.log('💾 Guardando selección personalizada:', { puestoFinal });

            // Guardar todo en AsyncStorage con las claves ESTÁNDAR que espera resultados-finales.tsx
            await AsyncStorage.multiSet([
                ['nav:selectedBusinessUnit', selectedBU],
                ['nav:selectedPlant', selectedPlanta],     // CORREGIDO: Plant (no Planta)
                ['nav:selectedShift', selectedTurno],     // CORREGIDO: Shift (no Turno)
                ['nav:selectedArea', selectedArea],
                ['nav:selectedPosition', puestoFinal],    // Usar el puesto final resuelto

                // También guardar en temporales por seguridad si el flujo de análisis lo requiere
                ['temp_business_unit', selectedBU],
                ['temp_planta', selectedPlanta],
                ['temp_turno', selectedTurno],
                ['temp_area', selectedArea],
                ['temp_puesto', puestoFinal]
            ]);

            console.log('✅ Datos guardados. Navegando al diagrama...');
            // Ir directo al flujo o confirmación. Normalmente iría a diagrama de flujo
            router.push('/diagrama-flujo');

        } catch (error) {
            console.error('❌ Error al guardar:', error);
            Alert.alert('Error', 'No se pudieron guardar los datos.');
        }
    };

    const handlePuestoChange = (val: string) => {
        setSelectedPuesto(val);
        setIsCustomPuesto(val === 'Personalizar Puesto');
    };

    const renderPicker = (
        label: string,
        selectedValue: string,
        onValueChange: (val: string) => void,
        items: string[],
        placeholder: string,
        isPuesto: boolean = false
    ) => (
        <View style={styles.pickerContainer}>
            <Text style={styles.label}>{label}</Text>
            <View style={styles.pickerWrapper}>
                <Picker
                    selectedValue={selectedValue}
                    onValueChange={onValueChange}
                    style={styles.picker}
                >
                    <Picker.Item label={placeholder} value="" color="#999" />
                    {items.map((item, index) => (
                        <Picker.Item key={index} label={item} value={item} color="#000" />
                    ))}
                </Picker>
            </View>

            {/* Input para puesto personalizado */}
            {isPuesto && isCustomPuesto && (
                <View style={styles.customInputContainer}>
                    <Text style={styles.label}>Escribe el nombre del puesto:</Text>
                    <View style={styles.inputWrapper}>
                        <TextInput
                            style={styles.input}
                            value={customPuesto}
                            onChangeText={setCustomPuesto}
                            placeholder="Ej: Nuevo Puesto Operativo"
                            placeholderTextColor="#999"
                        />
                    </View>
                </View>
            )}
        </View>
    );

    return (
        <>
            <StatusBar hidden={true} backgroundColor="#2c3e50" barStyle="light-content" />
            <AnimatedBackground>
                {/* Barra superior */}
                <LinearGradient
                    colors={['#2c3e50', '#bdc3c7']}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 1 }}
                    style={styles.topBar}
                >
                    <View style={styles.topBarContent}>
                        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
                            <Text style={styles.backButtonText}>←</Text>
                        </TouchableOpacity>
                        <Text style={styles.topBarTitle}>Configuración Personalizada</Text>
                    </View>
                </LinearGradient>

                <ScrollView contentContainerStyle={styles.container}>
                    <Text style={styles.title}>Define tu Análisis Manualmente</Text>
                    <Text style={styles.subtitle}>
                        Selecciona cualquier combinación disponible en el sistema.
                    </Text>

                    {renderPicker("Unidad de Negocio:", selectedBU, setSelectedBU, allBUs, "Selecciona unidad...")}
                    {renderPicker("Planta:", selectedPlanta, setSelectedPlanta, allPlantas, "Selecciona planta...")}
                    {renderPicker("Turno:", selectedTurno, setSelectedTurno, allTurnos, "Selecciona turno...")}
                    {renderPicker("Área:", selectedArea, setSelectedArea, allAreas, "Selecciona área...")}
                    {renderPicker("Puesto:", selectedPuesto, handlePuestoChange, allPuestos, "Selecciona puesto...", true)}

                    <TouchableOpacity
                        style={styles.confirmButton}
                        onPress={handleGuardarContinuar}
                        activeOpacity={0.8}
                    >
                        <LinearGradient
                            colors={['#27ae60', '#2ecc71']}
                            style={styles.gradientButton}
                            start={{ x: 0, y: 0 }}
                            end={{ x: 1, y: 0 }}
                        >
                            <Text style={styles.buttonText}>Confirmar y Continuar ➡️</Text>
                        </LinearGradient>
                    </TouchableOpacity>

                </ScrollView>

                <NavigationButtons hideAll={true} />
            </AnimatedBackground>
        </>
    );
}

const styles = StyleSheet.create({
    container: {
        padding: 20,
        paddingBottom: 50,
    },
    topBar: {
        height: 100,
        justifyContent: 'flex-end',
        paddingBottom: 15,
    },
    topBarContent: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 20,
    },
    backButton: {
        marginRight: 15,
    },
    backButtonText: {
        color: '#FFF',
        fontSize: 24,
        fontWeight: 'bold',
    },
    topBarTitle: {
        color: '#FFF',
        fontSize: 18,
        fontWeight: 'bold',
        flex: 1,
    },
    title: {
        fontSize: 24,
        fontWeight: 'bold',
        color: '#2c3e50',
        textAlign: 'center',
        marginBottom: 5,
    },
    subtitle: {
        fontSize: 14,
        color: '#7f8c8d',
        textAlign: 'center',
        marginBottom: 25,
    },
    pickerContainer: {
        marginBottom: 20,
    },
    label: {
        fontSize: 16,
        fontWeight: '600',
        color: '#34495e',
        marginBottom: 8,
        paddingLeft: 5,
    },
    pickerWrapper: {
        backgroundColor: '#fff',
        borderRadius: 12,
        borderWidth: 1,
        borderColor: '#bdc3c7',
        overflow: 'hidden',
        elevation: 2,
    },
    picker: {
        height: 55,
        width: '100%',
    },
    confirmButton: {
        marginTop: 30,
        borderRadius: 25,
        overflow: 'hidden',
        elevation: 5,
    },
    gradientButton: {
        paddingVertical: 18,
        alignItems: 'center',
        justifyContent: 'center',
    },
    buttonText: {
        color: '#fff',
        fontSize: 18,
        fontWeight: 'bold',
    },
    customInputContainer: {
        marginTop: 15,
        backgroundColor: '#f8f9fa',
        padding: 10,
        borderRadius: 10,
        borderWidth: 1,
        borderColor: '#e0e0e0',
    },
    inputWrapper: {
        backgroundColor: '#fff',
        borderRadius: 8,
        borderWidth: 1,
        borderColor: '#bdc3c7',
        marginTop: 5,
    },
    input: {
        paddingHorizontal: 15,
        paddingVertical: 12,
        fontSize: 16,
        color: '#2c3e50',
    },
});
