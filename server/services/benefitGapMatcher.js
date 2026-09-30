const { scholarshipRegistry, udiseStudents, apaarRecords, otrRecords } = require('../data/mockBenefitGapDataset');

const MOCK_LABEL = 'Prototype synthetic record — not a live government record.';

function classifyBenefitGap() {
  const enrolled = udiseStudents.filter((record) =>
    record.enrollmentStatus === 'active' && record.socialCategory === 'ST'
  );

  const candidates = enrolled.map((student) => {
    const matchedSources = ['UDISE+'];
    const reviewReasons = [];
    const apaar = student.apaarRef
      ? apaarRecords.find((record) => record.apaarRef === student.apaarRef)
      : undefined;

    if (!student.apaarRef || !apaar) {
      reviewReasons.push('APAAR linkage is missing from this synthetic record.');
    } else {
      matchedSources.push('APAAR');
      if (apaar.studentRef !== student.studentRef) {
        reviewReasons.push('Student reference conflicts across UDISE+ and APAAR fixtures.');
      }
    }

    const otr = apaar?.otrRef
      ? otrRecords.find((record) => record.otrRef === apaar.otrRef)
      : undefined;

    if (!apaar?.otrRef || !otr) {
      reviewReasons.push('OTR linkage is missing from this synthetic record.');
    } else {
      matchedSources.push('OTR');
      if (otr.apaarRef !== apaar.apaarRef || otr.studentRef !== student.studentRef) {
        reviewReasons.push('Student reference conflicts across APAAR and OTR fixtures.');
      }
    }

    if (student.manualReviewRequired) {
      reviewReasons.push('This synthetic record is explicitly marked for manual review.');
    }

    const registryRecords = scholarshipRegistry.filter((record) => record.studentRef === student.studentRef);
    const conflictingRegistry = registryRecords.some((record) => record.apaarRef !== student.apaarRef);
    if (conflictingRegistry) {
      reviewReasons.push('Scholarship registry identity reference conflicts with enrollment data.');
    }

    let status;
    let reason;
    if (reviewReasons.length > 0) {
      status = 'REQUIRES_REVIEW';
      reason = reviewReasons.join(' ');
    } else if (registryRecords.some((record) => record.benefitStatus === 'receiving')) {
      status = 'MATCHED';
      reason = 'A matching synthetic scholarship benefit record is present.';
    } else {
      status = 'POTENTIAL_UNREACHED';
      reason = 'No matching scholarship benefit is recorded in this synthetic registry fixture; this is only a potential coverage gap for review/outreach.';
    }

    return {
      id: student.studentRef,
      studentRef: student.studentRef,
      status,
      matchedSources,
      reason,
      label: MOCK_LABEL,
    };
  });

  const summary = {
    totalEnrolledSTStudents: enrolled.length,
    matchedBeneficiaries: candidates.filter((candidate) => candidate.status === 'MATCHED').length,
    potentialUnreached: candidates.filter((candidate) => candidate.status === 'POTENTIAL_UNREACHED').length,
    requiresReview: candidates.filter((candidate) => candidate.status === 'REQUIRES_REVIEW').length,
    label: MOCK_LABEL,
  };

  return { summary, candidates };
}

module.exports = { classifyBenefitGap, MOCK_LABEL };
