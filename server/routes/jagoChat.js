const express = require('express');
const { rateLimit } = require('express-rate-limit');
const geminiService = require('../services/geminiService');
const { classifyBenefitGap } = require('../services/benefitGapMatcher');

const router = express.Router();
const LANGUAGES = new Set(['en', 'ta', 'hi']);
const STUDENT_TOOLS = new Set(['getApplicationStatus', 'getScholarshipInfo', 'getDocuments', 'getVerificationStats']);
const ADMIN_TOOLS = new Set(['getCoverageSummary', 'getUnreachedCandidates', 'getVerificationSummary', 'getApplicationSummary', 'getBenefitGapCandidate']);

function isToolAllowed(role, tool) {
  return role === 'student'
    ? STUDENT_TOOLS.has(tool)
    : role === 'admin' && ADMIN_TOOLS.has(tool);
}

function positiveInt(name, fallback, maximum) {
  const value = Number.parseInt(process.env[name] || '', 10);
  return Number.isInteger(value) && value > 0 ? Math.min(value, maximum) : fallback;
}

const maxMessageLength = positiveInt('JAGO_MAX_MESSAGE_LENGTH', 1000, 1000);
const sessionWindowMs = positiveInt('JAGO_SESSION_LIMIT_WINDOW_MS', 10 * 60 * 1000, 24 * 60 * 60 * 1000);
const sessionMax = positiveInt('JAGO_SESSION_LIMIT_MAX', 30, 300);
const sessionRequests = new Map();

const ipLimiter = rateLimit({
  windowMs: positiveInt('JAGO_RATE_LIMIT_WINDOW_MS', 60 * 1000, 60 * 60 * 1000),
  limit: positiveInt('JAGO_RATE_LIMIT_MAX', 10, 100),
  standardHeaders: 'draft-8',
  legacyHeaders: false,
  handler: (req, res) => res.status(429).json({
    code: 'RATE_LIMITED',
    error: 'You have reached the current JAGO request limit. Please try again shortly.',
  }),
});

// Prototype limiter is process-local. Production multi-instance deployment should use a shared store such as Redis.
function sessionLimiter(req, res, next) {
  const now = Date.now();
  const body = req.body && typeof req.body === 'object' ? req.body : {};
  const sessionId = typeof body.sessionId === 'string' && /^[A-Za-z0-9_-]{1,80}$/.test(body.sessionId)
    ? body.sessionId
    : `ip-${req.ip || 'unknown'}`;
  const key = `${body.role}:${sessionId}`;
  const entry = sessionRequests.get(key);
  const current = !entry || now - entry.startedAt >= sessionWindowMs
    ? { startedAt: now, count: 0 }
    : entry;

  if (current.count >= sessionMax) {
    return res.status(429).json({
      code: 'SESSION_LIMITED',
      error: 'You have reached the current JAGO conversation limit. Please try again shortly.',
    });
  }

  current.count += 1;
  sessionRequests.set(key, current);
  if (sessionRequests.size > 5000) {
    for (const [sessionKey, value] of sessionRequests) {
      if (now - value.startedAt >= sessionWindowMs) sessionRequests.delete(sessionKey);
    }
  }
  return next();
}

function cleanText(value, maxLength = 240) {
  return typeof value === 'string' ? value.trim().slice(0, maxLength) : '';
}

function sanitizeStudentContext(context) {
  if (!context || typeof context !== 'object') return { application: null, scholarships: [] };
  const application = context.application && typeof context.application === 'object'
    ? {
        schemeId: cleanText(context.application.schemeId, 80),
        schemeName: cleanText(context.application.schemeName, 160),
        schemeShortName: cleanText(context.application.schemeShortName, 100),
        status: cleanText(context.application.status, 40),
        appliedDate: cleanText(context.application.appliedDate, 60),
        pendingAction: cleanText(context.application.pendingAction, 240),
        documents: Array.isArray(context.application.documents)
          ? context.application.documents.slice(0, 12).map((document) => ({
              name: cleanText(document?.name, 100),
              type: cleanText(document?.type, 100),
              status: cleanText(document?.status, 40),
              source: cleanText(document?.source, 60),
              manualReviewReason: cleanText(document?.manualReviewReason, 200),
            }))
          : [],
      }
    : null;
  const scholarships = Array.isArray(context.scholarships)
    ? context.scholarships.slice(0, 12).map((scheme) => ({
        id: cleanText(scheme?.id, 80),
        name: cleanText(scheme?.name, 160),
        shortName: cleanText(scheme?.shortName, 100),
        description: cleanText(scheme?.description, 320),
        portal: cleanText(scheme?.portal, 160),
        requiredDocuments: Array.isArray(scheme?.requiredDocuments)
          ? scheme.requiredDocuments.slice(0, 12).map((item) => cleanText(item, 120)).filter(Boolean)
          : [],
      }))
    : [];
  return { application, scholarships };
}

