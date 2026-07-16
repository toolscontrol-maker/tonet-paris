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
import { supabase } from '@/lib/supabase';

// ── Context shape ──────────────────────────────────────────────────

interface AuthContextValue {
  user: User | null;
  isLoading: boolean;
  /** Register with email + password */
  register: (email: string, password: string, firstName: string, lastName: string) => Promise<string | null>;
  /** Login with email + password */
  login: (email: string, password: string) => Promise<string | null>;
  /** Login / register with Google */
  loginWithGoogle: () => Promise<string | null>;
  /** Update profile fields */
  updateProfile: (updates: Partial<Omit<User, 'id' | 'email' | 'provider' | 'createdAt'>>) => Promise<void>;
  /** Logout and redirect to home */
  logout: () => void;
  /** Check if email already registered */
  emailExists: (email: string) => Promise<boolean>;
  /** Set a URL to redirect to after login */
  setRedirectAfterLogin: (url: string) => void;
}

const AuthContext = createContext<AuthContextValue | null>(null);

const REDIRECT_KEY = 'auth_redirect_after_login';

// ── Provider ───────────────────────────────────────────────────────

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [pendingRedirect, setPendingRedirect] = useState<string | null>(null);
  const router = useRouter();

  // Listen to Supabase auth state and unified Firestore profiles
  useEffect(() => {
    let active = true;
    let unsubscribe: { unsubscribe: () => void } | null = null;

    // Safety timeout: force loading to false if Supabase fails silently or is misconfigured
    const safetyTimeout = setTimeout(() => {
      if (active) {
        console.warn('[AuthContext] Safety timeout triggered. Forcing isLoading to false.');
        setIsLoading(false);
      }
    }, 2500);

    const checkLoggedOut = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        if (!session && active) {
          setUser(null);
        }
      } catch (err) {
        console.error('[AuthContext] checkLoggedOut failed:', err);
        if (active) setUser(null);
      }
    };

    try {
      // Listen only to Supabase Auth state
      const { data } = supabase.auth.onAuthStateChange(async (event, session) => {
        if (!active) return;
        clearTimeout(safetyTimeout);
        console.log('[AuthContext] onAuthStateChange event:', event, 'user email:', session?.user?.email);
        try {
          if (session?.user) {
            console.log('[AuthContext] Session user found, fetching profile...');
            let profile = await authService.getUserById(session.user.id);
            console.log('[AuthContext] Profile fetch result:', profile);

            if (!profile && active) {
              console.log('[AuthContext] Profile not found, creating fallback profile...');
              const parts = (session.user.user_metadata?.full_name || '').split(' ');
              const mockUser: User = {
                id: session.user.id,
                email: session.user.email ?? '',
                firstName: session.user.user_metadata?.given_name || parts[0] || '',
                lastName: session.user.user_metadata?.family_name || parts.slice(1).join(' ') || '',
                newsletter: false,
                onboardingComplete: false,
                provider: session.user.app_metadata?.provider === 'google' ? 'google' : 'email',
                createdAt: new Date().toISOString(),
              };
              try {
                const upsertRes = await supabase.from('profiles').upsert(mockUser);
                console.log('[AuthContext] Profile upsert response:', upsertRes);
              } catch (upsertErr) {
                console.error('[AuthContext] upsert profile failed:', upsertErr);
              }
              profile = mockUser;
            }

            if (profile && active) {
              console.log('[AuthContext] Setting user state to:', profile);
              setUser(profile);

              // Clean OAuth access token hash and redirect to /account
              const hasAccessToken = typeof window !== 'undefined' && window.location.hash.includes('access_token');
              console.log('[AuthContext] hasAccessToken:', hasAccessToken, 'event:', event);
              if ((event === 'SIGNED_IN' || event === 'INITIAL_SESSION') && hasAccessToken) {
                console.log('[AuthContext] Access token detected in URL hash. Cleaning hash and redirecting to /account...');
                window.history.replaceState(null, '', window.location.pathname);
                const target = !profile.onboardingComplete ? '/account/welcome' : '/account';
                router.push(target);
              }
            }
          } else {
            console.log('[AuthContext] No session user found. Checking logged out status...');
            await checkLoggedOut();
          }
        } catch (callbackErr) {
          console.error('[AuthContext] Error in onAuthStateChange callback:', callbackErr);
        } finally {
          if (active) {
            console.log('[AuthContext] Setting isLoading to false');
            setIsLoading(false);
          }
        }
      });

      if (data && data.subscription) {
        unsubscribe = data.subscription;
      }
    } catch (err) {
      console.error('[AuthContext] onAuthStateChange subscription failed:', err);
      clearTimeout(safetyTimeout);
      if (active) setIsLoading(false);
    }

    return () => {
      active = false;
      clearTimeout(safetyTimeout);
      if (unsubscribe) {
        try {
          unsubscribe.unsubscribe();
        } catch (unsubErr) {
          console.error('[AuthContext] unsubscribe failed:', unsubErr);
        }
      }
    };
  }, [router]);

  // Navigate only after React confirms user is non-null
  useEffect(() => {
    if (pendingRedirect && user) {
      router.push(pendingRedirect);
      setPendingRedirect(null);
    }
  }, [user, pendingRedirect, router]);

  const handlePostLogin = useCallback((u: User, isNew?: boolean) => {
    const redirectUrl = sessionStorage.getItem(REDIRECT_KEY);
    sessionStorage.removeItem(REDIRECT_KEY);

    let target: string;
    if (isNew || !u.onboardingComplete) {
      target = '/account/welcome';
    } else if (redirectUrl) {
      target = redirectUrl;
    } else {
      target = '/account';
    }

    setUser(u);
    setPendingRedirect(target);
  }, []);

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
    return null;
  }, []);

  const updateProfileFn = useCallback(async (
    updates: Partial<Omit<User, 'id' | 'email' | 'provider' | 'createdAt'>>
  ): Promise<void> => {
    const updated = await authService.updateProfile(updates);
    if (updated) setUser(updated);
  }, []);

  const logoutFn = useCallback(async () => {
    await authService.logout();
    setUser(null);
    router.push('/');
  }, [router]);

  const emailExistsFn = useCallback((email: string): Promise<boolean> => {
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
  if (!ctx) {
    return {
      user: null,
      isLoading: false,
      login: async () => false,
      logout: async () => {},
      register: async () => false,
      emailExists: async () => false,
      setRedirectAfterLogin: () => {},
    };
  }
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
