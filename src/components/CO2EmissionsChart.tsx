import React, { useState, useEffect, useMemo } from 'react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ReferenceLine } from 'recharts';
import { CalendarDays, ChevronLeft, ChevronRight, Leaf, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { PortableText } from '@portabletext/react';

interface CO2EmissionRecord {
  HourUTC: string;
  HourDK: string;
  PriceArea: string;
  CO2Emission: number;
  EmissionLevel: string;
}

interface CO2EmissionsChartProps {
  block: {
    _type: 'co2EmissionsChart';
    _key: string;
    title?: string;
    subtitle?: string;
    leadingText?: any[];
    showGauge?: boolean;
  };
}

const formatDateForApi = (date: Date) => date.toISOString().split('T')[0];

// Emission level configurations
const emissionLevels = {
  'very-low': { label: 'Meget lav', color: '#16a34a', gradient: 'green', range: '< 100 g/kWh' },
  'low': { label: 'Lav', color: '#84cc16', gradient: 'lime', range: '100-200 g/kWh' },
  'moderate': { label: 'Moderat', color: '#eab308', gradient: 'yellow', range: '200-300 g/kWh' },
  'high': { label: 'Høj', color: '#f97316', gradient: 'orange', range: '300-400 g/kWh' },
  'very-high': { label: 'Meget høj', color: '#dc2626', gradient: 'red', range: '> 400 g/kWh' },
};

// Custom tooltip component
const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    const data = payload[0].payload;
    const level = emissionLevels[data.EmissionLevel as keyof typeof emissionLevels] || emissionLevels['moderate'];
    
    return (
      <div className="bg-white p-4 rounded-lg shadow-lg border min-w-[240px]">
        <p className="font-semibold text-gray-900 mb-2">{label}</p>
        <div className="space-y-2">
          <div className="flex justify-between items-center">
            <span className="text-gray-600">CO₂-udledning:</span>
            <span className="font-mono font-semibold">{data.CO2Emission.toFixed(0)} g/kWh</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full" style={{ backgroundColor: level.color }}></div>
            <span className="text-sm font-medium" style={{ color: level.color }}>{level.label}</span>
          </div>
          <div className="text-xs text-gray-500 pt-1 border-t">
            {level.range}
          </div>
        </div>
      </div>
    );
  }
  return null;
};

// Emission gauge component
const EmissionGauge: React.FC<{ value: number | null }> = ({ value }) => {
  if (value === null) return null;
  
  const getLevel = (emission: number) => {
    if (emission < 100) return 'very-low';
    if (emission < 200) return 'low';
    if (emission < 300) return 'moderate';
    if (emission < 400) return 'high';
    return 'very-high';
  };
  
  const level = getLevel(value);
  const config = emissionLevels[level as keyof typeof emissionLevels];
  
  return (
    <div className="bg-gray-50 rounded-lg p-6 text-center">
      <h3 className="text-sm text-gray-600 mb-2">Nuværende CO₂-intensitet</h3>
      <div className="relative inline-flex items-center justify-center">
        <div className="w-32 h-32 rounded-full border-8" style={{ borderColor: config.color }}>
          <div className="flex flex-col items-center justify-center h-full">
            <Leaf size={24} style={{ color: config.color }} />
            <span className="text-2xl font-bold mt-1">{value.toFixed(0)}</span>
            <span className="text-xs text-gray-600">g/kWh</span>
          </div>
        </div>
      </div>
      <Badge className="mt-3" style={{ backgroundColor: config.color, color: 'white' }}>
        {config.label}
      </Badge>
    </div>
  );
};

