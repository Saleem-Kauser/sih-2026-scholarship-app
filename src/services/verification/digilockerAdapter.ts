import type { VerificationResult } from '@/types/verification';
import type { StudentInfo } from '@/utils/applicationStore';

/**
 * DigiLocker Client Verification Adapter
 * 
 * ARCHITECTURE NOTE:
 * Communicates strictly with the server-side verification endpoint (POST /api/verify/digilocker).
 * Zero API keys or secrets exist inside this mobile client code.
 * 
 * HONEST FALLBACK:
 * If the DigiLocker Sandbox endpoint returns verified: false (due to missing sandbox keys,
 * network offline status, or unissued document status), this adapter returns a controlled
 * status: 'pending' result, allowing VerificationService to fall back to e-District.
 */
export class DigiLockerAdapter {
  private getBackendUrl(): string {
    // Allows local/deployment environment overrides; hosted backend is the production default.
    return process.env.EXPO_PUBLIC_BACKEND_URL || 'https://jago-backend-3jm7.onrender.com';
  }

  /**
   * Verify document by calling the secure JAGO verification backend
   */
  public async verifyDocument(
    documentType: string,
    studentInfo?: StudentInfo
  ): Promise<VerificationResult> {
    const currentDate = new Date().toLocaleDateString('en-GB', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
    });

    const backendUrl = this.getBackendUrl();

    try {
      const response = await fetch(`${backendUrl}/api/verify/digilocker`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          documentType,
          studentInfo,
        }),
      });

      if (response.ok) {
        const result: VerificationResult = await response.json();
        return result;
      }

      return {
        verified: false,
        status: 'pending',
        source: 'DigiLocker Sandbox',
        documentType,
        documentName: documentType,
        message: `DigiLocker backend server returned HTTP status ${response.status}. Attempting secondary fallback.`,
        reference: 'N/A',
        verifiedAt: currentDate,
        needsManualReview: false,
        failureReason: `Backend HTTP status ${response.status}`,
      };
    } catch {
      // Controlled error handling for network offline / server unreachable cases
      console.log(`[DigiLocker Client Adapter] Backend server lookup for "${documentType}" unreachable. Fallback triggered.`);

      return {
        verified: false,
        status: 'pending',
        source: 'DigiLocker Sandbox',
        documentType,
        documentName: documentType,
        message: 'DigiLocker Sandbox backend service unreachable. Triggering e-District fallback.',
        reference: 'N/A',
        verifiedAt: currentDate,
        needsManualReview: false,
        failureReason: 'Backend server connection unavailable',
      };
    }
  }
}

export const digiLockerAdapter = new DigiLockerAdapter();
