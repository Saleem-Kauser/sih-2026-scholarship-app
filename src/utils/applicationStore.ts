import { initialApplications, initialStudentDocuments } from '@/data/mockApplicationData';
import type { ScholarshipApplicationItem, StudentDocument } from '@/types/verification';

type ApplicationStoreListener = () => void;
const listeners = new Set<ApplicationStoreListener>();
let storeVersion = 0;

export interface ApplicationStoreSnapshot {
  version: number;
  state: ApplicationState;
}

let storeSnapshot: ApplicationStoreSnapshot;

function notifyStoreChanged() {
  storeVersion += 1;
  storeSnapshot = { version: storeVersion, state };
  listeners.forEach((listener) => listener());
}

export function subscribeApplicationStore(listener: ApplicationStoreListener): () => void {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

export function getApplicationStoreVersion(): number {
  return storeVersion;
}

export function getApplicationStoreSnapshot(): ApplicationStoreSnapshot {
  return storeSnapshot;
}

/**
 * TEMPORARY APPLICATION STATE STORE
 * 
 * Extended for JAGO SIH 2026 connected prototype.
 */

export interface StudentInfo {
  fullName: string;
  dateOfBirth: string;
  mobileNumber: string;
  email: string;
  stStatus: string;
  state: string;
  institutionName: string;
  courseClass: string;
  academicYear: string;
}

export interface ApplicationState {
  schemeId?: string;
  studentInfo?: StudentInfo;
  applications?: ScholarshipApplicationItem[];
  documents?: StudentDocument[];
}

function documentKey(document: Pick<StudentDocument, 'name' | 'type'>): string {
  const value = `${document.name} ${document.type}`.toLowerCase();

  if (value.includes('income')) return 'income-certificate';
  if (value.includes('domicile') || value.includes('residence')) return 'domicile-certificate';
  if (value.includes('caste') || value.includes('community') || value.includes('scheduled tribe') || value.includes('st certificate')) {
    return 'st-certificate';
  }

  return value.replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
}

export function getStableDocumentId(documentType: string): string {
  return `doc-${documentKey({ name: documentType, type: documentType })}`;
}

function deriveApplicationStatus(documents: StudentDocument[]): ScholarshipApplicationItem['status'] {
  if (documents.some((document) => document.status === 'manual_review' || document.status === 'failed')) {
    return 'action_required';
  }

  if (documents.length > 0 && documents.every((document) => document.status === 'verified')) {
    return 'sanction_pending';
  }

  return 'under_verification';
}

// Global prototype in-memory state initialized with demo records
let state: ApplicationState = {
  applications: [...initialApplications],
  documents: [...initialStudentDocuments],
};

storeSnapshot = { version: storeVersion, state };

let applicationSequence = 1;

export function createApplicationId(): string {
  const id = `JAGO-2026-${String(applicationSequence).padStart(6, '0')}`;
  applicationSequence += 1;
  return id;
}

/**
 * Get current application state
 */
export function getApplicationState(): ApplicationState {
  return { ...state };
}

/**
 * Update application state
 */
export function updateApplicationState(updates: Partial<ApplicationState>) {
  state = { ...state, ...updates };
  notifyStoreChanged();
}

/**
 * Set student information
 */
export function setStudentInfo(info: StudentInfo) {
  state.studentInfo = info;
  notifyStoreChanged();
}

/**
 * Get student information
 */
export function getStudentInfo(): StudentInfo | undefined {
  return state.studentInfo;
}

/**
 * Set selected scheme
 */
export function setSchemeId(schemeId: string) {
  state.schemeId = schemeId;
  notifyStoreChanged();
}

/**
 * Get selected scheme
 */
export function getSchemeId(): string | undefined {
  return state.schemeId;
}

/**
 * Get all student document wallet items
 */
export function getStudentDocuments(): StudentDocument[] {
  return state.documents || initialStudentDocuments;
}

/**
 * Get all active scholarship applications
 */
export function getApplications(): ScholarshipApplicationItem[] {
  return state.applications || initialApplications;
}

/** Add or replace wallet records and synchronize copies held by applications. */
export function upsertStudentDocuments(documents: StudentDocument[]) {
  const currentDocuments = state.documents || [];
  const mergedDocuments = [...currentDocuments];

  for (const document of documents) {
    const existingIndex = mergedDocuments.findIndex((item) => documentKey(item) === documentKey(document));
    if (existingIndex === -1) {
      mergedDocuments.push({ ...document, id: getStableDocumentId(document.type) });
    } else {
      mergedDocuments[existingIndex] = {
        ...mergedDocuments[existingIndex],
        ...document,
        id: mergedDocuments[existingIndex].id,
      };
    }
  }

  state.documents = mergedDocuments;

  if (state.applications) {
    state.applications = state.applications.map((application) => {
      const documentsForApplication = application.documents.map((document) =>
        mergedDocuments.find((item) => documentKey(item) === documentKey(document)) || document
      );
      const status = deriveApplicationStatus(documentsForApplication);

      return {
        ...application,
        documents: documentsForApplication,
        status,
        pendingAction: status === 'action_required'
          ? 'One or more documents require manual verifier review.'
          : status === 'sanction_pending'
          ? 'All required documents verified. Application pending final sanction.'
          : application.pendingAction,
      };
    });
  }

  notifyStoreChanged();
}

/**
 * Add a newly submitted application to store
 */
export function addApplication(app: ScholarshipApplicationItem) {
  const status = deriveApplicationStatus(app.documents);
  state.applications = [{
    ...app,
    status,
    pendingAction: status === 'action_required'
      ? 'One or more documents require manual verifier review.'
      : status === 'sanction_pending'
      ? 'All required documents verified. Application pending final sanction.'
      : app.pendingAction,
  }, ...(state.applications || [])];
  notifyStoreChanged();
}

/**
 * Approve a document under manual review (Verifier Action)
 */
export function approveDocumentManualReview(docId: string) {
  if (state.documents) {
    state.documents = state.documents.map((d) =>
      d.id === docId
        ? {
            ...d,
            status: 'verified' as const,
            lastVerificationResult: 'Approved via Verifier Manual Review Dashboard',
            manualReviewReason: undefined,
          }
        : d
    );
  }

  if (state.applications) {
    state.applications = state.applications.map((app) => {
      const documents = app.documents.map((d) =>
        d.id === docId
          ? {
              ...d,
              status: 'verified' as const,
              lastVerificationResult: 'Approved via Verifier Manual Review Dashboard',
              manualReviewReason: undefined,
            }
          : d
      );
      const status = deriveApplicationStatus(documents);

      return {
        ...app,
        documents,
        status,
        pendingAction: status === 'action_required'
          ? 'One or more documents require manual verifier review.'
          : 'All required documents verified. Application pending final sanction.',
      };
    });
  }

  notifyStoreChanged();
}

/**
 * Clear all application state
 */
export function clearApplicationState() {
  state = {
    applications: [...initialApplications],
    documents: [...initialStudentDocuments],
  };
  notifyStoreChanged();
}