const CO2EmissionsChart: React.FC<CO2EmissionsChartProps> = ({ block }) => {
  // Set default values for missing fields
  const title = block.title || 'CO₂-udledning fra elforbrug';
  const subtitle = block.subtitle || 'Realtids CO₂-intensitet målt i gram per kWh';
  const leadingText = block.leadingText;
  const showGauge = block.showGauge !== undefined ? block.showGauge : true;

  const [data, setData] = useState<CO2EmissionRecord[]>([]);
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

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      setError(null);
      try {
        const apiUrl = `/api/co2-emissions?region=${selectedRegion}&date=${formatDateForApi(selectedDate)}&aggregation=hourly`;
        console.log('Fetching CO2 data from:', apiUrl);
        
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
        
        // Transform data for the chart
        const chartData = result.records.map((record: CO2EmissionRecord) => ({
          ...record,
          hour: new Date(record.HourUTC).toLocaleTimeString('da-DK', { 
            hour: '2-digit', 
            minute: '2-digit' 
          }).replace(/\./g, ':')
        }));
        
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
  }, [selectedRegion, selectedDate]);

  // Calculate statistics
  const stats = useMemo(() => {
    if (!data || data.length === 0) return null;
    
    const validData = data.filter(d => d.CO2Emission !== null);
    if (validData.length === 0) return null;
    
    const values = validData.map(d => d.CO2Emission);
    const sum = values.reduce((a, b) => a + b, 0);
    const avg = sum / values.length;
    const min = Math.min(...values);
    const max = Math.max(...values);
    
    // Get current hour's emission
    const now = new Date();
    const currentHour = now.getHours();
    const currentData = data.find(d => {
      const hour = new Date(d.HourUTC).getHours();
      return hour === currentHour;
    });
    
    return { avg, min, max, current: currentData?.CO2Emission || null };
  }, [data]);

  // Dynamic gradient based on emission levels
  const getGradientColor = (value: number) => {
    if (value < 100) return '#16a34a';
    if (value < 200) return '#84cc16';
    if (value < 300) return '#eab308';
    if (value < 400) return '#f97316';
    return '#dc2626';
  };

  const yAxisMax = useMemo(() => {
    if (!data || data.length === 0) return 500;
    const dataMax = Math.max(...data.filter(d => d.CO2Emission !== null).map(d => d.CO2Emission));
    return Math.ceil(dataMax / 100) * 100 + 50;
  }, [data]);

  // Check if selected date is in the future
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const isFuture = selectedDate > today;

  return (
    <section className="bg-white py-16 lg:py-24">
      <div className="container mx-auto px-4">
        {title && (
          <h2 className="text-3xl lg:text-4xl font-display font-bold text-gray-900 text-center mb-4">
            {title}
          </h2>
        )}
        {subtitle && (
          <p className="text-lg text-gray-600 text-center mb-8 max-w-3xl mx-auto">
            {subtitle}
          </p>
        )}

        {leadingText && leadingText.length > 0 && (
          <div className="text-base text-gray-700 mb-12 max-w-4xl mx-auto">
            <div className="prose prose-lg max-w-none text-center">
              <PortableText value={leadingText} />
            </div>
          </div>
        )}

        {/* Controls */}
        <div className="flex flex-col sm:flex-row justify-between items-center mb-8 gap-4 p-4 bg-gray-50 rounded-lg border">
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
              onClick={() => setSelectedRegion('Danmark')} 
              variant={selectedRegion === 'Danmark' ? 'default' : 'outline'}
            >
              Hele Danmark
            </Button>
            <Button 
              onClick={() => setSelectedRegion('DK1')} 
              variant={selectedRegion === 'DK1' ? 'default' : 'outline'}
            >
              DK1 (Vest)
            </Button>
            <Button 
              onClick={() => setSelectedRegion('DK2')} 
              variant={selectedRegion === 'DK2' ? 'default' : 'outline'}
            >
              DK2 (Øst)
            </Button>
          </div>
        </div>

        {/* Main content area */}
        <div className="grid lg:grid-cols-4 gap-6">
          {/* Chart */}
          <div className={cn(
            "bg-white p-4 rounded-lg border",
            showGauge ? "lg:col-span-3" : "lg:col-span-4"
          )}>
            {loading ? (
              <div className="flex items-center justify-center h-[450px]">
                <div className="text-gray-500">Indlæser CO₂-data...</div>
              </div>
            ) : error ? (
              <div className="flex items-center justify-center h-[450px]">
                <div className="text-red-500 flex items-center gap-2">
                  <AlertCircle size={20} />
                  {error}
                </div>
              </div>
            ) : data.length === 0 ? (
              <div className="flex items-center justify-center h-[450px]">
                <div className="text-gray-500 text-center">
                  <AlertCircle size={40} className="mx-auto mb-4 text-gray-400" />
                  <div className="text-lg font-medium mb-2">Ingen data tilgængelig</div>
                  <div className="text-sm">
                    Der er ingen CO₂-data tilgængelig for {selectedDate.toLocaleDateString('da-DK')} i {selectedRegion}.
                    <br />
                    Prøv at vælge en anden dato eller region.
                  </div>
                </div>
              </div>
            ) : (
              <ResponsiveContainer width="100%" height={450}>
                <AreaChart data={data} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                  <defs>
                    <linearGradient id="colorCO2" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#84cc16" stopOpacity={0.8}/>
                      <stop offset="95%" stopColor="#84cc16" stopOpacity={0.1}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e0e0e0" vertical={false} />
                  <XAxis 
                    dataKey="hour" 
                    tick={{ fontSize: 12, fill: '#6b7280' }} 
                    dy={10}
                  />
                  <YAxis 
                    domain={[0, yAxisMax]}
                    tick={{ fontSize: 12, fill: '#6b7280' }}
                    label={{ 
                      value: 'g CO₂/kWh', 
                      angle: -90, 
                      position: 'insideLeft',
                      style: { fill: '#6b7280' }
                    }}
                  />
                  <Tooltip content={<CustomTooltip />} />
                  
                  {/* Reference lines for emission levels */}
                  <ReferenceLine y={100} stroke="#16a34a" strokeDasharray="3 3" />
                  <ReferenceLine y={200} stroke="#eab308" strokeDasharray="3 3" />
                  <ReferenceLine y={300} stroke="#f97316" strokeDasharray="3 3" />
                  
                  <Area 
                    type="monotone" 
                    dataKey="CO2Emission" 
                    stroke="#84cc16" 
                    fill="url(#colorCO2)"
                    strokeWidth={2}
                  />
                </AreaChart>
              </ResponsiveContainer>
            )}
          </div>

          {/* Gauge and stats */}
          {showGauge && stats && (
            <div className="space-y-4">
              <EmissionGauge value={stats.current} />
              
              {/* Statistics */}
              <div className="bg-gray-50 rounded-lg p-4 space-y-3">
                <h3 className="text-sm font-semibold text-gray-700 mb-2">Dagens statistik</h3>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Gennemsnit:</span>
                    <span className="font-mono font-medium">{stats.avg.toFixed(0)} g/kWh</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Minimum:</span>
                    <span className="font-mono font-medium text-green-600">{stats.min.toFixed(0)} g/kWh</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Maksimum:</span>
                    <span className="font-mono font-medium text-red-600">{stats.max.toFixed(0)} g/kWh</span>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Legend */}
        <div className="mt-8 flex justify-center">
          <div className="bg-gray-50 rounded-lg p-4">
            <h3 className="text-sm font-semibold text-gray-700 mb-3 text-center">CO₂-intensitet niveauer</h3>
            <div className="flex flex-wrap gap-4 justify-center">
              {Object.entries(emissionLevels).map(([key, config]) => (
                <div key={key} className="flex items-center gap-2">
                  <div className="w-4 h-4 rounded" style={{ backgroundColor: config.color }}></div>
                  <span className="text-sm">
                    <span className="font-medium">{config.label}</span>
                    <span className="text-gray-500 ml-1">({config.range})</span>
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default CO2EmissionsChart;