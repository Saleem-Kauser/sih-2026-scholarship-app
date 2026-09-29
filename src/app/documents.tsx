import { useRouter } from 'expo-router';
import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { Badge, BottomNavBar, Card, ScreenHeader, SectionHeader } from '@/components/ui';
import { SpacingTokens as Spacing, Typography } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';
import type { StudentDocument } from '@/types/verification';
import { getStudentDocuments } from '@/utils/applicationStore';

export default function DocumentsScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const theme = useTheme();

  const documents = getStudentDocuments();

  const verifiedCount = documents.filter((d) => d.status === 'verified').length;
  const reviewCount = documents.filter((d) => d.status === 'manual_review').length;

  const getStatusBadgeVariant = (status: StudentDocument['status']) => {
    switch (status) {
      case 'verified':
        return 'success';
      case 'manual_review':
        return 'warning';
      case 'failed':
        return 'error';
      default:
        return 'info';
    }
  };

  const getStatusLabel = (status: StudentDocument['status']) => {
    switch (status) {
      case 'verified':
        return 'Auto-Verified';
      case 'manual_review':
        return 'Manual Review';
      case 'failed':
        return 'Verification Failed';
      default:
        return 'Pending';
    }
  };

  return (
    <View style={[styles.container, { backgroundColor: theme.background }]}>
      <ScreenHeader title="Document Wallet" subtitle="Verified government credential records" />

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={[
          styles.scrollContent,
          { paddingBottom: Math.max(insets.bottom + 20, 28) },
        ]}
        showsVerticalScrollIndicator={false}
      >
        <Card variant="outlined" style={styles.summaryCard}>
          <Text style={[Typography.h6, { color: theme.text, marginBottom: Spacing.xs }]}>
            DigiLocker & e-District Wallet
          </Text>
          <Text style={[Typography.small, { color: theme.textSecondary, marginBottom: Spacing.md }]}>
            JAGO remembers document verification state so you do not need to re-verify for every scheme.
          </Text>

          <View style={styles.statsRow}>
            <View style={styles.statBox}>
              <Text style={styles.statNumber}>{verifiedCount}</Text>
              <Text style={styles.statLabel}>Auto-Verified</Text>
            </View>

            <View style={styles.statDivider} />

            <View style={styles.statBox}>
              <Text style={[styles.statNumber, { color: '#B45309' }]}>{reviewCount}</Text>
              <Text style={styles.statLabel}>Manual Review</Text>
            </View>

            <View style={styles.statDivider} />

            <View style={styles.statBox}>
              <Text style={styles.statNumber}>{documents.length}</Text>
              <Text style={styles.statLabel}>Total Saved</Text>
            </View>
          </View>
        </Card>

        <SectionHeader
          title="Issued & Verified Documents"
          subtitle="Click any document to inspect sandbox verification details"
          marginBottom={Spacing.md}
        />

        {documents.map((doc) => (
          <Card key={doc.id} variant="outlined" style={styles.docCard}>
            <View style={styles.cardHeader}>
              <View style={styles.titleGroup}>
                <Text style={[Typography.bodyBold, { color: theme.text }]}>
                  {doc.name}
                </Text>
                <Text style={[Typography.xs, { color: theme.textSecondary, marginTop: 2 }]}>
                  Source: <Text style={{ fontWeight: '600', color: theme.text }}>{doc.source}</Text>
                </Text>
              </View>

              <Badge
                label={getStatusLabel(doc.status)}
                variant={getStatusBadgeVariant(doc.status)}
                size="sm"
              />
            </View>

            <View style={styles.cardDivider} />

            <View style={styles.metaRow}>
              <Text style={styles.metaLabel}>Ref URI:</Text>
              <Text style={styles.metaValueMono} numberOfLines={1}>
                {doc.uri}
              </Text>
            </View>

            <View style={styles.metaRow}>
              <Text style={styles.metaLabel}>Verified Date:</Text>
              <Text style={styles.metaValue}>{doc.verifiedAt}</Text>
            </View>

            {doc.expiryDate && (
              <View style={styles.metaRow}>
                <Text style={styles.metaLabel}>Validity / Expiry:</Text>
                <Text style={styles.metaValue}>{doc.expiryDate}</Text>
              </View>
            )}

            {doc.lastVerificationResult && (
              <View style={styles.resultContainer}>
                <Text style={styles.resultText}>
                  {doc.lastVerificationResult}
                </Text>
              </View>
            )}

            <TouchableOpacity
              style={styles.detailsButton}
              onPress={() =>
                router.push({
                  pathname: '/document-detail',
                  params: { docId: doc.id },
                })
              }
              activeOpacity={0.7}
            >
              <Text style={styles.detailsButtonText}>View Verification Details →</Text>
            </TouchableOpacity>
          </Card>
        ))}

        <View style={styles.disclaimerBox}>
          <Text style={styles.disclaimerText}>
            Demo Sandbox Notice: Document records are stored locally for the SIH 2026 prototype. DigiLocker and e-District verification states reflect sandbox architecture.
          </Text>
        </View>
      </ScrollView>

      <BottomNavBar activeTab="documents" />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: Spacing.base,
    paddingTop: Spacing.base,
  },
  summaryCard: {
    marginBottom: Spacing.lg,
    padding: Spacing.base,
    backgroundColor: '#FFFFFF',
    borderColor: '#E2E8F0',
  },
  statsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-around',
    backgroundColor: '#F8FAFC',
    borderRadius: 8,
    paddingVertical: 12,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  statBox: {
    alignItems: 'center',
  },
  statNumber: {
    fontSize: 20,
    fontWeight: '800',
    color: '#1D4ED8',
  },
  statLabel: {
    fontSize: 11,
    color: '#64748B',
    marginTop: 2,
    fontWeight: '500',
  },
  statDivider: {
    width: 1,
    height: 28,
    backgroundColor: '#CBD5E1',
  },
  docCard: {
    marginBottom: Spacing.md,
    padding: Spacing.base,
    backgroundColor: '#FFFFFF',
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  titleGroup: {
    flex: 1,
    marginRight: 8,
  },
  cardDivider: {
    height: 1,
    backgroundColor: '#F1F5F9',
    marginVertical: 10,
  },
  metaRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 6,
  },
  metaLabel: {
    fontSize: 12,
    color: '#64748B',
  },
  metaValue: {
    fontSize: 12,
    fontWeight: '600',
    color: '#0F172A',
  },
  metaValueMono: {
    fontSize: 11,
    fontFamily: 'monospace',
    color: '#1D4ED8',
    maxWidth: '65%',
  },
  resultContainer: {
    backgroundColor: '#F8FAFC',
    padding: 8,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    marginTop: 6,
  },
  resultText: {
    fontSize: 11,
    color: '#334155',
    lineHeight: 16,
  },
  detailsButton: {
    marginTop: 12,
    alignSelf: 'flex-end',
    paddingVertical: 4,
  },
  detailsButtonText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#1D4ED8',
  },
  disclaimerBox: {
    marginTop: 12,
    marginBottom: 16,
    paddingHorizontal: 8,
  },
  disclaimerText: {
    fontSize: 11,
    color: '#94A3B8',
    textAlign: 'center',
    lineHeight: 16,
  },
});