import React, { useState, useEffect, useMemo } from 'react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { CalendarDays, ChevronLeft, ChevronRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { Toggle } from "@/components/ui/toggle";
import { cn } from "@/lib/utils";
import { PortableText } from '@portabletext/react';

// --- TYPES (REMAIN MOSTLY THE SAME) ---
interface ForecastRecord { HourUTC: string; ForecastType: 'Solar' | 'Onshore Wind' | 'Offshore Wind'; ForecastDayAhead: number; PriceArea: 'DK1' | 'DK2'; }
interface ProcessedHourData { hour: string; Solar: number; 'Onshore Wind': number; 'Offshore Wind': number; Total: number; }
interface RenewableEnergyForecastProps { block: { _type: 'renewableEnergyForecast'; title?: string; leadingText?: string; explanation?: any[]; }; }

const formatDateForApi = (date: Date) => date.toISOString().split('T')[0];

// --- CUSTOM TOOLTIP (SLIGHTLY MODIFIED) ---
const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-gray-800 text-white p-4 rounded-lg shadow-lg border border-gray-700">
        <p className="font-bold text-base mb-2">{`Kl. ${label}`}</p>
        <div className="text-sm space-y-1">
          {payload.map((entry: any) => (
            <div key={entry.dataKey} className="flex justify-between items-center gap-4">
              <div className="flex items-center"><span className="inline-block w-2.5 h-2.5 rounded-full mr-2" style={{ backgroundColor: entry.stroke }}></span>{entry.name}:</div>
              <span className="font-mono">{entry.value.toFixed(1)} MWh</span>
            </div>
          ))}
        </div>
      </div>
    );
  }
  return null;
};

