import { useRouter } from 'expo-router';
import { useEffect } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { Badge, BottomNavBar } from '@/components/ui';
import { getApplications, getStudentDocuments } from '@/utils/applicationStore';
import { hasSelectedRole } from '@/utils/roleStore';

export default function HomeScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();

  const roleSelectionComplete = hasSelectedRole();

  useEffect(() => {
    if (!roleSelectionComplete) router.replace('/role-select');
  }, [roleSelectionComplete, router]);

  if (!roleSelectionComplete) return null;

  const applications = getApplications();
  const latestApp = applications[0];
  const documents = getStudentDocuments();

  const verifiedDocsCount = documents.filter((d) => d.status === 'verified').length;
  const reviewDocsCount = documents.filter((d) => d.status === 'manual_review').length;

  return (
    <View style={styles.container}>
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={[
          styles.scrollContent,
          {
            paddingTop: Math.max(insets.top + 16, 44),
            paddingBottom: 24,
          },
        ]}
        showsVerticalScrollIndicator={false}
      >
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.logo}>JAGO</Text>
          <Text style={styles.greeting}>Welcome, Student 👋</Text>
          <Text style={styles.subtitle}>Unified scholarship assistant for tribal education</Text>
          <Pressable onPress={() => router.replace('/role-select')} style={styles.roleSwitchButton}>
            <Text style={styles.linkText}>Switch prototype role</Text>
          </Pressable>
        </View>

        {/* Current Application Status Card */}
        {latestApp && (
          <View style={styles.card}>
            <View style={styles.cardHeaderRow}>
              <Text style={styles.cardTitle}>Application Status</Text>
              <Badge label="Under Verification" variant="info" size="sm" />
            </View>

            <Text style={styles.schemeName}>{latestApp.schemeShortName}</Text>
            <Text style={styles.appIdText}>Application ID: {latestApp.id}</Text>

            <View style={styles.divider} />

            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>Pending Action:</Text>
              <Text style={styles.infoValue}>
                {latestApp.pendingAction || 'No action required from student'}
              </Text>
            </View>

            <Pressable
              style={styles.primaryButton}
              onPress={() => router.push('/scholarship')}
            >
              <Text style={styles.primaryButtonText}>View Application Status</Text>
            </Pressable>

            <Pressable
              style={styles.secondaryButton}
              onPress={() => router.push('/scholarships')}
            >
              <Text style={styles.secondaryButtonText}>Browse All Scholarships</Text>
            </Pressable>
          </View>
        )}

        {/* Document Wallet Summary Card */}
        <View style={styles.card}>
          <View style={styles.cardHeaderRow}>
            <Text style={styles.cardTitle}>Document Verification Summary</Text>
            <Pressable onPress={() => router.push('/documents')}>
              <Text style={styles.linkText}>View Wallet →</Text>
            </Pressable>
          </View>

          <Text style={styles.cardText}>
            Auto-verified via DigiLocker & e-District Sandbox architecture.
          </Text>

          <View style={styles.docStatsContainer}>
            <View style={styles.docStatBadgeSuccess}>
              <Text style={styles.docStatBadgeSuccessText}>{verifiedDocsCount} Auto-Verified</Text>
            </View>

            {reviewDocsCount > 0 && (
              <View style={styles.docStatBadgeWarning}>
                <Text style={styles.docStatBadgeWarningText}>{reviewDocsCount} Manual Review</Text>
              </View>
            )}
          </View>

          <Pressable
            style={styles.secondaryButton}
            onPress={() => router.push('/documents')}
          >
            <Text style={styles.secondaryButtonText}>Open Document Wallet</Text>
          </Pressable>
        </View>

        {/* Need Help / Ask JAGO Card */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Ask JAGO Assistant</Text>
          <Text style={styles.cardText}>
            Get instant answers regarding scheme eligibility, document requirements, or your application progress.
          </Text>

          <Pressable
            style={styles.primaryButton}
            onPress={() => router.push('/assistant')}
          >
            <Text style={styles.primaryButtonText}>Ask JAGO Assistant</Text>
          </Pressable>
        </View>
      </ScrollView>

      {/* Bottom Navigation */}
      <BottomNavBar activeTab="home" />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F7F9FC',
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 20,
  },
  header: {
    marginBottom: 20,
  },
  logo: {
    fontSize: 28,
    fontWeight: '800',
    color: '#1677FF',
    marginBottom: 12,
    letterSpacing: 0.5,
  },
  greeting: {
    fontSize: 22,
    fontWeight: '700',
    color: '#172033',
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 14,
    color: '#667085',
    lineHeight: 20,
  },
  roleSwitchButton: {
    alignSelf: 'flex-start',
    marginTop: 8,
    paddingVertical: 4,
  },
  card: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E4E7EC',
    borderRadius: 14,
    padding: 18,
    marginBottom: 16,
  },
  cardHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#172033',
  },
  schemeName: {
    fontSize: 15,
    fontWeight: '700',
    color: '#1677FF',
    marginTop: 2,
  },
  appIdText: {
    fontSize: 12,
    fontFamily: 'monospace',
    color: '#667085',
    marginTop: 2,
  },
  divider: {
    height: 1,
    backgroundColor: '#F1F5F9',
    marginVertical: 12,
  },
  infoRow: {
    marginBottom: 14,
  },
  infoLabel: {
    fontSize: 11,
    fontWeight: '700',
    color: '#64748B',
    textTransform: 'uppercase',
  },
  infoValue: {
    fontSize: 13,
    color: '#172033',
    marginTop: 2,
  },
  linkText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#1677FF',
  },
  cardText: {
    fontSize: 13,
    lineHeight: 19,
    color: '#667085',
    marginBottom: 12,
  },
  docStatsContainer: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 14,
  },
  docStatBadgeSuccess: {
    backgroundColor: '#F0FDF4',
    borderWidth: 1,
    borderColor: '#BBF7D0',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 6,
  },
  docStatBadgeSuccessText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#15803D',
  },
  docStatBadgeWarning: {
    backgroundColor: '#FFFBEB',
    borderWidth: 1,
    borderColor: '#FDE68A',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 6,
  },
  docStatBadgeWarningText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#B45309',
  },
  primaryButton: {
    minHeight: 44,
    paddingHorizontal: 16,
    paddingVertical: 11,
    borderRadius: 10,
    backgroundColor: '#1677FF',
    alignItems: 'center',
    justifyContent: 'center',
  },
  primaryButtonText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '700',
  },
  secondaryButton: {
    minHeight: 44,
    paddingHorizontal: 16,
    paddingVertical: 11,
    borderRadius: 10,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#D0D5DD',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 8,
  },
  secondaryButtonText: {
    color: '#344054',
    fontSize: 14,
    fontWeight: '600',
  },
});