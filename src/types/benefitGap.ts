export type BenefitGapStatus = 'MATCHED' | 'POTENTIAL_UNREACHED' | 'REQUIRES_REVIEW';

export interface BenefitGapSummary {
  totalEnrolledSTStudents: number;
  matchedBeneficiaries: number;
  potentialUnreached: number;
  requiresReview: number;
  label: string;
  source?: 'synthetic-mock-prototype';
}

export interface BenefitGapCandidate {
  id: string;
  studentRef: string;
  status: BenefitGapStatus;
  matchedSources: string[];
  reason: string;
  label: string;
}

export interface BenefitGapMatchesResponse {
  summary: BenefitGapSummary;
  candidates: BenefitGapCandidate[];
  source: 'synthetic-mock-prototype';
  label: string;
}

export interface BenefitGapCandidateResponse {
  candidate: BenefitGapCandidate;
  source: 'synthetic-mock-prototype';
  label: string;
}
