import React from 'react';
import FontAwesome from '@expo/vector-icons/FontAwesome';
import { Tabs } from 'expo-router';
import { Pressable } from 'react-native';

import Colors from '@/constants/Colors';
import { useColorScheme } from '@/components/useColorScheme';
import AuthGuard from '@/components/AuthGuard';

// You can explore the built-in icon families and icons on the web at https://icons.expo.fyi/
function TabBarIcon(props: {
  name: React.ComponentProps<typeof FontAwesome>['name'];
  color: string;
}) {
  return <FontAwesome size={28} style={{ marginBottom: -3 }} {...props} />;
}

export default function TabLayout() {
  const colorScheme = useColorScheme();

  return (
    <AuthGuard>
      <Tabs
      screenOptions={{
        tabBarActiveTintColor: Colors[colorScheme ?? 'light'].tint,
        // Ocultar completamente el header en todas las plataformas
        headerShown: false,
        // Ocultar la barra de navegación de tabs
        tabBarStyle: { display: 'none' },
        // Asegurar que no haya espacio para el header
        headerStyle: { height: 0 },
        headerHeight: 0,
        // Eliminar cualquier padding o margin superior
        headerTitleStyle: { display: 'none' },
        // Asegurar que el contenido comience desde el borde superior
        contentStyle: { 
          marginTop: 0, 
          paddingTop: 0,
          backgroundColor: 'transparent'
        },
        // Estilos adicionales para eliminar espacios
        headerLeft: null,
        headerRight: null,
        headerTitle: '',
        headerBackTitle: '',
        headerBackVisible: false,
      }}>
      <Tabs.Screen
        name="index"
        options={{
          title: 'Inicio',
          tabBarIcon: ({ color }) => <TabBarIcon name="home" color={color} />,
        }}
      />
      <Tabs.Screen
        name="resultados-finales"
        options={{
          title: 'Resultados',
          tabBarIcon: ({ color }) => <TabBarIcon name="list" color={color} />,
        }}
      />
      <Tabs.Screen
        name="nueva-base-datos"
        options={{
          title: 'Base de Datos',
          tabBarIcon: ({ color }) => <TabBarIcon name="database" color={color} />,
        }}
      />

    </Tabs>
    </AuthGuard>
  );
}
