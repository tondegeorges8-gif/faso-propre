import { INSTITUTIONS, REPORT_STATUSES } from '@/data/institutions';

export interface ExportableSignalement {
  id: string;
  category: string;
  subcategory: string;
  ville: string;
  quartier?: string | null;
  secteur?: string | null;
  sous_quartier?: string | null;
  description?: string | null;
  status: string;
  created_at: string;
  latitude?: number | null;
  longitude?: number | null;
}

const institutionName = (category: string) =>
  INSTITUTIONS[category as keyof typeof INSTITUTIONS]?.nom ?? category;

const statusLabel = (status: string) =>
  REPORT_STATUSES[status as keyof typeof REPORT_STATUSES]?.label ?? status;

const escapeCsv = (value: unknown) => {
  const str = value === null || value === undefined ? '' : String(value);
  return `"${str.replace(/"/g, '""')}"`;
};

export function buildCsv(rows: ExportableSignalement[]): string {
  const headers = [
    'ID',
    'Institution',
    'Type de problème',
    'Statut',
    'Ville',
    'Quartier',
    'Secteur',
    'Description',
    'Latitude',
    'Longitude',
    'Date',
  ];

  const lines = rows.map((r) =>
    [
      r.id,
      institutionName(r.category),
      r.subcategory,
      statusLabel(r.status),
      r.ville,
      r.quartier ?? '',
      r.secteur ?? '',
      r.description ?? '',
      r.latitude ?? '',
      r.longitude ?? '',
      new Date(r.created_at).toLocaleString('fr-FR'),
    ]
      .map(escapeCsv)
      .join(',')
  );

  // BOM pour qu'Excel lise correctement les accents
  return '\uFEFF' + [headers.map(escapeCsv).join(','), ...lines].join('\n');
}

export function downloadCsv(rows: ExportableSignalement[], filename = 'signalements.csv') {
  const blob = new Blob([buildCsv(rows)], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

export function buildWhatsAppSummary(
  rows: ExportableSignalement[],
  auteur?: string
): string {
  const total = rows.length;
  const byStatus = (s: string) => rows.filter((r) => r.status === s).length;

  const byInstitution = rows.reduce<Record<string, number>>((acc, r) => {
    acc[r.category] = (acc[r.category] || 0) + 1;
    return acc;
  }, {});

  const institutionLines = Object.entries(byInstitution)
    .sort((a, b) => b[1] - a[1])
    .map(([key, count]) => {
      const inst = INSTITUTIONS[key as keyof typeof INSTITUTIONS];
      return `${inst?.icon ?? '•'} ${institutionName(key)} : ${count}`;
    })
    .join('\n');

  const lastFive = rows
    .slice(0, 5)
    .map(
      (r) =>
        `• ${r.subcategory} (${statusLabel(r.status)}) — ${r.ville}${
          r.quartier ? `, ${r.quartier}` : ''
        } — ${new Date(r.created_at).toLocaleDateString('fr-FR')}`
    )
    .join('\n');

  return [
    '*🧹 FASO PROPRE — Résumé des signalements*',
    auteur ? `👤 Citoyen : ${auteur}` : null,
    `📅 Généré le ${new Date().toLocaleString('fr-FR')}`,
    '',
    `*Total :* ${total}`,
    `🔵 En attente : ${byStatus('PENDING')}`,
    `🟠 En cours : ${byStatus('IN_PROGRESS')}`,
    `🟢 Résolus : ${byStatus('RESOLVED')}`,
    `🔴 Rejetés : ${byStatus('REJECTED')}`,
    '',
    '*Par institution :*',
    institutionLines || '—',
    '',
    '*Derniers signalements :*',
    lastFive || '—',
  ]
    .filter((l) => l !== null)
    .join('\n');
}

export function openWhatsAppSummary(rows: ExportableSignalement[], auteur?: string) {
  const text = encodeURIComponent(buildWhatsAppSummary(rows, auteur));
  window.open(`https://wa.me/22656009893?text=${text}`, '_blank');
}
