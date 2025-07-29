import React, { useState, useEffect } from 'react';
import ProviderCard from './ProviderCard';
import HouseholdTypeSelector, { HouseholdType } from './HouseholdTypeSelector';
import { Slider } from '@/components/ui/slider';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { Info } from 'lucide-react';
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
  const [spotPrice, setSpotPrice] = useState<number | null>(null);
  const [priceLoading, setPriceLoading] = useState(true);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);


  // Fetch live spot price when component mounts
  useEffect(() => {
    const fetchSpotPrice = async () => {
      try {
        const response = await fetch('/api/electricity-prices'); // Your existing API route
        if (!response.ok) throw new Error('Could not fetch spot price');
        const data = await response.json();
        // Find the price for the current hour
        const currentHour = new Date().getHours();
        const currentPriceData = data.records.find((r: any) => new Date(r.HourDK).getHours() === currentHour);
        if (currentPriceData) {
          setSpotPrice(currentPriceData.SpotPriceKWh);
          setLastUpdated(new Date()); // SET THE TIMESTAMP HERE
        }
      } catch (error) {
        console.error("Failed to fetch live spot price:", error);
        // We can set a fallback price or show an error
        setSpotPrice(1.5); // Fallback to a default value
      } finally {
        setPriceLoading(false);
      }
    };

    fetchSpotPrice();
  }, []);

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
    isVariablePrice: provider.benefits?.find(b => b.text?.toLowerCase().includes('variabel'))?.included || true,
    hasNoBinding: provider.benefits?.find(b => b.text?.toLowerCase().includes('binding'))?.included || true,
    hasFreeSignup: provider.benefits?.find(b => b.text?.toLowerCase().includes('gratis'))?.included || true,
    internalNotes: '',
    lastUpdated: new Date().toISOString(),
    sortOrderVindstoed: provider.isVindstoedProduct ? 1 : undefined,
    sortOrderCompetitor: provider.isVindstoedProduct ? undefined : 1,
  });

  const headerAlignmentClass = block.headerAlignment === 'left' ? 'text-left' : block.headerAlignment === 'right' ? 'text-right' : 'text-center';

  if (!block.providers || block.providers.length === 0) {
    return (
      <section className="py-16 bg-gray-50">
        <div className="container mx-auto px-4">
          <div className="mb-12">
            <h1 className={`text-4xl font-display font-bold ${headerAlignmentClass} mb-4 text-brand-dark`}>
              {block.title || 'Sammenlign eludbydere'}
            </h1>
            {block.subtitle && (
              <p className={`${headerAlignmentClass} text-gray-600 text-lg mb-8`}>
                {block.subtitle}
              </p>
            )}
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
          <h1 className={`text-4xl font-display font-bold ${headerAlignmentClass} mb-4 text-brand-dark`}>
            {block.title || 'Sammenlign eludbydere'}
          </h1>
          {block.subtitle && (
            <p className={`${headerAlignmentClass} text-gray-600 text-lg mb-8`}>
              {block.subtitle}
            </p>
          )}
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
            <h2 className="text-lg font-display font-semibold text-brand-dark mb-6 text-center">
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
        <motion.div 
          className="space-y-6"
          variants={staggerContainer}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-50px" }}
        >
          <h2 className="text-2xl font-display font-bold text-center text-brand-dark mb-8">
            Aktuelle tilbud
            {priceLoading && (
              <span className="text-sm text-gray-500 ml-2">(Henter live priser...)</span>
            )}
          </h2>
          
          {/* Last Updated Timestamp with Tooltip */}
          <div className="flex justify-center items-center gap-2 mb-8">
            {lastUpdated && (
                <Tooltip>
                  <TooltipTrigger asChild>
                    <p className="text-sm text-gray-500 cursor-pointer flex items-center gap-1">
                      Priser sidst opdateret: {lastUpdated.toLocaleTimeString('da-DK', { hour: '2-digit', minute: '2-digit', hour12: false })}
                      <Info size={14} />
                    </p>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>De viste priser er estimater baseret på live spotpriser, <br /> som opdateres hver time.</p>
                  </TooltipContent>
                </Tooltip>
            )}
          </div>
          {sortedProviders.map(provider => {
            if (!provider || !provider.id) {
              return null;
            }
            return (
              <ProviderCard 
                key={provider.id} 
                product={convertToElectricityProduct(provider)}
                annualConsumption={annualConsumption[0]}
                spotPrice={spotPrice}
              />
            );
          })}
        </motion.div>
      </div>
    </section>
  );
};

export default ProviderList;
