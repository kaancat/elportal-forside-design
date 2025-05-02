
import React from 'react';
import { ArrowRight, Check, Star, Info, BadgePercent, BadgeCheck, Flag, Shield, ShieldCheck } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { Badge } from '@/components/ui/badge';

interface ProviderProps {
  logo: string;
  name: string;
  priceKwh: number;
  priceMonth: number;
  badges: string[];
  trustpilotScore?: number;
  intro?: boolean;
  verified?: boolean;
  features: string[];
}

const ProviderCard: React.FC<ProviderProps> = ({
  logo,
  name,
  priceKwh,
  priceMonth,
  badges,
  trustpilotScore,
  intro = false,
  verified = false,
  features,
}) => {
  const getBadgeIcon = (badge: string) => {
    if (badge.includes('abonnement')) return <BadgePercent className="h-3 w-3 mr-1" />;
    if (badge.includes('stjerner')) return <Star className="h-3 w-3 mr-1" />;
    if (badge.includes('Slip')) return <Flag className="h-3 w-3 mr-1" />;
    if (badge.includes('gratis')) return <BadgeCheck className="h-3 w-3 mr-1" />;
    return <Shield className="h-3 w-3 mr-1" />;
  };

  const renderTrustpilotStars = (score: number) => {
    const stars = [];
    const fullStars = Math.floor(score);
    const remainder = score - fullStars;
    
    for (let i = 0; i < fullStars; i++) {
      stars.push(<Star key={`full-${i}`} className="h-4 w-4 text-green-500 fill-green-500" />);
    }
    
    if (remainder >= 0.5) {
      stars.push(<Star key="half" className="h-4 w-4 text-green-500 fill-green-500" />);
    }
    
    const emptyStars = 5 - stars.length;
    for (let i = 0; i < emptyStars; i++) {
      stars.push(<Star key={`empty-${i}`} className="h-4 w-4 text-gray-300" />);
    }
    
    return stars;
  };

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden hover:shadow-md transition-shadow">
      <div className="p-6">
        <div className="flex flex-col md:flex-row md:items-center gap-6">
          {/* Logo and badges */}
          <div className="flex flex-col space-y-3">
            <div className="flex items-center space-x-4">
              <div className="flex-shrink-0 w-24 h-24 flex items-center justify-center p-2 bg-white rounded-lg border border-gray-100">
                <img src={logo} alt={`${name} logo`} className="max-w-full max-h-full" />
              </div>
              
              <div>
                {verified && (
                  <div className="flex items-center text-brand-green mb-1">
                    <ShieldCheck className="h-4 w-4 mr-1" /> 
                    <span className="text-xs font-medium">Verificeret</span>
                  </div>
                )}
                
                <h3 className="font-bold text-lg">{name}</h3>
                
                {trustpilotScore && (
                  <div className="flex items-center mt-1">
                    <div className="flex">{renderTrustpilotStars(trustpilotScore)}</div>
                    <span className="ml-1 text-xs text-gray-600">({trustpilotScore})</span>
                  </div>
                )}
              </div>
            </div>
            
            {/* Badges */}
            {badges.length > 0 && (
              <div className="flex flex-wrap gap-2">
                {badges.map((badge, index) => {
                  const bgColor = badge.includes('abonnement') ? 'bg-yellow-100 border-yellow-200' : 
                                 badge.includes('Slip') ? 'bg-blue-100 border-blue-200' : 
                                 'bg-green-100 border-green-200';
                  const textColor = badge.includes('abonnement') ? 'text-yellow-800' : 
                                   badge.includes('Slip') ? 'text-blue-800' : 
                                   'text-green-800';
                  
                  return (
                    <div 
                      key={index} 
                      className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium border ${bgColor} ${textColor}`}
                    >
                      {getBadgeIcon(badge)}
                      {badge}
                    </div>
                  );
                })}
              </div>
            )}
          </div>
          
          {/* Features */}
          <div className="bg-gray-50 p-4 rounded-lg border-l-4 border-l-brand-green border-t border-r border-b border-gray-100 md:flex-1">
            <p className="text-xs text-brand-dark uppercase font-semibold mb-2">Inkluderet</p>
            <div className="space-y-2">
              {features.map((feature, index) => (
                <div key={index} className="flex items-center text-sm">
                  <Check className="h-4 w-4 text-brand-green mr-2 flex-shrink-0" />
                  <span className="text-gray-700">{feature}</span>
                </div>
              ))}
            </div>
          </div>
          
          {/* Price and action */}
          <div className="flex flex-col items-end">
            <div className="bg-gradient-to-br from-brand-dark/5 to-gray-50 px-4 py-3 rounded-lg border border-gray-100 mb-4 w-full">
              <div className="flex items-center justify-between mb-1">
                <p className="text-sm text-gray-500">Din estimerede pris</p>
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger>
                      <Info className="h-4 w-4 text-gray-400" />
                    </TooltipTrigger>
                    <TooltipContent>
                      <p className="text-sm">Beregnet ud fra dit forbrug</p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              </div>
              
              <div className="text-right">
                <div className="text-2xl font-bold">{priceKwh.toFixed(2)} kr. pr. kWh</div>
                <div className="text-sm text-gray-500">{priceMonth} kr. pr. måned</div>
              </div>
            </div>
            
            <Button 
              className="bg-brand-green hover:bg-opacity-90 text-white rounded-md w-full sm:w-auto"
            >
              Gå til udbyder <ArrowRight className="ml-1 h-4 w-4" />
            </Button>
            
            <button className="mt-2 text-xs text-gray-500 underline hover:text-brand-green">
              Se detaljer
            </button>
          </div>
        </div>
      </div>
      
      {intro && (
        <div className="px-6 py-2 bg-brand-dark bg-opacity-5 border-t border-brand-green/20 flex items-center">
          <Star className="h-4 w-4 text-brand-green mr-2" />
          <span className="text-sm text-brand-dark font-medium">Introtilbud - Rabatteret pris i første periode</span>
        </div>
      )}
    </div>
  );
};

export default ProviderCard;
