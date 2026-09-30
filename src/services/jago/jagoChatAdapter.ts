import type { JagoChatRequest, JagoChatResponse } from '@/types/jagoChat';

export class JagoChatError extends Error {
  constructor(message: string, public readonly code: string, public readonly status: number) {
    super(message);
    this.name = 'JagoChatError';
  }
}

function getBackendUrl(): string {
  return process.env.EXPO_PUBLIC_BACKEND_URL || 'https://jago-backend-3jm7.onrender.com';
}

export async function sendJagoMessage(payload: JagoChatRequest): Promise<JagoChatResponse> {
  let response: Response;
  try {
    response = await fetch(`${getBackendUrl()}/api/jago/chat`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });
  } catch {
    throw new JagoChatError('JAGO could not reach the backend.', 'NETWORK_UNAVAILABLE', 0);
  }

  let data: unknown;
  try {
    data = await response.json();
  } catch {
    throw new JagoChatError('JAGO received an invalid response.', 'INVALID_RESPONSE', response.status);
  }

  if (!response.ok) {
    const errorData = data as { code?: unknown; error?: unknown };
    const message = typeof errorData?.error === 'string' ? errorData.error : 'JAGO could not complete that request.';
    const code = typeof errorData?.code === 'string' ? errorData.code : 'REQUEST_FAILED';
    throw new JagoChatError(message, code, response.status);
  }

  const result = data as Partial<JagoChatResponse>;
  if (typeof result.answer !== 'string' || typeof result.intent !== 'string' || result.language !== payload.language) {
    throw new JagoChatError('JAGO received an invalid response.', 'INVALID_RESPONSE', response.status);
  }
  return result as JagoChatResponse;
}
