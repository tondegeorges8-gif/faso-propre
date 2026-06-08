import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { INSTITUTIONS } from '@/data/institutions';
import { WEBHOOK_URL } from '@/lib/webhook';
import GPSCapture from '@/components/location/GPSCapture';
import OnboardingGuide from '@/components/onboarding/OnboardingGuide';
import { supabase } from '@/integrations/supabase/client';
import { 
  ArrowLeft, 
  Camera, 
  Send,
  Trash2,
  HelpCircle,
  Mic,
  Square,
  X
} from 'lucide-react';
import BottomNavigation from '@/components/navigation/BottomNavigation';

const logo = '/logo.png';

const NewReport: React.FC = () => {
  const navigate = useNavigate();
  const { user, profile, isAuthenticated, isLoading: authLoading } = useAuth();
  const { toast } = useToast();
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const [showOnboarding, setShowOnboarding] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  // Form state
  const [category, setCategory] = useState('');
  const [subcategory, setSubcategory] = useState('');
  const [description, setDescription] = useState('');
  const [photo, setPhoto] = useState<string | null>(null);
  const [photoFile, setPhotoFile] = useState<File | null>(null);
  const [latitude, setLatitude] = useState<number | null>(null);
  const [longitude, setLongitude] = useState<number | null>(null);
  const [isRecording, setIsRecording] = useState(false);
  const [audioBlob, setAudioBlob] = useState<Blob | null>(null);
  const [audioUrl, setAudioUrl] = useState<string | null>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);

  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      navigate('/auth');
    }
  }, [isAuthenticated, authLoading, navigate]);

  useEffect(() => {
    const hasSeenOnboarding = localStorage.getItem('faso_propre_onboarding_seen');
    if (!hasSeenOnboarding) {
      setShowOnboarding(true);
    }
  }, []);

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;
      audioChunksRef.current = [];

      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunksRef.current.push(event.data);
        }
      };

      mediaRecorder.onstop = () => {
        const blob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
        setAudioBlob(blob);
        setAudioUrl(URL.createObjectURL(blob));
        stream.getTracks().forEach(track => track.stop());
      };

      mediaRecorder.start();
      setIsRecording(true);
    } catch (error) {
      console.error('Error accessing microphone:', error);
      toast({
        title: 'Erreur',
        description: "Impossible d'accéder au microphone. Vérifiez les permissions.",
        variant: 'destructive',
      });
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
    }
  };

  const handlePhotoCapture = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 5 * 1024 * 1024) {
      toast({
        title: 'Fichier trop volumineux',
        description: 'La photo ne doit pas dépasser 5 Mo',
        variant: 'destructive',
      });
      return;
    }

    setPhotoFile(file);
    const reader = new FileReader();
    reader.onloadend = () => {
      setPhoto(reader.result as string);
    };
    reader.readAsDataURL(file);
  };

  const handleGPSCapture = (lat: number, lng: number) => {
    setLatitude(lat);
    setLongitude(lng);
    toast({
      title: 'Position capturée',
      description: 'Vos coordonnées GPS ont été enregistrées',
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!user || !profile) {
      toast({
        title: 'Erreur',
        description: 'Vous devez être connecté',
        variant: 'destructive',
      });
      return;
    }

    if (!category || !subcategory || !photo) {
      toast({
        title: 'Champs obligatoires',
        description: 'Veuillez remplir tous les champs obligatoires et ajouter une photo',
        variant: 'destructive',
      });
      return;
    }

    setIsSubmitting(true);

    try {
      let photoUrl = '';
      let audioStorageUrl: string | null = null;

      // Upload photo to storage
      if (photoFile) {
        const fileExt = photoFile.name.split('.').pop();
        const fileName = `${user.id}/${crypto.randomUUID()}.${fileExt}`;
        
        const { error: uploadError } = await supabase.storage
          .from('signalements-photos')
          .upload(fileName, photoFile);

        if (uploadError) {
          throw new Error('Erreur lors de l\'upload de la photo');
        }
        photoUrl = fileName;
      }

      // Upload audio to storage
      if (audioBlob) {
        const audioFileName = `${user.id}/${crypto.randomUUID()}.webm`;
        
        const { error: audioUploadError } = await supabase.storage
          .from('signalements-audio')
          .upload(audioFileName, audioBlob, { contentType: 'audio/webm' });

        if (audioUploadError) {
          console.error('Audio upload error:', audioUploadError);
        } else {
          audioStorageUrl = audioFileName;
        }
      }

      const nomComplet = `${profile.prenoms} ${profile.nom}`;
      
      const { error } = await supabase
        .from('signalements')
        .insert({
          user_id: user.id,
          nom_complet: nomComplet,
          category,
          subcategory,
          ville: 'Non spécifiée',
          arrondissement: null,
          secteur: null,
          quartier: null,
          sous_quartier: null,
          description: description || null,
          photo_url: photoUrl,
          audio_url: audioStorageUrl,
          latitude,
          longitude,
          status: 'PENDING',
          statut_paiement: 'en_attente',
          montant_total: 0,
          commission_montant: 0,
        } as any);

      if (error) {
        throw error;
      }

      // Forward to external webhook (Google Apps Script) - fire and forget
      try {
        const institutionNom = INSTITUTIONS[category as keyof typeof INSTITUTIONS]?.nom || category;
        const webhookPayload = {
          timestamp: new Date().toLocaleString('fr-FR', { timeZone: 'Africa/Ouagadougou' }),
          institution: institutionNom,
          categorie: subcategory,
          description: description || '',
          nom: nomComplet,
          telephone: (profile as any).telephone || '+22656009893',
          gps: latitude && longitude ? `${latitude},${longitude}` : '0,0',
          lieu: latitude && longitude ? `${latitude},${longitude}` : 'Non spécifié',
          photo_url: photoUrl
            ? `${import.meta.env.VITE_SUPABASE_URL}/storage/v1/object/public/signalements-photos/${photoUrl}`
            : '',
          photoUrl: photoUrl
            ? `${import.meta.env.VITE_SUPABASE_URL}/storage/v1/object/public/signalements-photos/${photoUrl}`
            : '',
          audio_url: audioStorageUrl
            ? `${import.meta.env.VITE_SUPABASE_URL}/storage/v1/object/public/signalements-audio/${audioStorageUrl}`
            : '',
          audioUrl: audioStorageUrl
            ? `${import.meta.env.VITE_SUPABASE_URL}/storage/v1/object/public/signalements-audio/${audioStorageUrl}`
            : '',
          statut: 'Nouveau',
        };
        fetch(WEBHOOK_URL, {
          method: 'POST',
          mode: 'no-cors',
          headers: { 'Content-Type': 'text/plain;charset=utf-8' },
          body: JSON.stringify(webhookPayload),
        }).catch((err) => console.warn('Webhook forward failed:', err));
      } catch (whErr) {
        console.warn('Webhook error:', whErr);
      }

      toast({
        title: 'Signalement envoyé!',
        description: 'Votre signalement a été transmis aux autorités compétentes.',
      });

      navigate('/dashboard');
    } catch (error) {
      console.error('Submit error:', error);
      toast({
        title: 'Erreur',
        description: 'Une erreur est survenue lors de l\'envoi du signalement',
        variant: 'destructive',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const selectedInstitution = category ? INSTITUTIONS[category as keyof typeof INSTITUTIONS] : null;

  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background pb-20">
      {/* Header */}
      <header className="gradient-hero text-primary-foreground shadow-lg sticky top-0 z-10">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Button 
                variant="ghost" 
                size="icon"
                className="text-primary-foreground hover:bg-primary-foreground/10"
                onClick={() => navigate('/dashboard')}
              >
                <ArrowLeft size={20} />
              </Button>
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-full bg-card overflow-hidden">
                  <img src={logo} alt="Faso Propre" className="w-full h-full object-cover" />
                </div>
                <h1 className="text-lg font-bold">Nouveau signalement</h1>
              </div>
            </div>
            <Button
              variant="ghost"
              size="icon"
              className="text-primary-foreground hover:bg-primary-foreground/10"
              onClick={() => setShowOnboarding(true)}
            >
              <HelpCircle size={20} />
            </Button>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-6">
        <form onSubmit={handleSubmit} className="space-y-6 max-w-lg mx-auto">
          {/* Category Selection */}
          <Card className="shadow-card animate-slide-up">
            <CardHeader className="pb-3">
              <CardTitle className="text-lg">Type de problème</CardTitle>
              <CardDescription>Sélectionnez la catégorie du signalement</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label>Catégorie *</Label>
                <Select value={category} onValueChange={(val) => {
                  setCategory(val);
                  setSubcategory('');
                }}>
                  <SelectTrigger className="bg-card">
                    <SelectValue placeholder="Sélectionnez une catégorie" />
                  </SelectTrigger>
                  <SelectContent className="bg-popover">
                    {Object.entries(INSTITUTIONS).map(([key, inst]) => (
                      <SelectItem key={key} value={key}>
                        {inst.icon} {inst.nom}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {selectedInstitution && (
                <div className="space-y-2">
                  <Label>Type de problème *</Label>
                  <Select value={subcategory} onValueChange={setSubcategory}>
                    <SelectTrigger className="bg-card">
                      <SelectValue placeholder="Précisez le type" />
                    </SelectTrigger>
                    <SelectContent className="bg-popover">
                      {selectedInstitution.options.map((option) => (
                        <SelectItem key={option} value={option}>{option}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              )}
            </CardContent>
          </Card>

          {/* GPS Position */}
          <Card className="shadow-card animate-slide-up" style={{ animationDelay: '0.1s' }}>
            <CardHeader className="pb-3">
              <CardTitle className="text-lg">Ma position actuelle</CardTitle>
              <CardDescription>Capturez votre position GPS</CardDescription>
            </CardHeader>
            <CardContent>
              <GPSCapture
                latitude={latitude}
                longitude={longitude}
                onCapture={handleGPSCapture}
              />
            </CardContent>
          </Card>

          {/* Photo & Description */}
          <Card className="shadow-card animate-slide-up" style={{ animationDelay: '0.2s' }}>
            <CardHeader className="pb-3">
              <CardTitle className="text-lg">Documentation</CardTitle>
              <CardDescription>Ajoutez une photo et des détails</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Photo Upload */}
              <div className="space-y-2">
                <Label>Photo du problème *</Label>
                {photo ? (
                  <div className="relative">
                    <img 
                      src={photo} 
                      alt="Aperçu" 
                      className="w-full h-48 object-cover rounded-lg"
                    />
                    <Button
                      type="button"
                      variant="destructive"
                      size="icon"
                      className="absolute top-2 right-2"
                      onClick={() => {
                        setPhoto(null);
                        setPhotoFile(null);
                      }}
                    >
                      <Trash2 size={16} />
                    </Button>
                  </div>
                ) : (
                  <div
                    className="border-2 border-dashed border-primary/30 rounded-lg p-8 text-center cursor-pointer hover:border-primary/50 transition-colors"
                    onClick={() => fileInputRef.current?.click()}
                  >
                    <Camera size={40} className="mx-auto text-primary/50 mb-2" />
                    <p className="text-sm text-muted-foreground">
                      Touchez pour prendre ou choisir une photo
                    </p>
                    <p className="text-xs text-muted-foreground mt-1">
                      Max 5 Mo • JPG, PNG
                    </p>
                  </div>
                )}
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  capture="environment"
                  className="hidden"
                  onChange={handlePhotoCapture}
                />
              </div>

              {/* Description */}
              <div className="space-y-2">
                <Label>Description (optionnel)</Label>
                <Textarea
                  placeholder="Décrivez le problème en détail..."
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  rows={3}
                  maxLength={500}
                />
                <p className="text-xs text-muted-foreground text-right">
                  {description.length}/500
                </p>
              </div>

              {/* Audio Recording */}
              <div className="space-y-2">
                <Label className="flex items-center gap-1">
                  <Mic size={14} />
                  Message audio (optionnel)
                </Label>
                {audioUrl ? (
                  <div className="flex items-center gap-3 p-3 rounded-lg bg-muted/50 border">
                    <audio src={audioUrl} controls className="flex-1 h-8" />
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      className="shrink-0 text-destructive hover:text-destructive"
                      onClick={() => {
                        setAudioBlob(null);
                        setAudioUrl(null);
                      }}
                    >
                      <X size={16} />
                    </Button>
                  </div>
                ) : (
                  <div className="flex justify-center">
                    <Button
                      type="button"
                      variant={isRecording ? 'destructive' : 'outline'}
                      className={`h-16 w-16 rounded-full ${isRecording ? 'animate-pulse' : ''}`}
                      onClick={isRecording ? stopRecording : startRecording}
                    >
                      {isRecording ? <Square size={24} /> : <Mic size={24} />}
                    </Button>
                  </div>
                )}
                {isRecording && (
                  <p className="text-xs text-center text-destructive font-medium">
                    🔴 Enregistrement en cours... Appuyez pour arrêter
                  </p>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Submit Button */}
          <Button
            type="submit"
            size="lg"
            className="w-full bg-primary hover:bg-primary/90"
            disabled={isSubmitting || !category || !subcategory || !photo}
          >
            {isSubmitting ? (
              <span className="flex items-center gap-2">
                <span className="animate-spin h-5 w-5 border-2 border-primary-foreground border-t-transparent rounded-full" />
                Envoi en cours...
              </span>
            ) : (
              <span className="flex items-center gap-2">
                <Send size={20} />
                Envoyer le signalement
              </span>
            )}
          </Button>
        </form>
      </main>

      <BottomNavigation />

      <OnboardingGuide 
        open={showOnboarding} 
        onOpenChange={(open) => {
          setShowOnboarding(open);
          if (!open) {
            localStorage.setItem('faso_propre_onboarding_seen', 'true');
          }
        }} 
      />
    </div>
  );
};

export default NewReport;
