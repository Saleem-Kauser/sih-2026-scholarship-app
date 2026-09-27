import { useRouter } from 'expo-router';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { SpacingTokens as Spacing, Typography } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';

export interface ScreenHeaderProps {
  /** Title text */
  title: string;
  /** Whether to show back button */
  showBackButton?: boolean;
  /** Custom back button callback (overrides default router.back()) */
  onBackPress?: () => void;
  /** Right-side content (e.g., help icon, menu button) */
  rightContent?: React.ReactNode;
  /** Whether to show border at bottom */
  showBorder?: boolean;
}

/**
 * JAGO ScreenHeader Component
 * 
 * Standard header for screens with title and optional back button.
 * Handles safe area automatically.
 */
export function ScreenHeader({
  title,
  showBackButton = true,
  onBackPress,
  rightContent,
  showBorder = true,
}: ScreenHeaderProps) {
  const theme = useTheme();
  const router = useRouter();
  const insets = useSafeAreaInsets();

  const handleBackPress = () => {
    if (onBackPress) {
      onBackPress();
    } else {
      router.back();
    }
  };

  return (
    <View
      style={[
        styles.container,
        {
          paddingTop: Math.max(insets.top + Spacing.sm, Spacing.base),
          backgroundColor: theme.background,
          borderBottomColor: showBorder ? theme.border : 'transparent',
        },
      ]}
    >
      <View
        style={[
          styles.content,
          {
            paddingHorizontal: Spacing.base,
            paddingBottom: Spacing.base,
          },
        ]}
      >
        <View style={styles.leftSection}>
          {showBackButton && (
            <Pressable
              style={({ pressed }) => [
                styles.backButton,
                pressed && { opacity: 0.7 },
              ]}
              onPress={handleBackPress}
              hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
            >
              <Text style={[Typography.bodyBold, { color: theme.primary }]}>
                ← Back
              </Text>
            </Pressable>
          )}
        </View>

        <View style={styles.centerSection}>
          <Text
            style={[Typography.h5, { color: theme.text }]}
            numberOfLines={1}
          >
            {title}
          </Text>
        </View>

        <View style={styles.rightSection}>
          {rightContent}
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    borderBottomWidth: 1,
  },
  content: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    minHeight: 44,
  },
  leftSection: {
    flex: 0.3,
    justifyContent: 'center',
  },
  centerSection: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    marginHorizontal: Spacing.sm,
  },
  rightSection: {
    flex: 0.3,
    justifyContent: 'center',
    alignItems: 'flex-end',
  },
  backButton: {
    paddingVertical: Spacing.xs,
    paddingRight: Spacing.sm,
  },
});
