/** Normalize legacy storage URLs without using their bearer token or fetching external URLs. */
export function privateStoragePath(bucket: string, value: string | null | undefined): string | null {
  if (!value) return null;
  if (!/^https?:\/\//i.test(value)) return value;
  try {
    const url = new URL(value);
    const origin = new URL(import.meta.env.VITE_SUPABASE_URL).origin;
    if (url.origin !== origin) return null;
    for (const access of ['sign', 'public', 'authenticated']) {
      const prefix = `/storage/v1/object/${access}/${bucket}/`;
      if (url.pathname.startsWith(prefix)) return decodeURIComponent(url.pathname.slice(prefix.length));
    }
  } catch { return null; }
  return null;
}