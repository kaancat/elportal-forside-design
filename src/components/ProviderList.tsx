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
      
      // Simplified mode: compare only subscription + markup (tillæg)
      // Get region-specific values when overridden
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

      const monthlyConsumption = annualConsumption[0] / 12;
      const aMarkupKr = (aSpotPriceMarkup || 0) / 100; // øre -> kr
      const bMarkupKr = (bSpotPriceMarkup || 0) / 100;
      const currentSpot = spotPrice !== null ? spotPrice : 1.5; // kr/kWh
      const aMonthlyTotal = (aMonthlySubscription || 0) + monthlyConsumption * (currentSpot + aMarkupKr);
      const bMonthlyTotal = (bMonthlySubscription || 0) + monthlyConsumption * (currentSpot + bMarkupKr);

      // Sort by simplified monthly total (lower first)
      return aMonthlyTotal - bMonthlyTotal;
    });
  }, [providers, annualConsumption, selectedRegion, isManualRegionOverride, spotPrice]);

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
    // Smooth scroll helper with controllable duration and easing
    const smoothScrollTo = (targetY: number, duration: number = 800) => {
      if (typeof window === 'undefined') return;
      // Respect reduced motion
      const prefersReduced = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
      if (prefersReduced || duration <= 0) {
        window.scrollTo({ top: Math.max(0, targetY) });
        return;
      }
      const startY = window.scrollY || window.pageYOffset;
      const distance = Math.max(0, targetY) - startY;
      const startTime = performance.now();
      const easeInOutCubic = (t: number) => t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;

      const step = (now: number) => {
        const elapsed = now - startTime;
        const progress = Math.min(1, elapsed / duration);
        const eased = easeInOutCubic(progress);
        window.scrollTo({ top: startY + distance * eased });
        if (progress < 1) requestAnimationFrame(step);
      };
      requestAnimationFrame(step);
    };

    const handler = (e: Event) => {
      const anyEvent = e as CustomEvent<{ kWh?: number; source?: string }>;
      const kWh = anyEvent?.detail?.kWh;
      if (typeof kWh === 'number' && !Number.isNaN(kWh)) {
        setAnnualConsumption([kWh]);
        setSelectedHouseholdType('custom');
        // Scroll to the first provider card (Vindstød) and center it in viewport
        const target = document.getElementById('first-provider-card') || document.getElementById('provider-list');
        if (target) {
          const rect = target.getBoundingClientRect();
          const targetY = rect.top + window.scrollY - (window.innerHeight / 2 - rect.height / 2);
          // Use custom, slightly slower easing for a pleasant motion
          smoothScrollTo(targetY, 900);
          // Focus after scroll completes
          setTimeout(() => { try { (target as HTMLElement).focus?.(); } catch {} }, 950);
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
                    <p className="text-sm">
                      Vi viser <strong>spotpris (live)</strong> + <strong>elselskabets tillæg</strong> (elpris.dk) + <strong>abonnement</strong>.
                      Obligatoriske ydelser (nettarif, afgifter, system/transmission, moms) er <strong>ikke</strong> inkluderet.
                    </p>
                    <p className="text-xs text-gray-500">Kilder: Nord Pool (spotpris) og elpris.dk (tillæg/abonnement)</p>
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
              // Simplified mode: derive region-adjusted markup and subscription
              let spotPriceMarkup = provider.spotPriceMarkup;
              let monthlySubscription = provider.monthlySubscription;
              if (isManualRegionOverride && provider.regionalPricing?.length > 0) {
                const regional = provider.regionalPricing.find((rp: any) => rp.region === selectedRegion);
                if (regional) {
                  if (regional.spotPriceMarkup !== undefined) spotPriceMarkup = regional.spotPriceMarkup;
                  if (regional.monthlySubscription !== undefined) monthlySubscription = regional.monthlySubscription;
                }
              }
              const markupKr = (spotPriceMarkup || 0) / 100;
              const isFirst = index === 0;
              return (
                <div 
                  key={String(product.id)} 
                  data-provider-card
                  id={isFirst ? 'first-provider-card' : undefined}
                  tabIndex={isFirst ? -1 : undefined}
                >
                  <ProviderCard 
                    product={product}
                    annualConsumption={annualConsumption[0]}
                    spotPrice={spotPrice}
                    networkTariff={networkTariff}
                    pricingMode={'simplified'}
                    priceSourceDate={(block as any)?.priceSourceDate}
                    providerMarkupKrOverride={markupKr}
                    monthlySubscriptionOverride={monthlySubscription || 0}
                    additionalFees={{
                      greenCertificates: provider.greenCertificateFee,
                      tradingCosts: provider.tradingCosts
                    }}
                  />
                </div>
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
