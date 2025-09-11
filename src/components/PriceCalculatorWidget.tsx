'use client'

import React, { useState, useEffect } from 'react';
import { Slider } from "@/components/ui/slider";
import { Button } from '@/components/ui/button';
import { Home, Building, Building2, Sun, ArrowRight, ArrowLeft, CheckCircle } from 'lucide-react';
import { cn } from '@/lib/utils';
import { SanityService } from '@/services/sanityService';
import { ProviderProductBlock } from '@/types/sanity';
import CalculatorResults from './CalculatorResults';
import { FloatingConsumptionHelper } from './FloatingConsumptionHelper';
import { rankProviders, PRICE_CONSTANTS } from '@/services/priceCalculationService';
import { useNetworkTariff } from '@/hooks/useNetworkTariff';
import { gridProviders } from '@/data/gridProviders';
import { trackEnhancedEvent } from '@/utils/tracking';

// --- PROPS INTERFACE ---
interface PriceCalculatorWidgetProps {
  block: {
    _type: 'priceCalculator';
    title?: string;
  };
  variant?: 'standalone' | 'hero'; // Add variant prop for different use cases
  showLivePrice?: boolean;
  showProviderComparison?: boolean;
}

// --- TYPES & PRESETS ---
type HousingType = 'custom' | 'lilleLejlighed' | 'storLejlighed' | 'mindreHus' | 'stortHus' | 'sommerhus';
const presets: Record<Exclude<HousingType, 'custom'>, number> = {
    lilleLejlighed: 2000,
    storLejlighed: 3000,
    mindreHus: 4000,
    stortHus: 6000,
    sommerhus: 2000,
};

// --- PRESET BUTTON ---
const PresetButton = ({ icon, label, value, consumption, isActive, onClick }: any) => (
    <button onClick={onClick} className={cn("p-3 border rounded-lg text-center transition-all flex flex-col items-center justify-start h-full group", isActive ? "border-brand-green bg-green-50" : "border-gray-200 hover:border-gray-400")}>
        <div className={cn("mb-2", isActive ? 'text-brand-green' : 'text-gray-500 group-hover:text-gray-700')}>
            {icon}
        </div>
        <span className="font-semibold text-xs md:text-sm">{label}</span>
        <span className="text-xs text-gray-500">{value}</span>
        <span className="text-xs text-gray-500">{consumption.toLocaleString('da-DK')} kWh</span>
    </button>
);

