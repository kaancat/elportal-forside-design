'use client'

import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { motion } from 'framer-motion';
import ProviderCard from './ProviderCard';
import HouseholdTypeSelector, { HouseholdType } from './HouseholdTypeSelector';
import { LocationSelector } from './LocationSelector';
import { RegionToggle } from './RegionToggle';
import { useLocation } from '@/hooks/useLocation';
import { useNetworkTariff } from '@/hooks/useNetworkTariff';
import { Slider } from '@/components/ui/slider';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { Info, MapPin, Calculator } from 'lucide-react';
import type { ProviderListBlock } from '../types/sanity';
import { staggerContainer } from '@/hooks/useScrollAnimation';
import { ElectricityProduct } from '@/types/product';
import { calculatePricePerKwh, calculateMonthlyCost } from '@/services/priceCalculationService';
import { FloatingConsumptionHelper } from './FloatingConsumptionHelper';

interface ProviderListProps {
  block: ProviderListBlock;
}

const ProviderListComponent: React.FC<ProviderListProps> = ({ block }) => {
  
  // --- SAFETY CHECK ---
  if (!block) {
    console.error('ProviderList: block prop is undefined');
    return <div className="text-center text-red-500 py-8">Provider list data is missing.</div>;
  }
  // --- END OF SAFETY CHECK ---

  const [annualConsumption, setAnnualConsumption] = useState([4000]);
  const [isMounted, setIsMounted] = useState(false);
  useEffect(() => {
    setIsMounted(true);
  }, []);
  const [selectedHouseholdType, setSelectedHouseholdType] = useState<string | null>('small-house');
  const [spotPrice, setSpotPrice] = useState<number | null>(null);
  const [priceLoading, setPriceLoading] = useState(true);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);
  
  // Region toggle state
  const [selectedRegion, setSelectedRegion] = useState<'DK1' | 'DK2'>('DK2');
  const [isManualRegionOverride, setIsManualRegionOverride] = useState(false);
  
  // Location hook for postal code based pricing
  const { location, loading: locationLoading, updateLocation } = useLocation();
  
  // Get dynamic network tariff from API
  const { averageRate: dynamicNetworkTariff, isFallback } = useNetworkTariff(
    location?.gridProvider || null,
    { enabled: !!location?.gridProvider }
  );
  
  // Use providers from block.providers (from Sanity page)
  // Normalize and filter out invalid/inactive entries to avoid render crashes from bad references
  const providers = (block.providers || [])
    .filter(Boolean)
    .filter((p: any) => p.isActive !== false) // only include active or undefined
    .map((p: any) => ({
      // ensure minimal shape for downstream usage
      id: p.id || p._id || `${p.providerName || 'unknown'}-${p.productName || 'product'}`,
      ...p,
    }));
  
  // Debug logging only in development and gated by verbose flag
  if (process.env.NODE_ENV === 'development' && process.env.NEXT_PUBLIC_DEBUG_VERBOSE === 'true') {
    console.log('ProviderList block:', block);
    console.log('Providers from block (sanitized):', providers);
  }

  // Update selectedRegion when location changes (if not manually overridden)
  useEffect(() => {
    if (location?.region && !isManualRegionOverride) {
      setSelectedRegion(location.region);
    }
  }, [location?.region, isManualRegionOverride]);

  // Fetch live spot price when component mounts or region changes
  useEffect(() => {
    const fetchSpotPrice = async () => {
      try {
        // Use manual region if overridden, otherwise use location region
        const region = isManualRegionOverride ? selectedRegion : (location?.region || selectedRegion);
        const today = new Date();
        const dateStr = today.toISOString().split('T')[0];
        const response = await fetch(`/api/electricity-prices?region=${region}&date=${dateStr}`);
        if (!response.ok) throw new Error('Could not fetch spot price');
        let data = await response.json();
        let records: any[] = Array.isArray(data.records) ? data.records : [];
        if (records.length === 0) {
          const prev = new Date(today);
          prev.setDate(today.getDate() - 1);
          const prevStr = prev.toISOString().split('T')[0];
          const prevResp = await fetch(`/api/electricity-prices?region=${region}&date=${prevStr}`);
          if (prevResp.ok) {
            const prevJson = await prevResp.json();
            records = Array.isArray(prevJson.records) ? prevJson.records : [];
          }
        }
        const currentHour = new Date().getHours();
        const currentPriceData = records.find((r: any) => new Date(r.HourDK).getHours() === currentHour) || records[records.length - 1];
        if (currentPriceData && typeof currentPriceData.SpotPriceKWh === 'number') {
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
  }, [selectedRegion, location?.region, isManualRegionOverride]); // Re-fetch when region changes

  const handleHouseholdTypeSelect = useCallback((type: HouseholdType | null) => {
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
  }, [annualConsumption]);

  const handleSliderChange = useCallback((value: number[]) => {
    setAnnualConsumption(value);
    // If user manually adjusts slider, switch to custom mode
    setSelectedHouseholdType('custom');
  }, []);

  const handleLocationChange = useCallback((newLocation: any) => {
    updateLocation(newLocation);
    // When user enters postal code, turn off manual override
    if (newLocation) {
      setIsManualRegionOverride(false);
    }
  }, [updateLocation]);

  const handleRegionChange = useCallback((region: 'DK1' | 'DK2') => {
    setSelectedRegion(region);
    setIsManualRegionOverride(true);
  }, []);

  // Get network tariff - use dynamic API data if available, otherwise location-based or regional average
  const getNetworkTariff = () => {
    // Use dynamic tariff from API if available (when location is set)
    if (dynamicNetworkTariff && !isManualRegionOverride) {
      return dynamicNetworkTariff;
    }
    // Fall back to static tariff from location if available
    if (location?.gridProvider?.networkTariff && !isManualRegionOverride) {
      return location.gridProvider.networkTariff;
    }
    // Use regional averages when manually selected or no location
    // These are now more accurate based on API data analysis
    return selectedRegion === 'DK1' ? 0.25 : 0.28; // Updated based on actual API averages
  };
  const networkTariff = getNetworkTariff();
  
  // Memoize expensive sorting logic to prevent re-computation on every render
  const sortedProviders = useMemo(() => {
    return [...providers].sort((a, b) => {
      // Vindstød always first
      if (a.isVindstoedProduct && !b.isVindstoedProduct) return -1;
      if (!a.isVindstoedProduct && b.isVindstoedProduct) return 1;
      
      // If both are Vindstød or both are not, sort by calculated total price
      // Calculate the actual price per kWh for each provider
      const baseSpotPrice = spotPrice !== null ? spotPrice : 1.5;
      
      // Get spot price markup for each provider (considering regional pricing)
      let aSpotPriceMarkup = a.spotPriceMarkup;
      let aMonthlySubscription = a.monthlySubscription;
      let bSpotPriceMarkup = b.spotPriceMarkup;
      let bMonthlySubscription = b.monthlySubscription;
      
      if (isManualRegionOverride) {
        if (a.regionalPricing?.length > 0) {
          const aRegional = a.regionalPricing.find((rp: any) => rp.region === selectedRegion);
          if (aRegional) {
            if (aRegional.spotPriceMarkup !== undefined) aSpotPriceMarkup = aRegional.spotPriceMarkup;
            if (aRegional.monthlySubscription !== undefined) aMonthlySubscription = aRegional.monthlySubscription;
          }
        }
        if (b.regionalPricing?.length > 0) {
          const bRegional = b.regionalPricing.find((rp: any) => rp.region === selectedRegion);
          if (bRegional) {
            if (bRegional.spotPriceMarkup !== undefined) bSpotPriceMarkup = bRegional.spotPriceMarkup;
            if (bRegional.monthlySubscription !== undefined) bMonthlySubscription = bRegional.monthlySubscription;
          }
        }
      }
      
      // Calculate total monthly cost for each provider
      // Using the priceCalculationService logic
      const aPricePerKwh = calculatePricePerKwh(
        baseSpotPrice,
        aSpotPriceMarkup || 0,
        networkTariff,
        {
          greenCertificates: a.greenCertificateFee,
          tradingCosts: a.tradingCosts
        }
      );
      const bPricePerKwh = calculatePricePerKwh(
        baseSpotPrice,
        bSpotPriceMarkup || 0,
        networkTariff,
        {
          greenCertificates: b.greenCertificateFee,
          tradingCosts: b.tradingCosts
        }
      );
      
      const aMonthlyTotal = calculateMonthlyCost(
        annualConsumption[0],
        aPricePerKwh,
        aMonthlySubscription || 0
      );
      const bMonthlyTotal = calculateMonthlyCost(
        annualConsumption[0],
        bPricePerKwh,
        bMonthlySubscription || 0
      );
      
      // Sort by total monthly cost (lower first)
      return aMonthlyTotal - bMonthlyTotal;
    });
  }, [providers, spotPrice, annualConsumption, selectedRegion, isManualRegionOverride, networkTariff]);

  // JSON-LD now rendered server-side for reliability
  
  // Debug logging only in development and gated by verbose flag
  if (process.env.NODE_ENV === 'development' && process.env.NEXT_PUBLIC_DEBUG_VERBOSE === 'true') {
    console.log('Sorted providers:', sortedProviders.map(p => ({
      name: p.providerName,
      product: p.productName,
      isVindstoed: p.isVindstoedProduct,
      monthly: p.monthlySubscription
    })));
  }

  // Memoize the expensive conversion function
  const convertToElectricityProduct = useCallback((provider: any): ElectricityProduct => {
    // Check for regional pricing if manual override is active
    let spotPriceMarkup = provider.spotPriceMarkup;
    let monthlySubscription = provider.monthlySubscription;
    
    if (isManualRegionOverride && provider.regionalPricing?.length > 0) {
      const regionalPrice = provider.regionalPricing.find((rp: any) => rp.region === selectedRegion);
      if (regionalPrice) {
        // Use regional specific pricing if available
        if (regionalPrice.spotPriceMarkup !== undefined) {
          spotPriceMarkup = regionalPrice.spotPriceMarkup;
        }
        if (regionalPrice.monthlySubscription !== undefined) {
          monthlySubscription = regionalPrice.monthlySubscription;
        }
      }
    }
    
    return {
      id: provider.id || provider._id,
      supplierName: provider.providerName,
      productName: provider.productName,
      isVindstoedProduct: provider.isVindstoedProduct || false,
      // Keep spotPriceMarkup in øre for consistent handling in priceCalculationService
      displayPrice_kWh: spotPriceMarkup !== undefined 
        ? spotPriceMarkup  // Keep in øre/kWh - will be converted in priceCalculationService
        : (provider.displayPrice_kWh || 0),
      displayMonthlyFee: monthlySubscription !== undefined 
        ? monthlySubscription 
        : (provider.displayMonthlyFee || 0),
      signupLink: provider.signupLink,
      supplierLogoURL: provider.logoUrl,
      isVariablePrice: provider.isVariablePrice !== undefined ? provider.isVariablePrice : true,
      hasNoBinding: provider.bindingPeriod === 0 || provider.bindingPeriod === undefined,
      hasFreeSignup: provider.signupFee === 0 || provider.signupFee === undefined,
      isGreenEnergy: provider.isGreenEnergy || provider.isVindstoedProduct || false,
      signupFee: provider.signupFee || 0,
      internalNotes: provider.notes || '',
      lastUpdated: provider.lastPriceUpdate || new Date().toISOString(),
      sortOrderVindstoed: provider.isVindstoedProduct ? 1 : undefined,
      sortOrderCompetitor: provider.isVindstoedProduct ? undefined : 1,
      // Store additional fees for price calculation
      greenCertificateFee: provider.greenCertificateFee,
      tradingCosts: provider.tradingCosts,
    } as ElectricityProduct & { greenCertificateFee?: number; tradingCosts?: number };
  }, [isManualRegionOverride, selectedRegion]);

  const headerAlignmentClass = block.headerAlignment === 'left' ? 'text-left' : block.headerAlignment === 'right' ? 'text-right' : 'text-center';

  // Expose provider list metadata to other components (e.g., hero calculator)
  useEffect(() => {
    try {
      const count = providers.length;
      const event = new CustomEvent('elportal:providerListReady', {
        detail: { id: 'provider-list', count }
      } as any);
      window.dispatchEvent(event);
    } catch (e) {
      // noop
    }
  }, [providers.length]);

  // Handle calculator submission from hero: set kWh and scroll into view
  useEffect(() => {
    const handler = (e: Event) => {
      const anyEvent = e as CustomEvent<{ kWh?: number; source?: string }>;
      const kWh = anyEvent?.detail?.kWh;
      if (typeof kWh === 'number' && !Number.isNaN(kWh)) {
        setAnnualConsumption([kWh]);
        setSelectedHouseholdType('custom');
        // Scroll to this section and focus for accessibility
        const section = document.getElementById('provider-list');
        if (section) {
          const prefersReduced = typeof window !== 'undefined' &&
            window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
          try {
            section.scrollIntoView({ behavior: prefersReduced ? 'auto' : 'smooth', block: 'start' });
          } catch {
            // Fallback scroll
            window.scrollTo({ top: section.getBoundingClientRect().top + window.scrollY - 16, behavior: prefersReduced ? 'auto' : 'smooth' });
          }
          // Attempt to move focus for screen readers / keyboard users
          try { (section as HTMLElement).focus?.(); } catch {}
        }
      }
    };
    window.addEventListener('elportal:calculatorSubmit', handler as EventListener);
    return () => window.removeEventListener('elportal:calculatorSubmit', handler as EventListener);
  }, []);

  return (
    <section id="provider-list" tabIndex={-1} className="py-16 bg-gray-50">
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
        
        {/* Region Toggle - NEW */}
        <div className="mb-8">
          <RegionToggle
            selectedRegion={selectedRegion}
            onRegionChange={handleRegionChange}
            isManualOverride={isManualRegionOverride}
            hasLocation={!!location}
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
        
        {/* Consumption Slider (client-only to avoid SSR hydration diffs from Radix internals) */}
        <div className="mb-12 bg-white rounded-xl shadow-sm border border-gray-100 p-8">
          <div className="max-w-lg mx-auto">
            <h2 className="text-lg font-display font-semibold text-brand-dark mb-6 text-center">
              Præcis årligt forbrug
            </h2>
            <label className="block text-sm font-medium text-brand-dark mb-4 text-center">
              Forventet årligt kWh-forbrug: <span className="font-bold text-brand-green relative inline-block">{annualConsumption[0].toLocaleString('da-DK')} kWh<FloatingConsumptionHelper variant="neon" /></span>
            </label>
            {isMounted ? (
              <>
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
              </>
            ) : (
              <div className="w-full h-3 md:h-2 rounded-full bg-gray-100 animate-pulse" />
            )}
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
          <h2 className="text-2xl font-display font-bold text-center text-brand-dark mb-6">
            Aktuelle tilbud
            {(priceLoading || locationLoading) && (
              <span className="text-sm text-gray-500 ml-2">(Henter priser...)</span>
            )}
          </h2>

          {/* Location and Price Info */}
          <div className="flex flex-col items-center justify-center gap-3 mb-8 px-4">
            {(location && !isManualRegionOverride) ? (
              <div className="flex flex-col sm:flex-row items-center gap-1 sm:gap-2 text-sm text-gray-600 text-center sm:text-left">
                <div className="flex items-center gap-2">
                  <MapPin className="h-4 w-4 flex-shrink-0" />
                  <span>Priser for {location.municipality.name} ({location.region})</span>
                </div>
                <span className="hidden sm:inline">-</span>
                <span>Netselskab: {location.gridProvider.name}</span>
              </div>
            ) : isManualRegionOverride ? (
              <div className="flex flex-col sm:flex-row items-center gap-1 sm:gap-2 text-sm text-gray-600 text-center sm:text-left">
                <div className="flex items-center gap-2">
                  <MapPin className="h-4 w-4 flex-shrink-0" />
                  <span>Priser for {selectedRegion === 'DK1' ? 'Vestdanmark' : 'Østdanmark'} ({selectedRegion})</span>
                </div>
                <span className="hidden sm:inline">-</span>
                <span className="flex items-center gap-1">
                  Gennemsnitlig nettarif: {networkTariff.toFixed(2)} kr/kWh
                  {!isFallback && dynamicNetworkTariff && (
                    <span className="text-xs text-green-600 ml-1">✓ Live data</span>
                  )}
                </span>
              </div>
            ) : null}
            
            {/* Price Calculation Info */}
            <TooltipProvider delayDuration={200}>
              <Tooltip>
                <TooltipTrigger asChild>
                  <button 
                    type="button"
                    className="flex items-center gap-2 px-3 py-1.5 bg-brand-green/10 text-brand-dark border border-brand-green/20 rounded-full text-sm font-medium cursor-pointer hover:bg-brand-green/20 active:bg-brand-green/30 transition-colors"
                  >
                    <Calculator className="h-4 w-4" />
                    <span>Sådan beregner vi priserne</span>
                  </button>
                </TooltipTrigger>
                <TooltipContent className="max-w-sm" sideOffset={5}>
                  <div className="space-y-2">
                    <p className="font-semibold">Vores prisberegning inkluderer:</p>
                    <ul className="text-sm space-y-1">
                      <li>• <strong>Live spotpriser</strong> opdateret hver time fra Nord Pool</li>
                      <li>• <strong>Nettarif</strong> som gennemsnit over døgnet (faktiske timepriser varierer)</li>
                      <li>• <strong>Leverandørens tillæg</strong> fra deres aktuelle prislister</li>
                      <li>• <strong>Afgifter og moms</strong> (elafgift, systemtarif, transmission + 25% moms)</li>
                    </ul>
                    <p className="text-sm mt-3 font-semibold text-brand-green">
                      OBS: Priserne vises uden midlertidige rabatter
                    </p>
                    <p className="text-sm mt-1 text-gray-600">
                      Introrabatter, "første 12 måneder gratis" og lignende kampagnetilbud 
                      er ikke inkluderet, da disse ikke afspejler den reelle langsigtede pris.
                    </p>
                    <p className="text-sm mt-2 text-gray-600">
                      Vi stræber efter at vise de mest præcise og aktuelle priser, 
                      så du kan træffe det bedste valg.
                    </p>
                  </div>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
            
            {/* Last Updated Timestamp with Tooltip */}
            {lastUpdated && (
              <TooltipProvider delayDuration={200}>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <button
                      type="button"
                      className="text-sm text-gray-500 cursor-pointer flex items-center justify-center gap-1 hover:text-gray-700 transition-colors"
                    >
                      Spotpris opdateret: {lastUpdated.toLocaleTimeString('da-DK', { hour: '2-digit', minute: '2-digit', hour12: false })}
                      <Info size={14} />
                    </button>
                  </TooltipTrigger>
                  <TooltipContent sideOffset={5}>
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
            sortedProviders.map((provider, index) => {
              const product = convertToElectricityProduct(provider);
              return (
                <ProviderCard 
                  key={String(product.id)} 
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

// Wrap with React.memo to prevent unnecessary re-renders
export const ProviderList = React.memo(ProviderListComponent);

export default ProviderList;
