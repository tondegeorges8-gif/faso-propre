import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { INSTITUTIONS } from '@/data/institutions';
import OnboardingGuide from '@/components/onboarding/OnboardingGuide';
import ReportMap from '@/components/location/ReportMap';
import { reverseGeocode } from '@/components/marketplace/MapPicker';
import { submitReport, enqueueReport, syncOfflineReports, getQueue, URGENCES, type Urgence, type ReportDraft } from '@/lib/reportSubmission';
import { ArrowLeft, Camera, Send, X, HelpCircle, Mic, Square, Crosshair, Loader2, WifiOff, MapPin } from 'lucide-react';
import BottomNavigation from '@/components/navigation/BottomNavigation';

const logo = '/logo.png';
const MAX_PHOTOS = 5;
const MAX_AUDIO_SEC = 30;

const readAsDataUrl = (b: Blob) => new Promise<string>((res, rej) => {
  const r = new FileReader(); r.onloadend = () => res(r.result as string); r.onerror = rej; r.readAsDataURL(b);
});

const Step: React.FC<{ n: number; title: string; desc: string; done: boolean; children: React.ReactNode }> = ({ n, title, desc, done, children }) => (
  <Card className="shadow-card animate-slide-up">
    <CardHeader className="pb-3">
      <CardTitle className="text-lg flex items-center gap-2">
        <span className={`w-7 h-7 rounded-full flex items-center justify-center text-sm ${done ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground'}`}>{n}</span>
        {title}
      </CardTitle>
      <CardDescription>{desc}</CardDescription>
    </CardHeader>
    <CardContent className="space-y-4">{children}</CardContent>
  </Card>
);

