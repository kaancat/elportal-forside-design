
import React, { useState } from 'react';
import { Filter, ArrowDown, ArrowUp } from 'lucide-react';
import ProviderCard from './ProviderCard';

const providers = [
  {
    id: 1,
    logo: "https://placehold.co/200x100/FFFFFF/84db41?text=AURA",
    name: "AURA POWER - Intro",
    priceKwh: 2.15,
    priceMonth: 716,
    badges: ["0 kr. i abonnement resten af året"],
    trustpilotScore: 4.5,
    intro: true,
    verified: true,
    features: [
      "Fremragende kundeservice",
      "4.7 stjerner på Trustpilot",
      "Kvartals- eller månedsregning"
    ]
  },
  {
    id: 2,
    logo: "https://placehold.co/200x100/FFFFFF/2a7d8c?text=gasel",
    name: "El til børspris + 4 øre/kWh",
    priceKwh: 2.16,
    priceMonth: 720,
    badges: ["Slip for acontoregninger"],
    trustpilotScore: 4.3,
    intro: false,
    verified: true,
    features: [
      "El til børspris + 4 øre/kWh",
      "Strøm fra danske solceller",
      "Månedlig betaling"
    ]
  },
  {
    id: 3,
    logo: "https://placehold.co/200x100/FFFFFF/0035a9?text=DCC",
    name: "DCC Energi Flex - Intro",
    priceKwh: 2.20,
    priceMonth: 734,
    badges: ["6 måneders gratis abonnement", "4.7 stjerner på Trustpilot"],
    trustpilotScore: 4.7,
    intro: true,
    verified: true,
    features: [
      "Gratis oprettelse",
      "Eksisteret siden 2012",
      "Månedlig betaling"
    ]
  },
  {
    id: 4,
    logo: "https://placehold.co/200x100/FFFFFF/333333?text=modstrøm",
    name: "NemEl",
    priceKwh: 2.20,
    priceMonth: 734,
    badges: ["Eksisteret siden 2012", "4 stjerner på Trustpilot"],
    trustpilotScore: 4.0,
    intro: false,
    verified: true,
    features: [
      "Gratis oprettelse",
      "Eksisteret siden 2012",
      "Månedlig betaling"
    ]
  }
];

const ProviderList = () => {
  const [sortCriteria, setSortCriteria] = useState<'price' | 'rating'>('price');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc');

  const toggleSort = (criteria: 'price' | 'rating') => {
    if (sortCriteria === criteria) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortCriteria(criteria);
      setSortDirection('asc');
    }
  };

  const sortedProviders = [...providers].sort((a, b) => {
    if (sortCriteria === 'price') {
      return sortDirection === 'asc' 
        ? a.priceKwh - b.priceKwh 
        : b.priceKwh - a.priceKwh;
    } else {
      return sortDirection === 'asc' 
        ? (a.trustpilotScore || 0) - (b.trustpilotScore || 0)
        : (b.trustpilotScore || 0) - (a.trustpilotScore || 0);
    }
  });

  return (
    <section className="py-12 bg-gray-50">
      <div className="container mx-auto px-4">
        <div className="mb-8">
          <h2 className="text-3xl font-bold text-center mb-2">Sammenlign eludbydere</h2>
          <p className="text-center text-gray-600 mb-8">
            Find den bedste elpris for dig baseret på dit forbrug
          </p>
          
          <div className="flex justify-end mb-4">
            <div className="inline-flex items-center bg-white rounded-lg border border-gray-200 px-4 py-2 text-sm">
              <Filter className="h-4 w-4 mr-2 text-gray-500" />
              <span className="mr-2 text-gray-700">Sorter efter:</span>
              <button 
                onClick={() => toggleSort('price')}
                className={`mx-1 px-2 py-1 rounded ${sortCriteria === 'price' ? 'bg-brand-green bg-opacity-10 text-brand-green' : 'text-gray-600'}`}
              >
                Pris 
                {sortCriteria === 'price' && (
                  sortDirection === 'asc' ? 
                    <ArrowUp className="inline h-3 w-3 ml-1" /> : 
                    <ArrowDown className="inline h-3 w-3 ml-1" />
                )}
              </button>
              <button 
                onClick={() => toggleSort('rating')}
                className={`mx-1 px-2 py-1 rounded ${sortCriteria === 'rating' ? 'bg-brand-green bg-opacity-10 text-brand-green' : 'text-gray-600'}`}
              >
                Vurdering
                {sortCriteria === 'rating' && (
                  sortDirection === 'asc' ? 
                    <ArrowUp className="inline h-3 w-3 ml-1" /> : 
                    <ArrowDown className="inline h-3 w-3 ml-1" />
                )}
              </button>
            </div>
          </div>
        </div>
        
        <div className="space-y-4">
          {sortedProviders.map(provider => (
            <ProviderCard key={provider.id} {...provider} />
          ))}
        </div>
      </div>
    </section>
  );
};

export default ProviderList;
