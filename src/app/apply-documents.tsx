import { useLocalSearchParams, useRouter } from 'expo-router';
import { useState } from 'react';
import { ActivityIndicator, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { Badge, Button, Card, ScreenHeader, SectionHeader } from '@/components/ui';
import { SpacingTokens as Spacing, Typography } from '@/constants/theme';
import { scholarshipSchemes } from '@/data/scholarships';
import { useTheme } from '@/hooks/use-theme';
import { verificationService } from '@/services/verification/verificationService';
import type { StudentDocument, VerificationStage, VerificationStageUpdate } from '@/types/verification';
import { addApplication, createApplicationId, getSchemeId, getStudentInfo, upsertStudentDocuments } from '@/utils/applicationStore';

const VERIFICATION_STAGE_LABELS: Record<VerificationStage['stage'], string> = {
  document_fetch: 'Fetching issued documents',
  document_found: 'Locating required certificate',
  certificate_data: 'Retrieving certificate data',
  data_extraction: 'Extracting certificate fields',
  data_comparison: 'Comparing with application',
  outcome: 'Verification result',
};

const INITIAL_VERIFICATION_STAGES: VerificationStage[] = Object.keys(VERIFICATION_STAGE_LABELS).map((stage) => ({
  stage: stage as VerificationStage['stage'],
  status: 'pending',
}));

export default function ApplyDocumentsScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const theme = useTheme();

  const { schemeId: paramSchemeId } = useLocalSearchParams<{ schemeId?: string }>();
  const activeSchemeId = paramSchemeId || getSchemeId() || 'post-matric-st';
  const scheme = scholarshipSchemes.find((s) => s.id === activeSchemeId);

  const studentInfo = getStudentInfo();

  const [verifying, setVerifying] = useState(false);
  const [verifiedDocs, setVerifiedDocs] = useState<StudentDocument[]>([]);
  const [hasVerified, setHasVerified] = useState(false);
  const [activeDocumentType, setActiveDocumentType] = useState<string>();
  const [verificationStages, setVerificationStages] = useState<VerificationStage[]>(INITIAL_VERIFICATION_STAGES);

  const requiredDocTypes = scheme?.requiredDocuments || [
    'ST Community / Caste Certificate',
    'Annual Income Certificate',
    'Domicile Certificate',
  ];
  const documentGuidance = scheme?.documentGuidance;

  const handleStartVerification = async () => {
    setVerifying(true);
    setHasVerified(false);
    setActiveDocumentType(requiredDocTypes[0]);
    setVerificationStages(INITIAL_VERIFICATION_STAGES);

    const handleStageUpdate = (update: VerificationStageUpdate) => {
      if (update.stage === 'document_fetch' && update.status === 'in_progress') {
        setActiveDocumentType(update.documentType);
        setVerificationStages(INITIAL_VERIFICATION_STAGES);
      }

      setVerificationStages((currentStages) => currentStages.map((stage) =>
        stage.stage === update.stage
          ? { ...stage, status: update.status, detail: update.detail }
          : stage
      ));
    };

    try {
      const results = await verificationService.verifyAllDocuments(requiredDocTypes, studentInfo, handleStageUpdate);
      upsertStudentDocuments(results);
      setVerifiedDocs(results);
      setHasVerified(true);
    } catch (err) {
      console.error('Verification error:', err);
    } finally {
      setVerifying(false);
    }
  };

  const handleSubmitApplication = () => {
    const newAppId = createApplicationId();
    const currentDate = new Date().toLocaleDateString('en-GB', {
      day: '2-digit',
      month: 'long',
      year: 'numeric',
    });

    const hasManualReview = verifiedDocs.some((d) => d.status === 'manual_review');

    addApplication({
      id: newAppId,
      schemeId: scheme?.id || 'post-matric-st',
      schemeName: scheme?.name || 'Post-Matric Scholarship Scheme for ST Students',
      schemeShortName: scheme?.shortName || 'Post-Matric Scholarship',
      appliedDate: currentDate,
      status: 'under_verification',
      studentName: studentInfo?.fullName || 'Student Applicant',
      documents: verifiedDocs.length > 0 ? verifiedDocs : [],
      pendingAction: hasManualReview
        ? 'Domicile Certificate flagged for manual verifier review.'
        : 'All documents auto-verified. Under district approval.',
      disbursementStatus: 'Pending Verification',
      sanctionAmount: 'As per scheme guidelines',
    });

    router.push('/scholarship');
  };

  return (
    <View style={[styles.container, { backgroundColor: theme.background }]}>
      <ScreenHeader title="Document Selection & Verification" />

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={[
          styles.scrollContent,
          { paddingBottom: Math.max(insets.bottom + Spacing.base, Spacing.lg) },
        ]}
        showsVerticalScrollIndicator={false}
      >
        <Card style={styles.summaryCard}>
          <Text style={[Typography.h6, { color: theme.text, marginBottom: 4 }]}>
            {scheme?.shortName || 'Scholarship Application'}
          </Text>
          <Text style={[Typography.small, { color: theme.textSecondary }]}>
            Student: <Text style={{ fontWeight: '600', color: theme.text }}>{studentInfo?.fullName || 'Student'}</Text>
          </Text>
        </Card>

        <SectionHeader
          title="Automated Verification Architecture"
          subtitle="JAGO checks DigiLocker first, then the e-District mock/sandbox fallback"
          marginBottom={Spacing.md}
        />

        <Card variant="outlined" style={styles.archCard}>
          <Text style={styles.archFlowTitle}>Verification Logic Flow:</Text>
          <Text style={styles.archFlowText}>
            1. <Text style={{ fontWeight: '700' }}>DigiLocker Attempt</Text> → Auto-Verify on XML match{'\n'}
            2. <Text style={{ fontWeight: '700' }}>e-District Fallback</Text> → Secondary verification check{'\n'}
            3. <Text style={{ fontWeight: '700' }}>Manual Review</Text> → If automated match fails (No automatic rejection)
          </Text>
        </Card>

        <SectionHeader
          title="Required Scheme Documents"
          subtitle="Click below to run automated verification"
          marginBottom={Spacing.md}
        />

        {!hasVerified ? (
          <View style={styles.pendingDocContainer}>
            {requiredDocTypes.map((docName, idx) => (
              <Card key={idx} variant="outlined" style={styles.docItemCard}>
                <View style={styles.docRow}>
                  <Text style={[Typography.bodyBold, { color: theme.text, flex: 1 }]}>
                    {docName}
                  </Text>
                  <Badge label="Pending Verification" variant="warning" size="sm" />
                </View>
                <Text style={[Typography.xs, { color: theme.textSecondary, marginTop: 4 }]}>
                  Will be checked against DigiLocker Sandbox & e-District mock
                </Text>
              </Card>
            ))}

            {documentGuidance && (
              <Text style={[Typography.xs, styles.guidanceText]}>
                {documentGuidance}
              </Text>
            )}

            {verifying && (
              <Card variant="outlined" style={styles.progressCard}>
                <Text style={[Typography.bodyBold, { color: theme.text }]}>
                  Verification in progress
                </Text>
                <Text style={[Typography.xs, { color: theme.textSecondary, marginTop: 4 }]}>
                  Current document: {activeDocumentType || 'Required document'}
                </Text>
                <View style={styles.stageList}>
                  {verificationStages.map((stage) => (
                    <View key={stage.stage} style={styles.stageRow}>
                      <Text style={[
                        styles.stageMarker,
                        stage.status === 'success' && styles.stageSuccess,
                        stage.status === 'failed' && styles.stageFailed,
                        stage.status === 'in_progress' && styles.stageInProgress,
                      ]}>
                        {stage.status === 'success' ? '✓' : stage.status === 'failed' ? '!' : stage.status === 'in_progress' ? '…' : '○'}
                      </Text>
                      <Text style={[Typography.small, { color: theme.text, flex: 1 }]}>
                        {VERIFICATION_STAGE_LABELS[stage.stage]}
                      </Text>
                      <Text style={[Typography.xs, { color: theme.textSecondary }]}>
                        {stage.status === 'in_progress'
                          ? 'Fetching / verifying'
                          : stage.status === 'success'
                          ? 'Complete'
                          : stage.status === 'failed'
                          ? 'Manual review'
                          : 'Pending'}
                      </Text>
                    </View>
                  ))}
                </View>
              </Card>
            )}

            <Button
              label={verifying ? 'Running Automated Verification...' : 'Fetch & Verify via DigiLocker / e-District'}
              onPress={handleStartVerification}
              disabled={verifying}
              fullWidth
              style={{ marginTop: Spacing.md }}
            />
            {verifying && (
              <View style={styles.loadingRow}>
                <ActivityIndicator size="small" color="#1D4ED8" />
                <Text style={styles.loadingText}>Connecting to DigiLocker API Setu Sandbox...</Text>
              </View>
            )}
          </View>
        ) : (
          <View style={styles.verifiedDocContainer}>
            {verifiedDocs.map((doc) => (
              <Card key={doc.id} variant="outlined" style={styles.docItemCard}>
                <View style={styles.docRow}>
                  <Text style={[Typography.bodyBold, { color: theme.text, flex: 1 }]}>
                    {doc.name}
                  </Text>
                  <Badge
                    label={doc.status === 'verified' ? 'Auto-Verified' : 'Manual Review'}
                    variant={doc.status === 'verified' ? 'success' : 'warning'}
                    size="sm"
                  />
                </View>
                <Text style={[Typography.xs, { color: theme.textSecondary, marginTop: 4 }]}>
                  Source: <Text style={{ fontWeight: '600', color: theme.text }}>{doc.source}</Text> • Ref: {doc.uri}
                </Text>
                <Text style={[Typography.xs, { color: doc.status === 'verified' ? '#15803D' : '#B45309', marginTop: 4 }]}>
                  {doc.lastVerificationResult}
                </Text>
                {doc.stages && (
                  <View style={styles.resultStages}>
                    {doc.stages.map((stage) => (
                      <Text key={stage.stage} style={styles.resultStageText}>
                        {VERIFICATION_STAGE_LABELS[stage.stage]}: {stage.status === 'success' ? 'complete' : stage.status === 'failed' ? 'manual review' : 'pending'}
                      </Text>
                    ))}
                  </View>
                )}
              </Card>
            ))}

            <View style={styles.actionContainer}>
              <Button
                label="Submit Application & Track Status"
                onPress={handleSubmitApplication}
                fullWidth
                style={{ marginBottom: Spacing.sm }}
              />

              <Button
                label="Re-run Verification"
                variant="secondary"
                onPress={handleStartVerification}
                fullWidth
              />
            </View>
          </View>
        )}
      </ScrollView>
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
    marginBottom: Spacing.md,
    padding: Spacing.base,
  },
  archCard: {
    marginBottom: Spacing.lg,
    padding: Spacing.base,
    backgroundColor: '#EFF6FF',
    borderColor: '#BFDBFE',
  },
  archFlowTitle: {
    fontSize: 13,
    fontWeight: '700',
    color: '#1E40AF',
    marginBottom: 4,
  },
  archFlowText: {
    fontSize: 12,
    color: '#1E3A8A',
    lineHeight: 18,
  },
  pendingDocContainer: {
    marginBottom: Spacing.lg,
  },
  verifiedDocContainer: {
    marginBottom: Spacing.lg,
  },
  docItemCard: {
    marginBottom: Spacing.sm,
    padding: Spacing.md,
    backgroundColor: '#FFFFFF',
  },
  docRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  guidanceText: {
    color: '#64748B',
    lineHeight: 16,
    marginBottom: Spacing.sm,
  },
  progressCard: {
    marginBottom: Spacing.md,
    padding: Spacing.md,
    backgroundColor: '#F8FAFC',
  },
  stageList: {
    marginTop: Spacing.sm,
    gap: 6,
  },
  stageRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  stageMarker: {
    width: 18,
    textAlign: 'center',
    color: '#94A3B8',
    fontWeight: '700',
  },
  stageSuccess: {
    color: '#15803D',
  },
  stageFailed: {
    color: '#B45309',
  },
  stageInProgress: {
    color: '#1D4ED8',
  },
  resultStages: {
    marginTop: 6,
    paddingTop: 6,
    borderTopWidth: 1,
    borderTopColor: '#E2E8F0',
  },
  resultStageText: {
    fontSize: 11,
    lineHeight: 16,
    color: '#64748B',
  },
  loadingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 12,
    gap: 8,
  },
  loadingText: {
    fontSize: 12,
    color: '#1D4ED8',
    fontWeight: '500',
  },
  actionContainer: {
    marginTop: Spacing.base,
  },
});