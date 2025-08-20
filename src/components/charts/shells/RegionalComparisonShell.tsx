import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { TrendingUp, TrendingDown } from 'lucide-react';
import { cn } from '@/lib/utils';

import type { RegionalComparisonBlock } from '@/types/sanity';

interface RegionalComparisonShellProps {
  block: RegionalComparisonBlock;
}

/**
 * SSR Shell for RegionalComparison component
 * Provides SEO-optimized static content while client component hydrates
 */
const RegionalComparisonShell: React.FC<RegionalComparisonShellProps> = ({ block }) => {
  const {
    title = 'Regional prisforskel',
    subtitle = 'Danmark er opdelt i to elprisområder',
    headerAlignment = 'center',
    dk1Title = 'DK1 - Vestdanmark',
    dk1PriceIndicator = 'lower',
    dk1Features = ['Jylland', 'Fyn', 'Bornholm'],
    dk2Title = 'DK2 - Østdanmark',
    dk2PriceIndicator = 'higher',
    dk2Features = ['Sjælland', 'Lolland-Falster', 'Møn']
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
        </div>

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

        {/* SEO-friendly text content */}
        <div className="mt-8 text-center max-w-4xl mx-auto">
          <p className="text-sm text-gray-600">
            Danmark er opdelt i to elprisområder (DK1 og DK2) baseret på transmissionsnettet. 
            DK1 omfatter Vestdanmark med Jylland, Fyn og Bornholm, mens DK2 omfatter Østdanmark 
            med Sjælland, Lolland-Falster og Møn. Priserne kan variere mellem områderne 
            afhængigt af udbud og efterspørgsel på el.
          </p>
        </div>
      </div>
    </section>
  );
};

export default RegionalComparisonShell;