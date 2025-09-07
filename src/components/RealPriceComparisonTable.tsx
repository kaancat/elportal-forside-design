'use client'

import React, { useState, useMemo, useEffect } from 'react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Slider } from '@/components/ui/slider';
import { Label } from '@/components/ui/label';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Zap, TrendingDown, Check, X, Star, ExternalLink, Info, Leaf, Wind, Shield, Clock } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { RealPriceComparisonTable, ProviderProductBlock } from '../types/sanity';
import { PortableText } from '@portabletext/react';
import { useIsClient } from '@/hooks/useIsClient';
import { SanityService } from '../services/sanityService';
import { PRICE_CONSTANTS } from '@/services/priceCalculationService';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { TrackedLink } from '@/components/tracking/TrackedLink';
import { resolveProviderLogoUrl } from '@/lib/providerLogos';

// Format currency with proper rounding for display
const formatCurrency = (amount: number) => {
  // Round to 2 decimal places for display consistency
  const rounded = Math.round(amount * 100) / 100;
  return `${rounded.toFixed(2)} kr.`;
};

// Format monthly total with proper calculation
const formatMonthlyTotal = (perKwh: number, consumption: number, subscription: number) => {
  // Calculate with full precision then round final result
  const energyCost = perKwh * consumption;
  const totalMonthly = energyCost + subscription;
  const rounded = Math.round(totalMonthly * 100) / 100;
  return `${rounded.toFixed(2)} kr.`;
};

interface RealPriceComparisonTableProps {
  block: RealPriceComparisonTable;
}

// Theme helper functions
const getThemeClasses = (theme?: string) => {
  const themeType = theme || 'default';
  const themes = {
    default: 'bg-white',
    light: 'bg-gray-50',
    subtle: 'bg-green-50/60',
    dark: 'bg-brand-dark text-white',
    primary: 'bg-brand-green'
  };
  return themes[themeType as keyof typeof themes] || themes.default;
};

const isDarkTheme = (theme?: string) => {
  return theme === 'dark';
};

const getThemeTextColors = (theme?: string) => {
  const themeType = theme || 'default';
  
  switch (themeType) {
    case 'dark':
      return {
        heading: 'text-white',
        body: 'text-gray-100',
        muted: 'text-gray-300',
        strong: 'text-white',
        link: 'text-brand-green hover:text-brand-green-light',
        cardBg: 'bg-gray-800',
        cardBorder: 'border-gray-700',
        badgeBg: 'bg-brand-green text-brand-dark',
        selectBg: 'bg-gray-700 border-gray-600',
        tableBg: 'bg-gray-800',
        tableHeader: 'bg-gray-900',
        tableRow: 'bg-gray-800',
        tableRowHover: 'hover:bg-gray-700'
      };
    case 'primary':
      return {
        heading: 'text-brand-dark',
        body: 'text-brand-dark-light',
        muted: 'text-brand-dark/70',
        strong: 'text-brand-dark',
        link: 'text-white hover:text-gray-100',
        cardBg: 'bg-white/90',
        cardBorder: 'border-white/20',
        badgeBg: 'bg-brand-dark text-white',
        selectBg: 'bg-white border-brand-dark/20',
        tableBg: 'bg-white/90',
        tableHeader: 'bg-brand-dark text-white',
        tableRow: 'bg-white/80',
        tableRowHover: 'hover:bg-white/90'
      };
    case 'subtle':
      return {
        heading: 'text-brand-dark',
        body: 'text-neutral-700',
        muted: 'text-neutral-600',
        strong: 'text-brand-dark',
        link: 'text-brand-green-dark hover:text-brand-dark',
        cardBg: 'bg-white',
        cardBorder: 'border-gray-200',
        badgeBg: 'bg-brand-green text-white',
        selectBg: 'bg-white border-gray-300',
        tableBg: 'bg-white',
        tableHeader: 'bg-brand-green text-white',
        tableRow: 'bg-white',
        tableRowHover: 'hover:bg-gray-50'
      };
    case 'light':
    case 'default':
    default:
      return {
        heading: 'text-brand-dark',
        body: 'text-neutral-600',
        muted: 'text-gray-500',
        strong: 'text-brand-dark',
        link: 'text-brand-green hover:text-brand-green-dark',
        cardBg: 'bg-white',
        cardBorder: 'border-gray-200',
        badgeBg: 'bg-brand-green text-white',
        selectBg: 'bg-white border-gray-300',
        tableBg: 'bg-white',
        tableHeader: 'bg-brand-green text-white',
        tableRow: 'bg-white',
        tableRowHover: 'hover:bg-gray-50'
      };
  }
};

