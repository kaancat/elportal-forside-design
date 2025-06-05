
import React from 'react';
import { ArrowRight, Check, X, ExternalLink } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ElectricityProduct } from '@/types/product';

interface ProviderCardProps {
  product: ElectricityProduct;
}

const ProviderCard: React.FC<ProviderCardProps> = ({ product }) => {
  const handleSignupClick = () => {
    window.open(product.signupLink, '_blank', 'noopener,noreferrer');
  };

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden hover:shadow-md transition-shadow">
      <div className="p-6">
        <div className="flex flex-col lg:flex-row lg:items-center gap-6">
          {/* Logo and company info */}
          <div className="flex flex-col space-y-3">
            <div className="flex items-center space-x-4">
              <div className="flex-shrink-0 w-24 h-24 flex items-center justify-center p-2 bg-white rounded-lg border border-gray-100">
                <img 
                  src={product.supplierLogoURL} 
                  alt={`${product.supplierName} logo`} 
                  className="max-w-full max-h-full object-contain" 
                />
              </div>
              
              <div>
                {product.isVindstoedProduct && (
                  <Badge className="bg-brand-green text-white mb-2">
                    Anbefalet partner
                  </Badge>
                )}
                
                <h3 className="font-bold text-lg text-brand-dark">{product.productName}</h3>
                <p className="text-sm text-gray-600">{product.supplierName}</p>
              </div>
            </div>
          </div>
          
          {/* Inkluderet Features */}
          <div className="bg-gray-50 p-4 rounded-lg border-l-4 border-l-brand-green border-t border-r border-b border-gray-100 lg:flex-1">
            <p className="text-xs text-brand-dark uppercase font-semibold mb-3">Inkluderet</p>
            <div className="space-y-2">
              <div className="flex items-center text-sm">
                {product.isVariablePrice ? (
                  <Check className="h-4 w-4 text-brand-green mr-2 flex-shrink-0" />
                ) : (
                  <X className="h-4 w-4 text-red-500 mr-2 flex-shrink-0" />
                )}
                <span className="text-brand-dark">Prisen er variabel</span>
              </div>
              
              <div className="flex items-center text-sm">
                {product.hasNoBinding ? (
                  <Check className="h-4 w-4 text-brand-green mr-2 flex-shrink-0" />
                ) : (
                  <X className="h-4 w-4 text-red-500 mr-2 flex-shrink-0" />
                )}
                <span className="text-brand-dark">Ingen binding</span>
              </div>
              
              <div className="flex items-center text-sm">
                {product.hasFreeSignup ? (
                  <Check className="h-4 w-4 text-brand-green mr-2 flex-shrink-0" />
                ) : (
                  <X className="h-4 w-4 text-red-500 mr-2 flex-shrink-0" />
                )}
                <span className="text-brand-dark">Gratis oprettelse</span>
              </div>
            </div>
          </div>
          
          {/* Price and action */}
          <div className="flex flex-col items-end lg:min-w-[200px]">
            <div className="bg-gradient-to-br from-brand-dark/5 to-gray-50 px-4 py-3 rounded-lg border border-gray-100 mb-4 w-full">
              <div className="text-right">
                <div className="text-2xl font-bold text-brand-dark">
                  {product.displayPrice_kWh.toFixed(2)} kr/kWh
                </div>
                <div className="text-sm text-gray-600">
                  Månedligt gebyr: {product.displayMonthlyFee} kr
                </div>
              </div>
            </div>
            
            <Button 
              onClick={handleSignupClick}
              className="bg-brand-green hover:bg-brand-green/90 text-white rounded-md w-full"
            >
              Se nærmere <ExternalLink className="ml-1 h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProviderCard;
