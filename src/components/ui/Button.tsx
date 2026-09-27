import { Pressable, StyleSheet, Text, View } from 'react-native';

import { BorderRadius, Interaction, SpacingTokens as Spacing, Typography } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';

export type ButtonVariant = 'primary' | 'secondary' | 'tertiary' | 'destructive';
export type ButtonSize = 'sm' | 'md' | 'lg';

export interface ButtonProps {
  /** Button text content */
  label: string;
  /** Variant style: primary (filled), secondary (outlined), tertiary (text), destructive (red) */
  variant?: ButtonVariant;
  /** Button size */
  size?: ButtonSize;
  /** Callback when button is pressed */
  onPress?: () => void;
  /** Whether button is disabled */
  disabled?: boolean;
  /** Whether button is in loading state */
  loading?: boolean;
  /** Full width button */
  fullWidth?: boolean;
  /** Custom text color (overrides variant) */
  textColor?: string;
  /** Additional styles */
  style?: any;
}

/**
 * JAGO Button Component
 * 
 * Reusable button with multiple variants for different use cases.
 * Automatically respects theme colors and provides feedback states.
 */
export function Button({
  label,
  variant = 'primary',
  size = 'md',
  onPress,
  disabled = false,
  loading = false,
  fullWidth = false,
  textColor,
  style,
}: ButtonProps) {
  const theme = useTheme();
  const isDisabled = disabled || loading;

  const getSizeStyles = () => {
    switch (size) {
      case 'sm':
        return {
          paddingVertical: Spacing.sm,
          paddingHorizontal: Spacing.base,
          ...Typography.smallBold,
        };
      case 'lg':
        return {
          paddingVertical: Spacing.md,
          paddingHorizontal: Spacing.lg,
          ...Typography.bodyBold,
        };
      case 'md':
      default:
        return {
          paddingVertical: Spacing.sm,
          paddingHorizontal: Spacing.base,
          ...Typography.bodyBold,
        };
    }
  };

  const getVariantStyles = () => {
    switch (variant) {
      case 'primary':
        return {
          backgroundColor: theme.primary,
          borderColor: theme.primary,
          borderWidth: 0,
          textColor: '#ffffff',
        };
      case 'secondary':
        return {
          backgroundColor: theme.backgroundElement,
          borderColor: theme.border,
          borderWidth: 1,
          textColor: theme.text,
        };
      case 'tertiary':
        return {
          backgroundColor: 'transparent',
          borderColor: 'transparent',
          borderWidth: 0,
          textColor: theme.primary,
        };
      case 'destructive':
        return {
          backgroundColor: theme.error,
          borderColor: theme.error,
          borderWidth: 0,
          textColor: '#ffffff',
        };
      default:
        return {
          backgroundColor: theme.primary,
          borderColor: theme.primary,
          borderWidth: 0,
          textColor: '#ffffff',
        };
    }
  };

  const variantStyles = getVariantStyles();
  const sizeStyles = getSizeStyles();

  const containerStyle: any = {
    backgroundColor: variantStyles.backgroundColor,
    borderColor: variantStyles.borderColor,
    borderWidth: variantStyles.borderWidth,
    borderRadius: BorderRadius.md,
    minHeight: Interaction.minTouchSize,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: sizeStyles.paddingVertical,
    paddingHorizontal: sizeStyles.paddingHorizontal,
    opacity: isDisabled ? Interaction.disabledOpacity : 1,
    width: fullWidth ? '100%' : 'auto',
  };

  const finalTextColor = textColor || variantStyles.textColor;

  return (
    <Pressable
      style={({ pressed }) => [
        containerStyle,
        pressed && !isDisabled && {
          opacity: Interaction.activeOpacity,
        },
        style,
      ]}
      onPress={onPress}
      disabled={isDisabled}
      hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
    >
      {loading ? (
        <View style={styles.loadingContainer}>
          <Text style={[sizeStyles, { color: finalTextColor, opacity: 0.6 }]}>
            {label}
          </Text>
        </View>
      ) : (
        <Text style={[sizeStyles, { color: finalTextColor }]}>{label}</Text>
      )}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  loadingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
});