const getPaddingClasses = (padding?: string) => {
  const paddingType = padding || 'medium';
  const paddings = {
    none: 'py-0',
    small: 'py-8 md:py-12',
    medium: 'py-16 md:py-24',
    large: 'py-24 md:py-32',
  };
  return paddings[paddingType as keyof typeof paddings] || paddings.medium;
};

const RealPriceComparisonTable: React.FC<RealPriceComparisonTableProps> = ({ block }) => {
  const isClient = useIsClient();
  const [selectedProvider1, setSelectedProvider1] = useState<ProviderProductBlock | null>(null);
  const [selectedProvider2, setSelectedProvider2] = useState<ProviderProductBlock | null>(null);
  const [monthlyConsumption, setMonthlyConsumption] = useState(333); // Default ~4000 kWh/year
  const [allProviders, setAllProviders] = useState<ProviderProductBlock[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [currentSpotPrice, setCurrentSpotPrice] = useState<number>(1.5); // Default spot price

  const { title, leadingText, settings, description } = block;
  useEffect(() => {
    if (typeof window !== 'undefined') {
      // Lightweight runtime breadcrumb to help diagnose mounting issues in preview
      console.log('[RealPriceComparisonTable] mounted');
    }
  }, []);
  
  // Get theme colors based on settings
  const themeColors = getThemeTextColors(settings?.theme);
  const theme = settings?.theme || 'default';

  // Fetch current spot price
  useEffect(() => {
    if (!isClient) return;
    
    const fetchSpotPrice = async () => {
      try {
        const response = await fetch('/api/electricity-prices?region=DK2');
        if (response.ok) {
          const data = await response.json();
          const currentHour = new Date().getHours();
          const currentPriceData = data.records.find((r: any) => new Date(r.HourDK).getHours() === currentHour);
          if (currentPriceData) {
            setCurrentSpotPrice(currentPriceData.SpotPriceKWh);
            console.log('[RealPriceComparisonTable] spot price set', currentPriceData.SpotPriceKWh);
          }
        }
      } catch (error) {
        console.error('Error fetching spot price:', error);
      }
    };
    
    fetchSpotPrice();
  }, [isClient]);

  useEffect(() => {
    if (!isClient) return;
    
    const fetchProviders = async () => {
      try {
        const providers = await SanityService.getAllProviders();
        setAllProviders(providers);
        console.log('[RealPriceComparisonTable] providers loaded', providers.length);
        
        // Auto-select first two providers if available
        if (providers.length > 0) {
          // Try to find Vindstød first
          const vindstod = providers.find(p => p.isVindstoedProduct);
          const others = providers.filter(p => !p.isVindstoedProduct);
          
          if (vindstod) {
            setSelectedProvider1(vindstod);
            if (others.length > 0) {
              setSelectedProvider2(others[0]);
            }
          } else if (providers.length > 1) {
            setSelectedProvider1(providers[0]);
            setSelectedProvider2(providers[1]);
          }
        }
      } catch (error) {
        console.error('Error fetching providers:', error);
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchProviders();
  }, [isClient]);

  const handleSelect1 = (providerId: string) => {
    const provider = allProviders.find(p => p.id === providerId) || null;
    setSelectedProvider1(provider);
  };

  const handleSelect2 = (providerId: string) => {
    const provider = allProviders.find(p => p.id === providerId) || null;
    setSelectedProvider2(provider);
  };

  const getPriceDetails = (provider: ProviderProductBlock | null) => {
    if (!provider) {
      return { 
        spotPrice: 0,
        tillæg: 0, 
        greenCerts: 0,
        tradingCosts: 0,
        networkTariff: 0,
        systemTariff: 0,
        transmissionFee: 0,
        electricityTax: 0,
        subtotal: 0,
        vat: 0,
        totalPerKwh: 0,
        subscription: 0, 
        total: 0 
      };
    }
    
    // Use the correct field names from the provider data - maintain full precision
    const spotPrice = currentSpotPrice;
    const tillæg = provider.spotPriceMarkup !== undefined 
      ? provider.spotPriceMarkup / 100  // Convert from øre to kr
      : (provider.displayPrice_kWh || 0);
    const greenCerts = (provider.greenCertificateFee || 0) / 100;
    const tradingCosts = (provider.tradingCosts || 0) / 100;
    
    // Fixed fees - using exact values from PRICE_CONSTANTS
    const networkTariff = 0.30; // Average network tariff
    const systemTariff = PRICE_CONSTANTS.SYSTEM_TARIFF; // 0.19
    const transmissionFee = PRICE_CONSTANTS.TRANSMISSION_FEE; // 0.11
    const electricityTax = PRICE_CONSTANTS.ELECTRICITY_TAX; // 0.90
    
    // Calculate subtotal with full precision
    const subtotal = spotPrice + tillæg + greenCerts + tradingCosts + 
                    networkTariff + systemTariff + transmissionFee + electricityTax;
    
    // Calculate VAT on the precise subtotal
    const vat = subtotal * 0.25;
    
    // Total per kWh with full precision
    const totalPerKwh = subtotal + vat;
    
    // Get subscription fee
    const subscription = provider.monthlySubscription !== undefined
      ? provider.monthlySubscription
      : (provider.displayMonthlyFee || 0);
    
    // Calculate total monthly cost with full precision
    const total = (totalPerKwh * monthlyConsumption) + subscription;
    
    // Return all values with full precision - rounding will be done only for display
    return { 
      spotPrice,
      tillæg, 
      greenCerts,
      tradingCosts,
      networkTariff,
      systemTariff,
      transmissionFee,
      electricityTax,
      subtotal,
      vat,
      totalPerKwh,
      subscription, 
      total 
    };
  };

  const details1 = useMemo(() => getPriceDetails(selectedProvider1), [selectedProvider1, monthlyConsumption, currentSpotPrice]);
  const details2 = useMemo(() => getPriceDetails(selectedProvider2), [selectedProvider2, monthlyConsumption, currentSpotPrice]);
  
  const isCheaper1 = details1.total < details2.total && selectedProvider1 && selectedProvider2;
  const isCheaper2 = details2.total < details1.total && selectedProvider1 && selectedProvider2;

  if (isLoading) {
    return (
      <section className={cn(
        'relative z-10',
        getThemeClasses(settings?.theme),
        getPaddingClasses(settings?.padding)
      )}>
        <div className={cn("text-center", themeColors.body)}>Indlæser udbydere...</div>
      </section>
    );
  }
  
  if (!allProviders || allProviders.length === 0) {
    return (
      <section className={cn(
        'relative z-10',
        getThemeClasses(settings?.theme),
        getPaddingClasses(settings?.padding)
      )}>
        <div className={cn("text-center", themeColors.body)}>Konfigurer venligst udbydere i Sanity.</div>
      </section>
    );
  }

  // Provider grid selector component
  const ProviderGrid = ({ 
    selectedProviderId,
    onSelectProvider,
    label
  }: {
    selectedProviderId: string | null;
    onSelectProvider: (providerId: string) => void;
    label: string;
  }) => (
    <div className="mb-6">
      <Label className={cn("font-semibold text-sm mb-3 block", themeColors.strong)}>
        {label}
      </Label>
      <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 gap-2">
        {allProviders.map((provider) => (
          <button
            key={provider.id}
            onClick={() => onSelectProvider(provider.id)}
            className={cn(
              "p-2 sm:p-3 rounded-lg border-2 transition-all duration-200 hover:scale-105",
              "flex flex-col items-center justify-center min-h-[70px] sm:min-h-[80px]",
              selectedProviderId === provider.id
                ? "border-brand-green bg-brand-green/10 shadow-md ring-2 ring-brand-green/30"
                : isDarkTheme(theme)
                  ? "border-gray-600 bg-gray-700 hover:border-gray-500"
                  : "border-gray-200 bg-white hover:border-gray-300 hover:shadow-sm"
            )}
            title={`${provider.providerName} - ${provider.productName}`}
          >
            {provider.logoUrl ? (
              <img 
                src={provider.logoUrl} 
                alt={provider.providerName}
                className="w-full h-6 sm:h-8 object-contain"
              />
            ) : (
              <span className={cn("text-xs text-center line-clamp-2", themeColors.body)}>
                {provider.providerName}
              </span>
            )}
          </button>
        ))}
      </div>
      {selectedProviderId && (
        <div className="mt-2">
          {allProviders.find(p => p.id === selectedProviderId) && (
            <p className={cn("text-sm font-bold", themeColors.strong)}>
              {allProviders.find(p => p.id === selectedProviderId)?.providerName} - {allProviders.find(p => p.id === selectedProviderId)?.productName}
            </p>
          )}
        </div>
      )}
    </div>
  );

  // Enhanced comparison card for SaaS-style pricing
  const EnhancedComparisonCard = ({ 
    provider, 
    details, 
    isFirst, 
    isCheaper,
    onSelectProvider
  }: {
    provider: ProviderProductBlock | null;
    details: any;
    isFirst: boolean;
    isCheaper: boolean;
    onSelectProvider: (providerId: string) => void;
  }) => (
    <Card className={cn(
      "relative overflow-hidden transition-all duration-300",
      themeColors.cardBg,
      themeColors.cardBorder,
      isCheaper && "ring-2 ring-brand-green shadow-2xl scale-105 z-10"
    )}>
      {/* Popular/Cheapest Badge */}
      {isCheaper && (
        <div className="absolute top-0 left-0 right-0 bg-gradient-to-r from-brand-green to-green-600 text-white text-center py-2 font-bold text-sm">
          <div className="flex items-center justify-center gap-1">
            <Star className="h-4 w-4 fill-current" />
            BILLIGSTE VALG
            <Star className="h-4 w-4 fill-current" />
          </div>
        </div>
      )}
      
      <CardContent className={cn("p-6", isCheaper && "pt-12")}>
        {/* Provider name and logo display */}
        {provider && (
          <div className="mb-6 text-center">
            <img 
              src={resolveProviderLogoUrl(provider?.providerName, provider?.logoUrl)} 
              alt={provider?.providerName || 'Leverandør'}
              className="w-16 h-16 object-contain mx-auto mb-2"
              onError={(e) => { e.currentTarget.src = '/placeholder.svg' }}
            />
            <h3 className={cn("font-bold text-lg", themeColors.heading)}>
              {provider.providerName}
            </h3>
            <p className={cn("text-sm", themeColors.body)}>
              {provider.productName}
            </p>
          </div>
        )}

        {/* Features section */}
        {provider && (
          <div className="mb-6 space-y-2">
            <div className="flex items-center gap-2">
              {provider.isVariablePrice !== false ? (
                <Check className="h-5 w-5 text-brand-green" />
              ) : (
                <X className="h-5 w-5 text-red-500" />
              )}
              <span className={cn("text-sm", themeColors.body)}>Variabel pris</span>
            </div>
            
            <div className="flex items-center gap-2">
              {!provider.bindingPeriod || provider.bindingPeriod === 0 ? (
                <Check className="h-5 w-5 text-brand-green" />
              ) : (
                <X className="h-5 w-5 text-red-500" />
              )}
              <span className={cn("text-sm", themeColors.body)}>
                {!provider.bindingPeriod || provider.bindingPeriod === 0 
                  ? 'Ingen binding' 
                  : `${provider.bindingPeriod} mdr. binding`}
              </span>
            </div>
            
            <div className="flex items-center gap-2">
              {!provider.signupFee || provider.signupFee === 0 ? (
                <Check className="h-5 w-5 text-brand-green" />
              ) : (
                <X className="h-5 w-5 text-red-500" />
              )}
              <span className={cn("text-sm", themeColors.body)}>
                {!provider.signupFee || provider.signupFee === 0 
                  ? 'Gratis oprettelse' 
                  : `Oprettelse: ${provider.signupFee} kr`}
              </span>
            </div>
            
            <div className="flex items-center gap-2">
              {provider.isGreenEnergy ? (
                <Check className="h-5 w-5 text-brand-green" />
              ) : (
                <X className="h-5 w-5 text-red-500" />
              )}
              <span className={cn("text-sm", themeColors.body)}>100% grøn strøm</span>
            </div>
          </div>
        )}
        
        {/* Price display */}
        <div className={cn(
          "border-t pt-4",
          isDarkTheme(theme) ? "border-gray-700" : "border-gray-200"
        )}>
          <div className="space-y-2 mb-4">
            <div className="flex justify-between text-sm">
              <span className={themeColors.muted}>Pris pr. kWh</span>
              <span className={themeColors.body}>{formatCurrency(details.totalPerKwh)}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className={themeColors.muted}>Abonnement</span>
              <span className={themeColors.body}>{formatCurrency(details.subscription)}</span>
            </div>
          </div>
          
          <div className={cn(
            "pt-4 border-t",
            isDarkTheme(theme) ? "border-gray-700" : "border-gray-200"
          )}>
            <p className={cn("text-xs mb-2", themeColors.muted)}>
              Total pr. måned ({monthlyConsumption} kWh)
            </p>
            <p className={cn(
              "text-3xl font-bold",
              isCheaper && !isDarkTheme(theme) ? "text-brand-green" : themeColors.heading
            )}>
              {formatMonthlyTotal(details.totalPerKwh, monthlyConsumption, details.subscription)}
            </p>
          </div>
        </div>

        {/* CTA Button with Tracking */}
        {provider && provider.signupLink ? (
          <TrackedLink
            href={provider.signupLink}
            partner={provider.providerName || 'unknown'}
            component="price_comparison_table"
            variant={isCheaper ? 'cheapest' : 'comparison'}
            consumption={monthlyConsumption * 12} // Convert to annual
            estimatedValue={parseFloat(formatMonthlyTotal(details.totalPerKwh, monthlyConsumption, details.subscription).replace(' kr.', ''))}
            className="block mt-6"
          >
            <Button 
              className={cn(
                "w-full",
                isCheaper 
                  ? "bg-brand-green hover:bg-brand-green-dark text-white font-bold py-3" 
                  : "bg-gray-100 hover:bg-gray-200 text-gray-700"
              )}
            >
              {isCheaper ? 'Skift nu og spar!' : 'Se mere'}
              <ExternalLink className="ml-2 h-4 w-4" />
            </Button>
          </TrackedLink>
        ) : provider ? (
          <Button 
            disabled
            className="w-full mt-6 bg-gray-300 text-gray-500 cursor-not-allowed"
          >
            Link ikke tilgængelig
          </Button>
        ) : null}
      </CardContent>
    </Card>
  );

  return (
    <section className={cn(
      'relative z-10',
      getThemeClasses(settings?.theme),
      getPaddingClasses(settings?.padding)
    )}>
      <div className="container mx-auto px-4 lg:px-8 max-w-7xl">
        {title && (
          <h2 className={cn(
            "text-3xl lg:text-4xl font-bold text-center mb-4 font-display",
            themeColors.heading
          )}>
            {title}
          </h2>
        )}
        {Array.isArray(description) && description.length > 0 ? (
          <div className={cn(
            "prose prose-lg max-w-3xl mx-auto text-center mb-12",
            themeColors.body,
            isDarkTheme(theme) && 'prose-invert'
          )}>
            <PortableText value={description} />
          </div>
        ) : leadingText ? (
          <p className={cn(
            "text-lg text-center mb-12 max-w-3xl mx-auto",
            themeColors.body
          )}>
            {leadingText}
          </p>
        ) : null}

        {/* Consumption slider */}
        <Card className={cn("mb-8 shadow-lg", themeColors.cardBg, themeColors.cardBorder)}>
          <CardContent className="p-6">
            <div className="flex items-center gap-3 mb-4">
              <div className={cn(
                "p-2 rounded-lg",
                isDarkTheme(theme) ? "bg-brand-green/20" : "bg-brand-green/10"
              )}>
                <Zap className={cn("h-5 w-5", isDarkTheme(theme) ? "text-brand-green" : "text-brand-green")} />
              </div>
              <Label htmlFor="consumption-slider" className={cn("font-semibold text-lg", themeColors.heading)}>
                Dit månedlige forbrug
              </Label>
            </div>
            <div className="space-y-4">
              <Slider
                id="consumption-slider"
                min={50} 
                max={850} 
                step={10}
                value={[monthlyConsumption]}
                onValueChange={(value) => setMonthlyConsumption(value[0])}
                className="w-full"
              />
              <div className={cn("flex items-center justify-between text-sm", themeColors.muted)}>
                <span>50 kWh</span>
                <span className={cn("text-lg font-bold", themeColors.heading)}>
                  {monthlyConsumption} kWh/måned
                </span>
                <span>850 kWh</span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Mobile view - Provider grids and cards stacked */}
        <div className="lg:hidden space-y-6">
          {/* Provider 1 selection */}
          <ProviderGrid
            selectedProviderId={selectedProvider1?.id || null}
            onSelectProvider={handleSelect1}
            label="Vælg udbyder 1"
          />
          {selectedProvider1 && (
            <EnhancedComparisonCard
              provider={selectedProvider1}
              details={details1}
              isFirst={true}
              isCheaper={!!isCheaper1}
              onSelectProvider={handleSelect1}
            />
          )}
          
          {/* Provider 2 selection */}
          <ProviderGrid
            selectedProviderId={selectedProvider2?.id || null}
            onSelectProvider={handleSelect2}
            label="Vælg udbyder 2"
          />
          {selectedProvider2 && (
            <EnhancedComparisonCard
              provider={selectedProvider2}
              details={details2}
              isFirst={false}
              isCheaper={!!isCheaper2}
              onSelectProvider={handleSelect2}
            />
          )}
        </div>

        {/* Desktop view - Side by side cards + detailed table */}
        <div className="hidden lg:block">
          {/* Provider selection grids side by side */}
          <div className="grid grid-cols-2 gap-8 mb-8">
            <ProviderGrid
              selectedProviderId={selectedProvider1?.id || null}
              onSelectProvider={handleSelect1}
              label="Vælg udbyder 1"
            />
            <ProviderGrid
              selectedProviderId={selectedProvider2?.id || null}
              onSelectProvider={handleSelect2}
              label="Vælg udbyder 2"
            />
          </div>
          
          {/* Cards side by side */}
          {(selectedProvider1 || selectedProvider2) && (
            <div className="grid grid-cols-2 gap-6 mb-8">
              {selectedProvider1 && (
                <EnhancedComparisonCard
                  provider={selectedProvider1}
                  details={details1}
                  isFirst={true}
                  isCheaper={!!isCheaper1}
                  onSelectProvider={handleSelect1}
                />
              )}
              {selectedProvider2 && (
                <EnhancedComparisonCard
                  provider={selectedProvider2}
                  details={details2}
                  isFirst={false}
                  isCheaper={!!isCheaper2}
                  onSelectProvider={handleSelect2}
                />
              )}
            </div>
          )}

          {/* Detailed price breakdown table */}
          <Card className={cn("shadow-xl overflow-hidden", themeColors.tableBg)}>
            <div className={cn("p-6", themeColors.tableHeader)}>
              <h3 className="font-bold text-lg flex items-center gap-2">
                <Info className="h-5 w-5" />
                Detaljeret prissammenligning
              </h3>
            </div>
            
            <Table>
              <TableBody>
                <TableRow className={themeColors.tableRowHover}>
                  <TableCell className={cn("font-semibold", themeColors.strong)}>
                    Spotpris
                  </TableCell>
                  <TableCell className={cn("text-center", themeColors.body)}>
                    {formatCurrency(details1.spotPrice)}
                  </TableCell>
                  <TableCell className={cn("text-center", themeColors.body)}>
                    {formatCurrency(details2.spotPrice)}
                  </TableCell>
                </TableRow>
                
                <TableRow className={themeColors.tableRowHover}>
                  <TableCell className={cn("font-semibold", themeColors.strong)}>
                    Leverandør tillæg
                  </TableCell>
                  <TableCell className={cn("text-center", themeColors.body)}>
                    {formatCurrency(details1.tillæg)}
                  </TableCell>
                  <TableCell className={cn("text-center", themeColors.body)}>
                    {formatCurrency(details2.tillæg)}
                  </TableCell>
                </TableRow>

                {(details1.greenCerts > 0 || details2.greenCerts > 0) && (
                  <TableRow className={themeColors.tableRowHover}>
                    <TableCell className={cn("font-semibold", themeColors.strong)}>
                      Grønne certifikater
                    </TableCell>
                    <TableCell className={cn("text-center", themeColors.body)}>
                      {formatCurrency(details1.greenCerts)}
                    </TableCell>
                    <TableCell className={cn("text-center", themeColors.body)}>
                      {formatCurrency(details2.greenCerts)}
                    </TableCell>
                  </TableRow>
                )}

                {(details1.tradingCosts > 0 || details2.tradingCosts > 0) && (
                  <TableRow className={themeColors.tableRowHover}>
                    <TableCell className={cn("font-semibold", themeColors.strong)}>
                      Handelsomkostninger
                    </TableCell>
                    <TableCell className={cn("text-center", themeColors.body)}>
                      {formatCurrency(details1.tradingCosts)}
                    </TableCell>
                    <TableCell className={cn("text-center", themeColors.body)}>
                      {formatCurrency(details2.tradingCosts)}
                    </TableCell>
                  </TableRow>
                )}

                <TableRow className={themeColors.tableRowHover}>
                  <TableCell className={cn("font-semibold", themeColors.strong)}>
                    Nettarif
                  </TableCell>
                  <TableCell className={cn("text-center", themeColors.body)}>
                    {formatCurrency(details1.networkTariff)}
                  </TableCell>
                  <TableCell className={cn("text-center", themeColors.body)}>
                    {formatCurrency(details2.networkTariff)}
                  </TableCell>
                </TableRow>

                <TableRow className={themeColors.tableRowHover}>
                  <TableCell className={cn("font-semibold", themeColors.strong)}>
                    Systemtarif
                  </TableCell>
                  <TableCell className={cn("text-center", themeColors.body)}>
                    {formatCurrency(details1.systemTariff)}
                  </TableCell>
                  <TableCell className={cn("text-center", themeColors.body)}>
                    {formatCurrency(details2.systemTariff)}
                  </TableCell>
                </TableRow>

                <TableRow className={themeColors.tableRowHover}>
                  <TableCell className={cn("font-semibold", themeColors.strong)}>
                    Transmissionstarif
                  </TableCell>
                  <TableCell className={cn("text-center", themeColors.body)}>
                    {formatCurrency(details1.transmissionFee)}
                  </TableCell>
                  <TableCell className={cn("text-center", themeColors.body)}>
                    {formatCurrency(details2.transmissionFee)}
                  </TableCell>
                </TableRow>

                <TableRow className={themeColors.tableRowHover}>
                  <TableCell className={cn("font-semibold", themeColors.strong)}>
                    Elafgift
                  </TableCell>
                  <TableCell className={cn("text-center", themeColors.body)}>
                    {formatCurrency(details1.electricityTax)}
                  </TableCell>
                  <TableCell className={cn("text-center", themeColors.body)}>
                    {formatCurrency(details2.electricityTax)}
                  </TableCell>
                </TableRow>

                <TableRow className={cn("border-t-2", isDarkTheme(theme) ? "border-gray-600" : "border-gray-300")}>
                  <TableCell className={cn("font-semibold", themeColors.strong)}>
                    Subtotal (uden moms)
                  </TableCell>
                  <TableCell className={cn("text-center", themeColors.body)}>
                    {formatCurrency(details1.subtotal)}
                  </TableCell>
                  <TableCell className={cn("text-center", themeColors.body)}>
                    {formatCurrency(details2.subtotal)}
                  </TableCell>
                </TableRow>

                <TableRow className={themeColors.tableRowHover}>
                  <TableCell className={cn("font-semibold", themeColors.strong)}>
                    Moms (25%)
                  </TableCell>
                  <TableCell className={cn("text-center", themeColors.body)}>
                    {formatCurrency(details1.vat)}
                  </TableCell>
                  <TableCell className={cn("text-center", themeColors.body)}>
                    {formatCurrency(details2.vat)}
                  </TableCell>
                </TableRow>

                <TableRow className={cn("border-t-2", isDarkTheme(theme) ? "border-gray-600" : "border-brand-green")}>
                  <TableCell className={cn("font-bold text-lg", themeColors.strong)}>
                    Total pr. kWh
                  </TableCell>
                  <TableCell className={cn(
                    "text-center font-bold text-lg",
                    isCheaper1 && !isDarkTheme(theme) ? "text-brand-green bg-green-50" : themeColors.strong
                  )}>
                    {formatCurrency(details1.totalPerKwh)}
                  </TableCell>
                  <TableCell className={cn(
                    "text-center font-bold text-lg",
                    isCheaper2 && !isDarkTheme(theme) ? "text-brand-green bg-green-50" : themeColors.strong
                  )}>
                    {formatCurrency(details2.totalPerKwh)}
                  </TableCell>
                </TableRow>

                <TableRow className={themeColors.tableRowHover}>
                  <TableCell className={cn("font-semibold", themeColors.strong)}>
                    Månedligt abonnement
                  </TableCell>
                  <TableCell className={cn("text-center", themeColors.body)}>
                    {formatCurrency(details1.subscription)}
                  </TableCell>
                  <TableCell className={cn("text-center", themeColors.body)}>
                    {formatCurrency(details2.subscription)}
                  </TableCell>
                </TableRow>

                <TableRow className={cn("border-t-2", isDarkTheme(theme) ? "border-gray-600" : "border-brand-green", "bg-gray-50")}>
                  <TableCell className={cn("font-bold text-lg", themeColors.strong)}>
                    <div className="flex items-center gap-2">
                      <TrendingDown className={cn("h-5 w-5", isDarkTheme(theme) ? "text-brand-green" : "text-brand-green")} />
                      <div>
                        <p>Total pr. måned</p>
                        <p className={cn("text-sm font-normal mt-1", themeColors.muted)}>
                          ved {monthlyConsumption} kWh forbrug
                        </p>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell className={cn(
                    "text-center",
                    isCheaper1 && !isDarkTheme(theme) && "bg-green-50"
                  )}>
                    <div className="space-y-1">
                      <p className={cn(
                        "text-2xl font-bold",
                        isCheaper1 && !isDarkTheme(theme) ? "text-brand-green" : themeColors.heading
                      )}>
                        {formatMonthlyTotal(details1.totalPerKwh, monthlyConsumption, details1.subscription)}
                      </p>
                      {isCheaper1 && (
                        <Badge className="bg-brand-green text-white">
                          <Check className="h-3 w-3 mr-1" />
                          Spar {formatCurrency(Math.abs(details2.total - details1.total))}/md
                        </Badge>
                      )}
                    </div>
                  </TableCell>
                  <TableCell className={cn(
                    "text-center",
                    isCheaper2 && !isDarkTheme(theme) && "bg-green-50"
                  )}>
                    <div className="space-y-1">
                      <p className={cn(
                        "text-2xl font-bold",
                        isCheaper2 && !isDarkTheme(theme) ? "text-brand-green" : themeColors.heading
                      )}>
                        {formatMonthlyTotal(details2.totalPerKwh, monthlyConsumption, details2.subscription)}
                      </p>
                      {isCheaper2 && (
                        <Badge className="bg-brand-green text-white">
                          <Check className="h-3 w-3 mr-1" />
                          Spar {formatCurrency(Math.abs(details1.total - details2.total))}/md
                        </Badge>
                      )}
                    </div>
                  </TableCell>
                </TableRow>
              </TableBody>
            </Table>
          </Card>
        </div>

        <p className={cn("text-sm text-center mt-8", themeColors.muted)}>
          * Priserne er estimater baseret på live spotpriser og inkluderer alle afgifter og moms.
        </p>
      </div>
    </section>
  );
};

export default RealPriceComparisonTable;
