import { Platform, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { Badge, Card, ScreenHeader, SectionHeader } from '@/components/ui';
import { Collapsible } from '@/components/ui/collapsible';
import { BottomTabInset, MaxContentWidth, SpacingTokens as Spacing, Typography } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';

export default function ExploreScreen() {
  const safeAreaInsets = useSafeAreaInsets();
  const insets = {
    ...safeAreaInsets,
    bottom: safeAreaInsets.bottom + BottomTabInset + Spacing.base,
  };
  const theme = useTheme();

  const contentPlatformStyle = Platform.select({
    android: {
      paddingTop: insets.top,
      paddingLeft: insets.left,
      paddingRight: insets.right,
      paddingBottom: insets.bottom,
    },
    web: {
      paddingTop: Spacing.lg,
      paddingBottom: Spacing.base,
    },
    ios: {
      paddingTop: insets.top,
      paddingBottom: insets.bottom,
    },
  });

  return (
    <View style={[styles.screen, { backgroundColor: theme.background }]}>
      <ScreenHeader title="Explore & Guidelines" showBorder />

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={[styles.contentContainer, contentPlatformStyle]}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.container}>
          <SectionHeader
            title="Scholarship Knowledge Base"
            subtitle="Important information regarding eligibility, applications, and rules"
            marginBottom={Spacing.base}
          />

          <View style={styles.sectionsWrapper}>
            {/* Eligibility Section */}
            <Card variant="outlined" padding={Spacing.base}>
              <Collapsible title="Eligibility Requirements">
                <Text style={[Typography.body, { color: theme.textSecondary, marginTop: Spacing.xs }]}>
                  Scholarships on JAGO are open to eligible tribal and post-matric students based on income and academic criteria.
                </Text>
                <View style={styles.bulletList}>
                  <Text style={[Typography.small, { color: theme.text, marginTop: Spacing.xs }]}>
                    • Pre-Matric & Post-Matric ST Schemes
                  </Text>
                  <Text style={[Typography.small, { color: theme.text, marginTop: Spacing.xs }]}>
                    • Annual family income within government prescribed limits
                  </Text>
                  <Text style={[Typography.small, { color: theme.text, marginTop: Spacing.xs }]}>
                    • Domicile requirement for state-specific schemes
                  </Text>
                </View>
              </Collapsible>
            </Card>

            {/* Required Documents */}
            <Card variant="outlined" padding={Spacing.base}>
              <Collapsible title="Required Documents Checklist">
                <Text style={[Typography.body, { color: theme.textSecondary, marginTop: Spacing.xs }]}>
                  Keep scanned copies of the following documents ready before starting your application:
                </Text>
                <View style={styles.badgeRow}>
                  <Badge label="Aadhaar Card" variant="info" size="sm" />
                  <Badge label="Community Cert" variant="info" size="sm" />
                  <Badge label="Income Cert" variant="info" size="sm" />
                  <Badge label="Marksheet" variant="info" size="sm" />
                  <Badge label="Bank Passbook" variant="info" size="sm" />
                </View>
              </Collapsible>
            </Card>

            {/* Application Flow */}
            <Card variant="outlined" padding={Spacing.base}>
              <Collapsible title="Application Journey & Stages">
                <Text style={[Typography.body, { color: theme.textSecondary, marginTop: Spacing.xs }]}>
                  Every submitted application progresses through 4 stages:
                </Text>
                <View style={styles.bulletList}>
                  <Text style={[Typography.small, { color: theme.text, marginTop: Spacing.xs }]}>
                    1. <Text style={Typography.smallBold}>Submission:</Text> Form successfully uploaded
                  </Text>
                  <Text style={[Typography.small, { color: theme.text, marginTop: Spacing.xs }]}>
                    2. <Text style={Typography.smallBold}>Verification:</Text> Institutional & district verification
                  </Text>
                  <Text style={[Typography.small, { color: theme.text, marginTop: Spacing.xs }]}>
                    3. <Text style={Typography.smallBold}>Sanction:</Text> Scholarship amount approved
                  </Text>
                  <Text style={[Typography.small, { color: theme.text, marginTop: Spacing.xs }]}>
                    4. <Text style={Typography.smallBold}>Disbursement:</Text> Funds transferred via DBT
                  </Text>
                </View>
              </Collapsible>
            </Card>

            {/* Help & Support */}
            <Card variant="outlined" padding={Spacing.base}>
              <Collapsible title="Need Support?">
                <Text style={[Typography.body, { color: theme.textSecondary, marginTop: Spacing.xs }]}>
                  If you encounter issues with document verification or bank mapping, contact the nodal officer at your institute or reach out through the official portal.
                </Text>
              </Collapsible>
            </Card>
          </View>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
  },
  contentContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    paddingHorizontal: Spacing.base,
  },
  container: {
    maxWidth: MaxContentWidth,
    width: '100%',
    paddingVertical: Spacing.base,
  },
  sectionsWrapper: {
    gap: Spacing.md,
  },
  bulletList: {
    marginTop: Spacing.xs,
  },
  badgeRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.xs,
    marginTop: Spacing.sm,
  },
});