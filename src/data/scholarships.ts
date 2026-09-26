// Source: SIH 2026 Problem Statement SIH26238 (Problem context & portal fragmentation scope)
// Source: Ministry of Tribal Affairs Official Scheme Portals (tribal.nic.in, fellowship.tribal.gov.in, overseas.tribal.gov.in)

export interface ScholarshipScheme {
  id: string;
  name: string;
  shortName: string;
  description: string;
  category: string;
  portal: string;
  basicEligibility: string[];
  requiredDocuments: string[];
  trackingSupportedInPrototype: boolean;
}

/**
 * Note: Official scheme parameters (exact income thresholds, age limits, marks/cut-offs, 
 * stipends, and deadlines) are to be verified from official scheme guidelines and live APIs.
 * 
 * Live government portal integrations (NSP, SFMP / Canara Bank, Standalone Portals) 
 * are simulated in this JAGO SIH prototype via mock data services.
 */
export const scholarshipSchemes: ScholarshipScheme[] = [
  {
    id: 'pre-matric-st',
    // Source: SIH 2026 Problem Statement SIH26238 & Ministry of Tribal Affairs Guidelines
    name: 'Pre-Matric Scholarship Scheme for ST Students',
    shortName: 'Pre-Matric Scholarship',
    description:
      'Centrally sponsored scheme implemented through State Governments and UT Administrations to support Scheduled Tribe students studying in pre-matriculation classes.',
    category: 'Pre-Matric Education (Classes IX - X)',
    // Source: SIH 2026 Problem Statement SIH26238 (Legacy system context: NSP / State Portals)
    portal: 'National Scholarship Portal (NSP) / State Portals',
    basicEligibility: [
      'Must belong to Scheduled Tribe (ST) category',
      'Enrolled in Class IX or X in a recognized school',
      'Eligibility details to be verified from official scheme guidelines.',
    ],
    requiredDocuments: [
      'ST Community / Caste Certificate',
      'Required documents to be verified from official scheme guidelines.',
    ],
    trackingSupportedInPrototype: true, // Demo prototype feature: supported in JAGO unified tracking view
  },
  {
    id: 'post-matric-st',
    // Source: SIH 2026 Problem Statement SIH26238 & Ministry of Tribal Affairs Guidelines
    name: 'Post-Matric Scholarship Scheme for ST Students',
    shortName: 'Post-Matric Scholarship',
    description:
      'Centrally sponsored scheme providing financial assistance to Scheduled Tribe students pursuing post-secondary and higher education in recognized institutions.',
    category: 'Post-Matric & Higher Education',
    // Source: SIH 2026 Problem Statement SIH26238 (Legacy system context: NSP / State Portals & SFMP)
    portal: 'National Scholarship Portal (NSP) / State Portals',
    basicEligibility: [
      'Must belong to Scheduled Tribe (ST) category',
      'Pursuing post-matriculation or post-secondary courses in recognized institutions',
      'Eligibility details to be verified from official scheme guidelines.',
    ],
    requiredDocuments: [
      'ST Community / Caste Certificate',
      'Required documents to be verified from official scheme guidelines.',
    ],
    trackingSupportedInPrototype: true, // Demo prototype feature: supported in JAGO unified tracking view
  },
  {
    id: 'top-class-st',
    // Source: Ministry of Tribal Affairs Official Title & SIH26238 Context
    name: 'National Fellowship and Scholarship for Higher Education of ST Students - Top Class Education',
    shortName: 'Top Class Scholarship',
    description:
      'Central Sector Scheme providing full financial support to meritorious Scheduled Tribe students for pursuing higher education in notified premier institutes across India.',
    category: 'Higher Education (Premier Institutes)',
    // Source: SIH 2026 Problem Statement SIH26238 & MoTA Portal Guidelines
    portal: 'National Scholarship Portal (NSP) / SFMP (Canara Bank)',
    basicEligibility: [
      'Must belong to Scheduled Tribe (ST) category',
      'Secured admission in one of the notified top-class premier institutions',
      'Eligibility details to be verified from official scheme guidelines.',
    ],
    requiredDocuments: [
      'ST Community / Caste Certificate',
      'Required documents to be verified from official scheme guidelines.',
    ],
    trackingSupportedInPrototype: true, // Demo prototype feature: supported in JAGO unified tracking view
  },
  {
    id: 'nfst',
    // Source: Ministry of Tribal Affairs Official Portal (fellowship.tribal.gov.in)
    name: 'National Fellowship for Higher Education of ST Students (NFST)',
    shortName: 'National Fellowship (NFST)',
    description:
      'Central Sector Fellowship Scheme providing financial assistance to ST candidates for pursuing regular full-time Ph.D. degrees (and select approved M.Phil courses) in recognized Indian universities.',
    category: 'Higher Research (Ph.D. / Fellowships)',
    // Source: Ministry of Tribal Affairs Official Fellowship Portal & SIH26238
    portal: 'National Tribal Fellowship Portal (fellowship.tribal.gov.in) / Canara Bank Portal',
    basicEligibility: [
      'Must belong to Scheduled Tribe (ST) category',
      'Admitted to regular full-time Ph.D. (or approved M.Phil) courses in recognized universities',
      'Eligibility details to be verified from official scheme guidelines.',
    ],
    requiredDocuments: [
      'ST Community / Caste Certificate',
      'Required documents to be verified from official scheme guidelines.',
    ],
    trackingSupportedInPrototype: true, // Demo prototype feature: supported in JAGO unified tracking view
  },
  {
    id: 'nos-st',
    // Source: Ministry of Tribal Affairs Official Overseas Portal (overseas.tribal.gov.in)
    name: 'National Overseas Scholarship for ST Students (NOS)',
    shortName: 'National Overseas Scholarship',
    description:
      'Central Sector Scheme providing financial assistance to selected ST candidates for pursuing higher studies abroad for Master level courses, Ph.D., and Post-Doctoral research.',
    category: 'Overseas Higher Studies',
    // Source: SIH 2026 Problem Statement SIH26238 & MoTA NOS Portal
    portal: 'Standalone NOS Portal (overseas.tribal.gov.in)',
    basicEligibility: [
      'Must belong to Scheduled Tribe (ST) category',
      'Selected for pursuing Master level, Ph.D., or Post-Doctoral research abroad in specified fields',
      'Eligibility details to be verified from official scheme guidelines.',
    ],
    requiredDocuments: [
      'ST Community / Caste Certificate',
      'Required documents to be verified from official scheme guidelines.',
    ],
    trackingSupportedInPrototype: true, // Demo prototype feature: supported in JAGO unified tracking view
  },
];