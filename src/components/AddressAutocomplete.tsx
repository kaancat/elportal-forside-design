'use client'

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { ChevronDown, MapPin, Loader2 } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils';
import { DawaAutocompleteService, DawaAutocompleteResult } from '@/services/dawaAutocompleteService';

interface AddressAutocompleteProps {
  value: string;
  onChange: (value: string) => void;
  onAddressSelect: (address: DawaAutocompleteResult) => void;
  placeholder?: string;
  className?: string;
  disabled?: boolean;
  postalCodeFilter?: string;
}

export const AddressAutocomplete: React.FC<AddressAutocompleteProps> = ({
  value,
  onChange,
  onAddressSelect,
  placeholder = "Indtast adresse eller postnummer",
  className = '',
  disabled = false,
  postalCodeFilter,
}) => {
  const [suggestions, setSuggestions] = useState<DawaAutocompleteResult[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [showDropdown, setShowDropdown] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(-1);
  const [searchQuery, setSearchQuery] = useState('');
  
  const inputRef = useRef<HTMLInputElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const debounceTimerRef = useRef<NodeJS.Timeout>();

  // Fetch suggestions with debounce
  const fetchSuggestions = useCallback(async (query: string) => {
    if (query.length < 2) {
      setSuggestions([]);
      setShowDropdown(false);
      return;
    }

    setIsLoading(true);
    
    try {
      const results = await DawaAutocompleteService.search(query, {
        fuzzy: true,
        limit: 15,
        postnr: postalCodeFilter,
      });
      
      setSuggestions(results);
      setShowDropdown(results.length > 0);
      setSelectedIndex(-1);
    } catch (error) {
      console.error('Error fetching suggestions:', error);
      setSuggestions([]);
      setShowDropdown(false);
    } finally {
      setIsLoading(false);
    }
  }, [postalCodeFilter]);

  // Debounced search
  useEffect(() => {
    // Clear previous timer
    if (debounceTimerRef.current) {
      clearTimeout(debounceTimerRef.current);
    }

    // Don't search if value is same as search query (user selected from dropdown)
    if (value === searchQuery) {
      return;
    }

    // Set new timer
    debounceTimerRef.current = setTimeout(() => {
      fetchSuggestions(value);
    }, 300);

    return () => {
      if (debounceTimerRef.current) {
        clearTimeout(debounceTimerRef.current);
      }
    };
  }, [value, fetchSuggestions, searchQuery]);

  // Handle input change
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value;
    onChange(newValue);
    setSearchQuery(''); // Reset search query when user types
  };

  // Handle suggestion selection
  const handleSelectSuggestion = (suggestion: DawaAutocompleteResult) => {
    const fullAddress = DawaAutocompleteService.extractFullAddress(suggestion);
    setSearchQuery(fullAddress); // Store what we searched for
    onChange(fullAddress);
    onAddressSelect(suggestion);
    setShowDropdown(false);
    setSelectedIndex(-1);
  };

  // Keyboard navigation
  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (!showDropdown || suggestions.length === 0) return;

    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault();
        setSelectedIndex(prev => 
          prev < suggestions.length - 1 ? prev + 1 : 0
        );
        break;
      
      case 'ArrowUp':
        e.preventDefault();
        setSelectedIndex(prev => 
          prev > 0 ? prev - 1 : suggestions.length - 1
        );
        break;
      
      case 'Enter':
        e.preventDefault();
        if (selectedIndex >= 0 && selectedIndex < suggestions.length) {
          handleSelectSuggestion(suggestions[selectedIndex]);
        }
        break;
      
      case 'Escape':
        setShowDropdown(false);
        setSelectedIndex(-1);
        break;
    }
  };

  // Click outside to close dropdown
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node) &&
        inputRef.current &&
        !inputRef.current.contains(event.target as Node)
      ) {
        setShowDropdown(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Format suggestion for display
  const formatSuggestion = (suggestion: DawaAutocompleteResult) => {
    const { data, type } = suggestion;
    
    // Handle street name suggestions (vejnavn type)
    if (type === 'vejnavn') {
      const vejnavnData = data as any; // Type assertion for vejnavn data
      return {
        street: vejnavnData.navn || suggestion.forslagstekst || '',
        city: null,
        supplement: null,
        door: null
      };
    }
    
    // Handle address suggestions (adgangsadresse/adresse type)
    const addressData = data as any; // Type assertion for address data
    
    // Build street address with house number
    let street = addressData.vejnavn && addressData.husnr 
      ? `${addressData.vejnavn} ${addressData.husnr}` 
      : addressData.vejnavn || suggestion.forslagstekst || '';
    
    // Format door/apartment information (e.g., "1.th", "st.tv")
    let door: string | null = null;
    if (addressData.etage || addressData.dør) {
      door = [addressData.etage, addressData.dør].filter(Boolean).join('.');
    }
    
    const city = addressData.postnr && addressData.postnrnavn
      ? `${addressData.postnr} ${addressData.postnrnavn}`
      : null;
    
    return { 
      street: street || suggestion.forslagstekst || '', 
      city, 
      supplement: addressData.supplerendebynavn,
      door
    };
  };

  return (
    <div className={cn("relative", className)}>
      <div className="relative">
        <Input
          ref={inputRef}
          type="text"
          value={value}
          onChange={handleInputChange}
          onKeyDown={handleKeyDown}
          onFocus={() => suggestions.length > 0 && setShowDropdown(true)}
          placeholder={placeholder}
          disabled={disabled}
          className="pr-10"
        />
        <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none">
          {isLoading ? (
            <Loader2 className="h-4 w-4 animate-spin text-gray-400" />
          ) : showDropdown ? (
            <ChevronDown className="h-4 w-4 text-gray-400" />
          ) : (
            <MapPin className="h-4 w-4 text-gray-400" />
          )}
        </div>
      </div>

      {/* Dropdown */}
      {showDropdown && suggestions.length > 0 && (
        <div
          ref={dropdownRef}
          className="absolute z-50 w-full mt-1 bg-white rounded-lg shadow-lg border border-gray-200 max-h-80 overflow-auto"
        >
          {suggestions.map((suggestion, index) => {
            const { street, city, supplement, door } = formatSuggestion(suggestion);
            const isSelected = index === selectedIndex;
            const isStreetOnly = suggestion.type === 'vejnavn';
            
            return (
              <button
                key={(suggestion.data as any).id || `${suggestion.type}-${index}`}
                type="button"
                className={cn(
                  "w-full px-4 py-3 text-left hover:bg-gray-50 transition-colors border-b border-gray-100 last:border-b-0",
                  isSelected && "bg-blue-50 hover:bg-blue-50",
                  isStreetOnly && "opacity-75"
                )}
                onClick={() => handleSelectSuggestion(suggestion)}
                onMouseEnter={() => setSelectedIndex(index)}
              >
                <div className="flex items-start gap-3">
                  <MapPin className="h-4 w-4 text-gray-400 mt-0.5 flex-shrink-0" />
                  <div className="flex-1 min-w-0">
                    <div className="font-medium text-gray-900">
                      <span className="truncate">{street || suggestion.forslagstekst}</span>
                      {door && (
                        <span className="ml-1 font-semibold text-brand-green">, {door}</span>
                      )}
                      {isStreetOnly && (
                        <span className="ml-2 text-xs font-normal text-gray-500">
                          (Fortsæt med at skrive for at se adresser)
                        </span>
                      )}
                    </div>
                    {(city || supplement) && (
                      <div className="text-sm text-gray-500">
                        {supplement && <span>{supplement}, </span>}
                        {city}
                      </div>
                    )}
                  </div>
                </div>
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default AddressAutocomplete;