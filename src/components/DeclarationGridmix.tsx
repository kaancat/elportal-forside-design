import React, { useState, useEffect, useMemo } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, ResponsiveContainer, Tooltip, Legend, Cell } from 'recharts';
import { CalendarDays, ChevronLeft, ChevronRight, Zap, AlertCircle, Leaf } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { PortableText } from '@portabletext/react';
import type { DeclarationGridmix } from '@/types/sanity';

interface GridmixRecord {
  HourUTC: string;
  HourDK: string;
  PriceArea: string;
  totalShare: number;
  totalCO2: number;
  mixByType: Record<string, {
    shareMWh: number;
    co2Emission: number;
    percentage: number;
    origin?: string;
    isImport?: boolean;
    baseType?: string;
  }>;
  renewableShare: number;
  fossilShare: number;
  importShare: number;
  renewablePercentage: number;
  fossilPercentage: number;
  importPercentage: number;
  averageCO2: number;
}

interface DeclarationGridmixProps {
  block: DeclarationGridmix;
}

const formatDateForApi = (date: Date) => date.toISOString().split('T')[0];

// Energy source color mapping
const energySourceColors = {
  // Renewable - Green shades
  'Wind': '#16a34a',
  'WindOffshore': '#059669',
  'WindOnshore': '#10b981',
  'Solar': '#fbbf24',
  'SolarPV': '#fbbf24',
  'Hydro': '#0ea5e9',
  'BioGas': '#22c55e',
  'Straw': '#a3e635',
  'Wood': '#166534',
  'WasteIncineration': '#15803d',
  'Waste': '#15803d',
  'Biomass': '#365314',
  
  // Fossil - Red/Orange shades
  'FossilGas': '#dc2626',
  'Coal': '#991b1b',
  'Oil': '#b91c1c',
  'Fossil Oil': '#b91c1c',
  'Fossil gas': '#ef4444',
  
  // Nuclear - Purple
  'Nuclear': '#7c3aed',
  
  // Import/Export - Blue/Gray shades
  'Import': '#3b82f6',
  'Export': '#64748b',
  
  // Land/Sea categories
  'Onshore': '#4ade80',
  'Offshore': '#06b6d4',
  
  // Default/Other
  'Other': '#6b7280',
  'Andet': '#6b7280'
};

// Custom X-axis tick component
const CustomXAxisTick = ({ x, y, payload }: any) => {
  const lines = payload.value.split('\n');
  return (
    <g transform={`translate(${x},${y})`}>
      <text 
        x={0} 
        y={0} 
        dy={16} 
        textAnchor="middle" 
        fill="#666"
        fontSize={12}
      >
        {lines.map((line: string, index: number) => (
          <tspan x={0} dy={index === 0 ? 0 : 14} key={index}>
            {line}
          </tspan>
        ))}
      </text>
    </g>
  );
};

// Custom tooltip component
const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    const total = payload.reduce((sum: number, entry: any) => sum + (entry.value || 0), 0);
    
    return (
      <div className="bg-gray-800 text-white p-4 rounded-lg shadow-lg border min-w-[280px]">
        <p className="font-semibold mb-3">{label}</p>
        <div className="space-y-2">
          <div className="flex justify-between items-center border-b pb-2">
            <span>Total:</span>
            <span className="font-mono font-semibold">{total.toFixed(1)}%</span>
          </div>
          {payload.map((entry: any, index: number) => (
            <div key={index} className="flex justify-between items-center">
              <div className="flex items-center gap-2">
                <div 
                  className="w-3 h-3 rounded" 
                  style={{ backgroundColor: entry.fill }}
                />
                <span>{entry.name}:</span>
              </div>
              <span className="font-mono">{entry.value.toFixed(1)}%</span>
            </div>
          ))}
        </div>
      </div>
    );
  }
  return null;
};

