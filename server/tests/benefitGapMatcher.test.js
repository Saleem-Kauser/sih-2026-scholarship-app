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

test('Gemini intent classification uses a plain request with role-specific allowed tools', async () => {
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
  assert.equal(typeof request.contents, 'string');
  assert.match(request.contents, /getCoverageSummary, getUnreachedCandidates/);
  assert.match(request.contents, /Choose none/);
  assert.equal('config' in request, false);
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

test('Gemini 3.5 Flash-Lite uses the basic SDK request for mocked classify and response calls', async () => {
  const originalModel = process.env.GEMINI_MODEL;
  process.env.GEMINI_MODEL = 'gemini-3.5-flash-lite';
  const requests = [];
  const clientFactory = () => ({
    models: {
      generateContent: async (payload) => {
        requests.push(payload);
        return requests.length === 1
          ? { text: JSON.stringify({ intent: 'SCHOLARSHIP_INFO', tool: 'getScholarshipInfo', requiresTool: true }) }
          : { text: 'Review the listed scholarship options.' };
      },
    },
  });

  try {
    const result = await answerQuestion(
      'Which scholarship can I apply for?',
      'student',
      'en',
      { available: true, schemes: [{ name: 'Prototype Scholarship' }], eligibilityAssessed: false },
      undefined,
      clientFactory
    );

    assert.equal(result.answer, 'Review the listed scholarship options.');
    assert.equal(requests.length, 2);
    for (const request of requests) {
      assert.equal(request.model, 'gemini-3.5-flash-lite');
      assert.equal(typeof request.contents, 'string');
      assert.equal('config' in request, false);
    }
    assert.match(requests[1].contents, /Respond in English/);
    assert.match(requests[1].contents, /Prototype Scholarship/);
  } finally {
    if (originalModel === undefined) delete process.env.GEMINI_MODEL;
    else process.env.GEMINI_MODEL = originalModel;
  }
});

test('Gemini failure diagnostics redact prompt data, identifiers, and credentials', async () => {
  const originalKey = process.env.GEMINI_API_KEY;
  const originalModel = process.env.GEMINI_MODEL;
  process.env.GEMINI_API_KEY = 'test-gemini-secret';
  process.env.GEMINI_MODEL = 'gemini-3.5-flash-lite';
  const originalError = console.error;
  const logEntries = [];
  console.error = (...args) => logEntries.push(args);

  try {
    await assert.rejects(classifyQuestion(
      'What is status for STU-123?',
      'student',
      'en',
      () => ({
        models: {
          generateContent: async () => {
            const error = new Error('Failed request for STU-123; key=test-gemini-secret; contact student@example.com');
            error.status = 400;
            throw error;
          },
        },
      })
    ));
  } finally {
    console.error = originalError;
    if (originalKey === undefined) delete process.env.GEMINI_API_KEY;
    else process.env.GEMINI_API_KEY = originalKey;
    if (originalModel === undefined) delete process.env.GEMINI_MODEL;
    else process.env.GEMINI_MODEL = originalModel;
  }

  const output = JSON.stringify(logEntries);
  assert.match(output, /classifyQuestion/);
  assert.match(output, /400/);
  assert.doesNotMatch(output, /test-gemini-secret|STU-123|student@example\.com|What is status/);
});

test('successful Gemini transport followed by invalid classifier JSON is logged as parse failure', async () => {
  const originalError = console.error;
  const logEntries = [];
  console.error = (...args) => logEntries.push(args);

  try {
    await assert.rejects(classifyQuestion('private question text', 'student', 'en', () => ({
      models: { generateContent: async () => ({ text: '{ invalid private response' }) },
    })));
  } finally {
    console.error = originalError;
  }

  const output = JSON.stringify(logEntries);
  assert.match(output, /parseClassification/);
  assert.match(output, /response processing failed/);
  assert.doesNotMatch(output, /private question text|invalid private response/);
});

test('second Gemini request is logged as answerQuestion and HTTP 429 is RATE_LIMITED', async () => {
  const originalError = console.error;
  const originalInfo = console.info;
  const logEntries = [];
  console.error = (...args) => logEntries.push(args);
  console.info = (...args) => logEntries.push(args);
  let secondRequestStarted = false;

  try {
    await assert.rejects(answerQuestion(
      'Which scholarship can I apply for?',
      'student',
      'en',
      { available: true, schemes: [] },
      { intent: 'SCHOLARSHIP_INFO', tool: 'getScholarshipInfo', allowedTools: ['getScholarshipInfo'] },
      () => ({
        models: {
          generateContent: async () => {
            const error = new Error('Too many requests');
            error.status = 429;
            throw error;
          },
        },
      }),
      () => { secondRequestStarted = true; }
    ), (error) => error.status === 429);
  } finally {
    console.error = originalError;
    console.info = originalInfo;
  }

  const output = JSON.stringify(logEntries);
  assert.equal(secondRequestStarted, true);
  assert.match(output, /request started.*answerQuestion/);
  assert.match(output, /\[JAGO_GEMINI\] RATE_LIMITED/);
  assert.match(output, /"status":"429"/);
});