// --- MAIN COMPONENT ---
const RenewableEnergyForecast: React.FC<RenewableEnergyForecastProps> = ({ block }) => {
  const [allData, setAllData] = useState<ForecastRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [isCalendarOpen, setIsCalendarOpen] = useState(false);
  
  // NEW STATE: For multi-selection
  const [selectedRegions, setSelectedRegions] = useState({ Danmark: true, DK1: true, DK2: true });

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true); setError(null);
      try {
        const response = await fetch(`/api/energy-forecast?date=${formatDateForApi(selectedDate)}`);
        if (!response.ok) throw new Error('Kunne ikke hente prognosedata.');
        const result = await response.json();
        setAllData(result.records || []);
      } catch (err: any) { setError(err.message); } finally { setLoading(false); }
    };
    fetchData();
  }, [selectedDate]);

  // NEW DATA PROCESSING: Creates separate datasets for each region
  const processedData = useMemo(() => {
    const processRegion = (region: 'DK1' | 'DK2' | 'Danmark'): ProcessedHourData[] => {
      const regionData = region === 'Danmark' ? allData : allData.filter(d => d.PriceArea === region);
      const grouped = regionData.reduce((acc, record) => {
        const hourKey = new Date(record.HourUTC).toLocaleTimeString('da-DK', { hour: '2-digit', minute: '2-digit' }).replace(/\./g, ':');
        if (!acc[hourKey]) acc[hourKey] = { 'Solar': 0, 'Onshore Wind': 0, 'Offshore Wind': 0 };
        acc[hourKey][record.ForecastType] += record.ForecastDayAhead;
        return acc;
      }, {} as Record<string, any>);

      return Object.entries(grouped).map(([hour, values]) => ({
        hour, ...values, Total: values.Solar + values['Onshore Wind'] + values['Offshore Wind']
      })).sort((a,b) => a.hour.localeCompare(b.hour));
    };
    
    return {
      Danmark: processRegion('Danmark'),
      DK1: processRegion('DK1'),
      DK2: processRegion('DK2'),
    };
  }, [allData]);

  const yAxisMax = useMemo(() => {
    const allTotals = [
      ...(selectedRegions.Danmark ? processedData.Danmark.map(d => d.Total) : []),
      ...(selectedRegions.DK1 ? processedData.DK1.map(d => d.Total) : []),
      ...(selectedRegions.DK2 ? processedData.DK2.map(d => d.Total) : []),
    ];
    if (allTotals.length === 0) return 1000; // Default max if no data
    const dataMax = Math.max(...allTotals);
    // Calculate a "nice" round number above the max value
    const magnitude = Math.pow(10, Math.floor(Math.log10(dataMax)));
    return Math.ceil(dataMax / magnitude) * magnitude;
  }, [processedData, selectedRegions]);

  const compositionLegendData = useMemo(() => {
    const selectedCount = Object.values(selectedRegions).filter(Boolean).length;
    if (selectedCount !== 1) return null; // Only show composition for a single selected region

    const regionKey = Object.keys(selectedRegions).find(k => selectedRegions[k as keyof typeof selectedRegions]) as keyof typeof processedData;
    const data = processedData[regionKey];
    if (!data || data.length === 0) return null;

    const totals = data.reduce((acc, hour) => {
        acc.Solar += hour['Solar'];
        acc['Onshore Wind'] += hour['Onshore Wind'];
        acc['Offshore Wind'] += hour['Offshore Wind'];
        acc.GrandTotal += hour.Total;
        return acc;
    }, { Solar: 0, 'Onshore Wind': 0, 'Offshore Wind': 0, GrandTotal: 0 });

    if (totals.GrandTotal === 0) return null;

    return {
        Solar: (totals.Solar / totals.GrandTotal) * 100,
        'Onshore Wind': (totals['Onshore Wind'] / totals.GrandTotal) * 100,
        'Offshore Wind': (totals['Offshore Wind'] / totals.GrandTotal) * 100,
    };
  }, [selectedRegions, processedData]);

  const handleToggle = (region: keyof typeof selectedRegions) => {
    setSelectedRegions(prev => ({ ...prev, [region]: !prev[region] }));
  };
  
  const chartColors = {
    // Colors for the compositional breakdown
    solar: '#f59e0b',
    onshore: '#3b82f6',
    offshore: '#16a34a',
    // Colors for the regional comparison lines
    Danmark: '#16a34a', // Green
    DK1: '#3b82f6',     // Blue
    DK2: '#ca8a04',     // Dark Yellow
  };

  return (
    <section className="bg-white py-16 lg:py-24">
      <div className="container mx-auto px-4">
        {block.title && <h2 className="text-3xl lg:text-4xl font-bold text-gray-900 text-center mb-4">{block.title}</h2>}
        {block.leadingText && <p className="text-lg text-gray-600 text-center mb-12 max-w-3xl mx-auto">{block.leadingText}</p>}
        
        <div className="flex flex-col sm:flex-row justify-between items-center mb-8 gap-4 p-4 bg-gray-50 rounded-lg border">
          {/* Date Controls */}
          <div className="flex items-center gap-2">
            <Button variant="ghost" size="icon" onClick={() => setSelectedDate(d => { const n = new Date(d); n.setDate(d.getDate() - 1); return n; })}> <ChevronLeft size={18} /> </Button>
            <Popover open={isCalendarOpen} onOpenChange={setIsCalendarOpen}><PopoverTrigger asChild><Button variant="outline" className="w-[200px] justify-start text-left font-normal"><CalendarDays className="mr-2 h-4 w-4" />{selectedDate.toLocaleDateString('da-DK')}</Button></PopoverTrigger><PopoverContent className="w-auto p-0"><Calendar mode="single" selected={selectedDate} onSelect={(d) => { if(d) setSelectedDate(d); setIsCalendarOpen(false); }} initialFocus /></PopoverContent></Popover>
            <Button variant="ghost" size="icon" onClick={() => setSelectedDate(d => { const n = new Date(d); n.setDate(d.getDate() + 1); return n; })}> <ChevronRight size={18} /> </Button>
          </div>
          
          {/* NEW Region Toggles */}
          <div className="flex items-center gap-2">
            <Toggle pressed={selectedRegions.Danmark} onPressedChange={() => handleToggle('Danmark')} aria-label="Toggle Danmark" 
                    className="data-[state=on]:bg-green-600 data-[state=on]:text-white">
              Hele Danmark
            </Toggle>
            <Toggle pressed={selectedRegions.DK1} onPressedChange={() => handleToggle('DK1')} aria-label="Toggle DK1"
                    className="data-[state=on]:bg-blue-600 data-[state=on]:text-white">
              DK1
            </Toggle>
            <Toggle pressed={selectedRegions.DK2} onPressedChange={() => handleToggle('DK2')} aria-label="Toggle DK2"
                    className="data-[state=on]:bg-yellow-600 data-[state=on]:text-white">
              DK2
            </Toggle>
          </div>
        </div>

        <div className="w-full h-[450px] bg-white p-4 rounded-lg">
          {loading ? <div className="flex items-center justify-center h-full">Indlæser data...</div> :
           (
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart margin={{ top: 10, right: 20, left: 20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e0e0e0" vertical={false} />
                <XAxis dataKey="hour" type="category" allowDuplicatedCategory={false} tick={{ fontSize: 12, fill: '#6b7280' }} dy={10} />
                <YAxis 
                  domain={[0, yAxisMax]} 
                  tickFormatter={(tick) => Math.round(tick).toString()}
                  tick={{ fontSize: 12, fill: '#6b7280' }} 
                  label={{ value: 'MWh', angle: -90, position: 'insideLeft', offset: -10, style: { fill: '#6b7280' } }} 
                />
                <Tooltip content={<CustomTooltip />} />
                
                {/* NEW Conditional Rendering of Area Layers */}
                {selectedRegions.Danmark && <Area type="monotone" data={processedData.Danmark} dataKey="Total" name="Danmark" stroke={chartColors.Danmark} fill={chartColors.Danmark} fillOpacity={0.2} strokeWidth={2} />}
                {selectedRegions.DK1 && <Area type="monotone" data={processedData.DK1} dataKey="Total" name="DK1" stroke={chartColors.DK1} fill={chartColors.DK1} fillOpacity={0.2} strokeWidth={2} />}
                {selectedRegions.DK2 && <Area type="monotone" data={processedData.DK2} dataKey="Total" name="DK2" stroke={chartColors.DK2} fill={chartColors.DK2} fillOpacity={0.2} strokeWidth={2} />}
              </AreaChart>
            </ResponsiveContainer>
                      )}
        </div>
        
        {/* --- DYNAMIC LEGEND --- */}
        <div className="flex justify-center items-center gap-x-8 gap-y-4 flex-wrap mt-8">
            {compositionLegendData ? (
                // VIEW 1: Detailed Composition Legend (when one region is selected)
                <>
                    <div className="flex items-center gap-2 text-sm">
                        <div className="w-4 h-4 rounded" style={{backgroundColor: chartColors.solar}}></div>
                        <span>Solenergi ({compositionLegendData.Solar.toFixed(0)}%)</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm">
                        <div className="w-4 h-4 rounded" style={{backgroundColor: chartColors.onshore}}></div>
                        <span>Vind (Land) ({compositionLegendData['Onshore Wind'].toFixed(0)}%)</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm">
                        <div className="w-4 h-4 rounded" style={{backgroundColor: chartColors.offshore}}></div>
                        <span>Vind (Hav) ({compositionLegendData['Offshore Wind'].toFixed(0)}%)</span>
                    </div>
                </>
            ) : (
                // VIEW 2: Simple Region Key (when multiple regions are selected)
                <>
                    {selectedRegions.Danmark && <div className="flex items-center gap-2 text-sm"><div className="w-4 h-4 rounded" style={{backgroundColor: chartColors.Danmark}}></div><span>Hele Danmark</span></div>}
                    {selectedRegions.DK1 && <div className="flex items-center gap-2 text-sm"><div className="w-4 h-4 rounded" style={{backgroundColor: chartColors.DK1}}></div><span>DK1 (Vest)</span></div>}
                    {selectedRegions.DK2 && <div className="flex items-center gap-2 text-sm"><div className="w-4 h-4 rounded" style={{backgroundColor: chartColors.DK2}}></div><span>DK2 (Øst)</span></div>}
                </>
            )}
        </div>
        
        {block.explanation && <div className="prose prose-lg max-w-4xl mx-auto mt-12 text-gray-700"><PortableText value={block.explanation} /></div>}
      </div>
    </section>
  );
};

export default RenewableEnergyForecast; 