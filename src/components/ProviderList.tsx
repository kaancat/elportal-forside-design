
import React from 'react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Check, Star, TrendingDown, ShieldCheck, Info, BadgePercent } from 'lucide-react';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';

// Sample data for providers
const providers = [
  {
    id: 1,
    name: 'Aura Power',
    logoUrl: 'https://via.placeholder.com/120x60?text=Aura',
    price: 2.15,
    perMonth: 716,
    trustScore: 4.5,
    verified: true,
    introOffer: true,
    freeSubscription: true,
    greenEnergy: true,
    features: ['Mulig betaling', 'Variabel', 'Ingen binding']
  },
  {
    id: 2,
    name: 'Gasel',
    logoUrl: 'https://via.placeholder.com/120x60?text=Gasel',
    price: 2.16,
    perMonth: 720,
    trustScore: 4.3,
    verified: true,
    appTracking: true,
    accountFree: true,
    greenEnergy: true,
    features: ['Mulig betaling', 'Variabel', 'Ingen binding']
  },
  {
    id: 3,
    name: 'DCC Energi Flex',
    logoUrl: 'https://via.placeholder.com/120x60?text=DCC',
    price: 2.20,
    perMonth: 734,
    trustScore: 4.7,
    verified: true,
    introOffer: true,
    freeMonths: 6,
    features: ['Mulig betaling', 'Variabel', 'Ingen binding']
  },
  {
    id: 4,
    name: 'NemEl',
    logoUrl: 'https://via.placeholder.com/120x60?text=ModStrom',
    price: 2.20,
    perMonth: 734,
    trustScore: 4.0,
    verified: true,
    sinceYear: 2012,
    features: ['Mulig betaling', 'Variabel', 'Ingen binding']
  }
];