const NewReport: React.FC = () => {
  const navigate = useNavigate();
  const { user, profile, isAuthenticated, isLoading: authLoading } = useAuth();
  const { toast } = useToast();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [showOnboarding, setShowOnboarding] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [online, setOnline] = useState(navigator.onLine);
  const [pending, setPending] = useState(getQueue().length);

  const [category, setCategory] = useState('');
  const [subcategory, setSubcategory] = useState('');
  const [description, setDescription] = useState('');
  const [photos, setPhotos] = useState<string[]>([]);
  const [latitude, setLatitude] = useState<number | null>(null);
  const [longitude, setLongitude] = useState<number | null>(null);
  const [accuracy, setAccuracy] = useState<number | null>(null);
  const [locating, setLocating] = useState(false);
  const [adresse, setAdresse] = useState('');
  const [repere, setRepere] = useState('');
  const [urgence, setUrgence] = useState<Urgence>('normale');

  const [isRecording, setIsRecording] = useState(false);
  const [recSeconds, setRecSeconds] = useState(0);
  const [audioUrl, setAudioUrl] = useState<string | null>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const timerRef = useRef<number | null>(null);
  const geocodeTimer = useRef<number | null>(null);

  useEffect(() => { if (!authLoading && !isAuthenticated) navigate('/auth'); }, [isAuthenticated, authLoading, navigate]);
  useEffect(() => { if (!localStorage.getItem('faso_propre_onboarding_seen')) setShowOnboarding(true); }, []);

  useEffect(() => {
    const synced = (n: number) => {
      setPending(getQueue().length);
      toast({ title: 'Synchronisation réussie', description: `${n} signalement(s) hors-ligne envoyé(s).` });
    };
    const goOnline = () => { setOnline(true); syncOfflineReports(synced); };
    const goOffline = () => setOnline(false);
    window.addEventListener('online', goOnline);
    window.addEventListener('offline', goOffline);
    if (isAuthenticated) syncOfflineReports(synced);
    return () => { window.removeEventListener('online', goOnline); window.removeEventListener('offline', goOffline); };
  }, [isAuthenticated, toast]);

  const updateAddressFor = (lat: number, lng: number) => {
    if (!navigator.onLine) return;
    if (geocodeTimer.current) window.clearTimeout(geocodeTimer.current);
    geocodeTimer.current = window.setTimeout(async () => setAdresse(await reverseGeocode(lat, lng)), 600);
  };

  const detectPosition = () => {
    if (!navigator.geolocation) {
      toast({ title: 'GPS indisponible', variant: 'destructive' });
      return;
    }
    setLocating(true);
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setLatitude(pos.coords.latitude); setLongitude(pos.coords.longitude);
        setAccuracy(Math.round(pos.coords.accuracy)); setLocating(false);
        updateAddressFor(pos.coords.latitude, pos.coords.longitude);
        toast({ title: 'Position détectée', description: `Précision ±${Math.round(pos.coords.accuracy)} m` });
      },
      () => { setLocating(false); toast({ title: 'Position introuvable', description: 'Autorisez la localisation.', variant: 'destructive' }); },
      { enableHighAccuracy: true, timeout: 15000, maximumAge: 0 },
    );
  };

  const onMarkerMove = (lat: number, lng: number) => {
    setLatitude(lat); setLongitude(lng); setAccuracy(null);
    updateAddressFor(lat, lng);
  };

  const handlePhotos = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    e.target.value = '';
    const room = MAX_PHOTOS - photos.length;
    if (files.length > room) toast({ title: 'Maximum 5 photos', description: `Seules ${room} photo(s) ont été ajoutées.` });
    const added: string[] = [];
    for (const f of files.slice(0, room)) {
      if (f.size > 5 * 1024 * 1024) { toast({ title: 'Photo trop lourde', description: `${f.name} dépasse 5 Mo`, variant: 'destructive' }); continue; }
      added.push(await readAsDataUrl(f));
    }
    setPhotos((p) => [...p, ...added]);
  };

  const stopRecording = () => {
    if (timerRef.current) { window.clearInterval(timerRef.current); timerRef.current = null; }
    if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') mediaRecorderRef.current.stop();
    setIsRecording(false);
  };

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mr = new MediaRecorder(stream);
      mediaRecorderRef.current = mr; audioChunksRef.current = [];
      mr.ondataavailable = (ev) => { if (ev.data.size > 0) audioChunksRef.current.push(ev.data); };
      mr.onstop = async () => {
        const blob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
        setAudioUrl(await readAsDataUrl(blob));
        stream.getTracks().forEach((t) => t.stop());
      };
      mr.start(); setIsRecording(true); setRecSeconds(0);
      timerRef.current = window.setInterval(() => {
        setRecSeconds((s) => {
          if (s + 1 >= MAX_AUDIO_SEC) { stopRecording(); return MAX_AUDIO_SEC; }
          return s + 1;
        });
      }, 1000);
    } catch {
      toast({ title: 'Erreur', description: "Impossible d'accéder au microphone.", variant: 'destructive' });
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !profile) return;
    if (!category || !subcategory || photos.length === 0) {
      toast({ title: 'Champs obligatoires', description: 'Catégorie, type et au moins une photo.', variant: 'destructive' });
      return;
    }
    const draft: ReportDraft = {
      category, subcategory, description, photos, audio: audioUrl, latitude, longitude, accuracy,
      adresse, repere, urgence, submittedAt: new Date().toISOString(),
      nomComplet: `${profile.prenoms} ${profile.nom}`, telephone: (profile as any).telephone,
    };

    if (!navigator.onLine) {
      try {
        enqueueReport(draft); setPending(getQueue().length);
        toast({ title: 'Enregistré hors-ligne', description: 'Il sera envoyé automatiquement au retour du réseau.' });
        navigate('/dashboard');
      } catch {
        toast({ title: 'Stockage plein', description: 'Retirez des photos et réessayez.', variant: 'destructive' });
      }
      return;
    }

    setIsSubmitting(true);
    try {
      const r = await submitReport(draft);
      toast(r.merged
        ? { title: 'Problème déjà signalé', description: `Votre signalement a été regroupé. Signalé par ${r.count} personnes — vous serez notifié des changements.` }
        : { title: 'Signalement envoyé !', description: 'Transmis aux autorités compétentes.' });
      navigate('/dashboard');
    } catch (err) {
      console.error(err);
      enqueueReport(draft); setPending(getQueue().length);
      toast({ title: 'Envoi impossible', description: 'Sauvegardé localement, nouvel essai automatique.', variant: 'destructive' });
    } finally {
      setIsSubmitting(false);
    }
  };

  const selectedInstitution = category ? INSTITUTIONS[category as keyof typeof INSTITUTIONS] : null;

  if (authLoading) {
    return <div className="min-h-screen flex items-center justify-center"><Loader2 className="animate-spin text-primary" size={32} /></div>;
  }

  return (
    <div className="min-h-screen bg-background pb-24">
      <header className="gradient-hero text-primary-foreground shadow-lg sticky top-0 z-20">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Button variant="ghost" size="icon" className="text-primary-foreground hover:bg-primary-foreground/10" onClick={() => navigate('/dashboard')}>
              <ArrowLeft size={20} />
            </Button>
            <div className="w-8 h-8 rounded-full bg-card overflow-hidden"><img src={logo} alt="Faso Propre" className="w-full h-full object-cover" /></div>
            <h1 className="text-lg font-bold">Nouveau signalement</h1>
          </div>
          <Button variant="ghost" size="icon" className="text-primary-foreground hover:bg-primary-foreground/10" onClick={() => setShowOnboarding(true)}>
            <HelpCircle size={20} />
          </Button>
        </div>
      </header>

      <main className="container mx-auto px-4 py-6">
        {(!online || pending > 0) && (
          <div className="max-w-lg mx-auto mb-4 flex items-center gap-2 rounded-lg border border-status-pending bg-status-pending/10 p-3 text-sm">
            <WifiOff size={16} />
            {!online ? 'Hors-ligne : votre signalement sera sauvegardé et envoyé plus tard.' : `${pending} signalement(s) en attente d'envoi.`}
          </div>
        )}
        <form onSubmit={handleSubmit} className="space-y-6 max-w-lg mx-auto">
          <Step n={1} title="Type de problème" desc="Catégorie et urgence" done={!!subcategory}>
            <div className="space-y-2">
              <Label>Catégorie *</Label>
              <Select value={category} onValueChange={(v) => { setCategory(v); setSubcategory(''); }}>
                <SelectTrigger className="bg-card"><SelectValue placeholder="Sélectionnez une catégorie" /></SelectTrigger>
                <SelectContent className="bg-popover">
                  {Object.entries(INSTITUTIONS).map(([key, inst]) => (
                    <SelectItem key={key} value={key}>{inst.icon} {inst.nom}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            {selectedInstitution && (
              <div className="space-y-2">
                <Label>Type de problème *</Label>
                <Select value={subcategory} onValueChange={setSubcategory}>
                  <SelectTrigger className="bg-card"><SelectValue placeholder="Précisez le type" /></SelectTrigger>
                  <SelectContent className="bg-popover">
                    {selectedInstitution.options.map((o) => <SelectItem key={o} value={o}>{o}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
            )}
            <div className="space-y-2">
              <Label>Niveau d'urgence</Label>
              <div className="grid grid-cols-2 gap-2">
                {URGENCES.map((u) => (
                  <button key={u.value} type="button" onClick={() => setUrgence(u.value)}
                    className={`rounded-lg border-2 px-3 py-2 text-sm font-medium transition ${urgence === u.value ? `${u.cls} bg-muted` : 'border-border text-muted-foreground'}`}>
                    {u.label}
                  </button>
                ))}
              </div>
            </div>
          </Step>

          <Step n={2} title="Localisation" desc="Détectez votre position puis ajustez le marqueur" done={latitude != null}>
            <Button type="button" variant="outline" className="w-full" onClick={detectPosition} disabled={locating}>
              {locating ? <Loader2 className="mr-2 animate-spin" size={16} /> : <Crosshair className="mr-2" size={16} />}
              {locating ? 'Détection en cours…' : 'Détecter ma position'}
            </Button>
            {latitude != null && longitude != null && (
              <div className="flex items-center justify-between text-xs rounded-md bg-muted p-2">
                <span className="flex items-center gap-1"><MapPin size={12} />{latitude.toFixed(6)}, {longitude.toFixed(6)}</span>
                <span className="font-semibold">{accuracy != null ? `±${accuracy} m` : 'Ajusté manuellement'}</span>
              </div>
            )}
            <ReportMap latitude={latitude} longitude={longitude} onMove={onMarkerMove} />
            <p className="text-xs text-muted-foreground">Touchez la carte ou faites glisser le point pour corriger.</p>
            <div className="space-y-2">
              <Label>Adresse / Quartier</Label>
              <Input value={adresse} onChange={(e) => setAdresse(e.target.value)} placeholder="Rempli automatiquement, modifiable" maxLength={300} />
            </div>
            <div className="space-y-2">
              <Label>Repère visuel / Point de référence</Label>
              <Input value={repere} onChange={(e) => setRepere(e.target.value)} placeholder="Ex : en face de la pharmacie X, près du poteau N°…" maxLength={200} />
            </div>
          </Step>

          <Step n={3} title="Photos et description" desc="1 à 5 photos, texte ou message vocal" done={photos.length > 0}>
            <div className="space-y-2">
              <Label>Photos du problème * ({photos.length}/{MAX_PHOTOS})</Label>
              <div className="grid grid-cols-3 gap-2">
                {photos.map((p, i) => (
                  <div key={i} className="relative aspect-square">
                    <img src={p} alt={`Photo ${i + 1}`} className="w-full h-full object-cover rounded-lg" />
                    <button type="button" aria-label="Supprimer la photo" onClick={() => setPhotos((ps) => ps.filter((_, j) => j !== i))}
                      className="absolute top-1 right-1 rounded-full bg-destructive text-destructive-foreground p-1"><X size={12} /></button>
                  </div>
                ))}
                {photos.length < MAX_PHOTOS && (
                  <button type="button" onClick={() => fileInputRef.current?.click()}
                    className="aspect-square border-2 border-dashed border-primary/30 rounded-lg flex flex-col items-center justify-center text-primary/60 hover:border-primary/60">
                    <Camera size={24} /><span className="text-[10px] mt-1">Ajouter</span>
                  </button>
                )}
              </div>
              <input ref={fileInputRef} type="file" accept="image/*" multiple className="hidden" onChange={handlePhotos} />
              <p className="text-xs text-muted-foreground">Max 5 Mo par photo</p>
            </div>

            <div className="space-y-2">
              <Label>Description (optionnel)</Label>
              <Textarea placeholder="Décrivez le problème…" value={description} onChange={(e) => setDescription(e.target.value)} rows={3} maxLength={500} />
              <p className="text-xs text-muted-foreground text-right">{description.length}/500</p>
            </div>

            <div className="space-y-2">
              <Label className="flex items-center gap-1"><Mic size={14} />Message vocal (optionnel, 30 s max)</Label>
              {audioUrl ? (
                <div className="flex items-center gap-3 p-3 rounded-lg bg-muted/50 border">
                  <audio src={audioUrl} controls className="flex-1 h-8" />
                  <Button type="button" variant="ghost" size="icon" className="text-destructive" onClick={() => setAudioUrl(null)}><X size={16} /></Button>
                </div>
              ) : (
                <div className="flex flex-col items-center gap-1">
                  <Button type="button" variant={isRecording ? 'destructive' : 'outline'} className={`h-16 w-16 rounded-full ${isRecording ? 'animate-pulse' : ''}`}
                    onClick={isRecording ? stopRecording : startRecording}>
                    {isRecording ? <Square size={24} /> : <Mic size={24} />}
                  </Button>
                  {isRecording && <p className="text-xs text-destructive font-medium">Enregistrement… {recSeconds}s / {MAX_AUDIO_SEC}s</p>}
                </div>
              )}
            </div>
          </Step>

          <Button type="submit" size="lg" className="w-full" disabled={isSubmitting || !category || !subcategory || photos.length === 0}>
            {isSubmitting ? <><Loader2 className="mr-2 animate-spin" size={18} />Envoi en cours…</> : <><Send className="mr-2" size={18} />{online ? 'Envoyer le signalement' : 'Sauvegarder hors-ligne'}</>}
          </Button>
          <p className="text-xs text-center text-muted-foreground">La date et l'heure sont enregistrées automatiquement.</p>
        </form>
      </main>

      <BottomNavigation />
      <OnboardingGuide open={showOnboarding} onOpenChange={(o) => { setShowOnboarding(o); if (!o) localStorage.setItem('faso_propre_onboarding_seen', 'true'); }} />
    </div>
  );
};

export default NewReport;
