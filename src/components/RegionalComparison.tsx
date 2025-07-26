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
                viewBox="0 0 500 400"
                className="w-full max-w-lg h-auto mx-auto"
                xmlns="http://www.w3.org/2000/svg"
              >
                {/* Background */}
                <rect width="500" height="400" fill="#f8fafc" rx="8" />
                
                {/* DK1 (West) - Blue */}
                <g>
                  {/* Jutland Peninsula (Jylland) */}
                  <path
                    d="M 150,50 L 170,40 L 180,35 L 185,40 L 190,38 L 195,42 L 200,45 L 205,50 L 210,60 L 215,70 L 220,85 L 225,100 L 228,115 L 230,130 L 232,145 L 235,160 L 238,175 L 240,190 L 242,205 L 240,220 L 238,235 L 235,250 L 230,265 L 225,275 L 220,285 L 210,295 L 200,300 L 190,303 L 180,305 L 170,303 L 160,300 L 150,295 L 140,285 L 135,275 L 130,260 L 125,245 L 122,230 L 120,215 L 118,200 L 116,185 L 115,170 L 114,155 L 115,140 L 118,125 L 120,110 L 125,95 L 130,80 L 135,65 L 140,55 L 145,52 Z"
                    fill="#3b82f6"
                    fillOpacity="0.8"
                    stroke="#2563eb"
                    strokeWidth="2"
                  />
                  
                  {/* Funen (Fyn) */}
                  <path
                    d="M 265,200 L 275,195 L 285,195 L 295,200 L 300,210 L 300,220 L 295,230 L 285,235 L 275,235 L 265,230 L 260,220 L 260,210 Z"
                    fill="#3b82f6"
                    fillOpacity="0.8"
                    stroke="#2563eb"
                    strokeWidth="2"
                  />
                </g>
                
                {/* DK2 (East) - Purple */}
                <g>
                  {/* Zealand (Sjælland) */}
                  <path
                    d="M 320,140 L 330,135 L 340,135 L 350,140 L 360,145 L 365,155 L 370,165 L 372,175 L 370,185 L 365,195 L 360,205 L 350,210 L 340,212 L 330,210 L 320,205 L 315,195 L 310,185 L 308,175 L 310,165 L 315,155 Z"
                    fill="#8b5cf6"
                    fillOpacity="0.8"
                    stroke="#7c3aed"
                    strokeWidth="2"
                  />
                  
                  {/* Lolland */}
                  <path
                    d="M 310,240 L 320,238 L 330,240 L 335,245 L 335,250 L 330,255 L 320,257 L 310,255 L 305,250 L 305,245 Z"
                    fill="#8b5cf6"
                    fillOpacity="0.8"
                    stroke="#7c3aed"
                    strokeWidth="2"
                  />
                  
                  {/* Falster */}
                  <path
                    d="M 345,250 L 350,248 L 355,250 L 358,255 L 355,260 L 350,262 L 345,260 L 342,255 Z"
                    fill="#8b5cf6"
                    fillOpacity="0.8"
                    stroke="#7c3aed"
                    strokeWidth="2"
                  />
                  
                  {/* Møn */}
                  <path
                    d="M 365,230 L 370,228 L 375,232 L 375,237 L 370,240 L 365,238 L 362,234 Z"
                    fill="#8b5cf6"
                    fillOpacity="0.8"
                    stroke="#7c3aed"
                    strokeWidth="2"
                  />
                </g>
                
                {/* Bornholm (DK1 - technically, but often shown separately) */}
                <g>
                  <circle cx="430" cy="120" r="18" fill="#3b82f6" fillOpacity="0.8" stroke="#2563eb" strokeWidth="2" />
                  <text x="430" y="155" textAnchor="middle" className="fill-gray-700 text-xs font-medium">Bornholm</text>
                </g>
                
                {/* Region Labels */}
                <text x="180" y="180" textAnchor="middle" className="fill-white font-bold text-xl drop-shadow-lg">DK1</text>
                <text x="340" y="175" textAnchor="middle" className="fill-white font-bold text-xl drop-shadow-lg">DK2</text>
                
                {/* Legend */}
                <g transform="translate(25, 25)">
                  <rect x="0" y="0" width="180" height="90" fill="white" fillOpacity="0.95" stroke="#e5e7eb" strokeWidth="1" rx="6" />
                  <text x="90" y="20" textAnchor="middle" className="fill-gray-900 font-semibold text-base">Elprisområder</text>
                  
                  <rect x="15" y="35" width="20" height="14" fill="#3b82f6" fillOpacity="0.8" rx="2" />
                  <text x="42" y="46" className="fill-gray-700 text-sm">DK1 - Vestdanmark</text>
                  
                  <rect x="15" y="58" width="20" height="14" fill="#8b5cf6" fillOpacity="0.8" rx="2" />
                  <text x="42" y="69" className="fill-gray-700 text-sm">DK2 - Østdanmark</text>
                </g>
                
                {/* Small info text */}
                <text x="250" y="380" textAnchor="middle" className="fill-gray-500 text-xs">
                  Kortet viser Danmarks to elprisområder
                </text>
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