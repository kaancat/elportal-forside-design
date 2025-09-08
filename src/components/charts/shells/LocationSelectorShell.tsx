import React from 'react';
import { MapPin, Info } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

interface LocationSelectorShellProps {
  placeholder?: string;
  label?: string;
}

/**
 * SSR Shell for LocationSelector component
 * Provides SEO-optimized static content while client component hydrates
 */
const LocationSelectorShell: React.FC<LocationSelectorShellProps> = ({ 
  placeholder = "Indtast postnummer eller by...",
  label = "Din placering"
}) => {
  // Static location examples for SEO
  const popularLocations = [
    { city: 'København', region: 'DK2', provider: 'Radius Elnet' },
    { city: 'Aarhus', region: 'DK1', provider: 'N1' },
    { city: 'Odense', region: 'DK1', provider: 'Trefor El-net' },
    { city: 'Aalborg', region: 'DK1', provider: 'N1' },
    { city: 'Esbjerg', region: 'DK1', provider: 'Syd Energi Net' },
    { city: 'Randers', region: 'DK1', provider: 'Konstant Net' }
  ];

  return (
    <div className="w-full max-w-md">
      {label && (
        <label className="block text-sm font-medium text-gray-700 mb-2">
          {label}
        </label>
      )}
      
      {/* Static input placeholder */}
      <div className="relative">
        <div className="flex items-center w-full px-3 py-2 border border-gray-300 rounded-lg bg-gray-50">
          <MapPin className="h-4 w-4 text-gray-400 mr-2 flex-shrink-0" />
          <span className="text-gray-500 flex-1">
            {placeholder}
          </span>
          <Info className="h-4 w-4 text-gray-400 ml-2" />
        </div>
      </div>

      {/* SEO-friendly location information */}
      <div className="mt-4">
        <Card className="bg-blue-50 border-blue-200">
          <CardContent className="p-4">
            <h4 className="font-semibold text-gray-900 mb-2 flex items-center">
              <MapPin className="h-4 w-4 mr-2 text-blue-600" />
              Populære byer i Danmark
            </h4>
            
            <div className="grid grid-cols-1 gap-2">
              {popularLocations.map((location, index) => (
                <div key={index} className="flex items-center justify-between py-1">
                  <div className="flex items-center">
                    <span className="text-sm font-medium text-gray-900">
                      {location.city}
                    </span>
                    <Badge variant="outline" className="ml-2 text-xs">
                      {location.region}
                    </Badge>
                  </div>
                  <span className="text-xs text-gray-500">
                    {location.provider}
                  </span>
                </div>
              ))}
            </div>
            
            <div className="mt-3 pt-3 border-t border-blue-200">
              <p className="text-xs text-gray-600">
                <strong>DK1:</strong> Vestdanmark (Jylland, Fyn, Bornholm)<br/>
                <strong>DK2:</strong> Østdanmark (Sjælland, Lolland-Falster)
              </p>
            </div>
          </CardContent>
        </Card>

        {/* SEO text content */}
        <div className="mt-4 text-sm text-gray-600">
          <p className="mb-2">
            <strong>Find din netselskab:</strong> Indtast dit postnummer eller by for at finde det 
            netselskab der leverer strøm til dit område.
          </p>
          <p>
            Danmark er opdelt i forskellige netområder med forskellige leverandører og priser. 
            Ved at vælge din placering får du de mest præcise elpriser for dit område.
          </p>
        </div>
      </div>
    </div>
  );
};

export default LocationSelectorShell;