import { createContext, useContext, useState, useEffect, useCallback, useRef } from 'react';
import { BASE_URL } from '../config';

const AuthContext = createContext();

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within AuthProvider');
  return context;
};

// ─── Token helpers ────────────────────────────────────────────────────────────
const TOKEN_KEYS = { access: 'access_token', refresh: 'refresh_token', user: 'user' };

const saveTokens   = (access, refresh) => {
  localStorage.setItem(TOKEN_KEYS.access, access);
  localStorage.setItem(TOKEN_KEYS.refresh, refresh);
};
const clearTokens  = () => Object.values(TOKEN_KEYS).forEach(k => localStorage.removeItem(k));
const getStoredTokens = () => ({
  access:  localStorage.getItem(TOKEN_KEYS.access),
  refresh: localStorage.getItem(TOKEN_KEYS.refresh),
});

// ─── Map backend role → app role ────────────────────────────────────────────
// Backend `role` is one of: 'staff' | 'landlord' | 'tenant'.
// The admin portal is gated on app-role 'admin', so 'staff' (and any
// superuser/admin-ish value) is treated as 'admin' for routing purposes.
// The raw backend value is kept on the user object (as `role`) for display.
const deriveRole = (backendRole) => {
  const r = String(backendRole || '').toLowerCase();
  if (r === 'landlord') return 'landlord';
  if (r === 'tenant')   return 'tenant';
  return 'admin'; // 'staff', 'admin', 'superuser', or unknown → admin portal
};

const LOGIN_ENDPOINT      = `${BASE_URL}/users/login/`;
const REFRESH_ENDPOINT    = `${BASE_URL}/users/token/refresh/`;
const OTP_VERIFY_ENDPOINT = `${BASE_URL}/users/otp/verify/`;

