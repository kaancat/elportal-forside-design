
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
      <div className="p-3 sm:p-4 md:p-6 lg:p-8">
        <div className="flex flex-col gap-3 sm:gap-4 md:gap-6 lg:flex-row lg:items-center lg:gap-8">
          {/* Logo and company info */}
          <div className="flex flex-col space-y-3">
            <div className="flex items-start space-x-3 sm:space-x-4 md:space-x-6">
              <div className="flex-shrink-0 w-14 h-14 sm:w-16 sm:h-16 md:w-20 md:h-20 lg:w-28 lg:h-28 flex items-center justify-center p-1.5 sm:p-2 md:p-3 bg-white rounded-lg border border-gray-100 shadow-sm">
                <img 
                  src={product.supplierLogoURL || '/placeholder.svg'} 
                  alt={`${product.supplierName || 'Ukendt'} logo`} 
                  className="max-w-full max-h-full object-contain" 
                  onError={(e) => {
                    e.currentTarget.src = '/placeholder.svg';
                  }}
                />
              </div>
              
              <div className="flex-1">
                {product.isVindstoedProduct && (
                  <Badge className="bg-brand-green text-white mb-2 font-semibold px-2 py-0.5 text-xs sm:text-sm sm:px-3 sm:py-1">
                    ⭐ Anbefalet
                  </Badge>
                )}
                
                <h3 className="font-bold text-base sm:text-lg md:text-xl text-brand-dark mb-0.5 sm:mb-1">{product.productName || 'Ukendt produkt'}</h3>
                <p className="text-sm sm:text-base text-gray-600 font-medium">{product.supplierName || 'Ukendt leverandør'}</p>
              </div>
            </div>
          </div>
          
          {/* Features Section - Mobile optimized grid */}
          <div className="bg-gray-50 p-3 sm:p-4 md:p-6 rounded-lg border-l-4 border-l-brand-green lg:flex-1">
            <div className="grid grid-cols-2 gap-2 sm:gap-3 md:block md:space-y-3">
              <div className="flex items-start text-xs sm:text-sm">
                {product.isVariablePrice ? (
                  <Check className="h-4 w-4 sm:h-5 sm:w-5 text-brand-green mr-2 sm:mr-3 flex-shrink-0 mt-0.5" />
                ) : (
                  <X className="h-4 w-4 sm:h-5 sm:w-5 text-red-500 mr-2 sm:mr-3 flex-shrink-0 mt-0.5" />
                )}
                <span className="text-brand-dark font-medium leading-tight">Spotpristillæg<br/><span className="text-[10px] sm:text-xs text-gray-600">{product.displayPrice_kWh?.toFixed(2) || '0.00'} kr/kWh</span></span>
              </div>
              
              <div className="flex items-start text-xs sm:text-sm">
                {product.hasNoBinding ? (
                  <Check className="h-4 w-4 sm:h-5 sm:w-5 text-brand-green mr-2 sm:mr-3 flex-shrink-0 mt-0.5" />
                ) : (
                  <X className="h-4 w-4 sm:h-5 sm:w-5 text-red-500 mr-2 sm:mr-3 flex-shrink-0 mt-0.5" />
                )}
                <span className="text-brand-dark font-medium leading-tight">Abonnement<br/><span className="text-[10px] sm:text-xs text-gray-600">{product.displayMonthlyFee || 0} kr/md</span></span>
              </div>
              
              {/* Green energy indicator */}
              {product.isGreenEnergy && (
                <div className="flex items-start text-xs sm:text-sm col-span-2 md:col-span-1">
                  {product.isVindstoedProduct ? (
                    <Wind className="h-4 w-4 sm:h-5 sm:w-5 text-brand-green mr-2 sm:mr-3 flex-shrink-0 mt-0.5" />
                  ) : (
                    <Leaf className="h-4 w-4 sm:h-5 sm:w-5 text-brand-green mr-2 sm:mr-3 flex-shrink-0 mt-0.5" />
                  )}
                  <span className="text-brand-dark font-medium leading-tight">Energi (7 dage)<br/><span className="text-[10px] sm:text-xs text-gray-600">{((annualConsumption / 365) * 7).toFixed(0)} kr</span></span>
                </div>
              )}
            </div>
          </div>
          
          {/* Price and action - Mobile optimized */}
          <div className="flex flex-col items-stretch w-full lg:w-auto lg:min-w-[220px]">
            <div className="flex items-center justify-between mb-3 sm:mb-4 lg:block">
              <div className="text-left lg:text-right">
                <div className="text-2xl sm:text-3xl font-bold text-brand-dark mb-0.5 sm:mb-1">
                  {((annualConsumption / 365) * 7 * pricePerKwh + (product.displayMonthlyFee || 0) * 7 / 30).toFixed(0)} kr
                </div>
                <div className="text-xs sm:text-sm text-gray-600">
                  for 7 dage
                </div>
                <div className="text-xs text-gray-500 mt-1">
                  <span className="text-brand-green">+1 kr</span>
                </div>
              </div>
            </div>
            
            <Popover>
              <PopoverTrigger asChild>
                <button className="text-xs text-brand-green hover:underline mb-3 inline-flex items-center gap-1 lg:ml-auto">
                  Se prisdetaljer <Info size={12} />
                </button>
              </PopoverTrigger>
              <PopoverContent className="w-64">
                <div className="space-y-2">
                  <h4 className="font-medium leading-none">Prisudregning</h4>
                  <p className="text-sm text-muted-foreground">Baseret på dit forbrug og aktuelle priser.</p>
                  <div className="text-xs space-y-1 pt-2">
                    <div className="flex justify-between"><span>Spotpris:</span> <span>{breakdown.spotPrice.toFixed(2)} kr/kWh</span></div>
                    <div className="flex justify-between"><span>Leverandør tillæg:</span> <span>{breakdown.providerMarkup.toFixed(2)} kr/kWh</span></div>
                    <div className="flex justify-between"><span>Nettarif:</span> <span>{breakdown.networkTariff.toFixed(2)} kr/kWh</span></div>
                    <div className="flex justify-between"><span>Elafgift & moms:</span> <span>{(breakdown.electricityTax + breakdown.vatAmount).toFixed(2)} kr/kWh</span></div>
                    <div className="border-t my-1"></div>
                    <div className="flex justify-between font-bold"><span>Total pr. kWh:</span> <span>{breakdown.total.toFixed(2)} kr</span></div>
                    <div className="flex justify-between"><span>Pris per kWh:</span> <span>{pricePerKwh.toFixed(2)} kr</span></div>
                  </div>
                </div>
              </PopoverContent>
            </Popover>
            
            <Button 
              onClick={handleSignupClick}
              className="bg-brand-dark hover:bg-brand-dark/90 text-white rounded-lg w-full font-semibold py-2.5 sm:py-3 px-4 sm:px-6 text-sm sm:text-base"
              disabled={!product.signupLink}
            >
              Skift til {product.supplierName} <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProviderCard;
