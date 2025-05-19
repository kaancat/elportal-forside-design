
import React from 'react';
import ProviderCard from './ProviderCard';

const providers = [
  {
    id: 1,
    logo: "https://placehold.co/200x100/FFFFFF/84db41?text=AURA",
    name: "AURA POWER - Intro",
    priceKwh: 2.15,
    priceMonth: 716,
    trustpilotScore: 4.5,
    intro: true,
    verified: true,
    variablePrice: true,
    noBinding: true,
    freeSetup: true
  },
  {
    id: 2,
    logo: "https://placehold.co/200x100/FFFFFF/2a7d8c?text=gasel",
    name: "El til børspris + 4 øre/kWh",
    priceKwh: 2.16,
    priceMonth: 720,
    trustpilotScore: 4.3,
    intro: false,
    verified: true,
    variablePrice: true,
    noBinding: false,
    freeSetup: true
  },
  {
    id: 3,
    logo: "https://placehold.co/200x100/FFFFFF/0035a9?text=DCC",
    name: "DCC Energi Flex - Intro",
    priceKwh: 2.20,
    priceMonth: 734,
    trustpilotScore: 4.7,
    intro: true,
    verified: true,
    variablePrice: false,
    noBinding: true,
    freeSetup: true
  },
  {
    id: 4,
    logo: "https://placehold.co/200x100/FFFFFF/333333?text=modstrøm",
    name: "NemEl",
    priceKwh: 2.20,
    priceMonth: 734,
    trustpilotScore: 4.0,
    intro: false,
    verified: true,
    variablePrice: true,
    noBinding: true,
    freeSetup: false
  }
];

const ProviderList = () => {
  // Sort providers by price (lowest first)
  const sortedProviders = [...providers].sort((a, b) => a.priceKwh - b.priceKwh);

  return (
    <section className="py-12 bg-gray-50">
      <div className="container mx-auto px-4">
        <div className="mb-8">
          <h2 className="text-3xl font-bold text-center mb-2">Sammenlign eludbydere</h2>
          <p className="text-center text-gray-600 mb-8">
            Find den bedste elpris for dig baseret på dit forbrug
          </p>
        </div>
        
        <div className="space-y-4">
          {sortedProviders.map(provider => (
            <ProviderCard 
              key={provider.id} 
              logo={provider.logo}
              name={provider.name}
              priceKwh={provider.priceKwh}
              priceMonth={provider.priceMonth}
              trustpilotScore={provider.trustpilotScore}
              intro={provider.intro}
              verified={provider.verified}
              features={[]}
              variablePrice={provider.variablePrice}
              noBinding={provider.noBinding}
              freeSetup={provider.freeSetup}
            />
          ))}
        </div>
      </div>
    </section>
  );
};

export default ProviderList;
