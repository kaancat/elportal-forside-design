import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Map, TrendingUp, TrendingDown } from 'lucide-react';
import { PortableText } from '@portabletext/react';
import { cn } from '@/lib/utils';

import type { RegionalComparisonBlock } from '@/types/sanity';

interface RegionalComparisonProps {
  block: RegionalComparisonBlock;
}

const RegionalComparison: React.FC<RegionalComparisonProps> = ({ block }) => {
  const {
    title = 'Regional prisforskel',
    subtitle = 'Danmark er opdelt i to elprisområder',
    headerAlignment = 'center',
    leadingText,
    dk1Title = 'DK1 - Vestdanmark',
    dk1Description,
    dk1PriceIndicator = 'lower',
    dk1Features = ['Jylland', 'Fyn', 'Bornholm'],
    dk2Title = 'DK2 - Østdanmark',
    dk2Description,
    dk2PriceIndicator = 'higher',
    dk2Features = ['Sjælland', 'Lolland-Falster', 'Møn'],
    showMap = true
  } = block;

  const getPriceIndicator = (indicator: string) => {
    switch (indicator) {
      case 'higher':
        return { icon: TrendingUp, color: 'text-red-600', bg: 'bg-red-50', label: 'Typisk højere priser' };
      case 'lower':
        return { icon: TrendingDown, color: 'text-green-600', bg: 'bg-green-50', label: 'Typisk lavere priser' };
      default:
        return { icon: null, color: 'text-gray-600', bg: 'bg-gray-50', label: 'Samme prisniveau' };
    }
  };

  const dk1Indicator = getPriceIndicator(dk1PriceIndicator);
  const dk2Indicator = getPriceIndicator(dk2PriceIndicator);

  return (
    <section className="py-16 lg:py-24 bg-gray-50">
      <div className="container mx-auto px-4">
        {/* Header */}
        <div className={cn(
          "mb-12",
          headerAlignment === 'left' && "text-left",
          headerAlignment === 'center' && "text-center",
          headerAlignment === 'right' && "text-right"
        )}>
          {title && (
            <h2 className={cn(
              "text-3xl lg:text-4xl font-display font-bold text-gray-900 mb-4",
              headerAlignment === 'center' && "mx-auto"
            )}>
              {title}
            </h2>
          )}
          {subtitle && (
            <p className={cn(
              "text-lg text-gray-600 mb-8",
              headerAlignment === 'center' && "max-w-3xl mx-auto"
            )}>
              {subtitle}
            </p>
          )}
          {leadingText && leadingText.length > 0 && (
            <div className={cn(
              "text-base text-gray-700",
              headerAlignment === 'center' && "max-w-4xl mx-auto"
            )}>
              <div className="prose prose-lg max-w-none">
                <PortableText 
                  value={leadingText} 
                  components={{
                    block: {
                      normal: ({ children }) => <p className="mb-4 last:mb-0">{children}</p>
                    }
                  }}
                />
              </div>
            </div>
          )}
        </div>

        {/* Enhanced Denmark Map Visualization (if enabled) */}
        {showMap && (
          <div className="mb-12 flex justify-center">
            <div className="relative bg-white rounded-xl shadow-lg p-8 border border-gray-200">
              <h3 className="text-center text-lg font-semibold text-gray-900 mb-6">Danmarks elprisområder</h3>
              
              {/* SVG Map of Denmark */}
              <svg
                viewBox="0 0 400 300"
                className="w-96 h-72 mx-auto"
                xmlns="http://www.w3.org/2000/svg"
              >
                {/* Background */}
                <rect width="400" height="300" fill="#f8fafc" rx="8" />
                
                {/* Stylized Denmark outline - DK1 (West) */}
                <g>
                  {/* Jutland Peninsula (DK1) */}
                  <path
                    d="M120 80 L120 50 L140 40 L160 45 L180 50 L200 60 L210 80 L220 100 L225 120 L230 140 L235 160 L240 180 L235 200 L230 220 L220 240 L200 250 L180 255 L160 250 L140 245 L120 240 L110 220 L105 200 L100 180 L95 160 L100 140 L105 120 L110 100 L115 80 Z"
                    fill="#3b82f6"
                    fillOpacity="0.7"
                    stroke="#1d4ed8"
                    strokeWidth="2"
                  />
                  {/* Funen (DK1) */}
                  <circle cx="260" cy="180" r="25" fill="#3b82f6" fillOpacity="0.7" stroke="#1d4ed8" strokeWidth="2" />
                  {/* Bornholm (DK1) */}
                  <circle cx="350" cy="120" r="15" fill="#3b82f6" fillOpacity="0.7" stroke="#1d4ed8" strokeWidth="2" />
                </g>
                
                {/* DK2 (East) */}
                <g>
                  {/* Zealand */}
                  <ellipse cx="300" cy="120" rx="35" ry="45" fill="#8b5cf6" fillOpacity="0.7" stroke="#7c3aed" strokeWidth="2" />
                  {/* Lolland-Falster */}
                  <ellipse cx="280" cy="200" rx="20" ry="15" fill="#8b5cf6" fillOpacity="0.7" stroke="#7c3aed" strokeWidth="2" />
                </g>
                
                {/* Labels */}
                <text x="170" y="150" textAnchor="middle" className="fill-white font-bold text-lg">DK1</text>
                <text x="300" y="125" textAnchor="middle" className="fill-white font-bold text-lg">DK2</text>
                
                {/* Legend */}
                <g transform="translate(20, 20)">
                  <rect x="0" y="0" width="160" height="80" fill="white" stroke="#e5e7eb" strokeWidth="1" rx="4" />
                  <text x="80" y="15" textAnchor="middle" className="fill-gray-900 font-semibold text-sm">Prisområder</text>
                  
                  <rect x="10" y="25" width="16" height="12" fill="#3b82f6" fillOpacity="0.7" />
                  <text x="32" y="35" className="fill-gray-700 text-xs">DK1 - Vestdanmark</text>
                  
                  <rect x="10" y="45" width="16" height="12" fill="#8b5cf6" fillOpacity="0.7" />
                  <text x="32" y="55" className="fill-gray-700 text-xs">DK2 - Østdanmark</text>
                </g>
              </svg>
              
              {/* Map Description */}
              <div className="mt-6 text-center">
                <p className="text-sm text-gray-600 max-w-md mx-auto">
                  Danmark er opdelt i to elprisområder baseret på transmissionsnettet. 
                  Priserne kan variere mellem områderne afhængigt af udbud og efterspørgsel.
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Regional Cards */}
        <div className="grid md:grid-cols-2 gap-8 max-w-5xl mx-auto">
          {/* DK1 Card */}
          <Card className="relative overflow-hidden border-2 hover:shadow-lg transition-shadow">
            <div className="absolute top-0 right-0 w-32 h-32 bg-blue-500/10 rounded-bl-full" />
            <CardHeader>
              <CardTitle className="text-2xl font-bold text-gray-900 flex items-center justify-between">
                {dk1Title}
                <Badge className={cn(dk1Indicator.bg, dk1Indicator.color, "border-0")}>
                  {dk1Indicator.icon && <dk1Indicator.icon className="w-4 h-4 mr-1" />}
                  {dk1Indicator.label}
                </Badge>
              </CardTitle>
            </CardHeader>
            <CardContent>
              {dk1Description && dk1Description.length > 0 && (
                <div className="mb-6 text-gray-700">
                  <PortableText 
                    value={dk1Description}
                    components={{
                      block: {
                        normal: ({ children }) => <p className="mb-2 last:mb-0">{children}</p>
                      }
                    }}
                  />
                </div>
              )}
              <div className="space-y-2">
                <h4 className="font-semibold text-gray-900">Omfatter:</h4>
                <div className="flex flex-wrap gap-2">
                  {dk1Features.map((feature, index) => (
                    <Badge key={index} variant="secondary" className="bg-blue-50 text-blue-700 border-blue-200">
                      {feature}
                    </Badge>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* DK2 Card */}
          <Card className="relative overflow-hidden border-2 hover:shadow-lg transition-shadow">
            <div className="absolute top-0 right-0 w-32 h-32 bg-purple-500/10 rounded-bl-full" />
            <CardHeader>
              <CardTitle className="text-2xl font-bold text-gray-900 flex items-center justify-between">
                {dk2Title}
                <Badge className={cn(dk2Indicator.bg, dk2Indicator.color, "border-0")}>
                  {dk2Indicator.icon && <dk2Indicator.icon className="w-4 h-4 mr-1" />}
                  {dk2Indicator.label}
                </Badge>
              </CardTitle>
            </CardHeader>
            <CardContent>
              {dk2Description && dk2Description.length > 0 && (
                <div className="mb-6 text-gray-700">
                  <PortableText 
                    value={dk2Description}
                    components={{
                      block: {
                        normal: ({ children }) => <p className="mb-2 last:mb-0">{children}</p>
                      }
                    }}
                  />
                </div>
              )}
              <div className="space-y-2">
                <h4 className="font-semibold text-gray-900">Omfatter:</h4>
                <div className="flex flex-wrap gap-2">
                  {dk2Features.map((feature, index) => (
                    <Badge key={index} variant="secondary" className="bg-purple-50 text-purple-700 border-purple-200">
                      {feature}
                    </Badge>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </section>
  );
};

export default RegionalComparison;