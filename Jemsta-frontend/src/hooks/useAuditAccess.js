// src/hooks/useAuditAccess.js
//
// The audit API returns 403 to anyone without the "Can view audit log"
// permission, so the sidebar can't know up front whether to show the menu
// item. This probes the list endpoint once per signed-in user (cached for
// the session) and reports whether it came back OK.
//
// Any failure — 403, network error, expired session — hides the item; the
// page itself still shows a proper message if someone opens the URL directly.

import { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { BASE_URL } from '../config';

const accessCache = new Map(); // user key -> Promise<boolean>

export function useAuditAccess() {
  const { authFetch, user } = useAuth();
  const [canView, setCanView] = useState(false);

  useEffect(() => {
    if (!user) {
      setCanView(false);
      return undefined;
    }

    let cancelled = false;
    const key = user.id ?? user.username;

    if (!accessCache.has(key)) {
      accessCache.set(
        key,
        authFetch(`${BASE_URL}/audit/logs/?page_size=1`)
          .then((res) => res.ok)
          .catch(() => {
            accessCache.delete(key); // don't remember a transient failure
            return false;
          })
      );
    }

    accessCache.get(key).then((ok) => { if (!cancelled) setCanView(ok); });
    return () => { cancelled = true; };
  }, [user, authFetch]);

  return canView;
}
