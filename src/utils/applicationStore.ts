/**
 * TEMPORARY APPLICATION STATE STORE
 * 
 * This is a lightweight in-memory store for the JAGO prototype.
 * 
 * PURPOSE:
 * - Avoid passing large objects through URL parameters
 * - Maintain form state across navigation steps
 * - Act as a placeholder for proper state management
 * 
 * PRODUCTION REPLACEMENT:
 * This should be replaced with one of:
 * - Redux / Redux Toolkit
 * - Zustand
 * - Jotai / Recoil
 * - Context API with proper provider architecture
 * - Backend API with session/user state
 * 
 * LIFECYCLE:
 * - Data persists in memory during the application flow
 * - Should be cleared when the user completes submission or exits
 * - Data is NOT persisted across app restarts (by design, for prototype)
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
}

// In-memory store
let state: ApplicationState = {};

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
}

/**
 * Set student information
 */
export function setStudentInfo(info: StudentInfo) {
  state.studentInfo = info;
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
}

/**
 * Get selected scheme
 */
export function getSchemeId(): string | undefined {
  return state.schemeId;
}

/**
 * Clear all application state (call when exiting flow or on successful submission)
 */
export function clearApplicationState() {
  state = {};
}