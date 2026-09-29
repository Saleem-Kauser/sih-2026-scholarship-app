import type {
    StudentDocument,
    VerificationResult,
    VerificationStage,
    VerificationStageName,
    VerificationStageStatus,
    VerificationStageUpdate,
} from '@/types/verification';
import { getStableDocumentId, type StudentInfo } from '@/utils/applicationStore';
import { digiLockerAdapter } from './digilockerAdapter';
import { eDistrictAdapter } from './edistrictAdapter';

/**
 * Primary Document Verification Engine
 * 
 * DigiLocker Attempt → e-District Fallback → Manual Review Flagging
 */
export class VerificationService {
  private readonly stageNames: VerificationStageName[] = [
    'document_fetch',
    'document_found',
    'certificate_data',
    'data_extraction',
    'data_comparison',
    'outcome',
  ];

  private createPendingStages(): VerificationStage[] {
    return this.stageNames.map((stage) => ({ stage, status: 'pending' }));
  }

  private withStages(result: VerificationResult): VerificationResult {
    const stages = this.createPendingStages();
    const failedStage: VerificationStageName = result.failureReason?.toLowerCase().includes('document')
      ? 'document_found'
      : result.failureReason?.toLowerCase().includes('xml')
      ? 'certificate_data'
      : result.failureReason?.toLowerCase().includes('name') || result.failureReason?.toLowerCase().includes('match')
      ? 'data_comparison'
      : 'document_fetch';
    const failedIndex = this.stageNames.indexOf(failedStage);

    stages.forEach((stage, index) => {
      stage.status = result.verified
        ? 'success'
        : index < failedIndex
        ? 'success'
        : index === failedIndex
        ? 'failed'
        : 'pending';
    });

    return { ...result, stages };
  }

  private emitStage(
    documentType: string,
    stage: VerificationStageName,
    status: VerificationStageStatus,
    onStageUpdate?: (update: VerificationStageUpdate) => void,
    detail?: string
  ) {
    onStageUpdate?.({ documentType, stage, status, detail });
  }

  private getMockOutcome(
    documentType: string,
    studentInfo?: StudentInfo
  ): 'SUCCESS' | 'MISMATCH' | 'FAILURE' {
    if (!studentInfo?.fullName || !studentInfo.state) return 'FAILURE';
    if (documentType.toLowerCase().includes('domicile')) return 'MISMATCH';
    if (documentType.toLowerCase().includes('caste') || documentType.toLowerCase().includes('community')) {
      return studentInfo.stStatus.toLowerCase().includes('scheduled') ? 'SUCCESS' : 'MISMATCH';
    }
    if (documentType.toLowerCase().includes('income')) return 'SUCCESS';
    return 'FAILURE';
  }

  public async verifyDocument(
    documentType: string,
    studentInfo?: StudentInfo,
    onStageUpdate?: (update: VerificationStageUpdate) => void
  ): Promise<VerificationResult> {
    this.emitStage(documentType, 'document_fetch', 'in_progress', onStageUpdate, 'Requesting issued document records');
    const digiLockerResult = await digiLockerAdapter.verifyDocument(documentType, studentInfo);

    if (digiLockerResult.verified && digiLockerResult.status === 'verified') {
      for (const stage of this.stageNames.slice(0, -1)) {
        this.emitStage(documentType, stage, 'success', onStageUpdate);
      }
      this.emitStage(documentType, 'outcome', 'success', onStageUpdate, 'Auto-verified');
      return this.withStages(digiLockerResult);
    }

    this.emitStage(documentType, 'document_fetch', 'failed', onStageUpdate, 'DigiLocker unavailable or unresolved; using e-District mock fallback');
    this.emitStage(documentType, 'document_found', 'in_progress', onStageUpdate, 'Checking e-District mock record');

    const eDistrictResult = await eDistrictAdapter.verifyCertificate(
      documentType,
      studentInfo,
      this.getMockOutcome(documentType, studentInfo)
    );

    if (eDistrictResult.verified && eDistrictResult.status === 'verified') {
      for (const stage of this.stageNames.slice(1, -1)) {
        this.emitStage(documentType, stage, 'success', onStageUpdate);
      }
      this.emitStage(documentType, 'outcome', 'success', onStageUpdate, 'Auto-verified via e-District mock');
      return this.withStages(eDistrictResult);
    }

    const manualReviewResult: VerificationResult = {
      verified: false,
      status: 'manual_review',
      source: 'e-District Sandbox',
      documentType,
      documentName: documentType,
      message: 'Automated verification could not establish a valid match. Document routed for manual verifier review.',
      reference: eDistrictResult.reference || `REF-PENDING-${Date.now()}`,
      verifiedAt: new Date().toLocaleDateString('en-GB'),
      needsManualReview: true,
      failureReason: eDistrictResult.failureReason || 'Automated verification threshold not met',
    };
    this.emitStage(documentType, 'document_found', 'failed', onStageUpdate, 'No automated match established');
    this.emitStage(documentType, 'outcome', 'failed', onStageUpdate, 'Manual review required');
    return this.withStages(manualReviewResult);
  }

  public async verifyAllDocuments(
    documentTypes: string[],
    studentInfo?: StudentInfo,
    onStageUpdate?: (update: VerificationStageUpdate) => void
  ): Promise<StudentDocument[]> {
    const results: StudentDocument[] = [];

    for (const docType of documentTypes) {
      const res = await this.verifyDocument(docType, studentInfo, onStageUpdate);
      
      results.push({
        id: getStableDocumentId(docType),
        name: docType,
        type: docType,
        source: res.source,
        uri: res.reference,
        status: res.status,
        verifiedAt: res.verifiedAt,
        extractedData: res.extractedData,
        stages: res.stages,
        lastVerificationResult: res.message,
        manualReviewReason: res.failureReason,
        issuingAuthority: res.extractedData?.['Issuer'] || res.extractedData?.['Issuing Officer'] || 'State Authority',
      });
    }

    return results;
  }
}

export const verificationService = new VerificationService();