function sanitizeAdminContext(context) {
  if (!context || typeof context !== 'object') return {};
  const counts = context.applicationCounts && typeof context.applicationCounts === 'object'
    ? Object.fromEntries(Object.entries(context.applicationCounts).slice(0, 10).map(([key, value]) => [
        cleanText(key, 50),
        Number.isFinite(value) && value >= 0 ? Math.floor(value) : 0,
      ]))
    : {};
  const schemes = Array.isArray(context.schemes)
    ? context.schemes.slice(0, 12).map((scheme) => ({
        name: cleanText(scheme?.name, 160),
        count: Number.isFinite(scheme?.count) && scheme.count >= 0 ? Math.floor(scheme.count) : 0,
        underVerification: Number.isFinite(scheme?.underVerification) && scheme.underVerification >= 0
          ? Math.floor(scheme.underVerification)
          : 0,
      }))
    : [];
  const verificationSummary = context.verificationSummary && typeof context.verificationSummary === 'object'
    ? Object.fromEntries(Object.entries(context.verificationSummary).slice(0, 10).map(([key, value]) => [
        cleanText(key, 50),
        Number.isFinite(value) && value >= 0 ? Math.floor(value) : 0,
      ]))
    : {};
  return { applicationCounts: counts, schemes, verificationSummary };
}

function findScheme(message, context, defaultToCurrentApplication = true) {
  const normalized = message.toLowerCase();
  const namedScheme = context.scholarships.find((scheme) =>
    normalized.includes(scheme.id.toLowerCase()) || normalized.includes(scheme.name.toLowerCase()) || normalized.includes(scheme.shortName.toLowerCase())
  );
  return namedScheme || (defaultToCurrentApplication
    ? context.scholarships.find((scheme) => scheme.id === context.application?.schemeId)
    : undefined);
}

function normalizePromptText(message) {
  return String(message || '').trim().toLowerCase().replace(/[^a-z0-9\s]/g, ' ');
}

function resolveDeterministicIntent(message, role) {
  const text = normalizePromptText(message);

  if (role === 'admin') {
    if (/potential unreached|unreached students|coverage gap/.test(text)) {
      return { intent: 'COVERAGE_SUMMARY', tool: 'getUnreachedCandidates', requiresTool: true };
    }
    if (/coverage summary|scholarship coverage|coverage/.test(text)) {
      return { intent: 'COVERAGE_SUMMARY', tool: 'getCoverageSummary', requiresTool: true };
    }
    if (/records require review|require review|review queue|review/.test(text)) {
      return { intent: 'VERIFICATION_SUMMARY', tool: 'getCoverageSummary', requiresTool: true };
    }
    if (/applications are being processed|application summary|processed applications|being processed/.test(text)) {
      return { intent: 'APPLICATION_SUMMARY', tool: 'getApplicationSummary', requiresTool: true };
    }
    if (/benefit gap|candidate/.test(text)) {
      return { intent: 'BENEFIT_GAP_CANDIDATE', tool: 'getBenefitGapCandidate', requiresTool: true };
    }
    return { intent: 'UNKNOWN', tool: 'none', requiresTool: false };
  }

  if (/status|application/.test(text)) {
    return { intent: 'APPLICATION_STATUS', tool: 'getApplicationStatus', requiresTool: true };
  }
  if (/document|certificate|proof|required|needed|files/.test(text)) {
    return { intent: 'DOCUMENTS', tool: 'getDocuments', requiresTool: true };
  }
  if (/scholarship|apply|eligible|fund/.test(text)) {
    return { intent: 'SCHOLARSHIP_INFO', tool: 'getScholarshipInfo', requiresTool: true };
  }
  if (/verification|review|manual/.test(text)) {
    return { intent: 'VERIFICATION_STATS', tool: 'getVerificationStats', requiresTool: true };
  }
  return { intent: 'UNKNOWN', tool: 'none', requiresTool: false };
}

