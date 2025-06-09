import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Slider } from '@/components/ui/slider';
import { ArrowRight, Building, Building2, Home, Sun } from 'lucide-react';

interface PriceCalculatorProps {
  block: {
    _type: 'heroWithCalculator';
    title?: string;
    subtitle?: string;
    stats?: { value: string; label: string }[];
  };
}

interface PresetButtonProps {
  icon: React.ReactNode;
  label: string;
  value: string;
  consumption: number;
  isActive: boolean;
  onClick: () => void;
}

const PresetButton: React.FC<PresetButtonProps> = ({ icon, label, value, consumption, isActive, onClick }) => (
  <div
    className={`p-4 border-2 rounded-xl cursor-pointer transition-all ${
      isActive ? 'border-green-500 bg-green-50' : 'border-gray-200 hover:border-gray-300'
    }`}
    onClick={onClick}
  >
    <div className={`flex justify-center mb-2 ${isActive ? 'text-green-600' : 'text-gray-600'}`}>
      {icon}
    </div>
    <p className={`text-sm font-semibold text-center ${isActive ? 'text-green-700' : 'text-gray-700'}`}>
      {label}
    </p>
    <p className={`text-xs text-center ${isActive ? 'text-green-600' : 'text-gray-500'}`}>
      {value}
    </p>
  </div>
);

const PriceCalculatorComponent: React.FC<PriceCalculatorProps> = ({ block }) => {
  const [currentStep, setCurrentStep] = useState(1);
  const [annualConsumption, setAnnualConsumption] = useState(4000);
  const [activePreset, setActivePreset] = useState<string | null>(null);

  const handlePresetClick = (preset: string) => {
    setActivePreset(preset);
    const consumptionMap: { [key: string]: number } = {
      lilleLejlighed: 2000,
      storLejlighed: 3000,
      mindreHus: 4000,
      stortHus: 6000,
      sommerhus: 2000,
    };
    setAnnualConsumption(consumptionMap[preset] || 4000);
  };

  const handleSliderChange = (value: number[]) => {
    setAnnualConsumption(value[0]);
    setActivePreset(null);
  };

  return (
    <section className="bg-gray-900 text-white">
      <div className="container mx-auto px-6 py-16 lg:py-24 grid lg:grid-cols-2 gap-12 items-center">
        
        {/* Left Side: Content from Sanity */}
        <div>
          {block.title && (
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold leading-tight mb-4">
              Elpriser - Find og <span className="text-green-400">sammenlign</span> elpriser
            </h1>
          )}
          {block.subtitle && (
            <p className="text-lg text-gray-300 mb-8">{block.subtitle}</p>
          )}
          
          {block.stats && (
            <div className="flex items-center space-x-8 mb-8">
              {block.stats.map((stat, index) => (
                <div key={index}>
                  <p className="text-3xl font-bold text-green-400">{stat.value}</p>
                  <p className="text-gray-400">{stat.label}</p>
                </div>
              ))}
            </div>
          )}

          <Button size="lg" className="bg-green-500 hover:bg-green-600 text-white">
            Begynd <ArrowRight className="ml-2 h-5 w-5" />
          </Button>
        </div>

        {/* Right Side: The Calculator */}
        <div className="bg-white text-gray-900 rounded-2xl shadow-lg p-8 w-full max-w-lg mx-auto">
          {/* Stepper Navigation */}
          <div className="flex justify-between items-center mb-8">
              <div className={`text-center ${currentStep === 1 ? 'text-green-600 font-bold' : 'text-gray-400'}`}>Velkommen</div>
              <div className="flex-1 border-t-2 mx-4"></div>
              <div className={`text-center ${currentStep === 2 ? 'text-green-600 font-bold' : 'text-gray-400'}`}>Dit forbrug</div>
              <div className="flex-1 border-t-2 mx-4"></div>
              <div className={`text-center ${currentStep === 3 ? 'text-green-600 font-bold' : 'text-gray-400'}`}>Resultat</div>
          </div>

          {/* Step 1: Welcome */}
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
          
          {/* Step 2: Consumption */}
          {currentStep === 2 && (
              <div>
                  <div className="text-center mb-6">
                      <h3 className="text-xl font-bold text-gray-800 mb-2">Vælg din boligtype for et hurtigt estimat:</h3>
                  </div>
                  <div className="grid grid-cols-3 gap-4 mb-8">
                      <PresetButton icon={<Building className="h-6 w-6"/>} label="Lille Lejlighed" value="Op til 80 kvm" consumption={2000} isActive={activePreset === 'lilleLejlighed'} onClick={() => handlePresetClick('lilleLejlighed')} />
                      <PresetButton icon={<Building2 className="h-6 w-6"/>} label="Stor Lejlighed" value="Over 80 kvm" consumption={3000} isActive={activePreset === 'storLejlighed'} onClick={() => handlePresetClick('storLejlighed')} />
                      <PresetButton icon={<Home className="h-6 w-6"/>} label="Mindre Hus" value="Op til 130 kvm" consumption={4000} isActive={activePreset === 'mindreHus'} onClick={() => handlePresetClick('mindreHus')} />
                      <PresetButton icon={<Home className="h-6 w-6" />} label="Stort Hus" value="Over 130 kvm" consumption={6000} isActive={activePreset === 'stortHus'} onClick={() => handlePresetClick('stortHus')} />
                      <PresetButton icon={<Sun className="h-6 w-6"/>} label="Sommerhus" value="Feriebolig" consumption={2000} isActive={activePreset === 'sommerhus'} onClick={() => handlePresetClick('sommerhus')} />
                  </div>
                  
                  <div className="text-center mb-4">
                      <h4 className="font-semibold text-gray-700">Eller angiv præcist årligt forbrug:</h4>
                      <p className="font-bold text-green-600 text-lg">{annualConsumption.toLocaleString('da-DK')} kWh</p>
                  </div>
                  <Slider value={[annualConsumption]} onValueChange={handleSliderChange} min={500} max={10000} step={100} />
                  
                  <Button onClick={() => console.log('Navigate to results for:', annualConsumption)} className="w-full mt-8 bg-green-500 hover:bg-green-600">
                      Se dine priser <ArrowRight className="ml-2 h-4 w-4" />
                  </Button>
              </div>
          )}
        </div>
      </div>
    </section>
  );
};

export default PriceCalculatorComponent; 