import React, { useState } from 'react';
import ProviderCard from './ProviderCard';
import HouseholdTypeSelector, { HouseholdType } from './HouseholdTypeSelector';
import { useProducts } from '@/hooks/useProducts';
import { Slider } from '@/components/ui/slider';

const ProviderList = () => {
  const { data: productsResponse, isLoading, error } = useProducts();
  const [annualConsumption, setAnnualConsumption] = useState([4000]);
  const [selectedHouseholdType, setSelectedHouseholdType] = useState<string | null>('small-house');

  console.log('ProviderList render - isLoading:', isLoading);
  console.log('ProviderList render - error:', error);
  console.log('ProviderList render - productsResponse:', productsResponse);
  console.log('ProviderList render - annualConsumption:', annualConsumption[0]);

  const handleHouseholdTypeSelect = (type: HouseholdType | null) => {
    if (type) {
      setAnnualConsumption([type.kWh]);
      setSelectedHouseholdType(type.id);
    } else {
      // Custom/manual selection - "Indtast selv" was clicked
      setSelectedHouseholdType('custom');
      // Keep current slider value or set to default if needed
      if (annualConsumption[0] === 0) {
        setAnnualConsumption([4000]);
      }
    }
  };

  const handleSliderChange = (value: number[]) => {
    setAnnualConsumption(value);
    // If user manually adjusts slider, switch to custom mode
    setSelectedHouseholdType('custom');
  };

  if (isLoading) {
    return (
      <section className="py-16 bg-gray-50">
        <div className="container mx-auto px-4">
          <div className="mb-12">
            <h1 className="text-4xl font-bold text-center mb-4 text-brand-dark">Sammenlign eludbydere</h1>
            <p className="text-center text-gray-600 text-lg mb-8">
              Find den bedste elpris for dig baseret på dit forbrug
            </p>
          </div>
          <div className="flex justify-center">
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-8">
              <div className="text-center text-brand-dark">Indlæser elpriser...</div>
            </div>
          </div>
        </div>
      </section>
    );
  }

  if (error) {
    console.error('Error loading products:', error);
    return (
      <section className="py-16 bg-gray-50">
        <div className="container mx-auto px-4">
          <div className="mb-12">
            <h1 className="text-4xl font-bold text-center mb-4 text-brand-dark">Sammenlign eludbydere</h1>
            <p className="text-center text-gray-600 text-lg mb-8">
              Find den bedste elpris for dig baseret på dit forbrug
            </p>
          </div>
          <div className="flex justify-center">
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-8">
              <div className="text-center text-red-500">
                Der opstod en fejl ved indlæsning af elpriser.
                <br />
                <small className="text-gray-500">Fejl: {error?.message || 'Ukendt fejl'}</small>
              </div>
            </div>
          </div>
        </div>
      </section>
    );
  }

  const products = productsResponse?.products || [];

  if (products.length === 0) {
    return (
      <section className="py-16 bg-gray-50">
        <div className="container mx-auto px-4">
          <div className="mb-12">
            <h1 className="text-4xl font-bold text-center mb-4 text-brand-dark">Sammenlign eludbydere</h1>
            <p className="text-center text-gray-600 text-lg mb-8">
              Find den bedste elpris for dig baseret på dit forbrug
            </p>
          </div>
          <div className="flex justify-center">
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-8">
              <div className="text-center text-brand-dark">Ingen produkter tilgængelige i øjeblikket.</div>
            </div>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="py-16 bg-gray-50">
      <div className="container mx-auto px-4">
        <div className="mb-12">
          <h1 className="text-4xl font-bold text-center mb-4 text-brand-dark">Sammenlign eludbydere</h1>
          <p className="text-center text-gray-600 text-lg mb-8">
            Find den bedste elpris for dig baseret på dit forbrug
          </p>
        </div>
        
        {/* Household Type Selector */}
        <div className="mb-8 bg-white rounded-xl shadow-sm border border-gray-100 p-8">
          <HouseholdTypeSelector
            selectedType={selectedHouseholdType}
            onTypeSelect={handleHouseholdTypeSelect}
            currentConsumption={annualConsumption[0]}
          />
        </div>
        
        {/* Consumption Slider */}
        <div className="mb-12 bg-white rounded-xl shadow-sm border border-gray-100 p-8">
          <div className="max-w-lg mx-auto">
            <h2 className="text-lg font-semibold text-brand-dark mb-6 text-center">
              Præcis årligt forbrug
            </h2>
            <label className="block text-sm font-medium text-brand-dark mb-4 text-center">
              Forventet årligt kWh-forbrug: <span className="font-bold text-brand-green">{annualConsumption[0].toLocaleString()} kWh</span>
            </label>
            <Slider
              value={annualConsumption}
              onValueChange={handleSliderChange}
              min={500}
              max={10000}
              step={100}
              className="w-full mb-4"
            />
            <div className="flex justify-between text-xs text-gray-500">
              <span>500 kWh</span>
              <span>10.000 kWh</span>
            </div>
          </div>
        </div>
        
        {/* Products List */}
        <div className="space-y-6">
          <h2 className="text-2xl font-bold text-center text-brand-dark mb-8">Aktuelle tilbud</h2>
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
