import React from 'react';
import { Map } from 'lucide-react';
import { ToggleGroup, ToggleGroupItem } from '@/components/ui/toggle-group';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { Info } from 'lucide-react';

interface RegionToggleProps {
  selectedRegion: 'DK1' | 'DK2';
  onRegionChange: (region: 'DK1' | 'DK2') => void;
  isManualOverride: boolean;
  hasLocation: boolean;
  className?: string;
  variant?: 'default' | 'sidebar';
}

export const RegionToggle: React.FC<RegionToggleProps> = ({
  selectedRegion,
  onRegionChange,
  isManualOverride,
  hasLocation,
  className = '',
  variant = 'default'
}) => {
  const isSidebar = variant === 'sidebar';
  
  return (
    <div className={`bg-white rounded-xl shadow-sm border border-gray-100 ${isSidebar ? 'p-3' : 'p-6'} ${className}`}>
      {/* Sidebar: Compact vertical layout */}
      {isSidebar ? (
        <div className="space-y-2">
          <div className="flex items-center gap-1.5">
            <Map className="h-4 w-4 text-brand-green" />
            <h3 className="text-sm font-display font-semibold text-brand-dark">
              Vælg region
            </h3>
          </div>
          
          <ToggleGroup 
            type="single" 
            value={selectedRegion} 
            onValueChange={(value) => value && onRegionChange(value as 'DK1' | 'DK2')}
            className="bg-gray-50 rounded-lg p-1 w-full grid grid-cols-2 gap-1"
          >
            <ToggleGroupItem 
              value="DK1" 
              className="px-2 py-1.5 data-[state=on]:bg-white data-[state=on]:shadow-sm text-xs"
              aria-label="Vestdanmark"
            >
              <div className="flex flex-col items-center">
                <span className="font-medium">Vest</span>
                <span className="text-[10px] text-gray-500">Jylland/Fyn</span>
              </div>
            </ToggleGroupItem>
            <ToggleGroupItem 
              value="DK2" 
              className="px-2 py-1.5 data-[state=on]:bg-white data-[state=on]:shadow-sm text-xs"
              aria-label="Østdanmark"
            >
              <div className="flex flex-col items-center">
                <span className="font-medium">Øst</span>
                <span className="text-[10px] text-gray-500">Sjælland</span>
              </div>
            </ToggleGroupItem>
          </ToggleGroup>
        </div>
      ) : (
        /* Default: Horizontal layout */
        <>
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div className="flex items-center gap-2">
              <Map className="h-5 w-5 text-brand-green" />
              <h3 className="text-lg font-display font-semibold text-brand-dark">
                Vælg region
              </h3>
              <TooltipProvider delayDuration={200}>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <button type="button" aria-label="Vis information om regionvalg" className="p-0.5 hover:bg-gray-100 rounded transition-colors">
                      <Info className="h-4 w-4 text-gray-400" />
                    </button>
                  </TooltipTrigger>
                  <TooltipContent className="max-w-xs" sideOffset={5}>
                    <p>
                      Skift mellem Vest- og Østdanmark for at se regionale prisforskelle. 
                      {hasLocation && !isManualOverride && ' Bruger automatisk din regions priser baseret på postnummer.'}
                    </p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            </div>

            <div className="flex items-center gap-4 sm:justify-end w-full sm:w-auto">
              <ToggleGroup 
                type="single" 
                value={selectedRegion} 
                onValueChange={(value) => value && onRegionChange(value as 'DK1' | 'DK2')}
                className="bg-gray-50 rounded-lg p-1"
              >
                <ToggleGroupItem 
                  value="DK1" 
                  className="px-4 py-2 data-[state=on]:bg-white data-[state=on]:shadow-sm"
                  aria-label="Vestdanmark"
                >
                  <div className="flex flex-col items-center">
                    <span className="font-medium">Vest</span>
                    <span className="text-xs text-gray-500">Jylland/Fyn</span>
                  </div>
                </ToggleGroupItem>
                <ToggleGroupItem 
                  value="DK2" 
                  className="px-4 py-2 data-[state=on]:bg-white data-[state=on]:shadow-sm"
                  aria-label="Østdanmark"
                >
                  <div className="flex flex-col items-center">
                    <span className="font-medium">Øst</span>
                    <span className="text-xs text-gray-500">Sjælland</span>
                  </div>
                </ToggleGroupItem>
              </ToggleGroup>
            </div>
          </div>

          {/* Show average network tariff info when manually selected */}
          {isManualOverride && (
            <div className="mt-3 pt-3 border-t border-gray-100">
              <p className="text-xs text-gray-500">
                Bruger gennemsnitlig nettarif for {selectedRegion === 'DK1' ? 'Vestdanmark' : 'Østdanmark'}. 
                Indtast postnummer for præcis pris.
              </p>
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default RegionToggle;