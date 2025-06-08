import React, { useState, useEffect, useRef } from 'react';
import { Settings2, CalendarDays, ChevronLeft, ChevronRight } from 'lucide-react';
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Button } from '@/components/ui/button';
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
  const [selectedDate, setSelectedDate] = useState(new Date());

  const [fees, setFees] = useState({
    transport: { name: 'Netselskab', value: 0.12, enabled: true },
    system: { name: 'Forsyningstilsynet', value: 0.06, enabled: true },
    elafgift: { name: 'Elafgift', value: 0.76, enabled: true },
    moms: { name: 'Moms', value: 1.25, enabled: true },
  });

  const popoverRef = useRef<HTMLDivElement>(null);
  const [hoveredHour, setHoveredHour] = useState<PriceData | null>(null);
  const [maxPrice, setMaxPrice] = useState(1);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      setError(null);
      const dateString = formatDate(selectedDate);
      try {
        const response = await fetch(`/api/electricity-prices?region=${block.apiRegion}&date=${dateString}`);
        if (!response.ok) throw new Error('Kunne ikke hente data.');
        const result = await response.json();
        
        if (!result.records || result.records.length === 0) {
          setError('Priser for den valgte dato er endnu ikke tilgængelige.');
          setData([]);
        } else {
          setData(result.records);
          const max = Math.max(...result.records.map((r: PriceData) => r.TotalPriceKWh));
          setMaxPrice(max > 0 ? max : 1);
        }
      } catch (err: any) {
        setError(err.message);
        setData([]);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [block.apiRegion, selectedDate]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (popoverRef.current && !popoverRef.current.contains(event.target as Node)) {
        setIsPopoverOpen(false);
      }
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

  const isToday = formatDate(selectedDate) === formatDate(new Date());

  return (
    <div className="p-4 md:p-6 bg-gray-50 rounded-lg shadow-md my-8">
      <div className="flex flex-wrap justify-between items-center gap-4 mb-6">
        <div>
          <h3 className="text-2xl font-bold text-gray-800">{block.title}</h3>
          {block.subtitle && <p className="text-gray-600">{block.subtitle}</p>}
        </div>
        <div className="flex items-center gap-2">
            <Button variant="outline" size="icon" onClick={() => handleDateChange(-1)}><ChevronLeft size={16}/></Button>
            <Button variant="outline" className="w-40 flex items-center gap-2" onClick={() => setSelectedDate(new Date())}>
                <CalendarDays size={16}/>{isToday ? "I dag" : selectedDate.toLocaleDateString('da-DK')}
            </Button>
            <Button variant="outline" size="icon" onClick={() => handleDateChange(1)}><ChevronRight size={16}/></Button>
            <div className="relative" ref={popoverRef}>
                <Button variant="outline" onClick={() => setIsPopoverOpen(!isPopoverOpen)} className="flex items-center gap-2">
                    <Settings2 size={16} />Afgifter
                </Button>
                {isPopoverOpen && (
                    <div className="absolute right-0 mt-2 w-64 bg-white border rounded-lg shadow-xl z-10 p-4">
                        <p className="font-bold mb-3 text-gray-700">Inkluder i prisen</p>
                        <div className="space-y-3">
                            {Object.keys(fees).map((key) => {
                                const fee = fees[key as keyof typeof fees];
                                return (
                                <div key={key} className="flex items-center justify-between">
                                    <Label htmlFor={key} className="text-gray-600">{fee.name}</Label>
                                    <Switch id={key} checked={fee.enabled} onCheckedChange={() => handleFeeToggle(key as keyof typeof fees)} />
                                </div>
                                )
                            })}
                        </div>
                    </div>
                )}
            </div>
        </div>
      </div>
      
      {loading ? <div className="text-center py-24">Indlæser graf...</div> : error ? <div className="text-center py-24 text-red-600">{error}</div> : (
        <div className="relative">
            {hoveredHour && (
                <div className="absolute -top-10 left-1/2 -translate-x-1/2 p-2 bg-gray-800 text-white text-xs rounded-md shadow-lg z-10 whitespace-nowrap">
                   Kl. {new Date(hoveredHour.HourDK).getHours().toString().padStart(2, '0')}:00 - Total: {hoveredHour.TotalPriceKWh.toFixed(2)} kr./kWh
                </div>
            )}
            <div className="flex justify-between items-end h-64 border-b border-gray-200" onMouseLeave={() => setHoveredHour(null)}>
                {Array.from({ length: 24 }).map((_, index) => {
                    const hourData = data.find(d => new Date(d.HourDK).getHours() === index);
                    
                    if (!hourData) {
                        return <div key={index} className="flex-1 h-full" />;
                    }

                    const spotPrice = hourData.SpotPriceKWh;
                    let feesAndTaxes = 0;
                    if (fees.transport.enabled) feesAndTaxes += fees.transport.value;
                    if (fees.system.enabled) feesAndTaxes += fees.system.value;
                    if (fees.elafgift.enabled) feesAndTaxes += fees.elafgift.value;
                    
                    let totalBeforeMoms = spotPrice + feesAndTaxes;
                    if (fees.moms.enabled) {
                      totalBeforeMoms *= fees.moms.value;
                    }
                    const totalFees = totalBeforeMoms - spotPrice;
                    const totalPrice = spotPrice + totalFees;
                    const spotHeight = (spotPrice / maxPrice) * 100;
                    const totalHeight = (totalPrice / maxPrice) * 100;

                    return (
                        <div key={index} className="flex-1 flex flex-col justify-end items-center h-full relative group" onMouseEnter={() => setHoveredHour(hourData)}>
                            <div className="w-3/4 h-full flex flex-col justify-end">
                                <div style={{ height: `${totalHeight}%` }} className={cn("relative rounded-t-md transition-all duration-200", hoveredHour === hourData ? "bg-gray-400" : "bg-gray-300")}>
                                    <div style={{ height: `${(spotHeight / totalHeight) * 100}%` }} className={cn("absolute bottom-0 left-0 right-0 rounded-t-md", hoveredHour === hourData ? "bg-green-500" : "bg-green-400")} />
                                </div>
                            </div>
                            <span className="text-xs text-gray-500 mt-1">{index.toString().padStart(2, '0')}</span>
                        </div>
                    );
                })}
            </div>
             <div className="flex justify-center items-center gap-4 mt-4 text-xs text-gray-600">
                <div className="flex items-center gap-2"><div className="w-3 h-3 bg-green-400 rounded-sm"></div>Spotpris</div>
                <div className="flex items-center gap-2"><div className="w-3 h-3 bg-gray-300 rounded-sm"></div>Afgifter & Moms</div>
            </div>
        </div>
      )}
    </div>
  );
};

export default LivePriceGraphComponent;
