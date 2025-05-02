
import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Check, Star, TrendingDown, ShieldCheck, CalendarCheck, Clock } from 'lucide-react';

// Sample data for providers
const providers = [
  {
    id: 1,
    name: 'Aura Energi',
    logoUrl: 'https://via.placeholder.com/80x40?text=Aura',
    price: 1.89,
    perMonth: 29,
    trustScore: 4.5,
    verified: true,
    introOffer: true,
    freeSubscription: true,
    greenEnergy: true,
    features: ['Ingen binding', 'Fleksibel aftale', 'Kundeservice 24/7']
  },
  {
    id: 2,
    name: 'OK Energi',
    logoUrl: 'https://via.placeholder.com/80x40?text=OK',
    price: 1.95,
    perMonth: 0,
    trustScore: 4.2,
    verified: true,
    freeSubscription: true,
    greenEnergy: false,
    features: ['Ingen binding', 'Lokal service', 'Medlemsfordele']
  },
  {
    id: 3,
    name: 'Gasel',
    logoUrl: 'https://via.placeholder.com/80x40?text=Gasel',
    price: 1.92,
    perMonth: 25,
    trustScore: 4.3,
    verified: true,
    introOffer: true,
    greenEnergy: true,
    features: ['Klimavenlig el', 'Fast lav pris', 'Online kundeportal']
  },
  {
    id: 4,
    name: 'Norlys Energi',
    logoUrl: 'https://via.placeholder.com/80x40?text=Norlys',
    price: 2.05,
    perMonth: 0,
    trustScore: 4.1,
    verified: true,
    freeSubscription: true,
    features: ['Stabil pris', 'Dansk kundeservice', 'Medlemsfordele']
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
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {providers.map((provider) => (
            <Card key={provider.id} className="overflow-hidden transition-all duration-300 hover:shadow-lg border-0 hover:-translate-y-1">
              <div className="bg-brand-dark text-white p-4">
                <div className="flex items-center justify-between">
                  <div className="bg-white rounded-md p-2 flex items-center justify-center">
                    <img src={provider.logoUrl} alt={`${provider.name} logo`} className="h-8 w-auto" />
                  </div>
                  <div className="flex flex-col items-end">
                    <span className="text-xs opacity-80">Estimeret kWh-pris</span>
                    <span className="text-2xl font-bold">{provider.price.toFixed(2)} kr</span>
                  </div>
                </div>
                
                {provider.introOffer && (
                  <div className="mt-3 bg-yellow-400 text-brand-dark rounded-md px-2 py-1 text-xs font-medium inline-flex items-center">
                    <TrendingDown className="h-3 w-3 mr-1" />
                    Introtilbud
                  </div>
                )}
              </div>
              
              <CardContent className="p-4">
                <div className="flex flex-col space-y-3">
                  <div>
                    <h3 className="font-semibold text-lg">{provider.name}</h3>
                    <div className="flex items-center mt-1">
                      {Array.from({length: Math.floor(provider.trustScore)}).map((_, i) => (
                        <Star key={i} className="h-4 w-4 text-yellow-400 fill-yellow-400" />
                      ))}
                      {provider.trustScore % 1 > 0 && (
                        <Star className="h-4 w-4 text-yellow-400 fill-yellow-400" />
                      )}
                      <span className="text-xs ml-1 text-gray-600">{provider.trustScore}/5</span>
                    </div>
                  </div>
                  
                  <div className="flex flex-wrap gap-1">
                    {provider.verified && (
                      <Badge variant="outline" className="bg-gray-100 text-gray-700 flex items-center gap-1 font-normal">
                        <ShieldCheck className="h-3 w-3" /> Verificeret
                      </Badge>
                    )}
                    {provider.freeSubscription && (
                      <Badge variant="outline" className="bg-gray-100 text-gray-700 flex items-center gap-1 font-normal">
                        <Check className="h-3 w-3" /> 0 kr. i abonnement
                      </Badge>
                    )}
                    {provider.greenEnergy && (
                      <Badge variant="outline" className="bg-brand-green bg-opacity-10 text-brand-green flex items-center gap-1 font-normal">
                        <Check className="h-3 w-3" /> Grøn energi
                      </Badge>
                    )}
                  </div>
                  
                  <div className="space-y-1">
                    {provider.features.map((feature, i) => (
                      <div key={i} className="flex items-center text-sm">
                        <Check className="h-3.5 w-3.5 text-brand-green mr-2" />
                        <span>{feature}</span>
                      </div>
                    ))}
                  </div>
                  
                  <div className="pt-2">
                    {provider.perMonth > 0 ? (
                      <p className="text-sm text-gray-600 mb-1">
                        <span className="font-medium">{provider.perMonth} kr.</span> per måned
                      </p>
                    ) : (
                      <p className="text-sm text-gray-600 mb-1 font-medium text-brand-green">
                        <Check className="inline h-3.5 w-3.5 mr-0.5" /> Gratis abonnement
                      </p>
                    )}
                    <Button className="w-full bg-brand-green hover:bg-opacity-90 text-white">
                      Gå til udbyder
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
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
