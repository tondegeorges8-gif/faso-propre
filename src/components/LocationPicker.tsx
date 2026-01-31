import React, { useState, useMemo } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { BURKINA_LOCATIONS, getSectorsForCity, getNeighborhoodsForSector, Sector } from '@/data/locations';
import { MapPin, ChevronRight, ChevronLeft, Search, Check } from 'lucide-react';
import { cn } from '@/lib/utils';

interface LocationPickerProps {
  value: string;
  city: string;
  onSelect: (location: { city: string; sector: string; neighborhood: string }) => void;
  placeholder?: string;
}

type Step = 'city' | 'sector' | 'neighborhood';

const LocationPicker: React.FC<LocationPickerProps> = ({
  value,
  city: initialCity,
  onSelect,
  placeholder = "Sélectionnez le quartier"
}) => {
  const [open, setOpen] = useState(false);
  const [step, setStep] = useState<Step>('city');
  const [selectedCity, setSelectedCity] = useState(initialCity || '');
  const [selectedSector, setSelectedSector] = useState('');
  const [searchQuery, setSearchQuery] = useState('');

  // Get data based on current selection
  const cities = BURKINA_LOCATIONS.map(c => c.name);
  const sectors = useMemo(() => getSectorsForCity(selectedCity), [selectedCity]);
  const neighborhoods = useMemo(() => getNeighborhoodsForSector(selectedCity, selectedSector), [selectedCity, selectedSector]);

  // Filter based on search
  const filteredItems = useMemo(() => {
    const query = searchQuery.toLowerCase();
    if (step === 'city') {
      return cities.filter(c => c.toLowerCase().includes(query));
    } else if (step === 'sector') {
      return sectors.filter(s => s.name.toLowerCase().includes(query));
    } else {
      return neighborhoods.filter(n => n.toLowerCase().includes(query));
    }
  }, [step, cities, sectors, neighborhoods, searchQuery]);

  const handleCitySelect = (cityName: string) => {
    setSelectedCity(cityName);
    setSelectedSector('');
    setSearchQuery('');
    setStep('sector');
  };

  const handleSectorSelect = (sectorName: string) => {
    setSelectedSector(sectorName);
    setSearchQuery('');
    setStep('neighborhood');
  };

  const handleNeighborhoodSelect = (neighborhoodName: string) => {
    onSelect({
      city: selectedCity,
      sector: selectedSector,
      neighborhood: neighborhoodName
    });
    setOpen(false);
    // Reset for next use
    setStep('city');
    setSearchQuery('');
  };

  const handleBack = () => {
    setSearchQuery('');
    if (step === 'sector') {
      setStep('city');
      setSelectedCity('');
    } else if (step === 'neighborhood') {
      setStep('sector');
      setSelectedSector('');
    }
  };

  const handleOpenChange = (isOpen: boolean) => {
    setOpen(isOpen);
    if (isOpen) {
      // Reset state when opening
      if (initialCity) {
        setSelectedCity(initialCity);
        setStep('sector');
      } else {
        setStep('city');
        setSelectedCity('');
      }
      setSelectedSector('');
      setSearchQuery('');
    }
  };

  const getStepTitle = () => {
    switch (step) {
      case 'city':
        return 'Sélectionnez une ville';
      case 'sector':
        return `${selectedCity} - Secteur`;
      case 'neighborhood':
        return `${selectedSector} - Quartier`;
    }
  };

  const getSearchPlaceholder = () => {
    switch (step) {
      case 'city':
        return 'Rechercher une ville...';
      case 'sector':
        return 'Rechercher un secteur...';
      case 'neighborhood':
        return 'Rechercher un quartier...';
    }
  };

  const renderBreadcrumb = () => (
    <div className="flex items-center gap-1 text-xs text-muted-foreground mb-3 flex-wrap">
      <span 
        className={cn(
          "cursor-pointer hover:text-primary transition-colors",
          step === 'city' && "text-primary font-medium"
        )}
        onClick={() => { setStep('city'); setSelectedCity(''); setSelectedSector(''); setSearchQuery(''); }}
      >
        Ville
      </span>
      <ChevronRight size={12} />
      <span 
        className={cn(
          step !== 'city' && "cursor-pointer hover:text-primary transition-colors",
          step === 'sector' && "text-primary font-medium",
          step === 'city' && "opacity-50"
        )}
        onClick={() => { if (selectedCity) { setStep('sector'); setSelectedSector(''); setSearchQuery(''); }}}
      >
        Secteur
      </span>
      <ChevronRight size={12} />
      <span 
        className={cn(
          step === 'neighborhood' && "text-primary font-medium",
          step !== 'neighborhood' && "opacity-50"
        )}
      >
        Quartier
      </span>
    </div>
  );

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogTrigger asChild>
        <Button
          variant="outline"
          className={cn(
            "w-full justify-start text-left font-normal bg-card",
            !value && "text-muted-foreground"
          )}
        >
          <MapPin size={16} className="mr-2 shrink-0" />
          <span className="truncate">
            {value || placeholder}
          </span>
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md max-h-[80vh] flex flex-col">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            {step !== 'city' && (
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8"
                onClick={handleBack}
              >
                <ChevronLeft size={18} />
              </Button>
            )}
            <span>{getStepTitle()}</span>
          </DialogTitle>
        </DialogHeader>

        {renderBreadcrumb()}

        {/* Search Input */}
        <div className="relative mb-3">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder={getSearchPlaceholder()}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-9"
          />
        </div>

        {/* List */}
        <ScrollArea className="flex-1 max-h-[50vh]">
          <div className="space-y-1 pr-4">
            {step === 'city' && (
              filteredItems.length > 0 ? (
                (filteredItems as string[]).map((cityName) => (
                  <button
                    key={cityName}
                    className={cn(
                      "w-full px-3 py-3 rounded-lg text-left transition-colors flex items-center justify-between group",
                      "hover:bg-primary/10 hover:text-primary",
                      selectedCity === cityName && "bg-primary/10 text-primary"
                    )}
                    onClick={() => handleCitySelect(cityName)}
                  >
                    <span className="font-medium">{cityName}</span>
                    <ChevronRight size={16} className="opacity-50 group-hover:opacity-100" />
                  </button>
                ))
              ) : (
                <p className="text-center text-muted-foreground py-4">Aucune ville trouvée</p>
              )
            )}

            {step === 'sector' && (
              filteredItems.length > 0 ? (
                (filteredItems as Sector[]).map((sector) => (
                  <button
                    key={sector.name}
                    className={cn(
                      "w-full px-3 py-3 rounded-lg text-left transition-colors flex items-center justify-between group",
                      "hover:bg-primary/10 hover:text-primary"
                    )}
                    onClick={() => handleSectorSelect(sector.name)}
                  >
                    <div>
                      <span className="font-medium">{sector.name}</span>
                      <p className="text-xs text-muted-foreground mt-0.5">
                        {sector.neighborhoods.join(', ')}
                      </p>
                    </div>
                    <ChevronRight size={16} className="opacity-50 group-hover:opacity-100 shrink-0" />
                  </button>
                ))
              ) : (
                <p className="text-center text-muted-foreground py-4">Aucun secteur trouvé</p>
              )
            )}

            {step === 'neighborhood' && (
              filteredItems.length > 0 ? (
                (filteredItems as string[]).map((neighborhoodName) => (
                  <button
                    key={neighborhoodName}
                    className={cn(
                      "w-full px-3 py-3 rounded-lg text-left transition-colors flex items-center justify-between group",
                      "hover:bg-primary/10 hover:text-primary",
                      value === neighborhoodName && "bg-primary/10 text-primary"
                    )}
                    onClick={() => handleNeighborhoodSelect(neighborhoodName)}
                  >
                    <span className="font-medium">{neighborhoodName}</span>
                    {value === neighborhoodName && <Check size={16} className="text-primary" />}
                  </button>
                ))
              ) : (
                <p className="text-center text-muted-foreground py-4">Aucun quartier trouvé</p>
              )
            )}
          </div>
        </ScrollArea>

        {/* Current Selection Summary */}
        {(selectedCity || selectedSector) && (
          <div className="pt-3 border-t mt-3">
            <p className="text-xs text-muted-foreground">
              Sélection : <span className="text-foreground font-medium">
                {[selectedCity, selectedSector].filter(Boolean).join(' → ')}
              </span>
            </p>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
};

export default LocationPicker;