function formatDeterministicAnswer(message, role, language, toolResult, intent) {
  const en = {
    coverage: 'Coverage summary',
    unreached: 'Potential unreached students',
    review: 'Records requiring review',
    processed: 'Applications being processed',
    unavailable: 'The requested prototype data is unavailable.',
  };
  const hi = {
    coverage: 'कवरेज सारांश',
    unreached: 'संभावित अप्राप्य विद्यार्थी',
    review: 'समीक्षा की आवश्यकता वाले रिकॉर्ड',
    processed: 'प्रसंस्करण में आवेदन',
    unavailable: 'अनुरोधित प्रोटोटाइप डेटा उपलब्ध नहीं है।',
  };
  const ta = {
    coverage: 'கவரேஜ் சுருக்கம்',
    unreached: 'சாத்தியமான சென்றடையாத மாணவர்கள்',
    review: 'மதிப்பாய்வு தேவைப்படும் பதிவுகள்',
    processed: 'செயலாக்கத்தில் உள்ள விண்ணப்பங்கள்',
    unavailable: 'கோரப்பட்ட முன்மாதிரி தரவு கிடைக்கவில்லை.',
  };
  const labels = language === 'hi' ? hi : language === 'ta' ? ta : en;

  if (role === 'admin') {
    const summary = toolResult && typeof toolResult.summary === 'object' ? toolResult.summary : toolResult;
    if (intent.tool === 'getUnreachedCandidates') {
      const count = Number(summary?.potentialUnreached ?? 0);
      return `${labels.unreached}: ${count}.`;
    }
    if (intent.tool === 'getCoverageSummary') {
      if (summary && typeof summary.totalEnrolledSTStudents === 'number') {
        return `${labels.coverage}: ${summary.totalEnrolledSTStudents} enrolled ST students; ${summary.matchedBeneficiaries} matched beneficiaries; ${summary.potentialUnreached} potential unreached; ${summary.requiresReview} require review.`;
      }
      if (summary && typeof summary.requiresReview === 'number') {
        return `${labels.review}: ${summary.requiresReview}.`;
      }
      return `${labels.unavailable}`;
    }
    if (intent.tool === 'getApplicationSummary') {
      const applicationCounts = toolResult?.applicationCounts || {};
      if (Object.keys(applicationCounts).length > 0) {
        const entries = Object.entries(applicationCounts).map(([status, count]) => `${status.replace(/_/g, ' ')}: ${count}`).join(' • ');
        return `${labels.processed}: ${entries}.`;
      }
      return `${labels.unavailable}`;
    }
    if (intent.tool === 'getBenefitGapCandidate') {
      return summary && summary.studentRef
        ? `${summary.studentRef} — ${summary.reason || 'Synthetic benefit gap candidate.'}`
        : `${labels.unavailable}`;
    }
    return `${labels.unavailable}`;
  }

  if (intent.tool === 'getApplicationStatus') {
    const application = toolResult && toolResult.schemeShortName ? toolResult : null;
    if (application) {
      return `Application status: ${application.schemeShortName} — ${application.status}.`;
    }
    return labels.unavailable;
  }
  if (intent.tool === 'getDocuments') {
    const requiredDocuments = Array.isArray(toolResult?.requiredDocuments) ? toolResult.requiredDocuments : [];
    if (requiredDocuments.length > 0) {
      return `Required documents: ${requiredDocuments.join(', ')}.`;
    }
    return labels.unavailable;
  }
  if (intent.tool === 'getScholarshipInfo') {
    if (Array.isArray(toolResult?.schemes) && toolResult.schemes.length > 0) {
      const first = toolResult.schemes[0];
      return `${first.name}: ${first.description || 'Scholarship details available in the prototype catalog.'}`;
    }
    return labels.unavailable;
  }
  if (intent.tool === 'getVerificationStats') {
    const counts = toolResult?.counts || {};
    return `Verified: ${counts.verified ?? 0}; pending: ${counts.pending ?? 0}; manual review: ${counts.manualReview ?? 0}.`;
  }
  return labels.unavailable;
}

