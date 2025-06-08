import React, { useState, useEffect, useMemo, useRef } from 'react';
import { Settings2, CalendarDays, ChevronLeft, ChevronRight } from 'lucide-react';
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Button } from '@/components/ui/button';
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { cn } from "@/lib/utils";

interface PriceData {
  HourDK: string;
  SpotPriceKWh: number;
  TotalPriceKWh: number;
}

interface LivePriceGraphProps {
  block: {
    title: string;
    subtitle?: string;
    apiRegion: 'DK1' | 'DK2';
  };
}

const formatDate = (date: Date) => date.toISOString().split('T')[0];

const LivePriceGraphComponent: React.FC<LivePriceGraphProps> = ({ block }) => {
  const [data, setData] = useState<PriceData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isPopoverOpen, setIsPopoverOpen] = useState(false);
  const [isCalendarOpen, setIsCalendarOpen] = useState(false);
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [currentRegion, setCurrentRegion] = useState<'DK1' | 'DK2'>(block.apiRegion);

  const [fees, setFees] = useState({
    transport: { name: 'Netselskab', value: 0.12, enabled: true },
    system: { name: 'Forsyningstilsynet', value: 0.06, enabled: true },
    elafgift: { name: 'Elafgift', value: 0.76, enabled: true },
    moms: { name: 'Moms', value: 1.25, enabled: true },
  });

  const popoverRef = useRef<HTMLDivElement>(null);
  const [maxPrice, setMaxPrice] = useState(1);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      setError(null);
      const dateString = formatDate(selectedDate);
      try {
        const response = await fetch(`/api/electricity-prices?region=${currentRegion}&date=${dateString}`);
        if (!response.ok) throw new Error('Kunne ikke hente data.');
        const result = await response.json();
        
        if (!result.records || result.records.length === 0) {
          setError('Priser for den valgte dato er endnu ikke tilgængelige.');
          setData([]);
        } else {
          setData(result.records);
          const max = Math.max(...result.records.map((r: PriceData) => r.TotalPriceKWh));
          setMaxPrice(max > 0 ? max : 1.5); // Set a minimum max price to avoid tiny bars
        }
      } catch (err: any) {
        setError(err.message);
        setData([]);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [currentRegion, selectedDate]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (popoverRef.current && !popoverRef.current.contains(event.target as Node)) setIsPopoverOpen(false);
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleFeeToggle = (feeKey: keyof typeof fees) => {
    setFees(prev => ({ ...prev, [feeKey]: { ...prev[feeKey], enabled: !prev[feeKey].enabled } }));
  };

  const handleDateChange = (daysToAdd: number) => {
    const newDate = new Date(selectedDate);
    newDate.setDate(selectedDate.getDate() + daysToAdd);
    setSelectedDate(newDate);
  };

  const calculatedData = useMemo(() => {
    return data.map(d => {
      const spotPrice = d.SpotPriceKWh;
      let feesOnChart = 0;
      if (fees.transport.enabled) feesOnChart += fees.transport.value;
      if (fees.system.enabled) feesOnChart += fees.system.value;
      if (fees.elafgift.enabled) feesOnChart += fees.elafgift.value;
      let totalWithFees = spotPrice + feesOnChart;
      if (fees.moms.enabled) totalWithFees *= fees.moms.value;
      return { hour: new Date(d.HourDK).getHours(), spotPrice, total: totalWithFees };
    });
  }, [data, fees]);

  const stats = useMemo(() => {
    if (calculatedData.length === 0) return null;
    const prices = calculatedData.map(d => d.total);
    const highest = Math.max(...prices);
    const lowest = Math.min(...prices);
    const average = prices.reduce((a, b) => a + b, 0) / prices.length;
    return {
      highest: { price: highest, hour: calculatedData.find(d => d.total === highest)?.hour },
      lowest: { price: lowest, hour: calculatedData.find(d => d.total === lowest)?.hour },
      average: { price: average }
    };
  }, [calculatedData]);

  const isToday = formatDate(selectedDate) === formatDate(new Date());
  const isTomorrow = formatDate(selectedDate) === formatDate((() => { const d = new Date(); d.setDate(d.getDate() + 1); return d; })());

  return (
    <section className="container mx-auto px-4 py-16">
      <div className="max-w-4xl mx-auto bg-white rounded-xl shadow-lg border border-gray-100 p-6">
        {/* TOP STATS SECTION */}
        <div className="grid grid-cols-3 gap-8 mb-6 text-center md:text-left">
            {stats && (
                <>
                    <div>
                        <p className="text-sm text-gray-500">Højeste pris</p>
                        <p className="text-2xl font-bold text-gray-800">{stats.highest.price.toFixed(2)} kr.</p>
                        <p className="text-xs text-gray-500">Kl. {String(stats.highest.hour).padStart(2, '0')}:00</p>
                    </div>
                    <div>
                        <p className="text-sm text-gray-500">Laveste pris</p>
                        <p className="text-2xl font-bold text-gray-800">{stats.lowest.price.toFixed(2)} kr.</p>
                        <p className="text-xs text-gray-500">Kl. {String(stats.lowest.hour).padStart(2, '0')}:00</p>
                    </div>
                    <div>
                        <p className="text-sm text-gray-500">Gennemsnit</p>
                        <p className="text-2xl font-bold text-gray-800">{stats.average.price.toFixed(2)} kr.</p>
                        <p className="text-xs text-gray-500">{selectedDate.toLocaleDateString('da-DK', { day: 'numeric', month: 'long' })}</p>
                    </div>
                </>
            )}
        </div>
        
        {/* CONTROLS SECTION */}
        <div className="flex flex-wrap justify-between items-center gap-4 mb-6 border-t border-b border-gray-200 py-4">
            <div className="flex items-center gap-2">
                <Button variant="ghost" size="icon" onClick={() => handleDateChange(-1)}>
                    <ChevronLeft size={18}/>
                </Button>
                <Popover open={isCalendarOpen} onOpenChange={setIsCalendarOpen}>
                    <PopoverTrigger asChild>
                        <Button variant="ghost" className="flex items-center gap-2">
                            <CalendarDays size={18}/> {isToday ? 'I dag' : selectedDate.toLocaleDateString('da-DK')}
                        </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0" align="start">
                        <Calendar
                            mode="single"
                            selected={selectedDate}
                            onSelect={(date) => {
                                if (date) {
                                    setSelectedDate(date);
                                    setIsCalendarOpen(false);
                                }
                            }}
                            disabled={(date) => {
                                const tomorrow = new Date();
                                tomorrow.setDate(tomorrow.getDate() + 1);
                                tomorrow.setHours(23, 59, 59, 999);
                                return date > tomorrow;
                            }}
                            initialFocus
                        />
                    </PopoverContent>
                </Popover>
                <Button variant="ghost" size="icon" onClick={() => handleDateChange(1)} disabled={isTomorrow}>
                    <ChevronRight size={18}/>
                </Button>
            </div>
            <div className="flex items-center gap-4">
                <div className="flex items-center gap-2 text-sm">
                    <button onClick={() => setCurrentRegion('DK1')} className={cn("px-3 py-1 rounded-full", currentRegion === 'DK1' ? 'bg-green-100 text-green-800 font-semibold' : 'text-gray-500')}>Vestdanmark</button>
                    <button onClick={() => setCurrentRegion('DK2')} className={cn("px-3 py-1 rounded-full", currentRegion === 'DK2' ? 'bg-green-100 text-green-800 font-semibold' : 'text-gray-500')}>Østdanmark</button>
                </div>
                <div className="relative" ref={popoverRef}>
                    <Button variant="outline" onClick={() => setIsPopoverOpen(!isPopoverOpen)} className="flex items-center gap-2">
                        <Settings2 size={16} />Afgifter
                    </Button>
                    {isPopoverOpen && (
                        <div className="absolute right-0 mt-2 w-64 bg-white border rounded-lg shadow-xl z-10 p-4">
                            <p className="font-bold mb-3">Inkluder i prisen</p>
                            <div className="space-y-3">
                                {Object.keys(fees).map(key => (
                                    <div key={key} className="flex items-center justify-between">
                                        <Label htmlFor={key} className="text-gray-600">{fees[key as keyof typeof fees].name}</Label>
                                        <Switch id={key} checked={fees[key as keyof typeof fees].enabled} onCheckedChange={() => handleFeeToggle(key as keyof typeof fees)} />
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
      
      {/* CHART AREA */}
      {loading ? <div className="text-center h-72 flex items-center justify-center">Indlæser graf...</div> : error ? <div className="text-center h-72 flex items-center justify-center text-red-600">{error}</div> : (
        <div className="w-full">
            <div className="flex justify-between items-end h-72 w-full mb-4">
                {calculatedData.map(({ hour, spotPrice, total }) => {
                    const spotHeight = Math.max((spotPrice / maxPrice) * 280, 2); // Use pixels, min 2px
                    const totalHeight = Math.max((total / maxPrice) * 280, 4); // Use pixels, min 4px
                    const feesHeight = totalHeight - spotHeight;

                    return (
                        <div key={hour} className="flex-1 flex flex-col justify-end items-center group">
                            <div className="w-3/4 flex flex-col justify-end" style={{ height: '280px' }}>
                                <div className="relative flex flex-col justify-end w-full">
                                    {/* Fees & Taxes (Gray) on top */}
                                    <div 
                                        style={{ height: `${feesHeight}px` }} 
                                        className="bg-gray-300 group-hover:bg-gray-400 transition-colors rounded-t-md"
                                    />
                                    {/* Spot Price (Green) on bottom */}
                                    <div 
                                        style={{ height: `${spotHeight}px` }} 
                                        className="bg-green-500 group-hover:bg-green-600 transition-colors"
                                    />
                                </div>
                            </div>
                        </div>
                    );
                })}
            </div>
            {/* X-AXIS LABELS */}
            <div className="flex justify-between text-xs text-gray-500">
                {calculatedData.map(({ hour, total }) => (
                    <div key={hour} className="flex-1 text-center">
                        <div>kl. {String(hour).padStart(2, '0')}</div>
                        <div className="font-medium">{total.toFixed(2)} kr.</div>
                    </div>
                ))}
            </div>
        </div>
      )}
    </div>
  </section>
);
};

export default LivePriceGraphComponent;
