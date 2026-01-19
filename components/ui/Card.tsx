import React from 'react';
import { View, Text, StyleSheet, ViewStyle, TextStyle, TouchableOpacity } from 'react-native';
import { AppColors } from '@/constants/Colors';
import { Typography } from '@/constants/Typography';
import { Spacing, BorderRadius, Shadows } from '@/constants/Spacing';

interface CardProps {
  title?: string;
  subtitle?: string;
  children?: React.ReactNode;
  onPress?: () => void;
  variant?: 'default' | 'elevated' | 'outlined' | 'filled';
  padding?: 'small' | 'medium' | 'large';
  style?: ViewStyle;
  titleStyle?: TextStyle;
  subtitleStyle?: TextStyle;
}

export default function Card({
  title,
  subtitle,
  children,
  onPress,
  variant = 'default',
  padding = 'medium',
  style,
  titleStyle,
  subtitleStyle,
}: CardProps) {
  const cardStyle = [
    styles.base,
    styles[variant],
    styles[`padding${padding.charAt(0).toUpperCase() + padding.slice(1)}`],
    onPress && styles.pressable,
    style,
  ];

  const CardComponent = onPress ? TouchableOpacity : View;

  return (
    <CardComponent style={cardStyle} onPress={onPress} activeOpacity={0.8}>
      {(title || subtitle) && (
        <View style={styles.header}>
          {title && (
            <Text style={[styles.title, titleStyle]}>
              {title}
            </Text>
          )}
          {subtitle && (
            <Text style={[styles.subtitle, subtitleStyle]}>
              {subtitle}
            </Text>
          )}
        </View>
      )}
      
      {children && (
        <View style={styles.content}>
          {children}
        </View>
      )}
    </CardComponent>
  );
}

const styles = StyleSheet.create({
  base: {
    borderRadius: BorderRadius.component.card,
    backgroundColor: AppColors.surface,
  },
  
  // Variantes
  default: {
    ...Shadows.sm,
  },
  
  elevated: {
    ...Shadows.lg,
  },
  
  outlined: {
    borderWidth: 1,
    borderColor: AppColors.border,
    ...Shadows.none,
  },
  
  filled: {
    backgroundColor: AppColors.surfaceVariant,
    ...Shadows.none,
  },
  
  // Padding
  paddingSmall: {
    padding: Spacing.card.paddingSmall,
  },
  
  paddingMedium: {
    padding: Spacing.card.padding,
  },
  
  paddingLarge: {
    padding: Spacing.card.paddingLarge,
  },
  
  // Estados
  pressable: {
    // Estilos adicionales para tarjetas presionables
  },
  
  // Header
  header: {
    marginBottom: Spacing.md,
  },
  
  title: {
    ...Typography.h6,
    color: AppColors.textPrimary,
    marginBottom: Spacing.xs,
  },
  
  subtitle: {
    ...Typography.body2,
    color: AppColors.textSecondary,
  },
  
  // Contenido
  content: {
    // Estilos para el contenido de la tarjeta
  },
});







