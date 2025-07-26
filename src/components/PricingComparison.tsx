import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Check, X, Info } from 'lucide-react';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { PortableText } from '@portabletext/react';
import { cn } from '@/lib/utils';

import type { PricingComparisonBlock } from '@/types/sanity';

interface PricingComparisonProps {
  block: PricingComparisonBlock;
}

const PricingComparison: React.FC<PricingComparisonProps> = ({ block }) => {
  const {
    title = 'Fast pris vs. variabel pris',
    subtitle = 'Hvilken pristype passer bedst til dig?',
    headerAlignment = 'center',
    leadingText,
    fixedTitle = 'Fast pris',
    fixedDescription,
    variableTitle = 'Variabel pris',
    variableDescription,
    comparisonItems = [
      {
        feature: 'Forudsigelighed',
        fixed: 'true',
        variable: 'false',
        tooltip: 'Fast pris giver dig samme kWh-pris i hele aftaleperioden'
      },
      {
        feature: 'Følger markedsprisen',
        fixed: 'false',
        variable: 'true',
        tooltip: 'Variabel pris følger spotprisen og ændrer sig time for time'
      },
      {
        feature: 'Ingen bindingsperiode',
        fixed: 'Ofte binding',
        variable: 'true',
        tooltip: 'De fleste variable aftaler har ingen binding'
      },
      {
        feature: 'Potentielle besparelser',
        fixed: 'false',
        variable: 'true',
        tooltip: 'Du kan spare penge ved at flytte forbrug til billige timer'
      },
      {
        feature: 'Budgetsikkerhed',
        fixed: 'true',
        variable: 'false',
        tooltip: 'Med fast pris ved du præcis hvad din el koster'
      }
    ],
    recommendation
  } = block;

  const renderComparisonValue = (value: string) => {
    if (value === 'true') {
      return <Check className="w-5 h-5 text-green-600" />;
    } else if (value === 'false') {
      return <X className="w-5 h-5 text-red-600" />;
    }
    return <span className="text-sm text-gray-600">{value}</span>;
  };

  return (
    <section className="py-16 lg:py-24 bg-white">
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

        {/* Comparison Cards */}
        <div className="grid lg:grid-cols-2 gap-8 max-w-5xl mx-auto mb-12">
          {/* Fixed Price Card */}
          <Card className="border-2 hover:shadow-lg transition-shadow">
            <CardHeader className="bg-blue-50">
              <CardTitle className="text-2xl font-bold text-gray-900">
                {fixedTitle}
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-6">
              {fixedDescription && fixedDescription.length > 0 && (
                <div className="text-gray-700 mb-6">
                  <PortableText 
                    value={fixedDescription}
                    components={{
                      block: {
                        normal: ({ children }) => <p className="mb-2 last:mb-0">{children}</p>
                      }
                    }}
                  />
                </div>
              )}
              <div className="space-y-3">
                <h4 className="font-semibold text-gray-900">Fordele:</h4>
                <ul className="space-y-2">
                  <li className="flex items-center gap-2">
                    <Check className="w-4 h-4 text-green-600 flex-shrink-0" />
                    <span className="text-sm">Samme pris hele perioden</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <Check className="w-4 h-4 text-green-600 flex-shrink-0" />
                    <span className="text-sm">Let at budgettere</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <Check className="w-4 h-4 text-green-600 flex-shrink-0" />
                    <span className="text-sm">Ingen overraskelser</span>
                  </li>
                </ul>
              </div>
            </CardContent>
          </Card>

          {/* Variable Price Card */}
          <Card className="border-2 hover:shadow-lg transition-shadow">
            <CardHeader className="bg-green-50">
              <CardTitle className="text-2xl font-bold text-gray-900">
                {variableTitle}
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-6">
              {variableDescription && variableDescription.length > 0 && (
                <div className="text-gray-700 mb-6">
                  <PortableText 
                    value={variableDescription}
                    components={{
                      block: {
                        normal: ({ children }) => <p className="mb-2 last:mb-0">{children}</p>
                      }
                    }}
                  />
                </div>
              )}
              <div className="space-y-3">
                <h4 className="font-semibold text-gray-900">Fordele:</h4>
                <ul className="space-y-2">
                  <li className="flex items-center gap-2">
                    <Check className="w-4 h-4 text-green-600 flex-shrink-0" />
                    <span className="text-sm">Følger markedsprisen</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <Check className="w-4 h-4 text-green-600 flex-shrink-0" />
                    <span className="text-sm">Kan udnytte lave priser</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <Check className="w-4 h-4 text-green-600 flex-shrink-0" />
                    <span className="text-sm">Ofte ingen binding</span>
                  </li>
                </ul>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Comparison Table */}
        <div className="max-w-4xl mx-auto">
          <Card>
            <CardHeader>
              <CardTitle className="text-xl font-bold text-gray-900">Direkte sammenligning</CardTitle>
            </CardHeader>
            <CardContent>
              <TooltipProvider>
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b">
                        <th className="text-left py-3 px-4 font-semibold text-gray-900">Egenskab</th>
                        <th className="text-center py-3 px-4 font-semibold text-gray-900">{fixedTitle}</th>
                        <th className="text-center py-3 px-4 font-semibold text-gray-900">{variableTitle}</th>
                      </tr>
                    </thead>
                    <tbody>
                      {comparisonItems.map((item, index) => (
                        <tr key={index} className="border-b hover:bg-gray-50">
                          <td className="py-3 px-4">
                            <div className="flex items-center gap-2">
                              <span className="text-gray-700">{item.feature}</span>
                              {item.tooltip && (
                                <Tooltip>
                                  <TooltipTrigger>
                                    <Info className="w-4 h-4 text-gray-400" />
                                  </TooltipTrigger>
                                  <TooltipContent>
                                    <p className="max-w-xs">{item.tooltip}</p>
                                  </TooltipContent>
                                </Tooltip>
                              )}
                            </div>
                          </td>
                          <td className="text-center py-3 px-4">
                            {renderComparisonValue(item.fixed)}
                          </td>
                          <td className="text-center py-3 px-4">
                            {renderComparisonValue(item.variable)}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </TooltipProvider>
            </CardContent>
          </Card>
        </div>

        {/* Recommendation */}
        {recommendation && recommendation.length > 0 && (
          <div className="mt-12 max-w-4xl mx-auto">
            <Card className="bg-blue-50 border-blue-200">
              <CardContent className="pt-6">
                <div className="prose prose-lg max-w-none text-gray-700">
                  <PortableText 
                    value={recommendation}
                    components={{
                      block: {
                        normal: ({ children }) => <p className="mb-2 last:mb-0">{children}</p>
                      }
                    }}
                  />
                </div>
              </CardContent>
            </Card>
          </div>
        )}
      </div>
    </section>
  );
};

export default PricingComparison;