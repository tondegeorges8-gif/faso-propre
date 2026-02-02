import React, { useState, useMemo } from 'react';
import { BURKINA_CITIES } from '@/data/burkinaCities';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Check, Search, MapPin } from 'lucide-react';
import { cn } from '@/lib/utils';

interface CitySelectorProps {
  value: string;
  onChange: (city: string) => void;
}

const CitySelector: React.FC<CitySelectorProps> = ({ value, onChange }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [isOpen, setIsOpen] = useState(false);

  const filteredCities = useMemo(() => {
    if (!searchTerm) return BURKINA_CITIES;
    const term = searchTerm.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '');
    return BURKINA_CITIES.filter(city => 
      city.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '').includes(term)
    );
  }, [searchTerm]);

  const handleSelect = (city: string) => {
    onChange(city);
    setIsOpen(false);
    setSearchTerm('');
  };

  return (
    <div className="relative">
      <div
        className={cn(
          "flex items-center gap-2 h-10 w-full rounded-md border border-input bg-background px-3 py-2 cursor-pointer",
          "hover:border-primary/50 transition-colors",
          isOpen && "ring-2 ring-ring ring-offset-2"
        )}
        onClick={() => setIsOpen(!isOpen)}
      >
        <MapPin size={16} className="text-muted-foreground shrink-0" />
        <span className={cn("flex-1 text-sm", !value && "text-muted-foreground")}>
          {value || 'Sélectionnez une ville'}
        </span>
      </div>

      {isOpen && (
        <div className="absolute z-50 mt-1 w-full rounded-md border bg-popover shadow-lg">
          {/* Search input */}
          <div className="p-2 border-b">
            <div className="relative">
              <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="Rechercher une ville..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-9 h-9"
                autoFocus
              />
            </div>
          </div>

          {/* City list with scroll */}
          <ScrollArea className="h-60">
            <div className="p-1">
              {filteredCities.length > 0 ? (
                filteredCities.map((city) => (
                  <div
                    key={city}
                    className={cn(
                      "flex items-center gap-2 px-3 py-2 text-sm rounded-md cursor-pointer",
                      "hover:bg-accent transition-colors",
                      value === city && "bg-primary/10 text-primary font-medium"
                    )}
                    onClick={() => handleSelect(city)}
                  >
                    {value === city && <Check size={16} className="text-primary shrink-0" />}
                    <span className={cn(value !== city && "ml-6")}>{city}</span>
                  </div>
                ))
              ) : (
                <div className="px-3 py-4 text-center text-sm text-muted-foreground">
                  Aucune ville trouvée
                </div>
              )}
            </div>
          </ScrollArea>

          {/* City count */}
          <div className="px-3 py-2 border-t text-xs text-muted-foreground">
            {filteredCities.length} ville{filteredCities.length > 1 ? 's' : ''} trouvée{filteredCities.length > 1 ? 's' : ''}
          </div>
        </div>
      )}

      {/* Backdrop to close dropdown */}
      {isOpen && (
        <div
          className="fixed inset-0 z-40"
          onClick={() => {
            setIsOpen(false);
            setSearchTerm('');
          }}
        />
      )}
    </div>
  );
};

export default CitySelector;
