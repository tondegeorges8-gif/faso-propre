import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from '@/components/ui/select';
import { ArrowLeft, Trash2, Plus } from 'lucide-react';
import { toast } from 'sonner';
import BottomNavigation from '@/components/navigation/BottomNavigation';
import { METIERS, getMetierName } from '@/data/metiers';
import { BURKINA_CITIES } from '@/data/burkinaCities';
import { QUARTIERS_BY_CITY } from '@/data/burkinaQuartiers';
import { usePrestataires } from '@/hooks/usePrestataires';
import { useUserRole } from '@/hooks/useUserRole';

const emptyForm = {
  nom: '', prenoms: '', metier: '', specialite: '', telephone: '',
  quartier: '', ville: '', photo_url: '', description: '',
};

const PrestatairesAdmin: React.FC = () => {
  const navigate = useNavigate();
  const { isAdmin, isFounder, isLoading: roleLoading } = useUserRole();
  const { prestataires, isLoading, refetch } = usePrestataires();
  const [form, setForm] = useState(emptyForm);
  const [saving, setSaving] = useState(false);

  const canManage = isAdmin || isFounder;

  const set = (k: keyof typeof emptyForm, v: string) => setForm((f) => ({ ...f, [k]: v }));

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
      quartier: form.quartier || null,
      ville: form.ville,
      photo_url: form.photo_url || null,
      description: form.description || null,
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
    refetch();
  };

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
                  <SelectContent>
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

              <div>
                <Label htmlFor="telephone">Téléphone *</Label>
                <Input id="telephone" placeholder="+226 70 00 00 00" value={form.telephone} onChange={(e) => set('telephone', e.target.value)} />
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

        <Card className="shadow-card">
          <CardHeader className="pb-3">
            <CardTitle className="text-base">
              Prestataires enregistrés ({prestataires.length})
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            {isLoading ? (
              <p className="text-sm text-muted-foreground">Chargement...</p>
            ) : prestataires.length === 0 ? (
              <p className="text-sm text-muted-foreground">Aucun prestataire pour le moment.</p>
            ) : (
              prestataires.map((p) => (
                <div key={p.id} className="flex items-center gap-2 border-b border-border pb-2 last:border-0">
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium truncate">{p.prenoms} {p.nom}</p>
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
