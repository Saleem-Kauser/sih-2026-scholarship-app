import { StyleSheet, Text, View } from 'react-native';

import { SpacingTokens as Spacing, Typography } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';

export interface SectionHeaderProps {
  title: string;
  subtitle?: string;
  rightContent?: React.ReactNode;
  marginBottom?: number;
}

export function SectionHeader({
  title,
  subtitle,
  rightContent,
  marginBottom = Spacing.md,
}: SectionHeaderProps) {
  const theme = useTheme();

  return (
    <View style={[styles.container, { marginBottom }]}>
      <View style={styles.titleContainer}>
        <Text style={[Typography.h6, { color: theme.text }]}>
          {title}
        </Text>
        {subtitle && (
          <Text
            style={[
              Typography.small,
              { color: theme.textSecondary, marginTop: Spacing.xs },
            ]}
          >
            {subtitle}
          </Text>
        )}
      </View>
      {rightContent && <View>{rightContent}</View>}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  titleContainer: {
    flex: 1,
  },
});