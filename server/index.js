/**
 * JAGO Verification Backend Server (SIH 2026 Prototype)
 * 
 * Secure backend service for DigiLocker Sandbox communication.
 * Keeps API keys, tokens, and client secrets strictly isolated on the server.
 */

const express = require('express');
const cors = require('cors');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3001;

app.set('trust proxy', 1);
app.use(cors());
app.use(express.json({ limit: '16kb' }));

/**
 * Health check endpoint
 */
app.get('/api/health', (req, res) => {
  res.json({
    status: 'online',
    service: 'JAGO Verification Backend',
    sandboxEnabled: process.env.DIGILOCKER_SANDBOX_ENABLED === 'true',
  });
});

app.use('/api/mock/benefit-gap', require('./routes/mockBenefitGap'));
app.use('/api/jago', require('./routes/jagoChat'));

const SOURCE = 'DigiLocker Sandbox';

// Confirmed by API Setu Sandbox "Issued Documents" API.
const SANDBOX_BASE_URL = (process.env.DIGILOCKER_SANDBOX_BASE_URL || 'https://dev-meripehchaan.dl6.in').replace(/\/+$/, '');
const ISSUED_PATH = '/public/oauth2/2/files/issued';
const REQUEST_TIMEOUT_MS = 15000;

/**
 * Extract an attribute value from the first occurrence of <tagName ... attrName="..."> in the XML.
 * DigiLocker certificates carry identity data in attributes (Person@name, Certificate@number, ...).
 */
function extractXmlAttr(xmlString, tagName, attrName) {
  if (!xmlString) return null;
  const tagMatch = xmlString.match(new RegExp(`<${tagName}(?=[\\s/>])([^>]*)>`, 'i'));
  if (!tagMatch) return null;
  const attrMatch = tagMatch[1].match(new RegExp(`(?:^|\\s)${attrName}\\s*=\\s*(?:"([^"]*)"|'([^']*)')`, 'i'));
  if (!attrMatch) return null;
  const raw = (attrMatch[1] !== undefined ? attrMatch[1] : attrMatch[2]).trim();
  const decoded = raw
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&apos;/g, "'")
    .replace(/&amp;/g, '&');
  return decoded || null;
}

function normalizeName(name) {
  return (name || '')
    .toLowerCase()
    .replace(/[^\p{L}\p{N}\s]/gu, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

/** Every token of the shorter name must appear in the longer one (handles initials/ordering). */
function namesMatch(a, b) {
  const na = normalizeName(a);
  const nb = normalizeName(b);
  if (!na || !nb) return false;
  if (na === nb) return true;
  const ta = na.split(' ');
  const tb = nb.split(' ');
  const [shorter, longer] = ta.length <= tb.length ? [ta, tb] : [tb, ta];
  return shorter.every((t) => longer.includes(t));
}

function documentMatches(item, requestedType) {
  const requested = normalizeName(requestedType);
  const candidate = normalizeName([
    item?.name,
    item?.type,
    item?.doctype,
    item?.description,
    item?.issuer,
  ].filter(Boolean).join(' '));

  if (!requested || !candidate) return false;
  if (requested.includes('income')) return candidate.includes('income');
  if (requested.includes('domicile') || requested.includes('residence')) {
    return candidate.includes('domicile') || candidate.includes('residence');
  }
  if (requested.includes('caste') || requested.includes('community') || requested.includes('scheduled tribe') || requested.includes('st certificate')) {
    return candidate.includes('caste') || candidate.includes('community') || candidate.includes('tribe');
  }

  const requestedTokens = requested.split(' ').filter((token) => token.length > 2 && token !== 'certificate');
  return requestedTokens.length > 0 && requestedTokens.every((token) => candidate.includes(token));
}

function today() {
  return new Date().toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });
}

/** Non-success result. Never verified; the client falls back to e-District. */
function unresolved(documentType, message, failureReason, reference = 'N/A') {
  return {
    verified: false,
    status: 'pending',
    source: SOURCE,
    documentType: documentType || 'Unknown Document',
    documentName: documentType || 'Unknown Document',
    message,
    reference,
    verifiedAt: today(),
    needsManualReview: false,
    failureReason,
  };
}

