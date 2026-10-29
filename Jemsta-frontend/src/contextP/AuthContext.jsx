// src/context/AuthContext.jsx
//
// Logs in once when the app mounts (per the "login once on app load" choice)
// and exposes auth status to children. Property-fetching hooks wait on
// `isReady` before calling the API.

import React, { createContext, useContext, useEffect, useState } from 'react';
import { login } from '../api/auth';

const AuthContext = createContext({
  isReady: false,
  error: null,
});

export const AuthProvider = ({ children }) => {
  const [isReady, setIsReady] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    let mounted = true;
    console.log('[AuthContext] Mounted, triggering service login...');

    login()
      .then(() => {
        if (mounted) {
          console.log('[AuthContext] isReady = true');
          setIsReady(true);
        }
      })
      .catch((err) => {
        console.error('[AuthContext] Login error:', err);
        if (mounted) setError(err);
      });

    return () => {
      mounted = false;
    };
  }, []);

  return (
    <AuthContext.Provider value={{ isReady, error }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
