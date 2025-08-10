import React from 'react';
import { ArrowRight, Check, X, ExternalLink, Info, Leaf, Wind } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { ElectricityProduct } from '@/types/product';
import { 
  calculatePricePerKwh, 
  calculateMonthlyCost, 
  getPriceBreakdown,
  PRICE_CONSTANTS 
} from '@/services/priceCalculationService';

interface ProviderCardProps {
  product: ElectricityProduct;
  annualConsumption: number;
  spotPrice: number | null;
  networkTariff?: number;
  additionalFees?: {
    greenCertificates?: number;
    tradingCosts?: number;
  };
}

const ProviderCard: React.FC<ProviderCardProps> = ({ product, annualConsumption, spotPrice, networkTariff, additionalFees }) => {
  // Add safety checks
  if (!product) {
    console.error('ProviderCard: product is undefined');
    return null;
  }

  const handleSignupClick = () => {
    if (product.signupLink) {
      window.open(product.signupLink, '_blank', 'noopener,noreferrer');
    }
  };

  // Use the shared calculation service with network tariff and additional fees
  const baseSpotPrice = spotPrice !== null ? spotPrice : PRICE_CONSTANTS.DEFAULT_SPOT_PRICE;
  const pricePerKwh = calculatePricePerKwh(
    baseSpotPrice, 
    product.displayPrice_kWh || 0, 
    networkTariff,
    additionalFees
  );
  const estimatedMonthlyPrice = calculateMonthlyCost(annualConsumption, pricePerKwh, product.displayMonthlyFee || 0);
  const breakdown = getPriceBreakdown(baseSpotPrice, product.displayPrice_kWh || 0, networkTariff, additionalFees);
  

  return (
    <div className={`rounded-xl overflow-hidden transition-all duration-200 ${
      product.isVindstoedProduct 
        ? 'bg-gradient-to-br from-white via-white to-brand-green/5 shadow-lg border-2 border-brand-green/20 ring-1 ring-brand-green/10 hover:shadow-xl relative' 
        : 'bg-white shadow-sm border border-gray-100 hover:shadow-lg'
    }`}>
      {product.isVindstoedProduct && (
        <div className="absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-brand-green/60 via-brand-green to-brand-green/60"></div>
      )}
      <div className="p-8">
        <div className="flex flex-col lg:flex-row lg:items-center gap-8">
          {/* Logo and company info */}
          <div className="flex flex-col space-y-4">
            <div className="flex items-center space-x-6">
              <div className="flex-shrink-0 w-28 h-28 flex items-center justify-center p-3 bg-white rounded-lg border border-gray-100 shadow-sm">
                <img 
                  src={product.supplierLogoURL || '/placeholder.svg'} 
                  alt={`${product.supplierName || 'Ukendt'} logo`} 
                  className="max-w-full max-h-full object-contain" 
                  onError={(e) => {
                    e.currentTarget.src = '/placeholder.svg';
                  }}
                />
              </div>
              
              <div>
                {product.isVindstoedProduct && (
                  <Badge className="bg-brand-green text-white mb-3 font-semibold px-3 py-1">
                    ⭐ Anbefalet partner
                  </Badge>
                )}
                
                <h3 className="font-bold text-xl text-brand-dark mb-1">{product.productName || 'Ukendt produkt'}</h3>
                <p className="text-base text-gray-600 font-medium">{product.supplierName || 'Ukendt leverandør'}</p>
              </div>
            </div>
          </div>
          
          {/* Features Section */}
          <div className="bg-gray-50 p-6 rounded-lg border-l-4 border-l-brand-green lg:flex-1">
            <h4 className="text-sm text-brand-dark uppercase font-bold mb-4 tracking-wide">Inkluderet</h4>
            <div className="space-y-3">
              <div className="flex items-center text-sm">
                {product.isVariablePrice ? (
                  <Check className="h-5 w-5 text-brand-green mr-3 flex-shrink-0" />
                ) : (
                  <X className="h-5 w-5 text-red-500 mr-3 flex-shrink-0" />
                )}
                <span className="text-brand-dark font-medium">Variabel pris</span>
              </div>
              
              <div className="flex items-center text-sm">
                {product.hasNoBinding ? (
                  <Check className="h-5 w-5 text-brand-green mr-3 flex-shrink-0" />
                ) : (
                  <X className="h-5 w-5 text-red-500 mr-3 flex-shrink-0" />
                )}
                <span className="text-brand-dark font-medium">Ingen binding</span>
              </div>
              
              <div className="flex items-center text-sm">
                {product.hasFreeSignup ? (
                  <>
                    <Check className="h-5 w-5 text-brand-green mr-3 flex-shrink-0" />
                    <span className="text-brand-dark font-medium">Gratis oprettelse</span>
                  </>
                ) : (
                  <>
                    <X className="h-5 w-5 text-red-500 mr-3 flex-shrink-0" />
                    <span className="text-brand-dark font-medium">
                      Oprettelse: {product.signupFee ? `${product.signupFee} kr` : 'Gebyr påkrævet'}
                    </span>
                  </>
                )}
              </div>
              
              {/* Green energy indicator */}
              {product.isGreenEnergy && (
                <div className="flex items-center text-sm">
                  {product.isVindstoedProduct ? (
                    <Wind className="h-5 w-5 text-brand-green mr-3 flex-shrink-0" />
                  ) : (
                    <Leaf className="h-5 w-5 text-brand-green mr-3 flex-shrink-0" />
                  )}
                  <span className="text-brand-dark font-medium">100% grøn strøm</span>
                </div>
              )}
            </div>
          </div>
          
          {/* Price and action */}
          <div className="flex flex-col items-end lg:min-w-[220px]">
            <div className="bg-gradient-to-br from-brand-dark/5 to-gray-50 px-6 py-4 rounded-lg border border-gray-100 mb-6 w-full">
              <div className="text-right">
                <div className="text-3xl font-bold text-brand-green mb-1">
                  {estimatedMonthlyPrice.toFixed(0)} kr
                </div>
                <div className="text-sm text-gray-600 mb-1">
                  pr. måned
                </div>
                <div className="text-xs text-gray-500 space-y-1">
                  <div className="text-sm text-brand-dark font-semibold">Estimeret {pricePerKwh.toFixed(2)} kr/kWh</div>
                  
                  <Popover>
                    <PopoverTrigger asChild>
                      <button className="text-xs text-brand-green hover:underline mt-1 inline-flex items-center gap-1">
                        Se prisdetaljer <Info size={14} />
                      </button>
                    </PopoverTrigger>
                    <PopoverContent className="w-64">
                      <div className="space-y-2">
                        <h4 className="font-medium leading-none">Prisudregning</h4>
                        <p className="text-sm text-muted-foreground">Estimat baseret på live spotpris.</p>
                        <div className="text-xs space-y-1 pt-2">
                          <div className="flex justify-between"><span>Spotpris:</span> <span>{breakdown.spotPrice.toFixed(2)} kr.</span></div>
                          <div className="flex justify-between"><span>Leverandør tillæg:</span> <span>{breakdown.providerMarkup.toFixed(2)} kr.</span></div>
                          {breakdown.greenCertificates > 0 && (
                            <div className="flex justify-between"><span>Grønne certifikater:</span> <span>{breakdown.greenCertificates.toFixed(2)} kr.</span></div>
                          )}
                          {breakdown.tradingCosts > 0 && (
                            <div className="flex justify-between"><span>Handelsomkostninger:</span> <span>{breakdown.tradingCosts.toFixed(2)} kr.</span></div>
                          )}
                          <div className="border-t my-1"></div>
                          <div className="flex justify-between text-gray-600"><span>Nettarif ({breakdown.networkTariff.toFixed(2)} kr):</span> <span className="text-gray-600">{breakdown.networkTariff.toFixed(2)} kr.</span></div>
                          <div className="flex justify-between text-gray-600"><span>Systemtarif:</span> <span className="text-gray-600">{PRICE_CONSTANTS.SYSTEM_TARIFF.toFixed(2)} kr.</span></div>
                          <div className="flex justify-between text-gray-600"><span>Transmissionstarif:</span> <span className="text-gray-600">{PRICE_CONSTANTS.TRANSMISSION_FEE.toFixed(2)} kr.</span></div>
                          <div className="flex justify-between"><span>Elafgift:</span> <span>{breakdown.electricityTax.toFixed(2)} kr.</span></div>
                          <div className="border-t my-1"></div>
                          <div className="flex justify-between font-semibold"><span>Pris u. moms:</span> <span>{breakdown.subtotal.toFixed(2)} kr.</span></div>
                          <div className="flex justify-between font-semibold"><span>Moms (25%):</span> <span>{breakdown.vatAmount.toFixed(2)} kr.</span></div>
                          <div className="border-t border-dashed my-1"></div>
                          <div className="flex justify-between font-bold"><span>Total pr. kWh:</span> <span>{breakdown.total.toFixed(2)} kr.</span></div>
                        </div>
                      </div>
                    </PopoverContent>
                  </Popover>
                  
                  <div>Månedligt abonnement: {product.displayMonthlyFee || 0} kr</div>
                </div>
              </div>
            </div>
            
            <Button 
              onClick={handleSignupClick}
              className="bg-brand-green hover:bg-brand-green/90 text-white rounded-lg w-full font-semibold py-3 px-6"
              disabled={!product.signupLink}
            >
              Se nærmere <ExternalLink className="ml-2 h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProviderCard;