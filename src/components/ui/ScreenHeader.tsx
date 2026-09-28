// src/components/ui/ScreenHeader.tsx
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { SpacingTokens as Spacing, Typography } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';

export interface ScreenHeaderProps {
  title: string;
  onBackPress?: () => void;
  showBackButton?: boolean;
  rightContent?: React.ReactNode;
  showBorder?: boolean;
}

export function ScreenHeader({
  title,
  onBackPress,
  showBackButton = false,
  rightContent,
  showBorder = true,
}: ScreenHeaderProps) {
  const theme = useTheme();

  return (
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
      </View>

      {rightContent && <View style={styles.rightSection}>{rightContent}</View>}
    </View>
  );
}

const styles = StyleSheet.create({
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
  backButton: {
    marginRight: Spacing.sm,
    paddingRight: Spacing.xs,
  },
  rightSection: {
    flexDirection: 'row',
    alignItems: 'center',
  },
});