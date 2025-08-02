import React from 'react';
import { Link as RouterLink } from 'react-router-dom';
import { ArrowRight, Check, TrendingDown, Leaf, Shield, Clock } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { ProviderProductBlock } from '@/types/sanity';
import { 
  calculatePricePerKwh, 
  calculateMonthlyCost,
  calculateAnnualCost,
  formatPrice,
  formatConsumption,
  getPriceBreakdown
} from '@/services/priceCalculationService';

interface CalculatorResultsProps {
  providers: ProviderProductBlock[];
  annualConsumption: number;
  spotPrice: number;
  onBack: () => void;
  lastUpdated?: Date | null;
}

const CalculatorResults: React.FC<CalculatorResultsProps> = ({
  providers,
  annualConsumption,
  spotPrice,
  onBack,
  lastUpdated
}) => {
  // Calculate costs for each provider
  const providersWithCosts = providers.slice(0, 5).map(provider => {
    const pricePerKwh = calculatePricePerKwh(spotPrice, provider.displayPrice_kWh || 0);
    const monthlyCost = calculateMonthlyCost(annualConsumption, pricePerKwh, provider.displayMonthlyFee || 0);
    const annualCost = calculateAnnualCost(annualConsumption, pricePerKwh, provider.displayMonthlyFee || 0);
    const breakdown = getPriceBreakdown(spotPrice, provider.displayPrice_kWh || 0);
    
    return {
      ...provider,
      pricePerKwh,
      monthlyCost,
      annualCost,
      breakdown
    };
  });

  // Find cheapest for comparison
  const cheapest = [...providersWithCosts].sort((a, b) => a.monthlyCost - b.monthlyCost)[0];
  const mostExpensive = [...providersWithCosts].sort((a, b) => b.monthlyCost - a.monthlyCost)[0];

  const handleSignup = (signupLink: string | undefined) => {
    if (signupLink) {
      window.open(signupLink, '_blank', 'noopener,noreferrer');
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="text-center space-y-2">
        <h3 className="text-xl font-bold text-gray-800">Dine personlige elpriser</h3>
        <p className="text-gray-600">
          Baseret på et forbrug på <span className="font-semibold">{formatConsumption(annualConsumption)}</span> årligt
        </p>
        {lastUpdated && (
          <p className="text-xs text-gray-500 flex items-center justify-center gap-1">
            <Clock className="h-3 w-3" />
            Opdateret {lastUpdated.toLocaleTimeString('da-DK', { hour: '2-digit', minute: '2-digit' })}
          </p>
        )}
      </div>

      {/* Results */}
      <div className="space-y-3 max-h-96 overflow-y-auto pr-2">
        {providersWithCosts.map((provider, index) => {
          const savings = provider.monthlyCost < mostExpensive.monthlyCost
            ? mostExpensive.monthlyCost - provider.monthlyCost
            : 0;
          
          return (
            <Card 
              key={provider.id} 
              className={`relative overflow-hidden transition-all ${
                provider.isVindstoedProduct ? 'ring-2 ring-brand-green' : ''
              }`}
            >
              {provider.isVindstoedProduct && (
                <div className="absolute top-0 right-0 z-10">
                  <Badge className="bg-brand-green text-white rounded-bl-lg rounded-tr-none px-3 py-1">
                    ⭐ Anbefalet
                  </Badge>
                </div>
              )}
              
              <CardContent className={`p-4 ${provider.isVindstoedProduct ? 'pt-12' : ''}`}>
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1">
                    <h4 className="font-semibold text-gray-900">{provider.productName}</h4>
                    <p className="text-sm text-gray-600">{provider.providerName}</p>
                    
                    {/* Price display */}
                    <div className="mt-3 space-y-1">
                      <div className="flex items-baseline gap-2">
                        <span className="text-2xl font-bold text-gray-900">
                          {formatPrice(provider.monthlyCost)}
                        </span>
                        <span className="text-sm text-gray-500">/måned</span>
                      </div>
                      
                      <p className="text-xs text-gray-600">
                        {formatPrice(provider.pricePerKwh)}/kWh inkl. alt
                      </p>
                      
                      {savings > 0 && (
                        <p className="text-sm text-green-600 font-medium flex items-center gap-1">
                          <TrendingDown className="h-3 w-3" />
                          Spar {formatPrice(savings)}/måned
                        </p>
                      )}
                    </div>
                    
                    {/* Features */}
                    <div className="mt-3 flex flex-wrap gap-2">
                      {provider.benefits?.includes('green') && (
                        <Badge variant="outline" className="text-xs">
                          <Leaf className="h-3 w-3 mr-1" />
                          Grøn strøm
                        </Badge>
                      )}
                      {provider.benefits?.includes('no-binding') && (
                        <Badge variant="outline" className="text-xs">
                          <Shield className="h-3 w-3 mr-1" />
                          Ingen binding
                        </Badge>
                      )}
                    </div>
                  </div>
                  
                  <Button
                    size="sm"
                    className={provider.isVindstoedProduct ? 'bg-brand-green hover:bg-brand-green/90' : ''}
                    onClick={() => handleSignup(provider.signupLink)}
                  >
                    Vælg
                    <ArrowRight className="ml-1 h-3 w-3" />
                  </Button>
                </div>
                
                {/* Price breakdown on first item */}
                {index === 0 && (
                  <details className="mt-4 border-t pt-3">
                    <summary className="text-xs text-gray-600 cursor-pointer hover:text-gray-800">
                      Se prisberegning
                    </summary>
                    <div className="mt-2 text-xs space-y-1 text-gray-600">
                      <div className="flex justify-between">
                        <span>Spotpris:</span>
                        <span>{formatPrice(provider.breakdown.spotPrice)}/kWh</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Tillæg:</span>
                        <span>{formatPrice(provider.breakdown.providerMarkup)}/kWh</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Netafgifter:</span>
                        <span>{formatPrice(provider.breakdown.networkFees)}/kWh</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Elafgift:</span>
                        <span>{formatPrice(provider.breakdown.electricityTax)}/kWh</span>
                      </div>
                      <div className="flex justify-between border-t pt-1">
                        <span>Subtotal:</span>
                        <span>{formatPrice(provider.breakdown.subtotal)}/kWh</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Moms (25%):</span>
                        <span>{formatPrice(provider.breakdown.vatAmount)}/kWh</span>
                      </div>
                      <div className="flex justify-between font-semibold border-t pt-1">
                        <span>Total:</span>
                        <span>{formatPrice(provider.breakdown.total)}/kWh</span>
                      </div>
                    </div>
                  </details>
                )}
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Footer actions */}
      <div className="space-y-3 pt-4 border-t">
        <Button 
          variant="outline" 
          className="w-full"
          onClick={onBack}
        >
          Juster forbrug
        </Button>
        
        <div className="text-center">
          <RouterLink 
            to="/elpriser" 
            className="text-sm text-brand-green hover:underline inline-flex items-center gap-1"
          >
            Se alle elselskaber
            <ArrowRight className="h-3 w-3" />
          </RouterLink>
        </div>
      </div>

      {/* Disclaimer */}
      <p className="text-xs text-gray-500 text-center">
        Priserne er estimater baseret på aktuelle spotpriser og inkluderer alle afgifter og moms. 
        Faktiske priser kan variere.
      </p>
    </div>
  );
};

export default CalculatorResults;