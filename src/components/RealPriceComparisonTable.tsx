import React, { useState, useMemo, useEffect } from 'react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Slider } from '@/components/ui/slider';
import { Label } from '@/components/ui/label';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Zap, TrendingDown, Check } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { RealPriceComparisonTable, ProviderProductBlock } from '../types/sanity';
import { SanityService } from '../services/sanityService';

const formatCurrency = (amount: number) => `${amount.toFixed(2)} kr.`;

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
  const [selectedProvider1, setSelectedProvider1] = useState<ProviderProductBlock | null>(null);
  const [selectedProvider2, setSelectedProvider2] = useState<ProviderProductBlock | null>(null);
  const [monthlyConsumption, setMonthlyConsumption] = useState(150);
  const [allProviders, setAllProviders] = useState<ProviderProductBlock[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const { title, leadingText, settings } = block;
  
  // Get theme colors based on settings
  const themeColors = getThemeTextColors(settings?.theme);
  const theme = settings?.theme || 'default';

  useEffect(() => {
    const fetchProviders = async () => {
      try {
        const providers = await SanityService.getAllProviders();
        setAllProviders(providers);
      } catch (error) {
        console.error('Error fetching providers:', error);
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchProviders();
  }, []);

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
      return { tillæg: 0, subscription: 0, total: 0 };
    }
    
    // Use the correct field names that come from the GROQ query
    const tillæg = provider.displayPrice_kWh || 0;
    const subscription = provider.displayMonthlyFee || 0;
    const total = (tillæg * monthlyConsumption) + subscription;
    
    return { tillæg, subscription, total };
  };

  const details1 = useMemo(() => getPriceDetails(selectedProvider1), [selectedProvider1, monthlyConsumption]);
  const details2 = useMemo(() => getPriceDetails(selectedProvider2), [selectedProvider2, monthlyConsumption]);
  
  if (isLoading) {
    return (
      <section className={cn(
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
        getThemeClasses(settings?.theme),
        getPaddingClasses(settings?.padding)
      )}>
        <div className={cn("text-center", themeColors.body)}>Konfigurer venligst udbydere i Sanity.</div>
      </section>
    );
  }

  // Component for comparison cards (mobile and desktop)
  const ComparisonCard = ({ 
    provider, 
    details, 
    isFirst, 
    isCheaper,
    onSelectProvider,
    providers
  }: {
    provider: ProviderProductBlock | null;
    details: { tillæg: number; subscription: number; total: number };
    isFirst: boolean;
    isCheaper: boolean;
    onSelectProvider: (providerId: string) => void;
    providers: ProviderProductBlock[];
  }) => (
    <Card className={cn(
      "relative overflow-hidden transition-all duration-300",
      themeColors.cardBg,
      themeColors.cardBorder,
      isCheaper && "ring-2 ring-brand-green shadow-lg"
    )}>
      {isCheaper && (
        <div className="absolute top-0 right-0 z-10">
          <Badge className={cn(themeColors.badgeBg, "rounded-bl-lg rounded-tr-none px-3 py-1 font-semibold")}>
            <Check className="h-3 w-3 mr-1" />
            Billigste
          </Badge>
        </div>
      )}
      
      <CardContent className={cn("p-4 md:p-6", isCheaper && "pt-12")}>
        {/* Provider selector */}
        <div className="mb-4">
          <div className="flex items-center gap-2 mb-2">
            <Zap className={cn("h-4 w-4", isDarkTheme(theme) ? "text-brand-green" : "text-brand-green")} />
            <Label className={cn("font-semibold text-sm", themeColors.strong)}>
              {isFirst ? 'Elselskab 1' : 'Elselskab 2'}
            </Label>
          </div>
          <Select onValueChange={onSelectProvider} value={provider?.id}>
            <SelectTrigger className={cn("w-full", themeColors.selectBg)}>
              <SelectValue placeholder="Vælg et selskab" />
            </SelectTrigger>
            <SelectContent>
              {providers.map(p => (
                <SelectItem key={p.id} value={p.id}>
                  {p.providerName}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          {provider && (
            <p className={cn("text-xs mt-1", themeColors.muted)}>{provider.productName}</p>
          )}
        </div>
        
        {/* Price details */}
        <div className="space-y-3">
          <div>
            <p className={cn("text-xs", themeColors.muted)}>Tillæg pr. kWh</p>
            <p className={cn("font-semibold", themeColors.strong)}>{formatCurrency(details.tillæg)}</p>
          </div>
          
          <div>
            <p className={cn("text-xs", themeColors.muted)}>Abonnement/måned</p>
            <p className={cn("font-semibold", themeColors.strong)}>{formatCurrency(details.subscription)}</p>
          </div>
          
          <div className={cn("border-t pt-3", isDarkTheme(theme) ? "border-gray-700" : "border-gray-200")}>
            <p className={cn("text-xs mb-1", themeColors.muted)}>Total pr. måned</p>
            <p className={cn(
              "text-2xl font-bold",
              isCheaper && !isDarkTheme(theme) ? "text-brand-green" : themeColors.heading
            )}>
              {formatCurrency(details.total)}
            </p>
            <p className={cn("text-xs mt-1", themeColors.muted)}>
              ved {monthlyConsumption} kWh
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  );

  const isCheaper1 = details1.total < details2.total && selectedProvider1 && selectedProvider2;
  const isCheaper2 = details2.total < details1.total && selectedProvider1 && selectedProvider2;

  return (
    <section className={cn(
      getThemeClasses(settings?.theme),
      getPaddingClasses(settings?.padding)
    )}>
      <div className="container mx-auto px-4 lg:px-8 max-w-6xl">
        {title && (
          <h2 className={cn(
            "text-3xl lg:text-4xl font-bold text-center mb-4 font-display",
            themeColors.heading
          )}>
            {title}
          </h2>
        )}
        {leadingText && (
          <p className={cn(
            "text-lg text-center mb-12 max-w-3xl mx-auto",
            themeColors.body
          )}>
            {leadingText}
          </p>
        )}

        {/* Consumption slider - always visible */}
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

        {/* Mobile view - Cards */}
        <div className="md:hidden space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <ComparisonCard
              provider={selectedProvider1}
              details={details1}
              isFirst={true}
              isCheaper={isCheaper1}
              onSelectProvider={handleSelect1}
              providers={allProviders}
            />
            <ComparisonCard
              provider={selectedProvider2}
              details={details2}
              isFirst={false}
              isCheaper={isCheaper2}
              onSelectProvider={handleSelect2}
              providers={allProviders}
            />
          </div>
        </div>

        {/* Desktop view - Enhanced Table */}
        <div className="hidden md:block">
          <Card className={cn("shadow-xl overflow-hidden", themeColors.tableBg)}>
            <div className={cn("p-6", themeColors.tableHeader)}>
              <div className="grid grid-cols-3 gap-4">
                <div className="flex items-center gap-2">
                  <Zap className="h-5 w-5" />
                  <h3 className="font-bold text-lg">Sammenligning</h3>
                </div>
                <div className="text-center">
                  <Select onValueChange={handleSelect1} value={selectedProvider1?.id}>
                    <SelectTrigger className={cn(
                      isDarkTheme(theme) || theme === 'primary'
                        ? "bg-white/20 border-white/30 text-white"
                        : `${themeColors.selectBg} text-brand-dark placeholder:text-gray-600`
                    )}>
                      <SelectValue placeholder="Vælg elselskab 1" />
                    </SelectTrigger>
                    <SelectContent>
                      {allProviders.map(p => (
                        <SelectItem key={p.id} value={p.id}>
                          {p.providerName} - {p.productName}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="text-center">
                  <Select onValueChange={handleSelect2} value={selectedProvider2?.id}>
                    <SelectTrigger className={cn(
                      isDarkTheme(theme) || theme === 'primary'
                        ? "bg-white/20 border-white/30 text-white"
                        : `${themeColors.selectBg} text-brand-dark placeholder:text-gray-600`
                    )}>
                      <SelectValue placeholder="Vælg elselskab 2" />
                    </SelectTrigger>
                    <SelectContent>
                      {allProviders.map(p => (
                        <SelectItem key={p.id} value={p.id}>
                          {p.providerName} - {p.productName}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>
            
            <Table>
              <TableBody>
                <TableRow className={themeColors.tableRowHover}>
                  <TableCell className={cn(
                    "font-semibold py-6 px-8",
                    themeColors.strong,
                    isDarkTheme(theme) ? "bg-gray-900" : "bg-gray-50"
                  )}>
                    Tillæg pr. kWh
                  </TableCell>
                  <TableCell className={cn(
                    "text-center py-6 px-8",
                    themeColors.body,
                    isCheaper1 && !isDarkTheme(theme) && "bg-green-50 font-semibold"
                  )}>
                    {formatCurrency(details1.tillæg)}
                  </TableCell>
                  <TableCell className={cn(
                    "text-center py-6 px-8",
                    themeColors.body,
                    isCheaper2 && !isDarkTheme(theme) && "bg-green-50 font-semibold"
                  )}>
                    {formatCurrency(details2.tillæg)}
                  </TableCell>
                </TableRow>
                <TableRow className={themeColors.tableRowHover}>
                  <TableCell className={cn(
                    "font-semibold py-6 px-8",
                    themeColors.strong,
                    isDarkTheme(theme) ? "bg-gray-900" : "bg-gray-50"
                  )}>
                    Abonnement pr. måned
                  </TableCell>
                  <TableCell className={cn(
                    "text-center py-6 px-8",
                    themeColors.body,
                    isCheaper1 && !isDarkTheme(theme) && "bg-green-50 font-semibold"
                  )}>
                    {formatCurrency(details1.subscription)}
                  </TableCell>
                  <TableCell className={cn(
                    "text-center py-6 px-8",
                    themeColors.body,
                    isCheaper2 && !isDarkTheme(theme) && "bg-green-50 font-semibold"
                  )}>
                    {formatCurrency(details2.subscription)}
                  </TableCell>
                </TableRow>
                <TableRow className={cn("border-t-2", isDarkTheme(theme) ? "border-gray-600" : "border-brand-green")}>
                  <TableCell className={cn(
                    "font-bold py-6 px-8",
                    themeColors.strong,
                    isDarkTheme(theme) ? "bg-gray-900" : "bg-gray-50"
                  )}>
                    <div className="flex items-center gap-2">
                      <TrendingDown className={cn("h-5 w-5", isDarkTheme(theme) ? "text-brand-green" : "text-brand-green")} />
                      <div>
                        <p>Estimeret total pr. måned</p>
                        <p className={cn("text-sm font-normal mt-1", themeColors.muted)}>
                          ved {monthlyConsumption} kWh forbrug
                        </p>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell className={cn(
                    "text-center py-6 px-8",
                    isCheaper1 && !isDarkTheme(theme) && "bg-green-50"
                  )}>
                    <div className="space-y-1">
                      <p className={cn(
                        "text-2xl font-bold",
                        isCheaper1 && !isDarkTheme(theme) ? "text-brand-green" : themeColors.heading
                      )}>
                        {formatCurrency(details1.total)}
                      </p>
                      {isCheaper1 && (
                        <Badge className={themeColors.badgeBg}>
                          <Check className="h-3 w-3 mr-1" />
                          Billigste
                        </Badge>
                      )}
                    </div>
                  </TableCell>
                  <TableCell className={cn(
                    "text-center py-6 px-8",
                    isCheaper2 && !isDarkTheme(theme) && "bg-green-50"
                  )}>
                    <div className="space-y-1">
                      <p className={cn(
                        "text-2xl font-bold",
                        isCheaper2 && !isDarkTheme(theme) ? "text-brand-green" : themeColors.heading
                      )}>
                        {formatCurrency(details2.total)}
                      </p>
                      {isCheaper2 && (
                        <Badge className={themeColors.badgeBg}>
                          <Check className="h-3 w-3 mr-1" />
                          Billigste
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
          * Priserne er baseret på dit valg og inkluderer ikke spotpris, skatter og afgifter.
        </p>
      </div>
    </section>
  );
};

export default RealPriceComparisonTable; 