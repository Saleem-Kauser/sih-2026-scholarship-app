const test = require('node:test');
const assert = require('node:assert/strict');
const express = require('express');
const jagoChatRouter = require('../routes/jagoChat');
const geminiService = require('../services/geminiService');

function startChatServer() {
  const app = express();
  app.set('trust proxy', 1);
  app.use(express.json());
  app.use('/api/jago', jagoChatRouter);
  const server = app.listen(0, '127.0.0.1');
  return new Promise((resolve) => server.once('listening', () => resolve(server)));
}

async function postChat(baseUrl, body) {
  return fetch(`${baseUrl}/api/jago/chat`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'X-Forwarded-For': `198.51.100.${Number(new URL(baseUrl).port) % 254 + 1}`,
    },
    body: JSON.stringify(body),
  });
}

test('chat JSON contract supports en, ta, hi and an allowed admin tool with mocked Gemini', async (t) => {
  const originalKey = process.env.GEMINI_API_KEY;
  const originalClassifier = geminiService.classifyQuestion;
  const originalAnswer = geminiService.answerQuestion;
  process.env.GEMINI_API_KEY = 'test-key-only';
  geminiService.classifyQuestion = async (message, role) => {
    const adminToolRequested = /coverage/i.test(message);
    return {
      intent: role === 'admin' || adminToolRequested ? 'COVERAGE_SUMMARY' : 'SCHOLARSHIP_INFO',
      tool: role === 'admin' || adminToolRequested ? 'getCoverageSummary' : 'getScholarshipInfo',
      requiresTool: true,
      allowedTools: role === 'admin'
        ? ['getCoverageSummary', 'getUnreachedCandidates', 'getVerificationSummary', 'getApplicationSummary', 'getBenefitGapCandidate']
        : ['getApplicationStatus', 'getScholarshipInfo', 'getDocuments', 'getVerificationStats'],
    };
  };
  geminiService.answerQuestion = async (message, role, language, toolResult, intent) => ({
    intent: intent.intent,
    tool: intent.tool,
    answer: `Mocked ${language} response for ${role}.`,
  });

  const server = await startChatServer();
  t.after(async () => {
    if (typeof server.closeAllConnections === 'function') server.closeAllConnections();
    await new Promise((resolve, reject) => server.close((error) => error ? reject(error) : resolve()));
    geminiService.classifyQuestion = originalClassifier;
    geminiService.answerQuestion = originalAnswer;
    if (originalKey === undefined) delete process.env.GEMINI_API_KEY;
    else process.env.GEMINI_API_KEY = originalKey;
  });
  const baseUrl = `http://127.0.0.1:${server.address().port}`;

  const requests = [
    ['Which scholarship can I apply for?', 'en'],
    ['எந்த உதவித்தொகைக்கு நான் விண்ணப்பிக்கலாம்?', 'ta'],
    ['मैं किस छात्रवृत्ति के लिए आवेदन कर सकता हूँ?', 'hi'],
  ];
  for (const [message, language] of requests) {
    const response = await postChat(baseUrl, { message, role: 'student', language });
    const body = await response.json();
    assert.equal(response.status, 200);
    assert.equal(body.language, language);
    assert.equal(body.tool, 'getScholarshipInfo');
    assert.equal(body.answer, `Mocked ${language} response for student.`);
  }

  assert.equal((await postChat(baseUrl, {
    message: 'Which scholarship can I apply for?', role: 'student', language: 'English',
  })).status, 400);

  const deniedStudent = await postChat(baseUrl, {
    message: 'Show coverage summary', role: 'student', language: 'en',
  });
  assert.equal(deniedStudent.status, 403);
  assert.equal((await deniedStudent.json()).code, 'TOOL_FORBIDDEN');

  const adminResponse = await postChat(baseUrl, {
    message: 'Show scholarship coverage summary.', role: 'admin', language: 'en',
  });
  assert.equal(adminResponse.status, 200);
  assert.equal((await adminResponse.json()).tool, 'getCoverageSummary');
});

test('Gemini service failures return only a safe user-facing error', async (t) => {
  const originalKey = process.env.GEMINI_API_KEY;
  const originalClassifier = geminiService.classifyQuestion;
  process.env.GEMINI_API_KEY = 'test-key-only';
  geminiService.classifyQuestion = async () => {
    throw new Error('private provider diagnostic');
  };
  const server = await startChatServer();
  t.after(async () => {
    if (typeof server.closeAllConnections === 'function') server.closeAllConnections();
    await new Promise((resolve, reject) => server.close((error) => error ? reject(error) : resolve()));
    geminiService.classifyQuestion = originalClassifier;
    if (originalKey === undefined) delete process.env.GEMINI_API_KEY;
    else process.env.GEMINI_API_KEY = originalKey;
  });

  const response = await postChat(`http://127.0.0.1:${server.address().port}`, {
    message: 'What is my application status?', role: 'student', language: 'en',
  });
  const body = await response.json();
  assert.equal(response.status, 503);
  assert.equal(body.code, 'AI_UNAVAILABLE');
  assert.match(body.error, /temporarily unavailable/i);
  assert.doesNotMatch(JSON.stringify(body), /private provider diagnostic|test-key-only/);
});

