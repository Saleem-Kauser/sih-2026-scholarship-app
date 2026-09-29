import type { ScholarshipApplicationItem, StudentDocument } from '@/types/verification';

/**
 * Initial Student Document Wallet Demo Data
 */
export const initialStudentDocuments: StudentDocument[] = [
  {
    id: 'doc-st-001',
    name: 'ST Community Certificate',
    type: 'ST Certificate',
    source: 'DigiLocker',
    uri: 'in.gov.digilocker.STCERT-2024-998811',
    status: 'verified',
    verifiedAt: '24 Sep 2026',
    expiryDate: 'Lifetime',
    lastVerificationResult: 'Auto-verified via DigiLocker API Setu sandbox (Name & ST category matched)',
    issuingAuthority: 'Revenue Department / District Magistrate',
  },
  {
    id: 'doc-inc-002',
    name: 'Annual Income Certificate',
    type: 'Income Certificate',
    source: 'e-District Sandbox',
    uri: 'in.gov.edistrict.INC-2026-445522',
    status: 'verified',
    verifiedAt: '24 Sep 2026',
    expiryDate: '31 Mar 2027',
    lastVerificationResult: 'Auto-verified via e-District Sandbox (Family income verified within scheme cap)',
    issuingAuthority: 'Tehsildar / Sub-Divisional Magistrate',
  },
  {
    id: 'doc-dom-003',
    name: 'Domicile Certificate',
    type: 'Domicile Certificate',
    source: 'e-District Sandbox',
    uri: 'in.gov.edistrict.DOM-2025-112233',
    status: 'manual_review',
    verifiedAt: '24 Sep 2026',
    manualReviewReason: 'Automated verification could not establish a valid match due to spelling variation in residential address.',
    lastVerificationResult: 'Flagged for manual review by District Nodal Officer',
    issuingAuthority: 'District Magistrate Office',
  },
  {
    id: 'doc-acad-004',
    name: 'Class XII Marksheet & Passing Cert',
    type: 'Academic Certificate',
    source: 'DigiLocker',
    uri: 'in.gov.digilocker.CBSE-XII-2024-774411',
    status: 'verified',
    verifiedAt: '20 Sep 2026',
    expiryDate: 'Lifetime',
    lastVerificationResult: 'Auto-verified via DigiLocker CBSE Record Repository',
    issuingAuthority: 'Central Board of Secondary Education',
  },
  {
    id: 'doc-id-005',
    name: 'Aadhaar Identity Verification',
    type: 'Identity Document',
    source: 'DigiLocker',
    uri: 'in.gov.uidai.AADHAAR-XXXX-XXXX-9012',
    status: 'verified',
    verifiedAt: '18 Sep 2026',
    expiryDate: 'N/A',
    lastVerificationResult: 'Auto-verified via DigiLocker UIDAI Verification',
    issuingAuthority: 'UIDAI',
  },
];

/**
 * Initial Student Active Application Demo Data
 */
export const initialApplications: ScholarshipApplicationItem[] = [
  {
    id: 'JAGO-2026-00124',
    schemeId: 'post-matric-st',
    schemeName: 'Post-Matric Scholarship Scheme for ST Students',
    schemeShortName: 'Post-Matric Scholarship',
    appliedDate: '18 September 2026',
    status: 'under_verification',
    studentName: 'Ramesh Kumar Oraon',
    documents: initialStudentDocuments.slice(0, 3),
    pendingAction: 'Domicile Certificate requires manual verifier approval.',
    disbursementStatus: 'Pending Verification',
    sanctionAmount: '₹ 18,500 / year',
  },
];