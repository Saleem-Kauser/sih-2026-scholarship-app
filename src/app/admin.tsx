import { useRouter } from 'expo-router';
import { useState } from 'react';
import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { Badge, Card } from '@/components/ui';
import { Typography } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';
import { approveDocumentManualReview, getApplications } from '@/utils/applicationStore';

export default function AdminScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const theme = useTheme();

  const [applications, setApplications] = useState(getApplications());
  const [actionDone, setActionDone] = useState(false);

  const handleApproveDoc = (docId: string) => {
    approveDocumentManualReview(docId);
    setApplications([...getApplications()]);
    setActionDone(true);
  };

  return (
    <View style={[styles.container, { backgroundColor: theme.background }]}>
      <View style={[styles.header, { paddingTop: Math.max(insets.top + 8, 16) }]}>
        <TouchableOpacity
          onPress={() => router.back()}
          style={styles.backButton}
          hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
          activeOpacity={0.7}
        >
          <Text style={styles.backButtonText}>← Back</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>District Verifier Portal (Demo)</Text>
        <View style={styles.headerSpacer} />
      </View>

      <ScrollView
        style={styles.content}
        contentContainerStyle={[
          styles.scrollContent,
          { paddingBottom: Math.max(insets.bottom + 24, 32) },
        ]}
        showsVerticalScrollIndicator={false}
      >
        <Card variant="outlined" style={styles.bannerCard}>
          <Text style={styles.bannerTitle}>SIH 2026 Verifier Dashboard</Text>
          <Text style={styles.bannerText}>
            Demonstrates how institutional/district officers review automated verification flags and approve manual review queue items.
          </Text>
        </Card>

        {actionDone && (
          <View style={styles.successBanner}>
            <Text style={styles.successText}>
              ✓ Document approved successfully! Application status updated in JAGO store.
            </Text>
          </View>
        )}

        {applications.map((app) => (
          <Card key={app.id} variant="outlined" style={styles.appCard}>
            <View style={styles.appHeaderRow}>
              <View>
                <Text style={[Typography.bodyBold, { color: theme.text }]}>
                  Application #{app.id}
                </Text>
                <Text style={[Typography.small, { color: theme.textSecondary }]}>
                  Student: <Text style={{ fontWeight: '700', color: theme.text }}>{app.studentName}</Text>
                </Text>
              </View>

              <Badge label="Under Verification" variant="info" size="sm" />
            </View>

            <Text style={[Typography.small, { color: theme.textSecondary, marginTop: 4 }]}>
              Scheme: {app.schemeShortName}
            </Text>

            <View style={styles.divider} />

            <Text style={styles.docHeader}>Documents Verification Matrix:</Text>

            {app.documents.map((doc) => (
              <View key={doc.id} style={styles.docRow}>
                <View style={styles.docInfo}>
                  <Text style={styles.docName}>{doc.name}</Text>
                  <Text style={styles.docMeta}>
                    Source: <Text style={{ fontWeight: '600' }}>{doc.source}</Text> • Ref: {doc.uri}
                  </Text>
                  {doc.manualReviewReason && (
                    <Text style={styles.reviewReason}>
                      Flag Reason: {doc.manualReviewReason}
                    </Text>
                  )}
                </View>

                <View style={styles.docActionColumn}>
                  <Badge
                    label={doc.status === 'verified' ? 'Auto-Verified' : 'Manual Review'}
                    variant={doc.status === 'verified' ? 'success' : 'warning'}
                    size="sm"
                  />

                  {doc.status === 'manual_review' && (
                    <TouchableOpacity
                      style={styles.approveButton}
                      onPress={() => handleApproveDoc(doc.id)}
                      activeOpacity={0.8}
                    >
                      <Text style={styles.approveButtonText}>Approve Review</Text>
                    </TouchableOpacity>
                  )}
                </View>
              </View>
            ))}

            <View style={styles.divider} />

            <Text style={[Typography.xs, { color: theme.textSecondary }]}>
              Action Item: {app.pendingAction || 'No pending action'}
            </Text>
          </Card>
        ))}

        <Text style={styles.disclaimerText}>
          Prototype Verifier Portal • Demonstrates district officer workflow for SIH 2026.
        </Text>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8FAFC',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingBottom: 14,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  backButton: {
    paddingVertical: 4,
    paddingRight: 8,
  },
  backButtonText: {
    fontSize: 15,
    fontWeight: '600',
    color: '#1D4ED8',
  },
  headerTitle: {
    fontSize: 17,
    fontWeight: '700',
    color: '#0F172A',
  },
  headerSpacer: {
    width: 50,
  },
  content: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 16,
    paddingTop: 16,
  },
  bannerCard: {
    backgroundColor: '#1E40AF',
    borderColor: '#1D4ED8',
    padding: 16,
    marginBottom: 16,
  },
  bannerTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: '#FFFFFF',
    marginBottom: 4,
  },
  bannerText: {
    fontSize: 12,
    color: '#DBEAFE',
    lineHeight: 18,
  },
  successBanner: {
    backgroundColor: '#F0FDF4',
    borderWidth: 1,
    borderColor: '#BBF7D0',
    padding: 12,
    borderRadius: 8,
    marginBottom: 16,
  },
  successText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#15803D',
  },
  appCard: {
    backgroundColor: '#FFFFFF',
    padding: 16,
    marginBottom: 16,
  },
  appHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  divider: {
    height: 1,
    backgroundColor: '#F1F5F9',
    marginVertical: 12,
  },
  docHeader: {
    fontSize: 12,
    fontWeight: '700',
    color: '#64748B',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: 8,
  },
  docRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    backgroundColor: '#F8FAFC',
    padding: 10,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    marginBottom: 8,
  },
  docInfo: {
    flex: 1,
    marginRight: 8,
  },
  docName: {
    fontSize: 13,
    fontWeight: '700',
    color: '#0F172A',
  },
  docMeta: {
    fontSize: 11,
    color: '#64748B',
    marginTop: 2,
  },
  reviewReason: {
    fontSize: 11,
    color: '#B45309',
    marginTop: 4,
    fontWeight: '500',
  },
  docActionColumn: {
    alignItems: 'flex-end',
    gap: 6,
  },
  approveButton: {
    backgroundColor: '#15803D',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 4,
  },
  approveButtonText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  disclaimerText: {
    fontSize: 11,
    color: '#94A3B8',
    textAlign: 'center',
    lineHeight: 16,
    marginTop: 8,
  },
});