test('role allowlists restrict student tools and expose admin tools only to admin role', () => {
  assert.equal(jagoChatRouter.isToolAllowed('student', 'getApplicationStatus'), true);
  assert.equal(jagoChatRouter.isToolAllowed('student', 'getScholarshipInfo'), true);
  assert.equal(jagoChatRouter.isToolAllowed('student', 'getDocuments'), true);
  assert.equal(jagoChatRouter.isToolAllowed('student', 'getVerificationStats'), true);
  assert.equal(jagoChatRouter.isToolAllowed('student', 'getCoverageSummary'), false);
  assert.equal(jagoChatRouter.isToolAllowed('student', 'getUnreachedCandidates'), false);
  assert.equal(jagoChatRouter.isToolAllowed('student', 'getBenefitGapCandidate'), false);
  assert.equal(jagoChatRouter.isToolAllowed('admin', 'getCoverageSummary'), true);
  assert.equal(jagoChatRouter.isToolAllowed('admin', 'getUnreachedCandidates'), true);
  assert.equal(jagoChatRouter.isToolAllowed('admin', 'getBenefitGapCandidate'), true);
  assert.equal(jagoChatRouter.isToolAllowed('admin', 'getApplicationStatus'), false);
});

test('student and admin tools return structured backend data without candidate overexposure', () => {
  const studentContext = {
    application: {
      schemeId: 'post-matric-st',
      schemeName: 'Post-Matric Scholarship Scheme for ST Students',
      schemeShortName: 'Post-Matric Scholarship',
      status: 'under_verification',
      appliedDate: '30 Sep 2026',
      pendingAction: 'Document review pending.',
      documents: [{ name: 'ST Certificate', type: 'ST Certificate', status: 'verified', source: 'e-District Sandbox' }],
    },
    scholarships: [{
      id: 'post-matric-st',
      name: 'Post-Matric Scholarship Scheme for ST Students',
      shortName: 'Post-Matric Scholarship',
      description: 'Synthetic catalog description.',
      portal: 'Prototype portal listing',
      requiredDocuments: ['ST Community / Caste Certificate'],
    }],
  };
  const status = jagoChatRouter.getStudentToolData('getApplicationStatus', 'status', studentContext);
  assert.equal(status.available, true);
  assert.equal(status.status, 'under_verification');

  const scholarshipInfo = jagoChatRouter.getStudentToolData('getScholarshipInfo', 'Which scholarship can I apply for?', studentContext);
  assert.equal(scholarshipInfo.eligibilityAssessed, false);
  assert.equal(scholarshipInfo.schemes.length, 5);
  assert.deepEqual(scholarshipInfo.schemes.map(({ shortName }) => shortName), [
    'Pre-Matric Scholarship',
    'Post-Matric Scholarship',
    'Top Class Scholarship',
    'National Fellowship (NFST)',
    'National Overseas Scholarship',
  ]);
  assert.match(scholarshipInfo.note, /Eligibility has not been assessed/);

  const documents = jagoChatRouter.getStudentToolData('getDocuments', 'What documents do I need?', studentContext);
  assert.deepEqual(documents.requiredDocuments, ['ST Community / Caste Certificate']);

  const stats = jagoChatRouter.getStudentToolData('getVerificationStats', 'document status', studentContext);
  assert.equal(stats.counts.verified, 1);

  const adminSummary = jagoChatRouter.getAdminToolData('getUnreachedCandidates', '', { applicationCounts: {}, schemes: [], verificationSummary: {} });
  assert.equal(adminSummary.potentialUnreached, 2);
  assert.equal('candidates' in adminSummary, false);
  assert.equal('studentRef' in adminSummary, false);
});

test('generic scholarship discovery returns the full catalog without assessing eligibility', () => {
  const questions = [
    'Which scholarship can I apply for?',
    'What scholarships are available?',
    'Show me the scholarships',
    'What schemes does JAGO support?',
  ];
  const expectedSchemeIds = ['pre-matric-st', 'post-matric-st', 'top-class-st', 'nfst', 'nos-st'];

  for (const question of questions) {
    const result = jagoChatRouter.getStudentToolData('getScholarshipInfo', question, {});
    assert.equal(result.available, true);
    assert.deepEqual(result.schemes.map(({ id }) => id), expectedSchemeIds);
    assert.equal(result.eligibilityAssessed, false);
    assert.match(result.note, /Share your education level, category, state, and course/);
  }
});

