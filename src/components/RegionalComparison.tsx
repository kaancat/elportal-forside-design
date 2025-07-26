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

        {/* Map Visualization (if enabled) */}
        {showMap && (
          <div className="mb-12 flex justify-center">
            <div className="relative">
              <Map className="w-64 h-64 text-gray-300" />
              <div className="absolute top-1/3 left-1/4 transform -translate-x-1/2 -translate-y-1/2">
                <div className="w-20 h-20 bg-blue-500/20 rounded-full flex items-center justify-center">
                  <span className="text-sm font-bold text-blue-700">DK1</span>
                </div>
              </div>
              <div className="absolute top-1/3 right-1/4 transform translate-x-1/2 -translate-y-1/2">
                <div className="w-20 h-20 bg-purple-500/20 rounded-full flex items-center justify-center">
                  <span className="text-sm font-bold text-purple-700">DK2</span>
                </div>
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