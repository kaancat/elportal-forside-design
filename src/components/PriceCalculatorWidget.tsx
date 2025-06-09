import React, { useState } from 'react';
import { Slider } from "@/components/ui/slider";
import { Button } from '@/components/ui/button';
import { Home, Building, Building2, Sun, ArrowRight, ArrowLeft, CheckCircle } from 'lucide-react';
import { cn } from '@/lib/utils';

// --- PROPS INTERFACE ---
interface PriceCalculatorWidgetProps {
  block: {
    _type: 'priceCalculator';
    title?: string;
  };
  variant?: 'standalone' | 'hero'; // Add variant prop for different use cases
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

    const handlePresetClick = (preset: Exclude<HousingType, 'custom'>) => {
        setActivePreset(preset);
        setAnnualConsumption(presets[preset]);
    };
    
    const handleSliderChange = (value: number[]) => {
        setAnnualConsumption(value[0]);
        setActivePreset('custom');
    }

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
                <div className="mt-8">
                    <div className="text-center mb-4"><h3 className="text-base font-bold text-gray-800">Vælg din boligtype for et hurtigt estimat:</h3></div>
                    <div className="grid grid-cols-3 gap-2 md:gap-4 mb-6">
                        <PresetButton icon={<Building size={20}/>} label="Lille Lejlighed" value="< 80 m²" consumption={2000} isActive={activePreset === 'lilleLejlighed'} onClick={() => handlePresetClick('lilleLejlighed')} />
                        <PresetButton icon={<Building2 size={20}/>} label="Stor Lejlighed" value="> 80 m²" consumption={3000} isActive={activePreset === 'storLejlighed'} onClick={() => handlePresetClick('storLejlighed')} />
                        <PresetButton icon={<Home size={20}/>} label="Mindre Hus" value="< 130 m²" consumption={4000} isActive={activePreset === 'mindreHus'} onClick={() => handlePresetClick('mindreHus')} />
                        <PresetButton icon={<Home size={20} />} label="Stort Hus" value="> 130 m²" consumption={6000} isActive={activePreset === 'stortHus'} onClick={() => handlePresetClick('stortHus')} />
                        <PresetButton icon={<Sun size={20}/>} label="Sommerhus" value="Feriebolig" consumption={2000} isActive={activePreset === 'sommerhus'} onClick={() => handlePresetClick('sommerhus')} />
                        <div className="p-4 border-2 border-transparent rounded-lg"></div>
                    </div>
                    <div className="text-center mb-2"><h4 className="font-semibold text-gray-700">Eller angiv præcist årligt forbrug:</h4><p className="font-bold text-brand-green text-lg">{annualConsumption.toLocaleString('da-DK')} kWh</p></div>
                    <Slider value={[annualConsumption]} onValueChange={handleSliderChange} min={500} max={15000} step={100} />
                    <div className="flex gap-4 mt-6">
                        <Button onClick={() => setCurrentStep(1)} variant="outline" className="w-full"><ArrowLeft className="mr-2 h-4 w-4" /> Tilbage</Button>
                        <Button onClick={() => setCurrentStep(3)} className="w-full bg-brand-green hover:opacity-90">Se dine priser <ArrowRight className="ml-2 h-4 w-4" /></Button>
                    </div>
                </div>
            )}

            {/* Step 3 */}
            {currentStep === 3 && (
                <div className="mt-8 text-center">
                    <h3 className="text-xl font-bold text-gray-800 mb-2">Resultater</h3>
                    <p className="text-gray-600 mb-6">Her vil en liste af elaftaler baseret på et forbrug på <span className="font-bold">{annualConsumption.toLocaleString('da-DK')} kWh</span> blive vist.</p>
                    <p className="text-sm text-gray-500 mb-8">(Denne sektion er under udvikling)</p>
                     <Button onClick={() => setCurrentStep(2)} variant="outline" className="w-full"><ArrowLeft className="mr-2 h-4 w-4" /> Tilbage til forbrug</Button>
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
                    <h2 className="text-3xl font-bold text-center mb-12">{block.title}</h2>
                )}
                <WidgetContent />
            </div>
        </section>
    );
};

export default PriceCalculatorWidget; 