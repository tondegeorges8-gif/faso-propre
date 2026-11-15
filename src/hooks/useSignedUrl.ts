import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { privateStoragePath } from '@/lib/privateStorage';

/**
 * Downloads private media with the current session, including legacy storage URLs.
 * The historical hook name is retained for callers; no bearer URL is created.
 */
export function useSignedUrl(
  bucket: string,
  path: string | null | undefined
) {
  const [url, setUrl] = useState<string | null>(null);

  useEffect(() => {
    setUrl(null);
    const storagePath = privateStoragePath(bucket, path);
    if (!storagePath) return;
    let cancelled = false;
    let objectUrl: string | null = null;
    supabase.storage
      .from(bucket)
      .download(storagePath)
      .then(({ data }) => {
        if (!cancelled && data) {
          objectUrl = URL.createObjectURL(data);
          setUrl(objectUrl);
        }
      });

    return () => { cancelled = true; if (objectUrl) URL.revokeObjectURL(objectUrl); };
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
    setUrls({});
    let cancelled = false;
    const created: string[] = [];
    Promise.all(paths.map(async original => {
      const storagePath = privateStoragePath(bucket, original);
      if (!original || !storagePath) return null;
      const { data } = await supabase.storage.from(bucket).download(storagePath);
      if (cancelled || !data) return null;
      const objectUrl = URL.createObjectURL(data);
      created.push(objectUrl);
      return [original, objectUrl] as const;
    })).then(entries => {
      if (!cancelled) setUrls(Object.fromEntries(entries.filter((entry): entry is readonly [string, string] => entry !== null)));
    });
    return () => { cancelled = true; created.forEach(url => URL.revokeObjectURL(url)); };
  }, [bucket, JSON.stringify(paths)]);

  return urls;
}
