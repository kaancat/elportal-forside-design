import React, { useState, useEffect, useMemo } from 'react';
import { AreaChart, Area, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import { Activity, Wind, Sun, Flame, Leaf, TrendingDown, Calendar } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { PortableText } from '@portabletext/react';
import type { DeclarationProduction } from '@/types/sanity';

interface ProductionRecord {
  HourDK: string;
  HourUTC: string;
  PriceArea: string;
  totalProduction: number;
  averageCO2: number;
  renewableShare: number;
  productionByType: Record<string, {
    production: number;
    co2PerKWh: number;
    share: number;
  }>;
}

interface DeclarationProductionChartProps {
  block: DeclarationProduction;
}

// Production type configurations with Danish names and colors
const productionTypes = {
  WindOffshore: { name: 'Havvind', color: '#0ea5e9', icon: Wind, renewable: true },
  WindOnshore: { name: 'Landvind', color: '#06b6d4', icon: Wind, renewable: true },
  Solar: { name: 'Sol', color: '#facc15', icon: Sun, renewable: true },
  Hydro: { name: 'Vandkraft', color: '#3b82f6', icon: Activity, renewable: true },
  BioGas: { name: 'Biogas', color: '#10b981', icon: Leaf, renewable: true },
  Straw: { name: 'Halm', color: '#84cc16', icon: Leaf, renewable: true },
  Wood: { name: 'Træ', color: '#22c55e', icon: Leaf, renewable: true },
  FossilGas: { name: 'Naturgas', color: '#f97316', icon: Flame, renewable: false },
  Coal: { name: 'Kul', color: '#dc2626', icon: Flame, renewable: false },
  'Fossil Oil': { name: 'Olie', color: '#991b1b', icon: Flame, renewable: false },
  Waste: { name: 'Affald', color: '#6b7280', icon: Activity, renewable: false }
};

// Custom tooltip for production breakdown
const ProductionTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    const total = payload.reduce((sum: number, entry: any) => sum + (entry.value || 0), 0);
    return (
      <div className="bg-gray-800 text-white p-4 rounded-lg shadow-lg border border-gray-700 min-w-[280px]">
        <p className="font-bold text-base mb-3">{label}</p>
        <div className="text-sm space-y-1.5">
          {payload.slice().reverse().map((entry: any) => {
            const config = productionTypes[entry.dataKey as keyof typeof productionTypes];
            if (!config || entry.value === 0) return null;
            const percentage = total > 0 ? (entry.value / total * 100).toFixed(1) : '0';
            return (
              <div key={entry.dataKey} className="flex justify-between items-center gap-4">
                <div className="flex items-center gap-2">
                  <span className="inline-block w-3 h-3 rounded-full" style={{ backgroundColor: entry.color }} />
                  <span>{config.name}:</span>
                </div>
                <span className="font-mono text-right">
                  {entry.value.toFixed(0)} MW ({percentage}%)
                </span>
              </div>
            );
          })}
          <div className="border-t border-gray-600 mt-2 pt-2">
            <div className="flex justify-between font-bold">
              <span>Total:</span>
              <span className="font-mono">{total.toFixed(0)} MW</span>
            </div>
          </div>
        </div>
      </div>
    );
  }
  return null;
};

// Custom tooltip for CO2 intensity
const CO2Tooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    const co2Value = payload[0].value;
    return (
      <div className="bg-white p-4 rounded-lg shadow-lg border min-w-[220px]">
        <p className="font-semibold text-gray-900 mb-2">{label}</p>
        <div className="space-y-2">
          <div className="flex justify-between items-center">
            <span className="text-gray-600">CO₂-intensitet:</span>
            <span className="font-mono font-semibold">{co2Value.toFixed(0)} g/kWh</span>
          </div>
          <div className="text-xs text-gray-500 pt-1 border-t">
            {co2Value < 100 ? 'Meget lav' : co2Value < 200 ? 'Lav' : co2Value < 300 ? 'Moderat' : 'Høj'}
          </div>
        </div>
      </div>
    );
  }
  return null;
};

