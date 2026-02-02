import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { REPORT_CATEGORIES } from '@/data/burkinaFaso';
import CitySelector from '@/components/location/CitySelector';
import GPSCapture from '@/components/location/GPSCapture';
import OnboardingGuide from '@/components/onboarding/OnboardingGuide';
import { supabase } from '@/integrations/supabase/client';
import { 
  ArrowLeft, 
  Camera, 
  Send,
  Trash2,
  HelpCircle,
  MapPin,
  Building2
} from 'lucide-react';

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
  const [ville, setVille] = useState('');
  const [arrondissement, setArrondissement] = useState('');
  const [secteur, setSecteur] = useState('');
  const [quartier, setQuartier] = useState('');
  const [sousQuartier, setSousQuartier] = useState('');
  const [description, setDescription] = useState('');
  const [photo, setPhoto] = useState<string | null>(null);
  const [photoFile, setPhotoFile] = useState<File | null>(null);
  const [latitude, setLatitude] = useState<number | null>(null);
  const [longitude, setLongitude] = useState<number | null>(null);

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

  const handlePhotoCapture = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file size (max 5MB)
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

    if (!category || !subcategory || !ville || !photo) {
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

      // Upload photo to storage
      if (photoFile) {
        const fileExt = photoFile.name.split('.').pop();
        const fileName = `${user.id}/${Date.now()}.${fileExt}`;
        
        const { error: uploadError, data } = await supabase.storage
          .from('signalements-photos')
          .upload(fileName, photoFile);

        if (uploadError) {
          throw new Error('Erreur lors de l\'upload de la photo');
        }

        const { data: { publicUrl } } = supabase.storage
          .from('signalements-photos')
          .getPublicUrl(fileName);
        
        photoUrl = publicUrl;
      }

      // Create signalement
      const nomComplet = `${profile.prenoms} ${profile.nom}`;
      
      const { error } = await supabase
        .from('signalements')
        .insert({
          user_id: user.id,
          nom_complet: nomComplet,
          category,
          subcategory,
          ville,
          arrondissement: arrondissement || null,
          secteur: secteur || null,
          quartier: quartier || null,
          sous_quartier: sousQuartier || null,
          description: description || null,
          photo_url: photoUrl,
          latitude: latitude,
          longitude: longitude,
          status: 'PENDING',
          statut_paiement: 'en_attente',
          montant_total: 0,
          commission_montant: 0,
        });

      if (error) {
        throw error;
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

  const selectedCategory = category ? REPORT_CATEGORIES[category as keyof typeof REPORT_CATEGORIES] : null;

  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
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
                    {Object.entries(REPORT_CATEGORIES).map(([key, cat]) => (
                      <SelectItem key={key} value={key}>
                        {cat.icon} {cat.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {selectedCategory && (
                <div className="space-y-2">
                  <Label>Sous-catégorie *</Label>
                  <Select value={subcategory} onValueChange={setSubcategory}>
                    <SelectTrigger className="bg-card">
                      <SelectValue placeholder="Précisez le type" />
                    </SelectTrigger>
                    <SelectContent className="bg-popover">
                      {selectedCategory.subcategories.map((sub) => (
                        <SelectItem key={sub} value={sub}>{sub}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Location Section */}
          <Card className="shadow-card animate-slide-up" style={{ animationDelay: '0.1s' }}>
            <CardHeader className="pb-3">
              <CardTitle className="text-lg flex items-center gap-2">
                <MapPin size={20} className="text-primary" />
                Localisation précise
              </CardTitle>
              <CardDescription>
                Plus vous êtes précis, plus vite nous interviendrons
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* City Selector with Search */}
              <div className="space-y-2">
                <Label className="flex items-center gap-1">
                  <Building2 size={14} />
                  Ville / Commune *
                </Label>
                <CitySelector value={ville} onChange={setVille} />
              </div>

              {/* Manual Input Fields */}
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-2">
                  <Label>Arrondissement</Label>
                  <Input
                    placeholder="Ex: Arrondissement 1"
                    value={arrondissement}
                    onChange={(e) => setArrondissement(e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Secteur</Label>
                  <Input
                    placeholder="Ex: Secteur 15"
                    value={secteur}
                    onChange={(e) => setSecteur(e.target.value)}
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-2">
                  <Label>Quartier</Label>
                  <Input
                    placeholder="Ex: Patte d'Oie"
                    value={quartier}
                    onChange={(e) => setQuartier(e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Sous-quartier</Label>
                  <Input
                    placeholder="Ex: Zone A"
                    value={sousQuartier}
                    onChange={(e) => setSousQuartier(e.target.value)}
                  />
                </div>
              </div>

              {/* GPS Capture */}
              <div className="pt-2 border-t">
                <Label className="mb-3 block">Position GPS</Label>
                <GPSCapture
                  latitude={latitude}
                  longitude={longitude}
                  onCapture={handleGPSCapture}
                />
              </div>
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
            </CardContent>
          </Card>

          {/* Submit Button */}
          <Button
            type="submit"
            size="lg"
            className="w-full bg-primary hover:bg-primary/90"
            disabled={isSubmitting || !category || !subcategory || !ville || !photo}
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

      {/* Onboarding Guide */}
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
