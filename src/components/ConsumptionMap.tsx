import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { Municipalities, MunicipalityType } from 'react-denmark-map';
import { scaleSequential } from 'd3-scale';
import { interpolateGreens, interpolateBlues, interpolateReds } from 'd3-scale-chromatic';
import { MapPin, Activity, Zap, Building2, Home, Info, Filter, Download, Calendar } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { cn } from '@/lib/utils';
import { PortableText } from '@portabletext/react';
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
import { 
  getMunicipalityNameFromCode, 
  getMunicipalityCodeFromName 
} from '@/utils/municipality/municipalityCodeMapping';

interface ConsumptionMapProps {
  block: ConsumptionMap;
}

// Register component for debugging
debug.component('ConsumptionMap', 'Component file loaded');

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
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedView, setSelectedView] = useState(defaultView);
  const [selectedConsumerType, setSelectedConsumerType] = useState(consumerType);
  const [selectedMunicipality, setSelectedMunicipality] = useState<string | null>(null);
  const [isMobile, setIsMobile] = useState(false);
  const [mapView, setMapView] = useState<'map' | 'list'>('map');
  const [dateRange, setDateRange] = useState<{ start: string; end: string } | null>(null);

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };
    
    checkMobile();
    window.addEventListener('resize', checkMobile);
    
    return () => window.removeEventListener('resize', checkMobile);
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
          // Custom brand color scale (green to blue)
          interpolator = (t: number) => {
            const r = Math.round(34 + (59 - 34) * t);
            const g = Math.round(197 + (130 - 197) * t);
            const b = Math.round(94 + (246 - 94) * t);
            return `rgb(${r}, ${g}, ${b})`;
          };
      }
    }
    
    return scaleSequential(interpolator).domain([minConsumption, maxConsumption]);
  }, [data, colorScheme, selectedConsumerType]);

  // Calculate statistics
  const statistics = useMemo(() => {
    if (data.length === 0) return null;
    return calculateConsumptionStats(data);
  }, [data]);

  // Handle municipality click
  const handleMunicipalityClick = useCallback((municipalityName: string) => {
    if (!enableInteraction) return;
    const code = getMunicipalityCodeFromName(municipalityName);
    setSelectedMunicipality(code === selectedMunicipality ? null : code);
  }, [enableInteraction, selectedMunicipality]);

  // Custom tooltip component
  const CustomTooltip = useCallback(({ area }: { area: MunicipalityType }) => {
    const municipalityCode = getMunicipalityCodeFromName(area.name);
    if (!municipalityCode) return null;
    
    const municipalityData = data.find(d => d.municipalityCode === municipalityCode);
    if (!municipalityData || !showTooltips) return null;

    return (
      <div className="bg-white/95 backdrop-blur shadow-xl border border-gray-200 rounded-lg p-4 max-w-xs">
        <div className="space-y-3">
          <div>
            <div className="font-bold text-base">{municipalityData.municipalityName}</div>
            <div className="text-xs text-gray-500">Kommune</div>
          </div>
          
          <div className="border-t pt-3 space-y-2">
            <div>
              <div className="text-xs text-gray-600">Total forbrug</div>
              <div className="font-semibold">{formatConsumption(municipalityData.totalConsumption)}</div>
            </div>
            
            <div className="grid grid-cols-2 gap-3">
              <div>
                <div className="text-xs text-gray-600">Private</div>
                <div className="font-semibold text-green-600">
                  {formatConsumption(municipalityData.totalPrivateConsumption)}
                </div>
                <div className="text-xs text-green-600">({formatPercentage(municipalityData.privateShare)})</div>
              </div>
              <div>
                <div className="text-xs text-gray-600">Erhverv</div>
                <div className="font-semibold text-orange-600">
                  {formatConsumption(municipalityData.totalIndustryConsumption)}
                </div>
                <div className="text-xs text-orange-600">({formatPercentage(municipalityData.industryShare)})</div>
              </div>
            </div>
            
            <div className="text-xs text-gray-500 pt-2 border-t">
              Forbrugsniveau: <span className="font-medium">{getConsumptionLevel(municipalityData.totalConsumption, statistics?.maxConsumption || 1)}</span>
            </div>
          </div>
        </div>
      </div>
    );
  }, [data, showTooltips, statistics]);

  // Customize municipality areas based on consumption data
  const customizeMunicipalities = useCallback((municipality: MunicipalityType) => {
    const municipalityCode = getMunicipalityCodeFromName(municipality.name);
    if (!municipalityCode || !colorScale) return undefined;
    
    const consumption = data.find(d => d.municipalityCode === municipalityCode);
    if (!consumption) return { style: { fill: '#e5e7eb' } };
    
    // Get consumption value based on selected filter
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
    
    const color = colorScale(value);
    const isSelected = municipalityCode === selectedMunicipality;
    
    return {
      style: {
        fill: color,
        stroke: isSelected ? '#3b82f6' : '#ffffff',
        strokeWidth: isSelected ? 2 : 0.5,
        cursor: enableInteraction ? 'pointer' : 'default'
      }
    };
  }, [data, colorScale, selectedConsumerType, selectedMunicipality, enableInteraction]);

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
    if (loading) {
      return (
        <div className="flex items-center justify-center h-[500px]">
          <div className="text-gray-500">Indlæser kort...</div>
        </div>
      );
    }

    if (error) {
      return (
        <div className="flex items-center justify-center h-[500px]">
          <div className="text-red-500">Fejl: {error}</div>
        </div>
      );
    }

    return (
      <div className="w-full relative bg-gray-50 rounded-lg overflow-hidden">
        <Municipalities 
          customTooltip={CustomTooltip}
          customizeAreas={customizeMunicipalities}
          onClick={handleMunicipalityClick}
          showTooltip={showTooltips}
          zoomable={true}
          className="w-full h-[500px]"
        />
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
            const consumption = getConsumptionForSort(municipality);
            const maxConsumption = Math.max(...sortedData.map(getConsumptionForSort));
            const percentage = (consumption / maxConsumption) * 100;
            const isSelected = municipality.municipalityCode === selectedMunicipality;

            return (
              <div
                key={municipality.municipalityCode}
                className={cn(
                  "p-3 rounded-lg border cursor-pointer transition-all",
                  isSelected
                    ? "border-blue-500 bg-blue-50"
                    : "border-gray-200 hover:border-gray-300 hover:bg-gray-50"
                )}
                onClick={() => handleMunicipalityClick(getMunicipalityNameFromCode(municipality.municipalityCode) || '')}
              >
                <div className="flex justify-between items-start mb-2">
                  <div>
                    <h4 className="font-semibold">{municipality.municipalityName}</h4>
                    <p className="text-sm text-gray-600">
                      Total: {formatConsumption(municipality.totalConsumption)}
                    </p>
                  </div>
                  <div className="text-right">
                    <div className="text-sm text-gray-600">
                      Private: {formatPercentage(municipality.privateShare)}
                    </div>
                    <div className="text-sm text-gray-600">
                      Erhverv: {formatPercentage(municipality.industryShare)}
                    </div>
                  </div>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div
                    className="h-2 rounded-full transition-all duration-300"
                    style={{
                      width: `${percentage}%`,
                      backgroundColor: colorScale ? colorScale(consumption) : '#3b82f6'
                    }}
                  />
                </div>
              </div>
            );
          })}
        </div>
      </div>
    );
  };

  return (
    <section className="py-8">
      <div className="container mx-auto px-4">
        {/* Header */}
        <div className={cn("mb-8", headerAlignment === 'center' && "text-center")}>
          <h2 className="text-3xl font-bold text-brand-dark mb-2">{title}</h2>
          {subtitle && (
            <p className="text-lg text-gray-600 mb-4">{subtitle}</p>
          )}
          {leadingText && (
            <div className="prose prose-gray max-w-none mb-4">
              <PortableText value={leadingText} />
            </div>
          )}
        </div>

        {/* Controls */}
        <div className="mb-6 flex flex-wrap gap-4">
          <div className="flex gap-2">
            <Button
              variant={mapView === 'map' ? 'default' : 'outline'}
              onClick={() => setMapView('map')}
              size="sm"
            >
              <MapPin className="w-4 h-4 mr-2" />
              Kort
            </Button>
            <Button
              variant={mapView === 'list' ? 'default' : 'outline'}
              onClick={() => setMapView('list')}
              size="sm"
            >
              <Activity className="w-4 h-4 mr-2" />
              Liste
            </Button>
          </div>

          <Select value={selectedView} onValueChange={setSelectedView}>
            <SelectTrigger className="w-[180px]">
              <Calendar className="w-4 h-4 mr-2" />
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="24h">Seneste 24 timer</SelectItem>
              <SelectItem value="7d">Seneste 7 dage</SelectItem>
              <SelectItem value="30d">Seneste 30 dage</SelectItem>
              <SelectItem value="month">Seneste måned</SelectItem>
            </SelectContent>
          </Select>

          <Select value={selectedConsumerType} onValueChange={setSelectedConsumerType}>
            <SelectTrigger className="w-[180px]">
              <Filter className="w-4 h-4 mr-2" />
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">
                <div className="flex items-center">
                  <Zap className="w-4 h-4 mr-2" />
                  Alle forbrugere
                </div>
              </SelectItem>
              <SelectItem value="private">
                <div className="flex items-center">
                  <Home className="w-4 h-4 mr-2" />
                  Private
                </div>
              </SelectItem>
              <SelectItem value="industry">
                <div className="flex items-center">
                  <Building2 className="w-4 h-4 mr-2" />
                  Erhverv
                </div>
              </SelectItem>
            </SelectContent>
          </Select>

          {dateRange && (
            <div className="text-sm text-gray-600 flex items-center">
              <Info className="w-4 h-4 mr-1" />
              Viser data for perioden: {formatDateRange()}
            </div>
          )}
        </div>

        {/* Content Layout */}
        <div className={cn(
          "grid gap-6",
          showStatistics ? "lg:grid-cols-3" : "lg:grid-cols-1"
        )}>
          {/* Map/List View */}
          <div className={showStatistics ? "lg:col-span-2" : ""}>
            {mapView === 'map' ? renderMap() : renderMunicipalityList()}
          </div>

          {/* Statistics Panel */}
          {showStatistics && statistics && (
            <div className="space-y-4">
              {/* Summary Stats */}
              <div className="bg-white rounded-lg shadow p-6">
                <h3 className="font-semibold text-lg mb-4">Samlet forbrug</h3>
                <div className="space-y-3">
                  <div>
                    <div className="text-3xl font-bold text-blue-600">
                      {formatConsumption(statistics.totalConsumption)}
                    </div>
                    <div className="text-sm text-gray-600">Total forbrug</div>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <div className="text-xl font-semibold text-green-600">
                        {formatPercentage(statistics.privateShareTotal)}
                      </div>
                      <div className="text-sm text-gray-600">Private</div>
                    </div>
                    <div>
                      <div className="text-xl font-semibold text-orange-600">
                        {formatPercentage(statistics.industryShareTotal)}
                      </div>
                      <div className="text-sm text-gray-600">Erhverv</div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Consumption Level Legend */}
              {showLegend && (
                <div className="bg-white rounded-lg shadow p-6">
                  <h3 className="font-semibold text-lg mb-4">Forbrugsniveau</h3>
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-sm">Lav</span>
                      <div className="w-20 h-4 bg-gradient-to-r from-green-200 to-green-300 rounded" />
                      <span className="text-sm">0-25%</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm">Moderat</span>
                      <div className="w-20 h-4 bg-gradient-to-r from-green-300 to-green-400 rounded" />
                      <span className="text-sm">25-50%</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm">Høj</span>
                      <div className="w-20 h-4 bg-gradient-to-r from-green-400 to-green-500 rounded" />
                      <span className="text-sm">50-75%</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm">Meget høj</span>
                      <div className="w-20 h-4 bg-gradient-to-r from-green-500 to-green-600 rounded" />
                      <span className="text-sm">75-100%</span>
                    </div>
                  </div>
                </div>
              )}

              {/* Statistics */}
              <div className="bg-white rounded-lg shadow p-6">
                <h3 className="font-semibold text-lg mb-4">Statistik</h3>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Kommuner</span>
                    <span className="font-medium">{statistics.municipalityCount}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Gennemsnit</span>
                    <span className="font-medium">{formatConsumption(statistics.averageConsumption)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Højeste</span>
                    <span className="font-medium">{formatConsumption(statistics.maxConsumption)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Laveste</span>
                    <span className="font-medium">{formatConsumption(statistics.minConsumption)}</span>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </section>
  );
};

// Register component export
debug.component('ConsumptionMap', 'Component exported successfully');

export default ConsumptionMapComponent;