import React, { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { toast } from '@/hooks/use-toast';
import RatingStars from './RatingStars';
import { checkRateLimit, sanitizeText, validateText } from '@/lib/antiSpam';

export interface Avis {
  id: string;
  user_id: string;
  note: number;
  commentaire: string | null;
  created_at: string;
}

interface Props {
  targetType: 'boutique' | 'article' | 'prestataire' | 'annonce';
  targetId: string;
}

const AvisSection: React.FC<Props> = ({ targetType, targetId }) => {
  const { user } = useAuth();
  const [avis, setAvis] = useState<Avis[]>([]);
  const [note, setNote] = useState(0);
  const [commentaire, setCommentaire] = useState('');
  const [saving, setSaving] = useState(false);

  const load = async () => {
    const { data } = await supabase
      .from('avis')
      .select('id, user_id, note, commentaire, created_at')
      .eq('target_type', targetType)
      .eq('target_id', targetId)
      .order('created_at', { ascending: false });
    setAvis((data || []) as Avis[]);
  };

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [targetType, targetId]);

  const moyenne = avis.length ? avis.reduce((s, a) => s + a.note, 0) / avis.length : 0;

  const submit = async () => {
    if (!user) {
      toast({ title: 'Connexion requise', description: 'Connectez-vous pour laisser un avis.', variant: 'destructive' });
      return;
    }
    if (note < 1) {
      toast({ title: 'Note requise', description: 'Choisissez une note de 1 à 5 étoiles.', variant: 'destructive' });
      return;
    }
    const err = commentaire.trim() ? validateText(commentaire, { min: 3, max: 500, label: 'Le commentaire' }) : null;
    if (err) {
      toast({ title: 'Commentaire invalide', description: err, variant: 'destructive' });
      return;
    }
    setSaving(true);
    const allowed = await checkRateLimit('avis', 5, 600);
    if (!allowed) {
      setSaving(false);
      toast({ title: 'Trop de tentatives', description: 'Patientez quelques minutes avant de publier un nouvel avis.', variant: 'destructive' });
      return;
    }
    const { error } = await supabase.from('avis').upsert(
      {
        user_id: user.id,
        target_type: targetType,
        target_id: targetId,
        note,
        commentaire: commentaire.trim() ? sanitizeText(commentaire) : null,
      },
      { onConflict: 'user_id,target_type,target_id' },
    );
    setSaving(false);
    if (error) {
      toast({ title: 'Erreur', description: error.message, variant: 'destructive' });
      return;
    }
    setCommentaire('');
    setNote(0);
    toast({ title: 'Merci !', description: 'Votre avis a été enregistré.' });
    load();
  };

  return (
    <Card>
      <CardContent className="p-4 space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="font-semibold">Avis et fiabilité</h3>
          <div className="flex items-center gap-2">
            <RatingStars value={moyenne} />
            <span className="text-sm text-muted-foreground">
              {avis.length ? `${moyenne.toFixed(1)} (${avis.length})` : 'Aucun avis'}
            </span>
          </div>
        </div>

        <div className="space-y-2 border-t pt-3">
          <p className="text-sm font-medium">Donner mon avis</p>
          <RatingStars value={note} size={24} onChange={setNote} />
          <Textarea
            maxLength={500}
            placeholder="Votre expérience avec ce marchand (facultatif)"
            value={commentaire}
            onChange={(e) => setCommentaire(e.target.value)}
          />
          <Button size="sm" onClick={submit} disabled={saving}>
            {saving ? 'Envoi…' : 'Publier mon avis'}
          </Button>
        </div>

        {avis.length > 0 && (
          <div className="space-y-3 border-t pt-3">
            {avis.slice(0, 5).map((a) => (
              <div key={a.id} className="space-y-1">
                <RatingStars value={a.note} size={13} />
                {a.commentaire && <p className="text-sm text-muted-foreground">{a.commentaire}</p>}
                <p className="text-[11px] text-muted-foreground">
                  {new Date(a.created_at).toLocaleDateString('fr-FR')}
                </p>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default AvisSection;
