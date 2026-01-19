import React, { useState } from 'react';
import { View, TextInput, Text, StyleSheet, ViewStyle, TextStyle } from 'react-native';
import { AppColors } from '@/constants/Colors';
import { Typography } from '@/constants/Typography';
import { Spacing, BorderRadius, Shadows } from '@/constants/Spacing';

interface InputProps {
  label?: string;
  placeholder?: string;
  value: string;
  onChangeText: (text: string) => void;
  error?: string;
  helperText?: string;
  disabled?: boolean;
  required?: boolean;
  multiline?: boolean;
  numberOfLines?: number;
  keyboardType?: 'default' | 'numeric' | 'email-address' | 'phone-pad';
  secureTextEntry?: boolean;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
  style?: ViewStyle;
  inputStyle?: TextStyle;
}

export default function Input({
  label,
  placeholder,
  value,
  onChangeText,
  error,
  helperText,
  disabled = false,
  required = false,
  multiline = false,
  numberOfLines = 1,
  keyboardType = 'default',
  secureTextEntry = false,
  leftIcon,
  rightIcon,
  style,
  inputStyle,
}: InputProps) {
  const [isFocused, setIsFocused] = useState(false);

  const containerStyle = [
    styles.container,
    style,
  ];

  const inputContainerStyle = [
    styles.inputContainer,
    isFocused && styles.inputContainerFocused,
    error && styles.inputContainerError,
    disabled && styles.inputContainerDisabled,
  ];

  const inputTextStyle = [
    styles.input,
    multiline && styles.inputMultiline,
    disabled && styles.inputDisabled,
    inputStyle,
  ];

  const labelStyle = [
    styles.label,
    error && styles.labelError,
    disabled && styles.labelDisabled,
  ];

  return (
    <View style={containerStyle}>
      {label && (
        <Text style={labelStyle}>
          {label}
          {required && <Text style={styles.required}> *</Text>}
        </Text>
      )}
      
      <View style={inputContainerStyle}>
        {leftIcon && (
          <View style={styles.leftIcon}>
            {leftIcon}
          </View>
        )}
        
        <TextInput
          style={inputTextStyle}
          placeholder={placeholder}
          placeholderTextColor={AppColors.textTertiary}
          value={value}
          onChangeText={onChangeText}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
          editable={!disabled}
          multiline={multiline}
          numberOfLines={numberOfLines}
          keyboardType={keyboardType}
          secureTextEntry={secureTextEntry}
        />
        
        {rightIcon && (
          <View style={styles.rightIcon}>
            {rightIcon}
          </View>
        )}
      </View>
      
      {(error || helperText) && (
        <Text style={[styles.helperText, error && styles.helperTextError]}>
          {error || helperText}
        </Text>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginBottom: Spacing.form.field,
  },
  
  label: {
    ...Typography.label,
    color: AppColors.textPrimary,
    marginBottom: Spacing.sm,
  },
  
  labelError: {
    color: AppColors.error,
  },
  
  labelDisabled: {
    color: AppColors.textDisabled,
  },
  
  required: {
    color: AppColors.error,
  },
  
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: AppColors.surface,
    borderWidth: 1,
    borderColor: AppColors.border,
    borderRadius: BorderRadius.component.input,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    minHeight: 48,
    ...Shadows.sm,
  },
  
  inputContainerFocused: {
    borderColor: AppColors.borderFocus,
    borderWidth: 2,
    ...Shadows.md,
  },
  
  inputContainerError: {
    borderColor: AppColors.error,
    borderWidth: 2,
  },
  
  inputContainerDisabled: {
    backgroundColor: AppColors.surfaceVariant,
    borderColor: AppColors.borderLight,
  },
  
  input: {
    ...Typography.input,
    color: AppColors.textPrimary,
    flex: 1,
    padding: 0,
  },
  
  inputMultiline: {
    textAlignVertical: 'top',
    minHeight: 80,
  },
  
  inputDisabled: {
    color: AppColors.textDisabled,
  },
  
  leftIcon: {
    marginRight: Spacing.sm,
  },
  
  rightIcon: {
    marginLeft: Spacing.sm,
  },
  
  helperText: {
    ...Typography.helper,
    color: AppColors.textSecondary,
    marginTop: Spacing.xs,
  },
  
  helperTextError: {
    color: AppColors.error,
  },
});







