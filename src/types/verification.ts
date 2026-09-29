/**
 * Verification & Document Data Models
 * JAGO SIH 2026 Prototype
 */

export type VerificationStatus = 'verified' | 'failed' | 'manual_review' | 'pending';

export type VerificationStageName =
  | 'document_fetch'
  | 'document_found'
  | 'certificate_data'
  | 'data_extraction'
  | 'data_comparison'
  | 'outcome';

export type VerificationStageStatus = 'pending' | 'in_progress' | 'success' | 'failed';

export interface VerificationStage {
  stage: VerificationStageName;
  status: VerificationStageStatus;
  detail?: string;
}

export interface VerificationStageUpdate {
  documentType: string;
  stage: VerificationStageName;
  status: VerificationStageStatus;
  detail?: string;
}

export type DocumentSource = 'DigiLocker' | 'DigiLocker Sandbox' | 'e-District Sandbox' | 'Manual Upload';

export interface VerificationResult {
  verified: boolean;
  status: VerificationStatus;
  source: DocumentSource;
  documentType: string;
  documentName: string;
  message: string;
  reference: string;
  verifiedAt: string;
  needsManualReview: boolean;
  stages?: VerificationStage[];
  extractedData?: Record<string, string>;
  failureReason?: string;
}

export interface StudentDocument {
  id: string;
  name: string;
  type: string;
  source: DocumentSource;
  uri: string;
  status: VerificationStatus;
  verifiedAt: string;
  expiryDate?: string;
  extractedData?: Record<string, string>;
  stages?: VerificationStage[];
  lastVerificationResult?: string;
  manualReviewReason?: string;
  issuingAuthority: string;
}

export interface ScholarshipApplicationItem {
  id: string;
  schemeId: string;
  schemeName: string;
  schemeShortName: string;
  appliedDate: string;
  status: 'submitted' | 'under_verification' | 'action_required' | 'sanction_pending' | 'sanctioned' | 'disbursed' | 'rejected';
  studentName: string;
  documents: StudentDocument[];
  pendingAction?: string;
  disbursementStatus?: string;
  sanctionAmount?: string;
}