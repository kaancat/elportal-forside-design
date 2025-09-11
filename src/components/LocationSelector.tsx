'use client'

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
import { DawaAutocompleteService, DawaAutocompleteResult } from '@/services/dawaAutocompleteService';
import { AddressAutocomplete } from './AddressAutocomplete';
import { useNetworkTariff } from '@/hooks/useNetworkTariff';
import type { LocationData } from '@/types/location';
import type { GridProvider } from '@/data/gridProviders';

interface LocationSelectorProps {
  onLocationChange: (location: LocationData) => void;
  className?: string;
}

export const LocationSelector: React.FC<LocationSelectorProps> = ({ 
  onLocationChange, 
  className = '' 
}) => {
  // Feature flag: hide nettarif line in UI (kept in code for future use)
  const SHOW_TARIFF_LINE = false;
  const [inputValue, setInputValue] = useState<string>('');
  const [location, setLocation] = useState<LocationData | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [multipleProviders, setMultipleProviders] = useState<GridProvider[]>([]);
  const [selectedProvider, setSelectedProvider] = useState<GridProvider | null>(null);
  const [useAutocomplete, setUseAutocomplete] = useState(true);
  
  // Fetch dynamic network tariff from API
  const { averageRate, isFallback } = useNetworkTariff(
    location?.gridProvider || null,
    { enabled: !!location?.gridProvider }
  );

  // Handle address selection from autocomplete
  const handleAddressSelect = async (addressResult: DawaAutocompleteResult) => {
    // Don't process street name suggestions without addresses
    if (addressResult.type === 'vejnavn') {
      setError('Vælg venligst en specifik adresse med husnummer');
      return;
    }
    
    setLoading(true);
    setError(null);
    setMultipleProviders([]);

    try {
      // Extract postal code and create full address
      const postalCode = DawaAutocompleteService.extractPostalCode(addressResult);
      const fullAddress = DawaAutocompleteService.extractFullAddress(addressResult);
      
      // Validate we have a postal code
      if (!postalCode) {
        setError('Kunne ikke finde postnummer for denne adresse');
        setLoading(false);
        return;
      }
      
      // Get location data using the full address
      const locationData = await GridProviderService.getLocationByQuery(fullAddress);
      
      if (!locationData) {
        setError('Kunne ikke finde netselskab for denne adresse');
        setLoading(false);
        return;
      }

      // Check if municipality has multiple grid providers
      if (postalCode) {
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
      console.error('Error processing address selection:', err);
      setError('Der opstod en fejl. Prøv igen senere.');
    } finally {
      setLoading(false);
    }
  };

  // Manual lookup for postal codes (when not using autocomplete)
  const handleManualLookup = async () => {
    // Only process 4-digit postal codes
    if (!/^\d{4}$/.test(inputValue)) {
      return;
    }

    setLoading(true);
    setError(null);
    setMultipleProviders([]);

    try {
      // Validate postal code
      if (!PostalCodeService.isValidPostalCode(inputValue)) {
        setError('Ugyldigt postnummer');
        setLoading(false);
        return;
      }

      // Get location data using postal code
      const locationData = await GridProviderService.getLocationByQuery(inputValue);
      
      if (!locationData) {
        setError('Kunne ikke finde område for dette postnummer');
        setLoading(false);
        return;
      }

      // Check if municipality has multiple grid providers
      const municipality = PostalCodeService.getMunicipalityByPostalCode(inputValue);
      if (municipality) {
        const providers = await GridProviderService.getGridProvidersForMunicipality(municipality.name);
        
        if (providers.length > 1) {
          setMultipleProviders(providers);
          setSelectedProvider(providers[0]);
          locationData.gridProvider = providers[0];
        }
      }

      setLocation(locationData);
      onLocationChange(locationData);
    } catch (err) {
      console.error('Error looking up postal code:', err);
      setError('Der opstod en fejl. Prøv igen senere.');
    } finally {
      setLoading(false);
    }
  };

  // Debounced manual lookup for postal codes
  useEffect(() => {
    if (!useAutocomplete && inputValue.length === 4 && /^\d{4}$/.test(inputValue)) {
      const timer = setTimeout(() => {
        handleManualLookup();
      }, 500);
      return () => clearTimeout(timer);
    }
  }, [inputValue, useAutocomplete]);

  const handleInputChange = (value: string) => {
    setInputValue(value);
    if (!value) {
      setLocation(null);
      setError(null);
    }
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
          <TooltipProvider delayDuration={200}>
            <Tooltip>
              <TooltipTrigger asChild>
                <button type="button" className="p-0.5 hover:bg-gray-100 rounded transition-colors">
                  <Info className="h-4 w-4 text-gray-400" />
                </button>
              </TooltipTrigger>
              <TooltipContent sideOffset={5}>
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
          <div className="mt-1">
            {useAutocomplete ? (
              <AddressAutocomplete
                value={inputValue}
                onChange={handleInputChange}
                onAddressSelect={handleAddressSelect}
                placeholder="F.eks. Birkevej 7 eller 2200"
                disabled={loading}
              />
            ) : (
              <div className="relative">
                <Input
                  id="location-input"
                  type="text"
                  value={inputValue}
                  onChange={(e) => handleInputChange(e.target.value)}
                  placeholder="F.eks. 2100"
                  className="pr-10"
                  maxLength={4}
                />
                {loading && (
                  <Loader2 className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 animate-spin text-gray-400" />
                )}
              </div>
            )}
          </div>
          
          {/* Toggle between autocomplete and manual input */}
          <button
            type="button"
            onClick={() => {
              setUseAutocomplete(!useAutocomplete);
              setInputValue('');
              setLocation(null);
              setError(null);
            }}
            className="mt-2 text-xs text-blue-600 hover:text-blue-700 underline"
          >
            {useAutocomplete ? 'Indtast kun postnummer' : 'Brug adressesøgning'}
          </button>

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

            {/* Network Tariff (hidden in simplified mode) */}
            {SHOW_TARIFF_LINE && (
              <div className="flex justify-between items-center text-sm">
                <span className="text-gray-600 flex items-center gap-1">
                  Nettarif:
                  <TooltipProvider delayDuration={200}>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <button type="button" className="p-0.5 hover:bg-gray-100 rounded transition-colors">
                          <Info className="h-3 w-3 text-gray-400" />
                        </button>
                      </TooltipTrigger>
                      <TooltipContent sideOffset={5}>
                        <p className="max-w-xs">
                          Nettariffen er den afgift dit netselskab opkræver for at transportere strøm til din bolig.
                        </p>
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                </span>
                <span className="font-medium text-brand-dark">
                  {(averageRate || location.gridProvider.networkTariff).toFixed(2)} kr/kWh
                  {!isFallback && averageRate && (
                    <span className="text-xs text-green-600 ml-1">✓</span>
                  )}
                </span>
              </div>
            )}
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
