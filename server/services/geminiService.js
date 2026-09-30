const { GoogleGenAI } = require('@google/genai');

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

function sanitizeGeminiError(error) {
  const apiKey = process.env.GEMINI_API_KEY;
  let message = typeof error?.message === 'string' ? error.message : 'Unknown Gemini error';
  if (apiKey) message = message.split(apiKey).join('[REDACTED]');
  message = message
    .replace(/Bearer\s+[^\s"']+/gi, 'Bearer [REDACTED]')
    .replace(/([?&](?:key|api_key|token)=)[^&\s]+/gi, '$1[REDACTED]')
    .slice(0, 300);
  return {
    name: typeof error?.name === 'string' ? error.name.slice(0, 80) : 'Error',
    message,
    status: typeof error?.status === 'number' || typeof error?.status === 'string'
      ? String(error.status).slice(0, 40)
      : undefined,
  };
}

async function requestGemini(stage, payload, clientFactory) {
  const model = process.env.GEMINI_MODEL || 'gemini-2.5-flash';
  console.info('[JAGO_GEMINI] request started', {
    stage,
    apiKeyConfigured: Boolean(process.env.GEMINI_API_KEY),
    model,
  });
  try {
    const ai = clientFactory();
    const response = await ai.models.generateContent({ model, ...payload });
    console.info('[JAGO_GEMINI] request succeeded', {
      stage,
      model,
      responseTextLength: typeof response?.text === 'string' ? response.text.length : 0,
    });
    return response;
  } catch (error) {
    console.error('[JAGO_GEMINI] request failed', {
      stage,
      model,
      ...sanitizeGeminiError(error),
    });
    throw error;
  }
}

async function classifyQuestion(message, role, language, clientFactory = createClient) {
  const tools = role === 'admin' ? ADMIN_TOOLS : STUDENT_TOOLS;
  const allowed = [...tools, 'none'];
  const response = await requestGemini('classifyQuestion', {
    contents: [
      'Classify the user question for JAGO. Return only schema-conforming JSON. ',
      `Role=${role}; language=${languageName(language)}. `,
      `Allowed tools for this role: ${tools.join(', ')}. Choose none if no listed tool is needed. `,
      'Never infer government or scholarship facts. The tool lookup is the source of truth. ',
      `Question: ${message}`,
    ].join(''),
    config: {
      responseMimeType: 'application/json',
      responseJsonSchema: {
        type: 'object',
        properties: {
          intent: { type: 'string' },
          tool: { type: 'string', enum: allowed },
          requiresTool: { type: 'boolean' },
        },
        required: ['intent', 'tool', 'requiresTool'],
        additionalProperties: false,
      },
      maxOutputTokens: 128,
      temperature: 0,
    },
  }, clientFactory);

  const parsed = parseJson(response.text);
  if (!allowed.includes(parsed.tool) || typeof parsed.requiresTool !== 'boolean' || typeof parsed.intent !== 'string') {
    throw new Error('Invalid intent response.');
  }
  if ((parsed.tool === 'none') === parsed.requiresTool) throw new Error('Inconsistent intent response.');
  return { ...parsed, allowedTools: tools };
}

async function generateGroundedResponse(message, language, toolResult, clientFactory = createClient) {
  const response = await requestGemini('generateGroundedResponse', {
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
    config: { maxOutputTokens: 320, temperature: 0.2 },
  }, clientFactory);
  const text = response.text;
  if (typeof text !== 'string' || !text.trim()) throw new Error('Model returned no response.');
  return text.trim();
}

async function answerQuestion(message, role, language, toolResult, routedIntent, clientFactory = createClient) {
  const intent = routedIntent || await classifyQuestion(message, role, language, clientFactory);
  if (intent.tool !== 'none' && !intent.allowedTools.includes(intent.tool)) {
    const error = new Error('Requested tool is not allowed for this role.');
    error.code = 'TOOL_FORBIDDEN';
    throw error;
  }
  return { intent: intent.intent, tool: intent.tool, answer: await generateGroundedResponse(message, language, toolResult, clientFactory) };
}

module.exports = { classifyQuestion, answerQuestion, STUDENT_TOOLS, ADMIN_TOOLS };
