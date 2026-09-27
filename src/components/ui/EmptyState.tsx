import { StyleSheet, Text, View } from 'react-native';

import { SpacingTokens as Spacing, Typography } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';
import { Button } from './Button';

export interface EmptyStateProps {
  /** Title text */
  title: string;
  /** Description text */
  description?: string;
  /** Action button label */
  actionLabel?: string;
  /** Callback when action button is pressed */
  onActionPress?: () => void;
  /** Whether action button is shown */
  showAction?: boolean;
  /** Empty state icon/illustration (optional) */
  icon?: React.ReactNode;
  /** Vertical padding */
  paddingVertical?: number;
}

/**
 * JAGO EmptyState Component
 * 
 * Displays when no content is available (no applications, no documents, etc).
 * Provides optional action to create/add content.
 */
export function EmptyState({
  title,
  description,
  actionLabel,
  onActionPress,
  showAction = !!actionLabel,
  icon,
  paddingVertical = Spacing.lg,
}: EmptyStateProps) {
  const theme = useTheme();

  return (
    <View
      style={[
        styles.container,
        {
          paddingVertical,
        },
      ]}
    >
      {/* Icon (if provided) */}
      {icon && <View style={styles.iconContainer}>{icon}</View>}

      {/* Title */}
      <Text
        style={[
          Typography.h5,
          {
            color: theme.text,
            textAlign: 'center',
            marginBottom: Spacing.sm,
          },
        ]}
      >
        {title}
      </Text>

      {/* Description */}
      {description && (
        <Text
          style={[
            Typography.small,
            {
              color: theme.textSecondary,
              textAlign: 'center',
              marginBottom: Spacing.base,
              lineHeight: 20,
            },
          ]}
        >
          {description}
        </Text>
      )}

      {/* Action Button */}
      {showAction && actionLabel && (
        <View style={styles.actionContainer}>
          <Button
            label={actionLabel}
            variant="primary"
            onPress={onActionPress}
          />
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: Spacing.base,
  },
  iconContainer: {
    marginBottom: Spacing.base,
  },
  actionContainer: {
    marginTop: Spacing.base,
    minWidth: 200,
  },
});
