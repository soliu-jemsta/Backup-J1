// src/api/auth.js
//
// Centralized auth + fetch wrapper for the public-facing site service account.
// Uses the SAME backend (BASE_URL from config.js) and the SAME login/refresh
// endpoints as the portal auth (context/AuthContext.jsx) — just authenticated
// as a different service-account user. Tokens are kept fully separate from
// the portal: this module stores its token in memory only (never localStorage),
// so there's no collision with the portal's 'access_token'/'refresh_token' keys.

import { BASE_URL } from '../config';

// Same endpoints proven to work for the portal login — NOT /api/token/.
const TOKEN_URL = `${BASE_URL}/users/login/`;
const TOKEN_REFRESH_URL = `${BASE_URL}/users/token/refresh/`;

// Service account credentials for the public site's read-only access.
// These are intentionally not user-supplied — this is a "service login",
// not a real user session.
const SERVICE_CREDENTIALS = {
  username: 'public_site_service',
  password: 'Jemsta 144-145',
};

// In-memory token store. Not persisted to localStorage/sessionStorage on
// purpose — a fresh login happens once per app load (per your call), and
// silent refresh keeps it alive after that.
let accessToken = null;
let refreshToken = null;
let loginPromise = null; // dedupes concurrent login calls on app boot

/**
 * Logs in as the public site service account and stores the resulting
 * tokens in memory. Safe to call multiple times concurrently — only one
 * network request will actually fire.
 */
export async function login() {
  if (loginPromise) return loginPromise;

  console.log('[auth] Logging in as', SERVICE_CREDENTIALS.username, 'at', TOKEN_URL);

  loginPromise = (async () => {
    const res = await fetch(TOKEN_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(SERVICE_CREDENTIALS),
    });

    if (!res.ok) {
      const text = await res.text().catch(() => '');
      console.error('[auth] Login failed:', res.status, res.statusText, text);
      loginPromise = null;
      throw new Error(`Login failed: ${res.status} ${res.statusText}`);
    }

    const data = await res.json();
    accessToken = data.access;
    refreshToken = data.refresh;
    console.log('[auth] Login succeeded, token acquired');
    console.log(accessToken, refreshToken);
    return accessToken;
  })();

  try {
    return await loginPromise;
  } finally {
    // allow a retry on next call if this attempt failed
    if (!accessToken) loginPromise = null;
  }
}

/**
 * Attempts to refresh the access token using the stored refresh token.
 * Falls back to a full re-login if there's no refresh token or it's expired.
 */
async function refreshAccessToken() {
  if (!refreshToken) {
    accessToken = null;
    loginPromise = null;
    return login();
  }

  const res = await fetch(TOKEN_REFRESH_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ refresh: refreshToken }),
  });

  if (!res.ok) {
    // refresh token expired/invalid — fall back to full login
    accessToken = null;
    refreshToken = null;
    loginPromise = null;
    return login();
  }

  const data = await res.json();
  accessToken = data.access;
  return accessToken;
}

export function getAccessToken() {
  return accessToken;
}

/**
 * Fetch wrapper that attaches the bearer token, and on a 401 will try a
 * silent refresh (or re-login) once, then retry the original request.
 */
export async function authFetch(path, options = {}) {
  if (!accessToken) {
    await login();
  }

  const buildHeaders = () => ({
    ...(options.headers || {}),
    Authorization: `Bearer ${accessToken}`,
  });

  console.log('[auth] Fetching', `${BASE_URL}${path}`);

  let res = await fetch(`${BASE_URL}${path}`, {
    ...options,
    headers: buildHeaders(),
  });

  if (res.status === 401) {
    console.warn('[auth] Got 401, attempting refresh/re-login');
    await refreshAccessToken();
    res = await fetch(`${BASE_URL}${path}`, {
      ...options,
      headers: buildHeaders(),
    });
  }

  console.log('[auth] Response status for', path, ':', res.status);

  return res;
}
