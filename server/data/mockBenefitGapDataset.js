// Fully synthetic SIH demonstration fixtures. These are not government records.
const scholarshipRegistry = [
  { studentRef: 'STU-001', apaarRef: 'APAAR-MOCK-001', benefitStatus: 'receiving', schemeCode: 'POST_MATRIC_ST' },
  { studentRef: 'STU-003', apaarRef: 'APAAR-MOCK-003', benefitStatus: 'receiving', schemeCode: 'POST_MATRIC_ST' },
  { studentRef: 'STU-007', apaarRef: 'APAAR-MOCK-007', benefitStatus: 'unknown', schemeCode: 'POST_MATRIC_ST' },
];

const udiseStudents = [
  { studentRef: 'STU-001', apaarRef: 'APAAR-MOCK-001', enrollmentStatus: 'active', socialCategory: 'ST' },
  { studentRef: 'STU-002', apaarRef: 'APAAR-MOCK-002', enrollmentStatus: 'active', socialCategory: 'ST' },
  { studentRef: 'STU-003', apaarRef: 'APAAR-MOCK-003', enrollmentStatus: 'active', socialCategory: 'ST' },
  { studentRef: 'STU-004', apaarRef: null, enrollmentStatus: 'active', socialCategory: 'ST' },
  { studentRef: 'STU-005', apaarRef: 'APAAR-MOCK-005', enrollmentStatus: 'active', socialCategory: 'ST' },
  { studentRef: 'STU-006', apaarRef: 'APAAR-MOCK-006', enrollmentStatus: 'active', socialCategory: 'ST' },
  { studentRef: 'STU-007', apaarRef: 'APAAR-MOCK-007', enrollmentStatus: 'active', socialCategory: 'ST', manualReviewRequired: true },
];

const apaarRecords = [
  { apaarRef: 'APAAR-MOCK-001', studentRef: 'STU-001', otrRef: 'OTR-MOCK-001' },
  { apaarRef: 'APAAR-MOCK-002', studentRef: 'STU-002', otrRef: 'OTR-MOCK-002' },
  { apaarRef: 'APAAR-MOCK-003', studentRef: 'STU-OTHER-003', otrRef: 'OTR-MOCK-003' },
  { apaarRef: 'APAAR-MOCK-005', studentRef: 'STU-005', otrRef: null },
  { apaarRef: 'APAAR-MOCK-006', studentRef: 'STU-006', otrRef: 'OTR-MOCK-006' },
  { apaarRef: 'APAAR-MOCK-007', studentRef: 'STU-007', otrRef: 'OTR-MOCK-007' },
];

const otrRecords = [
  { otrRef: 'OTR-MOCK-001', apaarRef: 'APAAR-MOCK-001', studentRef: 'STU-001' },
  { otrRef: 'OTR-MOCK-002', apaarRef: 'APAAR-MOCK-002', studentRef: 'STU-002' },
  { otrRef: 'OTR-MOCK-003', apaarRef: 'APAAR-MOCK-003', studentRef: 'STU-003' },
  { otrRef: 'OTR-MOCK-006', apaarRef: 'APAAR-MOCK-006', studentRef: 'STU-006' },
  { otrRef: 'OTR-MOCK-007', apaarRef: 'APAAR-MOCK-007', studentRef: 'STU-007' },
];

module.exports = { scholarshipRegistry, udiseStudents, apaarRecords, otrRecords };
