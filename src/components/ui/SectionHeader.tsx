import { StyleSheet, Text, View } from 'react-native';

import { SpacingTokens as Spacing, Typography } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';

export interface SectionHeaderProps {
  /** Title text */
  title: string;
  /** Optional subtitle */
  subtitle?: string;
  /** Right-aligned content (e.g., "See all" link) */
  rightContent?: React.ReactNode;
  /** Spacing below header */
  marginBottom?: number;
}

/**
 * JAGO SectionHeader Component
 * 
 * Section title with optional subtitle for grouping content.
 * Use at the start of logical content sections.
 */
export function SectionHeader({
  title,
  subtitle,
  rightContent,
  marginBottom = Spacing.base,
}: SectionHeaderProps) {
  const theme = useTheme();

  return (
    <View style={[styles.container, { marginBottom }]}>
      <View style={styles.titleSection}>
        <View style={styles.titles}>
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
        {rightContent && <View style={styles.rightContent}>{rightContent}</View>}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: Spacing.base,
  },
  titleSection: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  titles: {
    flex: 1,
  },
  rightContent: {
    marginLeft: Spacing.base,
  },
});