// Summary gauge component
const GridmixSummary: React.FC<{ data: GridmixRecord | null }> = ({ data }) => {
  if (!data) return null;
  
  const renewableColor = '#16a34a';
  const fossilColor = '#dc2626';
  const importColor = '#3b82f6';
  
  return (
    <div className="bg-gray-50 rounded-lg p-6 space-y-4">
      <h3 className="text-sm font-semibold text-gray-700 mb-4 text-center">Energimix oversigt</h3>
      
      {/* Renewable percentage */}
      <div className="text-center">
        <div className="relative inline-flex items-center justify-center">
          <div className="w-24 h-24 rounded-full border-4" style={{ borderColor: renewableColor }}>
            <div className="flex flex-col items-center justify-center h-full">
              <Leaf size={20} style={{ color: renewableColor }} />
              <span className="text-lg font-bold">{data.renewablePercentage.toFixed(0)}%</span>
            </div>
          </div>
        </div>
        <Badge className="mt-2" style={{ backgroundColor: renewableColor, color: 'white' }}>
          Vedvarende
        </Badge>
      </div>
      
      {/* Statistics */}
      <div className="space-y-2 text-sm">
        <div className="flex justify-between items-center">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full" style={{ backgroundColor: renewableColor }}></div>
            <span>Vedvarende:</span>
          </div>
          <span className="font-mono font-medium">{data.renewablePercentage.toFixed(1)}%</span>
        </div>
        <div className="flex justify-between items-center">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full" style={{ backgroundColor: fossilColor }}></div>
            <span>Fossil:</span>
          </div>
          <span className="font-mono font-medium">{data.fossilPercentage.toFixed(1)}%</span>
        </div>
        <div className="flex justify-between items-center">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full" style={{ backgroundColor: importColor }}></div>
            <span>Import:</span>
          </div>
          <span className="font-mono font-medium">{data.importPercentage.toFixed(1)}%</span>
        </div>
        <div className="flex justify-between items-center pt-2 border-t">
          <span>Ø CO₂-intensitet:</span>
          <span className="font-mono font-medium">{data.averageCO2.toFixed(0)} g/kWh</span>
        </div>
      </div>
    </div>
  );
};

