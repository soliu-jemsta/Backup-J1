// src/hooks/usePropertyDetail.js
//
// Fetches a single property by id for the public property detail page.
// Mirrors usePropertyListings.js's auth-wait + logging pattern, and reuses
// the same normalizeProperty mapping so a listing and its detail page
// always agree on field shape.
//
// Endpoint path follows the same '/properties/properties/' prefix already
// proven to work for the list endpoint — adjust PROPERTY_DETAIL_PATH below
// if the single-property route turns out to be nested differently.

import { useEffect, useState } from 'react';
import { authFetch } from '../api/auth';
import { useAuth } from '../contextP/AuthContext';
import { normalizeProperty } from './normalizeProperty';

const propertyDetailPath = (id) => `/properties/properties/${id}/`;

/**
 * @param {string|number} id - property id from the route params
 */
export function usePropertyDetail(id) {
  const { isReady, error: authError } = useAuth();
  const [property, setProperty] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!isReady) {
      console.log('[usePropertyDetail] Waiting on auth isReady...');
      return;
    }
    if (!id) return;

    let mounted = true;
    setIsLoading(true);
    console.log('[usePropertyDetail] isReady, fetching property', id);

    authFetch(propertyDetailPath(id))
      .then(async (res) => {
        if (res.status === 404) {
          console.warn('[usePropertyDetail] Property not found:', id);
          return null;
        }
        if (!res.ok) {
          const text = await res.text().catch(() => '');
          console.error('[usePropertyDetail] Bad response:', res.status, text);
          throw new Error(`Failed to load property: ${res.status} ${res.statusText}`);
        }
        return res.json();
      })
      .then((raw) => {
        if (!mounted) return;
        console.log('[usePropertyDetail] Raw response:', raw);
        setProperty(raw ? normalizeProperty(raw) : null);
        setError(null);
      })
      .catch((err) => {
        console.error('[usePropertyDetail] Error:', err);
        if (mounted) setError(err);
      })
      .finally(() => {
        if (mounted) setIsLoading(false);
      });

    return () => {
      mounted = false;
    };
  }, [isReady, id]);

  return {
    property,
    isLoading: isLoading && !authError,
    error: authError || error,
  };
}