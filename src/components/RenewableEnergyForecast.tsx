import React, { useState, useEffect, useMemo } from 'react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { CalendarDays, ChevronLeft, ChevronRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { cn } from "@/lib/utils";

// --- TYPES ---
interface ForecastRecord { HourUTC: string; ForecastType: 'Solar' | 'Onshore Wind' | 'Offshore Wind'; ForecastDayAhead: number; PriceArea: 'DK1' | 'DK2'; }
interface RenewableEnergyForecastProps { block: { _type: 'renewableEnergyForecast'; title: string; leadingText?: string; }; }

const formatDateForApi = (date: Date) => date.toISOString().split('T')[0];

// --- CUSTOM TOOLTIP ---
const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    const total = payload.reduce((sum, entry) => sum + entry.value, 0);
    return (
      <div className="bg-gray-800 text-white p-4 rounded-lg shadow-lg border border-gray-700 min-w-[220px]">
        <p className="font-bold text-base mb-2">{`Kl. ${label}`}</p>
        <div className="text-sm space-y-1">
          {payload.slice().reverse().map((entry) => (
            <div key={entry.dataKey} className="flex justify-between items-center gap-4">
              <div className="flex items-center"><span className="inline-block w-2.5 h-2.5 rounded-full mr-2" style={{ backgroundColor: entry.color }}></span>{entry.name}:</div>
              <span className="font-mono">{entry.value.toFixed(1)} MWh</span>
            </div>
          ))}
          <div className="border-t border-gray-600 my-2 pt-1">
            <div className="flex justify-between font-bold"><span>Total:</span><span className="font-mono">{total.toFixed(1)} MWh</span></div>
          </div>
        </div>
      </div>
    );
  }
  return null;
};

