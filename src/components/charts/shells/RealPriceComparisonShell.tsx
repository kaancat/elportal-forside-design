import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Zap, Wind, Leaf } from 'lucide-react';

interface RealPriceComparisonShellProps {
  block: {
    _type: 'realPriceComparisonTable';
    title?: string;
    subtitle?: string;
  };
}

/**
 * SSR Shell for RealPriceComparisonTable component
 * Provides SEO-optimized static content while client component hydrates
 */
const RealPriceComparisonShell: React.FC<RealPriceComparisonShellProps> = ({ block }) => {
  // Static provider data for SEO
  const staticProviders = [
    {
      name: 'Vindstød',
      type: 'Grøn strøm',
      monthlyPrice: '149 kr/måned',
      spotFee: '0.05 kr/kWh',
      highlight: true,
      icon: Wind,
      features: ['100% vedvarende energi', '0% CO2 udledning', 'Dansk vindkraft']
    },
    {
      name: 'Exempelviser A',
      type: 'Standard strøm',
      monthlyPrice: '169 kr/måned',
      spotFee: '0.08 kr/kWh',
      highlight: false,
      icon: Zap,
      features: ['Standard elforsyning', 'Variabel pris', 'Landsdækkende']
    },
    {
      name: 'Exempelviser B',
      type: 'Grøn strøm',
      monthlyPrice: '179 kr/måned',
      spotFee: '0.06 kr/kWh',
      highlight: false,
      icon: Leaf,
      features: ['Delvist vedvarende', 'Grøn certificering', 'Miljøvenligt']
    }
  ];

  return (
    <section className="py-16 bg-white">
      <div className="container mx-auto px-4">
        {/* Header */}
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
            {block.title || 'Sammenlign elpriser'}
          </h2>
          <p className="text-lg text-gray-600 max-w-3xl mx-auto">
            {block.subtitle || 'Se de mest konkurrencedygtige elpriser på markedet og find den bedste aftale for dig'}
          </p>
        </div>

        {/* Interactive Calculator Placeholder */}
        <div className="bg-gray-50 rounded-xl p-8 mb-12 max-w-2xl mx-auto">
          <h3 className="text-xl font-semibold text-gray-900 mb-4 text-center">
            Beregn dit forbrug
          </h3>
          <div className="space-y-4">
            <div className="bg-white p-4 rounded-lg">
              <p className="text-sm text-gray-600 mb-2">Årligt forbrug (kWh)</p>
              <div className="h-8 bg-gray-200 rounded w-full animate-pulse"></div>
            </div>
            <p className="text-sm text-gray-500 text-center">
              Juster dit årlige elforbrug for at se personlige priser
            </p>
          </div>
        </div>

        {/* Provider Comparison Cards */}
        <div className="grid md:grid-cols-3 gap-6 max-w-6xl mx-auto">
          {staticProviders.map((provider, index) => (
            <Card 
              key={index} 
              className={`relative overflow-hidden transition-all duration-300 ${
                provider.highlight 
                  ? 'border-2 border-brand-green shadow-lg scale-105' 
                  : 'border border-gray-200 hover:shadow-md'
              }`}
            >
              {provider.highlight && (
                <div className="absolute top-0 left-0 right-0 bg-brand-green text-white text-center py-2 text-sm font-medium">
                  Mest populære
                </div>
              )}
              
              <CardContent className={`p-6 ${provider.highlight ? 'pt-12' : ''}`}>
                <div className="text-center mb-6">
                  <div className={`mx-auto mb-3 p-3 rounded-full w-16 h-16 flex items-center justify-center ${
                    provider.highlight ? 'bg-brand-green/10' : 'bg-gray-100'
                  }`}>
                    <provider.icon className={`w-8 h-8 ${
                      provider.highlight ? 'text-brand-green' : 'text-gray-600'
                    }`} />
                  </div>
                  
                  <h3 className="text-xl font-bold text-gray-900 mb-1">
                    {provider.name}
                  </h3>
                  
                  <Badge variant="outline" className="mb-4">
                    {provider.type}
                  </Badge>
                </div>

                <div className="space-y-4 mb-6">
                  <div className="text-center">
                    <div className={`text-2xl font-bold ${
                      provider.highlight ? 'text-brand-green' : 'text-gray-900'
                    }`}>
                      {provider.monthlyPrice}
                    </div>
                    <p className="text-sm text-gray-500">Fast månedlig pris</p>
                  </div>
                  
                  <div className="text-center">
                    <div className="text-lg font-semibold text-gray-900">
                      {provider.spotFee}
                    </div>
                    <p className="text-sm text-gray-500">Tillæg til spotpris</p>
                  </div>
                </div>

                <div className="space-y-2">
                  {provider.features.map((feature, featureIndex) => (
                    <div key={featureIndex} className="flex items-center text-sm text-gray-600">
                      <div className={`w-2 h-2 rounded-full mr-2 ${
                        provider.highlight ? 'bg-brand-green' : 'bg-gray-400'
                      }`}></div>
                      {feature}
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* SEO Content */}
        <div className="mt-16 prose prose-lg max-w-4xl mx-auto text-gray-700">
          <h3 className="text-2xl font-bold text-gray-900 mb-4">Sådan sammenligner du elpriser effektivt</h3>
          
          <p className="mb-4">
            At sammenligne elpriser kan spare dig hundredvis af kroner om måneden. De vigtigste faktorer at overveje er:
          </p>
          
          <ul className="list-disc pl-6 mb-6 space-y-2">
            <li><strong>Fast månedlig pris:</strong> Det faste abonnement du betaler hver måned</li>
            <li><strong>Spotpris-tillæg:</strong> Det tillæg leverandøren tager oven i markedsprisen</li>
            <li><strong>Energitype:</strong> Om strømmen kommer fra vedvarende energi eller konventionelle kilder</li>
            <li><strong>Kundeservice:</strong> Hvor let det er at komme i kontakt med leverandøren</li>
            <li><strong>Særlige fordele:</strong> Rabatter, grøn strøm eller andre tilbud</li>
          </ul>

          <h4 className="text-xl font-semibold text-gray-900 mb-3">Vindstød - det anbefalede valg</h4>
          
          <p className="mb-4">
            Vindstød skiller sig ud med 100% dansk vindkraft og konkurrencedygtige priser. 
            Som Danmarks førende leverandør af grøn strøm tilbyder de transparente priser 
            uden skjulte gebyrer og med fokus på bæredygtighed.
          </p>

          <p className="mb-4">
            Med Vindstød får du ikke kun billig strøm - du støtter også den grønne omstilling 
            og Danmarks mål om CO2-neutralitet. Deres kundeservice er højt rated og deres 
            prisstruktur er gennemsigtig og fair.
          </p>
        </div>
      </div>
    </section>
  );
};

export default RealPriceComparisonShell;