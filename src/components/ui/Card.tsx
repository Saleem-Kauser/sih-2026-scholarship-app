import { View, type ViewProps } from 'react-native';

import { BorderRadius, Shadows, SpacingTokens as Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';

export type CardVariant = 'default' | 'elevated' | 'outlined';

export interface CardProps extends ViewProps {
  variant?: CardVariant;
  padding?: number;
  borderRadius?: number;
  showShadow?: boolean;
  borderColor?: string;
  borderWidth?: number;
}

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
          backgroundColor: theme.backgroundCard || '#FFFFFF',
          borderWidth: 1,
          borderColor: theme.border,
          ...Shadows.light.sm,
        };
      case 'outlined':
        return {
          backgroundColor: theme.backgroundCard || '#FFFFFF',
          borderWidth: 1,
          borderColor: theme.border,
        };
      case 'default':
      default:
        return {
          backgroundColor: theme.backgroundCard || '#FFFFFF',
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
    borderWidth: borderColor ? (borderWidth ?? 1) : variantStyles.borderWidth,
    borderColor: borderColor ?? variantStyles.borderColor,
  };

  if (variant === 'elevated' || showShadow) {
    Object.assign(containerStyle, Shadows.light.sm);
  }

  return (
    <View style={[containerStyle, style]} {...props}>
      {children}
    </View>
  );
}