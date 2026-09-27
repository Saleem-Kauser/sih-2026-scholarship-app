import { View, type ViewProps } from 'react-native';

import { BorderRadius, Shadows, SpacingTokens as Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';

export type CardVariant = 'default' | 'elevated' | 'outlined';

export interface CardProps extends ViewProps {
  /** Visual variant */
  variant?: CardVariant;
  /** Padding inside card */
  padding?: number;
  /** Border radius size */
  borderRadius?: number;
  /** Whether to show shadow (only for elevated variant) */
  showShadow?: boolean;
  /** Accent border color (usually semantic color for status) */
  borderColor?: string;
  /** Border width if custom color is set */
  borderWidth?: number;
}

/**
 * JAGO Card Component
 * 
 * Container for content with consistent spacing and optional elevation.
 * Use for displaying information groups, application details, etc.
 */
export function Card({
  children,
  style,
  variant = 'default',
  padding = Spacing.base,
  borderRadius: customBorderRadius = BorderRadius.lg,
  showShadow = false,
  borderColor,
  borderWidth,
  ...props
}: CardProps) {
  const theme = useTheme();

  const getVariantStyles = () => {
    switch (variant) {
      case 'elevated':
        return {
          backgroundColor: theme.background,
          borderWidth: 0,
          ...Shadows.light.md,
        };
      case 'outlined':
        return {
          backgroundColor: theme.background,
          borderWidth: 1,
          borderColor: theme.border,
        };
      case 'default':
      default:
        return {
          backgroundColor: theme.background,
          borderWidth: 1,
          borderColor: theme.border,
        };
    }
  };

  const variantStyles = getVariantStyles();

  const containerStyle: any = {
    backgroundColor: variantStyles.backgroundColor,
    borderRadius: customBorderRadius,
    padding,
    borderWidth: borderColor ? borderWidth ?? 1 : variantStyles.borderWidth,
    borderColor: borderColor ?? variantStyles.borderColor,
  };

  // Add shadow for elevated variant if requested
  if (variant === 'elevated' && showShadow) {
    Object.assign(containerStyle, Shadows.light.md);
  }

  return (
    <View style={[containerStyle, style]} {...props}>
      {children}
    </View>
  );
}
