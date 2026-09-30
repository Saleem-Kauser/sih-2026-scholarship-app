import { useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import { ActivityIndicator, Modal, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { Badge, Button, Card, SectionHeader } from '@/components/ui';
import { SpacingTokens as Spacing, Typography } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';
import { benefitGapAdapter } from '@/services/benefitGap/benefitGapAdapter';
import type { BenefitGapCandidate, BenefitGapSummary } from '@/types/benefitGap';
import { approveDocumentManualReview, getApplications } from '@/utils/applicationStore';
import { setRole } from '@/utils/roleStore';

export default function AdminScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const theme = useTheme();

  const [applications, setApplications] = useState(getApplications());
  const [actionDone, setActionDone] = useState(false);
  const [coverageSummary, setCoverageSummary] = useState<BenefitGapSummary>();
  const [candidates, setCandidates] = useState<BenefitGapCandidate[]>([]);
  const [coverageLoading, setCoverageLoading] = useState(true);
  const [coverageError, setCoverageError] = useState('');
  const [selectedCandidate, setSelectedCandidate] = useState<BenefitGapCandidate>();

  useEffect(() => {
    setRole('admin');
    let mounted = true;
    Promise.all([benefitGapAdapter.getSummary(), benefitGapAdapter.getMatches()])
      .then(([summary, matches]) => {
        if (!mounted) return;
        setCoverageSummary(summary);
        setCandidates(matches.candidates);
      })
      .catch(() => {
        if (mounted) setCoverageError('Synthetic coverage data is unavailable. Check the JAGO backend connection.');
      })
      .finally(() => {
        if (mounted) setCoverageLoading(false);
      });
    return () => { mounted = false; };
  }, []);

  const handleBackPress = () => {
    if (router.canGoBack()) {
      router.back();
      return;
    }

    router.replace('/role-select');
  };

  const statusCounts = applications.reduce<Record<string, number>>((counts, application) => {
    counts[application.status] = (counts[application.status] || 0) + 1;
    return counts;
  }, {});
  const pendingVerificationCount = applications.reduce((count, application) =>
    count + application.documents.filter((document) => document.status === 'pending' || document.status === 'manual_review').length,
  0);
  const schemeCounts = applications.reduce<Record<string, number>>((counts, application) => {
    counts[application.schemeShortName] = (counts[application.schemeShortName] || 0) + 1;
    return counts;
  }, {});
  const outreachCandidates = candidates.filter((candidate) => candidate.status === 'POTENTIAL_UNREACHED');

  const handleApproveDoc = (docId: string) => {
    approveDocumentManualReview(docId);
    setApplications([...getApplications()]);
    setActionDone(true);
  };

  return (
    <View style={[styles.container, { backgroundColor: theme.background }]}>
      <View style={[styles.header, { paddingTop: Math.max(insets.top + 8, 16) }]}>
        <TouchableOpacity
          onPress={handleBackPress}
          style={styles.backButton}
          hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
          activeOpacity={0.7}
        >
          <Text style={styles.backButtonText}>← Back</Text>
        </TouchableOpacity>
        <View style={styles.headerTitleGroup}>
          <Text style={styles.headerTitle}>Ministry Console</Text>
          <Text style={styles.headerSubtitle}>JAGO Scholarship Administration</Text>
        </View>
        <TouchableOpacity onPress={() => router.replace('/role-select')} activeOpacity={0.7}>
          <Text style={styles.roleSwitch}>Switch role</Text>
        </TouchableOpacity>
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
            <Text style={styles.bannerTitle}>Prototype administration workspace</Text>
          <Text style={styles.bannerText}>
            Synthetic demonstration data only. Coverage results are not live government records or confirmed eligibility decisions.
          </Text>
        </Card>

        <SectionHeader title="Ministry Overview" subtitle="Prototype metrics from synthetic data and the local application store" />
        <View style={styles.metricsGrid}>
          <Card variant="outlined" style={styles.metricCard}>
            <Text style={styles.metricValue}>{coverageSummary?.totalEnrolledSTStudents ?? (coverageLoading ? '—' : 0)}</Text>
            <Text style={styles.metricLabel}>Total Students (synthetic)</Text>
          </Card>
          <Card variant="outlined" style={styles.metricCard}>
            <Text style={styles.metricValue}>
              {coverageSummary && coverageSummary.totalEnrolledSTStudents > 0
                ? `${Math.round((coverageSummary.matchedBeneficiaries / coverageSummary.totalEnrolledSTStudents) * 100)}%`
                : '—'}
            </Text>
            <Text style={styles.metricLabel}>Scholarship Coverage (prototype)</Text>
          </Card>
          <Card variant="outlined" style={styles.metricCard}>
            <Text style={styles.metricValue}>{coverageSummary?.potentialUnreached ?? '—'}</Text>
            <Text style={styles.metricLabel}>Potential Unreached</Text>
          </Card>
          <Card variant="outlined" style={styles.metricCard}>
            <Text style={styles.metricValue}>{coverageSummary?.requiresReview ?? '—'}</Text>
            <Text style={styles.metricLabel}>Requires Review</Text>
          </Card>
        </View>

        <Card variant="outlined" style={styles.sectionCard}>
          <SectionHeader title="Application Monitoring" subtitle="Current in-memory prototype application data" marginBottom={Spacing.sm} />
          <Text style={styles.monitorText}>Applications: {applications.length}  •  Documents pending/review: {pendingVerificationCount}</Text>
          {Object.entries(statusCounts).map(([status, count]) => (
            <Text key={status} style={styles.monitorText}>{status.replaceAll('_', ' ')}: {count}</Text>
          ))}
          {Object.entries(schemeCounts).map(([scheme, count]) => (
            <Text key={scheme} style={styles.monitorText}>{scheme}: {count}</Text>
          ))}
        </Card>

        <Card variant="outlined" style={styles.sectionCard}>
          <SectionHeader title="Coverage Gap Identification" subtitle="UDISE+, APAAR, OTR and scholarship registry — synthetic matching only" marginBottom={Spacing.sm} />
          <Text style={styles.prototypeLabel}>Prototype synthetic dataset — not connected to live sources.</Text>
          {coverageLoading ? (
            <View style={styles.loadingRow}><ActivityIndicator color="#1D4ED8" /><Text style={styles.monitorText}>Loading synthetic coverage data…</Text></View>
          ) : coverageError ? (
            <Text style={styles.reviewReason}>{coverageError}</Text>
          ) : coverageSummary ? (
            <>
              <Text style={styles.monitorText}>Enrolled ST students: {coverageSummary.totalEnrolledSTStudents}</Text>
              <Text style={styles.monitorText}>Matched beneficiaries: {coverageSummary.matchedBeneficiaries}</Text>
              <Text style={styles.monitorText}>Potential coverage gaps: {coverageSummary.potentialUnreached}</Text>
              <Text style={styles.monitorText}>Requires review: {coverageSummary.requiresReview}</Text>
            </>
          ) : null}
        </Card>

        <Card variant="outlined" style={styles.sectionCard}>
          <SectionHeader
            title="Outreach Candidates"
            subtitle="Potential gaps only; records require appropriate review/outreach and do not establish eligibility or benefit denial."
            marginBottom={Spacing.sm}
          />
          <Text style={styles.prototypeLabel}>Synthetic prototype records only — not confirmed non-beneficiaries.</Text>
          {coverageLoading ? (
            <View style={styles.loadingRow}>
              <ActivityIndicator color="#1D4ED8" />
              <Text style={styles.monitorText}>Loading synthetic outreach candidates…</Text>
            </View>
          ) : coverageError ? (
            <Text style={styles.reviewReason}>{coverageError}</Text>
          ) : outreachCandidates.length > 0 ? (
            outreachCandidates.map((candidate) => (
              <TouchableOpacity
                key={candidate.id}
                style={styles.candidateRow}
                onPress={() => setSelectedCandidate(candidate)}
                activeOpacity={0.75}
              >
                <View style={styles.candidateMain}>
                  <Text style={styles.docName}>{candidate.studentRef}</Text>
                  <Text style={styles.docMeta}>{candidate.matchedSources.join(' + ')}</Text>
                  <Text style={styles.docMeta} numberOfLines={2}>{candidate.reason}</Text>
                </View>
                <View style={styles.candidateAction}>
                  <Badge label="Potential Gap" variant="warning" size="sm" />
                  <Text style={styles.reviewLink}>Review</Text>
                </View>
              </TouchableOpacity>
            ))
          ) : (
            <Text style={styles.monitorText}>No potential outreach candidates in the current synthetic dataset.</Text>
          )}
        </Card>

        <Card variant="outlined" style={styles.assistantCard}>
          <Text style={styles.assistantTitle}>JAGO Admin Assistant</Text>
          <Text style={styles.assistantDescription}>Ask about aggregate application and synthetic coverage summaries.</Text>
          <Button label="Ask JAGO" onPress={() => router.push('/assistant')} fullWidth />
        </Card>

        <SectionHeader title="Verification Review" subtitle="Manual review actions remain part of the prototype workflow" />

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
          Ministry Console • Local demonstration workflow. No live ministry or government source is connected.
        </Text>
      </ScrollView>

      <Modal visible={Boolean(selectedCandidate)} transparent animationType="fade" onRequestClose={() => setSelectedCandidate(undefined)}>
        <View style={styles.modalBackdrop}>
          <Card variant="outlined" style={styles.modalCard}>
            <Text style={styles.modalTitle}>Synthetic Candidate Review</Text>
            {selectedCandidate && (
              <>
                <Text style={styles.modalText}>Student reference: {selectedCandidate.studentRef}</Text>
                <Text style={styles.modalText}>Status: {selectedCandidate.status}</Text>
                <Text style={styles.modalText}>Matched sources: {selectedCandidate.matchedSources.join(' + ')}</Text>
                <Text style={styles.modalText}>Reason: {selectedCandidate.reason}</Text>
                <Text style={styles.prototypeLabel}>{selectedCandidate.label}</Text>
              </>
            )}
            <Button label="Close" variant="secondary" onPress={() => setSelectedCandidate(undefined)} fullWidth style={{ marginTop: Spacing.md }} />
          </Card>
        </View>
      </Modal>
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
  headerTitleGroup: {
    flex: 1,
    marginHorizontal: 8,
  },
  headerSubtitle: {
    fontSize: 11,
    color: '#64748B',
    marginTop: 2,
  },
  roleSwitch: {
    color: '#1D4ED8',
    fontSize: 12,
    fontWeight: '600',
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
  metricsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 16,
  },
  metricCard: {
    width: '48%',
    flexGrow: 1,
    padding: 12,
    minHeight: 86,
  },
  metricValue: {
    color: '#1D4ED8',
    fontSize: 22,
    fontWeight: '800',
  },
  metricLabel: {
    color: '#475569',
    fontSize: 11,
    marginTop: 4,
  },
  sectionCard: {
    backgroundColor: '#FFFFFF',
    padding: 14,
    marginBottom: 14,
  },
  monitorText: {
    color: '#334155',
    fontSize: 12,
    lineHeight: 18,
    marginBottom: 3,
  },
  prototypeLabel: {
    color: '#64748B',
    fontSize: 11,
    lineHeight: 16,
    marginBottom: 8,
  },
  loadingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingVertical: 10,
  },
  candidateRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 8,
    backgroundColor: '#F8FAFC',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    borderRadius: 6,
    padding: 10,
    marginTop: 8,
  },
  candidateMain: {
    flex: 1,
  },
  candidateAction: {
    alignItems: 'flex-end',
    gap: 4,
  },
  reviewLink: {
    color: '#1D4ED8',
    fontSize: 11,
    fontWeight: '600',
  },
  assistantCard: {
    backgroundColor: '#EFF6FF',
    borderColor: '#BFDBFE',
    padding: 14,
    marginBottom: 16,
  },
  assistantTitle: {
    color: '#1E3A8A',
    fontSize: 15,
    fontWeight: '700',
    marginBottom: 4,
  },
  assistantDescription: {
    color: '#475569',
    fontSize: 12,
    lineHeight: 18,
    marginBottom: 10,
  },
  modalBackdrop: {
    flex: 1,
    justifyContent: 'center',
    backgroundColor: 'rgba(15, 23, 42, 0.45)',
    padding: 20,
  },
  modalCard: {
    backgroundColor: '#FFFFFF',
    padding: 18,
  },
  modalTitle: {
    color: '#0F172A',
    fontSize: 17,
    fontWeight: '700',
    marginBottom: 12,
  },
  modalText: {
    color: '#334155',
    fontSize: 13,
    lineHeight: 19,
    marginBottom: 6,
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