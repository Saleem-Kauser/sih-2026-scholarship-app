import { StyleSheet, Text, View } from 'react-native';

import { SpacingTokens as Spacing, Typography } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';
import { Badge } from './Badge';
import { Button } from './Button';
import { Card } from './Card';

export interface ScholarshipCardProps {
  /** Scholarship scheme name */
  name: string;
  /** Short name or abbreviation */
  shortName: string;
  /** Scholarship category (e.g., "Pre-Matric Education") */
  category: string;
  /** Description text */
  description: string;
  /** Action button label */
  actionLabel?: string;
  /** Callback when action button is pressed */
  onActionPress?: () => void;
  /** Custom card variant */
  variant?: 'default' | 'elevated' | 'outlined';
}

/**
 * JAGO ScholarshipCard Component
 * 
 * Displays scholarship scheme information with category, description, and action.
 * Used in scholarship listing screens.
 * 
 * Props are data-driven - receive all scholarship info from parent.
 */
export function ScholarshipCard({
  name,
  shortName,
  category,
  description,
  actionLabel = 'Learn More',
  onActionPress,
  variant = 'default',
}: ScholarshipCardProps) {
  const theme = useTheme();

  return (
    <Card variant={variant} padding={Spacing.base}>
      {/* Header Section */}
      <View style={styles.header}>
        <View style={styles.headerText}>
          <Text style={[Typography.h6, { color: theme.text }]} numberOfLines={2}>
            {name}
          </Text>
          <Text
            style={[
              Typography.small,
              { color: theme.textSecondary, marginTop: Spacing.xs },
            ]}
          >
            {shortName}
          </Text>
        </View>
      </View>

      {/* Category Badge */}
      <View style={styles.categorySection}>
        <Badge label={category} variant="info" size="sm" />
      </View>

      {/* Description */}
      <Text
        style={[
          Typography.small,
          { color: theme.textSecondary, marginVertical: Spacing.base },
        ]}
        numberOfLines={3}
      >
        {description}
      </Text>

      {/* Action Button */}
      <Button
        label={actionLabel}
        variant="primary"
        size="md"
        onPress={onActionPress}
      />
    </Card>
  );
}

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: Spacing.sm,
  },
  headerText: {
    flex: 1,
  },
  categorySection: {
    marginVertical: Spacing.sm,
  },
});
