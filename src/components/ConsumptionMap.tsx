import React, { useState, useEffect, useMemo } from 'react';
import { ComposableMap, Geographies, Geography } from 'react-simple-maps';
import { scaleSequential } from 'd3-scale';
import { interpolateGreens, interpolateBlues, interpolateReds } from 'd3-scale-chromatic';
import { MapPin, Activity, Zap, Building2, Home, Info, Filter, RotateCcw, Download } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { cn } from '@/lib/utils';
import { PortableText } from '@portabletext/react';
import {
  Tooltip as UITooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import type { ConsumptionMap } from '@/types/sanity';
import type { MunicipalityConsumption, ConsumptionMapResponse } from '@/utils/municipality/types';
import { 
  getMunicipalityInfo, 
  getConsumptionColor, 
  getConsumptionLevel, 
  formatConsumption, 
  formatPercentage,
  calculateConsumptionStats 
} from '@/utils/municipality/municipalityMapper';

interface ConsumptionMapProps {
  block: ConsumptionMap;
}

// Denmark municipalities GeoJSON URL
const DENMARK_GEOJSON_URL = 'https://raw.githubusercontent.com/magnuslarsen/geoJSON-Danish-municipalities/master/municipalities/municipalities.geojson';

const ConsumptionMapComponent: React.FC<ConsumptionMapProps> = ({ block }) => {
  // Set default values for missing fields
  const title = block.title || 'Elforbrug per kommune';
  const subtitle = block.subtitle || 'Se elforbruget fordelt på private husholdninger og erhverv';
  const leadingText = block.leadingText;
  const headerAlignment = block.headerAlignment || 'center';
  const dataSource = block.dataSource || 'latest';
  const consumerType = block.consumerType || 'all';
  const colorScheme = block.colorScheme || 'brand';
  const showLegend = block.showLegend !== undefined ? block.showLegend : true;
  const showTooltips = block.showTooltips !== undefined ? block.showTooltips : true;
  const enableInteraction = block.enableInteraction !== undefined ? block.enableInteraction : true;
  const defaultView = block.defaultView || '24h';
  const showStatistics = block.showStatistics !== undefined ? block.showStatistics : true;
  const mobileLayout = block.mobileLayout || 'responsive';

  const [data, setData] = useState<MunicipalityConsumption[]>([]);
  const [geoData, setGeoData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [geoLoading, setGeoLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedView, setSelectedView] = useState(defaultView);
  const [selectedConsumerType, setSelectedConsumerType] = useState(consumerType);
  const [selectedMunicipality, setSelectedMunicipality] = useState<string | null>(null);
  const [isMobile, setIsMobile] = useState(false);
  const [mapView, setMapView] = useState<'map' | 'grid'>('map');

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };
    
    checkMobile();
    window.addEventListener('resize', checkMobile);
    
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  // Load GeoJSON data
  useEffect(() => {
    const loadGeoData = async () => {
      try {
        console.log('Loading Denmark GeoJSON data...');
        const response = await fetch(DENMARK_GEOJSON_URL);
        if (!response.ok) {
          throw new Error(`Failed to load GeoJSON: ${response.status}`);
        }
        const geoJson = await response.json();
        console.log('GeoJSON loaded successfully:', geoJson.features?.length, 'municipalities');
        setGeoData(geoJson);
      } catch (err: any) {
        console.error('Failed to load GeoJSON:', err);
        // Fall back to grid view if GeoJSON fails to load
        setMapView('grid');
      } finally {
        setGeoLoading(false);
      }
    };

    loadGeoData();
  }, []);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      setError(null);
      try {
        const apiUrl = `/api/consumption-map?consumerType=${selectedConsumerType}&aggregation=${dataSource}&view=${selectedView}`;
        console.log('Fetching consumption data from:', apiUrl);
        
        const response = await fetch(apiUrl);
        if (!response.ok) {
          const errorText = await response.text();
          console.error('API Error:', response.status, errorText);
          throw new Error(`API fejl (${response.status}): ${errorText}`);
        }
        
        const result: ConsumptionMapResponse = await response.json();
        console.log('API Response:', result);
        
        if (!result.data || result.data.length === 0) {
          console.warn('No consumption data received from API');
          setData([]);
          return;
        }
        
        setData(result.data);
      } catch (err: any) {
        console.error('Fetch error:', err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };
    
    fetchData();
  }, [selectedConsumerType, dataSource, selectedView]);

  // Calculate color scale
  const colorScale = useMemo(() => {
    if (data.length === 0) return null;
    
    const maxConsumption = Math.max(...data.map(d => d.totalConsumption));
    const minConsumption = Math.min(...data.map(d => d.totalConsumption));
    
    let interpolator;
    switch (colorScheme) {
      case 'blue':
        interpolator = interpolateBlues;
        break;
      case 'heat':
        interpolator = interpolateReds;
        break;
      case 'green':
        interpolator = interpolateGreens;
        break;
      case 'brand':
      default:
        // Custom ElPortal brand scale
        return (value: number) => getConsumptionColor(value, maxConsumption);
    }
    
    return scaleSequential(interpolator).domain([minConsumption, maxConsumption]);
  }, [data, colorScheme]);

  // Calculate statistics
  const statistics = useMemo(() => {
    if (data.length === 0) return null;
    return calculateConsumptionStats(data.map(d => ({
      municipalityCode: d.municipalityCode,
      municipalityName: d.municipalityName,
      totalConsumption: d.totalConsumption,
      privateConsumption: d.totalPrivateConsumption,
      industryConsumption: d.totalIndustryConsumption,
      privateShare: d.privateShare,
      industryShare: d.industryShare,
      region: getMunicipalityInfo(d.municipalityCode)?.region || 'Unknown',
      coordinates: getMunicipalityInfo(d.municipalityCode)?.coordinates || [0, 0]
    })));
  }, [data]);

  const handleMunicipalityClick = (municipalityCode: string) => {
    if (!enableInteraction) return;
    setSelectedMunicipality(municipalityCode === selectedMunicipality ? null : municipalityCode);
  };

  // Function to get consumption data for a municipality by LAU code
  const getConsumptionByLauCode = (lauCode: string): MunicipalityConsumption | null => {
    // LAU codes from GeoJSON need to be padded to 3 digits to match our municipality codes
    const paddedCode = lauCode.padStart(3, '0');
    return data.find(d => d.municipalityCode === paddedCode) || null;
  };

  // Function to get fill color for a municipality
  const getMunicipalityFillColor = (lauCode: string): string => {
    const consumption = getConsumptionByLauCode(lauCode);
    if (!consumption || !colorScale) return '#e5e7eb'; // Default gray
    return colorScale(consumption.totalConsumption);
  };

  const resetFilters = () => {
    setSelectedView(defaultView);
    setSelectedConsumerType(consumerType);
    setSelectedMunicipality(null);
  };

  const renderMap = () => {
    if (!geoData || geoLoading) {
      return (
        <div className="flex items-center justify-center h-[500px]">
          <div className="text-gray-500">Indlæser kort...</div>
        </div>
      );
    }

    return (
      <div className="w-full">
        <ComposableMap
          projection="geoMercator"
          projectionConfig={{
            scale: 4000,
            center: [12, 56] // Center on Denmark
          }}
          width={800}
          height={500}
          className="w-full h-auto"
        >
          <Geographies geography={geoData}>
            {({ geographies }) =>
              geographies.map((geo) => {
                const lauCode = geo.properties.lau_1;
                const consumption = getConsumptionByLauCode(lauCode);
                const isSelected = consumption?.municipalityCode === selectedMunicipality;
                
                return (
                  <UITooltip key={geo.rsmKey}>
                    <TooltipTrigger asChild>
                      <Geography
                        geography={geo}
                        fill={getMunicipalityFillColor(lauCode)}
                        stroke="#ffffff"
                        strokeWidth={0.5}
                        style={{
                          default: {
                            outline: 'none',
                          },
                          hover: {
                            fill: consumption ? '#3b82f6' : '#e5e7eb',
                            outline: 'none',
                            cursor: enableInteraction ? 'pointer' : 'default',
                          },
                          pressed: {
                            outline: 'none',
                          },
                        }}
                        className={cn(
                          "transition-all duration-200",
                          isSelected && "stroke-blue-500 stroke-2",
                          enableInteraction && consumption && "hover:opacity-80"
                        )}
                        onClick={() => {
                          if (consumption && enableInteraction) {
                            handleMunicipalityClick(consumption.municipalityCode);
                          }
                        }}
                      />
                    </TooltipTrigger>
                    {showTooltips && consumption && (
                      <TooltipContent className="max-w-xs">
                        <div className="space-y-2">
                          <div className="font-semibold">{geo.properties.label_dk}</div>
                          <div className="text-sm space-y-1">
                            <div>Total forbrug: {formatConsumption(consumption.totalConsumption)}</div>
                            <div>Private: {formatPercentage(consumption.privateShare)}</div>
                            <div>Erhverv: {formatPercentage(consumption.industryShare)}</div>
                            <div className="text-xs text-gray-600">
                              Niveau: {getConsumptionLevel(consumption.totalConsumption, statistics?.maxConsumption || 1)}
                            </div>
                          </div>
                        </div>
                      </TooltipContent>
                    )}
                  </UITooltip>
                );
              })
            }
          </Geographies>
        </ComposableMap>
      </div>
    );
  };

  const renderMunicipalityGrid = () => {
    if (isMobile && mobileLayout === 'list') {
      return (
        <div className="space-y-2">
          {data.slice(0, 10).map((municipality) => (
            <div 
              key={municipality.municipalityCode}
              className="flex justify-between items-center p-3 bg-gray-50 rounded-lg cursor-pointer hover:bg-gray-100"
              onClick={() => handleMunicipalityClick(municipality.municipalityCode)}
            >
              <div>
                <div className="font-medium">{municipality.municipalityName}</div>
                <div className="text-sm text-gray-600">
                  {formatConsumption(municipality.totalConsumption)}
                </div>
              </div>
              <div 
                className="w-4 h-4 rounded"
                style={{ 
                  backgroundColor: colorScale ? colorScale(municipality.totalConsumption) : '#e5e7eb' 
                }}
              />
            </div>
          ))}
        </div>
      );
    }

    // Grid-based visualization for larger screens or responsive layout
    const gridCols = isMobile ? 'grid-cols-6' : 'grid-cols-10';
    
    return (
      <div className={`grid ${gridCols} gap-1 p-4 bg-gray-50 rounded-lg`}>
        {data.map((municipality) => {
          const isSelected = municipality.municipalityCode === selectedMunicipality;
          const consumptionLevel = getConsumptionLevel(
            municipality.totalConsumption, 
            statistics?.maxConsumption || 1
          );
          
          return (
            <UITooltip key={municipality.municipalityCode}>
              <TooltipTrigger asChild>
                <div
                  className={cn(
                    "aspect-square rounded cursor-pointer transition-all duration-200 flex items-center justify-center text-xs font-medium",
                    isSelected ? "ring-2 ring-blue-500 ring-offset-2" : "",
                    enableInteraction ? "hover:scale-110" : ""
                  )}
                  style={{
                    backgroundColor: colorScale ? colorScale(municipality.totalConsumption) : '#e5e7eb',
                    color: municipality.totalConsumption > (statistics?.averageConsumption || 0) ? 'white' : 'black'
                  }}
                  onClick={() => handleMunicipalityClick(municipality.municipalityCode)}
                >
                  {municipality.municipalityName.substring(0, 3)}
                </div>
              </TooltipTrigger>
              {showTooltips && (
                <TooltipContent className="max-w-xs">
                  <div className="space-y-2">
                    <div className="font-semibold">{municipality.municipalityName}</div>
                    <div className="text-sm space-y-1">
                      <div>Total forbrug: {formatConsumption(municipality.totalConsumption)}</div>
                      <div>Private: {formatPercentage(municipality.privateShare)}</div>
                      <div>Erhverv: {formatPercentage(municipality.industryShare)}</div>
                      <div className="text-xs text-gray-600">Niveau: {consumptionLevel}</div>
                    </div>
                  </div>
                </TooltipContent>
              )}
            </UITooltip>
          );
        })}
      </div>
    );
  };

  const renderLegend = () => {
    if (!showLegend || !statistics) return null;

    const levels = [
      { label: 'Lav', range: '0-25%', color: getConsumptionColor(0.1, 1) },
      { label: 'Moderat', range: '25-50%', color: getConsumptionColor(0.35, 1) },
      { label: 'Høj', range: '50-75%', color: getConsumptionColor(0.65, 1) },
      { label: 'Meget høj', range: '75-100%', color: getConsumptionColor(0.9, 1) }
    ];

    return (
      <div className="bg-gray-50 rounded-lg p-4">
        <h3 className="text-sm font-semibold text-gray-700 mb-3">Forbrugsniveau</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {levels.map((level) => (
            <div key={level.label} className="flex items-center gap-2">
              <div 
                className="w-4 h-4 rounded"
                style={{ backgroundColor: level.color }}
              />
              <div>
                <div className="text-sm font-medium">{level.label}</div>
                <div className="text-xs text-gray-600">{level.range}</div>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  };

  return (
    <section className="bg-white py-16 lg:py-24">
      <div className="container mx-auto px-4">
        {/* Header section with alignment */}
        <div className={cn(
          "mb-12",
          headerAlignment === 'left' && "text-left",
          headerAlignment === 'center' && "text-center",
          headerAlignment === 'right' && "text-right"
        )}>
          {title && (
            <h2 className={cn(
              "text-3xl lg:text-4xl font-display font-bold text-gray-900 mb-4",
              headerAlignment === 'center' && "mx-auto"
            )}>
              {title}
            </h2>
          )}
          {subtitle && (
            <p className={cn(
              "text-lg text-gray-600 mb-8",
              headerAlignment === 'center' && "max-w-3xl mx-auto"
            )}>
              {subtitle}
            </p>
          )}

          {leadingText && leadingText.length > 0 && (
            <div className={cn(
              "text-base text-gray-700",
              headerAlignment === 'center' && "max-w-4xl mx-auto"
            )}>
              <div className="prose prose-lg max-w-none">
                <PortableText 
                  value={leadingText} 
                  components={{
                    block: {
                      normal: ({ children }) => <p className="mb-4 last:mb-0">{children}</p>
                    }
                  }}
                />
              </div>
            </div>
          )}
        </div>

        {/* Controls */}
        <div className="flex flex-col sm:flex-row justify-between items-center mb-8 gap-4 p-4 bg-gray-50 rounded-lg border">
          <div className="flex items-center gap-2">
            <Filter className="w-4 h-4 text-gray-600" />
            <span className="text-sm font-medium text-gray-700">Filtre:</span>
          </div>
          
          <div className="flex flex-wrap items-center gap-3">
            <Select value={selectedView} onValueChange={setSelectedView}>
              <SelectTrigger className="w-32">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="24h">24 timer</SelectItem>
                <SelectItem value="7d">7 dage</SelectItem>
                <SelectItem value="30d">30 dage</SelectItem>
                <SelectItem value="month">Måned</SelectItem>
              </SelectContent>
            </Select>

            <Select value={selectedConsumerType} onValueChange={setSelectedConsumerType}>
              <SelectTrigger className="w-40">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Alle forbrugere</SelectItem>
                <SelectItem value="private">Private</SelectItem>
                <SelectItem value="industry">Erhverv</SelectItem>
              </SelectContent>
            </Select>

            {!geoLoading && geoData && (
              <Select value={mapView} onValueChange={(value: 'map' | 'grid') => setMapView(value)}>
                <SelectTrigger className="w-32">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="map">Kort</SelectItem>
                  <SelectItem value="grid">Gitter</SelectItem>
                </SelectContent>
              </Select>
            )}

            <Button 
              variant="outline" 
              size="sm" 
              onClick={resetFilters}
              className="flex items-center gap-1"
            >
              <RotateCcw className="w-3 h-3" />
              Nulstil
            </Button>
          </div>
        </div>

        {/* Statistics cards */}
        {showStatistics && statistics && !loading && (
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
            <div className="bg-blue-50 rounded-lg p-6 text-center">
              <div className="flex items-center justify-center gap-2 mb-2">
                <Activity className="w-5 h-5 text-blue-600" />
                <h3 className="text-sm font-semibold text-gray-700">Total forbrug</h3>
              </div>
              <div className="text-3xl font-bold text-blue-600">
                {formatConsumption(statistics.totalConsumption)}
              </div>
            </div>

            <div className="bg-green-50 rounded-lg p-6 text-center">
              <div className="flex items-center justify-center gap-2 mb-2">
                <Home className="w-5 h-5 text-green-600" />
                <h3 className="text-sm font-semibold text-gray-700">Private</h3>
              </div>
              <div className="text-3xl font-bold text-green-600">
                {formatPercentage(statistics.privateShareTotal)}
              </div>
            </div>

            <div className="bg-orange-50 rounded-lg p-6 text-center">
              <div className="flex items-center justify-center gap-2 mb-2">
                <Building2 className="w-5 h-5 text-orange-600" />
                <h3 className="text-sm font-semibold text-gray-700">Erhverv</h3>
              </div>
              <div className="text-3xl font-bold text-orange-600">
                {formatPercentage(statistics.industryShareTotal)}
              </div>
            </div>

            <div className="bg-gray-50 rounded-lg p-6 text-center">
              <div className="flex items-center justify-center gap-2 mb-2">
                <MapPin className="w-5 h-5 text-gray-600" />
                <h3 className="text-sm font-semibold text-gray-700">Kommuner</h3>
              </div>
              <div className="text-3xl font-bold text-gray-700">
                {statistics.municipalityCount}
              </div>
            </div>
          </div>
        )}

        {/* Main content area */}
        <div className="space-y-8">
          {/* Map visualization */}
          <div className="bg-white p-4 rounded-lg border">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <h3 className="text-lg font-semibold text-gray-900">
                  {mapView === 'map' ? 'Forbrugskort' : 'Kommuneoversigt'}
                </h3>
                <UITooltip>
                  <TooltipTrigger asChild>
                    <Info className="w-4 h-4 text-gray-500 cursor-help" />
                  </TooltipTrigger>
                  <TooltipContent className="max-w-xs">
                    <p>
                      {mapView === 'map' 
                        ? 'Klik på en kommune på kortet for at se detaljerede oplysninger. Farver viser forbrugsniveau fra lav (lys) til høj (mørk).'
                        : 'Klik på en kommune i oversigten for at se detaljerede oplysninger. Farver viser forbrugsniveau.'
                      }
                    </p>
                  </TooltipContent>
                </UITooltip>
              </div>
            </div>

            {loading || geoLoading ? (
              <div className="flex items-center justify-center h-[500px]">
                <div className="text-gray-500">
                  {loading ? 'Indlæser forbrugsdata...' : 'Indlæser kort...'}
                </div>
              </div>
            ) : error ? (
              <div className="flex items-center justify-center h-[500px]">
                <div className="text-red-500 flex items-center gap-2">
                  <Activity className="w-5 h-5" />
                  {error}
                </div>
              </div>
            ) : data.length === 0 ? (
              <div className="flex items-center justify-center h-[500px]">
                <div className="text-gray-500 text-center">
                  <Activity className="w-10 h-10 mx-auto mb-2 text-gray-400" />
                  <div>Ingen forbrugsdata tilgængelig</div>
                </div>
              </div>
            ) : (
              <div className="min-h-[500px]">
                {mapView === 'map' && geoData ? renderMap() : renderMunicipalityGrid()}
              </div>
            )}
          </div>

          {/* Legend */}
          {renderLegend()}

          {/* Selected municipality details */}
          {selectedMunicipality && enableInteraction && (
            <div className="bg-blue-50 rounded-lg p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                Detaljeret information
              </h3>
              {(() => {
                const municipality = data.find(m => m.municipalityCode === selectedMunicipality);
                if (!municipality) return <div>Kommune ikke fundet</div>;
                
                return (
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <div className="text-sm text-gray-600">Kommune</div>
                      <div className="font-semibold">{municipality.municipalityName}</div>
                    </div>
                    <div>
                      <div className="text-sm text-gray-600">Total forbrug</div>
                      <div className="font-semibold">{formatConsumption(municipality.totalConsumption)}</div>
                    </div>
                    <div>
                      <div className="text-sm text-gray-600">Private / Erhverv</div>
                      <div className="font-semibold">
                        {formatPercentage(municipality.privateShare)} / {formatPercentage(municipality.industryShare)}
                      </div>
                    </div>
                  </div>
                );
              })()}
            </div>
          )}
        </div>
      </div>
    </section>
  );
};

export default ConsumptionMapComponent;