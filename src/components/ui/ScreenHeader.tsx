// src/components/ui/ScreenHeader.tsx
import type { ReactNode } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { SpacingTokens as Spacing, Typography } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';

export interface ScreenHeaderProps {
  title: string;
  subtitle?: string;
  onBackPress?: () => void;
  showBackButton?: boolean;
  rightContent?: ReactNode;
  showBorder?: boolean;
}

export function ScreenHeader({
  title,
  subtitle,
  onBackPress,
  showBackButton = false,
  rightContent,
  showBorder = true,
}: ScreenHeaderProps) {
  const theme = useTheme();

  return (
    <SafeAreaView style={styles.safeArea} edges={['top']}>
      <View
        style={[
          styles.container,
          {
            backgroundColor: '#FFFFFF',
            borderBottomWidth: showBorder ? 1 : 0,
            borderBottomColor: theme.border,
          },
        ]}
      >
        <View style={styles.leftSection}>
        {showBackButton && (
          <Pressable
            onPress={onBackPress}
            style={styles.backButton}
            hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
          >
            <Text style={[Typography.bodyBold, { color: theme.primary }]}>←</Text>
          </Pressable>
        )}
        <View style={styles.titleGroup}>
          <Text
            style={[
              Typography.h5,
              {
                color: theme.text,
              },
            ]}
            numberOfLines={1}
          >
            {title}
          </Text>
          {subtitle && (
            <Text style={[Typography.xs, { color: theme.textSecondary }]} numberOfLines={1}>
              {subtitle}
            </Text>
          )}
        </View>
        </View>

        {rightContent && <View style={styles.rightSection}>{rightContent}</View>}
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    backgroundColor: '#FFFFFF',
  },
  container: {
    height: 56,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: Spacing.base,
  },
  leftSection: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  titleGroup: {
    flex: 1,
  },
  backButton: {
    marginRight: Spacing.sm,
    paddingRight: Spacing.xs,
  },
  rightSection: {
    flexDirection: 'row',
    alignItems: 'center',
  },
});