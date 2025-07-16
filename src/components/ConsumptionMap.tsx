import React, { useState, useEffect, useMemo } from 'react';
import { ComposableMap, Geographies, Geography } from 'react-simple-maps';
import { scaleSequential } from 'd3-scale';
import { interpolateGreens, interpolateBlues, interpolateReds } from 'd3-scale-chromatic';
import { MapPin, Activity, Zap, Building2, Home, Info, Filter, RotateCcw, Download, Calendar } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { cn } from '@/lib/utils';
import { PortableText } from '@portabletext/react';
// Removed tooltip imports - using custom implementation
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
import { debug } from '@/utils/debug';

interface ConsumptionMapProps {
  block: ConsumptionMap;
}

// Denmark municipalities GeoJSON URL
const DENMARK_GEOJSON_URL = 'https://raw.githubusercontent.com/magnuslarsen/geoJSON-Danish-municipalities/master/municipalities/municipalities.geojson';

// Register component for debugging
debug.component('ConsumptionMap', 'Component file loaded');

const ConsumptionMapComponent: React.FC<ConsumptionMapProps> = ({ block }) => {
  // Remove per-render logging to reduce console noise
  
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
  const [mapView, setMapView] = useState<'map' | 'list'>('map');
  const [dateRange, setDateRange] = useState<{ start: string; end: string } | null>(null);
  const [hoveredMunicipality, setHoveredMunicipality] = useState<string | null>(null);
  const [mousePosition, setMousePosition] = useState<{ x: number; y: number }>({ x: 0, y: 0 });

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
        debug.log('Loading Denmark GeoJSON data...');
        const response = await fetch(DENMARK_GEOJSON_URL);
        if (!response.ok) {
          throw new Error(`Failed to load GeoJSON: ${response.status}`);
        }
        const geoJson = await response.json();
        debug.log('GeoJSON loaded successfully:', geoJson.features?.length, 'municipalities');
        setGeoData(geoJson);
      } catch (err: any) {
        console.error('Failed to load GeoJSON:', err);
        // Fall back to list view if GeoJSON fails to load
        setMapView('list');
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
        debug.log('Fetching consumption data from:', apiUrl);
        
        const response = await fetch(apiUrl);
        if (!response.ok) {
          const errorText = await response.text();
          console.error('API Error:', response.status, errorText);
          throw new Error(`API fejl (${response.status}): ${errorText}`);
        }
        
        const result: ConsumptionMapResponse = await response.json();
        debug.log('API Response:', result);
        
        // Only log summary info to reduce console noise
        if (result.statistics?.totalConsumption > 0) {
          debug.log(`Loaded data for ${result.data?.length} municipalities, total consumption: ${result.statistics.totalConsumption.toFixed(0)} MWh`);
        }
        
        if (!result.data || result.data.length === 0) {
          console.warn('No consumption data received from API');
          setData([]);
          return;
        }
        
        setData(result.data);
        
        // Set date range from metadata
        if (result.metadata?.startDate && result.metadata?.endDate) {
          setDateRange({
            start: result.metadata.startDate,
            end: result.metadata.endDate
          });
        }
      } catch (err: any) {
        console.error('Fetch error:', err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };
    
    fetchData();
  }, [selectedConsumerType, dataSource, selectedView]);

  // Calculate color scale based on selected consumer type
  const colorScale = useMemo(() => {
    if (data.length === 0) return null;
    
    // Use different consumption values based on selected filter
    let consumptionValues: number[];
    switch (selectedConsumerType) {
      case 'private':
        consumptionValues = data.map(d => d.totalPrivateConsumption);
        break;
      case 'industry':
        consumptionValues = data.map(d => d.totalIndustryConsumption);
        break;
      default:
        consumptionValues = data.map(d => d.totalConsumption);
    }
    
    const maxConsumption = Math.max(...consumptionValues);
    const minConsumption = Math.min(...consumptionValues);
    
    // Use different color schemes for different consumer types
    let interpolator;
    if (selectedConsumerType === 'private') {
      interpolator = interpolateGreens; // Green for private
    } else if (selectedConsumerType === 'industry') {
      interpolator = interpolateBlues; // Blue for industry
    } else {
      // Brand colors for 'all'
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
          return (value: number) => getConsumptionColor(value, maxConsumption);
      }
    }
    
    return scaleSequential(interpolator).domain([minConsumption, maxConsumption]);
  }, [data, colorScheme, selectedConsumerType]);

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
    
    // Use the appropriate consumption value based on selected filter
    let value: number;
    switch (selectedConsumerType) {
      case 'private':
        value = consumption.totalPrivateConsumption;
        break;
      case 'industry':
        value = consumption.totalIndustryConsumption;
        break;
      default:
        value = consumption.totalConsumption;
    }
    
    return colorScale(value);
  };

  const resetFilters = () => {
    setSelectedView(defaultView);
    setSelectedConsumerType(consumerType);
    setSelectedMunicipality(null);
  };
  
  // Format date range for display
  const formatDateRange = () => {
    if (!dateRange) return null;
    
    const formatDate = (dateStr: string) => {
      const date = new Date(dateStr);
      return date.toLocaleDateString('da-DK', { 
        day: 'numeric', 
        month: 'short',
        year: date.getFullYear() !== new Date().getFullYear() ? 'numeric' : undefined
      });
    };
    
    return `${formatDate(dateRange.start)} - ${formatDate(dateRange.end)}`;
  };

  const renderMap = () => {
    if (!geoData || geoLoading) {
      return (
        <div className="flex items-center justify-center h-[500px]">
          <div className="text-gray-500">Indlæser kort...</div>
        </div>
      );
    }

    const hoveredData = hoveredMunicipality ? data.find(d => d.municipalityCode === hoveredMunicipality) : null;

    return (
      <div className="w-full relative" onMouseMove={(e) => {
        const rect = e.currentTarget.getBoundingClientRect();
        setMousePosition({ x: e.clientX - rect.left, y: e.clientY - rect.top });
      }}>
        <ComposableMap
          projection="geoMercator"
          projectionConfig={{
            scale: 6000, // Increased scale to make map larger
            center: [11, 56] // Adjusted center for better framing
          }}
          width={800}
          height={600} // Increased height
          className="w-full h-auto"
          style={{
            width: "100%",
            height: "auto",
            maxHeight: "600px"
          }}
        >
          <Geographies geography={geoData}>
            {({ geographies }) =>
              geographies.map((geo) => {
                const lauCode = geo.properties.lau_1;
                const consumption = getConsumptionByLauCode(lauCode);
                const isSelected = consumption?.municipalityCode === selectedMunicipality;
                
                return (
                  <Geography
                    key={geo.rsmKey}
                    geography={geo}
                    fill={getMunicipalityFillColor(lauCode)}
                    stroke="#ffffff"
                    strokeWidth={0.5}
                    style={{
                      default: {
                        outline: 'none',
                        transition: 'all 0.2s ease',
                      },
                      hover: {
                        fill: consumption ? '#3b82f6' : '#e5e7eb',
                        outline: 'none',
                        cursor: enableInteraction && consumption ? 'pointer' : 'default',
                        filter: consumption ? 'brightness(1.1)' : 'none',
                      },
                      pressed: {
                        outline: 'none',
                        fill: consumption ? '#2563eb' : '#e5e7eb',
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
                    onMouseEnter={() => {
                      if (consumption) {
                        setHoveredMunicipality(consumption.municipalityCode);
                      }
                    }}
                    onMouseLeave={() => {
                      setHoveredMunicipality(null);
                    }}
                  />
                );
              })
            }
          </Geographies>
        </ComposableMap>
        
        {/* Custom tooltip */}
        {showTooltips && hoveredData && hoveredMunicipality && (
          <div
            className="absolute z-50 pointer-events-none"
            style={{
              left: `${mousePosition.x + 10}px`,
              top: `${mousePosition.y - 10}px`,
              transform: 'translate(0, -100%)',
            }}
          >
            <div className="bg-white/95 backdrop-blur shadow-xl border border-gray-200 rounded-lg p-4 max-w-xs">
              <div className="space-y-3">
                <div>
                  <div className="font-bold text-base">{hoveredData.municipalityName}</div>
                  <div className="text-xs text-gray-500">Kommune</div>
                </div>
                
                <div className="border-t pt-3 space-y-2">
                  <div>
                    <div className="text-xs text-gray-600">Total forbrug</div>
                    <div className="font-semibold">{formatConsumption(hoveredData.totalConsumption)}</div>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <div className="text-xs text-gray-600">Private</div>
                      <div className="font-semibold text-green-600">
                        {formatConsumption(hoveredData.totalPrivateConsumption)}
                      </div>
                      <div className="text-xs text-green-600">({formatPercentage(hoveredData.privateShare)})</div>
                    </div>
                    <div>
                      <div className="text-xs text-gray-600">Erhverv</div>
                      <div className="font-semibold text-orange-600">
                        {formatConsumption(hoveredData.totalIndustryConsumption)}
                      </div>
                      <div className="text-xs text-orange-600">({formatPercentage(hoveredData.industryShare)})</div>
                    </div>
                  </div>
                  
                  <div className="text-xs text-gray-500 pt-2 border-t">
                    Forbrugsniveau: <span className="font-medium">{getConsumptionLevel(hoveredData.totalConsumption, statistics?.maxConsumption || 1)}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    );
  };

  const renderMunicipalityList = () => {
    // Get consumption value based on selected filter for sorting
    const getConsumptionForSort = (municipality: MunicipalityConsumption) => {
      switch (selectedConsumerType) {
        case 'private':
          return municipality.totalPrivateConsumption;
        case 'industry':
          return municipality.totalIndustryConsumption;
        default:
          return municipality.totalConsumption;
      }
    };

    // Sort municipalities by the selected consumption type
    const sortedData = [...data].sort((a, b) => 
      getConsumptionForSort(b) - getConsumptionForSort(a)
    );

    return (
      <div className="h-[500px] overflow-y-auto">
        <div className="space-y-2 p-4">
          {sortedData.map((municipality) => {
            const isSelected = municipality.municipalityCode === selectedMunicipality;
            const consumptionValue = getConsumptionForSort(municipality);
            const maxValue = Math.max(...data.map(m => getConsumptionForSort(m)));
            const percentage = (consumptionValue / maxValue) * 100;
            
            return (
              <div 
                key={municipality.municipalityCode}
                className={cn(
                  "flex items-center gap-4 p-3 rounded-lg cursor-pointer transition-all duration-200",
                  isSelected ? "bg-blue-100 border-2 border-blue-500" : "bg-gray-50 hover:bg-gray-100"
                )}
                onClick={() => handleMunicipalityClick(municipality.municipalityCode)}
              >
                <div className="flex-1">
                  <div className="flex justify-between items-baseline mb-1">
                    <div className="font-medium">{municipality.municipalityName}</div>
                    <div className="text-sm font-semibold">
                      {formatConsumption(consumptionValue)}
                    </div>
                  </div>
                  <div className="relative h-6 bg-gray-200 rounded-full overflow-hidden">
                    <div 
                      className="absolute left-0 top-0 h-full transition-all duration-300"
                      style={{ 
                        width: `${percentage}%`,
                        backgroundColor: colorScale ? colorScale(consumptionValue) : '#3b82f6'
                      }}
                    />
                  </div>
                  <div className="flex justify-between text-xs text-gray-600 mt-1">
                    <span>Private: {formatPercentage(municipality.privateShare)}</span>
                    <span>Erhverv: {formatPercentage(municipality.industryShare)}</span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
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
    <section className="bg-white py-8 md:py-16 lg:py-24">
      <div className="container mx-auto px-4 max-w-7xl">
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
        <div className="mb-6 md:mb-8">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 p-3 md:p-4 bg-gray-50 rounded-lg border">
            <div className="flex items-center gap-2">
              <Filter className="w-4 h-4 text-gray-600" />
              <span className="text-sm font-medium text-gray-700">Filtre:</span>
            </div>
            
            <div className="flex flex-wrap items-center gap-2 md:gap-3 w-full sm:w-auto">
            <Select value={selectedView} onValueChange={setSelectedView}>
              <SelectTrigger className="w-full sm:w-40">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="24h">Seneste 24 timer</SelectItem>
                <SelectItem value="7d">Seneste 7 dage</SelectItem>
                <SelectItem value="30d">Seneste 30 dage</SelectItem>
                <SelectItem value="month">Denne måned</SelectItem>
              </SelectContent>
            </Select>

            <Select value={selectedConsumerType} onValueChange={setSelectedConsumerType}>
              <SelectTrigger className="w-full sm:w-40">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Alle forbrugere</SelectItem>
                <SelectItem value="private">Private</SelectItem>
                <SelectItem value="industry">Erhverv</SelectItem>
              </SelectContent>
            </Select>

            {!geoLoading && geoData && (
              <Select value={mapView} onValueChange={(value: 'map' | 'list') => setMapView(value)}>
                <SelectTrigger className="w-full sm:w-32">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="map">Kort</SelectItem>
                  <SelectItem value="list">Liste</SelectItem>
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
          
          {/* Date range display */}
          {dateRange && (
            <div className="flex items-center gap-2 text-sm text-gray-600 mt-2">
              <Calendar className="w-4 h-4" />
              <span>Viser data for perioden: {formatDateRange()}</span>
            </div>
          )}
        </div>

        {/* Main content area with side-by-side layout */}
        <div className={cn(
          "grid gap-6",
          isMobile ? "grid-cols-1" : "grid-cols-12"
        )}>
          {/* Map visualization - takes 8 columns on desktop */}
          <div className={cn(
            "bg-white p-4 rounded-lg border",
            isMobile ? "col-span-1" : "col-span-8"
          )}>
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <h3 className="text-lg font-semibold text-gray-900">
                  {mapView === 'map' ? 'Forbrugskort' : 'Kommuneliste'}
                </h3>
                <div className="group relative">
                  <Info className="w-4 h-4 text-gray-500 cursor-help" />
                  <div className="absolute left-0 bottom-full mb-2 hidden group-hover:block w-64 p-2 bg-gray-900 text-white text-sm rounded-lg shadow-lg z-50">
                    <p>
                      {mapView === 'map' 
                        ? 'Hold musen over en kommune på kortet for at se detaljerede oplysninger. Farver viser forbrugsniveau fra lav (lys) til høj (mørk).'
                        : 'Klik på en kommune i listen for at se detaljerede oplysninger. Søjlerne viser forbrugsniveau.'
                      }
                    </p>
                  </div>
                </div>
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
              <div className="min-h-[600px]">
                {mapView === 'map' && geoData ? renderMap() : renderMunicipalityList()}
              </div>
            )}
          </div>
          
          {/* Stats panel - takes 4 columns on desktop */}
          <div className={cn(
            "space-y-4",
            isMobile ? "col-span-1 mt-6" : "col-span-4 sticky top-4 h-fit"
          )}>
            {/* Statistics cards */}
            {showStatistics && statistics && !loading && (
              <div className={cn(
                "space-y-3",
                isMobile ? "grid grid-cols-2 gap-3 space-y-0" : "space-y-3"
              )}>
                <div className="bg-blue-50 rounded-lg p-3 md:p-4">
                  <div className="flex items-center gap-2 mb-1">
                    <Activity className="w-4 h-4 text-blue-600" />
                    <h3 className="text-xs md:text-sm font-semibold text-gray-700">Total forbrug</h3>
                  </div>
                  <div className="text-lg md:text-2xl font-bold text-blue-600">
                    {formatConsumption(statistics.totalConsumption)}
                  </div>
                </div>

                <div className="bg-green-50 rounded-lg p-3 md:p-4">
                  <div className="flex items-center gap-2 mb-1">
                    <Home className="w-4 h-4 text-green-600" />
                    <h3 className="text-xs md:text-sm font-semibold text-gray-700">Private</h3>
                  </div>
                  <div className="text-lg md:text-2xl font-bold text-green-600">
                    {formatPercentage(statistics.privateShareTotal)}
                  </div>
                </div>

                <div className="bg-orange-50 rounded-lg p-3 md:p-4">
                  <div className="flex items-center gap-2 mb-1">
                    <Building2 className="w-4 h-4 text-orange-600" />
                    <h3 className="text-xs md:text-sm font-semibold text-gray-700">Erhverv</h3>
                  </div>
                  <div className="text-lg md:text-2xl font-bold text-orange-600">
                    {formatPercentage(statistics.industryShareTotal)}
                  </div>
                </div>

                <div className="bg-gray-50 rounded-lg p-3 md:p-4">
                  <div className="flex items-center gap-2 mb-1">
                    <MapPin className="w-4 h-4 text-gray-600" />
                    <h3 className="text-xs md:text-sm font-semibold text-gray-700">Kommuner</h3>
                  </div>
                  <div className="text-lg md:text-2xl font-bold text-gray-700">
                    {statistics.municipalityCount}
                  </div>
                </div>
              </div>
            )}

            {/* Legend */}
            {renderLegend()}

            {/* Selected municipality details - now shows hint to hover for details */}
            {!selectedMunicipality && enableInteraction && (
              <div className="bg-gray-50 rounded-lg p-4 text-center">
                <Info className="w-6 h-6 text-gray-400 mx-auto mb-2" />
                <p className="text-sm text-gray-600">
                  Hold musen over en kommune på kortet for at se detaljeret information
                </p>
              </div>
            )}
            
            {/* Keep selected municipality for mobile where hover doesn't work well */}
            {selectedMunicipality && enableInteraction && isMobile && (
              <div className="bg-blue-50 rounded-lg p-4">
                <h3 className="text-base font-semibold text-gray-900 mb-3">
                  Valgt kommune
                </h3>
                {(() => {
                  const municipality = data.find(m => m.municipalityCode === selectedMunicipality);
                  if (!municipality) return <div>Kommune ikke fundet</div>;
                  
                  return (
                    <div className="space-y-3">
                      <div>
                        <div className="text-sm text-gray-600">Kommune</div>
                        <div className="font-semibold">{municipality.municipalityName}</div>
                      </div>
                      <div>
                        <div className="text-sm text-gray-600">Total forbrug</div>
                        <div className="font-semibold">{formatConsumption(municipality.totalConsumption)}</div>
                      </div>
                      <div>
                        <div className="text-sm text-gray-600">Private</div>
                        <div className="font-semibold">{formatConsumption(municipality.totalPrivateConsumption)} ({formatPercentage(municipality.privateShare)})</div>
                      </div>
                      <div>
                        <div className="text-sm text-gray-600">Erhverv</div>
                        <div className="font-semibold">{formatConsumption(municipality.totalIndustryConsumption)} ({formatPercentage(municipality.industryShare)})</div>
                      </div>
                    </div>
                  );
                })()}
              </div>
            )}
          </div>
        </div>
      </div>
    </section>
  );
};

// Debug: Component export
debug.component('ConsumptionMap', 'Component exported successfully');

export default ConsumptionMapComponent;