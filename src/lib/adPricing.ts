// Tarification de l'Espace Pub FASO YAAR
// Algorithme : plus le montant est élevé, meilleur est le tarif journalier.

export const COMMISSION_RATE = 0.1; // 10% prélevés par la plateforme

const TIERS = [
  { min: 25000, perDay: 800 },  // tarif mensuel
  { min: 7000, perDay: 900 },   // tarif hebdomadaire
  { min: 0, perDay: 1000 },     // tarif journalier
];

export const AD_PRESETS = [
  { amount: 1000, label: '1 jour' },
  { amount: 2000, label: '2 jours' },
  { amount: 6300, label: '1 semaine' },
  { amount: 25000, label: '1 mois' },
];

export const dailyRate = (amount: number) =>
  (TIERS.find((t) => amount >= t.min) ?? TIERS[TIERS.length - 1]).perDay;

/** Durée en jours calculée automatiquement à partir du montant saisi. */
export const daysForAmount = (amount: number): number => {
  if (!amount || amount < 1000) return 0;
  return Math.floor(amount / dailyRate(amount));
};

/** Libellé lisible : mois / semaines / jours. */
export const formatDuration = (days: number): string => {
  if (days <= 0) return '—';
  const months = Math.floor(days / 30);
  const weeks = Math.floor((days % 30) / 7);
  const rest = days % 30 % 7;
  const parts: string[] = [];
  if (months) parts.push(`${months} mois`);
  if (weeks) parts.push(`${weeks} semaine${weeks > 1 ? 's' : ''}`);
  if (rest) parts.push(`${rest} jour${rest > 1 ? 's' : ''}`);
  return parts.join(' et ');
};

export const commissionFor = (amount: number) => Math.round(amount * COMMISSION_RATE);