/**
 * POST /api/verify/digilocker
 *
 * Flow: Issued Documents -> match document -> certificate XML -> parse attributes -> compare name.
 */
app.post('/api/verify/digilocker', async (req, res) => {
  const documentType = req.body?.documentType;
  const studentInfo = req.body?.studentInfo;

  try {
    if (typeof documentType !== 'string' || !documentType.trim()) {
      return res.status(400).json(unresolved(documentType, 'documentType is required.', 'Missing documentType'));
    }

    const accessToken = process.env.DIGILOCKER_ACCESS_TOKEN;
    const sandboxEnabled = process.env.DIGILOCKER_SANDBOX_ENABLED === 'true';

    if (!sandboxEnabled || !accessToken) {
      console.log('[DigiLocker Sandbox] Lookup skipped: sandbox disabled or access token not configured.');
      return res.json(unresolved(
        documentType,
        'DigiLocker Sandbox is not configured in the backend environment. Triggering secondary fallback.',
        'Sandbox disabled or DIGILOCKER_ACCESS_TOKEN missing in backend .env'
      ));
    }

    const headers = { Authorization: `Bearer ${accessToken}` };

    // Step 1: Issued documents
    const issuedUrl = `${SANDBOX_BASE_URL}${ISSUED_PATH}`;
    let issuedResponse;
    try {
      issuedResponse = await fetch(issuedUrl, {
        method: 'GET',
        headers: { ...headers, Accept: 'application/json' },
        signal: AbortSignal.timeout(REQUEST_TIMEOUT_MS),
      });
    } catch (netErr) {
      console.error('[DigiLocker Sandbox] Network error on issued documents request:', netErr.message);
      return res.json(unresolved(documentType, 'Unable to reach the DigiLocker Sandbox.', `Network error: ${netErr.message}`));
    }

    console.log(`[DigiLocker Sandbox] Issued documents responded HTTP ${issuedResponse.status} (host: ${new URL(SANDBOX_BASE_URL).host})`);

    if (!issuedResponse.ok) {
      return res.json(unresolved(
        documentType,
        `DigiLocker Sandbox returned HTTP ${issuedResponse.status} for issued documents. Verification unresolved.`,
        `Issued documents HTTP ${issuedResponse.status}`
      ));
    }

    let issuedData;
    try {
      issuedData = await issuedResponse.json();
    } catch {
      return res.json(unresolved(documentType, 'DigiLocker Sandbox returned an unreadable issued documents response.', 'Issued documents response not JSON'));
    }
    const items = Array.isArray(issuedData?.items) ? issuedData.items : [];
    console.log(`[DigiLocker Sandbox] Issued documents count: ${items.length}`);

    // Step 2: Match document using real response fields (name, uri, mime)
    const matchedItem = items.find(
      (item) => typeof item?.uri === 'string' && documentMatches(item, documentType)
    );

    if (!matchedItem) {
      return res.json(unresolved(documentType, 'Document not found in the DigiLocker issued documents list.', 'Document record missing in DigiLocker repository'));
    }

    if (!String(matchedItem.mime || '').toLowerCase().includes('xml')) {
      return res.json(unresolved(
        documentType,
        'Matched document has no machine-readable XML available, so it cannot be verified automatically.',
        `Matched document mime is "${matchedItem.mime || 'unknown'}", not XML`,
        matchedItem.uri
      ));
    }

    // Step 3: Certificate XML.
    // The path /public/oauth2/1/xml/{uri} is from the DigiLocker Authorized Partner API spec, but the
    // Sandbox host for this call must be confirmed from the Sandbox request sample, so it is configured
    // explicitly (DIGILOCKER_XML_ENDPOINT) rather than hardcoded.
    const xmlBase = (process.env.DIGILOCKER_XML_ENDPOINT || '').replace(/\/+$/, '');
    if (!xmlBase) {
      return res.json(unresolved(
        documentType,
        'Certificate XML endpoint is not configured (DIGILOCKER_XML_ENDPOINT). Cannot complete verification.',
        'DIGILOCKER_XML_ENDPOINT not configured',
        matchedItem.uri
      ));
    }
    if (!/^[A-Za-z0-9._\-:]+$/.test(matchedItem.uri)) {
      return res.json(unresolved(documentType, 'Document URI has an unexpected format; refusing to request it.', 'Unexpected URI format', 'N/A'));
    }

    let fileResponse;
    try {
      fileResponse = await fetch(`${xmlBase}/${matchedItem.uri}`, {
        method: 'GET',
        headers: { ...headers, Accept: 'application/xml' },
        signal: AbortSignal.timeout(REQUEST_TIMEOUT_MS),
      });
    } catch (netErr) {
      console.error('[DigiLocker Sandbox] Network error on XML request:', netErr.message);
      return res.json(unresolved(documentType, 'Unable to retrieve certificate XML from the DigiLocker Sandbox.', `Network error: ${netErr.message}`, matchedItem.uri));
    }

    console.log(`[DigiLocker Sandbox] Certificate XML responded HTTP ${fileResponse.status}`);

    if (!fileResponse.ok) {
      return res.json(unresolved(
        documentType,
        `Certificate XML retrieval failed with HTTP ${fileResponse.status}.`,
        `Certificate XML HTTP ${fileResponse.status}`,
        matchedItem.uri
      ));
    }

    const xmlPayload = await fileResponse.text();

    // Step 4: Attribute-based parsing
    const certName = extractXmlAttr(xmlPayload, 'Person', 'name');
    const certNumber = extractXmlAttr(xmlPayload, 'Certificate', 'number');
    const certType = extractXmlAttr(xmlPayload, 'Certificate', 'type');
    const certIssuer = extractXmlAttr(xmlPayload, 'Organization', 'name');
    const certDob = extractXmlAttr(xmlPayload, 'Person', 'dob');
    console.log(`[DigiLocker Sandbox] XML fields found: name=${!!certName} number=${!!certNumber} issuer=${!!certIssuer} dob=${!!certDob}`);

    // Step 5: Null guards. Never succeed without extractable identity data.
    if (!certName) {
      return res.json(unresolved(documentType, 'Certificate holder name could not be extracted from the DigiLocker certificate.', 'Person@name missing from certificate XML', matchedItem.uri));
    }
    if (!certNumber) {
      return res.json(unresolved(documentType, 'Certificate number could not be extracted from the DigiLocker certificate.', 'Certificate@number missing from certificate XML', matchedItem.uri));
    }

    const studentName = studentInfo?.fullName;
    if (!normalizeName(studentName)) {
      return res.json(unresolved(documentType, 'Student name not provided, so the certificate holder cannot be compared.', 'studentInfo.fullName missing', matchedItem.uri));
    }

    if (!namesMatch(studentName, certName)) {
      return res.json(unresolved(
        documentType,
        'Name on the DigiLocker certificate does not match the student application profile.',
        'Name mismatch on DigiLocker record',
        matchedItem.uri
      ));
    }

    const extractedData = {
      'Certificate Number': certNumber,
      'Holder Name': certName,
      'Verification Method': 'DigiLocker Sandbox XML attribute match',
    };
    if (certType) extractedData['Document Type'] = certType;
    if (certIssuer) extractedData['Issuer'] = certIssuer;
    if (certDob) extractedData['Date of Birth'] = certDob;

    return res.json({
      verified: true,
      status: 'verified',
      source: SOURCE,
      documentType,
      documentName: matchedItem.name || documentType,
      message: 'Certificate verified via DigiLocker Sandbox XML attribute match.',
      reference: matchedItem.uri,
      verifiedAt: today(),
      needsManualReview: false,
      extractedData,
    });
  } catch (error) {
    console.error('[DigiLocker Sandbox] Unexpected server error during verification:', error.message);
    return res.status(500).json(unresolved(documentType, 'Internal server error during DigiLocker verification.', error.message));
  }
});

app.use((error, req, res, next) => {
  if (error instanceof SyntaxError && error.status === 400 && 'body' in error) {
    return res.status(400).json({ code: 'INVALID_JSON', error: 'Request body must be valid JSON.' });
  }
  console.error('[Backend] Request failed. Internal details are suppressed.');
  return res.status(500).json({ error: 'The request could not be completed.' });
});

app.listen(PORT, '0.0.0.0', () => {
  console.log(`JAGO Verification Backend listening on port ${PORT}`);
});