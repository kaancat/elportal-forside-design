import React, { useState } from 'react';
import ProviderCard from './ProviderCard';
import HouseholdTypeSelector, { HouseholdType } from './HouseholdTypeSelector';
import { Slider } from '@/components/ui/slider';
import type { ProviderListBlock, ProviderProductBlock } from '../types/sanity';

interface ProviderListProps {
  block: ProviderListBlock;
}

export const ProviderList: React.FC<ProviderListProps> = ({ block }) => {
  // --- SAFETY CHECK ---
  if (!block) {
    console.error('ProviderList: block prop is undefined');
    return <div className="text-center text-red-500 py-8">Provider list data is missing.</div>;
  }
  // --- END OF SAFETY CHECK ---

  const [annualConsumption, setAnnualConsumption] = useState([4000]);
  const [selectedHouseholdType, setSelectedHouseholdType] = useState<string | null>('small-house');

  console.log('ProviderList render - block:', block);
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

  // Sort products to ensure the featured one is first
  const sortedProviders = [...(block.providers || [])].sort((a, b) => {
    if (a.isVindstoedProduct && !b.isVindstoedProduct) return -1;
    if (!a.isVindstoedProduct && b.isVindstoedProduct) return 1;
    // Add other sorting logic if needed, e.g., by price
    return (a.displayPrice_kWh || 0) - (b.displayPrice_kWh || 0);
  });

  // Convert ProviderProductBlock to ElectricityProduct format for ProviderCard
  const convertToElectricityProduct = (provider: ProviderProductBlock) => ({
    id: provider.id,
    supplierName: provider.providerName,
    productName: provider.productName,
    isVindstoedProduct: provider.isVindstoedProduct,
    displayPrice_kWh: provider.displayPrice_kWh,
    displayMonthlyFee: provider.displayMonthlyFee,
    signupLink: provider.signupLink,
    supplierLogoURL: provider.logoUrl,
    // Map benefits to existing boolean properties
    isVariablePrice: provider.benefits?.find(b => b.text.toLowerCase().includes('variabel'))?.included || true,
    hasNoBinding: provider.benefits?.find(b => b.text.toLowerCase().includes('binding'))?.included || true,
    hasFreeSignup: provider.benefits?.find(b => b.text.toLowerCase().includes('gratis'))?.included || true,
    internalNotes: '',
    lastUpdated: new Date().toISOString(),
    sortOrderVindstoed: provider.isVindstoedProduct ? 1 : undefined,
    sortOrderCompetitor: provider.isVindstoedProduct ? undefined : 1,
  });

  if (!block.providers || block.providers.length === 0) {
    return (
      <section className="py-16 bg-gray-50">
        <div className="container mx-auto px-4">
          <div className="mb-12">
            <h1 className="text-4xl font-bold text-center mb-4 text-brand-dark">
              {block.title || 'Sammenlign eludbydere'}
            </h1>
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
          <h1 className="text-4xl font-bold text-center mb-4 text-brand-dark">
            {block.title || 'Sammenlign eludbydere'}
          </h1>
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
          {sortedProviders.map(provider => {
            console.log('Rendering provider:', provider);
            if (!provider || !provider.id) {
              console.warn('Invalid provider data:', provider);
              return null;
            }
            return (
              <ProviderCard 
                key={provider.id} 
                product={convertToElectricityProduct(provider)}
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