function getDeterministicToolData(tool, message, context, role) {
  if (role === 'student') {
    return getStudentToolData(tool, message, context);
  }
  return getAdminToolData(tool, message, context);
}

function getDeterministicIntent(message, role) {
  return resolveDeterministicIntent(message, role);
}

function getDeterministicAnswer(message, role, language, toolResult, intent) {
  return formatDeterministicAnswer(message, role, language, toolResult, intent);
}

function getStudentToolData(tool, message, context) {
  if (tool === 'getApplicationStatus') {
    if (!context.application) return { available: false, reason: 'No application context was provided.' };
    const { schemeName, schemeShortName, status, appliedDate, pendingAction } = context.application;
    return { available: true, schemeName, schemeShortName, status, appliedDate, pendingAction };
  }
  if (tool === 'getScholarshipInfo') {
    const scheme = findScheme(message, context, false);
    return scheme
      ? { available: true, scheme }
      : {
          available: true,
          schemes: context.scholarships.map(({ id, name, shortName }) => ({ id, name, shortName })),
          eligibilityAssessed: false,
          note: 'Catalog options only; this result does not assess eligibility.',
        };
  }
  if (tool === 'getDocuments') {
    const scheme = findScheme(message, context);
    return scheme
      ? { available: true, schemeName: scheme.name, requiredDocuments: scheme.requiredDocuments }
      : { available: false, reason: 'Required-document information is unavailable in the supplied prototype catalog.' };
  }
  if (tool === 'getVerificationStats') {
    const documents = context.application?.documents || [];
    return documents.length > 0
      ? {
          available: true,
          counts: {
            verified: documents.filter((document) => document.status === 'verified').length,
            pending: documents.filter((document) => document.status === 'pending').length,
            manualReview: documents.filter((document) => document.status === 'manual_review').length,
          },
          documents: documents.map(({ name, type, status, source, manualReviewReason }) => ({ name, type, status, source, manualReviewReason })),
        }
      : { available: false, reason: 'Document verification context is unavailable.' };
  }
  return { available: false, reason: 'Tool is unavailable.' };
}

function getAdminToolData(tool, message, context) {
  const { summary, candidates } = classifyBenefitGap();
  if (tool === 'getCoverageSummary') return summary;
  if (tool === 'getUnreachedCandidates') {
    return {
      potentialUnreached: summary.potentialUnreached,
      totalEnrolledSTStudents: summary.totalEnrolledSTStudents,
      label: summary.label,
      note: 'Aggregate count only. Candidate-level records are not included in generic coverage responses.',
    };
  }
  if (tool === 'getVerificationSummary') {
    return Object.keys(context.verificationSummary).length > 0
      ? context.verificationSummary
      : { available: false, reason: 'Application verification summary was not provided by the prototype console.' };
  }
  if (tool === 'getApplicationSummary') {
    return Object.keys(context.applicationCounts).length > 0
      ? { applicationCounts: context.applicationCounts, schemes: context.schemes }
      : { available: false, reason: 'Application summary was not provided by the prototype console.' };
  }
  if (tool === 'getBenefitGapCandidate') {
    const reference = message.match(/STU-\d{3}/i)?.[0]?.toUpperCase();
    const candidate = candidates.find((record) => record.id === reference);
    return candidate
      ? { studentRef: candidate.studentRef, status: candidate.status, matchedSources: candidate.matchedSources, reason: candidate.reason, label: candidate.label }
      : { available: false, reason: 'Name a listed synthetic candidate reference such as STU-004.' };
  }
  return { available: false, reason: 'Tool is unavailable.' };
}