// --- MAIN STABLE COMPONENT ---
const RenewableEnergyForecast: React.FC<RenewableEnergyForecastProps> = ({ block }) => {
  const [allData, setAllData] = useState<ForecastRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [isCalendarOpen, setIsCalendarOpen] = useState(false);
  const [selectedRegion, setSelectedRegion] = useState<'Danmark' | 'DK1' | 'DK2'>('Danmark');

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true); setError(null);
      try {
        const response = await fetch(`/api/energy-forecast?region=${selectedRegion}&date=${formatDateForApi(selectedDate)}`);
        if (!response.ok) throw new Error('Kunne ikke hente prognosedata.');
        const result = await response.json();
        setAllData(result.records || []);
      } catch (err: any) { setError(err.message); } finally { setLoading(false); }
    };
    fetchData();
  }, [selectedRegion, selectedDate]);

  const processedData = useMemo(() => {
    const grouped = allData.reduce((acc, record) => {
        const hourKey = new Date(record.HourUTC).toLocaleTimeString('da-DK', { hour: '2-digit', minute: '2-digit' }).replace(/\./g, ':');
        if (!acc[hourKey]) acc[hourKey] = { 'Solar': 0, 'Onshore Wind': 0, 'Offshore Wind': 0 };
        if (record.ForecastDayAhead !== null) acc[hourKey][record.ForecastType] += record.ForecastDayAhead;
        return acc;
    }, {} as Record<string, any>);

    return Object.entries(grouped)
      .map(([hour, values]) => ({ hour, ...values, Total: values.Solar + values['Onshore Wind'] + values['Offshore Wind'] }))
      .sort((a,b) => a.hour.localeCompare(b.hour));
  }, [allData]);

  const yAxisMax = useMemo(() => {
    if (!processedData || processedData.length === 0) return 1000;
    const dataMax = Math.max(...processedData.map(d => d.Total));
    const magnitude = Math.pow(10, Math.floor(Math.log10(dataMax || 1)));
    return Math.ceil(dataMax / magnitude) * magnitude;
  }, [processedData]);

  const chartColors = { solar: '#f59e0b', onshore: '#3b82f6', offshore: '#16a34a' };

  // Check if selected date is in the future
  const today = new Date();
  today.setHours(0, 0, 0, 0); // Normalize to the start of today
  const isFuture = selectedDate > today;

  return (
    <section className="bg-white py-16 lg:py-24">
      <div className="container mx-auto px-4">
        {block.title && <h2 className="text-3xl lg:text-4xl font-bold text-gray-900 text-center mb-4">{block.title}</h2>}
        {block.leadingText && <p className="text-lg text-gray-600 text-center mb-12 max-w-3xl mx-auto">{block.leadingText}</p>}
        
        <div className="flex flex-col sm:flex-row justify-between items-center mb-8 gap-4 p-4 bg-gray-50 rounded-lg border">
          <div className="flex items-center gap-2">
            <Button variant="ghost" size="icon" onClick={() => setSelectedDate(d => { const n = new Date(d); n.setDate(d.getDate() - 1); return n; })}> <ChevronLeft size={18} /> </Button>
            <Popover open={isCalendarOpen} onOpenChange={setIsCalendarOpen}><PopoverTrigger asChild><Button variant="outline" className="w-[200px] justify-start text-left font-normal"><CalendarDays className="mr-2 h-4 w-4" />{selectedDate.toLocaleDateString('da-DK')}</Button></PopoverTrigger><PopoverContent className="w-auto p-0"><Calendar mode="single" selected={selectedDate} onSelect={(d) => { if(d) setSelectedDate(d); setIsCalendarOpen(false); }} disabled={(date) => date > new Date()} initialFocus /></PopoverContent></Popover>
            <Button variant="ghost" size="icon" onClick={() => setSelectedDate(d => { const n = new Date(d); n.setDate(d.getDate() + 1); return n; })} disabled={isFuture}> <ChevronRight size={18} /> </Button>
          </div>
          <div className="flex items-center gap-2">
            <Button onClick={() => setSelectedRegion('Danmark')} variant={selectedRegion === 'Danmark' ? 'default' : 'outline'}>Hele Danmark</Button>
            <Button onClick={() => setSelectedRegion('DK1')} variant={selectedRegion === 'DK1' ? 'default' : 'outline'}>DK1 (Vest)</Button>
            <Button onClick={() => setSelectedRegion('DK2')} variant={selectedRegion === 'DK2' ? 'default' : 'outline'}>DK2 (Øst)</Button>
          </div>
        </div>

        <div className="w-full h-[450px] bg-white p-4 rounded-lg">
          {loading ? <div className="flex items-center justify-center h-full">Indlæser data...</div> :
           (
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={processedData} margin={{ top: 10, right: 20, left: 20, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorSolar" x1="0" y1="0" x2="0" y2="1"><stop offset="5%" stopColor={chartColors.solar} stopOpacity={0.7}/><stop offset="95%" stopColor={chartColors.solar} stopOpacity={0.1}/></linearGradient>
                  <linearGradient id="colorOnshore" x1="0" y1="0" x2="0" y2="1"><stop offset="5%" stopColor={chartColors.onshore} stopOpacity={0.7}/><stop offset="95%" stopColor={chartColors.onshore} stopOpacity={0.1}/></linearGradient>
                  <linearGradient id="colorOffshore" x1="0" y1="0" x2="0" y2="1"><stop offset="5%" stopColor={chartColors.offshore} stopOpacity={0.7}/><stop offset="95%" stopColor={chartColors.offshore} stopOpacity={0.1}/></linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#e0e0e0" vertical={false} />
                <XAxis dataKey="hour" tick={{ fontSize: 12, fill: '#6b7280' }} dy={10} />
                <YAxis domain={[0, yAxisMax]} tickFormatter={(tick) => Math.round(tick).toString()} tick={{ fontSize: 12, fill: '#6b7280' }} label={{ value: 'MWh', angle: -90, position: 'insideLeft', offset: -10, style: { fill: '#6b7280' } }} />
                <Tooltip content={<CustomTooltip />} cursor={{ stroke: '#374151', strokeWidth: 1.5, strokeDasharray: '4 4' }} />
                
                <Area type="monotone" dataKey="Offshore Wind" name="Vind (Hav)" stackId="1" stroke={chartColors.offshore} fill="url(#colorOffshore)" color={chartColors.offshore} strokeWidth={2} />
                <Area type="monotone" dataKey="Onshore Wind" name="Vind (Land)" stackId="1" stroke={chartColors.onshore} fill="url(#colorOnshore)" color={chartColors.onshore} strokeWidth={2} />
                <Area type="monotone" dataKey="Solar" name="Solenergi" stackId="1" stroke={chartColors.solar} fill="url(#colorSolar)" color={chartColors.solar} strokeWidth={2} />
              </AreaChart>
            </ResponsiveContainer>
          )}
        </div>
        
        <div className="flex justify-center items-center gap-x-6 gap-y-2 flex-wrap mt-8">
            <div className="flex items-center gap-2 text-sm"><div className="w-4 h-4 rounded" style={{backgroundColor: chartColors.solar}}></div><span>Solenergi</span></div>
            <div className="flex items-center gap-2 text-sm"><div className="w-4 h-4 rounded" style={{backgroundColor: chartColors.onshore}}></div><span>Vind (Land)</span></div>
            <div className="flex items-center gap-2 text-sm"><div className="w-4 h-4 rounded" style={{backgroundColor: chartColors.offshore}}></div><span>Vind (Hav)</span></div>
        </div>
      </div>
    </section>
  );
};

export default RenewableEnergyForecast; 