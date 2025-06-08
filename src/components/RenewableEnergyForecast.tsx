import React, { useState, useEffect, useMemo } from 'react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { CalendarDays, ChevronLeft, ChevronRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { cn } from "@/lib/utils";

// --- DATA TYPES ---
interface ForecastRecord { HourUTC: string; ForecastType: 'Solar' | 'OnshoreWind' | 'OffshoreWind'; ForecastDayAhead: number; }
interface ProcessedData { hour: string; Solar: number; OnshoreWind: number; OffshoreWind: number; Total: number; }
interface RenewableEnergyForecastProps { block: { _type: 'renewableEnergyForecast'; title: string; leadingText?: string; }; }

const formatDateForApi = (date: Date) => date.toISOString().split('T')[0];

// --- CUSTOM TOOLTIP COMPONENT ---
const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    const total = payload.reduce((sum: number, entry: any) => sum + entry.value, 0);
    return (
      <div className="bg-gray-800 text-white p-4 rounded-lg shadow-lg border border-gray-700">
        <p className="font-bold text-base mb-2">{`Kl. ${label}`}</p>
        <div className="text-sm space-y-1">
          {payload.map((entry: any) => (
            <div key={entry.dataKey} className="flex justify-between items-center gap-4">
              <div className="flex items-center">
                <span className="inline-block w-2.5 h-2.5 rounded-full mr-2" style={{ backgroundColor: entry.color }}></span>
                {entry.name}:
              </div>
              <span className="font-mono">{entry.value.toFixed(1)} MWh</span>
            </div>
          ))}
          <div className="border-t border-gray-600 my-2"></div>
          <div className="flex justify-between font-bold">
            <span>Total:</span>
            <span className="font-mono">{total.toFixed(1)} MWh</span>
          </div>
        </div>
      </div>
    );
  }
  return null;
};

