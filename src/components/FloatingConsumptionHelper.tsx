import React from 'react';
import { HelpCircle, Zap, BarChart3, Calculator } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';

interface FloatingConsumptionHelperProps {
  variant?: 'floating' | 'inline';
}

export const FloatingConsumptionHelper: React.FC<FloatingConsumptionHelperProps> = ({ 
  variant = 'floating' 
}) => {
  const PopoverContentComponent = () => (
    <PopoverContent className="w-72 p-0" side="top" align="end">
      <Card className="border-0 shadow-lg">
        <CardContent className="p-4">
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <div className="h-8 w-8 rounded-full bg-brand-green/10 flex items-center justify-center flex-shrink-0">
                <Zap className="h-4 w-4 text-brand-green" />
              </div>
              <h3 className="font-semibold text-gray-900 text-sm">Kender du ikke dit forbrug?</h3>
            </div>
            
            <p className="text-xs text-gray-600 leading-relaxed">
              Med vores forbrug tracker kan du nemt finde dit præcise elforbrug ved at forbinde til Eloverblik.
            </p>
            
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <BarChart3 className="h-3 w-3 text-brand-green flex-shrink-0" />
                <span className="text-xs text-gray-700">Se dit faktiske forbrug</span>
              </div>
              <div className="flex items-center gap-2">
                <Calculator className="h-3 w-3 text-brand-green flex-shrink-0" />
                <span className="text-xs text-gray-700">Få præcise beregninger</span>
              </div>
            </div>
            
            <Button 
              asChild 
              className="w-full bg-brand-green hover:bg-brand-green-hover text-white"
              size="sm"
            >
              <a href="/forbrug-tracker" target="_blank" rel="noopener noreferrer">
                <Zap className="mr-2 h-3 w-3" />
                Tjek dit forbrug
              </a>
            </Button>
          </div>
        </CardContent>
      </Card>
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
                <HelpCircle className="h-4 w-4 text-brand-green" />
                Kender du ikke dit forbrug?
              </div>
              <p className="text-xs text-gray-600">
                Brug vores forbrug tracker til at finde dit præcise elforbrug
              </p>
              <Button 
                asChild 
                variant="outline" 
                size="sm"
                className="border-brand-green text-brand-green hover:bg-brand-green hover:text-white"
              >
                <a href="/forbrug-tracker" target="_blank" rel="noopener noreferrer">
                  <Zap className="mr-2 h-3 w-3" />
                  Tjek dit forbrug
                </a>
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Floating version for desktop
  return (
    <div className="hidden md:block absolute bottom-4 right-4 z-10">
      <Popover>
        <PopoverTrigger asChild>
          <button className="group relative">
            {/* Pulsing glow effect */}
            <div className="absolute inset-0 rounded-full bg-brand-green animate-pulse-glow group-hover:opacity-60 transition-opacity duration-300"></div>
            
            {/* Main button */}
            <div className="relative h-12 w-12 rounded-full bg-brand-dark border-2 border-brand-green shadow-lg flex items-center justify-center hover:scale-105 transition-all duration-200 cursor-pointer group-hover:shadow-xl group-hover:bg-brand-dark-light">
              <HelpCircle className="h-5 w-5 text-brand-green group-hover:text-brand-green-light transition-colors" />
            </div>
          </button>
        </PopoverTrigger>
        
        <PopoverContentComponent />
      </Popover>
    </div>
  );
};

export default FloatingConsumptionHelper;