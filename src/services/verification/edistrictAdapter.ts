import type { VerificationResult } from '@/types/verification';
import type { StudentInfo } from '@/utils/applicationStore';

/**
 * e-District Verification Adapter (Simulated Secondary Service)
 */
export class EDistrictAdapter {
  public async verifyCertificate(
    documentType: string,
    studentInfo?: StudentInfo,
    simulatedOutcome: 'SUCCESS' | 'MISMATCH' | 'FAILURE' = 'SUCCESS'
  ): Promise<VerificationResult> {
    await new Promise((resolve) => setTimeout(resolve, 900));

    const currentDate = new Date().toLocaleDateString('en-GB', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
    });

    const certRef = `in.gov.edistrict.${documentType.replace(/\s+/g, '').toUpperCase()}-2026-${Math.floor(100000 + Math.random() * 900000)}`;

    if (documentType.toLowerCase().includes('income')) {
      if (simulatedOutcome === 'SUCCESS') {
        return {
          verified: true,
          status: 'verified',
          source: 'e-District Sandbox',
          documentType: 'Income Certificate',
          documentName: 'Annual Income Certificate',
          message: 'Income certificate verified through e-District state repository sandbox.',
          reference: certRef,
          verifiedAt: currentDate,
          needsManualReview: false,
          extractedData: {
            'Annual Family Income': '₹ 1,80,000 / annum',
            'Income Ceiling Compliant': 'Yes (Within prescribed ST ceiling)',
            'Issuing Officer': 'Tehsildar / Sub-Divisional Magistrate',
            'Verification Node': 'e-District State Database Sandbox',
          },
        };
      }
    }

    if (documentType.toLowerCase().includes('domicile') && simulatedOutcome !== 'SUCCESS') {
      return {
        verified: false,
        status: 'manual_review',
        source: 'e-District Sandbox',
        documentType: 'Domicile Certificate',
        documentName: 'Domicile Certificate',
        message: simulatedOutcome === 'MISMATCH'
          ? 'e-District mock found an address mismatch. Document flagged for manual review.'
          : 'e-District mock could not complete the address check. Document flagged for manual review.',
        reference: certRef,
        verifiedAt: currentDate,
        needsManualReview: true,
        failureReason: simulatedOutcome === 'MISMATCH'
          ? 'Address string fuzzy match confidence below the auto-approval threshold.'
          : 'e-District mock lookup failed before address matching completed.',
        extractedData: {
          'State': studentInfo?.state || 'Jharkhand',
          'District': 'Ranchi',
          'Match Score': '82% (Fuzzy Match)',
          'Recommended Action': 'Manual Verification by District Nodal Officer',
        },
      };
    }

    return {
      verified: simulatedOutcome === 'SUCCESS',
      status: simulatedOutcome === 'SUCCESS' ? 'verified' : 'manual_review',
      source: 'e-District Sandbox',
      documentType,
      documentName: documentType,
      message:
        simulatedOutcome === 'SUCCESS'
          ? 'Verified via e-District Sandbox'
          : 'Automated match uncertain. Routed to verifier dashboard.',
      reference: certRef,
      verifiedAt: currentDate,
      needsManualReview: simulatedOutcome !== 'SUCCESS',
      failureReason: simulatedOutcome !== 'SUCCESS' ? 'Field validation mismatch' : undefined,
    };
  }
}

export const eDistrictAdapter = new EDistrictAdapter();