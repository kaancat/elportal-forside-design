import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import ProviderCard from './ProviderCard';
import HouseholdTypeSelector, { HouseholdType } from './HouseholdTypeSelector';
import { LocationSelector } from './LocationSelector';
import { useLocation } from '@/hooks/useLocation';
import { Slider } from '@/components/ui/slider';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { Info, MapPin } from 'lucide-react';
import type { ProviderListBlock } from '../types/sanity';
import { useScrollAnimation, staggerContainer, animationClasses } from '@/hooks/useScrollAnimation';
import { ElectricityProduct } from '@/types/product';

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
  
  // Location hook for postal code based pricing
  const { location, loading: locationLoading, updateLocation } = useLocation();
  
  // Use providers from block.providers (from Sanity page)
  const providers = block.providers || [];

  // Fetch live spot price when component mounts or location changes
  useEffect(() => {
    const fetchSpotPrice = async () => {
      try {
        // Use region from location if available
        const region = location?.region || 'DK2';
        const response = await fetch(`/api/electricity-prices?region=${region}`);
        
        if (!response.ok) throw new Error('Could not fetch spot price');
        const data = await response.json();
        
        // Find the price for the current hour
        const currentHour = new Date().getHours();
        const currentPriceData = data.records.find((r: any) => new Date(r.HourDK).getHours() === currentHour);
        
        if (currentPriceData) {
          setSpotPrice(currentPriceData.SpotPriceKWh);
          setLastUpdated(new Date());
        }
      } catch (error) {
        console.error("Failed to fetch live spot price:", error);
        // Fallback to a default value
        setSpotPrice(1.5);
      } finally {
        setPriceLoading(false);
      }
    };

    fetchSpotPrice();
  }, [location?.region]); // Re-fetch when region changes

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

  const handleLocationChange = (newLocation: any) => {
    updateLocation(newLocation);
  };

  // Get sorted providers based on current spot price and network tariff
  const networkTariff = location?.gridProvider?.networkTariff || 0.30;
  
  // Sort providers with Vindstød first, then by calculated price
  const sortedProviders = [...providers].sort((a, b) => {
    // Vindstød always first
    if (a.isVindstoedProduct && !b.isVindstoedProduct) return -1;
    if (!a.isVindstoedProduct && b.isVindstoedProduct) return 1;
    
    // Sort by total monthly cost (simplified for now)
    const aMonthly = a.monthlySubscription || a.displayMonthlyFee || 0;
    const bMonthly = b.monthlySubscription || b.displayMonthlyFee || 0;
    return aMonthly - bMonthly;
  });
  
  console.log('Sorted providers:', sortedProviders.map(p => ({
    name: p.providerName,
    product: p.productName,
    isVindstoed: p.isVindstoedProduct,
    monthly: p.monthlySubscription
  })));

  // Convert Sanity provider to ElectricityProduct format for ProviderCard
  const convertToElectricityProduct = (provider: any): ElectricityProduct => ({
    id: provider.id || provider._id,
    supplierName: provider.providerName,
    productName: provider.productName,
    isVindstoedProduct: provider.isVindstoedProduct || false,
    // Use new detailed pricing or fall back to legacy fields
    displayPrice_kWh: provider.spotPriceMarkup !== undefined 
      ? provider.spotPriceMarkup / 100  // Convert øre to kr
      : (provider.displayPrice_kWh || 0),
    displayMonthlyFee: provider.monthlySubscription !== undefined 
      ? provider.monthlySubscription 
      : (provider.displayMonthlyFee || 0),
    signupLink: provider.signupLink,
    supplierLogoURL: provider.logoUrl,
    isVariablePrice: provider.isVariablePrice !== undefined ? provider.isVariablePrice : true,
    hasNoBinding: provider.bindingPeriod === 0 || provider.bindingPeriod === undefined,
    hasFreeSignup: provider.signupFee === 0 || provider.signupFee === undefined,
    internalNotes: provider.notes || '',
    lastUpdated: provider.lastPriceUpdate || new Date().toISOString(),
    sortOrderVindstoed: provider.isVindstoedProduct ? 1 : undefined,
    sortOrderCompetitor: provider.isVindstoedProduct ? undefined : 1,
    // Store additional fees for price calculation
    greenCertificateFee: provider.greenCertificateFee,
    tradingCosts: provider.tradingCosts,
  } as ElectricityProduct & { greenCertificateFee?: number; tradingCosts?: number });

  const headerAlignmentClass = block.headerAlignment === 'left' ? 'text-left' : block.headerAlignment === 'right' ? 'text-right' : 'text-center';

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
        
        {/* Location Selector - NEW */}
        <div className="mb-8">
          <LocationSelector 
            onLocationChange={handleLocationChange}
            className=""
          />
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
          <h2 className="text-2xl font-display font-bold text-center text-brand-dark mb-4">
            Aktuelle tilbud
            {(priceLoading || locationLoading) && (
              <span className="text-sm text-gray-500 ml-2">(Henter priser...)</span>
            )}
          </h2>

          {/* Location and Price Info */}
          <div className="flex flex-col items-center gap-2 mb-8">
            {location && (
              <div className="flex items-center gap-2 text-sm text-gray-600">
                <MapPin className="h-4 w-4" />
                <span>
                  Priser for {location.municipality.name} ({location.region}) 
                  - Netselskab: {location.gridProvider.name}
                </span>
              </div>
            )}
            
            {/* Last Updated Timestamp with Tooltip */}
            {lastUpdated && (
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <p className="text-sm text-gray-500 cursor-pointer flex items-center gap-1">
                      Spotpris opdateret: {lastUpdated.toLocaleTimeString('da-DK', { hour: '2-digit', minute: '2-digit', hour12: false })}
                      <Info size={14} />
                    </p>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>De viste priser er estimater baseret på live spotpriser, <br /> som opdateres hver time.</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            )}
          </div>

          {/* Provider Cards */}
          {sortedProviders.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-gray-500">Ingen leverandører tilgængelige</p>
            </div>
          ) : (
            sortedProviders.map(provider => {
              const product = convertToElectricityProduct(provider);
              return (
                <ProviderCard 
                  key={product.id} 
                  product={product}
                  annualConsumption={annualConsumption[0]}
                  spotPrice={spotPrice}
                  networkTariff={networkTariff}
                  additionalFees={{
                    greenCertificates: provider.greenCertificateFee,
                    tradingCosts: provider.tradingCosts
                  }}
                />
              );
            })
          )}
        </motion.div>
      </div>
    </section>
  );
};

export default ProviderList;