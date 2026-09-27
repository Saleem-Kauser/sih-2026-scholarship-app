import { StyleSheet, Text, View } from 'react-native';

import { SpacingTokens as Spacing, Typography } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';
import { Badge } from './Badge';
import { Button } from './Button';
import { Card } from './Card';

export type DocumentStatus = 'pending' | 'uploaded' | 'verified' | 'rejected';

export interface DocumentCardProps {
  /** Document name (e.g., "ST Certificate") */
  documentName: string;
  /** Document type/category */
  documentType: string;
  /** Upload or verification status */
  status: DocumentStatus;
  /** Optional status message */
  statusMessage?: string;
  /** Action button label (e.g., "Upload", "Replace") */
  actionLabel?: string;
  /** Callback when action button is pressed */
  onActionPress?: () => void;
}

/**
 * JAGO DocumentCard Component
 * 
 * Displays a single document's upload/verification status.
 * Used in document upload sections of applications.
 */
export function DocumentCard({
  documentName,
  documentType,
  status,
  statusMessage,
  actionLabel,
  onActionPress,
}: DocumentCardProps) {
  const theme = useTheme();

  const getStatusBadgeVariant = (status: DocumentStatus) => {
    switch (status) {
      case 'verified':
        return 'success';
      case 'rejected':
        return 'error';
      case 'uploaded':
        return 'info';
      case 'pending':
      default:
        return 'warning';
    }
  };

  const getStatusLabel = (status: DocumentStatus) => {
    switch (status) {
      case 'verified':
        return 'Verified';
      case 'rejected':
        return 'Rejected';
      case 'uploaded':
        return 'Uploaded';
      case 'pending':
      default:
        return 'Pending';
    }
  };

  const getDefaultActionLabel = (status: DocumentStatus) => {
    switch (status) {
      case 'rejected':
        return 'Re-upload';
      case 'pending':
        return 'Upload';
      case 'uploaded':
        return 'Replace';
      case 'verified':
      default:
        return undefined;
    }
  };

  const finalActionLabel = actionLabel ?? getDefaultActionLabel(status);
  const showAction = !!finalActionLabel;

  return (
    <Card variant="outlined" padding={Spacing.base}>
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.nameSection}>
          <Text style={[Typography.bodyBold, { color: theme.text }]}>
            {documentName}
          </Text>
          <Text
            style={[
              Typography.small,
              { color: theme.textSecondary, marginTop: Spacing.xs },
            ]}
          >
            {documentType}
          </Text>
        </View>
        <Badge
          label={getStatusLabel(status)}
          variant={getStatusBadgeVariant(status)}
          size="sm"
        />
      </View>

      {/* Status Message */}
      {statusMessage && (
        <Text
          style={[
            Typography.small,
            {
              color: theme.textSecondary,
              marginVertical: Spacing.sm,
            },
          ]}
        >
          {statusMessage}
        </Text>
      )}

      {/* Action Button */}
      {showAction && (
        <View style={styles.actionSection}>
          <Button
            label={finalActionLabel}
            variant="secondary"
            size="sm"
            onPress={onActionPress}
            fullWidth
          />
        </View>
      )}
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
  nameSection: {
    flex: 1,
    marginRight: Spacing.sm,
  },
  actionSection: {
    marginTop: Spacing.base,
  },
});
