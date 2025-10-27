'use client'

import React, { useState, useEffect, useMemo, useRef } from 'react';
import { Settings2, CalendarDays, ChevronLeft, ChevronRight } from 'lucide-react';
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Button } from '@/components/ui/button';
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { cn } from "@/lib/utils";
import { toISOStringDK } from '@/utils/date-formatter';
import { useIsClient } from '@/hooks/useIsClient';

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
    headerAlignment?: 'left' | 'center' | 'right';
  };
}

// Use centralized date formatter to prevent hydration issues
const formatDate = (date: Date) => toISOStringDK(date).split('T')[0];

const LivePriceGraphComponent: React.FC<LivePriceGraphProps> = ({ block }) => {
  const isClient = useIsClient();
  const [data, setData] = useState<PriceData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isPrevDayFallback, setIsPrevDayFallback] = useState<boolean>(false);
  const [isPopoverOpen, setIsPopoverOpen] = useState(false);
  const [isCalendarOpen, setIsCalendarOpen] = useState(false);
  const [selectedDate, setSelectedDate] = useState(new Date());
  // Ensure a stable default region to avoid null/undefined requests during hydration
  const [currentRegion, setCurrentRegion] = useState<'DK1' | 'DK2'>(block.apiRegion || 'DK2');
  const [selectedHour, setSelectedHour] = useState<number | null>(null);

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
    // Only run on client after hydration
    if (!isClient) {
      console.log('[LivePriceGraph] Waiting for client hydration...');
      return;
    }

    const fetchData = async () => {
      console.log('[LivePriceGraph] useEffect starting, region:', currentRegion, 'date:', formatDate(selectedDate));
      setLoading(true);
      setError(null);
      const dateString = formatDate(selectedDate);
      try {
        console.log('[LivePriceGraph] Making API call to:', `/api/electricity-prices?region=${currentRegion}&date=${dateString}`);
        const response = await fetch(`/api/electricity-prices?region=${currentRegion}&date=${dateString}`);
        console.log('[LivePriceGraph] API response status:', response.status);
        if (!response.ok) throw new Error('Kunne ikke hente data.');
        const result = await response.json();
        console.log('[LivePriceGraph] API result:', result.records?.length, 'records');
        setIsPrevDayFallback(result?.metadata?.status === 'fallback_previous_day');

        if (!result.records || result.records.length === 0) {
          // Try client-side previous-day fallback to ensure robust UX
          try {
            const prev = new Date(selectedDate);
            prev.setDate(selectedDate.getDate() - 1);
            const prevDateString = formatDate(prev);
            console.log('[LivePriceGraph] No records for selected date. Trying previous day:', prevDateString);
            const prevResp = await fetch(`/api/electricity-prices?region=${currentRegion}&date=${prevDateString}`);
            console.log('[LivePriceGraph] Prev-day API response status:', prevResp.status);
            if (prevResp.ok) {
              const prevJson = await prevResp.json();
              const prevRecords = Array.isArray(prevJson.records) ? prevJson.records : [];
              if (prevRecords.length > 0) {
                setIsPrevDayFallback(true);
                setData(prevRecords);
                // compute max price safely
                const validPrices = prevRecords
                  .map((r: PriceData) => r.TotalPriceKWh)
                  .filter((price: number) => typeof price === 'number' && !isNaN(price) && isFinite(price));
                const max = validPrices.length > 0 ? Math.max(...validPrices) : 1.5;
                setMaxPrice(max > 0 ? max : 1.5);
              } else {
                setError('Priser for den valgte dato er endnu ikke tilgængelige.');
                setData([]);
              }
            } else {
              setError('Priser for den valgte dato er endnu ikke tilgængelige.');
              setData([]);
            }
          } catch {
            setError('Priser for den valgte dato er endnu ikke tilgængelige.');
            setData([]);
          }
        } else {
          console.log('[LivePriceGraph] Setting data:', result.records.length, 'records');
          setData(result.records);
          // Safe maxPrice calculation with validation
          const validPrices = result.records
            .map((r: PriceData) => r.TotalPriceKWh)
            .filter((price: number) => typeof price === 'number' && !isNaN(price) && isFinite(price));
          const max = validPrices.length > 0 ? Math.max(...validPrices) : 1.5;
          setMaxPrice(max > 0 ? max : 1.5); // Set a minimum max price to avoid tiny bars
          console.log('[LivePriceGraph] Data processing complete, maxPrice:', max);
        }
      } catch (err: any) {
        console.error('[LivePriceGraph] Error fetching data:', err);
        setError(err.message);
        setData([]);
        setIsPrevDayFallback(false);
      } finally {
        console.log('[LivePriceGraph] Setting loading to false');
        setLoading(false);
      }
    };
    fetchData();
  }, [isClient, currentRegion, selectedDate]);

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
    return data
      .filter(d => d && typeof d.SpotPriceKWh === 'number' && d.HourDK)
      .map(d => {
        const spotPrice = d.SpotPriceKWh || 0;
        let feesOnChart = 0;
        if (fees.system.enabled) feesOnChart += fees.system.value || 0;
        if (fees.elafgift.enabled) feesOnChart += fees.elafgift.value || 0;
        let totalWithFees = spotPrice + feesOnChart;
        if (fees.moms.enabled) totalWithFees *= fees.moms.value || 1;

        // Safe date parsing with fallback
        let hour = 0;
        try {
          hour = new Date(d.HourDK).getHours();
          if (isNaN(hour)) hour = 0;
        } catch (e) {
          hour = 0;
        }

        return {
          hour,
          spotPrice,
          total: totalWithFees,
          fees: feesOnChart * (fees.moms.enabled ? fees.moms.value || 1 : 1)
        };
      });
  }, [data, fees]);

  const stats = useMemo(() => {
    if (calculatedData.length === 0) return null;

    // Filter out invalid prices and ensure we have valid data
    const validPrices = calculatedData
      .map(d => d.total)
      .filter(price => typeof price === 'number' && !isNaN(price) && isFinite(price));

    if (validPrices.length === 0) return null;

    const highest = Math.max(...validPrices);
    const lowest = Math.min(...validPrices);
    const average = validPrices.reduce((a, b) => a + b, 0) / validPrices.length;

    // Calculate standard deviation with valid prices only
    const squaredDifferences = validPrices.map(price => Math.pow(price - average, 2));
    const variance = squaredDifferences.reduce((a, b) => a + b, 0) / validPrices.length;
    const standardDeviation = Math.sqrt(variance);

    // Find hours for highest/lowest prices with fallback
    const highestData = calculatedData.find(d => d.total === highest);
    const lowestData = calculatedData.find(d => d.total === lowest);

    return {
      highest: {
        price: highest || 0,
        hour: highestData?.hour ?? 0
      },
      lowest: {
        price: lowest || 0,
        hour: lowestData?.hour ?? 0
      },
      average: {
        price: average || 0
      },
      standardDeviation: standardDeviation || 0
    };
  }, [calculatedData]);

  const yAxisTicks = useMemo(() => {
    if (!stats) return [];
    const tickCount = 5;
    const ticks: number[] = [];
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
      <div className="bg-white rounded-xl shadow-lg border border-gray-100 p-6">

        {/* SECTION HEADER */}
        <div className={cn(
          "mb-8",
          block.headerAlignment === 'left' && "text-left",
          block.headerAlignment === 'center' && "text-center",
          block.headerAlignment === 'right' && "text-right",
          !block.headerAlignment && "text-left" // default to left for this component
        )}>
          <h3 className="text-3xl lg:text-4xl font-display font-bold text-gray-900 mb-2">{block.title}</h3>
          {block.subtitle && <p className="text-gray-600">{block.subtitle}</p>}
          {isPrevDayFallback && (
            <p className="text-xs text-gray-500 mt-1">Viser priser for i går</p>
          )}
        </div>

        {/* MAIN LAYOUT: LEFT (STATS + DATE CONTROLS) | RIGHT (REGION + FEES) */}
        <div className="flex flex-col md:flex-row justify-between items-start gap-8 md:gap-6 mb-6">

          {/* LEFT SIDE: Stats + Date Controls */}
          <div className="w-full flex-1 min-w-0">
            {/* STATISTICS */}
            <div className="flex items-center divide-x divide-gray-200 mb-6 max-w-lg">
              {stats && (
                <>
                  <div className="flex-1 pr-3 sm:pr-3.5">
                    <p className="text-[11px] sm:text-xs text-gray-500 mb-1">Højeste pris</p>
                    <p className="text-base sm:text-lg font-bold text-gray-800">{(stats?.highest?.price ?? 0).toFixed(2)} kr.</p>
                    <p className="text-[11px] sm:text-xs text-gray-500">Kl. {String(stats?.highest?.hour ?? 0).padStart(2, '0')}:00</p>
                  </div>
                  <div className="flex-1 px-3 sm:px-3.5">
                    <p className="text-[11px] sm:text-xs text-gray-500 mb-1">Laveste pris</p>
                    <p className="text-base sm:text-lg font-bold text-gray-800">{(stats?.lowest?.price ?? 0).toFixed(2)} kr.</p>
                    <p className="text-[11px] sm:text-xs text-gray-500">Kl. {String(stats?.lowest?.hour ?? 0).padStart(2, '0')}:00</p>
                  </div>
                  <div className="flex-1 pl-3 sm:pl-3.5">
                    <p className="text-[11px] sm:text-xs text-gray-500 mb-1">Gennemsnit</p>
                    <p className="text-base sm:text-lg font-bold text-gray-800">{(stats?.average?.price ?? 0).toFixed(2)} kr.</p>
                    <p className="text-[11px] sm:text-xs text-gray-500">{selectedDate.toLocaleDateString('da-DK', { day: 'numeric', month: 'long' })}</p>
                  </div>
                </>
              )}
            </div>

            {/* DATE CONTROLS */}
            <div className="flex items-center gap-2">
              <Button variant="ghost" size="icon" aria-label="Forrige dag" onClick={() => handleDateChange(-1)}>
                <ChevronLeft size={18} />
              </Button>
              <Popover open={isCalendarOpen} onOpenChange={setIsCalendarOpen}>
                <PopoverTrigger asChild>
                  <Button variant="ghost" className="flex items-center gap-2">
                    <CalendarDays size={18} /> {isToday ? 'I dag' : selectedDate.toLocaleDateString('da-DK')}
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
            <div className="flex items-center gap-2 text-sm" role="group" aria-label="Vælg prisregion">
              <button onClick={() => setCurrentRegion('DK1')} aria-label="Vælg Vestdanmark (DK1)" aria-pressed={currentRegion === 'DK1'} className={cn("px-3 py-1 rounded-full", currentRegion === 'DK1' ? 'bg-green-100 text-green-800 font-semibold' : 'text-gray-500')}>Vestdanmark</button>
              <button onClick={() => setCurrentRegion('DK2')} aria-label="Vælg Østdanmark (DK2)" aria-pressed={currentRegion === 'DK2'} className={cn("px-3 py-1 rounded-full", currentRegion === 'DK2' ? 'bg-green-100 text-green-800 font-semibold' : 'text-gray-500')}>Østdanmark</button>
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
          <>
            {/* Mobile vertical layout - list style like the example */}
            <div className="md:hidden w-full">
              <div className="space-y-[3px]">
                {calculatedData.map(({ hour, spotPrice, total, fees: feesAmount }) => {
                  const currentHour = new Date().getHours();
                  const isCurrentHour = hour === currentHour && isToday;
                  const priceCategory = stats ? getPriceCategory(total, stats.average.price, stats.standardDeviation) : 'medium';
                  const barWidth = Math.max((total / maxPrice) * 100, 5);
                  const spotWidth = Math.max((spotPrice / maxPrice) * 100, 2);

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
                      className={cn(
                        "flex items-center gap-2 py-1",
                        isCurrentHour && "bg-blue-50 -mx-4 px-4 border-l-4 border-blue-500"
                      )}
                    >
                      {/* Hour label */}
                      <div className="w-10 text-xs text-gray-600 font-medium">
                        {String(hour).padStart(2, '0')}:00
                      </div>

                      {/* Bar container */}
                      <div className="flex-1 relative">
                        <div className="relative h-4 bg-gray-100 rounded-sm overflow-hidden">
                          {/* Total bar (spot + fees) */}
                          <div
                            className={`absolute left-0 top-0 h-full ${getBarColor(priceCategory)} transition-all duration-300`}
                            style={{ width: `${barWidth}%` }}
                          >
                            {/* Striped pattern for spot price portion */}
                            <div
                              className="absolute left-0 top-0 h-full"
                              style={{
                                width: `${(spotWidth / barWidth) * 100}%`,
                                backgroundImage: `repeating-linear-gradient(
                                -45deg,
                                transparent,
                                transparent 2px,
                                rgba(0, 0, 0, 0.1) 2px,
                                rgba(0, 0, 0, 0.1) 4px
                              )`
                              }}
                            />
                          </div>
                        </div>
                      </div>

                      {/* Price label */}
                      <div className="w-16 text-right">
                        <div className="text-xs font-semibold text-gray-800">
                          {(total ?? 0).toFixed(2)}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Mobile legend - compact */}
              <div className="mt-3 flex flex-wrap items-center justify-center gap-x-3 gap-y-1 text-[10px]">
                <div className="flex items-center gap-1">
                  <div className="w-2.5 h-2.5 bg-green-500 rounded-sm"></div>
                  <span className="text-gray-600">Lav</span>
                </div>
                <div className="flex items-center gap-1">
                  <div className="w-2.5 h-2.5 bg-yellow-400 rounded-sm"></div>
                  <span className="text-gray-600">Mellem</span>
                </div>
                <div className="flex items-center gap-1">
                  <div className="w-2.5 h-2.5 bg-red-500 rounded-sm"></div>
                  <span className="text-gray-600">Høj</span>
                </div>
                <div className="flex items-center gap-1">
                  <div className="w-2.5 h-2.5 bg-gray-400 rounded-sm relative overflow-hidden">
                    <div
                      className="absolute inset-0"
                      style={{
                        backgroundImage: `repeating-linear-gradient(
                        -45deg,
                        transparent,
                        transparent 1px,
                        rgba(0, 0, 0, 0.15) 1px,
                        rgba(0, 0, 0, 0.15) 2px
                      )`
                      }}
                    />
                  </div>
                  <span className="text-gray-600">Spotpris</span>
                </div>
              </div>

              {/* Fees note */}
              <div className="mt-2 text-center text-[10px] text-gray-500">
                Priser vist inkl. moms, afgifter og gebyrer
              </div>
            </div>

            {/* Desktop horizontal layout */}
            <div ref={chartWrapperRef} className="hidden md:block w-full relative">
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
                        <span className="text-xs text-gray-400 mr-2">{(tick ?? 0).toFixed(2)}</span>
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
                            // Set the data for the tooltip content (this part is unchanged)
                            const system = fees.system.enabled ? fees.system.value : 0;
                            const elafgift = fees.elafgift.enabled ? fees.elafgift.value : 0;
                            const moms = fees.moms.enabled ? fees.moms.value : 1;
                            setHoveredHourData({ hour, spotPrice, total, transport: 0, system, elafgift, moms });

                            // --- CORRECTED POSITIONING LOGIC ---
                            if (!chartWrapperRef.current || !tooltipRef.current) return;

                            const wrapperRect = chartWrapperRef.current.getBoundingClientRect();
                            const barRect = event.currentTarget.getBoundingClientRect();
                            const tooltipWidth = tooltipRef.current.offsetWidth;

                            // 1. Calculate the bar's center relative to the static wrapper
                            const barCenterInWrapper = (barRect.left + barRect.width / 2) - wrapperRect.left;

                            // 2. Calculate the ideal centered 'left' position for the tooltip
                            let finalLeft = barCenterInWrapper - (tooltipWidth / 2);

                            // 3. Clamp the 'left' position to ensure it stays within the wrapper's bounds
                            finalLeft = Math.max(
                              0, // Prevent it from going off the left edge
                              Math.min(finalLeft, wrapperRect.width - tooltipWidth) // Prevent it from going off the right edge
                            );

                            // 4. Calculate the 'top' position relative to the wrapper
                            const finalTop = barRect.top - wrapperRect.top;

                            setTooltipPosition({
                              left: finalLeft,
                              top: finalTop,
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
                            <div className="text-xs font-medium text-gray-600 leading-none">{(total ?? 0).toFixed(2)}</div>
                            <div className="text-xs text-gray-500 leading-none mt-0.5">{String(hour).padStart(2, '0')}:00</div>
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
                    transform: `translateY(calc(-100% - 10px))`, // Positions tooltip 10px above the bar
                    transition: 'opacity 0.2s, top 0.1s, left 0.1s', // Smoother transition
                    pointerEvents: 'none'
                  }}
                >
                  <div className="text-sm font-semibold mb-2">Kl. {String(hoveredHourData.hour).padStart(2, '0')}:00</div>
                  <div className="flex flex-col gap-y-1 text-xs">
                    <div className="flex justify-between">
                      <span>Spotpris:</span>
                      <span>{(hoveredHourData?.spotPrice ?? 0).toFixed(2)} kr/kWh</span>
                    </div>
                    {hoveredHourData.system > 0 && (
                      <div className="flex justify-between">
                        <span>Systemgebyr:</span>
                        <span>{(hoveredHourData?.system ?? 0).toFixed(2)} kr/kWh</span>
                      </div>
                    )}
                    {hoveredHourData.elafgift > 0 && (
                      <div className="flex justify-between">
                        <span>Elafgift:</span>
                        <span>{(hoveredHourData?.elafgift ?? 0).toFixed(2)} kr/kWh</span>
                      </div>
                    )}
                    <div className="border-t border-gray-600 pt-1 mt-1">
                      <div className="flex justify-between font-semibold">
                        <span>Total pris:</span>
                        <span>{(hoveredHourData?.total ?? 0).toFixed(2)} kr/kWh</span>
                      </div>
                    </div>
                  </div>
                  {/* Tooltip Arrow */}
                  <div className="absolute top-full left-1/2 transform -translate-x-1/2 border-4 border-transparent border-t-gray-800"></div>
                </div>
              )}
            </div>
          </>
        )}
      </div>
    </section>
  );
};

export default LivePriceGraphComponent;
