import React, { useState } from 'react';
import ProviderCard from './ProviderCard';
import HouseholdTypeSelector, { HouseholdType } from './HouseholdTypeSelector';
import { useProducts } from '@/hooks/useProducts';
import { Slider } from '@/components/ui/slider';

const ProviderList = () => {
  const { data: productsResponse, isLoading, error } = useProducts();
  const [annualConsumption, setAnnualConsumption] = useState([4000]);
  const [selectedHouseholdType, setSelectedHouseholdType] = useState<string | null>('small-house'); // Default to small house (4000 kWh)

  console.log('ProviderList render - isLoading:', isLoading);
  console.log('ProviderList render - error:', error);
  console.log('ProviderList render - productsResponse:', productsResponse);
  console.log('ProviderList render - annualConsumption:', annualConsumption[0]);

  const handleHouseholdTypeSelect = (type: HouseholdType | null) => {
    if (type) {
      setAnnualConsumption([type.kWh]);
      setSelectedHouseholdType(type.id);
    } else {
      // Custom/manual selection
      setSelectedHouseholdType(null);
    }
  };

  const handleSliderChange = (value: number[]) => {
    setAnnualConsumption(value);
    // If user manually adjusts slider, deselect any preset type
    setSelectedHouseholdType(null);
  };

  if (isLoading) {
    return (
      <section className="py-12 bg-gray-50">
        <div className="container mx-auto px-4">
          <div className="mb-8">
            <h2 className="text-3xl font-bold text-center mb-2">Sammenlign eludbydere</h2>
            <p className="text-center text-gray-600 mb-8">
              Find den bedste elpris for dig baseret på dit forbrug
            </p>
          </div>
          <div className="space-y-4">
            <div className="text-center">Indlæser elpriser...</div>
          </div>
        </div>
      </section>
    );
  }

  if (error) {
    console.error('Error loading products:', error);
    return (
      <section className="py-12 bg-gray-50">
        <div className="container mx-auto px-4">
          <div className="mb-8">
            <h2 className="text-3xl font-bold text-center mb-2">Sammenlign eludbydere</h2>
            <p className="text-center text-gray-600 mb-8">
              Find den bedste elpris for dig baseret på dit forbrug
            </p>
          </div>
          <div className="space-y-4">
            <div className="text-center text-red-500">
              Der opstod en fejl ved indlæsning af elpriser.
              <br />
              <small>Fejl: {error?.message || 'Ukendt fejl'}</small>
            </div>
          </div>
        </div>
      </section>
    );
  }

  const products = productsResponse?.products || [];
  console.log('Products to render:', products);

  if (products.length === 0) {
    return (
      <section className="py-12 bg-gray-50">
        <div className="container mx-auto px-4">
          <div className="mb-8">
            <h2 className="text-3xl font-bold text-center mb-2">Sammenlign eludbydere</h2>
            <p className="text-center text-gray-600 mb-8">
              Find den bedste elpris for dig baseret på dit forbrug
            </p>
          </div>
          <div className="space-y-4">
            <div className="text-center">Ingen produkter tilgængelige i øjeblikket.</div>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="py-12 bg-gray-50">
      <div className="container mx-auto px-4">
        <div className="mb-8">
          <h2 className="text-3xl font-bold text-center mb-2">Sammenlign eludbydere</h2>
          <p className="text-center text-gray-600 mb-8">
            Find den bedste elpris for dig baseret på dit forbrug
          </p>
        </div>
        
        {/* Household Type Selector */}
        <div className="mb-8 bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          <HouseholdTypeSelector
            selectedType={selectedHouseholdType}
            onTypeSelect={handleHouseholdTypeSelect}
            currentConsumption={annualConsumption[0]}
          />
        </div>
        
        {/* Consumption Slider */}
        <div className="mb-8 bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          <div className="max-w-md mx-auto">
            <label className="block text-sm font-medium text-brand-dark mb-4">
              Forventet årligt kWh-forbrug: <span className="font-bold text-brand-green">{annualConsumption[0].toLocaleString()} kWh</span>
            </label>
            <Slider
              value={annualConsumption}
              onValueChange={handleSliderChange}
              min={500}
              max={10000}
              step={100}
              className="w-full"
            />
            <div className="flex justify-between text-xs text-gray-500 mt-2">
              <span>500 kWh</span>
              <span>10.000 kWh</span>
            </div>
          </div>
        </div>
        
        <div className="space-y-4">
          {products.map(product => {
            console.log('Rendering product:', product);
            if (!product || !product.id) {
              console.warn('Invalid product data:', product);
              return null;
            }
            return (
              <ProviderCard 
                key={product.id} 
                product={product}
                annualConsumption={annualConsumption[0]}
              />
            );
          })}
        </div>
      </div>
    </section>
  );
};

export default ProviderList;
