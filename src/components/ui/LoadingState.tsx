import { ActivityIndicator, StyleSheet, Text, View } from 'react-native';

import { SpacingTokens as Spacing, Typography } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';

export interface LoadingStateProps {
  /** Loading message text */
  message?: string;
  /** Size of activity indicator */
  size?: 'small' | 'large';
  /** Vertical padding */
  paddingVertical?: number;
}

/**
 * JAGO LoadingState Component
 * 
 * Simple loading indicator with optional message.
 * No complex animations - just basic activity indicator.
 * Use when data is being fetched.
 */
export function LoadingState({
  message = 'Loading...',
  size = 'large',
  paddingVertical = Spacing.lg,
}: LoadingStateProps) {
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
      <ActivityIndicator
        size={size}
        color={theme.primary}
        style={styles.indicator}
      />
      {message && (
        <Text
          style={[
            Typography.small,
            {
              color: theme.textSecondary,
              marginTop: Spacing.base,
              textAlign: 'center',
            },
          ]}
        >
          {message}
        </Text>
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
  indicator: {
    marginBottom: Spacing.base,
  },
});
