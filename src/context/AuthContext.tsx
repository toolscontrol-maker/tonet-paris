'use client';

import {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  type ReactNode,
} from 'react';
import { useRouter, usePathname } from 'next/navigation';
import type { User } from '@/lib/auth';
import * as authService from '@/lib/auth';

// ── Context shape ──────────────────────────────────────────────────

interface AuthContextValue {
  user: User | null;
  isLoading: boolean;
  /** Register with email + password */
  register: (email: string, password: string, firstName: string, lastName: string) => Promise<string | null>;
  /** Login with email + password */
  login: (email: string, password: string) => Promise<string | null>;
  /** Login / register with Google (simulated in dev) */
  loginWithGoogle: () => Promise<string | null>;
  /** Update profile fields */
  updateProfile: (updates: Partial<Omit<User, 'id' | 'email' | 'provider' | 'createdAt'>>) => void;
  /** Logout and redirect to home */
  logout: () => void;
  /** Check if email already registered */
  emailExists: (email: string) => boolean;
  /** Set a URL to redirect to after login */
  setRedirectAfterLogin: (url: string) => void;
}

const AuthContext = createContext<AuthContextValue | null>(null);

const REDIRECT_KEY = 'auth_redirect_after_login';

// ── Provider ───────────────────────────────────────────────────────

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();

  // Rehydrate session on mount
  useEffect(() => {
    const session = authService.getSession();
    setUser(session);
    setIsLoading(false);
  }, []);

  const handlePostLogin = useCallback((u: User, isNew?: boolean) => {
    setUser(u);

    // Check if there's a redirect URL saved
    const redirectUrl = sessionStorage.getItem(REDIRECT_KEY);
    sessionStorage.removeItem(REDIRECT_KEY);

    if (isNew || !u.onboardingComplete) {
      router.push('/account/welcome');
    } else if (redirectUrl) {
      router.push(redirectUrl);
    } else {
      router.push('/account');
    }
  }, [router]);

  const registerFn = useCallback(async (
    email: string, password: string, firstName: string, lastName: string
  ): Promise<string | null> => {
    const result = await authService.register(email, password, firstName, lastName);
    if (!result.success) return result.error ?? 'Registration failed';
    handlePostLogin(result.user!, result.isNew);
    return null;
  }, [handlePostLogin]);

  const loginFn = useCallback(async (email: string, password: string): Promise<string | null> => {
    const result = await authService.login(email, password);
    if (!result.success) return result.error ?? 'Login failed';
    handlePostLogin(result.user!);
    return null;
  }, [handlePostLogin]);

  const loginWithGoogleFn = useCallback(async (): Promise<string | null> => {
    const result = await authService.loginWithGoogle();
    if (!result.success) return result.error ?? 'Google sign-in failed';
    handlePostLogin(result.user!, result.isNew);
    return null;
  }, [handlePostLogin]);

  const updateProfileFn = useCallback((
    updates: Partial<Omit<User, 'id' | 'email' | 'provider' | 'createdAt'>>
  ) => {
    const updated = authService.updateProfile(updates);
    if (updated) setUser(updated);
  }, []);

  const logoutFn = useCallback(() => {
    authService.logout();
    setUser(null);
    router.push('/');
  }, [router]);

  const emailExistsFn = useCallback((email: string) => {
    return authService.emailExists(email);
  }, []);

  const setRedirectAfterLogin = useCallback((url: string) => {
    sessionStorage.setItem(REDIRECT_KEY, url);
  }, []);

  return (
    <AuthContext.Provider value={{
      user,
      isLoading,
      register: registerFn,
      login: loginFn,
      loginWithGoogle: loginWithGoogleFn,
      updateProfile: updateProfileFn,
      logout: logoutFn,
      emailExists: emailExistsFn,
      setRedirectAfterLogin,
    }}>
      {children}
    </AuthContext.Provider>
  );
}

// ── Hooks ──────────────────────────────────────────────────────────

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}

/**
 * Route guard hook — redirects to /login if not authenticated.
 * Returns the user (guaranteed non-null after loading).
 */
export function useRequireAuth(): { user: User | null; isLoading: boolean } {
  const { user, isLoading, setRedirectAfterLogin } = useAuth();
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    if (!isLoading && !user) {
      setRedirectAfterLogin(pathname);
      router.push('/login');
    }
  }, [isLoading, user, router, pathname, setRedirectAfterLogin]);

  return { user, isLoading };
}
