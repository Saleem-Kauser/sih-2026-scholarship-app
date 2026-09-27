import { StyleSheet, Text, View } from 'react-native';

import { BorderRadius, SpacingTokens as Spacing, Typography } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';

export type TimelineStage = 'completed' | 'current' | 'pending';

export interface TimelineItem {
  /** Stage name (e.g., "Submitted") */
  name: string;
  /** Status of this stage */
  status: TimelineStage;
  /** Optional description or date */
  description?: string;
}

export interface ApplicationTimelineProps {
  /** Array of timeline stages */
  stages: TimelineItem[];
  /** Whether to show stage descriptions */
  showDescriptions?: boolean;
}

/**
 * JAGO ApplicationTimeline Component
 * 
 * Vertical timeline showing scholarship application journey.
 * Displays stages: Submitted → Document Verification → Sanction → Disbursement
 * 
 * Status can be: 'completed', 'current', 'pending'
 */
export function ApplicationTimeline({
  stages,
  showDescriptions = true,
}: ApplicationTimelineProps) {
  const theme = useTheme();

  const getStageStatusText = (status: TimelineStage) => {
    switch (status) {
      case 'completed':
        return 'Completed';
      case 'current':
        return 'In Progress';
      case 'pending':
      default:
        return 'Pending';
    }
  };

  const getStageColors = (status: TimelineStage) => {
    switch (status) {
      case 'completed':
        return {
          dot: theme.success,
          line: theme.success,
          text: theme.success,
          description: theme.textSecondary,
        };
      case 'current':
        return {
          dot: theme.primary,
          line: theme.border,
          text: theme.primary,
          description: theme.text,
        };
      case 'pending':
      default:
        return {
          dot: theme.border,
          line: theme.border,
          text: theme.textTertiary,
          description: theme.textTertiary,
        };
    }
  };

  return (
    <View style={styles.container}>
      {stages.map((stage, index) => {
        const isFirst = index === 0;
        const isLast = index === stages.length - 1;
        const colors = getStageColors(stage.status);

        return (
          <View key={`${stage.name}-${index}`} style={styles.timelineItem}>
            {/* Timeline Track */}
            <View style={styles.trackColumn}>
              {/* Top line */}
              {!isFirst && (
                <View
                  style={[
                    styles.trackLine,
                    { backgroundColor: colors.line },
                  ]}
                />
              )}

              {/* Dot */}
              <View
                style={[
                  styles.dot,
                  {
                    backgroundColor:
                      stage.status === 'completed'
                        ? colors.dot
                        : theme.background,
                    borderColor: colors.dot,
                    borderWidth: 2,
                  },
                ]}
              >
                {stage.status === 'current' && (
                  <View
                    style={[
                      styles.dotInner,
                      { backgroundColor: colors.dot },
                    ]}
                  />
                )}
              </View>

              {/* Bottom line */}
              {!isLast && (
                <View
                  style={[
                    styles.trackLine,
                    {
                      backgroundColor:
                        stage.status === 'completed'
                          ? colors.line
                          : theme.border,
                    },
                  ]}
                />
              )}
            </View>

            {/* Stage Content */}
            <View style={styles.stageContent}>
              <View
                style={[
                  styles.stageHeader,
                  stage.status === 'current' && { marginBottom: Spacing.xs },
                ]}
              >
                <Text
                  style={[
                    Typography.bodyBold,
                    {
                      color: colors.text,
                    },
                  ]}
                >
                  {stage.name}
                </Text>
                <Text
                  style={[
                    Typography.small,
                    {
                      color: colors.description,
                      marginLeft: Spacing.sm,
                    },
                  ]}
                >
                  {getStageStatusText(stage.status)}
                </Text>
              </View>

              {showDescriptions && stage.description && (
                <Text
                  style={[
                    Typography.small,
                    {
                      color: colors.description,
                      marginTop: Spacing.xs,
                    },
                  ]}
                >
                  {stage.description}
                </Text>
              )}
            </View>
          </View>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingVertical: Spacing.sm,
  },
  timelineItem: {
    flexDirection: 'row',
    alignItems: 'stretch',
    minHeight: 56,
    marginBottom: Spacing.sm,
  },
  trackColumn: {
    width: 32,
    alignItems: 'center',
    marginRight: Spacing.base,
  },
  trackLine: {
    width: 2,
    flex: 1,
  },
  dot: {
    width: 20,
    height: 20,
    borderRadius: BorderRadius.full,
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 1,
  },
  dotInner: {
    width: 8,
    height: 8,
    borderRadius: BorderRadius.full,
  },
  stageContent: {
    flex: 1,
    justifyContent: 'center',
  },
  stageHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
});
