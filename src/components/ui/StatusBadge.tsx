import { StyleSheet, Text, View } from 'react-native';

import {
    ApplicationStatus,
    BorderRadius,
    SpacingTokens as Spacing,
    StatusColors,
    Typography,
} from '@/constants/theme';

export interface StatusBadgeProps {
  /** Application status */
  status: ApplicationStatus;
  /** Whether to show as filled badge or outlined */
  variant?: 'filled' | 'outlined';
  /** Size of badge */
  size?: 'sm' | 'md' | 'lg';
}

/**
 * JAGO StatusBadge Component
 * 
 * Displays JAGO application status with semantic colors.
 * Supports all JAGO application states:
 * - submitted
 * - under_verification
 * - action_required
 * - sanctioned
 * - disbursed
 * - rejected
 */
export function StatusBadge({
  status,
  variant = 'outlined',
  size = 'md',
}: StatusBadgeProps) {
  const statusColors = StatusColors.light[status];

  const getStatusLabel = (status: ApplicationStatus) => {
    const labels: Record<ApplicationStatus, string> = {
      submitted: 'Submitted',
      under_verification: 'Under Verification',
      action_required: 'Action Required',
      sanctioned: 'Sanctioned',
      disbursed: 'Disbursed',
      rejected: 'Rejected',
    };
    return labels[status];
  };

  const getSizeStyles = () => {
    switch (size) {
      case 'sm':
        return {
          paddingHorizontal: Spacing.sm,
          paddingVertical: 2,
          ...Typography.xs,
        };
      case 'lg':
        return {
          paddingHorizontal: Spacing.base,
          paddingVertical: Spacing.xs,
          ...Typography.smallBold,
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
    borderRadius: BorderRadius.md,
    paddingHorizontal: sizeStyles.paddingHorizontal,
    paddingVertical: sizeStyles.paddingVertical,
    alignSelf: 'flex-start',
    flexDirection: 'row',
    alignItems: 'center',
  };

  if (variant === 'filled') {
    containerStyle.backgroundColor = statusColors.badge;
    containerStyle.borderWidth = 0;
  } else {
    containerStyle.backgroundColor = statusColors.background;
    containerStyle.borderWidth = 1;
    containerStyle.borderColor = statusColors.border;
  }

  const textColor = variant === 'filled' ? '#ffffff' : statusColors.text;

  return (
    <View style={containerStyle}>
      {/* Dot indicator */}
      <View
        style={[
          styles.dot,
          {
            backgroundColor: statusColors.badge,
            marginRight: size === 'sm' ? 0 : Spacing.xs,
          },
        ]}
      />
      <Text
        style={[
          {
            color: textColor,
            fontSize: sizeStyles.fontSize,
            fontWeight: sizeStyles.fontWeight,
            lineHeight: sizeStyles.lineHeight,
          },
        ]}
      >
        {getStatusLabel(status)}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  dot: {
    width: 6,
    height: 6,
    borderRadius: 3,
  },
});
