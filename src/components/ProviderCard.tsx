
import React from 'react';
import { ArrowRight, Check, Star, Info } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';

interface ProviderProps {
  logo: string;
  name: string;
  priceKwh: number;
  priceMonth: number;
  badges: string[];
  trustpilotScore?: number;
  intro?: boolean;
  verified?: boolean;
  features: string[];
}

const ProviderCard: React.FC<ProviderProps> = ({
  logo,
  name,
  priceKwh,
  priceMonth,
  badges,
  trustpilotScore,
  intro = false,
  verified = false,
  features,
}) => {
  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden hover:shadow-md transition-shadow">
      <div className="p-6 flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="flex items-center space-x-4">
          <div className="flex-shrink-0 w-24 h-24 flex items-center justify-center p-2 bg-white rounded-lg">
            <img src={logo} alt={`${name} logo`} className="max-w-full max-h-full" />
          </div>
          
          <div>
            {badges.length > 0 && (
              <div className="flex flex-wrap gap-2 mb-2">
                {badges.map((badge, index) => (
                  <span 
                    key={index} 
                    className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800"
                  >
                    {badge}
                  </span>
                ))}
              </div>
            )}
            
            <h3 className="font-bold text-lg">{name}</h3>
            
            <div className="flex items-center mt-1">
              {verified && (
                <span className="inline-flex items-center text-xs text-green-600 mr-3">
                  <Check className="h-3 w-3 mr-1" /> Verificeret
                </span>
              )}
              
              {intro && (
                <span className="inline-flex items-center text-xs text-yellow-600">
                  <Star className="h-3 w-3 mr-1" /> Introtilbud
                </span>
              )}
            </div>
          </div>
        </div>
        
        <div className="space-y-1">
          {features.map((feature, index) => (
            <div key={index} className="flex items-center text-sm text-gray-600">
              <Check className="h-4 w-4 text-brand-green mr-2" />
              <span>{feature}</span>
            </div>
          ))}
        </div>
        
        <div className="text-right">
          <div className="flex items-center justify-end mb-1">
            <p className="text-sm text-gray-500 mr-1">Din estimerede pris</p>
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger>
                  <Info className="h-4 w-4 text-gray-400" />
                </TooltipTrigger>
                <TooltipContent>
                  <p className="text-sm">Beregnet ud fra dit forbrug</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </div>
          
          <div className="text-2xl font-bold">{priceKwh.toFixed(2)} kr. pr. kWh</div>
          <div className="text-sm text-gray-500">{priceMonth} kr. pr. måned</div>
          
          <Button 
            className="mt-4 bg-brand-green hover:bg-opacity-90 text-white rounded-md" 
          >
            Gå til udbyder <ArrowRight className="ml-1 h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  );
};

export default ProviderCard;
