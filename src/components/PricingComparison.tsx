import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Check, X, Info } from 'lucide-react';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { PortableText } from '@portabletext/react';
import { cn } from '@/lib/utils';
import { getPortableTextComponents } from '@/lib/portableTextConfig';

import type { PricingComparisonBlock } from '@/types/sanity';

interface PricingComparisonProps {
  block: PricingComparisonBlock;
}

const PricingComparison: React.FC<PricingComparisonProps> = ({ block }) => {
  // Get shared PortableText components with link handling
  const portableTextComponents = getPortableTextComponents();

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
                    ...portableTextComponents,
                    block: {
                      normal: ({ children }) => <p className="mb-4 last:mb-0">{children}</p>
                    }
                  }}
                />
              </div>
            </div>
          )}
        </div>

        {/* Enhanced Comparison Cards */}
        <div className="grid lg:grid-cols-2 gap-8 max-w-6xl mx-auto mb-16">
          {/* Fixed Price Card */}
          <Card className="relative overflow-hidden border-0 shadow-xl hover:shadow-2xl transition-all duration-300 bg-gradient-to-br from-blue-50 to-blue-100">
            <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-blue-500 to-blue-600"></div>
            <CardHeader className="pb-4">
              <div className="flex items-center justify-between">
                <CardTitle className="text-2xl font-bold text-gray-900">
                  {fixedTitle}
                </CardTitle>
                <div className="w-12 h-12 bg-blue-500 rounded-full flex items-center justify-center">
                  <Check className="w-6 h-6 text-white" />
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-6">
              {fixedDescription && fixedDescription.length > 0 && (
                <div className="text-gray-700">
                  <PortableText
                    value={fixedDescription}
                    components={{
                      ...portableTextComponents,
                      block: {
                        normal: ({ children }) => <p className="mb-3 last:mb-0 leading-relaxed">{children}</p>
                      }
                    }}
                  />
                </div>
              )}

              <div className="space-y-4">
                <h4 className="font-bold text-gray-900 text-lg border-b border-blue-200 pb-2">Vigtigste fordele</h4>
                <div className="grid gap-3">
                  <div className="flex items-start gap-3 p-3 bg-white rounded-lg shadow-sm">
                    <div className="w-6 h-6 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                      <Check className="w-4 h-4 text-blue-600" />
                    </div>
                    <div>
                      <span className="font-medium text-gray-900">Forudsigelighed</span>
                      <p className="text-sm text-gray-600 mt-1">Samme kWh-pris i hele aftaleperioden</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3 p-3 bg-white rounded-lg shadow-sm">
                    <div className="w-6 h-6 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                      <Check className="w-4 h-4 text-blue-600" />
                    </div>
                    <div>
                      <span className="font-medium text-gray-900">Budgetsikkerhed</span>
                      <p className="text-sm text-gray-600 mt-1">Let at planlægge din økonomi</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3 p-3 bg-white rounded-lg shadow-sm">
                    <div className="w-6 h-6 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                      <Check className="w-4 h-4 text-blue-600" />
                    </div>
                    <div>
                      <span className="font-medium text-gray-900">Stabilitet</span>
                      <p className="text-sm text-gray-600 mt-1">Ingen pludselige prisstigninger</p>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Variable Price Card */}
          <Card className="relative overflow-hidden border-0 shadow-xl hover:shadow-2xl transition-all duration-300 bg-gradient-to-br from-green-50 to-green-100">
            <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-green-500 to-green-600"></div>
            <CardHeader className="pb-4">
              <div className="flex items-center justify-between">
                <CardTitle className="text-2xl font-bold text-gray-900">
                  {variableTitle}
                </CardTitle>
                <div className="w-12 h-12 bg-green-500 rounded-full flex items-center justify-center">
                  <Check className="w-6 h-6 text-white" />
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-6">
              {variableDescription && variableDescription.length > 0 && (
                <div className="text-gray-700">
                  <PortableText
                    value={variableDescription}
                    components={{
                      ...portableTextComponents,
                      block: {
                        normal: ({ children }) => <p className="mb-3 last:mb-0 leading-relaxed">{children}</p>
                      }
                    }}
                  />
                </div>
              )}

              <div className="space-y-4">
                <h4 className="font-bold text-gray-900 text-lg border-b border-green-200 pb-2">Vigtigste fordele</h4>
                <div className="grid gap-3">
                  <div className="flex items-start gap-3 p-3 bg-white rounded-lg shadow-sm">
                    <div className="w-6 h-6 bg-green-100 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                      <Check className="w-4 h-4 text-green-600" />
                    </div>
                    <div>
                      <span className="font-medium text-gray-900">Markedspriser</span>
                      <p className="text-sm text-gray-600 mt-1">Følger spotprisen time for time</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3 p-3 bg-white rounded-lg shadow-sm">
                    <div className="w-6 h-6 bg-green-100 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                      <Check className="w-4 h-4 text-green-600" />
                    </div>
                    <div>
                      <span className="font-medium text-gray-900">Besparelsespotentiale</span>
                      <p className="text-sm text-gray-600 mt-1">Udnyt lave priser om natten</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3 p-3 bg-white rounded-lg shadow-sm">
                    <div className="w-6 h-6 bg-green-100 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                      <Check className="w-4 h-4 text-green-600" />
                    </div>
                    <div>
                      <span className="font-medium text-gray-900">Fleksibilitet</span>
                      <p className="text-sm text-gray-600 mt-1">Ofte ingen bindingsperiode</p>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Modern Comparison Table */}
        <div className="max-w-5xl mx-auto">
          <Card className="border-0 shadow-xl">
            <CardHeader className="bg-gradient-to-r from-gray-50 to-gray-100 border-b border-gray-200">
              <CardTitle className="text-2xl font-bold text-gray-900 text-center">Detaljeret sammenligning</CardTitle>
              <p className="text-gray-600 text-center mt-2">Se forskellen side om side</p>
            </CardHeader>
            <CardContent className="p-0">
              <TooltipProvider>
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="bg-gray-100 border-b-2 border-gray-200">
                        <th className="text-left py-5 px-6 font-bold text-gray-900 text-lg">Egenskab</th>
                        <th className="text-center py-5 px-6 font-bold text-blue-700 text-lg bg-blue-50">{fixedTitle}</th>
                        <th className="text-center py-5 px-6 font-bold text-green-700 text-lg bg-green-50">{variableTitle}</th>
                      </tr>
                    </thead>
                    <tbody>
                      {comparisonItems.map((item, index) => (
                        <tr key={index} className={cn(
                          "border-b border-gray-200 hover:bg-gray-50 transition-colors",
                          index % 2 === 0 ? "bg-white" : "bg-gray-25"
                        )}>
                          <td className="py-5 px-6">
                            <div className="flex items-center gap-3">
                              <span className="font-medium text-gray-900 text-base">{item.feature}</span>
                              {item.tooltip && (
                                <Tooltip>
                                  <TooltipTrigger>
                                    <Info className="w-4 h-4 text-gray-400 hover:text-gray-600 transition-colors" />
                                  </TooltipTrigger>
                                  <TooltipContent>
                                    <p className="max-w-xs text-sm">{item.tooltip}</p>
                                  </TooltipContent>
                                </Tooltip>
                              )}
                            </div>
                          </td>
                          <td className="text-center py-5 px-6 bg-blue-25">
                            <div className="flex justify-center items-center h-8">
                              {item.fixed === 'true' ? (
                                <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                                  <Check className="w-5 h-5 text-blue-600" />
                                </div>
                              ) : item.fixed === 'false' ? (
                                <div className="w-8 h-8 bg-red-100 rounded-full flex items-center justify-center">
                                  <X className="w-5 h-5 text-red-600" />
                                </div>
                              ) : (
                                <div className="bg-orange-100 px-3 py-2 rounded-full">
                                  <span className="text-sm font-medium text-orange-700">{item.fixed}</span>
                                </div>
                              )}
                            </div>
                          </td>
                          <td className="text-center py-5 px-6 bg-green-25">
                            <div className="flex justify-center items-center h-8">
                              {item.variable === 'true' ? (
                                <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                                  <Check className="w-5 h-5 text-green-600" />
                                </div>
                              ) : item.variable === 'false' ? (
                                <div className="w-8 h-8 bg-red-100 rounded-full flex items-center justify-center">
                                  <X className="w-5 h-5 text-red-600" />
                                </div>
                              ) : (
                                <div className="bg-orange-100 px-3 py-2 rounded-full">
                                  <span className="text-sm font-medium text-orange-700">{item.variable}</span>
                                </div>
                              )}
                            </div>
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

        {/* Enhanced Recommendation */}
        {recommendation && recommendation.length > 0 && (
          <div className="mt-16 max-w-4xl mx-auto">
            <Card className="bg-gradient-to-br from-amber-50 to-orange-50 border-0 shadow-xl">
              <CardHeader className="text-center pb-4">
                <div className="w-16 h-16 bg-amber-500 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Info className="w-8 h-8 text-white" />
                </div>
                <CardTitle className="text-2xl font-bold text-gray-900">Vores anbefaling</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="prose prose-lg max-w-none text-gray-800 text-center">
                  <PortableText
                    value={recommendation}
                    components={{
                      ...portableTextComponents,
                      block: {
                        normal: ({ children }) => <p className="mb-4 last:mb-0 text-lg leading-relaxed">{children}</p>
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