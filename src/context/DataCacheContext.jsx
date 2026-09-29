import { createContext, useContext, useRef, useCallback, useMemo } from 'react';
import { ticketsApi } from '../lib/api';

const DataCacheContext = createContext(null);

/**
 * Simple in-memory cache for API calls.
 * Each cached entry stores { data, timestamp }.
 * TTL: 60 seconds – after that the cache is stale and re-fetches in background.
 */
const TTL = 60_000; // 1 minute

export function DataCacheProvider({ children }) {
  const cache = useRef({});

  /**
   * Fetch with cache.
   * key: string cache key
   * fetcher: async function returning { data }
   * Returns { data, fromCache: boolean }
   */
  const fetchWithCache = useCallback(async (key, fetcher, { force = false } = {}) => {
    const now = Date.now();
    const entry = cache.current[key];

    if (!force && entry && now - entry.timestamp < TTL) {
      return { data: entry.data, fromCache: true };
    }

    const res = await fetcher();
    cache.current[key] = { data: res.data, timestamp: now };
    return { data: res.data, fromCache: false };
  }, []);

  /** Invalidate a specific cache key (e.g. after mutation) */
  const invalidate = useCallback((key) => {
    delete cache.current[key];
  }, []);

  /** Pre-built helpers for common resources */
  const tickets = useMemo(() => ({
    list: (opts) => fetchWithCache('tickets:list', () => ticketsApi.list(), opts),
    invalidate: () => invalidate('tickets:list'),
  }), [fetchWithCache, invalidate]);

  return (
    <DataCacheContext.Provider value={{ fetchWithCache, invalidate, tickets }}>
      {children}
    </DataCacheContext.Provider>
  );
}

export function useDataCache() {
  const ctx = useContext(DataCacheContext);
  if (!ctx) throw new Error('useDataCache must be used inside DataCacheProvider');
  return ctx;
}