// --- MAIN WIDGET COMPONENT ---
const PriceCalculatorWidget: React.FC<PriceCalculatorWidgetProps> = ({ block, variant = 'standalone' }) => {
    const [currentStep, setCurrentStep] = useState(1);
    const [annualConsumption, setAnnualConsumption] = useState(4000);
    const [activePreset, setActivePreset] = useState<HousingType>('mindreHus');
    const [providers, setProviders] = useState<ProviderProductBlock[]>([]);
    const [spotPrice, setSpotPrice] = useState<number | null>(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [lastUpdated, setLastUpdated] = useState<Date | null>(null);
    const [providerCount, setProviderCount] = useState<number | null>(null);
    const [providerListId, setProviderListId] = useState<string>('provider-list');
    
    // Get network tariff from Radius (Copenhagen) as default for calculator
    // This covers a large population and provides accurate pricing
    const radiusProvider = gridProviders['791']; // Radius Elnet
    const { averageRate: networkTariff } = useNetworkTariff(
        radiusProvider,
        { enabled: true }
    );

    const handlePresetClick = (preset: Exclude<HousingType, 'custom'>) => {
        setActivePreset(preset);
        setAnnualConsumption(presets[preset]);
    };
    
    const handleSliderChange = (value: number[]) => {
        setAnnualConsumption(value[0]);
        setActivePreset('custom');
    }

    // Fetch data when moving to step 3
    useEffect(() => {
        // Only fetch inline results when not in hero variant
        if (currentStep === 3 && variant !== 'hero') {
            fetchPriceData();
        }
    }, [currentStep, variant]);

    // Listen for provider list readiness to show dynamic count in hero CTA
    useEffect(() => {
        const onReady = (e: Event) => {
            const evt = e as CustomEvent<{ id?: string; count?: number }>;
            if (typeof evt.detail?.count === 'number') {
                setProviderCount(evt.detail.count);
            }
            if (evt.detail?.id) {
                setProviderListId(evt.detail.id);
            }
        };
        window.addEventListener('elportal:providerListReady', onReady as EventListener);
        return () => window.removeEventListener('elportal:providerListReady', onReady as EventListener);
    }, []);

    const fetchPriceData = async () => {
        setLoading(true);
        setError(null);

        try {
            // Fetch providers
            const allProviders = await SanityService.getAllProviders();
            
            // Fetch current spot price
            let currentSpotPrice = PRICE_CONSTANTS.DEFAULT_SPOT_PRICE;
            try {
                const now = new Date();
                const dateStr = now.toISOString().split('T')[0];
                const response = await fetch(`/api/electricity-prices?region=DK2&date=${dateStr}`);
                if (response.ok) {
                    let data = await response.json();
                    let records: any[] = Array.isArray(data.records) ? data.records : [];
                    if (records.length === 0) {
                        const prev = new Date(now);
                        prev.setDate(now.getDate() - 1);
                        const prevStr = prev.toISOString().split('T')[0];
                        const prevResp = await fetch(`/api/electricity-prices?region=DK2&date=${prevStr}`);
                        if (prevResp.ok) {
                            const prevJson = await prevResp.json();
                            records = Array.isArray(prevJson.records) ? prevJson.records : [];
                        }
                    }
                    const currentHour = new Date().getHours();
                    const currentPriceData = records.find((r: any) => new Date(r.HourDK).getHours() === currentHour) || records[records.length - 1];
                    if (currentPriceData && typeof currentPriceData.SpotPriceKWh === 'number') {
                        currentSpotPrice = currentPriceData.SpotPriceKWh;
                        setLastUpdated(new Date());
                    }
                }
            } catch (spotError) {
                console.error('Failed to fetch spot price, using fallback:', spotError);
            }
            
            setSpotPrice(currentSpotPrice);
            
            // Rank providers according to business logic
            const rankedProviders = rankProviders(allProviders, currentSpotPrice, annualConsumption);
            setProviders(rankedProviders);
            
        } catch (err) {
            console.error('Error fetching price data:', err);
            setError('Kunne ikke hente prisdata. Prøv venligst igen.');
        } finally {
            setLoading(false);
        }
    };

    const handleGoToResults = () => {
        setCurrentStep(3);
    };

    const handleTeaserCTA = () => {
        try {
            // Dispatch event for ProviderList to prefill and scroll
            const evt = new CustomEvent('elportal:calculatorSubmit', {
                detail: { kWh: annualConsumption, source: 'hero' }
            } as any);
            window.dispatchEvent(evt);
            // Track GA4 event (consent-aware)
            trackEnhancedEvent('hero_providerlist_cta', {
                component: 'hero_calculator',
                action: 'scroll_to_provider_list',
                consumption_kwh: annualConsumption,
                provider_count: providerCount ?? undefined
            });
        } catch (e) {
            // noop
        }
    };

    const brandGreen = '#98ce2f'; // Using a variable for the brand color

    // Widget content component
    const WidgetContent = () => (
        <div className="bg-white text-gray-900 rounded-2xl shadow-2xl p-6 md:p-8 w-full max-w-md lg:max-w-xl mx-auto">
            {/* Stepper */}
            <div className="flex justify-between items-center mb-6">
                {[1, 2, 3].map(step => (
                    <React.Fragment key={step}>
                        <div className="text-center">
                            <div className={cn("mx-auto h-8 w-8 rounded-full flex items-center justify-center text-sm font-bold mb-1", currentStep >= step ? 'bg-brand-green text-white' : 'bg-gray-200 text-gray-500')}>
                                {currentStep > step ? <CheckCircle size={16}/> : step}
                            </div>
                            <p className={cn("text-xs", currentStep >= step ? "text-gray-800 font-semibold" : "text-gray-400")}>
                                {step === 1 ? 'Velkommen' : step === 2 ? 'Dit forbrug' : 'Resultat'}
                            </p>
                        </div>
                        {step < 3 && <div className={`flex-1 border-t-2 mx-2 md:mx-4 ${currentStep > step ? 'border-brand-green' : 'border-gray-200'}`}></div>}
                    </React.Fragment>
                ))}
            </div>

            {/* Step 1 */}
            {currentStep === 1 && (
                <div className="mt-8">
                    <h3 className="text-lg font-bold text-gray-800 mb-1">Se om du kan spare penge</h3>
                    <p className="font-bold text-gray-800 text-xl mb-4">Prøv vores beregner</p>
                    <p className="text-gray-600 text-sm mb-6">Få estimerede og tilpassede priser på elaftaler, som tager udgangspunkt i dit forbrug.</p>
                    <ul className="space-y-2 mb-8 text-sm">
                        <li className="flex items-center text-gray-700"><CheckCircle size={16} className="text-brand-green mr-2"/>Beregn dit forbrug</li>
                        <li className="flex items-center text-gray-700"><CheckCircle size={16} className="text-brand-green mr-2"/>Sammenlign elselskaber</li>
                        <li className="flex items-center text-gray-700"><CheckCircle size={16} className="text-brand-green mr-2"/>Gratis og uforpligtende</li>
                    </ul>
                    <Button onClick={() => setCurrentStep(2)} className="w-full bg-brand-green hover:opacity-90">
                        Begynd <ArrowRight className="ml-2 h-4 w-4" />
                    </Button>
                </div>
            )}
            
            {/* Step 2 */}
            {currentStep === 2 && (
                <div className="mt-8 relative">
                    <div className="text-center mb-4"><h3 className="text-base font-bold text-gray-800">Vælg din boligtype for et hurtigt estimat:</h3></div>
                    <div className="grid grid-cols-3 gap-2 md:gap-4 mb-6">
                        <PresetButton icon={<Building size={20}/>} label="Lille Lejlighed" value="< 80 m²" consumption={2000} isActive={activePreset === 'lilleLejlighed'} onClick={() => handlePresetClick('lilleLejlighed')} />
                        <PresetButton icon={<Building2 size={20}/>} label="Stor Lejlighed" value="> 80 m²" consumption={3000} isActive={activePreset === 'storLejlighed'} onClick={() => handlePresetClick('storLejlighed')} />
                        <PresetButton icon={<Home size={20}/>} label="Mindre Hus" value="< 130 m²" consumption={4000} isActive={activePreset === 'mindreHus'} onClick={() => handlePresetClick('mindreHus')} />
                        <PresetButton icon={<Home size={20} />} label="Stort Hus" value="> 130 m²" consumption={6000} isActive={activePreset === 'stortHus'} onClick={() => handlePresetClick('stortHus')} />
                        <PresetButton icon={<Sun size={20}/>} label="Sommerhus" value="Feriebolig" consumption={2000} isActive={activePreset === 'sommerhus'} onClick={() => handlePresetClick('sommerhus')} />
                        <div className="p-4 border-2 border-transparent rounded-lg"></div>
                    </div>
                    <div className="text-center mb-2">
                        <h4 className="font-semibold text-gray-700">Eller angiv præcist årligt forbrug:</h4>
                        <p className="font-bold text-brand-green text-lg relative inline-block">
                            {annualConsumption.toLocaleString('da-DK')} kWh<FloatingConsumptionHelper variant="floating" />
                        </p>
                    </div>
                    <div className="py-4 px-2 -mx-2">
                        <Slider value={[annualConsumption]} onValueChange={handleSliderChange} min={500} max={15000} step={100} />
                    </div>
                    
                    {/* Mobile inline helper */}
                    <FloatingConsumptionHelper variant="inline" />
                    
                    <div className="flex gap-4 mt-6">
                        <Button onClick={() => setCurrentStep(1)} variant="outline" className="w-full"><ArrowLeft className="mr-2 h-4 w-4" /> Tilbage</Button>
                        <Button onClick={handleGoToResults} className="w-full bg-brand-green hover:opacity-90">Se dine priser <ArrowRight className="ml-2 h-4 w-4" /></Button>
                    </div>
                </div>
            )}

            {/* Step 3 */}
            {currentStep === 3 && (
                <div className="mt-8">
                    {variant === 'hero' ? (
                        <div className="text-center py-8">
                            <p className="text-gray-700 mb-4 text-sm">Baseret på dine valg</p>
                            <Button onClick={handleTeaserCTA} className="w-full bg-brand-green hover:opacity-90">
                                {typeof providerCount === 'number' 
                                  ? `Du har ${providerCount} matchende selskaber – se listen`
                                  : 'Se listen over selskaber'}
                                <ArrowRight className="ml-2 h-4 w-4" />
                            </Button>
                            <div className="mt-4">
                                <Button onClick={() => setCurrentStep(2)} variant="outline">
                                    <ArrowLeft className="mr-2 h-4 w-4" /> Rediger valg
                                </Button>
                            </div>
                        </div>
                    ) : (
                        // Standalone variant retains inline results
                        <>
                            {loading ? (
                                <div className="text-center py-12">
                                    <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-brand-green"></div>
                                    <p className="mt-4 text-gray-600">Henter aktuelle elpriser...</p>
                                </div>
                            ) : error ? (
                                <div className="text-center py-12">
                                    <p className="text-red-600 mb-4">{error}</p>
                                    <Button onClick={fetchPriceData} variant="outline">
                                        Prøv igen
                                    </Button>
                                </div>
                            ) : spotPrice !== null && providers.length > 0 ? (
                                <CalculatorResults
                                    providers={providers}
                                    annualConsumption={annualConsumption}
                                    spotPrice={spotPrice}
                                    networkTariff={networkTariff}
                                    onBack={() => setCurrentStep(2)}
                                    lastUpdated={lastUpdated}
                                />
                            ) : (
                                <div className="text-center py-12">
                                    <p className="text-gray-600 mb-4">Ingen leverandører fundet</p>
                                    <Button onClick={() => setCurrentStep(2)} variant="outline">
                                        <ArrowLeft className="mr-2 h-4 w-4" /> Tilbage
                                    </Button>
                                </div>
                            )}
                        </>
                    )}
                </div>
            )}
        </div>
    );

    // Return based on variant
    if (variant === 'hero') {
        // For hero usage - just return the widget without section wrapper
        return <WidgetContent />;
    }

    // For standalone usage - return with section wrapper and optional title
    return (
        <section className="bg-gray-100 py-16 lg:py-24">
            <div className="container mx-auto px-4">
                {block.title && (
                    <h2 className="text-3xl font-display font-bold text-center mb-12">{block.title}</h2>
                )}
                <WidgetContent />
            </div>
        </section>
    );
};

export default PriceCalculatorWidget; 
