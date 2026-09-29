import type { StudentDocument, VerificationResult } from '@/types/verification';
import { getStableDocumentId, type StudentInfo } from '@/utils/applicationStore';
import { digiLockerAdapter } from './digilockerAdapter';
import { eDistrictAdapter } from './edistrictAdapter';

/**
 * Primary Document Verification Engine
 * 
 * DigiLocker Attempt → e-District Fallback → Manual Review Flagging
 */
export class VerificationService {
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
    studentInfo?: StudentInfo
  ): Promise<VerificationResult> {
    const digiLockerResult = await digiLockerAdapter.verifyDocument(documentType, studentInfo);

    if (digiLockerResult.verified && digiLockerResult.status === 'verified') {
      return digiLockerResult;
    }

    const eDistrictResult = await eDistrictAdapter.verifyCertificate(
      documentType,
      studentInfo,
      this.getMockOutcome(documentType, studentInfo)
    );

    if (eDistrictResult.verified && eDistrictResult.status === 'verified') {
      return eDistrictResult;
    }

    return {
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
  }

  public async verifyAllDocuments(
    documentTypes: string[],
    studentInfo?: StudentInfo
  ): Promise<StudentDocument[]> {
    const results: StudentDocument[] = [];

    for (const docType of documentTypes) {
      const res = await this.verifyDocument(docType, studentInfo);
      
      results.push({
        id: getStableDocumentId(docType),
        name: docType,
        type: docType,
        source: res.source,
        uri: res.reference,
        status: res.status,
        verifiedAt: res.verifiedAt,
        extractedData: res.extractedData,
        lastVerificationResult: res.message,
        manualReviewReason: res.failureReason,
        issuingAuthority: res.extractedData?.['Issuer'] || res.extractedData?.['Issuing Officer'] || 'State Authority',
      });
    }

    return results;
  }
}

export const verificationService = new VerificationService();