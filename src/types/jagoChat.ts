import type { ScholarshipScheme } from '@/data/scholarships';
import type { JagoLanguage } from '@/i18n';
import type { ScholarshipApplicationItem, StudentDocument } from '@/types/verification';
import type { PrototypeRole } from '@/utils/roleStore';

export interface StudentChatContext {
  application?: Pick<ScholarshipApplicationItem, 'schemeId' | 'schemeName' | 'schemeShortName' | 'status' | 'appliedDate' | 'pendingAction'> & {
    documents: Pick<StudentDocument, 'name' | 'type' | 'status' | 'source' | 'manualReviewReason'>[];
  };
  scholarships: Pick<ScholarshipScheme, 'id' | 'name' | 'shortName' | 'description' | 'portal' | 'requiredDocuments'>[];
}

export interface AdminChatContext {
  applicationCounts: Record<string, number>;
  schemes: { name: string; count: number; underVerification: number }[];
  verificationSummary: Record<string, number>;
}

export interface JagoChatRequest {
  message: string;
  role: PrototypeRole;
  language: JagoLanguage;
  sessionId: string;
  studentContext?: StudentChatContext;
  adminContext?: AdminChatContext;
}

export interface JagoChatResponse {
  answer: string;
  intent: string;
  tool: string;
  language: JagoLanguage;
  source: 'backend-tool+gemini';
  prototypeRole: true;
}
