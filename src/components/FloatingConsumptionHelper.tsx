import React from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';

interface FloatingConsumptionHelperProps {
  variant?: 'floating' | 'inline' | 'neon';
}

export const FloatingConsumptionHelper: React.FC<FloatingConsumptionHelperProps> = ({ 
  variant = 'floating' 
}) => {
  const PopoverContentComponent = () => (
    <PopoverContent className="w-52 p-0" side="top" align="start">
      <div className="p-2">
        <div className="space-y-2">
          <h3 className="font-medium text-gray-900 text-xs">Kender du ikke dit forbrug?</h3>
          
          <p className="text-xs text-gray-600 leading-relaxed">
            Find dit præcise elforbrug med vores forbrug tracker.
          </p>
          
          <a 
            href="/forbrug-tracker" 
            target="_blank" 
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1 bg-brand-green hover:bg-brand-green-hover text-white px-1.5 py-0.5 rounded text-xs font-medium transition-colors"
          >
            <span className="text-xs">⚡</span>
            Tjek dit forbrug
          </a>
        </div>
      </div>
    </PopoverContent>
  );

  if (variant === 'inline') {
    // Mobile/inline version
    return (
      <div className="mt-4 md:hidden">
        <Card className="border-dashed border-2 border-brand-green/30 bg-brand-green/5">
          <CardContent className="p-4">
            <div className="text-center space-y-3">
              <div className="inline-flex items-center gap-2 text-sm font-medium text-gray-800">
                <div className="h-4 w-4 rounded-full border border-brand-green flex items-center justify-center">
                  <span className="text-xs font-bold text-brand-green">?</span>
                </div>
                Kender du ikke dit forbrug?
              </div>
              <p className="text-xs text-gray-600">
                Brug vores forbrug tracker til at finde dit præcise elforbrug
              </p>
              <a 
                href="/forbrug-tracker" 
                target="_blank" 
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1 border border-brand-green text-brand-green hover:bg-brand-green hover:text-white px-2 py-1 rounded text-xs font-medium transition-colors"
              >
                <span className="text-xs">⚡</span>
                Tjek dit forbrug
              </a>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Both neon and floating variants now use same neon green styling
  return (
    <Popover>
      <PopoverTrigger asChild>
        <button className="group relative inline-block ml-1 -mt-0.5">
          {/* Neon green outline, no background - consistent across variants */}
          <div className="relative h-4 w-4 rounded-full border border-brand-green flex items-center justify-center hover:scale-110 transition-all duration-200 cursor-pointer">
            <span className="text-xs font-bold text-brand-green">?</span>
          </div>
        </button>
      </PopoverTrigger>
      
      <PopoverContentComponent />
    </Popover>
  );
};

export default FloatingConsumptionHelper;