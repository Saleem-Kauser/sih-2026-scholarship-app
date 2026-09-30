import type {
    BenefitGapCandidateResponse,
    BenefitGapMatchesResponse,
    BenefitGapSummary,
} from '@/types/benefitGap';

function getBackendUrl(): string {
  return process.env.EXPO_PUBLIC_BACKEND_URL || 'https://jago-backend-3jm7.onrender.com';
}

async function getJson<T>(path: string): Promise<T> {
  const response = await fetch(`${getBackendUrl()}${path}`);
  if (!response.ok) throw new Error(`Coverage service returned HTTP ${response.status}`);
  return response.json() as Promise<T>;
}

export const benefitGapAdapter = {
  getSummary(): Promise<BenefitGapSummary> {
    return getJson('/api/mock/benefit-gap/summary');
  },
  getMatches(): Promise<BenefitGapMatchesResponse> {
    return getJson('/api/mock/benefit-gap/matches');
  },
  getCandidate(id: string): Promise<BenefitGapCandidateResponse> {
    return getJson(`/api/mock/benefit-gap/matches/${encodeURIComponent(id)}`);
  },
};
