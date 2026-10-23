import { supabase } from '@/integrations/supabase/client';
import { INSTITUTIONS } from '@/data/institutions';
import { WEBHOOK_URL } from '@/lib/webhook';

export type Urgence = 'faible' | 'normale' | 'elevee' | 'danger';

export interface ReportDraft {
  category: string;
  subcategory: string;
  description: string;
  photos: string[]; // data URLs
  audio: string | null; // data URL
  latitude: number | null;
  longitude: number | null;
  accuracy: number | null;
  adresse: string;
  repere: string;
  urgence: Urgence;
  submittedAt: string;
  nomComplet: string;
  telephone?: string;
}

export interface SubmitResult { id: string; parent_id: string | null; merged: boolean; count: number }

const QUEUE_KEY = 'faso_propre_offline_reports';

const dataUrlToBlob = async (url: string) => (await fetch(url)).blob();

export const getQueue = (): ReportDraft[] => {
  try { return JSON.parse(localStorage.getItem(QUEUE_KEY) || '[]'); } catch { return []; }
};
const setQueue = (q: ReportDraft[]) => localStorage.setItem(QUEUE_KEY, JSON.stringify(q));
export const enqueueReport = (d: ReportDraft) => setQueue([...getQueue(), d]);

export async function submitReport(d: ReportDraft): Promise<SubmitResult> {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('Non connecté');

  const photoPaths: string[] = [];
  for (const p of d.photos) {
    const blob = await dataUrlToBlob(p);
    const ext = (blob.type.split('/')[1] || 'jpg').replace('jpeg', 'jpg');
    const path = `${user.id}/${crypto.randomUUID()}.${ext}`;
    const { error } = await supabase.storage.from('signalements-photos').upload(path, blob, { contentType: blob.type });
    if (error) throw error;
    photoPaths.push(path);
  }
  let audioPath: string | null = null;
  if (d.audio) {
    const blob = await dataUrlToBlob(d.audio);
    const path = `${user.id}/${crypto.randomUUID()}.webm`;
    const { error } = await supabase.storage.from('signalements-audio').upload(path, blob, { contentType: 'audio/webm' });
    if (!error) audioPath = path;
  }

  const { data, error } = await supabase.rpc('submit_signalement' as any, {
    _category: d.category, _subcategory: d.subcategory, _nom_complet: d.nomComplet,
    _description: d.description || null, _photos: photoPaths, _audio_url: audioPath,
    _latitude: d.latitude, _longitude: d.longitude, _gps_accuracy: d.accuracy,
    _adresse: d.adresse || null, _repere: d.repere || null, _urgence: d.urgence,
    _submitted_at: d.submittedAt,
  });
  if (error) throw error;
  const result = data as unknown as SubmitResult;

  // Transfert WhatsApp (fire & forget)
  try {
    const ONE_YEAR = 60 * 60 * 24 * 365;
    const signed = async (bucket: string, p: string) =>
      (await supabase.storage.from(bucket).createSignedUrl(p, ONE_YEAR)).data?.signedUrl || '';
    const photoUrl = await signed('signalements-photos', photoPaths[0]);
    const audioUrl = audioPath ? await signed('signalements-audio', audioPath) : '';
    const inst = INSTITUTIONS[d.category as keyof typeof INSTITUTIONS];
    const lieu = d.latitude && d.longitude ? `https://www.google.com/maps?q=${d.latitude},${d.longitude}` : 'Non spécifié';
    fetch(WEBHOOK_URL, {
      method: 'POST', mode: 'no-cors',
      headers: { 'Content-Type': 'text/plain;charset=utf-8' },
      body: JSON.stringify({
        timestamp: new Date(d.submittedAt).toLocaleString('fr-FR', { timeZone: 'Africa/Ouagadougou' }),
        institution: inst?.nom || d.category, institution_id: d.category,
        institution_contact: inst?.phone || 'N/A', categorie: d.subcategory, type_probleme: d.subcategory,
        description: d.description, nom: d.nomComplet, telephone: d.telephone || 'Non renseigné',
        gps: d.latitude && d.longitude ? `${d.latitude},${d.longitude}` : '0,0',
        lieu, mapsUrl: lieu, adresse: d.adresse, repere: d.repere, urgence: d.urgence,
        photo_url: photoUrl, photoUrl, audio_url: audioUrl, audioUrl,
        regroupe: result.merged, signale_par: result.count, statut: 'Nouveau',
      }),
    }).catch(() => {});
  } catch { /* ignore */ }

  return result;
}

let syncing = false;
export async function syncOfflineReports(onSynced?: (n: number) => void) {
  if (syncing || !navigator.onLine) return;
  const q = getQueue();
  if (!q.length) return;
  syncing = true;
  const remaining: ReportDraft[] = [];
  let ok = 0;
  for (const d of q) {
    try { await submitReport(d); ok++; } catch { remaining.push(d); }
  }
  setQueue(remaining);
  syncing = false;
  if (ok && onSynced) onSynced(ok);
}

export const URGENCES: { value: Urgence; label: string; cls: string }[] = [
  { value: 'faible', label: 'Faible', cls: 'border-status-resolved text-status-resolved' },
  { value: 'normale', label: 'Normale', cls: 'border-status-pending text-status-pending' },
  { value: 'elevee', label: 'Élevée', cls: 'border-status-in-progress text-status-in-progress' },
  { value: 'danger', label: 'Danger immédiat', cls: 'border-destructive text-destructive' },
];
