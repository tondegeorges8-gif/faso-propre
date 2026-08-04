import React, { useMemo, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
import { Badge } from '@/components/ui/badge';
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from '@/components/ui/select';
import {
  ArrowLeft, Trash2, Plus, Upload, Download, BadgeCheck, CircleDot, EyeOff, Eye,
} from 'lucide-react';
import { toast } from 'sonner';
import BottomNavigation from '@/components/navigation/BottomNavigation';
import { METIERS, getMetierName } from '@/data/metiers';
import { BURKINA_CITIES } from '@/data/burkinaCities';
import { QUARTIERS_BY_CITY } from '@/data/burkinaQuartiers';
import { usePrestataires } from '@/hooks/usePrestataires';
import { useUserRole } from '@/hooks/useUserRole';

const emptyForm = {
  nom: '', prenoms: '', metier: '', specialite: '', telephone: '', whatsapp: '',
  quartier: '', ville: '', photo_url: '', description: '', latitude: '', longitude: '',
};

const CSV_HEADERS = [
  'prenoms', 'nom', 'metier', 'specialite', 'telephone', 'whatsapp',
  'quartier', 'ville', 'photo_url', 'description', 'latitude', 'longitude',
  'is_verified', 'is_available',
];

const parseCsv = (text: string): Record<string, string>[] => {
  const rows: string[][] = [];
  let row: string[] = [];
  let field = '';
  let quoted = false;
  for (let i = 0; i < text.length; i++) {
    const c = text[i];
    if (quoted) {
      if (c === '"') {
        if (text[i + 1] === '"') { field += '"'; i++; } else quoted = false;
      } else field += c;
    } else if (c === '"') quoted = true;
    else if (c === ',' || c === ';') { row.push(field); field = ''; }
    else if (c === '\n') { row.push(field); rows.push(row); row = []; field = ''; }
    else if (c !== '\r') field += c;
  }
  if (field || row.length) { row.push(field); rows.push(row); }
  if (!rows.length) return [];
  const headers = rows[0].map((h) => h.trim().toLowerCase());
  return rows
    .slice(1)
    .filter((r) => r.some((v) => v.trim()))
    .map((r) => Object.fromEntries(headers.map((h, i) => [h, (r[i] ?? '').trim()])));
};

const PrestatairesAdmin: React.FC = () => {
  const navigate = useNavigate();
  const { isAdmin, isFounder, isLoading: roleLoading } = useUserRole();
  const { prestataires, isLoading, refetch } = usePrestataires(undefined, true);
  const [form, setForm] = useState(emptyForm);
  const [saving, setSaving] = useState(false);
  const [selected, setSelected] = useState<string[]>([]);
  const [importing, setImporting] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  const canManage = isAdmin || isFounder;
  const allSelected = prestataires.length > 0 && selected.length === prestataires.length;

  const set = (k: keyof typeof emptyForm, v: string) => setForm((f) => ({ ...f, [k]: v }));

  const toggle = (id: string) =>
    setSelected((s) => (s.includes(id) ? s.filter((x) => x !== id) : [...s, id]));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.nom || !form.prenoms || !form.metier || !form.telephone || !form.ville) {
      toast.error('Nom, prénoms, métier, téléphone et ville sont obligatoires');
      return;
    }
    setSaving(true);
    const { error } = await supabase.from('prestataires').insert({
      nom: form.nom,
      prenoms: form.prenoms,
      metier: form.metier,
      specialite: form.specialite || null,
      telephone: form.telephone,
      whatsapp: form.whatsapp || null,
      quartier: form.quartier || null,
      ville: form.ville,
      photo_url: form.photo_url || null,
      description: form.description || null,
      latitude: form.latitude ? Number(form.latitude) : null,
      longitude: form.longitude ? Number(form.longitude) : null,
    });
    setSaving(false);
    if (error) {
      toast.error("Erreur lors de l'ajout : " + error.message);
      return;
    }
    toast.success('Prestataire ajouté');
    setForm(emptyForm);
    refetch();
  };

  const handleDelete = async (id: string) => {
    const { error } = await supabase.from('prestataires').delete().eq('id', id);
    if (error) {
      toast.error('Suppression impossible');
      return;
    }
    toast.success('Prestataire supprimé');
    setSelected((s) => s.filter((x) => x !== id));
    refetch();
  };

  // ---- Gestion en masse ----
  const bulkUpdate = async (patch: Record<string, boolean>, label: string) => {
    if (!selected.length) return;
    const { error } = await supabase.from('prestataires').update(patch).in('id', selected);
    if (error) {
      toast.error('Mise à jour impossible : ' + error.message);
      return;
    }
    toast.success(`${selected.length} prestataire(s) : ${label}`);
    refetch();
  };

  const bulkDelete = async () => {
    if (!selected.length) return;
    const { error } = await supabase.from('prestataires').delete().in('id', selected);
    if (error) {
      toast.error('Suppression impossible : ' + error.message);
      return;
    }
    toast.success(`${selected.length} prestataire(s) supprimé(s)`);
    setSelected([]);
    refetch();
  };

  // ---- Import / export CSV ----
  const downloadTemplate = () => {
    const csv =
      CSV_HEADERS.join(',') +
      '\n' +
      'Ali,Ouedraogo,ELECTRICIEN,Installation solaire,+226 70 00 00 00,+226 70 00 00 00,Gounghin,Ouagadougou,,Dépannage 24h/24,12.3686,-1.5275,true,true\n';
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'modele-prestataires.csv';
    a.click();
    URL.revokeObjectURL(url);
  };

  const exportCsv = () => {
    const escape = (v: unknown) => `"${String(v ?? '').replace(/"/g, '""')}"`;
    const csv = [
      CSV_HEADERS.join(','),
      ...prestataires.map((p) =>
        CSV_HEADERS.map((h) => escape((p as unknown as Record<string, unknown>)[h])).join(',')
      ),
    ].join('\n');
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'prestataires.csv';
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleImport = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setImporting(true);
    try {
      const rows = parseCsv(await file.text());
      const valid = rows
        .filter((r) => r.prenoms && r.nom && r.metier && r.telephone && r.ville)
        .map((r) => ({
          prenoms: r.prenoms,
          nom: r.nom,
          metier: r.metier.toUpperCase(),
          specialite: r.specialite || null,
          telephone: r.telephone,
          whatsapp: r.whatsapp || null,
          quartier: r.quartier || null,
          ville: r.ville,
          photo_url: r.photo_url || null,
          description: r.description || null,
          latitude: r.latitude ? Number(r.latitude) : null,
          longitude: r.longitude ? Number(r.longitude) : null,
          is_verified: r.is_verified?.toLowerCase() === 'true',
          is_available: r.is_available ? r.is_available.toLowerCase() !== 'false' : true,
        }));

      const unknown = valid.filter((v) => !METIERS.some((m) => m.id === v.metier));
      if (unknown.length) {
        toast.error(`Métier inconnu : ${unknown.map((u) => u.metier).join(', ')}`);
        return;
      }
      if (!valid.length) {
        toast.error('Aucune ligne valide trouvée dans le fichier');
        return;
      }
      const { error } = await supabase.from('prestataires').insert(valid);
      if (error) {
        toast.error("Erreur d'import : " + error.message);
        return;
      }
      toast.success(`${valid.length} prestataire(s) importé(s)`);
      refetch();
    } finally {
      setImporting(false);
      if (fileRef.current) fileRef.current.value = '';
    }
  };

  const stats = useMemo(
    () => ({
      verifies: prestataires.filter((p) => p.is_verified).length,
      dispos: prestataires.filter((p) => p.is_available).length,
    }),
    [prestataires]
  );

  if (roleLoading) {
    return <div className="min-h-screen flex items-center justify-center text-muted-foreground">Chargement...</div>;
  }

  if (!canManage) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center gap-4 px-4 text-center">
        <p className="text-muted-foreground">Accès réservé aux administrateurs.</p>
        <Button onClick={() => navigate('/prestataires')}>Retour à l'annuaire</Button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background pb-20">
      <header className="gradient-hero text-primary-foreground px-4 py-6 flex items-center gap-2">
        <Button
          variant="ghost"
          size="icon"
          className="text-primary-foreground hover:bg-white/10"
          onClick={() => navigate('/prestataires')}
        >
          <ArrowLeft size={20} />
        </Button>
        <h1 className="text-xl font-bold">Gestion des prestataires</h1>
      </header>

      <main className="px-4 py-4 space-y-4 max-w-lg mx-auto">
        {/* Import CSV */}
        <Card className="shadow-card">
          <CardHeader className="pb-3">
            <CardTitle className="text-base flex items-center gap-2">
              <Upload size={18} /> Import / export CSV
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <p className="text-xs text-muted-foreground">
              Colonnes : {CSV_HEADERS.join(', ')}
            </p>
            <input
              ref={fileRef}
              type="file"
              accept=".csv,text/csv"
              className="hidden"
              onChange={handleImport}
            />
            <div className="grid grid-cols-2 gap-2">
              <Button onClick={() => fileRef.current?.click()} disabled={importing}>
                <Upload size={16} className="mr-2" />
                {importing ? 'Import...' : 'Importer un CSV'}
              </Button>
              <Button variant="outline" onClick={downloadTemplate}>
                <Download size={16} className="mr-2" /> Modèle CSV
              </Button>
            </div>
            <Button variant="secondary" className="w-full" onClick={exportCsv}>
              <Download size={16} className="mr-2" /> Exporter la liste
            </Button>
          </CardContent>
        </Card>

        {/* Ajout manuel */}
        <Card className="shadow-card">
          <CardHeader className="pb-3">
            <CardTitle className="text-base flex items-center gap-2">
              <Plus size={18} /> Ajouter un prestataire
            </CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-3">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <Label htmlFor="prenoms">Prénoms *</Label>
                  <Input id="prenoms" value={form.prenoms} onChange={(e) => set('prenoms', e.target.value)} />
                </div>
                <div>
                  <Label htmlFor="nom">Nom *</Label>
                  <Input id="nom" value={form.nom} onChange={(e) => set('nom', e.target.value)} />
                </div>
              </div>

              <div>
                <Label>Corps de métier *</Label>
                <Select value={form.metier} onValueChange={(v) => set('metier', v)}>
                  <SelectTrigger><SelectValue placeholder="Choisir un métier" /></SelectTrigger>
                  <SelectContent className="max-h-72">
                    {METIERS.map((m) => (
                      <SelectItem key={m.id} value={m.id}>{m.icon} {m.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="specialite">Spécialité</Label>
                <Input id="specialite" placeholder="Ex: Installation solaire" value={form.specialite} onChange={(e) => set('specialite', e.target.value)} />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <Label htmlFor="telephone">Téléphone *</Label>
                  <Input id="telephone" placeholder="+226 70 00 00 00" value={form.telephone} onChange={(e) => set('telephone', e.target.value)} />
                </div>
                <div>
                  <Label htmlFor="whatsapp">WhatsApp</Label>
                  <Input id="whatsapp" placeholder="+226 70 00 00 00" value={form.whatsapp} onChange={(e) => set('whatsapp', e.target.value)} />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <Label>Ville *</Label>
                  <Select value={form.ville} onValueChange={(v) => { set('ville', v); set('quartier', ''); }}>
                    <SelectTrigger><SelectValue placeholder="Ville" /></SelectTrigger>
                    <SelectContent className="max-h-72">
                      {BURKINA_CITIES.map((v) => (
                        <SelectItem key={v} value={v}>{v}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="quartier">Quartier</Label>
                  {QUARTIERS_BY_CITY[form.ville]?.length ? (
                    <Select value={form.quartier} onValueChange={(v) => set('quartier', v)}>
                      <SelectTrigger><SelectValue placeholder="Quartier" /></SelectTrigger>
                      <SelectContent className="max-h-72">
                        {QUARTIERS_BY_CITY[form.ville].map((q) => (
                          <SelectItem key={q} value={q}>{q}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  ) : (
                    <Input id="quartier" value={form.quartier} onChange={(e) => set('quartier', e.target.value)} />
                  )}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <Label htmlFor="lat">Latitude</Label>
                  <Input id="lat" placeholder="12.3686" value={form.latitude} onChange={(e) => set('latitude', e.target.value)} />
                </div>
                <div>
                  <Label htmlFor="lng">Longitude</Label>
                  <Input id="lng" placeholder="-1.5275" value={form.longitude} onChange={(e) => set('longitude', e.target.value)} />
                </div>
              </div>

              <div>
                <Label htmlFor="photo">Photo (URL)</Label>
                <Input id="photo" placeholder="https://..." value={form.photo_url} onChange={(e) => set('photo_url', e.target.value)} />
              </div>

              <div>
                <Label htmlFor="description">Description</Label>
                <Textarea id="description" rows={2} value={form.description} onChange={(e) => set('description', e.target.value)} />
              </div>

              <Button type="submit" className="w-full" disabled={saving}>
                {saving ? 'Enregistrement...' : 'Ajouter le prestataire'}
              </Button>
            </form>
          </CardContent>
        </Card>

        {/* Liste + gestion en masse */}
        <Card className="shadow-card">
          <CardHeader className="pb-3">
            <CardTitle className="text-base">
              Prestataires enregistrés ({prestataires.length})
            </CardTitle>
            <p className="text-xs text-muted-foreground">
              {stats.verifies} vérifié(s) · {stats.dispos} disponible(s)
            </p>
          </CardHeader>
          <CardContent className="space-y-2">
            {prestataires.length > 0 && (
              <div className="space-y-2 border-b border-border pb-3">
                <div className="flex items-center gap-2">
                  <Checkbox
                    checked={allSelected}
                    onCheckedChange={(c) => setSelected(c ? prestataires.map((p) => p.id) : [])}
                  />
                  <span className="text-sm">
                    Tout sélectionner {selected.length > 0 && `(${selected.length})`}
                  </span>
                </div>
                {selected.length > 0 && (
                  <div className="grid grid-cols-2 gap-2">
                    <Button size="sm" variant="outline" onClick={() => bulkUpdate({ is_verified: true }, 'vérifiés')}>
                      <BadgeCheck size={14} className="mr-1" /> Vérifier
                    </Button>
                    <Button size="sm" variant="outline" onClick={() => bulkUpdate({ is_verified: false }, 'non vérifiés')}>
                      Retirer vérif.
                    </Button>
                    <Button size="sm" variant="outline" onClick={() => bulkUpdate({ is_available: true }, 'disponibles')}>
                      <CircleDot size={14} className="mr-1" /> Disponible
                    </Button>
                    <Button size="sm" variant="outline" onClick={() => bulkUpdate({ is_available: false }, 'occupés')}>
                      Occupé
                    </Button>
                    <Button size="sm" variant="outline" onClick={() => bulkUpdate({ is_active: true }, 'activés')}>
                      <Eye size={14} className="mr-1" /> Activer
                    </Button>
                    <Button size="sm" variant="outline" onClick={() => bulkUpdate({ is_active: false }, 'désactivés')}>
                      <EyeOff size={14} className="mr-1" /> Masquer
                    </Button>
                    <Button size="sm" variant="destructive" className="col-span-2" onClick={bulkDelete}>
                      <Trash2 size={14} className="mr-1" /> Supprimer la sélection
                    </Button>
                  </div>
                )}
              </div>
            )}

            {isLoading ? (
              <p className="text-sm text-muted-foreground">Chargement...</p>
            ) : prestataires.length === 0 ? (
              <p className="text-sm text-muted-foreground">Aucun prestataire pour le moment.</p>
            ) : (
              prestataires.map((p) => (
                <div key={p.id} className="flex items-center gap-2 border-b border-border pb-2 last:border-0">
                  <Checkbox checked={selected.includes(p.id)} onCheckedChange={() => toggle(p.id)} />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium truncate flex items-center gap-1">
                      <span
                        className={`h-2 w-2 rounded-full ${p.is_available ? 'bg-status-resolved' : 'bg-destructive'}`}
                      />
                      {p.prenoms} {p.nom}
                      {p.is_verified && <BadgeCheck size={13} className="text-primary shrink-0" />}
                      {!p.is_active && <Badge variant="outline" className="text-[10px]">masqué</Badge>}
                    </p>
                    <p className="text-xs text-muted-foreground truncate">
                      {getMetierName(p.metier)} · {[p.quartier, p.ville].filter(Boolean).join(', ')} · {p.telephone}
                    </p>
                  </div>
                  <Button variant="ghost" size="icon" onClick={() => handleDelete(p.id)}>
                    <Trash2 size={16} className="text-destructive" />
                  </Button>
                </div>
              ))
            )}
          </CardContent>
        </Card>
      </main>

      <BottomNavigation />
    </div>
  );
};

export default PrestatairesAdmin;
