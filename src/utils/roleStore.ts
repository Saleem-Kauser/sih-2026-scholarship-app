export type PrototypeRole = 'student' | 'admin';

type RoleListener = () => void;
const listeners = new Set<RoleListener>();
let role: PrototypeRole = 'student';
let roleVersion = 0;
let roleSelectionComplete = false;

function notifyRoleChanged() {
  roleVersion += 1;
  listeners.forEach((listener) => listener());
}

/** Prototype role selection only. This is not authentication or authorization. */
export function setRole(nextRole: PrototypeRole) {
  if (role === nextRole && roleSelectionComplete) return;
  role = nextRole;
  roleSelectionComplete = true;
  notifyRoleChanged();
}

export function setRoleAndNavigate(nextRole: PrototypeRole, navigate: () => void) {
  setRole(nextRole);
  navigate();
}

export function getRole(): PrototypeRole {
  return role;
}

export function hasSelectedRole(): boolean {
  return roleSelectionComplete;
}

export function subscribeRole(listener: RoleListener): () => void {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

export function getRoleVersion(): number {
  return roleVersion;
}
