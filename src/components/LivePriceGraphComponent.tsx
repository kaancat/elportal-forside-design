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

  const [hoveredHourData, setHoveredHourData] = useState<{
    hour: number;
    spotPrice: number;
    total: number;
    transport: number;
    system: number;
    elafgift: number;
    moms: number;
  } | null>(null);

  const [fees, setFees] = useState({
    system: { name: 'Systemgebyr', value: 0.19, enabled: true },
    elafgift: { name: 'Elafgift', value: 0.90, enabled: true },
    moms: { name: 'Moms', value: 1.25, enabled: true },
  });

  const popoverRef = useRef<HTMLDivElement>(null);
  const chartAreaRef = useRef<HTMLDivElement>(null);
  const tooltipRef = useRef<HTMLDivElement>(null);
  const chartWrapperRef = useRef<HTMLDivElement>(null);
  const [maxPrice, setMaxPrice] = useState(1);
  const [tooltipPosition, setTooltipPosition] = useState<{ left: number; top: number; opacity: number }>({ left: 0, top: 0, opacity: 0 });

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

  const setDateToTomorrow = () => {
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    setSelectedDate(tomorrow);
  };

  const getPriceCategory = (price: number, averagePrice: number, standardDeviation: number): 'low' | 'medium' | 'high' => {
    if (price < averagePrice - (0.5 * standardDeviation)) return 'low';
    if (price > averagePrice + (1.0 * standardDeviation)) return 'high';
    return 'medium';
  };

  const calculatedData = useMemo(() => {
    return data.map(d => {
      const spotPrice = d.SpotPriceKWh;
      let feesOnChart = 0;
      if (fees.system.enabled) feesOnChart += fees.system.value;
      if (fees.elafgift.enabled) feesOnChart += fees.elafgift.value;
      let totalWithFees = spotPrice + feesOnChart;
      if (fees.moms.enabled) totalWithFees *= fees.moms.value;
      return { hour: new Date(d.HourDK).getHours(), spotPrice, total: totalWithFees, fees: feesOnChart * (fees.moms.enabled ? fees.moms.value : 1) };
    });
  }, [data, fees]);

  const stats = useMemo(() => {
    if (calculatedData.length === 0) return null;
    const prices = calculatedData.map(d => d.total);
    const highest = Math.max(...prices);
    const lowest = Math.min(...prices);
    const average = prices.reduce((a, b) => a + b, 0) / prices.length;
    
    // Calculate standard deviation
    const squaredDifferences = prices.map(price => Math.pow(price - average, 2));
    const variance = squaredDifferences.reduce((a, b) => a + b, 0) / prices.length;
    const standardDeviation = Math.sqrt(variance);
    
    return {
      highest: { price: highest, hour: calculatedData.find(d => d.total === highest)?.hour },
      lowest: { price: lowest, hour: calculatedData.find(d => d.total === lowest)?.hour },
      average: { price: average },
      standardDeviation
    };
  }, [calculatedData]);

  const yAxisTicks = useMemo(() => {
    if (!stats) return [];
    const tickCount = 5;
    const ticks = [];
    for (let i = 0; i < tickCount; i++) {
      const price = (maxPrice / (tickCount - 1)) * i;
      ticks.push(price);
    }
    return ticks.reverse(); // To render from top to bottom
  }, [maxPrice, stats]);

  const isToday = formatDate(selectedDate) === formatDate(new Date());
  const isTomorrow = formatDate(selectedDate) === formatDate((() => { const d = new Date(); d.setDate(d.getDate() + 1); return d; })());

  return (
    <section className="container mx-auto px-4 py-16">
      <div className="max-w-6xl mx-auto bg-white rounded-xl shadow-lg border border-gray-100 p-6">
        
        {/* SECTION HEADER */}
        <div className="mb-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">{block.title}</h2>
          {block.subtitle && <p className="text-gray-600">{block.subtitle}</p>}
        </div>

        {/* MAIN LAYOUT: LEFT (STATS + DATE CONTROLS) | RIGHT (REGION + FEES) */}
        <div className="flex flex-col md:flex-row justify-between items-start gap-8 md:gap-6 mb-6">
          
          {/* LEFT SIDE: Stats + Date Controls */}
          <div className="w-full flex-1 min-w-0">
            {/* STATISTICS */}
            <div className="grid grid-cols-3 gap-x-2 sm:gap-x-4 md:gap-x-2 gap-y-6 mb-6">
                {stats && (
                    <>
                        <div>
                            <p className="text-[11px] sm:text-xs text-gray-500">Højeste pris</p>
                            <p className="text-base sm:text-lg font-bold text-gray-800">{stats.highest.price.toFixed(2)} kr.</p>
                            <p className="text-[11px] sm:text-xs text-gray-500">Kl. {String(stats.highest.hour).padStart(2, '0')}:00</p>
                        </div>
                        <div>
                            <p className="text-[11px] sm:text-xs text-gray-500">Laveste pris</p>
                            <p className="text-base sm:text-lg font-bold text-gray-800">{stats.lowest.price.toFixed(2)} kr.</p>
                            <p className="text-[11px] sm:text-xs text-gray-500">Kl. {String(stats.lowest.hour).padStart(2, '0')}:00</p>
                        </div>
                        <div>
                            <p className="text-[11px] sm:text-xs text-gray-500">Gennemsnit</p>
                            <p className="text-base sm:text-lg font-bold text-gray-800">{stats.average.price.toFixed(2)} kr.</p>
                            <p className="text-[11px] sm:text-xs text-gray-500">{selectedDate.toLocaleDateString('da-DK', { day: 'numeric', month: 'long' })}</p>
                        </div>
                    </>
                )}
            </div>
            
            {/* DATE CONTROLS */}
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
                {!isTomorrow && (
                    <Button variant="outline" size="sm" onClick={setDateToTomorrow}>
                        i morgen
                    </Button>
                )}
            </div>
          </div>
          
          {/* RIGHT SIDE: Region + Fees */}
          <div className="w-full md:w-auto flex items-center justify-between md:justify-start gap-4">
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
        <div ref={chartWrapperRef} className="w-full relative">
            <div ref={chartAreaRef} className="overflow-x-auto">
                <div className="flex w-full min-w-[800px] pb-4">
                    {/* Y-Axis Labels & Gridlines */}
                    <div className="relative h-72 w-16 pr-2">
                        {yAxisTicks.map((tick, index) => (
                            <div 
                                key={index} 
                                className="absolute right-0 w-full flex items-center"
                                style={{ top: `${((maxPrice - tick) / maxPrice) * 100}%`, transform: 'translateY(-50%)' }}
                            >
                                <span className="text-xs text-gray-400 mr-2">{tick.toFixed(2)}</span>
                                <div className="flex-1 border-b border-dashed border-gray-200"></div>
                            </div>
                        ))}
                    </div>

                    {/* Chart Bars Container */}
                    <div className="flex justify-between items-start h-72 w-full mb-4 flex-1">
                        {calculatedData.map(({ hour, spotPrice, total, fees: feesAmount }) => {
                            const totalHeight = Math.max((total / maxPrice) * 280, 4);
                            const spotHeight = Math.max((spotPrice / maxPrice) * 280, 2);
                            const feesHeight = totalHeight - spotHeight;
                            const currentHour = new Date().getHours();
                            const isCurrentHour = hour === currentHour && isToday;
                            const priceCategory = stats ? getPriceCategory(total, stats.average.price, stats.standardDeviation) : 'medium';
                            
                            const getBarColor = (category: 'low' | 'medium' | 'high') => {
                                switch (category) {
                                    case 'low': return 'bg-green-500';
                                    case 'medium': return 'bg-yellow-400';
                                    case 'high': return 'bg-red-500';
                                }
                            };

                            return (
                                <div 
                                    key={hour} 
                                    className="flex-1 flex flex-col justify-start items-center group cursor-pointer relative pt-4"
                                    onMouseEnter={(event: React.MouseEvent<HTMLDivElement>) => {
                                        const system = fees.system.enabled ? fees.system.value : 0;
                                        const elafgift = fees.elafgift.enabled ? fees.elafgift.value : 0;
                                        const moms = fees.moms.enabled ? fees.moms.value : 1;
                                        setHoveredHourData({ hour, spotPrice, total, transport: 0, system, elafgift, moms });

                                        if (!chartAreaRef.current || !chartWrapperRef.current) return;

                                        const chartWrapperRect = chartWrapperRef.current.getBoundingClientRect();
                                        const chartScrollAreaRect = chartAreaRef.current.getBoundingClientRect();
                                        const barRect = event.currentTarget.getBoundingClientRect();
                                        const tooltipWidth = tooltipRef.current?.offsetWidth || 192;

                                        // --- Left Position Calculation (no change, still correct) ---
                                        const barCenter = barRect.left + barRect.width / 2;
                                        const idealLeft = barCenter - chartScrollAreaRect.left - tooltipWidth / 2 + chartAreaRef.current.scrollLeft;
                                        const finalLeft = Math.max(
                                            chartAreaRef.current.scrollLeft,
                                            Math.min(idealLeft, chartAreaRef.current.scrollWidth - tooltipWidth)
                                        );

                                        // --- Top Position Calculation (UPDATED) ---
                                        // Calculate top relative to the non-scrolling wrapper
                                        const finalTop = barRect.top - chartWrapperRect.top;

                                        setTooltipPosition({
                                            left: finalLeft,
                                            top: finalTop, // Use the new robust top position
                                            opacity: 1
                                        });
                                    }}
                                    onMouseLeave={() => {
                                        setHoveredHourData(null);
                                        setTooltipPosition(prev => ({ ...prev, opacity: 0 }));
                                    }}
                                >
                                    <div className="w-3/4 flex flex-col justify-end relative" style={{ height: '280px' }}>
                                        {/* Current hour indicator */}
                                        {isCurrentHour && (
                                            <div className="absolute inset-0 border-2 border-dashed border-blue-500 rounded-md -m-1 z-30"></div>
                                        )}
                                        <div className="relative flex flex-col justify-end w-full">
                                            {/* Fees portion (solid color) */}
                                            <div 
                                                style={{ height: `${feesHeight}px` }} 
                                                className={`${getBarColor(priceCategory)} transition-colors rounded-t-md`}
                                            />
                                            {/* Spot price portion (striped pattern) */}
                                            <div 
                                                style={{ height: `${spotHeight}px` }} 
                                                className={`${getBarColor(priceCategory)} transition-colors relative overflow-hidden`}
                                            >
                                                {/* Diagonal stripe pattern */}
                                                <div 
                                                    className="absolute inset-0"
                                                    style={{
                                                        backgroundImage: `repeating-linear-gradient(
                                                            -45deg,
                                                            transparent,
                                                            transparent 4px,
                                                            rgba(0, 0, 0, 0.1) 4px,
                                                            rgba(0, 0, 0, 0.1) 8px
                                                        )`
                                                    }}
                                                />
                                            </div>
                                        </div>
                                    </div>
                                    
                                    {/* Labels container, placed directly below the bar */}
                                    <div className="text-center mt-2 px-0.5">
                                        <div className="text-xs font-medium text-gray-600 leading-none">{total.toFixed(2)}</div>
                                        <div className="text-xs text-gray-500 leading-none mt-0.5">kl. {String(hour).padStart(2, '0')}</div>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>

                {/* UPDATED LEGEND */}
                <div className="flex gap-x-6 gap-y-2 flex-wrap justify-center items-center mt-8 min-w-[800px]">
                    <div className="flex items-center gap-2">
                        <div className="w-4 h-4 bg-green-500 rounded"></div>
                        <span className="text-sm text-gray-600">Lav pris</span>
                    </div>
                    <div className="flex items-center gap-2">
                        <div className="w-4 h-4 bg-yellow-400 rounded"></div>
                        <span className="text-sm text-gray-600">Mellem pris</span>
                    </div>
                    <div className="flex items-center gap-2">
                        <div className="w-4 h-4 bg-red-500 rounded"></div>
                        <span className="text-sm text-gray-600">Høj pris</span>
                    </div>
                    <div className="flex items-center gap-2">
                        <div className="w-4 h-4 border-2 border-dashed border-blue-500 rounded"></div>
                        <span className="text-sm text-gray-600">Lige nu</span>
                    </div>
                    <div className="flex items-center gap-2">
                        <div className="w-4 h-4 bg-gray-400 rounded relative overflow-hidden">
                            <div 
                                className="absolute inset-0"
                                style={{
                                    backgroundImage: `repeating-linear-gradient(
                                        -45deg,
                                        transparent,
                                        transparent 2px,
                                        rgba(0, 0, 0, 0.15) 2px,
                                        rgba(0, 0, 0, 0.15) 4px
                                    )`
                                }}
                            />
                        </div>
                        <span className="text-sm text-gray-600">Spotpris</span>
                    </div>
                </div>
            </div>
            
            {/* TOOLTIP - Now outside the scrolling container */}
            {hoveredHourData && (
                <div 
                    ref={tooltipRef}
                    className="absolute bg-gray-800 text-white p-3 rounded-lg shadow-lg z-20 min-w-48" 
                    style={{
                        left: `${tooltipPosition.left}px`,
                        top: `${tooltipPosition.top}px`,
                        opacity: tooltipPosition.opacity,
                        transform: 'translateY(calc(-100% - 10px))', // Position above the bar with a 10px gap
                        transition: 'opacity 0.2s',
                        pointerEvents: 'none' // Prevent the tooltip from capturing mouse events
                    }}
                >
                    <div className="text-sm font-semibold mb-2">Kl. {String(hoveredHourData.hour).padStart(2, '0')}:00</div>
                    <div className="flex flex-col gap-y-1 text-xs">
                        <div className="flex justify-between">
                            <span>Spotpris:</span>
                            <span>{hoveredHourData.spotPrice.toFixed(2)} kr/kWh</span>
                        </div>
                        {hoveredHourData.system > 0 && (
                            <div className="flex justify-between">
                                <span>Systemgebyr:</span>
                                <span>{hoveredHourData.system.toFixed(2)} kr/kWh</span>
                            </div>
                        )}
                        {hoveredHourData.elafgift > 0 && (
                            <div className="flex justify-between">
                                <span>Elafgift:</span>
                                <span>{hoveredHourData.elafgift.toFixed(2)} kr/kWh</span>
                            </div>
                        )}
                        <div className="border-t border-gray-600 pt-1 mt-1">
                            <div className="flex justify-between font-semibold">
                                <span>Total pris:</span>
                                <span>{hoveredHourData.total.toFixed(2)} kr/kWh</span>
                            </div>
                        </div>
                    </div>
                    {/* Tooltip Arrow */}
                    <div className="absolute top-full left-1/2 transform -translate-x-1/2 border-4 border-transparent border-t-gray-800"></div>
                </div>
            )}
        </div>
      )}
    </div>
  </section>
);
};

export default LivePriceGraphComponent;
