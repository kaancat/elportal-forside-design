
import React from 'react';
import { ArrowRight, Check, X, ExternalLink } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ElectricityProduct } from '@/types/product';

interface ProviderCardProps {
  product: ElectricityProduct;
  annualConsumption: number;
  spotPrice: number | null;
}

const ProviderCard: React.FC<ProviderCardProps> = ({ product, annualConsumption, spotPrice }) => {
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

  // Calculate estimated monthly price using live spot price + markup or fallback to display price
  const finalKwhPrice = spotPrice !== null ? 
    spotPrice + (product.displayPrice_kWh || 0) : // Live spot price + markup
    (product.displayPrice_kWh || 0); // Fallback to display price
  
  const estimatedMonthlyPrice = (finalKwhPrice * annualConsumption / 12) + (product.displayMonthlyFee || 0);
  
  console.log('Price calculation - spotPrice:', spotPrice, 'markup:', product.displayPrice_kWh, 'final:', finalKwhPrice);
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
                  <div>{finalKwhPrice.toFixed(2)} kr/kWh</div>
                  {spotPrice !== null && (
                    <div className="text-xs text-blue-600">Live pris: {spotPrice.toFixed(2)} + {(product.displayPrice_kWh || 0).toFixed(2)} tillæg</div>
                  )}
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