test('keyless scholarship fallback lists all catalog schemes and does not claim eligibility', async (t) => {
  const hadKey = Object.hasOwn(process.env, 'GEMINI_API_KEY');
  const savedKey = process.env.GEMINI_API_KEY;
  delete process.env.GEMINI_API_KEY;
  const server = await startChatServer();
  t.after(async () => {
    if (typeof server.closeAllConnections === 'function') server.closeAllConnections();
    await new Promise((resolve, reject) => server.close((error) => error ? reject(error) : resolve()));
    if (hadKey) process.env.GEMINI_API_KEY = savedKey;
    else delete process.env.GEMINI_API_KEY;
  });

  const response = await postChat(`http://127.0.0.1:${server.address().port}`, {
    message: 'Which scholarship can I apply for?', role: 'student', language: 'en',
  });
  const body = await response.json();
  assert.equal(response.status, 200);
  assert.match(body.answer, /Pre-Matric Scholarship/);
  assert.match(body.answer, /Post-Matric Scholarship/);
  assert.match(body.answer, /Top Class Scholarship/);
  assert.match(body.answer, /NFST/);
  assert.match(body.answer, /NOS/);
  assert.match(body.answer, /Eligibility has not yet been assessed/);
});

test('chat endpoint accepts known student and admin prompts without Gemini and returns deterministic synthetic data', async (t) => {
  const hadKey = Object.hasOwn(process.env, 'GEMINI_API_KEY');
  const savedKey = process.env.GEMINI_API_KEY;
  delete process.env.GEMINI_API_KEY;
  const server = await startChatServer();
  t.after(async () => {
    if (typeof server.closeAllConnections === 'function') server.closeAllConnections();
    await new Promise((resolve, reject) => server.close((error) => error ? reject(error) : resolve()));
    if (hadKey) process.env.GEMINI_API_KEY = savedKey;
    else delete process.env.GEMINI_API_KEY;
  });
  const baseUrl = `http://127.0.0.1:${server.address().port}`;

  assert.equal((await postChat(baseUrl, {})).status, 400);
  assert.equal((await postChat(baseUrl, { message: '  ', role: 'student', language: 'en' })).status, 400);
  assert.equal((await postChat(baseUrl, { message: 'x'.repeat(1001), role: 'student', language: 'en' })).status, 413);
  assert.equal((await postChat(baseUrl, { message: 'status', role: 'ministry', language: 'en' })).status, 400);

  const studentStatusResponse = await postChat(baseUrl, {
    message: 'What is my application status?',
    role: 'student',
    language: 'en',
    sessionId: 'phase4-keyless-student',
    studentContext: {
      application: {
        schemeId: 'post-matric-st',
        schemeName: 'Post-Matric Scholarship Scheme for ST Students',
        schemeShortName: 'Post-Matric Scholarship',
        status: 'under_verification',
        appliedDate: '30 Sep 2026',
        pendingAction: 'Document review pending.',
        documents: [{ name: 'ST Certificate', type: 'ST Certificate', status: 'verified', source: 'e-District Sandbox' }],
      },
      scholarships: [{
        id: 'post-matric-st',
        name: 'Post-Matric Scholarship Scheme for ST Students',
        shortName: 'Post-Matric Scholarship',
        description: 'Synthetic catalog description.',
        portal: 'Prototype portal listing',
        requiredDocuments: ['ST Community / Caste Certificate'],
      }],
    },
  });
  assert.equal(studentStatusResponse.status, 200);
  assert.match((await studentStatusResponse.json()).answer, /Application status/i);

  const adminPrompts = [
    {
      message: 'How many potential unreached students are there?',
      expected: 'Potential unreached students: 2',
    },
    {
      message: 'How many records require review?',
      expected: 'require review',
    },
    {
      message: 'Show scholarship coverage summary.',
      expected: 'Coverage summary',
    },
    {
      message: 'How many applications are being processed?',
      expected: 'Applications being processed',
    },
  ];

  for (const prompt of adminPrompts) {
    const response = await postChat(baseUrl, {
      message: prompt.message,
      role: 'admin',
      language: 'en',
      sessionId: 'phase4-keyless-admin',
      adminContext: {
        applicationCounts: { under_verification: 4, pending: 2, verified: 1 },
        schemes: [{ name: 'Post-Matric Scholarship', count: 4, underVerification: 2 }],
        verificationSummary: { pending: 4, manualReview: 3, verified: 1 },
      },
    });
    const body = await response.json();
    assert.equal(response.status, 200, `${prompt.message} should resolve without Gemini`);
    assert.match(body.answer, new RegExp(prompt.expected, 'i'));
  }
});

test('per-session limiter returns 429 at the configured conversation boundary', () => {
  const sessionId = `phase4-session-${Date.now()}`;
  let allowed = 0;
  const limitedResponse = { statusCode: 200, body: undefined };
  limitedResponse.status = function (statusCode) {
    this.statusCode = statusCode;
    return this;
  };
  limitedResponse.json = function (body) {
    this.body = body;
    return this;
  };

  for (let index = 0; index < 30; index += 1) {
    jagoChatRouter.sessionLimiter({ body: { role: 'student', sessionId }, ip: '127.0.0.1' }, limitedResponse, () => { allowed += 1; });
  }
  jagoChatRouter.sessionLimiter({ body: { role: 'student', sessionId }, ip: '127.0.0.1' }, limitedResponse, () => { allowed += 1; });

  assert.equal(allowed, 30);
  assert.equal(limitedResponse.statusCode, 429);
  assert.equal(limitedResponse.body.code, 'SESSION_LIMITED');
});
