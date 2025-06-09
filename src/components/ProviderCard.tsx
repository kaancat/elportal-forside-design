
import React from 'react';
import { ArrowRight, Check, X, ExternalLink, Info } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { ElectricityProduct } from '@/types/product';

interface ProviderCardProps {
  product: ElectricityProduct;
  annualConsumption: number;
  spotPrice: number | null;
}

const ProviderCard: React.FC<ProviderCardProps> = ({ product, annualConsumption, spotPrice }) => {
  // Fee constants for Danish electricity pricing
  const NETSelskab_AVG = 0.30; // Average grid tariff in kr
  const ENERGINET_FEE = 0.11; // Energinet tariff in kr
  const STATEN_ELAFGIFT = 0.76; // State electricity tax in kr

  console.log('ProviderCard render - product:', product);
  console.log('ProviderCard render - annualConsumption:', annualConsumption);

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

  // Enhanced price calculation with all fees and VAT
  const markupKr = (product.displayPrice_kWh || 0); // Provider markup in kr
  const baseSpotPrice = spotPrice !== null ? spotPrice : 1.0; // Use fallback of 1kr if spot price not loaded

  // Sum of all per-kWh costs BEFORE VAT
  const priceBeforeVat = baseSpotPrice + markupKr + NETSelskab_AVG + ENERGINET_FEE + STATEN_ELAFGIFT;
  
  // Final price including 25% VAT
  const finalKwhPriceWithVat = priceBeforeVat * 1.25;

  const estimatedMonthlyPrice = (finalKwhPriceWithVat * annualConsumption / 12) + (product.displayMonthlyFee || 0);
  
  console.log('Price breakdown - spot:', baseSpotPrice, 'markup:', markupKr, 'beforeVat:', priceBeforeVat, 'withVat:', finalKwhPriceWithVat);
  console.log('Calculated monthly price:', estimatedMonthlyPrice, 'for consumption:', annualConsumption);

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden hover:shadow-lg transition-all duration-200">
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
                    console.warn('Logo failed to load:', product.supplierLogoURL);
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
                  <Check className="h-5 w-5 text-brand-green mr-3 flex-shrink-0" />
                ) : (
                  <X className="h-5 w-5 text-red-500 mr-3 flex-shrink-0" />
                )}
                <span className="text-brand-dark font-medium">Gratis oprettelse</span>
              </div>
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
                  <div className="text-sm text-brand-dark font-semibold">Estimeret {finalKwhPriceWithVat.toFixed(2)} kr/kWh</div>
                  
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
                          <div className="flex justify-between"><span>Rå elpris:</span> <span>{baseSpotPrice.toFixed(2)} kr.</span></div>
                          <div className="flex justify-between"><span>Dit elselskab (tillæg):</span> <span>{markupKr.toFixed(2)} kr.</span></div>
                          <div className="border-t my-1"></div>
                          <div className="flex justify-between"><span>Netselskab (gns.):</span> <span>{NETSelskab_AVG.toFixed(2)} kr.</span></div>
                          <div className="flex justify-between"><span>Energinet:</span> <span>{ENERGINET_FEE.toFixed(2)} kr.</span></div>
                          <div className="flex justify-between"><span>Staten (elafgift):</span> <span>{STATEN_ELAFGIFT.toFixed(2)} kr.</span></div>
                          <div className="border-t my-1"></div>
                          <div className="flex justify-between font-semibold"><span>Pris u. moms:</span> <span>{priceBeforeVat.toFixed(2)} kr.</span></div>
                          <div className="flex justify-between font-semibold"><span>Moms (25%):</span> <span>{(priceBeforeVat * 0.25).toFixed(2)} kr.</span></div>
                          <div className="border-t border-dashed my-1"></div>
                          <div className="flex justify-between font-bold"><span>Total pr. kWh:</span> <span>{finalKwhPriceWithVat.toFixed(2)} kr.</span></div>
                        </div>
                      </div>
                    </PopoverContent>
                  </Popover>
                  
                  <div>Månedligt gebyr: {product.displayMonthlyFee || 0} kr</div>
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
