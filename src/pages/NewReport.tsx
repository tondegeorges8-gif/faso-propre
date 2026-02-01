import React, { useState, useRef } from 'react';
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
import { REPORT_CATEGORIES, MAJOR_CITIES, ReportCategory } from '@/data/burkinaFaso';
import { getAllCities } from '@/data/locations';
import LocationPicker from '@/components/LocationPicker';
import { 
  ArrowLeft, 
  Camera, 
  MapPin, 
  Navigation, 
  Send,
  Phone,
  Loader2
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
  const [city, setCity] = useState(user?.city || '');
  const [useManualCity, setUseManualCity] = useState(false);
  const [manualCity, setManualCity] = useState('');
  const [neighborhood, setNeighborhood] = useState('');
  const [selectedSector, setSelectedSector] = useState('');
  const [description, setDescription] = useState('');
  const [photo, setPhoto] = useState<string>('');
  const [latitude, setLatitude] = useState<number | undefined>();
  const [longitude, setLongitude] = useState<number | undefined>();
  const [isGettingLocation, setIsGettingLocation] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

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

    const selectedCity = useManualCity ? manualCity : city;

    if (!category || !subcategory || !selectedCity || !neighborhood || !photo) {
      toast({
        title: "Erreur",
        description: "Veuillez remplir tous les champs obligatoires et ajouter une photo",
        variant: "destructive"
      });
      return;
    }

    setIsSubmitting(true);

    try {
      addReport({
        userId: user.id,
        category: category as ReportCategory,
        subcategory,
        city: selectedCity,
        neighborhood,
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

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="gradient-hero text-primary-foreground shadow-lg">
        <div className="container mx-auto px-4 py-4">
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

          {/* Location */}
          <Card className="shadow-card">
            <CardHeader className="pb-2">
              <CardTitle className="text-lg flex items-center gap-2">
                <MapPin size={20} />
                Localisation *
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* City */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label>Ville</Label>
                  <button
                    type="button"
                    className="text-xs text-primary hover:underline"
                    onClick={() => setUseManualCity(!useManualCity)}
                  >
                    {useManualCity ? 'Choisir dans la liste' : 'Saisir manuellement'}
                  </button>
                </div>
                {useManualCity ? (
                  <Input
                    placeholder="Entrez la ville"
                    value={manualCity}
                    onChange={(e) => setManualCity(e.target.value)}
                  />
                ) : (
                  <Select value={city} onValueChange={setCity}>
                    <SelectTrigger className="bg-card">
                      <SelectValue placeholder="Sélectionnez la ville" />
                    </SelectTrigger>
                    <SelectContent className="bg-popover max-h-60">
                      {MAJOR_CITIES.map((c) => (
                        <SelectItem key={c} value={c}>{c}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                )}
              </div>

              {/* Neighborhood - Hierarchical Picker */}
              <div className="space-y-2">
                <Label>Quartier (Ville → Secteur → Quartier)</Label>
                <LocationPicker
                  value={neighborhood}
                  city={useManualCity ? manualCity : city}
                  onSelect={(location) => {
                    if (!useManualCity) {
                      setCity(location.city);
                    }
                    setSelectedSector(location.sector);
                    setNeighborhood(location.neighborhood);
                  }}
                  placeholder="Sélectionnez le quartier..."
                />
                {neighborhood && selectedSector && (
                  <p className="text-xs text-muted-foreground">
                    📍 {city || manualCity} → {selectedSector} → <span className="font-medium text-foreground">{neighborhood}</span>
                  </p>
                )}
              </div>

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