// ─── Provider ─────────────────────────────────────────────────────────────────
export const AuthProvider = ({ children }) => {
  const [user,    setUser]    = useState(null);
  const [loading, setLoading] = useState(false);
  const [error,   setError]   = useState(null);
  // True only until the mount-time session restore below has run. Consumers
  // (PrivateRoute) need this to avoid redirecting to login on a hard reload,
  // since `user` is still null for one tick before localStorage is checked.
  const [initializing, setInitializing] = useState(true);
  const refreshTimerRef = useRef(null);
  // Concurrent 401s (e.g. a page firing several authFetch calls at once)
  // must all await the SAME refresh call — see refreshAccessToken below.
  const refreshPromiseRef = useRef(null);

  // Restore session on mount
  useEffect(() => {
    const saved = localStorage.getItem(TOKEN_KEYS.user);
    if (saved) {
      try { setUser(JSON.parse(saved)); } catch { clearTokens(); }
    }
    setInitializing(false);
  }, []);

  // Silent token refresh.
  //
  // If several requests hit a 401 around the same time (a page that fires
  // multiple authFetch calls on mount, say), each used to kick off its own
  // POST to the refresh endpoint. With refresh-token rotation enabled
  // server-side, only the first of those succeeds — the others send a
  // refresh token that's already been invalidated by the winner, get back
  // a 401/500, and each one individually cleared tokens and logged the user
  // out, even though the session was actually still valid. Sharing one
  // in-flight promise means every caller awaits the same request instead.
  const refreshAccessToken = useCallback(() => {
    if (refreshPromiseRef.current) return refreshPromiseRef.current;

    const { refresh } = getStoredTokens();
    if (!refresh) return Promise.reject(new Error('No refresh token'));

    const promise = fetch(REFRESH_ENDPOINT, {
      method:  'POST',
      headers: { 'Content-Type': 'application/json' },
      body:    JSON.stringify({ refresh }),
    })
      .then(async (res) => {
        if (!res.ok) {
          clearTokens();
          setUser(null);
          throw new Error('Session expired. Please log in again.');
        }
        const data = await res.json();
        localStorage.setItem(TOKEN_KEYS.access, data.access);
        // Some backends rotate the refresh token on every use — if it comes
        // back here and we don't save it, the *next* refresh silently uses
        // an already-invalidated token and fails.
        if (data.refresh) localStorage.setItem(TOKEN_KEYS.refresh, data.refresh);
        return data.access;
      })
      .finally(() => {
        refreshPromiseRef.current = null;
      });

    refreshPromiseRef.current = promise;
    return promise;
  }, []);

  // Authenticated fetch — attaches Bearer token, retries once on 401
  const authFetch = useCallback(async (url, options = {}) => {
    let { access } = getStoredTokens();
    const isFormData = typeof FormData !== 'undefined' && options.body instanceof FormData;

    const makeRequest = (token) =>
      fetch(url, {
        ...options,
        headers: {
          // FormData needs the browser to set its own multipart boundary —
          // forcing JSON here breaks any request that uploads a file.
          ...(isFormData ? {} : { 'Content-Type': 'application/json' }),
          ...(options.headers || {}),
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
      });

    let res = await makeRequest(access);

    if (res.status === 401) {
      try {
        access = await refreshAccessToken();
        res    = await makeRequest(access);
      } catch {
        throw new Error('Session expired. Please log in again.');
      }
    }

    return res;
  }, [refreshAccessToken]);

  // Shared by the (fallback) direct-login success path and the OTP-verify
  // success path — both end up with the same { access, refresh, user } shape.
  const finalizeLogin = (data) => {
    const { access, refresh } = data;
    if (!access || !refresh) throw new Error('Unexpected response from server.');

    saveTokens(access, refresh);

    // Build the user object — backend returns it directly on login
    const backendUser = data.user ?? data; // some backends nest it, some don't
    const appRole = deriveRole(backendUser.role);

    const fullName = [backendUser.first_name, backendUser.last_name]
      .filter(Boolean)
      .join(' ')
      .trim();

    const loggedInUser = {
      id:          backendUser.id,
      username:    backendUser.username,
      email:       backendUser.email,
      first_name:  backendUser.first_name,
      last_name:   backendUser.last_name,
      name:        fullName || backendUser.username, // convenience display name
      phone:       backendUser.phone,
      is_active:   backendUser.is_active,
      is_staff:    backendUser.is_staff,
      groups:      backendUser.groups ?? [],
      adminRole:   backendUser.role,   // raw backend value: 'staff' | 'landlord' | 'tenant'
      role:        appRole,            // app-level routing role: 'admin' | 'landlord' | 'tenant'
    };

    setUser(loggedInUser);
    localStorage.setItem(TOKEN_KEYS.user, JSON.stringify(loggedInUser));
    return loggedInUser;
  };

  // Step 1: username/password.
  //
  // With OTP now in front of login, the backend responds one of two ways:
  //   - OTP required (the normal case now): { otp_token, detail? } — no
  //     access/refresh yet. We DON'T log the user in here; we hand the
  //     otp_token back to the caller so it can show the "enter your code"
  //     screen, which then calls verifyOtp() below to actually finish.
  //   - Tokens returned directly: { access, refresh, user } — kept as a
  //     fallback in case OTP isn't enforced for every account, so this
  //     doesn't break if the backend still does that for some users.
  //
  // Returns either { otpRequired: true, otpToken, message } or
  // { otpRequired: false, user }.
  const login = async (username, password) => {
    setLoading(true);
    setError(null);

    try {
      const res  = await fetch(LOGIN_ENDPOINT, {
        method:  'POST',
        headers: { 'Content-Type': 'application/json' },
        body:    JSON.stringify({ username, password }),
      });

      const data = await res.json();

      if (!res.ok) {
        const msg = data?.detail || data?.non_field_errors?.[0] || data?.message || 'Invalid credentials.';
        throw new Error(msg);
      }

      if (data.otp_token && !data.access) {
        return {
          otpRequired: true,
          otpToken: data.otp_token,
          message: data.detail || data.message || 'Enter the verification code sent to your email.',
        };
      }

      const loggedInUser = finalizeLogin(data);
      return { otpRequired: false, user: loggedInUser };

    } catch (err) {
      const msg = err.message || 'Login failed. Please try again.';
      setError(msg);
      throw new Error(msg);
    } finally {
      setLoading(false);
    }
  };

  // Step 2: the code from the user's email, paired with the otp_token from
  // step 1. Success shape matches the old direct-login response, so it
  // reuses finalizeLogin.
  const verifyOtp = async (otpToken, code) => {
    setLoading(true);
    setError(null);

    try {
      const res = await fetch(OTP_VERIFY_ENDPOINT, {
        method:  'POST',
        headers: { 'Content-Type': 'application/json' },
        body:    JSON.stringify({ otp_token: otpToken, code }),
      });

      const data = await res.json();

      if (!res.ok) {
        const msg = data?.detail || data?.non_field_errors?.[0] || data?.code?.[0] || data?.message || 'Invalid or expired code.';
        throw new Error(msg);
      }

      return finalizeLogin(data);

    } catch (err) {
      const msg = err.message || 'Verification failed. Please try again.';
      setError(msg);
      throw new Error(msg);
    } finally {
      setLoading(false);
    }
  };

  // Logout
  const logout = () => {
    clearTokens();
    setUser(null);
    setError(null);
    if (refreshTimerRef.current) clearTimeout(refreshTimerRef.current);
  };

  const value = {
    user,
    loading,
    error,
    initializing,
    login,
    verifyOtp,
    logout,
    authFetch,
    refreshAccessToken,
    isAuthenticated: !!user,
    isAdmin:    user?.role === 'admin',
    isLandlord: user?.role === 'landlord',
    isTenant:   user?.role === 'tenant',
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};