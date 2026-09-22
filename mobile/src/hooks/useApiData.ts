import { useCallback, useEffect, useRef, useState } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { ApiError, NetworkError } from "../api/client";

interface State<T> {
  data: T | null;
  loading: boolean;
  error: string | null;
  isOffline: boolean;
  refresh: () => Promise<void>;
}

const CACHE_PREFIX = "grandma_cache_";

/**
 * Fetches from the API with loading/error states, and falls back to the
 * last cached response when offline (Section 18: cached read access with a
 * clear indicator). `cacheKey` is optional - omit for writes-only screens.
 */
export function useApiData<T>(fetcher: () => Promise<T>, deps: unknown[], cacheKey?: string): State<T> {
  const [data, setData] = useState<T | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isOffline, setIsOffline] = useState(false);
  const mounted = useRef(true);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const result = await fetcher();
      if (!mounted.current) return;
      setData(result);
      setIsOffline(false);
      if (cacheKey) AsyncStorage.setItem(CACHE_PREFIX + cacheKey, JSON.stringify(result)).catch(() => {});
    } catch (err) {
      if (!mounted.current) return;
      if (err instanceof NetworkError && cacheKey) {
        const cached = await AsyncStorage.getItem(CACHE_PREFIX + cacheKey);
        if (cached) {
          setData(JSON.parse(cached));
          setIsOffline(true);
          setLoading(false);
          return;
        }
      }
      setError(err instanceof ApiError || err instanceof NetworkError ? err.message : "Something went wrong.");
    } finally {
      if (mounted.current) setLoading(false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, deps);

  useEffect(() => {
    mounted.current = true;
    load();
    return () => {
      mounted.current = false;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, deps);

  return { data, loading, error, isOffline, refresh: load };
}
