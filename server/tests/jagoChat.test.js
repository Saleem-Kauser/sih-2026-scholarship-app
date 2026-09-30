const test = require('node:test');
const assert = require('node:assert/strict');
const express = require('express');
const jagoChatRouter = require('../routes/jagoChat');

function startChatServer() {
  const app = express();
  app.use(express.json());
  app.use('/api/jago', jagoChatRouter);
  const server = app.listen(0, '127.0.0.1');
  return new Promise((resolve) => server.once('listening', () => resolve(server)));
}

async function postChat(baseUrl, body) {
  return fetch(`${baseUrl}/api/jago/chat`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });
}

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
  assert.equal(scholarshipInfo.schemes[0].id, 'post-matric-st');

  const documents = jagoChatRouter.getStudentToolData('getDocuments', 'What documents do I need?', studentContext);
  assert.deepEqual(documents.requiredDocuments, ['ST Community / Caste Certificate']);

  const stats = jagoChatRouter.getStudentToolData('getVerificationStats', 'document status', studentContext);
  assert.equal(stats.counts.verified, 1);

  const adminSummary = jagoChatRouter.getAdminToolData('getUnreachedCandidates', '', { applicationCounts: {}, schemes: [], verificationSummary: {} });
  assert.equal(adminSummary.potentialUnreached, 2);
  assert.equal('candidates' in adminSummary, false);
  assert.equal('studentRef' in adminSummary, false);
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