// --- MAIN COMPONENT ---
const RenewableEnergyForecast: React.FC<RenewableEnergyForecastProps> = ({ block }) => {
  const [data, setData] = useState<ForecastRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [currentRegion, setCurrentRegion] = useState<'DK1' | 'DK2'>('DK1');
  const [isCalendarOpen, setIsCalendarOpen] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true); setError(null);
      try {
        const response = await fetch(`/api/energy-forecast?region=${currentRegion}&date=${formatDateForApi(selectedDate)}`);
        if (!response.ok) throw new Error('Kunne ikke hente prognosedata.');
        const result = await response.json();
        setData(result.records || []);
      } catch (err: any) { setError(err.message); } finally { setLoading(false); }
    };
    fetchData();
  }, [currentRegion, selectedDate]);

  const processedData = useMemo<ProcessedData[]>(() => {
      if (!data || data.length === 0) return [];

      // A reliable way to group API records by the hour.
      const groupedByHour: { [hour: string]: { Solar: number; OnshoreWind: number; OffshoreWind: number; } } = {};

      for (const record of data) {
        // Create a key for each hour, e.g., "23:00"
        const hourKey = new Date(record.HourUTC).toLocaleTimeString('da-DK', { hour: '2-digit', minute: '2-digit' });
        
        // If we haven't seen this hour before, initialize it.
        if (!groupedByHour[hourKey]) {
          groupedByHour[hourKey] = { Solar: 0, OnshoreWind: 0, OffshoreWind: 0 };
        }
        
        // Add the forecast value to the correct category.
        groupedByHour[hourKey][record.ForecastType] = record.ForecastDayAhead;
      }

      // Convert the grouped object into an array of objects for the chart.
      return Object.entries(groupedByHour).map(([hour, values]) => ({
        hour: hour.replace(/\./g, ':'), // Ensure format is "HH:mm"
        ...values,
        Total: values.Solar + values.OnshoreWind + values.OffshoreWind,
      }));
    }, [data]);
  
  const chartColors = { solar: '#f59e0b', onshore: '#3b82f6', offshore: '#22c55e' };

  return (
    <section className="bg-white py-16 lg:py-24">
      <div className="container mx-auto px-4">
        <h2 className="text-3xl lg:text-4xl font-bold text-gray-900 text-center mb-4">{block.title}</h2>
        {block.leadingText && <p className="text-lg text-gray-600 text-center mb-12 max-w-3xl mx-auto">{block.leadingText}</p>}
        
        {/* --- CONTROLS --- */}
        <div className="flex flex-col sm:flex-row justify-between items-center mb-8 gap-4 p-4 bg-gray-50 rounded-lg border">
          <div className="flex items-center gap-2">
            <Button variant="ghost" size="icon" onClick={() => setSelectedDate(d => { const n = new Date(d); n.setDate(d.getDate() - 1); return n; })}> <ChevronLeft size={18} /> </Button>
            <Popover open={isCalendarOpen} onOpenChange={setIsCalendarOpen}><PopoverTrigger asChild><Button variant="outline" className="w-[200px] justify-start text-left font-normal"><CalendarDays className="mr-2 h-4 w-4" />{selectedDate.toLocaleDateString('da-DK')}</Button></PopoverTrigger><PopoverContent className="w-auto p-0"><Calendar mode="single" selected={selectedDate} onSelect={(d) => { if(d) setSelectedDate(d); setIsCalendarOpen(false); }} initialFocus /></PopoverContent></Popover>
            <Button variant="ghost" size="icon" onClick={() => setSelectedDate(d => { const n = new Date(d); n.setDate(d.getDate() + 1); return n; })}> <ChevronRight size={18} /> </Button>
          </div>
          <div className="flex items-center gap-2 text-sm">
            <button onClick={() => setCurrentRegion('DK1')} className={cn("px-4 py-2 rounded-full", currentRegion === 'DK1' ? 'bg-blue-100 text-blue-800 font-semibold' : 'bg-white border text-gray-600')}>Vestdanmark (DK1)</button>
            <button onClick={() => setCurrentRegion('DK2')} className={cn("px-4 py-2 rounded-full", currentRegion === 'DK2' ? 'bg-blue-100 text-blue-800 font-semibold' : 'bg-white border text-gray-600')}>Østdanmark (DK2)</button>
          </div>
        </div>

        {/* --- STYLED CHART --- */}
        <div className="w-full h-[450px] bg-white p-4 rounded-lg">
          {loading ? <div className="flex items-center justify-center h-full">Indlæser data...</div> :
           error ? <div className="flex items-center justify-center h-full text-red-500">{error}</div> :
           processedData.length === 0 ? <div className="flex items-center justify-center h-full">Ingen data for den valgte dag.</div> :
          (
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={processedData} margin={{ top: 10, right: 20, left: 20, bottom: 40 }}>
                <defs>
                  <linearGradient id="colorSolar" x1="0" y1="0" x2="0" y2="1"><stop offset="5%" stopColor={chartColors.solar} stopOpacity={0.8}/><stop offset="95%" stopColor={chartColors.solar} stopOpacity={0.1}/></linearGradient>
                  <linearGradient id="colorOnshore" x1="0" y1="0" x2="0" y2="1"><stop offset="5%" stopColor={chartColors.onshore} stopOpacity={0.8}/><stop offset="95%" stopColor={chartColors.onshore} stopOpacity={0.1}/></linearGradient>
                  <linearGradient id="colorOffshore" x1="0" y1="0" x2="0" y2="1"><stop offset="5%" stopColor={chartColors.offshore} stopOpacity={0.8}/><stop offset="95%" stopColor={chartColors.offshore} stopOpacity={0.1}/></linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#e0e0e0" vertical={false} />
                <XAxis dataKey="hour" tick={{ fontSize: 12, fill: '#6b7280' }} tickLine={false} axisLine={{ stroke: '#d1d5db' }} dy={10} />
                <YAxis domain={[0, 'dataMax + 100']} tick={{ fontSize: 12, fill: '#6b7280' }} tickLine={false} axisLine={false} label={{ value: 'MWh', angle: -90, position: 'insideLeft', offset: -10, style: { fill: '#6b7280' } }} />
                <Tooltip content={<CustomTooltip />} cursor={{ stroke: '#374151', strokeWidth: 1, strokeDasharray: '3 3' }} />
                
                <Area type="monotone" dataKey="OffshoreWind" name="Vind (Hav)" stackId="1" stroke={chartColors.offshore} strokeWidth={2} fillOpacity={1} fill="url(#colorOffshore)" />
                <Area type="monotone" dataKey="OnshoreWind" name="Vind (Land)" stackId="1" stroke={chartColors.onshore} strokeWidth={2} fillOpacity={1} fill="url(#colorOnshore)" />
                <Area type="monotone" dataKey="Solar" name="Solenergi" stackId="1" stroke={chartColors.solar} strokeWidth={2} fillOpacity={1} fill="url(#colorSolar)" />
              </AreaChart>
            </ResponsiveContainer>
          )}
        </div>
        
        {/* --- CUSTOM LEGEND --- */}
        <div className="flex justify-center items-center gap-6 mt-8">
            <div className="flex items-center gap-2"><div className="w-4 h-4 rounded" style={{backgroundColor: chartColors.solar}}></div><span className="text-sm text-gray-700">Solenergi</span></div>
            <div className="flex items-center gap-2"><div className="w-4 h-4 rounded" style={{backgroundColor: chartColors.onshore}}></div><span className="text-sm text-gray-700">Vind (Land)</span></div>
            <div className="flex items-center gap-2"><div className="w-4 h-4 rounded" style={{backgroundColor: chartColors.offshore}}></div><span className="text-sm text-gray-700">Vind (Hav)</span></div>
        </div>
      </div>
    </section>
  );
};

export default RenewableEnergyForecast; 