const ProviderList = () => {
  return (
    <section className="py-16 bg-gray-50">
      <div className="container mx-auto px-4">
        <div className="flex justify-between items-center mb-8">
          <h2 className="text-3xl font-bold text-brand-dark">Populære elaftaler</h2>
          <div className="flex items-center space-x-2">
            <span className="text-sm text-gray-600">Sortér efter:</span>
            <select className="bg-white border border-gray-200 rounded-md py-1 px-3 text-sm focus:outline-none focus:ring-2 focus:ring-brand-green">
              <option>Laveste pris</option>
              <option>Højest rating</option>
              <option>Anbefalede</option>
            </select>
          </div>
        </div>
        
        <div className="flex flex-col space-y-4">
          {providers.map((provider) => (
            <div 
              key={provider.id} 
              className="bg-white rounded-lg shadow-sm border border-gray-100 hover:shadow-md transition-all overflow-hidden"
            >
              {/* Special badges at the top */}
              {(provider.freeSubscription || provider.freeMonths || provider.accountFree || provider.appTracking) && (
                <div className="w-full flex">
                  {provider.freeSubscription && (
                    <div className="bg-yellow-400 text-brand-dark px-4 py-2 font-medium text-sm">
                      0 kr. i abonnement resten af året
                    </div>
                  )}
                  {provider.appTracking && (
                    <div className="bg-brand-dark text-white px-4 py-2 font-medium text-sm">
                      Følg dit forbrug i app
                    </div>
                  )}
                  {provider.accountFree && (
                    <div className="bg-yellow-50 text-yellow-800 px-4 py-2 font-medium text-sm">
                      Slip for acontoregninger
                    </div>
                  )}
                  {provider.freeMonths && (
                    <div className="bg-blue-600 text-white px-4 py-2 font-medium text-sm">
                      {provider.freeMonths} måneders gratis abonnement + {provider.trustScore * 10} stjerner på Trustpilot
                    </div>
                  )}
                  {provider.sinceYear && (
                    <div className="bg-orange-400 text-white px-4 py-2 font-medium text-sm">
                      Eksisteret siden {provider.sinceYear}
                    </div>
                  )}
                  {provider.trustScore && provider.sinceYear && (
                    <div className="bg-brand-dark text-white px-4 py-2 font-medium text-sm">
                      {Math.round(provider.trustScore)} stjerner på Trustpilot
                    </div>
                  )}
                </div>
              )}
              
              <div className="p-6 grid grid-cols-1 md:grid-cols-12 gap-6 items-center">
                {/* Logo and provider info - 3 columns */}
                <div className="md:col-span-3 flex flex-col space-y-2">
                  <div className="flex items-center mb-2">
                    <img src={provider.logoUrl} alt={`${provider.name} logo`} className="h-12 w-auto mr-4" />
                    
                    {provider.verified && (
                      <div className="flex items-center text-green-600 text-xs">
                        <Check className="h-4 w-4 mr-1" /> 
                        <span>Verificeret</span>
                      </div>
                    )}
                  </div>
                  
                  <div>
                    {provider.introOffer && (
                      <div className="text-yellow-600 flex items-center font-medium text-sm mb-1">
                        <TrendingDown className="h-4 w-4 mr-1" />
                        Introtilbud
                      </div>
                    )}
                    <h3 className="font-bold text-xl text-gray-800">{provider.name}</h3>
                  </div>
                </div>
                
                {/* Features section - 5 columns */}
                <div className="md:col-span-5 grid grid-cols-3 gap-4">
                  {provider.features.map((feature, idx) => (
                    <div key={idx} className="text-center">
                      <div className="text-gray-500 text-xs mb-1">
                        {idx === 0 ? "Mdl. betaling" : idx === 1 ? "Pristype" : "Binding"}
                      </div>
                      <div className="font-medium flex items-center justify-center">
                        {feature}
                        {idx === 0 && (
                          <TooltipProvider>
                            <Tooltip>
                              <TooltipTrigger>
                                <Info className="h-4 w-4 ml-1 text-gray-400" />
                              </TooltipTrigger>
                              <TooltipContent>
                                <p>Information om betalingen</p>
                              </TooltipContent>
                            </Tooltip>
                          </TooltipProvider>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
                
                {/* Price section - 2 columns */}
                <div className="md:col-span-2 text-right">
                  <div className="flex flex-col items-end">
                    <div className="text-xs text-gray-500 mb-1 flex items-center">
                      Din estimerede pris
                      <TooltipProvider>
                        <Tooltip>
                          <TooltipTrigger>
                            <Info className="h-3 w-3 ml-1" />
                          </TooltipTrigger>
                          <TooltipContent>
                            <p>Beregnet ud fra dit forbrug</p>
                          </TooltipContent>
                        </Tooltip>
                      </TooltipProvider>
                    </div>
                    <div className="font-bold text-xl">{provider.price.toFixed(2)} kr. pr. kWh</div>
                    <div className="text-sm text-gray-500">{provider.perMonth} kr. pr. måned</div>
                  </div>
                </div>
                
                {/* CTA section - 2 columns */}
                <div className="md:col-span-2 flex flex-col items-end">
                  <Button className="bg-green-500 hover:bg-green-600 text-white mb-2 w-full">
                    Gå til udbyder →
                  </Button>
                  <button className="text-xs text-gray-500 underline hover:text-brand-green">
                    Se detaljer
                  </button>
                </div>
              </div>
              
              {/* Detail button at bottom */}
              <div className="border-t border-gray-100 text-center">
                <button className="text-green-600 hover:text-green-700 py-2 px-4 text-sm font-medium flex items-center justify-center mx-auto">
                  Se detaljer
                  <svg className="w-4 h-4 ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path>
                  </svg>
                </button>
              </div>
            </div>
          ))}
        </div>
        
        <div className="flex justify-center mt-8">
          <Button variant="outline" className="border-brand-dark text-brand-dark hover:bg-brand-dark hover:text-white">
            Se alle elaftaler
          </Button>
        </div>
      </div>
    </section>
  );
};

export default ProviderList;
