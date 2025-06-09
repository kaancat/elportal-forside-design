import React, { useState } from 'react';
import { Slider } from "@/components/ui/slider";
import { Button } from '@/components/ui/button';
import { Home, Building, Building2, Sun, ArrowRight } from 'lucide-react';
import { cn } from '@/lib/utils';

type HousingType = 'custom' | 'lilleLejlighed' | 'storLejlighed' | 'mindreHus' | 'stortHus' | 'sommerhus';
const presets: Record<Exclude<HousingType, 'custom'>, number> = {
    lilleLejlighed: 2000,
    storLejlighed: 3000,
    mindreHus: 4000,
    stortHus: 6000,
    sommerhus: 2000,
};

const PresetButton = ({ icon, label, value, consumption, isActive, onClick }: any) => (
    <button onClick={onClick} className={cn("p-4 border-2 rounded-lg text-center transition-all flex flex-col items-center justify-center h-full", isActive ? "border-green-500 bg-green-50" : "border-gray-200 hover:border-gray-300")}>
        {icon}
        <span className="font-bold text-sm mt-2">{label}</span>
        <span className="text-xs text-gray-500">{value}</span>
        <span className="text-xs text-gray-500">{consumption.toLocaleString('da-DK')} kWh</span>
    </button>
);

const PriceCalculatorWidget = () => {
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

    return (
        <div className="bg-white text-gray-900 rounded-2xl shadow-2xl p-8 w-full max-w-lg mx-auto">
            <div className="flex justify-between items-center mb-8">
                {[1, 2, 3].map(step => (
                    <React.Fragment key={step}>
                        <div className={`text-center ${currentStep === step ? 'text-green-600 font-bold' : (currentStep > step ? 'text-green-600' : 'text-gray-400')}`}>
                            {step === 1 ? 'Velkommen' : step === 2 ? 'Dit forbrug' : 'Resultat'}
                        </div>
                        {step < 3 && <div className={`flex-1 border-t-2 mx-4 ${currentStep > step ? 'border-green-500' : 'border-gray-200'}`}></div>}
                    </React.Fragment>
                ))}
            </div>

            {currentStep === 1 && (
                <div>
                    <h3 className="text-xl font-bold text-gray-800 mb-2">Se om du kan spare penge</h3>
                    <p className="text-gray-600 mb-6">Få estimerede og tilpassede priser på elaftaler, som tager udgangspunkt i dit forbrug.</p>
                    <ul className="space-y-2 mb-8">
                        <li className="flex items-center text-gray-700"><span className="text-green-500 mr-2">✓</span>Beregn dit forbrug</li>
                        <li className="flex items-center text-gray-700"><span className="text-green-500 mr-2">✓</span>Sammenlign elselskaber</li>
                        <li className="flex items-center text-gray-700"><span className="text-green-500 mr-2">✓</span>Gratis og uforpligtende</li>
                    </ul>
                    <Button onClick={() => setCurrentStep(2)} className="w-full bg-green-500 hover:bg-green-600">
                        Begynd <ArrowRight className="ml-2 h-4 w-4" />
                    </Button>
                </div>
            )}
            
            {currentStep === 2 && (
                <div>
                    <div className="text-center mb-6"><h3 className="text-lg font-bold text-gray-800">Vælg din boligtype for et hurtigt estimat:</h3></div>
                    <div className="grid grid-cols-3 gap-2 md:gap-4 mb-8">
                        <PresetButton icon={<Building size={20}/>} label="Lille Lejlighed" value="< 80 m²" consumption={2000} isActive={activePreset === 'lilleLejlighed'} onClick={() => handlePresetClick('lilleLejlighed')} />
                        <PresetButton icon={<Building2 size={20}/>} label="Stor Lejlighed" value="> 80 m²" consumption={3000} isActive={activePreset === 'storLejlighed'} onClick={() => handlePresetClick('storLejlighed')} />
                        <PresetButton icon={<Home size={20}/>} label="Mindre Hus" value="< 130 m²" consumption={4000} isActive={activePreset === 'mindreHus'} onClick={() => handlePresetClick('mindreHus')} />
                        <PresetButton icon={<Home size={20} />} label="Stort Hus" value="> 130 m²" consumption={6000} isActive={activePreset === 'stortHus'} onClick={() => handlePresetClick('stortHus')} />
                        <PresetButton icon={<Sun size={20}/>} label="Sommerhus" value="Feriebolig" consumption={2000} isActive={activePreset === 'sommerhus'} onClick={() => handlePresetClick('sommerhus')} />
                        <div className="p-4 border-2 border-transparent rounded-lg"></div>
                    </div>
                    <div className="text-center mb-4">
                        <h4 className="font-semibold text-gray-700">Eller angiv præcist årligt forbrug:</h4>
                        <p className="font-bold text-green-600 text-lg">{annualConsumption.toLocaleString('da-DK')} kWh</p>
                    </div>
                    <Slider value={[annualConsumption]} onValueChange={handleSliderChange} min={500} max={15000} step={100} />
                    <Button onClick={() => console.log('Navigate to results for:', annualConsumption)} className="w-full mt-8 bg-green-500 hover:bg-green-600">
                        Se dine priser <ArrowRight className="ml-2 h-4 w-4" />
                    </Button>
                </div>
            )}
        </div>
    );
};

export default PriceCalculatorWidget; 