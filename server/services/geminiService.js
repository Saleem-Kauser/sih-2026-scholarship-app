const { GoogleGenAI } = require('@google/genai');
const DEFAULT_MODEL = 'gemini-3.5-flash-lite';

const STUDENT_TOOLS = [
  'getApplicationStatus',
  'getScholarshipInfo',
  'getDocuments',
  'getVerificationStats',
];
const ADMIN_TOOLS = [
  'getCoverageSummary',
  'getUnreachedCandidates',
  'getVerificationSummary',
  'getApplicationSummary',
  'getBenefitGapCandidate',
];

function createClient() {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    const error = new Error('JAGO AI is not configured.');
    error.code = 'AI_NOT_CONFIGURED';
    throw error;
  }
  return new GoogleGenAI({ apiKey });
}

function languageName(language) {
  return ({ en: 'English', ta: 'Tamil', hi: 'Hindi' })[language];
}

function parseJson(text) {
  if (typeof text !== 'string') throw new Error('Structured model response was empty.');
  return JSON.parse(text);
}

function sanitizeGeminiError(error, prompt) {
  const apiKey = process.env.GEMINI_API_KEY;
  let message = typeof error?.message === 'string' ? error.message : 'Unknown Gemini error';
  if (apiKey) message = message.split(apiKey).join('[REDACTED]');
  if (prompt) message = message.split(prompt).join('[REDACTED_PROMPT]');
  message = message
    .replace(/Bearer\s+[^\s"']+/gi, 'Bearer [REDACTED]')
    .replace(/([?&](?:key|api_key|token)=)[^&\s]+/gi, '$1[REDACTED]')
    .replace(/\b[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}\b/gi, '[REDACTED_EMAIL]')
    .replace(/\b(?:STU|STUDENT)[-_ ]?\d{3,}\b/gi, '[REDACTED_ID]')
    .replace(/\b\+?\d[\d\s().-]{8,}\d\b/g, '[REDACTED_NUMBER]')
    .slice(0, 300);
  return {
    name: typeof error?.name === 'string' ? error.name.slice(0, 80) : 'Error',
    message,
    status: typeof (error?.status ?? error?.statusCode) === 'number' || typeof (error?.status ?? error?.statusCode) === 'string'
      ? String(error.status ?? error.statusCode).slice(0, 40)
      : undefined,
  };
}

async function requestGemini(stage, payload, clientFactory, onRequestStarted) {
  const model = process.env.GEMINI_MODEL || DEFAULT_MODEL;
  const prompt = payload.contents;
  try {
    const ai = clientFactory();
    console.info('[JAGO_GEMINI] request started', { stage, model });
    onRequestStarted?.();
    const response = await ai.models.generateContent({ model, contents: prompt });
    console.info('[JAGO_GEMINI] request succeeded', { stage, model });
    return response;
  } catch (error) {
    const diagnostic = {
      stage,
      ...sanitizeGeminiError(error, prompt),
    };
    if (diagnostic.status === '429') {
      console.error('[JAGO_GEMINI] RATE_LIMITED');
    }
    console.error('[JAGO_GEMINI] request failed', diagnostic);
    throw error;
  }
}

async function classifyQuestion(message, role, language, clientFactory = createClient) {
  const tools = role === 'admin' ? ADMIN_TOOLS : STUDENT_TOOLS;
  const allowed = [...tools, 'none'];
  const prompt = [
    'Classify the user question for JAGO. Return only a JSON object with string fields intent and tool, and boolean field requiresTool. ',
    `Role=${role}; language=${languageName(language)}. `,
    `Allowed tools for this role: ${tools.join(', ')}. The tool must be one of these or none. Choose none if no listed tool is needed. `,
    'Set requiresTool to true exactly when tool is not none. ',
    'Never infer government or scholarship facts. The tool lookup is the source of truth. ',
    `Question: ${message}`,
  ].join('');
  const response = await requestGemini('classifyQuestion', { contents: prompt }, clientFactory);

  console.info('[JAGO_GEMINI] response parsing started', { stage: 'classifyQuestion' });
  try {
    const parsed = parseJson(response.text);
    if (!allowed.includes(parsed.tool) || typeof parsed.requiresTool !== 'boolean' || typeof parsed.intent !== 'string') {
      throw new Error('Invalid intent response.');
    }
    if ((parsed.tool === 'none') === parsed.requiresTool) throw new Error('Inconsistent intent response.');
    console.info('[JAGO_GEMINI] response parsing succeeded', { stage: 'classifyQuestion' });
    return { ...parsed, allowedTools: tools };
  } catch (error) {
    error.jagoStage = 'parseClassification';
    console.error('[JAGO_GEMINI] response processing failed', {
      stage: 'parseClassification',
      ...sanitizeGeminiError(error, prompt),
    });
    throw error;
  }
}

async function generateGroundedResponse(message, language, toolResult, clientFactory = createClient, onRequestStarted) {
  const response = await requestGemini('answerQuestion', {
    contents: [
      'You are JAGO, a concise scholarship assistant. Follow these rules strictly: ',
      'Never invent application status, eligibility, beneficiary counts, or government statistics. ',
      'Never claim live access to UDISE+, APAAR, OTR, DigiLocker, or government databases. ',
      'Never expose secrets or unnecessary candidate identifiers. Synthetic candidate records must remain clearly synthetic. ',
      'A potential unreached result means only a potential coverage gap for review/outreach, not confirmed ineligibility or non-beneficiary status. ',
      'Preserve official scheme names. If supplied tool data says unavailable, say it is unavailable. ',
      `Respond in ${languageName(language)}. Keep the answer concise and student-friendly.\n`,
      `User question: ${message}\n`,
      `Approved backend tool result (source of truth): ${JSON.stringify(toolResult)}`,
    ].join(''),
  }, clientFactory, onRequestStarted);
  const text = response.text;
  if (typeof text !== 'string' || !text.trim()) throw new Error('Model returned no response.');
  return text.trim();
}

async function answerQuestion(message, role, language, toolResult, routedIntent, clientFactory = createClient, onRequestStarted) {
  const intent = routedIntent || await classifyQuestion(message, role, language, clientFactory);
  if (intent.tool !== 'none' && !intent.allowedTools.includes(intent.tool)) {
    const error = new Error('Requested tool is not allowed for this role.');
    error.code = 'TOOL_FORBIDDEN';
    throw error;
  }
  return {
    intent: intent.intent,
    tool: intent.tool,
    answer: await generateGroundedResponse(message, language, toolResult, clientFactory, onRequestStarted),
  };
}

module.exports = { classifyQuestion, answerQuestion, STUDENT_TOOLS, ADMIN_TOOLS };
