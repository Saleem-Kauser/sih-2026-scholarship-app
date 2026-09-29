import { useLocalSearchParams, useRouter } from 'expo-router';
import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { Badge, Button, Card, EmptyState } from '@/components/ui';
import { SpacingTokens as Spacing, Typography } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';
import { getStudentDocuments } from '@/utils/applicationStore';

export default function DocumentDetailScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const theme = useTheme();
  const { docId } = useLocalSearchParams<{ docId?: string }>();

  const documents = getStudentDocuments();
  const doc = documents.find((d) => d.id === docId);

  if (!doc) {
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
          <Text style={styles.headerTitle}>Verification Audit Detail</Text>
          <View style={styles.headerSpacer} />
        </View>
        <EmptyState
          title="Document not found"
          description="This document is no longer available in the JAGO wallet."
          actionLabel="Back to Document Wallet"
          onActionPress={() => router.back()}
        />
      </View>
    );
  }

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
        <Text style={styles.headerTitle}>Verification Audit Detail</Text>
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
        <Card variant="outlined" style={styles.mainCard}>
          <View style={styles.badgeRow}>
            <Badge
              label={doc.status === 'verified' ? 'Auto-Verified' : 'Manual Review'}
              variant={doc.status === 'verified' ? 'success' : 'warning'}
              size="sm"
            />
            <View style={styles.sourceTag}>
              <Text style={styles.sourceTagText}>{doc.source}</Text>
            </View>
          </View>

          <Text style={[Typography.h5, { color: theme.text, marginTop: Spacing.sm }]}>
            {doc.name}
          </Text>
          <Text style={[Typography.small, { color: theme.textSecondary, marginTop: 2 }]}>
            {doc.type}
          </Text>

          <View style={styles.divider} />

          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Issuing Authority</Text>
            <Text style={styles.infoValue}>{doc.issuingAuthority}</Text>
          </View>

          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Document Reference URI</Text>
            <Text style={styles.infoValueMono}>{doc.uri}</Text>
          </View>

          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Verification Date</Text>
            <Text style={styles.infoValue}>{doc.verifiedAt}</Text>
          </View>

          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Expiry / Validity</Text>
            <Text style={styles.infoValue}>{doc.expiryDate || 'Lifetime'}</Text>
          </View>
        </Card>

        <Card variant="outlined" style={styles.card}>
          <Text style={styles.sectionTitle}>Verification Method & Outcome</Text>

          <View style={styles.detailBox}>
            <Text style={styles.detailLabel}>Verification Result Message:</Text>
            <Text style={styles.detailText}>{doc.lastVerificationResult}</Text>
          </View>

          {doc.manualReviewReason && (
            <View style={[styles.detailBox, styles.warningBox]}>
              <Text style={[styles.detailLabel, { color: '#B45309' }]}>
                Reason for Manual Review:
              </Text>
              <Text style={[styles.detailText, { color: '#78350F' }]}>
                {doc.manualReviewReason}
              </Text>
            </View>
          )}
        </Card>

        <View style={styles.actionContainer}>
          {doc.status === 'manual_review' && (
            <Button
              label="Open Verifier Admin Dashboard (Demo)"
              onPress={() => router.push('/admin')}
              fullWidth
              style={{ marginBottom: Spacing.sm }}
            />
          )}

          <Button
            label="Back to Document Wallet"
            variant="secondary"
            onPress={() => router.back()}
            fullWidth
          />
        </View>

        <Text style={styles.disclaimerText}>
          JAGO Automated Document Verification Architecture • API Setu & e-District Sandbox Engine
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
  mainCard: {
    backgroundColor: '#FFFFFF',
    padding: 16,
    marginBottom: 12,
  },
  badgeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  sourceTag: {
    backgroundColor: '#F1F5F9',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 4,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  sourceTagText: {
    fontSize: 11,
    fontWeight: '600',
    color: '#475569',
  },
  divider: {
    height: 1,
    backgroundColor: '#F1F5F9',
    marginVertical: 12,
  },
  infoRow: {
    marginBottom: 10,
  },
  infoLabel: {
    fontSize: 11,
    fontWeight: '600',
    color: '#64748B',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: 2,
  },
  infoValue: {
    fontSize: 14,
    fontWeight: '500',
    color: '#0F172A',
  },
  infoValueMono: {
    fontSize: 12,
    fontFamily: 'monospace',
    color: '#1D4ED8',
  },
  card: {
    backgroundColor: '#FFFFFF',
    padding: 16,
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: '#0F172A',
    marginBottom: 12,
  },
  detailBox: {
    backgroundColor: '#F8FAFC',
    padding: 12,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    marginBottom: 8,
  },
  warningBox: {
    backgroundColor: '#FFFBEB',
    borderColor: '#FDE68A',
  },
  detailLabel: {
    fontSize: 12,
    fontWeight: '700',
    color: '#334155',
    marginBottom: 4,
  },
  detailText: {
    fontSize: 13,
    color: '#475569',
    lineHeight: 18,
  },
  actionContainer: {
    marginTop: 8,
    marginBottom: 16,
  },
  disclaimerText: {
    fontSize: 11,
    color: '#94A3B8',
    textAlign: 'center',
    lineHeight: 16,
  },
});