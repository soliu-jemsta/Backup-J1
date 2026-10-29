// src/hooks/usePropertyListings.js
//
// Fetches properties from the public properties endpoint, filters by
// `listing_type` ('rent' | 'sale'), and normalizes each one via
// normalizeProperty.js into the shape PropertyCard/PropertyGrid expect.
//
// Field shape is per the "Jemsta Public API" doc (Sept 2026) — see
// normalizeProperty.js for the full mapping.

import { useEffect, useState } from 'react';
import { authFetch } from '../api/auth';
import { useAuth } from '../contextP/AuthContext';
import { normalizeProperty } from './normalizeProperty';

const PROPERTIES_PATH = '/properties/properties/';

/**
 * @param {'rent'|'sale'} listingType - which subset of properties to return
 */
export function usePropertyListings(listingType) {
  const { isReady, error: authError } = useAuth();
  const [properties, setProperties] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!isReady) {
      console.log('[usePropertyListings] Waiting on auth isReady...');
      return;
    }

    let mounted = true;
    setIsLoading(true);
    console.log('[usePropertyListings] isReady, fetching', listingType, 'properties');

    authFetch(PROPERTIES_PATH)
      .then(async (res) => {
        if (!res.ok) {
          const text = await res.text().catch(() => '');
          console.error('[usePropertyListings] Bad response:', res.status, text);
          throw new Error(`Failed to load properties: ${res.status} ${res.statusText}`);
        }
        const data = await res.json();
        console.log('[usePropertyListings] Raw response:', data);
        // Handle both a plain array response and a paginated { results: [] } shape.
        const list = Array.isArray(data) ? data : data.results || [];
        return list;
      })
      .then((list) => {
        if (!mounted) return;
        console.log('[usePropertyListings] Items before filter:', list.length);
        const filtered = list
          .filter((item) => item.listing_type === listingType)
          .map(normalizeProperty);
        console.log('[usePropertyListings] Items after filter (', listingType, '):', filtered.length, filtered);
        setProperties(filtered);
        setError(null);
      })
      .catch((err) => {
        console.error('[usePropertyListings] Error:', err);
        if (mounted) setError(err);
      })
      .finally(() => {
        if (mounted) setIsLoading(false);
      });

    return () => {
      mounted = false;
    };
  }, [isReady, listingType]);

  return {
    properties,
    isLoading: isLoading && !authError,
    error: authError || error,
  };
}