import React, { useEffect, useRef, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useUserRole } from '@/hooks/useUserRole';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { toast } from '@/hooks/use-toast';
import { Megaphone, Plus } from 'lucide-react';
import { getInstitution } from '@/data/institutions';
import { HONEYPOT_NAME, checkRateLimit, isBotSubmission, sanitizeText, validateText } from '@/lib/antiSpam';

interface Annonce {
  id: string;
  institution: string;
  titre: string;
  contenu: string;
  ville: string | null;
  event_date: string | null;
  created_at: string;
}

const InstitutionAnnouncements: React.FC = () => {
  const { user } = useAuth();
  const { institution, isAdmin, isFounder } = useUserRole();
  const canPublish = !!institution || isAdmin || isFounder;

  const [annonces, setAnnonces] = useState<Annonce[]>([]);
  const [open, setOpen] = useState(false);
  const [titre, setTitre] = useState('');
  const [contenu, setContenu] = useState('');
  const [ville, setVille] = useState('');
  const [eventDate, setEventDate] = useState('');
  const [honeypot, setHoneypot] = useState('');
  const startedAt = useRef(Date.now());
  const [saving, setSaving] = useState(false);

  const load = async () => {
    const { data } = await supabase
      .from('annonces_institutionnelles')
      .select('id, institution, titre, contenu, ville, event_date, created_at')
      .eq('is_published', true)
      .order('created_at', { ascending: false })
      .limit(20);
    setAnnonces((data || []) as Annonce[]);
  };

  useEffect(() => {
    load();
  }, []);

  const publish = async () => {
    if (!user) return;
    if (isBotSubmission({ [HONEYPOT_NAME]: honeypot }, startedAt.current)) {
      toast({ title: 'Envoi bloqué', description: 'Comportement suspect détecté.', variant: 'destructive' });
      return;
    }
    const err =
      validateText(titre, { min: 5, max: 120, label: 'Le titre' }) ||
      validateText(contenu, { min: 10, max: 1500, label: 'Le contenu' });
    if (err) {
      toast({ title: 'Formulaire invalide', description: err, variant: 'destructive' });
      return;
    }
    setSaving(true);
    const allowed = await checkRateLimit('annonce_institution', 5, 600);
    if (!allowed) {
      setSaving(false);
      toast({ title: 'Limite atteinte', description: 'Patientez avant de publier un nouveau communiqué.', variant: 'destructive' });
      return;
    }
    const { error } = await supabase.from('annonces_institutionnelles').insert({
      author_id: user.id,
      institution: institution ?? 'MAIRIE',
      titre: sanitizeText(titre),
      contenu: sanitizeText(contenu),
      ville: ville ? sanitizeText(ville) : null,
      event_date: eventDate || null,
    });
    setSaving(false);
    if (error) {
      toast({ title: 'Erreur', description: error.message, variant: 'destructive' });
      return;
    }
    setTitre(''); setContenu(''); setVille(''); setEventDate(''); setOpen(false);
    toast({ title: 'Communiqué publié' });
    load();
  };

  return (
    <Card className="shadow-card">
      <CardHeader className="pb-3 flex-row items-center justify-between space-y-0">
        <CardTitle className="text-lg flex items-center gap-2">
          <Megaphone size={20} className="text-primary" />
          Annonces institutionnelles
        </CardTitle>
        {canPublish && (
          <Button size="sm" variant="outline" onClick={() => setOpen((o) => !o)}>
            <Plus size={14} className="mr-1" /> Publier
          </Button>
        )}
      </CardHeader>
      <CardContent className="space-y-3">
        {open && canPublish && (
          <div className="space-y-2 p-3 border rounded-lg">
            <input
              type="text"
              name={HONEYPOT_NAME}
              value={honeypot}
              onChange={(e) => setHoneypot(e.target.value)}
              tabIndex={-1}
              autoComplete="off"
              aria-hidden="true"
              className="hidden"
            />
            <Input maxLength={120} placeholder="Titre du communiqué" value={titre} onChange={(e) => setTitre(e.target.value)} />
            <Textarea maxLength={1500} placeholder="Contenu (consignes, journée de grand nettoyage…)" value={contenu} onChange={(e) => setContenu(e.target.value)} />
            <div className="grid grid-cols-2 gap-2">
              <Input placeholder="Ville concernée" value={ville} onChange={(e) => setVille(e.target.value)} />
              <Input type="date" value={eventDate} onChange={(e) => setEventDate(e.target.value)} />
            </div>
            <Button size="sm" onClick={publish} disabled={saving}>{saving ? 'Publication…' : 'Publier le communiqué'}</Button>
          </div>
        )}

        {annonces.length === 0 ? (
          <p className="text-sm text-muted-foreground py-4 text-center">
            Aucun communiqué officiel pour le moment.
          </p>
        ) : (
          annonces.map((a) => (
            <div key={a.id} className="p-3 border rounded-lg space-y-1">
              <div className="flex items-start justify-between gap-2">
                <p className="font-medium text-sm leading-tight">{a.titre}</p>
                <Badge variant="secondary" className="shrink-0 text-[10px]">
                  {getInstitution(a.institution)?.name ?? a.institution}
                </Badge>
              </div>
              <p className="text-sm text-muted-foreground whitespace-pre-line">{a.contenu}</p>
              <p className="text-[11px] text-muted-foreground">
                {a.ville ? `${a.ville} · ` : ''}
                {a.event_date ? `Le ${new Date(a.event_date).toLocaleDateString('fr-FR')} · ` : ''}
                Publié le {new Date(a.created_at).toLocaleDateString('fr-FR')}
              </p>
            </div>
          ))
        )}
      </CardContent>
    </Card>
  );
};

export default InstitutionAnnouncements;