const DeclarationProductionChart: React.FC<DeclarationProductionChartProps> = ({ block }) => {
  // Set default values for missing fields
  const title = block.title || 'Elproduktion og CO₂-udledning';
  const subtitle = block.subtitle || 'Realtids opdeling af elproduktion og CO₂-intensitet';
  const leadingText = block.leadingText;
  const showProductionBreakdown = block.showProductionBreakdown !== undefined ? block.showProductionBreakdown : true;
  const showCO2Intensity = block.showCO2Intensity !== undefined ? block.showCO2Intensity : true;
  const showRenewableShare = block.showRenewableShare !== undefined ? block.showRenewableShare : true;
  const defaultView = block.defaultView || '24h';
  const headerAlignment = block.headerAlignment || 'center';

  const [data, setData] = useState<ProductionRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedView, setSelectedView] = useState<'24h' | '7d' | '30d'>(defaultView as '24h' | '7d' | '30d');
  const [selectedRegion, setSelectedRegion] = useState<'Danmark' | 'DK1' | 'DK2'>('Danmark');

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      setError(null);
      try {
        const apiUrl = `/api/declaration-production?region=${selectedRegion}&view=${selectedView}`;
        console.log('Fetching declaration production data from:', apiUrl);
        
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
        
        // Transform data for the charts
        const chartData = result.records.map((record: ProductionRecord) => {
          const transformed: any = {
            time: new Date(record.HourDK).toLocaleString('da-DK', { 
              month: 'short',
              day: 'numeric',
              hour: selectedView === '24h' ? '2-digit' : undefined,
              minute: selectedView === '24h' ? '2-digit' : undefined
            }).replace(/\./g, ':'),
            averageCO2: record.averageCO2,
            renewableShare: record.renewableShare,
            totalProduction: record.totalProduction
          };
          
          // Add production by type
          Object.entries(record.productionByType).forEach(([type, data]) => {
            transformed[type] = data.production;
          });
          
          return transformed;
        });
        
        console.log('Chart data:', chartData);
        setData(chartData);
      } catch (err: any) {
        console.error('Fetch error:', err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };
    
    fetchData();
  }, [selectedRegion, selectedView]);

  // Calculate current statistics
  const currentStats = useMemo(() => {
    if (!data || data.length === 0) return null;
    
    const latest = data[data.length - 1];
    const avgCO2 = data.reduce((sum, d) => sum + d.averageCO2, 0) / data.length;
    const avgRenewable = data.reduce((sum, d) => sum + d.renewableShare, 0) / data.length;
    
    return {
      currentCO2: latest.averageCO2,
      currentRenewable: latest.renewableShare,
      avgCO2,
      avgRenewable
    };
  }, [data]);

  // Get CO2 color based on intensity
  const getCO2Color = (value: number) => {
    if (value < 100) return '#16a34a';
    if (value < 200) return '#84cc16';
    if (value < 300) return '#eab308';
    return '#dc2626';
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
            <Button 
              onClick={() => setSelectedView('24h')} 
              variant={selectedView === '24h' ? 'default' : 'outline'}
              size="sm"
            >
              24 timer
            </Button>
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
              Hele Danmark
            </Button>
            <Button 
              onClick={() => setSelectedRegion('DK1')} 
              variant={selectedRegion === 'DK1' ? 'default' : 'outline'}
              size="sm"
            >
              DK1 (Vest)
            </Button>
            <Button 
              onClick={() => setSelectedRegion('DK2')} 
              variant={selectedRegion === 'DK2' ? 'default' : 'outline'}
              size="sm"
            >
              DK2 (Øst)
            </Button>
          </div>
        </div>

        {/* Current statistics cards */}
        {showRenewableShare && currentStats && !loading && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
            <div className="bg-green-50 rounded-lg p-6 text-center">
              <div className="flex items-center justify-center gap-2 mb-2">
                <Leaf className="w-5 h-5 text-green-600" />
                <h3 className="text-sm font-semibold text-gray-700">Vedvarende energi</h3>
              </div>
              <div className="text-3xl font-bold text-green-600">
                {currentStats.currentRenewable.toFixed(1)}%
              </div>
              <div className="text-xs text-gray-600 mt-1">
                Gennemsnit: {currentStats.avgRenewable.toFixed(1)}%
              </div>
            </div>
            
            <div className="bg-blue-50 rounded-lg p-6 text-center">
              <div className="flex items-center justify-center gap-2 mb-2">
                <TrendingDown className="w-5 h-5 text-blue-600" />
                <h3 className="text-sm font-semibold text-gray-700">CO₂-intensitet</h3>
              </div>
              <div 
                className="text-3xl font-bold"
                style={{ color: getCO2Color(currentStats.currentCO2) }}
              >
                {currentStats.currentCO2.toFixed(0)} g/kWh
              </div>
              <div className="text-xs text-gray-600 mt-1">
                Gennemsnit: {currentStats.avgCO2.toFixed(0)} g/kWh
              </div>
            </div>
            
            <div className="bg-gray-50 rounded-lg p-6 text-center">
              <div className="flex items-center justify-center gap-2 mb-2">
                <Activity className="w-5 h-5 text-gray-600" />
                <h3 className="text-sm font-semibold text-gray-700">Total produktion</h3>
              </div>
              <div className="text-3xl font-bold text-gray-700">
                {data[data.length - 1]?.totalProduction.toFixed(0)} MW
              </div>
              <div className="text-xs text-gray-600 mt-1">
                {selectedRegion} • {selectedView}
              </div>
            </div>
          </div>
        )}

        {/* Main content area */}
        <div className="space-y-8">
          {/* Production breakdown chart */}
          {showProductionBreakdown && (
            <div className="bg-white p-4 rounded-lg border">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Produktionsfordeling</h3>
              {loading ? (
                <div className="flex items-center justify-center h-[400px]">
                  <div className="text-gray-500">Indlæser produktionsdata...</div>
                </div>
              ) : error ? (
                <div className="flex items-center justify-center h-[400px]">
                  <div className="text-red-500 flex items-center gap-2">
                    <Activity className="w-5 h-5" />
                    {error}
                  </div>
                </div>
              ) : data.length === 0 ? (
                <div className="flex items-center justify-center h-[400px]">
                  <div className="text-gray-500 text-center">
                    <Activity className="w-10 h-10 mx-auto mb-2 text-gray-400" />
                    <div>Ingen data tilgængelig</div>
                  </div>
                </div>
              ) : (
                <ResponsiveContainer width="100%" height={400}>
                  <AreaChart data={data} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} />
                    <XAxis 
                      dataKey="time" 
                      tick={{ fontSize: 12 }}
                      interval={selectedView === '30d' ? 4 : selectedView === '7d' ? 1 : 0}
                    />
                    <YAxis 
                      tick={{ fontSize: 12 }}
                      label={{ 
                        value: 'MW', 
                        angle: -90, 
                        position: 'insideLeft',
                        style: { fontSize: 12 }
                      }}
                    />
                    <Tooltip content={<ProductionTooltip />} />
                    
                    {/* Stack renewable sources first */}
                    {Object.entries(productionTypes)
                      .filter(([_, config]) => config.renewable)
                      .map(([type, config]) => (
                        <Area
                          key={type}
                          type="monotone"
                          dataKey={type}
                          stackId="1"
                          stroke={config.color}
                          fill={config.color}
                          strokeWidth={0}
                        />
                      ))}
                    
                    {/* Then stack fossil sources */}
                    {Object.entries(productionTypes)
                      .filter(([_, config]) => !config.renewable)
                      .map(([type, config]) => (
                        <Area
                          key={type}
                          type="monotone"
                          dataKey={type}
                          stackId="1"
                          stroke={config.color}
                          fill={config.color}
                          strokeWidth={0}
                        />
                      ))}
                  </AreaChart>
                </ResponsiveContainer>
              )}
            </div>
          )}

          {/* CO2 intensity chart */}
          {showCO2Intensity && (
            <div className="bg-white p-4 rounded-lg border">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">CO₂-intensitet over tid</h3>
              {loading ? (
                <div className="flex items-center justify-center h-[300px]">
                  <div className="text-gray-500">Indlæser CO₂-data...</div>
                </div>
              ) : data.length === 0 ? (
                <div className="flex items-center justify-center h-[300px]">
                  <div className="text-gray-500">Ingen data tilgængelig</div>
                </div>
              ) : (
                <ResponsiveContainer width="100%" height={300}>
                  <LineChart data={data} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} />
                    <XAxis 
                      dataKey="time" 
                      tick={{ fontSize: 12 }}
                      interval={selectedView === '30d' ? 4 : selectedView === '7d' ? 1 : 0}
                    />
                    <YAxis 
                      tick={{ fontSize: 12 }}
                      label={{ 
                        value: 'g CO₂/kWh', 
                        angle: -90, 
                        position: 'insideLeft',
                        style: { fontSize: 12 }
                      }}
                    />
                    <Tooltip content={<CO2Tooltip />} />
                    <Line 
                      type="monotone" 
                      dataKey="averageCO2" 
                      stroke="#059669"
                      strokeWidth={2}
                      dot={false}
                    />
                  </LineChart>
                </ResponsiveContainer>
              )}
            </div>
          )}
        </div>

        {/* Legend */}
        <div className="mt-8 bg-gray-50 rounded-lg p-6">
          <h3 className="text-sm font-semibold text-gray-700 mb-4">Energikilder</h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {Object.entries(productionTypes).map(([key, config]) => (
              <div key={key} className="flex items-center gap-2">
                <div className="w-4 h-4 rounded" style={{ backgroundColor: config.color }} />
                <span className="text-sm text-gray-600">{config.name}</span>
                {config.renewable && (
                  <Leaf className="w-3 h-3 text-green-600" />
                )}
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

export default DeclarationProductionChart;