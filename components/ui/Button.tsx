import React from 'react';
import { TouchableOpacity, Text, StyleSheet, ViewStyle, TextStyle, ActivityIndicator } from 'react-native';
import { AppColors } from '@/constants/Colors';
import { Typography } from '@/constants/Typography';
import { Spacing, BorderRadius, Shadows } from '@/constants/Spacing';

interface ButtonProps {
  title: string;
  onPress: () => void;
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger';
  size?: 'small' | 'medium' | 'large';
  disabled?: boolean;
  loading?: boolean;
  icon?: React.ReactNode;
  fullWidth?: boolean;
  style?: ViewStyle;
  textStyle?: TextStyle;
}

export default function Button({
  title,
  onPress,
  variant = 'primary',
  size = 'medium',
  disabled = false,
  loading = false,
  icon,
  fullWidth = false,
  style,
  textStyle,
}: ButtonProps) {
  const buttonStyle = [
    styles.base,
    styles[variant],
    styles[size],
    fullWidth && styles.fullWidth,
    disabled && styles.disabled,
    style,
  ];

  const textStyleCombined = [
    styles.text,
    styles[`${variant}Text`],
    styles[`${size}Text`],
    disabled && styles.disabledText,
    textStyle,
  ];

  return (
    <TouchableOpacity
      style={buttonStyle}
      onPress={onPress}
      disabled={disabled || loading}
      activeOpacity={0.8}
    >
      {loading ? (
        <ActivityIndicator 
          color={variant === 'primary' ? AppColors.textOnPrimary : AppColors.primary} 
          size="small" 
        />
      ) : (
        <>
          {icon && <>{icon}</>}
          <Text style={textStyleCombined}>{title}</Text>
        </>
      )}
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  base: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: BorderRadius.component.button,
    ...Shadows.sm,
  },
  
  // Variantes
  primary: {
    backgroundColor: AppColors.primary,
  },
  secondary: {
    backgroundColor: AppColors.secondary,
  },
  outline: {
    backgroundColor: 'transparent',
    borderWidth: 1,
    borderColor: AppColors.primary,
  },
  ghost: {
    backgroundColor: 'transparent',
  },
  danger: {
    backgroundColor: AppColors.error,
  },
  
  // Tamaños
  small: {
    paddingHorizontal: Spacing.button.paddingSmall,
    paddingVertical: Spacing.button.paddingSmall,
    minHeight: 32,
  },
  medium: {
    paddingHorizontal: Spacing.button.padding,
    paddingVertical: Spacing.button.padding,
    minHeight: 40,
  },
  large: {
    paddingHorizontal: Spacing.button.paddingLarge,
    paddingVertical: Spacing.button.paddingLarge,
    minHeight: 48,
  },
  
  // Estados
  disabled: {
    backgroundColor: AppColors.textDisabled,
    borderColor: AppColors.textDisabled,
  },
  
  // Layout
  fullWidth: {
    width: '100%',
  },
  
  // Texto
  text: {
    ...Typography.button,
    textAlign: 'center',
  },
  
  // Texto por variante
  primaryText: {
    color: AppColors.textOnPrimary,
  },
  secondaryText: {
    color: AppColors.textOnSecondary,
  },
  outlineText: {
    color: AppColors.primary,
  },
  ghostText: {
    color: AppColors.primary,
  },
  dangerText: {
    color: AppColors.textOnPrimary,
  },
  
  // Texto por tamaño
  smallText: {
    fontSize: 12,
  },
  mediumText: {
    fontSize: 14,
  },
  largeText: {
    fontSize: 16,
  },
  
  // Texto deshabilitado
  disabledText: {
    color: AppColors.textDisabled,
  },
});







