import { supabase } from '@/integrations/supabase/client';

/**
 * Protection anti-spam / anti-bot côté serveur.
 * Enregistre l'action dans rate_limit_events et refuse si le quota est dépassé.
 */
export const checkRateLimit = async (
  action: string,
  maxEvents = 3,
  windowSeconds = 300,
): Promise<boolean> => {
  const { data, error } = await supabase.rpc('check_rate_limit', {
    _action: action,
    _max_events: maxEvents,
    _window_seconds: windowSeconds,
  });
  if (error) {
    console.error('Rate limit check failed:', error);
    return false;
  }
  return data === true;
};

/** Nettoie une chaîne : trim, suppression des balises et des caractères de contrôle. */
export const sanitizeText = (value: string): string =>
  value
    .replace(/<[^>]*>/g, '')
    // eslint-disable-next-line no-control-regex
    .replace(/[\u0000-\u001F\u007F]/g, ' ')
    .replace(/\s{3,}/g, ' ')
    .trim();

/** Validation stricte d'un texte libre. */
export const validateText = (
  value: string,
  { min = 1, max = 500, label = 'Ce champ' }: { min?: number; max?: number; label?: string } = {},
): string | null => {
  const clean = sanitizeText(value);
  if (clean.length < min) return `${label} doit contenir au moins ${min} caractère(s).`;
  if (clean.length > max) return `${label} ne doit pas dépasser ${max} caractères.`;
  if (/(https?:\/\/\S+.*){3,}/i.test(clean)) return `${label} contient trop de liens.`;
  if (/(.)\1{15,}/.test(clean)) return `${label} semble être du spam.`;
  return null;
};

/** Validation d'un numéro burkinabè (8 chiffres, indicatif optionnel). */
export const validatePhone = (value: string): string | null => {
  const digits = value.replace(/[^\d]/g, '');
  const local = digits.startsWith('226') ? digits.slice(3) : digits;
  if (local.length !== 8) return 'Numéro invalide : 8 chiffres attendus (ex : 70 00 00 00).';
  if (!/^[0257]/.test(local)) return 'Numéro burkinabè invalide.';
  return null;
};

/** Honeypot : champ invisible que seuls les robots remplissent. */
export const HONEYPOT_NAME = 'fp_website';

export const isBotSubmission = (formValues: Record<string, unknown>, startedAt: number): boolean => {
  if (formValues[HONEYPOT_NAME]) return true;
  // Un humain met au moins 2 secondes à remplir un formulaire
  return Date.now() - startedAt < 2000;
};
