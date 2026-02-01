import React, { useState, useMemo, useCallback } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Badge } from '@/components/ui/badge';
import { 
  BURKINA_CITIES, 
  getCityByName, 
  cityHasArrondissements, 
  getArrondissements, 
  getSectors, 
  getQuarters, 
  getSubQuarters,
  searchLocations,
  LocationSearchResult
} from '@/data/burkinaTerritory';
import { MapPin, ChevronRight, ChevronLeft, Search, Check, X, Navigation } from 'lucide-react';
import { cn } from '@/lib/utils';

export interface LocationSelection {
  city: string;
  arrondissement?: string;
  sector: string;
  quarter: string;
  subQuarter: string;
}

interface HierarchicalLocationPickerProps {
  value?: LocationSelection;
  onSelect: (location: LocationSelection) => void;
  placeholder?: string;
}

type Step = 'city' | 'arrondissement' | 'sector' | 'quarter' | 'subQuarter';

const STEP_LABELS: Record<Step, string> = {
  city: 'Ville',
  arrondissement: 'Arrondissement',
  sector: 'Secteur',
  quarter: 'Quartier',
  subQuarter: 'Sous-quartier'
};

const HierarchicalLocationPicker: React.FC<HierarchicalLocationPickerProps> = ({
  value,
  onSelect,
  placeholder = "Sélectionnez votre localisation"
}) => {
  const [open, setOpen] = useState(false);
  const [step, setStep] = useState<Step>('city');
  const [selectedCity, setSelectedCity] = useState('');
  const [selectedArrondissement, setSelectedArrondissement] = useState('');
  const [selectedSector, setSelectedSector] = useState('');
  const [selectedQuarter, setSelectedQuarter] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [isSearchMode, setIsSearchMode] = useState(false);

  // Données dynamiques basées sur la sélection
  const cities = useMemo(() => BURKINA_CITIES.map(c => c.name), []);
  const needsArrondissement = useMemo(() => cityHasArrondissements(selectedCity), [selectedCity]);
  const arrondissements = useMemo(() => getArrondissements(selectedCity), [selectedCity]);
  const sectors = useMemo(() => getSectors(selectedCity, selectedArrondissement || undefined), [selectedCity, selectedArrondissement]);
  const quarters = useMemo(() => getQuarters(selectedCity, selectedArrondissement || undefined, selectedSector), [selectedCity, selectedArrondissement, selectedSector]);
  const subQuarters = useMemo(() => getSubQuarters(selectedCity, selectedArrondissement || undefined, selectedSector, selectedQuarter), [selectedCity, selectedArrondissement, selectedSector, selectedQuarter]);

  // Résultats de recherche
  const searchResults = useMemo(() => {
    if (!isSearchMode || searchQuery.length < 2) return [];
    return searchLocations(searchQuery);
  }, [searchQuery, isSearchMode]);

  // Filtrer les items de l'étape courante
  const filteredItems = useMemo(() => {
    const query = searchQuery.toLowerCase();
    if (isSearchMode) return [];
    
    switch (step) {
      case 'city':
        return cities.filter(c => c.toLowerCase().includes(query));
      case 'arrondissement':
        return arrondissements.filter(a => a.name.toLowerCase().includes(query)).map(a => a.name);
      case 'sector':
        return sectors.filter(s => s.name.toLowerCase().includes(query)).map(s => s.name);
      case 'quarter':
        return quarters.filter(q => q.name.toLowerCase().includes(query)).map(q => q.name);
      case 'subQuarter':
        return subQuarters.filter(sq => sq.toLowerCase().includes(query));
      default:
        return [];
    }
  }, [step, cities, arrondissements, sectors, quarters, subQuarters, searchQuery, isSearchMode]);

  const handleCitySelect = useCallback((cityName: string) => {
    setSelectedCity(cityName);
    setSelectedArrondissement('');
    setSelectedSector('');
    setSelectedQuarter('');
    setSearchQuery('');
    
    // Si la ville a des arrondissements, aller aux arrondissements
    if (cityHasArrondissements(cityName)) {
      setStep('arrondissement');
    } else {
      setStep('sector');
    }
  }, []);

  const handleArrondissementSelect = useCallback((arrName: string) => {
    setSelectedArrondissement(arrName);
    setSelectedSector('');
    setSelectedQuarter('');
    setSearchQuery('');
    setStep('sector');
  }, []);

  const handleSectorSelect = useCallback((sectorName: string) => {
    setSelectedSector(sectorName);
    setSelectedQuarter('');
    setSearchQuery('');
    setStep('quarter');
  }, []);

  const handleQuarterSelect = useCallback((quarterName: string) => {
    setSelectedQuarter(quarterName);
    setSearchQuery('');
    setStep('subQuarter');
  }, []);

  const handleSubQuarterSelect = useCallback((subQuarterName: string) => {
    const location: LocationSelection = {
      city: selectedCity,
      arrondissement: selectedArrondissement || undefined,
      sector: selectedSector,
      quarter: selectedQuarter,
      subQuarter: subQuarterName
    };
    onSelect(location);
    setOpen(false);
    resetState();
  }, [selectedCity, selectedArrondissement, selectedSector, selectedQuarter, onSelect]);

  const handleSearchResultSelect = useCallback((result: LocationSearchResult) => {
    const location: LocationSelection = {
      city: result.city,
      arrondissement: result.arrondissement,
      sector: result.sector,
      quarter: result.quarter,
      subQuarter: result.subQuarter
    };
    onSelect(location);
    setOpen(false);
    resetState();
  }, [onSelect]);

  const resetState = useCallback(() => {
    setStep('city');
    setSelectedCity('');
    setSelectedArrondissement('');
    setSelectedSector('');
    setSelectedQuarter('');
    setSearchQuery('');
    setIsSearchMode(false);
  }, []);

  const handleBack = useCallback(() => {
    setSearchQuery('');
    switch (step) {
      case 'arrondissement':
        setStep('city');
        setSelectedCity('');
        break;
      case 'sector':
        if (needsArrondissement) {
          setStep('arrondissement');
          setSelectedArrondissement('');
        } else {
          setStep('city');
          setSelectedCity('');
        }
        break;
      case 'quarter':
        setStep('sector');
        setSelectedSector('');
        break;
      case 'subQuarter':
        setStep('quarter');
        setSelectedQuarter('');
        break;
    }
  }, [step, needsArrondissement]);

  const handleOpenChange = useCallback((isOpen: boolean) => {
    setOpen(isOpen);
    if (isOpen) {
      resetState();
    }
  }, [resetState]);

  const getStepTitle = () => {
    if (isSearchMode) return 'Recherche globale';
    
    switch (step) {
      case 'city':
        return 'Sélectionnez une ville';
      case 'arrondissement':
        return `${selectedCity} - Arrondissement`;
      case 'sector':
        return selectedArrondissement 
          ? `${selectedArrondissement} - Secteur`
          : `${selectedCity} - Secteur`;
      case 'quarter':
        return `${selectedSector} - Quartier`;
      case 'subQuarter':
        return `${selectedQuarter} - Sous-quartier`;
    }
  };

  const displayValue = useMemo(() => {
    if (!value) return '';
    const parts = [value.city];
    if (value.arrondissement) parts.push(value.arrondissement);
    parts.push(value.sector, value.quarter, value.subQuarter);
    return parts.join(' → ');
  }, [value]);

  const renderBreadcrumb = () => {
    const steps: { key: Step; label: string; value: string; canClick: boolean }[] = [
      { key: 'city', label: 'Ville', value: selectedCity, canClick: step !== 'city' },
    ];
    
    if (needsArrondissement || selectedArrondissement) {
      steps.push({ 
        key: 'arrondissement', 
        label: 'Arr.', 
        value: selectedArrondissement, 
        canClick: step !== 'city' && step !== 'arrondissement' 
      });
    }
    
    steps.push(
      { key: 'sector', label: 'Secteur', value: selectedSector, canClick: ['quarter', 'subQuarter'].includes(step) },
      { key: 'quarter', label: 'Quartier', value: selectedQuarter, canClick: step === 'subQuarter' },
      { key: 'subQuarter', label: 'Sous-quartier', value: '', canClick: false }
    );

    return (
      <div className="flex items-center gap-1 text-xs text-muted-foreground mb-3 flex-wrap">
        {steps.map((s, idx) => (
          <React.Fragment key={s.key}>
            <span 
              className={cn(
                "px-1.5 py-0.5 rounded transition-colors",
                step === s.key && "bg-primary/10 text-primary font-medium",
                s.canClick && "cursor-pointer hover:text-primary",
                !s.canClick && step !== s.key && "opacity-50"
              )}
              onClick={() => {
                if (s.canClick) {
                  setStep(s.key);
                  setSearchQuery('');
                }
              }}
            >
              {s.value || s.label}
            </span>
            {idx < steps.length - 1 && <ChevronRight size={10} className="opacity-50" />}
          </React.Fragment>
        ))}
      </div>
    );
  };

  const renderSearchToggle = () => (
    <Button
      variant={isSearchMode ? "default" : "outline"}
      size="sm"
      className="mb-3"
      onClick={() => {
        setIsSearchMode(!isSearchMode);
        setSearchQuery('');
        if (isSearchMode) {
          resetState();
        }
      }}
    >
      {isSearchMode ? (
        <>
          <X size={14} className="mr-1" />
          Fermer la recherche
        </>
      ) : (
        <>
          <Navigation size={14} className="mr-1" />
          Recherche rapide
        </>
      )}
    </Button>
  );

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogTrigger asChild>
        <Button
          variant="outline"
          className={cn(
            "w-full justify-start text-left font-normal bg-card h-auto min-h-10 py-2",
            !value && "text-muted-foreground"
          )}
        >
          <MapPin size={16} className="mr-2 shrink-0 text-primary" />
          <span className="truncate text-wrap">
            {displayValue || placeholder}
          </span>
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-lg max-h-[85vh] flex flex-col">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            {(step !== 'city' && !isSearchMode) && (
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

        {renderSearchToggle()}
        
        {!isSearchMode && renderBreadcrumb()}

        {/* Search Input */}
        <div className="relative mb-3">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder={isSearchMode ? "Ex: Patte d'Oie, Ouaga 2000, Sarfalao..." : `Rechercher ${STEP_LABELS[step].toLowerCase()}...`}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-9"
          />
        </div>

        {/* Info box for search mode */}
        {isSearchMode && searchQuery.length < 2 && (
          <div className="p-3 bg-muted/50 rounded-lg text-sm text-muted-foreground mb-3">
            <p className="font-medium mb-1">💡 Recherche intelligente</p>
            <p>Tapez le nom d'un quartier, secteur ou sous-quartier pour le trouver directement.</p>
            <p className="mt-1">Exemple: "Patte d'Oie" → Ouagadougou → Arr. 12 → Secteur 54</p>
          </div>
        )}

        {/* Search Results */}
        {isSearchMode && searchResults.length > 0 && (
          <ScrollArea className="flex-1 max-h-[50vh]">
            <div className="space-y-1 pr-4">
              {searchResults.map((result, idx) => (
                <button
                  key={`${result.fullPath}-${idx}`}
                  className={cn(
                    "w-full px-3 py-3 rounded-lg text-left transition-colors",
                    "hover:bg-primary/10 hover:text-primary",
                    "border border-transparent hover:border-primary/20"
                  )}
                  onClick={() => handleSearchResultSelect(result)}
                >
                  <div className="font-medium text-sm">{result.subQuarter}</div>
                  <div className="text-xs text-muted-foreground mt-1 flex flex-wrap gap-1">
                    <Badge variant="outline" className="text-xs">{result.city}</Badge>
                    {result.arrondissement && (
                      <Badge variant="outline" className="text-xs">{result.arrondissement}</Badge>
                    )}
                    <Badge variant="outline" className="text-xs">{result.sector}</Badge>
                    <Badge variant="outline" className="text-xs">{result.quarter}</Badge>
                  </div>
                </button>
              ))}
            </div>
          </ScrollArea>
        )}

        {isSearchMode && searchQuery.length >= 2 && searchResults.length === 0 && (
          <p className="text-center text-muted-foreground py-4">Aucun résultat trouvé</p>
        )}

        {/* Standard Navigation */}
        {!isSearchMode && (
          <ScrollArea className="flex-1 max-h-[50vh]">
            <div className="space-y-1 pr-4">
              {step === 'city' && (
                filteredItems.length > 0 ? (
                  filteredItems.map((cityName) => (
                    <button
                      key={cityName}
                      className={cn(
                        "w-full px-3 py-3 rounded-lg text-left transition-colors flex items-center justify-between group",
                        "hover:bg-primary/10 hover:text-primary"
                      )}
                      onClick={() => handleCitySelect(cityName)}
                    >
                      <div>
                        <span className="font-medium">{cityName}</span>
                        {cityHasArrondissements(cityName) && (
                          <Badge variant="secondary" className="ml-2 text-xs">
                            Avec arrondissements
                          </Badge>
                        )}
                      </div>
                      <ChevronRight size={16} className="opacity-50 group-hover:opacity-100" />
                    </button>
                  ))
                ) : (
                  <p className="text-center text-muted-foreground py-4">Aucune ville trouvée</p>
                )
              )}

              {step === 'arrondissement' && (
                filteredItems.length > 0 ? (
                  filteredItems.map((arrName) => (
                    <button
                      key={arrName}
                      className={cn(
                        "w-full px-3 py-3 rounded-lg text-left transition-colors flex items-center justify-between group",
                        "hover:bg-primary/10 hover:text-primary"
                      )}
                      onClick={() => handleArrondissementSelect(arrName)}
                    >
                      <span className="font-medium">{arrName}</span>
                      <ChevronRight size={16} className="opacity-50 group-hover:opacity-100" />
                    </button>
                  ))
                ) : (
                  <p className="text-center text-muted-foreground py-4">Aucun arrondissement trouvé</p>
                )
              )}

              {step === 'sector' && (
                filteredItems.length > 0 ? (
                  filteredItems.map((sectorName) => {
                    const sectorData = sectors.find(s => s.name === sectorName);
                    const quarterNames = sectorData?.quarters.map(q => q.name).join(', ') || '';
                    return (
                      <button
                        key={sectorName}
                        className={cn(
                          "w-full px-3 py-3 rounded-lg text-left transition-colors flex items-center justify-between group",
                          "hover:bg-primary/10 hover:text-primary"
                        )}
                        onClick={() => handleSectorSelect(sectorName)}
                      >
                        <div className="flex-1 min-w-0">
                          <span className="font-medium">{sectorName}</span>
                          {quarterNames && (
                            <p className="text-xs text-muted-foreground mt-0.5 truncate">
                              {quarterNames}
                            </p>
                          )}
                        </div>
                        <ChevronRight size={16} className="opacity-50 group-hover:opacity-100 shrink-0 ml-2" />
                      </button>
                    );
                  })
                ) : (
                  <p className="text-center text-muted-foreground py-4">Aucun secteur trouvé</p>
                )
              )}

              {step === 'quarter' && (
                filteredItems.length > 0 ? (
                  filteredItems.map((quarterName) => {
                    const quarterData = quarters.find(q => q.name === quarterName);
                    const subQuarterCount = quarterData?.subQuarters.length || 0;
                    return (
                      <button
                        key={quarterName}
                        className={cn(
                          "w-full px-3 py-3 rounded-lg text-left transition-colors flex items-center justify-between group",
                          "hover:bg-primary/10 hover:text-primary"
                        )}
                        onClick={() => handleQuarterSelect(quarterName)}
                      >
                        <div>
                          <span className="font-medium">{quarterName}</span>
                          <span className="text-xs text-muted-foreground ml-2">
                            ({subQuarterCount} sous-quartier{subQuarterCount > 1 ? 's' : ''})
                          </span>
                        </div>
                        <ChevronRight size={16} className="opacity-50 group-hover:opacity-100" />
                      </button>
                    );
                  })
                ) : (
                  <p className="text-center text-muted-foreground py-4">Aucun quartier trouvé</p>
                )
              )}

              {step === 'subQuarter' && (
                filteredItems.length > 0 ? (
                  filteredItems.map((subQuarterName) => (
                    <button
                      key={subQuarterName}
                      className={cn(
                        "w-full px-3 py-3 rounded-lg text-left transition-colors flex items-center justify-between group",
                        "hover:bg-primary/10 hover:text-primary",
                        value?.subQuarter === subQuarterName && "bg-primary/10 text-primary"
                      )}
                      onClick={() => handleSubQuarterSelect(subQuarterName)}
                    >
                      <span className="font-medium">{subQuarterName}</span>
                      {value?.subQuarter === subQuarterName && <Check size={16} className="text-primary" />}
                    </button>
                  ))
                ) : (
                  <p className="text-center text-muted-foreground py-4">Aucun sous-quartier trouvé</p>
                )
              )}
            </div>
          </ScrollArea>
        )}

        {/* Current Selection Summary */}
        {(selectedCity || selectedArrondissement || selectedSector || selectedQuarter) && !isSearchMode && (
          <div className="pt-3 border-t mt-3">
            <p className="text-xs text-muted-foreground">
              Sélection : <span className="text-foreground font-medium">
                {[selectedCity, selectedArrondissement, selectedSector, selectedQuarter].filter(Boolean).join(' → ')}
              </span>
            </p>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
};

export default HierarchicalLocationPicker;
