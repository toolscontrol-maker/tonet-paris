/**
 * Auth & User Service — localStorage implementation
 *
 * ┌──────────────────────────────────────────────────────────────────┐
 * │  BACKEND SWAP GUIDE                                             │
 * │  Replace each function body with a real API call:               │
 * │   • register()       → POST /api/auth/register                  │
 * │   • login()          → POST /api/auth/login                     │
 * │   • loginWithGoogle() → redirect to /api/auth/google            │
 * │   • getSession()     → GET  /api/auth/session (cookie-based)    │
 * │   • updateProfile()  → PATCH /api/users/:id                     │
 * │   • logout()         → POST /api/auth/logout                    │
 * │                                                                  │
 * │  Recommended providers for Google OAuth:                         │
 * │   • NextAuth (Auth.js) — best fit for Next.js App Router        │
 * │   • Supabase Auth — if using Supabase as DB                     │
 * │   • Firebase Auth — if using Firebase                           │
 * └──────────────────────────────────────────────────────────────────┘
 */

// ── Types ──────────────────────────────────────────────────────────

export interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  phone?: string;
  phonePrefix?: string;
  birthDate?: string;
  newsletter: boolean;
  onboardingComplete: boolean;
  provider: 'email' | 'google';
  createdAt: string;
}

export interface AuthResult {
  success: boolean;
  user?: User;
  error?: string;
  isNew?: boolean;
}

// ── Storage keys ───────────────────────────────────────────────────

const USERS_KEY = 'auth_users';          // Record<email, UserRecord>
const SESSION_KEY = 'auth_session';      // { userId, email, token }

interface UserRecord extends User {
  passwordHash: string;   // SHA-256 hash (NOT plain text)
}

interface Session {
  userId: string;
  email: string;
  token: string;          // simple random token for dev
}

// ── Helpers ────────────────────────────────────────────────────────

function getAllUsers(): Record<string, UserRecord> {
  try {
    return JSON.parse(localStorage.getItem(USERS_KEY) || '{}');
  } catch { return {}; }
}

function saveAllUsers(users: Record<string, UserRecord>) {
  localStorage.setItem(USERS_KEY, JSON.stringify(users));
}

function saveSession(session: Session) {
  localStorage.setItem(SESSION_KEY, JSON.stringify(session));
}

function clearSession() {
  localStorage.removeItem(SESSION_KEY);
}

/** Simple SHA-256 hash via Web Crypto API — NOT for production auth */
async function hashPassword(password: string): Promise<string> {
  const encoder = new TextEncoder();
  const data = encoder.encode(password);
  const buffer = await crypto.subtle.digest('SHA-256', data);
  return Array.from(new Uint8Array(buffer)).map(b => b.toString(16).padStart(2, '0')).join('');
}

function generateId(): string {
  return `usr_${Date.now()}_${Math.random().toString(36).slice(2, 9)}`;
}

function generateToken(): string {
  return `tok_${Date.now()}_${Math.random().toString(36).slice(2, 15)}`;
}

function stripPassword(record: UserRecord): User {
  const { passwordHash: _, ...user } = record;
  return user;
}

// ── Public API ─────────────────────────────────────────────────────

/**
 * Register a new user with email + password.
 * → BACKEND: POST /api/auth/register { email, password, firstName, lastName }
 */
export async function register(
  email: string,
  password: string,
  firstName: string,
  lastName: string,
): Promise<AuthResult> {
  const users = getAllUsers();
  const key = email.toLowerCase().trim();

  if (users[key]) {
    return { success: false, error: 'An account with this email already exists.' };
  }

  const id = generateId();
  const hash = await hashPassword(password);

  const record: UserRecord = {
    id,
    email: key,
    firstName: firstName.trim(),
    lastName: lastName.trim(),
    newsletter: false,
    onboardingComplete: false,
    provider: 'email',
    createdAt: new Date().toISOString(),
    passwordHash: hash,
  };

  users[key] = record;
  saveAllUsers(users);
  saveSession({ userId: id, email: key, token: generateToken() });

  return { success: true, user: stripPassword(record), isNew: true };
}

/**
 * Login with email + password.
 * → BACKEND: POST /api/auth/login { email, password }
 */
export async function login(email: string, password: string): Promise<AuthResult> {
  const users = getAllUsers();
  const key = email.toLowerCase().trim();
  const record = users[key];

  if (!record) {
    return { success: false, error: 'No account found with this email.' };
  }

  const hash = await hashPassword(password);
  if (hash !== record.passwordHash) {
    return { success: false, error: 'Incorrect password.' };
  }

  saveSession({ userId: record.id, email: key, token: generateToken() });
  return { success: true, user: stripPassword(record) };
}

/**
 * Simulate Google OAuth login.
 * If the email doesn't exist, creates a new account automatically.
 *
 * → BACKEND: Redirect to Google OAuth flow → callback creates/finds user
 *   For NextAuth: signIn('google')
 *   For Supabase: supabase.auth.signInWithOAuth({ provider: 'google' })
 */
export async function loginWithGoogle(): Promise<AuthResult> {
  // In development, prompt for email to simulate Google returning user info
  const email = prompt('Simulate Google Sign-In\nEnter email:');
  if (!email) return { success: false, error: 'Google sign-in cancelled.' };

  const key = email.toLowerCase().trim();
  const users = getAllUsers();

  if (users[key]) {
    // Existing user — sign in
    saveSession({ userId: users[key].id, email: key, token: generateToken() });
    return { success: true, user: stripPassword(users[key]) };
  }

  // New user — create from "Google profile"
  const firstName = prompt('Simulate Google Profile — First name:') || 'Google';
  const lastName = prompt('Simulate Google Profile — Last name:') || 'User';

  const id = generateId();
  const record: UserRecord = {
    id,
    email: key,
    firstName: firstName.trim(),
    lastName: lastName.trim(),
    newsletter: false,
    onboardingComplete: false,
    provider: 'google',
    createdAt: new Date().toISOString(),
    passwordHash: '', // Google users don't have a password
  };

  users[key] = record;
  saveAllUsers(users);
  saveSession({ userId: id, email: key, token: generateToken() });

  return { success: true, user: stripPassword(record), isNew: true };
}

/**
 * Get current session user, or null if not logged in.
 * → BACKEND: GET /api/auth/session (reads HTTP-only cookie)
 */
export function getSession(): User | null {
  try {
    const raw = localStorage.getItem(SESSION_KEY);
    if (!raw) return null;
    const session: Session = JSON.parse(raw);
    const users = getAllUsers();
    const record = users[session.email];
    return record ? stripPassword(record) : null;
  } catch {
    return null;
  }
}

/**
 * Update user profile fields.
 * → BACKEND: PATCH /api/users/:id { ...fields }
 */
export function updateProfile(updates: Partial<Omit<User, 'id' | 'email' | 'provider' | 'createdAt'>>): User | null {
  const session = getSession();
  if (!session) return null;

  const users = getAllUsers();
  const record = users[session.email];
  if (!record) return null;

  Object.assign(record, updates);
  users[session.email] = record;
  saveAllUsers(users);

  return stripPassword(record);
}

/**
 * Logout — destroy session.
 * → BACKEND: POST /api/auth/logout (clears cookie)
 */
export function logout(): void {
  clearSession();
}

/**
 * Check if an account exists for a given email.
 * → BACKEND: POST /api/auth/check-email { email }
 */
export function emailExists(email: string): boolean {
  const users = getAllUsers();
  return !!users[email.toLowerCase().trim()];
}