router.post('/chat', ipLimiter, sessionLimiter, async (req, res) => {
  const { message, role, language } = req.body || {};
  if (typeof message !== 'string' || !message.trim()) {
    return res.status(400).json({ code: 'INVALID_MESSAGE', error: 'Enter a message before sending.' });
  }
  if (message.length > maxMessageLength) {
    return res.status(413).json({ code: 'MESSAGE_TOO_LONG', error: `Messages must be ${maxMessageLength} characters or fewer.` });
  }
  if (role !== 'student' && role !== 'admin') {
    return res.status(400).json({ code: 'INVALID_ROLE', error: 'Choose a valid prototype role.' });
  }
  if (!LANGUAGES.has(language)) {
    return res.status(400).json({ code: 'INVALID_LANGUAGE', error: 'Choose English, Tamil, or Hindi.' });
  }

  const context = role === 'student'
    ? sanitizeStudentContext(req.body.studentContext)
    : sanitizeAdminContext(req.body.adminContext);

  try {
    let intent;
    const shouldUseDeterministicFallback = !process.env.GEMINI_API_KEY;

    if (shouldUseDeterministicFallback) {
      intent = getDeterministicIntent(message.trim(), role);
    } else {
      intent = await geminiService.classifyQuestion(message.trim(), role, language);
    }

    if (intent.tool !== 'none' && !isToolAllowed(role, intent.tool)) {
      return res.status(403).json({ code: 'TOOL_FORBIDDEN', error: 'That JAGO function is not available for this prototype role.' });
    }
    if (intent.tool === 'none') {
      const unknownByLanguage = {
        en: 'I do not have enough prototype data to answer that. Please ask about application status, documents, coverage summary, or a listed synthetic candidate.',
        ta: 'இதற்கு பதிலளிக்க போதுமான முன்மாதிரி தரவு இல்லை. விண்ணப்ப நிலை, ஆவணங்கள், கவரேஜ் சுருக்கம் அல்லது பட்டியலிடப்பட்ட செயற்கை பதிவைப் பற்றி கேளுங்கள்.',
        hi: 'उत्तर देने के लिए पर्याप्त प्रोटोटाइप डेटा नहीं है। आवेदन स्थिति, दस्तावेज़, कवरेज सारांश या सूचीबद्ध सिंथेटिक रिकॉर्ड के बारे में पूछें।',
      };
      return res.json({ answer: unknownByLanguage[language], intent: intent.intent, tool: 'none', language, source: 'backend-tool+gemini', prototypeRole: true });
    }

    const toolResult = intent.tool === 'none'
      ? { available: false, reason: 'No approved data lookup matched the question.' }
      : getDeterministicToolData(intent.tool, message.trim(), context, role);

    const responseText = shouldUseDeterministicFallback
      ? getDeterministicAnswer(message.trim(), role, language, toolResult, intent)
      : (await geminiService.answerQuestion(message.trim(), role, language, toolResult, intent)).answer;

    return res.json({
      answer: responseText,
      intent: intent.intent,
      tool: intent.tool,
      language,
      source: shouldUseDeterministicFallback ? 'backend-local-deterministic' : 'backend-tool+gemini',
      prototypeRole: true,
    });
  } catch (error) {
    if (error.code === 'AI_NOT_CONFIGURED') {
      return res.status(503).json({ code: 'AI_NOT_CONFIGURED', error: 'JAGO AI is not configured on this backend.' });
    }
    if (error.code === 'TOOL_FORBIDDEN') {
      return res.status(403).json({ code: error.code, error: 'That JAGO function is not available for this prototype role.' });
    }
    const messageText = `${error.status || ''} ${error.code || ''} ${error.message || ''}`.toLowerCase();
    if (messageText.includes('429') || messageText.includes('resource_exhausted') || messageText.includes('503')) {
      return res.status(503).json({ code: 'AI_CAPACITY', error: 'JAGO AI is temporarily busy. Please try again shortly.' });
    }
    console.error('[JAGO chat] Request failed. Internal model details are suppressed.');
    return res.status(503).json({ code: 'AI_UNAVAILABLE', error: 'JAGO AI is temporarily unavailable.' });
  }
});

module.exports = router;
module.exports.isToolAllowed = isToolAllowed;
module.exports.getStudentToolData = getStudentToolData;
module.exports.getAdminToolData = getAdminToolData;
module.exports.sessionLimiter = sessionLimiter;
