import { Text, TextInput, View, type TextInputProps } from 'react-native';

import { BorderRadius, SpacingTokens as Spacing, Typography } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';

export interface InputProps extends TextInputProps {
  /** Label text displayed above input */
  label?: string;
  /** Placeholder text */
  placeholder?: string;
  /** Error message displayed below input */
  error?: string;
  /** Help text displayed below input (when no error) */
  hint?: string;
  /** Whether field is required */
  required?: boolean;
  /** Input size */
  size?: 'sm' | 'md' | 'lg';
}

/**
 * JAGO Input Component
 * 
 * Text input field with optional label, error states, and help text.
 * Respects theme colors and provides accessible styling.
 */
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

  const borderColor = hasError ? theme.error : editable ? theme.border : theme.borderStrong;

  const inputStyle: any = {
    color: editable ? theme.text : theme.textTertiary,
    backgroundColor: editable ? theme.background : theme.backgroundElement,
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
              color: error ? theme.error : theme.textTertiary,
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
