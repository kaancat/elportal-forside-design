import React, { useState, useEffect, useCallback } from 'react';
import { MapPin, Info, Loader2, AlertCircle } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { GridProviderService } from '@/services/gridProviderService';
import { PostalCodeService } from '@/services/postalCodeService';
import type { LocationData, GridProvider } from '@/types/location';

interface LocationSelectorProps {
  onLocationChange: (location: LocationData) => void;
  className?: string;
}

export const LocationSelector: React.FC<LocationSelectorProps> = ({ 
  onLocationChange, 
  className = '' 
}) => {
  const [inputValue, setInputValue] = useState<string>('');
  const [inputMode, setInputMode] = useState<'postal' | 'address'>('postal');
  const [location, setLocation] = useState<LocationData | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [multipleProviders, setMultipleProviders] = useState<GridProvider[]>([]);
  const [selectedProvider, setSelectedProvider] = useState<GridProvider | null>(null);

  // Detect input mode based on user input
  useEffect(() => {
    if (inputValue.length > 4 || inputValue.includes(',') || inputValue.includes(' ')) {
      setInputMode('address');
    } else if (/^\d{0,4}$/.test(inputValue)) {
      setInputMode('postal');
    }
  }, [inputValue]);

  // Debounced lookup
  useEffect(() => {
    const timer = setTimeout(() => {
      if (inputMode === 'postal' && inputValue.length === 4) {
        handleLookup();
      } else if (inputMode === 'address' && inputValue.length > 5) {
        handleLookup();
      } else if (inputValue.length > 0 && inputMode === 'postal' && inputValue.length !== 4) {
        setError('Postnummer skal være 4 cifre');
        setLocation(null);
      } else {
        setError(null);
        setLocation(null);
      }
    }, 800); // Slightly longer delay for address mode

    return () => clearTimeout(timer);
  }, [inputValue, inputMode]);

  const handleLookup = async () => {
    setLoading(true);
    setError(null);
    setMultipleProviders([]);

    try {
      // For postal code mode, validate first
      if (inputMode === 'postal' && !PostalCodeService.isValidPostalCode(inputValue)) {
        setError('Ugyldigt postnummer');
        setLoading(false);
        return;
      }

      // Get location data using the new method that supports both postal codes and addresses
      const locationData = await GridProviderService.getLocationByQuery(inputValue);
      
      if (!locationData) {
        setError(inputMode === 'address' 
          ? 'Kunne ikke finde netselskab for denne adresse' 
          : 'Kunne ikke finde område for dette postnummer');
        setLoading(false);
        return;
      }

      // Extract postal code for municipality check
      const postalCodeMatch = inputValue.match(/\b(\d{4})\b/);
      const postalCode = postalCodeMatch ? postalCodeMatch[1] : inputValue;

      // Check if municipality has multiple grid providers (only for postal code mode)
      if (inputMode === 'postal') {
        const municipality = PostalCodeService.getMunicipalityByPostalCode(postalCode);
        if (municipality) {
          const providers = await GridProviderService.getGridProvidersForMunicipality(municipality.name);
          
          if (providers.length > 1) {
            setMultipleProviders(providers);
            setSelectedProvider(providers[0]);
            locationData.gridProvider = providers[0];
          }
        }
      }

      setLocation(locationData);
      onLocationChange(locationData);
    } catch (err) {
      console.error('Error looking up location:', err);
      setError('Der opstod en fejl. Prøv igen senere.');
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setInputValue(value);
  };

  const handleProviderChange = (providerCode: string) => {
    const provider = multipleProviders.find(p => p.code === providerCode);
    if (provider && location) {
      setSelectedProvider(provider);
      const updatedLocation = { ...location, gridProvider: provider };
      setLocation(updatedLocation);
      onLocationChange(updatedLocation);
    }
  };

  const getRegionDisplay = (region: 'DK1' | 'DK2') => {
    return region === 'DK1' ? 'Vestdanmark' : 'Østdanmark';
  };

  return (
    <div className={`bg-white rounded-xl shadow-sm border border-gray-100 p-6 ${className}`}>
      <div className="space-y-4">
        {/* Header */}
        <div className="flex items-center gap-2 mb-4">
          <MapPin className="h-5 w-5 text-brand-green" />
          <h3 className="text-lg font-display font-semibold text-brand-dark">
            Din placering
          </h3>
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger>
                <Info className="h-4 w-4 text-gray-400" />
              </TooltipTrigger>
              <TooltipContent>
                <p className="max-w-xs">
                  Dit postnummer bestemmer dit netselskab og prisområde (DK1/DK2), 
                  hvilket påvirker din elpris.
                </p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </div>

        {/* Location Input */}
        <div>
          <Label htmlFor="location-input" className="text-sm font-medium text-gray-700">
            Adresse eller postnummer
          </Label>
          <div className="relative mt-1">
            <Input
              id="location-input"
              type="text"
              value={inputValue}
              onChange={handleInputChange}
              placeholder={inputMode === 'address' 
                ? "F.eks. Nørrebrogade 1, 2200 København N" 
                : "F.eks. 2100"}
              className="pr-10"
            />
            {loading && (
              <Loader2 className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 animate-spin text-gray-400" />
            )}
          </div>
          {inputMode === 'address' && inputValue.length > 0 && inputValue.length < 6 && (
            <p className="mt-1 text-xs text-gray-500">
              Indtast fuld adresse for præcis netselskab
            </p>
          )}
          {error && (
            <p className="mt-1 text-sm text-red-600 flex items-center gap-1">
              <AlertCircle className="h-3 w-3" />
              {error}
            </p>
          )}
        </div>

        {/* Location Details */}
        {location && !loading && (
          <div className="space-y-3 pt-3 border-t border-gray-100">
            {/* Municipality */}
            <div className="flex justify-between items-center text-sm">
              <span className="text-gray-600">Kommune:</span>
              <span className="font-medium text-brand-dark">{location.municipality.name}</span>
            </div>

            {/* Grid Provider - with selector if multiple */}
            <div className="flex justify-between items-center text-sm">
              <span className="text-gray-600">Netselskab:</span>
              {multipleProviders.length > 1 ? (
                <Select
                  value={selectedProvider?.code}
                  onValueChange={handleProviderChange}
                >
                  <SelectTrigger className="w-[200px] h-8 text-sm">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {multipleProviders.map(provider => (
                      <SelectItem key={provider.code} value={provider.code}>
                        {provider.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              ) : (
                <span className="font-medium text-brand-dark">
                  {location.gridProvider.name}
                </span>
              )}
            </div>

            {/* Region */}
            <div className="flex justify-between items-center text-sm">
              <span className="text-gray-600">Prisområde:</span>
              <span className="font-medium text-brand-dark">
                {getRegionDisplay(location.region)} ({location.region})
              </span>
            </div>

            {/* Network Tariff */}
            <div className="flex justify-between items-center text-sm">
              <span className="text-gray-600 flex items-center gap-1">
                Nettarif:
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger>
                      <Info className="h-3 w-3 text-gray-400" />
                    </TooltipTrigger>
                    <TooltipContent>
                      <p className="max-w-xs">
                        Nettariffen er den afgift dit netselskab opkræver for at 
                        transportere strøm til din bolig.
                      </p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              </span>
              <span className="font-medium text-brand-dark">
                {location.gridProvider.networkTariff.toFixed(2)} kr/kWh
              </span>
            </div>
          </div>
        )}

        {/* Default location hint */}
        {!location && !loading && !error && inputValue.length === 0 && (
          <p className="text-xs text-gray-500 italic">
            Indtast din adresse eller postnummer for at se priser for dit område
          </p>
        )}
      </div>
    </div>
  );
};

export default LocationSelector;