const DeclarationGridmix: React.FC<DeclarationGridmixProps> = ({ block }) => {
  // Set default values for missing fields
  const title = block.title || 'Energimix fordeling';
  const subtitle = block.subtitle || 'Realtids fordeling af Danmarks energiproduktion efter kilde';
  const leadingText = block.leadingText;
  const headerAlignment = block.headerAlignment || 'center';
  const showSummary = block.showSummary !== undefined ? block.showSummary : true;
  const view = block.view || '7d';

  const [data, setData] = useState<GridmixRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedDate, setSelectedDate] = useState(() => {
    // Default to yesterday to ensure data availability
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    return yesterday;
  });
  const [isCalendarOpen, setIsCalendarOpen] = useState(false);
  const [selectedRegion, setSelectedRegion] = useState<'Danmark' | 'DK1' | 'DK2'>('Danmark');
  const [selectedView, setSelectedView] = useState<'7d' | '30d'>(view === '24h' ? '7d' : view);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      setError(null);
      try {
        const apiUrl = `/api/declaration-gridmix?region=${selectedRegion}&date=${formatDateForApi(selectedDate)}&view=${selectedView}`;
        console.log('Fetching gridmix data from:', apiUrl);
        
        const response = await fetch(apiUrl);
        if (!response.ok) {
          const errorText = await response.text();
          console.error('API Error:', response.status, errorText);
          throw new Error(`API fejl (${response.status}): ${errorText}`);
        }
        
        const result = await response.json();
        console.log('API Response:', result);
        
        if (!result.records || result.records.length === 0) {
          console.warn('No data received from API');
          setData([]);
          return;
        }
        
        setData(result.records);
      } catch (err: any) {
        console.error('Fetch error:', err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };
    
    fetchData();
  }, [selectedRegion, selectedDate, selectedView]);

  // Calculate current hour data for pie chart
  const currentHourData = useMemo(() => {
    if (!data || data.length === 0) return null;
    
    // For 24h view, get the latest hour
    // For longer periods, get average
    const latest = data[data.length - 1];
    return latest;
  }, [data]);

  // Get actual data date range
  const dataDateRange = useMemo(() => {
    if (!data || data.length === 0) return null;
    
    const firstDate = new Date(data[0].HourDK);
    const lastDate = new Date(data[data.length - 1].HourDK);
    
    return {
      start: firstDate.toLocaleDateString('da-DK'),
      end: lastDate.toLocaleDateString('da-DK'),
      single: firstDate.toDateString() === lastDate.toDateString()
    };
  }, [data]);

  // Transform data for bar chart
  const barChartData = useMemo(() => {
    if (!currentHourData) return { name: 'Energimix', children: [] };
    
    // Create proper display names
    const nameMapping: Record<string, string> = {
      'WindOnshore': 'Vind (land)',
      'WindOffshore': 'Vind (hav)',
      'Wind': 'Vind',
      'Solar': 'Sol',
      'SolarPV': 'Sol',
      'Hydro': 'Vandkraft',
      'Nuclear': 'Atomkraft',
      'BioGas': 'Biogas',
      'Straw': 'Halm',
      'Wood': 'Træ',
      'WasteIncineration': 'Affaldsforbrænding',
      'FossilGas': 'Naturgas',
      'Coal': 'Kul',
      'Oil': 'Olie',
      'Fossil Oil': 'Olie',
      'Fossil gas': 'Naturgas',
      'Import': 'Import',
      'Export': 'Eksport',
      'Other': 'Andet',
      'Waste': 'Affald',
      'Biomass': 'Biomasse',
      'Onshore': 'Land',
      'Offshore': 'Hav'
    };
    
    // Country name mapping
    const countryMapping: Record<string, string> = {
      'SE': 'Sverige',
      'GB': 'Storbritannien',
      'NL': 'Holland',
      'NO2': 'Norge',
      'DK1': '',
      'DK2': ''
    };
    
    // Group by base energy type
    const groupedData: Record<string, any[]> = {};
    
    Object.entries(currentHourData.mixByType)
      .filter(([_, value]) => value.percentage > 0)
      .forEach(([key, value]) => {
        const baseType = value.baseType || key;
        const origin = value.origin;
        const isImport = value.isImport || false;
        
        if (!groupedData[baseType]) {
          groupedData[baseType] = [];
        }
        
        groupedData[baseType].push({
          origin: origin,
          percentage: value.percentage,
          shareMWh: value.shareMWh,
          co2Emission: value.co2Emission,
          isImport: isImport,
          country: isImport && origin && countryMapping[origin] ? countryMapping[origin] : 'Danmark'
        });
      });
    
    // Create bar chart data with stacked origins
    const chartData = Object.entries(groupedData)
      .map(([baseType, origins]) => {
        const totalPercentage = origins.reduce((sum, o) => sum + o.percentage, 0);
        const typeName = nameMapping[baseType] || baseType.replace(/([A-Z])/g, ' $1').trim();
        
        const dataPoint: any = {
          name: typeName,
          total: totalPercentage,
          baseType: baseType
        };
        
        // Add each origin as a separate field
        origins.forEach(origin => {
          const key = origin.isImport ? origin.country : 'Danmark';
          dataPoint[key] = (dataPoint[key] || 0) + origin.percentage;
        });
        
        return dataPoint;
      })
      .sort((a, b) => b.total - a.total)
      .slice(0, 15); // Limit to top 15 energy types
    
    return chartData;
  }, [currentHourData]);

  // Check if selected date is in the future
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const isFuture = selectedDate > today;

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
        <div className="flex flex-col lg:flex-row justify-between items-center mb-8 gap-4 p-4 bg-gray-50 rounded-lg border">
          <div className="flex items-center gap-2">
            <Button 
              variant="ghost" 
              size="icon" 
              onClick={() => setSelectedDate(d => { 
                const n = new Date(d); 
                n.setDate(d.getDate() - 1); 
                return n; 
              })}
            >
              <ChevronLeft size={18} />
            </Button>
            <Popover open={isCalendarOpen} onOpenChange={setIsCalendarOpen}>
              <PopoverTrigger asChild>
                <Button variant="outline" className="w-[200px] justify-start text-left font-normal">
                  <CalendarDays className="mr-2 h-4 w-4" />
                  {selectedDate.toLocaleDateString('da-DK')}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0">
                <Calendar 
                  mode="single" 
                  selected={selectedDate} 
                  onSelect={(d) => { 
                    if(d) setSelectedDate(d); 
                    setIsCalendarOpen(false); 
                  }} 
                  disabled={(date) => date > new Date()} 
                  initialFocus 
                />
              </PopoverContent>
            </Popover>
            <Button 
              variant="ghost" 
              size="icon" 
              onClick={() => setSelectedDate(d => { 
                const n = new Date(d); 
                n.setDate(d.getDate() + 1); 
                return n; 
              })} 
              disabled={isFuture}
            >
              <ChevronRight size={18} />
            </Button>
          </div>
          
          <div className="flex items-center gap-2">
            <Button 
              onClick={() => setSelectedView('7d')} 
              variant={selectedView === '7d' ? 'default' : 'outline'}
              size="sm"
            >
              7 dage
            </Button>
            <Button 
              onClick={() => setSelectedView('30d')} 
              variant={selectedView === '30d' ? 'default' : 'outline'}
              size="sm"
            >
              30 dage
            </Button>
          </div>
          
          <div className="flex items-center gap-2">
            <Button 
              onClick={() => setSelectedRegion('Danmark')} 
              variant={selectedRegion === 'Danmark' ? 'default' : 'outline'}
              size="sm"
            >
              Danmark
            </Button>
            <Button 
              onClick={() => setSelectedRegion('DK1')} 
              variant={selectedRegion === 'DK1' ? 'default' : 'outline'}
              size="sm"
            >
              DK1
            </Button>
            <Button 
              onClick={() => setSelectedRegion('DK2')} 
              variant={selectedRegion === 'DK2' ? 'default' : 'outline'}
              size="sm"
            >
              DK2
            </Button>
          </div>
        </div>

        {/* Data delay notice */}
        <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 mb-6">
          <div className="flex items-start gap-3">
            <AlertCircle className="text-amber-600 mt-0.5" size={20} />
            <div className="text-sm text-amber-800">
              <p className="font-medium mb-1">Data forsinkelse</p>
              <p>Energimix data er typisk forsinket med 7-10 dage. De viste data er de senest tilgængelige fra Energinet.</p>
            </div>
          </div>
        </div>

        {/* Import info - only show if there are imports */}
        {data.length > 0 && currentHourData && currentHourData.importPercentage > 0 && (
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
            <div className="flex items-start gap-3">
              <Zap className="text-blue-600 mt-0.5" size={20} />
              <div className="text-sm text-blue-800">
                <p className="font-medium mb-1">Vidste du det?</p>
                <p>Danmark har ingen atomkraftværker, men importerer el fra nabolande. Se i visualiseringen hvilke energityper der kommer fra Sverige, Norge, Tyskland og andre lande!</p>
              </div>
            </div>
          </div>
        )}

        {/* Main content area */}
        <div className="grid lg:grid-cols-4 gap-6">
          {/* Chart */}
          <div className={cn(
            "bg-white p-6 rounded-lg border",
            showSummary ? "lg:col-span-3" : "lg:col-span-4"
          )}>
            {loading ? (
              <div className="flex items-center justify-center h-[500px]">
                <div className="text-gray-500">Indlæser energimix data...</div>
              </div>
            ) : error ? (
              <div className="flex items-center justify-center h-[500px]">
                <div className="text-red-500 flex items-center gap-2">
                  <AlertCircle size={20} />
                  {error}
                </div>
              </div>
            ) : barChartData.length === 0 ? (
              <div className="flex items-center justify-center h-[500px]">
                <div className="text-gray-500 text-center">
                  <AlertCircle size={40} className="mx-auto mb-4 text-gray-400" />
                  <div className="text-lg font-medium mb-2">Ingen data tilgængelig</div>
                  <div className="text-sm">
                    {selectedView === '7d' ? (
                      <>
                        Der er ingen energimix data tilgængelig for de valgte 7 dage i {selectedRegion}.
                        <br />
                        Prøv at vælge en tidligere dato.
                      </>
                    ) : (
                      <>
                        Der er ingen energimix data tilgængelig for de valgte 30 dage i {selectedRegion}.
                        <br />
                        Prøv at vælge en tidligere dato.
                      </>
                    )}
                  </div>
                </div>
              </div>
            ) : (
              <div>
                {dataDateRange && (
                  <div className="text-sm text-gray-600 mb-4 text-center">
                    Viser data for: {dataDateRange.single ? dataDateRange.start : `${dataDateRange.start} - ${dataDateRange.end}`}
                  </div>
                )}
                <div className="h-[500px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart
                      data={barChartData}
                      margin={{ top: 20, right: 30, left: 40, bottom: 80 }}
                    >
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis 
                        dataKey="name" 
                        tick={<CustomXAxisTick />}
                        height={100}
                      />
                      <YAxis 
                        label={{ value: 'Procentdel (%)', angle: -90, position: 'insideLeft' }}
                      />
                      <Tooltip content={<CustomTooltip />} />
                      <Legend 
                        verticalAlign="top" 
                        height={36}
                        wrapperStyle={{ paddingBottom: '20px' }}
                      />
                      {/* Dynamic bars for each country */}
                      {['Danmark', 'Sverige', 'Norge', 'Storbritannien', 'Holland', 'Tyskland'].map((country, index) => {
                        const hasData = barChartData.some(d => d[country] > 0);
                        if (!hasData) return null;
                        
                        const colors: Record<string, string> = {
                          'Danmark': '#059669',
                          'Sverige': '#3b82f6',
                          'Norge': '#8b5cf6',
                          'Storbritannien': '#ef4444',
                          'Holland': '#f59e0b',
                          'Tyskland': '#6b7280'
                        };
                        
                        return (
                          <Bar 
                            key={country}
                            dataKey={country} 
                            stackId="a" 
                            fill={colors[country] || '#6b7280'}
                          />
                        );
                      })}
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>
            )}
          </div>

          {/* Summary */}
          {showSummary && currentHourData && (
            <div className="space-y-4">
              <GridmixSummary data={currentHourData} />
            </div>
          )}
        </div>

        {/* Energy Sources Table */}
        {barChartData.length > 0 && (
          <div className="mt-8">
            <div className="bg-gray-50 rounded-lg p-6">
              <h3 className="text-base font-semibold text-gray-700 mb-4 text-center">Detaljeret energifordeling</h3>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b">
                      <th className="text-left py-2">Energikilde</th>
                      <th className="text-right py-2">Total (%)</th>
                      <th className="text-right py-2">Danmark</th>
                      <th className="text-right py-2">Import</th>
                    </tr>
                  </thead>
                  <tbody>
                    {barChartData.map((entry, index) => {
                      const domesticPercentage = entry.Danmark || 0;
                      const importPercentage = entry.total - domesticPercentage;
                      
                      return (
                        <tr key={index} className="border-b">
                          <td className="py-2 font-medium">{entry.name}</td>
                          <td className="text-right font-mono">{entry.total.toFixed(1)}%</td>
                          <td className="text-right font-mono text-green-600">
                            {domesticPercentage > 0 ? `${domesticPercentage.toFixed(1)}%` : '-'}
                          </td>
                          <td className="text-right font-mono text-blue-600">
                            {importPercentage > 0 ? `${importPercentage.toFixed(1)}%` : '-'}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* Static Legend for all energy types */}
        <div className="mt-6 flex justify-center">
          <div className="bg-gray-50 rounded-lg p-4 max-w-5xl">
            <h3 className="text-sm font-semibold text-gray-700 mb-3 text-center">Alle energikilder</h3>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              <div className="space-y-2">
                <h4 className="text-xs font-medium text-gray-600 uppercase">Vedvarende</h4>
                <div className="space-y-1">
                  {Object.entries(energySourceColors)
                    .filter(([key]) => ['Wind', 'Solar', 'Hydro', 'BioGas', 'Straw', 'Wood'].includes(key))
                    .map(([key, color]) => (
                      <div key={key} className="flex items-center gap-2">
                        <div className="w-3 h-3 rounded" style={{ backgroundColor: color }}></div>
                        <span className="text-xs">{key}</span>
                      </div>
                    ))}
                </div>
              </div>
              <div className="space-y-2">
                <h4 className="text-xs font-medium text-gray-600 uppercase">Fossil</h4>
                <div className="space-y-1">
                  {Object.entries(energySourceColors)
                    .filter(([key]) => ['FossilGas', 'Coal', 'Oil'].includes(key))
                    .map(([key, color]) => (
                      <div key={key} className="flex items-center gap-2">
                        <div className="w-3 h-3 rounded" style={{ backgroundColor: color }}></div>
                        <span className="text-xs">{key}</span>
                      </div>
                    ))}
                </div>
              </div>
              <div className="space-y-2">
                <h4 className="text-xs font-medium text-gray-600 uppercase">Andre</h4>
                <div className="space-y-1">
                  {Object.entries(energySourceColors)
                    .filter(([key]) => ['Nuclear', 'Import', 'WasteIncineration'].includes(key))
                    .map(([key, color]) => (
                      <div key={key} className="flex items-center gap-2">
                        <div className="w-3 h-3 rounded" style={{ backgroundColor: color }}></div>
                        <span className="text-xs">{key}</span>
                      </div>
                    ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default DeclarationGridmix;