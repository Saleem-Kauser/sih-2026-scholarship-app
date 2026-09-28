import { Text, TextInput, View, type TextInputProps } from 'react-native';

import { BorderRadius, SpacingTokens as Spacing, Typography } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';

export interface InputProps extends TextInputProps {
  label?: string;
  placeholder?: string;
  error?: string;
  hint?: string;
  required?: boolean;
  size?: 'sm' | 'md' | 'lg';
}

export function Input({
  label,
  placeholder,
  error,
  hint,
  required = false,
  size = 'md',
  style,
  editable = true,
  ...props
}: InputProps) {
  const theme = useTheme();
  const hasError = !!error;

  const getSizeStyles = () => {
    switch (size) {
      case 'sm':
        return {
          paddingVertical: Spacing.xs,
          paddingHorizontal: Spacing.sm,
          ...Typography.small,
        };
      case 'lg':
        return {
          paddingVertical: Spacing.md,
          paddingHorizontal: Spacing.base,
          ...Typography.body,
        };
      case 'md':
      default:
        return {
          paddingVertical: Spacing.sm,
          paddingHorizontal: Spacing.base,
          ...Typography.body,
        };
    }
  };

  const sizeStyles = getSizeStyles();
  const borderColor = hasError ? theme.error : editable ? theme.borderStrong : theme.border;

  const inputStyle: any = {
    color: editable ? theme.text : theme.textSecondary,
    backgroundColor: editable ? (theme.backgroundElement || '#FFFFFF') : theme.backgroundSecondary,
    borderColor,
    borderWidth: 1,
    borderRadius: BorderRadius.md,
    paddingVertical: sizeStyles.paddingVertical,
    paddingHorizontal: sizeStyles.paddingHorizontal,
    fontSize: sizeStyles.fontSize,
    lineHeight: sizeStyles.lineHeight,
  };

  return (
    <View>
      {label && (
        <Text
          style={[
            Typography.smallBold,
            {
              color: theme.text,
              marginBottom: Spacing.xs,
            },
          ]}
        >
          {label}
          {required && <Text style={{ color: theme.error }}> *</Text>}
        </Text>
      )}

      <TextInput
        style={[inputStyle, style]}
        placeholder={placeholder}
        placeholderTextColor={theme.textTertiary}
        editable={editable}
        {...props}
      />

      {(error || hint) && (
        <Text
          style={[
            Typography.xs,
            {
              color: error ? theme.error : theme.textSecondary,
              marginTop: Spacing.xs,
            },
          ]}
        >
          {error || hint}
        </Text>
      )}
    </View>
  );
}