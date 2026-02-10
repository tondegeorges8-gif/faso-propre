import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

const SIGNED_URL_EXPIRY = 60 * 60; // 1 hour

/**
 * Resolves a storage path or existing signed URL to a fresh short-lived signed URL.
 * If the value is already a full URL (legacy signed URL), it returns it as-is.
 * If it's a plain path, it generates a new signed URL on-demand.
 */
export function useSignedUrl(
  bucket: string,
  path: string | null | undefined
) {
  const [url, setUrl] = useState<string | null>(null);

  useEffect(() => {
    if (!path) {
      setUrl(null);
      return;
    }

    // If it's already a full URL (legacy data), use it directly
    if (path.startsWith('http://') || path.startsWith('https://')) {
      setUrl(path);
      return;
    }

    // Generate a short-lived signed URL from the storage path
    let cancelled = false;
    supabase.storage
      .from(bucket)
      .createSignedUrl(path, SIGNED_URL_EXPIRY)
      .then(({ data, error }) => {
        if (!cancelled && data?.signedUrl) {
          setUrl(data.signedUrl);
        }
      });

    return () => { cancelled = true; };
  }, [bucket, path]);

  return url;
}

/**
 * Resolves multiple storage paths to signed URLs in a single batch call.
 */
export function useSignedUrls(
  bucket: string,
  paths: (string | null | undefined)[]
) {
  const [urls, setUrls] = useState<Record<string, string>>({});

  useEffect(() => {
    const validPaths = paths.filter((p): p is string => !!p && !p.startsWith('http'));
    const legacyUrls: Record<string, string> = {};
    
    paths.forEach(p => {
      if (p && (p.startsWith('http://') || p.startsWith('https://'))) {
        legacyUrls[p] = p;
      }
    });

    if (validPaths.length === 0) {
      setUrls(legacyUrls);
      return;
    }

    let cancelled = false;
    supabase.storage
      .from(bucket)
      .createSignedUrls(validPaths, SIGNED_URL_EXPIRY)
      .then(({ data, error }) => {
        if (cancelled) return;
        const result: Record<string, string> = { ...legacyUrls };
        data?.forEach(item => {
          if (item.signedUrl && item.path) {
            result[item.path] = item.signedUrl;
          }
        });
        setUrls(result);
      });

    return () => { cancelled = true; };
  }, [bucket, JSON.stringify(paths)]);

  return urls;
}
