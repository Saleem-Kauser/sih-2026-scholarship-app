import { Text, View } from 'react-native';

import { BorderRadius, SpacingTokens as Spacing, Typography } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';

export type BadgeVariant = 'default' | 'success' | 'warning' | 'error' | 'info' | 'primary';
export type BadgeSize = 'sm' | 'md';

export interface BadgeProps {
  /** Label text */
  label: string;
  /** Visual variant */
  variant?: BadgeVariant;
  /** Size */
  size?: BadgeSize;
  /** Custom background color */
  backgroundColor?: string;
  /** Custom text color */
  textColor?: string;
  /** Custom border color */
  borderColor?: string;
  /** Additional styles */
  style?: any;
}

/**
 * JAGO Badge Component
 * 
 * Small visual indicator for status, tags, or labels.
 * Use for displaying application statuses, categories, etc.
 */
export function Badge({
  label,
  variant = 'default',
  size = 'md',
  backgroundColor,
  textColor,
  borderColor: customBorderColor,
  style,
}: BadgeProps) {
  const theme = useTheme();

  const getVariantStyles = () => {
    switch (variant) {
      case 'success':
        return {
          backgroundColor: theme.successLightest,
          textColor: theme.success,
          borderColor: theme.successLight,
        };
      case 'warning':
        return {
          backgroundColor: theme.warningLightest,
          textColor: theme.warning,
          borderColor: theme.warningLight,
        };
      case 'error':
        return {
          backgroundColor: theme.errorLightest,
          textColor: theme.error,
          borderColor: theme.errorLight,
        };
      case 'info':
        return {
          backgroundColor: theme.infoLightest,
          textColor: theme.info,
          borderColor: theme.infoLight,
        };
      case 'primary':
        return {
          backgroundColor: theme.primaryLightest,
          textColor: theme.primary,
          borderColor: theme.primaryLight,
        };
      case 'default':
      default:
        return {
          backgroundColor: theme.backgroundSelected,
          textColor: theme.text,
          borderColor: theme.border,
        };
    }
  };

  const variantStyles = getVariantStyles();

  const getSizeStyles = () => {
    switch (size) {
      case 'sm':
        return {
          paddingHorizontal: Spacing.xs,
          paddingVertical: 2,
          ...Typography.xs,
        };
      case 'md':
      default:
        return {
          paddingHorizontal: Spacing.sm,
          paddingVertical: Spacing.xs,
          ...Typography.xsBold,
        };
    }
  };

  const sizeStyles = getSizeStyles();

  const containerStyle: any = {
    backgroundColor: backgroundColor ?? variantStyles.backgroundColor,
    borderColor: customBorderColor ?? variantStyles.borderColor,
    borderWidth: 1,
    borderRadius: BorderRadius.sm,
    paddingHorizontal: sizeStyles.paddingHorizontal,
    paddingVertical: sizeStyles.paddingVertical,
    alignSelf: 'flex-start',
  };

  const labelStyle = {
    color: textColor ?? variantStyles.textColor,
    fontSize: sizeStyles.fontSize,
    fontWeight: sizeStyles.fontWeight,
    lineHeight: sizeStyles.lineHeight,
  };

  return (
    <View style={[containerStyle, style]}>
      <Text style={labelStyle} numberOfLines={1}>
        {label}
      </Text>
    </View>
  );
}
