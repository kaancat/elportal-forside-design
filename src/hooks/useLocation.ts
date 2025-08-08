import { useState, useEffect } from 'react';
import { PostalCodeService } from '@/services/postalCodeService';
import { GridProviderService } from '@/services/gridProviderService';
import type { LocationData } from '@/types/location';

const STORAGE_KEY = 'elportal_user_location';

export function useLocation() {
  const [location, setLocation] = useState<LocationData | null>(null);
  const [loading, setLoading] = useState(true);

  // Load saved location on mount
  useEffect(() => {
    const loadSavedLocation = async () => {
      try {
        // Check localStorage for saved location
        const saved = localStorage.getItem(STORAGE_KEY);
        if (saved) {
          const savedData = JSON.parse(saved);
          // Verify it's still valid
          const locationData = await GridProviderService.getLocationByPostalCode(savedData.postalCode);
          if (locationData) {
            setLocation(locationData);
          } else {
            // Use default if saved location is invalid
            setLocation(PostalCodeService.getDefaultLocation());
          }
        } else {
          // Use default location (Copenhagen)
          setLocation(PostalCodeService.getDefaultLocation());
        }
      } catch (error) {
        console.error('Error loading saved location:', error);
        setLocation(PostalCodeService.getDefaultLocation());
      } finally {
        setLoading(false);
      }
    };

    loadSavedLocation();
  }, []);

  // Save location when it changes
  const updateLocation = (newLocation: LocationData) => {
    setLocation(newLocation);
    localStorage.setItem(STORAGE_KEY, JSON.stringify({
      postalCode: newLocation.postalCode,
      timestamp: Date.now()
    }));
  };

  // Clear saved location
  const clearLocation = () => {
    localStorage.removeItem(STORAGE_KEY);
    setLocation(PostalCodeService.getDefaultLocation());
  };

  return {
    location,
    loading,
    updateLocation,
    clearLocation
  };
}