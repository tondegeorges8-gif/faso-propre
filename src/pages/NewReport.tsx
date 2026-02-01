import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { useReports } from '@/contexts/ReportsContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { REPORT_CATEGORIES, ReportCategory } from '@/data/burkinaFaso';
import HierarchicalLocationPicker, { LocationSelection } from '@/components/location/HierarchicalLocationPicker';
import OnboardingGuide from '@/components/onboarding/OnboardingGuide';
import { 
  ArrowLeft, 
  Camera, 
  MapPin, 
  Navigation, 
  Send,
  Phone,
  Loader2,
  HelpCircle
} from 'lucide-react';
const logo = '/logo.png';

const NewReport: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { addReport } = useReports();
  const { toast } = useToast();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [category, setCategory] = useState<ReportCategory | ''>('');
  const [subcategory, setSubcategory] = useState('');
  const [location, setLocation] = useState<LocationSelection | undefined>();
  const [description, setDescription] = useState('');
  const [photo, setPhoto] = useState<string>('');
  const [latitude, setLatitude] = useState<number | undefined>();
  const [longitude, setLongitude] = useState<number | undefined>();
  const [isGettingLocation, setIsGettingLocation] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showOnboarding, setShowOnboarding] = useState(false);

  useEffect(() => {
    // Vérifier si l'utilisateur a déjà vu le guide
    const onboardingComplete = localStorage.getItem('faso-propre-onboarding-complete');
    if (!onboardingComplete) {
      setShowOnboarding(true);
    }
  }, []);

  if (!user) {
    navigate('/auth');
    return null;
  }

  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onloadend = () => {
      setPhoto(reader.result as string);
    };
    reader.readAsDataURL(file);
  };

  const handleGetLocation = () => {
    if (!navigator.geolocation) {
      toast({
        title: "Erreur",
        description: "La géolocalisation n'est pas supportée par votre navigateur",
        variant: "destructive"
      });
      return;
    }

    setIsGettingLocation(true);
    navigator.geolocation.getCurrentPosition(
      (position) => {
        setLatitude(position.coords.latitude);
        setLongitude(position.coords.longitude);
        setIsGettingLocation(false);
        toast({
          title: "Position obtenue",
          description: "Votre position GPS a été enregistrée"
        });
      },
      (error) => {
        setIsGettingLocation(false);
        toast({
          title: "Erreur",
          description: "Impossible d'obtenir votre position. Veuillez autoriser la géolocalisation.",
          variant: "destructive"
        });
      }
    );
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!category || !subcategory || !location || !photo) {
      toast({
        title: "Erreur",
        description: "Veuillez remplir tous les champs obligatoires et ajouter une photo",
        variant: "destructive"
      });
      return;
    }

    setIsSubmitting(true);

    try {
      // Construire la chaîne de localisation complète
      const locationParts = [location.city];
      if (location.arrondissement) locationParts.push(location.arrondissement);
      locationParts.push(location.sector, location.quarter, location.subQuarter);

      addReport({
        userId: user.id,
        category: category as ReportCategory,
        subcategory,
        city: location.city,
        neighborhood: locationParts.slice(1).join(' → '), // Tout sauf la ville
        description,
        photo,
        latitude,
        longitude
      });

      toast({
        title: "Signalement envoyé",
        description: "Votre signalement a été enregistré avec succès"
      });

      navigate('/dashboard');
    } catch (error) {
      toast({
        title: "Erreur",
        description: "Une erreur est survenue lors de l'envoi du signalement",
        variant: "destructive"
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const selectedCategory = category ? REPORT_CATEGORIES[category] : null;

  // Construire l'affichage de la localisation
  const locationDisplay = location ? (
    <div className="text-xs text-muted-foreground mt-2 p-2 bg-muted/50 rounded-lg">
      <p className="font-medium text-foreground mb-1">📍 Localisation sélectionnée :</p>
      <div className="space-y-0.5">
        <p>🏙️ Ville : <span className="text-foreground">{location.city}</span></p>
        {location.arrondissement && (
          <p>🏛️ Arrondissement : <span className="text-foreground">{location.arrondissement}</span></p>
        )}
        <p>📍 Secteur : <span className="text-foreground">{location.sector}</span></p>
        <p>🏘️ Quartier : <span className="text-foreground">{location.quarter}</span></p>
        <p>📌 Sous-quartier : <span className="text-foreground font-medium">{location.subQuarter}</span></p>
      </div>
    </div>
  ) : null;

  return (
    <div className="min-h-screen bg-background">
      {/* Onboarding Guide */}
      <OnboardingGuide 
        open={showOnboarding} 
        onOpenChange={setShowOnboarding}
      />

      {/* Header */}
      <header className="gradient-hero text-primary-foreground shadow-lg">
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
              <div className="flex items-center gap-3">
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
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Category Selection */}
          <Card className="shadow-card">
            <CardHeader className="pb-2">
              <CardTitle className="text-lg">Catégorie *</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                {Object.entries(REPORT_CATEGORIES).map(([key, cat]) => (
                  <button
                    key={key}
                    type="button"
                    className={`p-4 rounded-lg border-2 transition-all text-center ${
                      category === key 
                        ? 'border-primary bg-primary/5' 
                        : 'border-border hover:border-primary/50'
                    }`}
                    onClick={() => {
                      setCategory(key as ReportCategory);
                      setSubcategory('');
                    }}
                  >
                    <span className="text-3xl block mb-2">{cat.icon}</span>
                    <span className="text-sm font-medium">{cat.name.split('(')[0].trim()}</span>
                  </button>
                ))}
              </div>

              {selectedCategory && (
                <div className="p-3 rounded-lg bg-muted/50 flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">
                    📞 Numéro d'urgence
                  </span>
                  <a 
                    href={`tel:${selectedCategory.phone.replace(/\s/g, '')}`}
                    className="flex items-center gap-1 text-primary font-medium"
                  >
                    <Phone size={16} />
                    {selectedCategory.phone}
                  </a>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Subcategory */}
          {category && (
            <Card className="shadow-card animate-scale-in">
              <CardHeader className="pb-2">
                <CardTitle className="text-lg">Type de problème *</CardTitle>
              </CardHeader>
              <CardContent>
                <Select value={subcategory} onValueChange={setSubcategory}>
                  <SelectTrigger className="bg-card">
                    <SelectValue placeholder="Sélectionnez le type de problème" />
                  </SelectTrigger>
                  <SelectContent className="bg-popover">
                    {REPORT_CATEGORIES[category].subcategories.map((sub) => (
                      <SelectItem key={sub} value={sub}>{sub}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </CardContent>
            </Card>
          )}

          {/* Location - Hierarchical Picker */}
          <Card className="shadow-card">
            <CardHeader className="pb-2">
              <CardTitle className="text-lg flex items-center gap-2">
                <MapPin size={20} />
                Localisation précise *
              </CardTitle>
              <p className="text-xs text-muted-foreground mt-1">
                Ville → Arrondissement → Secteur → Quartier → Sous-quartier
              </p>
            </CardHeader>
            <CardContent className="space-y-4">
              <HierarchicalLocationPicker
                value={location}
                onSelect={setLocation}
                placeholder="Sélectionnez votre localisation..."
              />
              
              {locationDisplay}

              {/* GPS */}
              <Button
                type="button"
                variant="outline"
                className="w-full"
                onClick={handleGetLocation}
                disabled={isGettingLocation}
              >
                {isGettingLocation ? (
                  <span className="flex items-center gap-2">
                    <Loader2 className="animate-spin" size={18} />
                    Obtention de la position...
                  </span>
                ) : latitude && longitude ? (
                  <span className="flex items-center gap-2 text-accent">
                    <Navigation size={18} />
                    Position GPS enregistrée ✓
                  </span>
                ) : (
                  <span className="flex items-center gap-2">
                    <Navigation size={18} />
                    Obtenir ma position GPS
                  </span>
                )}
              </Button>
            </CardContent>
          </Card>

          {/* Photo */}
          <Card className="shadow-card">
            <CardHeader className="pb-2">
              <CardTitle className="text-lg flex items-center gap-2">
                <Camera size={20} />
                Photo *
              </CardTitle>
            </CardHeader>
            <CardContent>
              {photo ? (
                <div className="relative">
                  <img 
                    src={photo} 
                    alt="Preview" 
                    className="w-full h-48 object-cover rounded-lg"
                  />
                  <Button
                    type="button"
                    variant="secondary"
                    size="sm"
                    className="absolute bottom-2 right-2"
                    onClick={() => fileInputRef.current?.click()}
                  >
                    Changer
                  </Button>
                </div>
              ) : (
                <button
                  type="button"
                  className="w-full h-48 border-2 border-dashed border-border rounded-lg flex flex-col items-center justify-center gap-3 hover:border-primary/50 transition-colors"
                  onClick={() => fileInputRef.current?.click()}
                >
                  <Camera size={40} className="text-muted-foreground" />
                  <span className="text-muted-foreground">Ajouter une photo</span>
                </button>
              )}
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                capture="environment"
                className="hidden"
                onChange={handlePhotoUpload}
              />
            </CardContent>
          </Card>

          {/* Description */}
          <Card className="shadow-card">
            <CardHeader className="pb-2">
              <CardTitle className="text-lg">Description (optionnel)</CardTitle>
            </CardHeader>
            <CardContent>
              <Textarea
                placeholder="Décrivez le problème en détail..."
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                rows={4}
              />
            </CardContent>
          </Card>

          {/* Submit */}
          <Button
            type="submit"
            className="w-full py-6 text-lg bg-primary hover:bg-primary/90"
            disabled={isSubmitting}
          >
            {isSubmitting ? (
              <span className="flex items-center gap-2">
                <Loader2 className="animate-spin" size={20} />
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
    </div>
  );
};

export default NewReport;
