const test = require('node:test');
const assert = require('node:assert/strict');
const { classifyBenefitGap } = require('../services/benefitGapMatcher');
const { isToolAllowed } = require('../routes/jagoChat');
const { answerQuestion, classifyQuestion } = require('../services/geminiService');

test('synthetic matching classifies the expected SIH scenarios deterministically', () => {
  const { summary, candidates } = classifyBenefitGap();
  const statuses = Object.fromEntries(candidates.map(({ id, status }) => [id, status]));

  assert.deepEqual(summary && {
    totalEnrolledSTStudents: summary.totalEnrolledSTStudents,
    matchedBeneficiaries: summary.matchedBeneficiaries,
    potentialUnreached: summary.potentialUnreached,
    requiresReview: summary.requiresReview,
  }, {
    totalEnrolledSTStudents: 7,
    matchedBeneficiaries: 1,
    potentialUnreached: 2,
    requiresReview: 4,
  });
  assert.equal(statuses['STU-001'], 'MATCHED');
  assert.equal(statuses['STU-002'], 'POTENTIAL_UNREACHED');
  assert.equal(statuses['STU-003'], 'REQUIRES_REVIEW');
  assert.equal(statuses['STU-004'], 'REQUIRES_REVIEW');
  assert.equal(statuses['STU-005'], 'REQUIRES_REVIEW');
  assert.equal(statuses['STU-006'], 'POTENTIAL_UNREACHED');
  assert.equal(statuses['STU-007'], 'REQUIRES_REVIEW');
  assert.ok(candidates.every((candidate) => candidate.label.includes('not a live government record')));
});

test('prototype role tool allowlist prevents student invocation of admin tools', () => {
  assert.equal(isToolAllowed('student', 'getApplicationStatus'), true);
  assert.equal(isToolAllowed('student', 'getCoverageSummary'), false);
  assert.equal(isToolAllowed('student', 'getBenefitGapCandidate'), false);
  assert.equal(isToolAllowed('admin', 'getCoverageSummary'), true);
  assert.equal(isToolAllowed('admin', 'getBenefitGapCandidate'), true);
  assert.equal(isToolAllowed('admin', 'getApplicationStatus'), false);
});

test('Gemini absence fails with a controlled configuration code', async () => {
  const originalKey = process.env.GEMINI_API_KEY;
  delete process.env.GEMINI_API_KEY;
  try {
    await assert.rejects(
      answerQuestion('check status', 'student', 'en', { available: false }),
      (error) => error.code === 'AI_NOT_CONFIGURED'
    );
  } finally {
    if (originalKey === undefined) delete process.env.GEMINI_API_KEY;
    else process.env.GEMINI_API_KEY = originalKey;
  }
});

test('Gemini intent classification uses a structured role-specific tool schema without an API key', async () => {
  let request;
  const result = await classifyQuestion('How many potential gaps?', 'admin', 'en', () => ({
    models: {
      generateContent: async (payload) => {
        request = payload;
        return { text: JSON.stringify({ intent: 'COVERAGE_SUMMARY', tool: 'getCoverageSummary', requiresTool: true }) };
      },
    },
  }));

  assert.equal(result.tool, 'getCoverageSummary');
  assert.deepEqual(request.config.responseJsonSchema.properties.tool.enum, [
    'getCoverageSummary',
    'getUnreachedCandidates',
    'getVerificationSummary',
    'getApplicationSummary',
    'getBenefitGapCandidate',
    'none',
  ]);
  assert.equal(request.config.responseMimeType, 'application/json');
});

test('Gemini response receives only the structured tool result and requested language', async () => {
  let request;
  const toolResult = { available: true, status: 'under_verification' };
  const result = await answerQuestion(
    'என் விண்ணப்ப நிலை என்ன?',
    'student',
    'ta',
    toolResult,
    { intent: 'APPLICATION_STATUS', tool: 'getApplicationStatus', allowedTools: ['getApplicationStatus'] },
    () => ({
      models: {
        generateContent: async (payload) => {
          request = payload;
          return { text: 'உங்கள் விண்ணப்பம் சரிபார்ப்பில் உள்ளது.' };
        },
      },
    })
  );

  assert.equal(result.answer, 'உங்கள் விண்ணப்பம் சரிபார்ப்பில் உள்ளது.');
  assert.equal(result.tool, 'getApplicationStatus');
  assert.match(request.contents, /Respond in Tamil/);
  assert.match(request.contents, /"status":"under_verification"/);
  assert.doesNotMatch(request.contents, /GEMINI_API_KEY/);
});
