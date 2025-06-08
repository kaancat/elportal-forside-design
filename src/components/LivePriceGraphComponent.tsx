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

  // Calculate statistics and processed data
  const processedData = data.map(d => {
    const spotPrice = d.SpotPriceKWh;
    let feesAndTaxes = 0;
    if (fees.transport.enabled) feesAndTaxes += fees.transport.value;
    if (fees.system.enabled) feesAndTaxes += fees.system.value;
    if (fees.elafgift.enabled) feesAndTaxes += fees.elafgift.value;
    
    let totalBeforeMoms = spotPrice + feesAndTaxes;
    if (fees.moms.enabled) {
      totalBeforeMoms *= fees.moms.value;
    }
    const totalPrice = totalBeforeMoms;
    
    return {
      ...d,
      spotPrice,
      totalPrice,
      hour: new Date(d.HourDK).getHours()
    };
  });

  const maxPriceData = processedData.length > 0 ? processedData.reduce((max, current) => max.totalPrice > current.totalPrice ? max : current) : null;
  const minPriceData = processedData.length > 0 ? processedData.reduce((min, current) => min.totalPrice < current.totalPrice ? min : current) : null;
  const averagePrice = processedData.length > 0 ? processedData.reduce((sum, d) => sum + d.totalPrice, 0) / processedData.length : 0;
  const maxPrice = Math.max(...processedData.map(d => d.totalPrice), 1);

  return (
    <div className="max-w-4xl mx-auto bg-white rounded-xl shadow-lg p-6 my-12">
      {loading ? (
        <div className="text-center py-24">Indlæser graf...</div>
      ) : error ? (
        <div className="text-center py-24 text-red-600">{error}</div>
      ) : (
        <>
          {/* Top Statistics Section */}
          <div className="flex justify-between items-center mb-6">
            <div className="flex gap-8">
              <div>
                <div className="text-sm text-gray-600">Højeste pris</div>
                <div className="text-lg font-bold">{maxPriceData?.totalPrice.toFixed(2)} kr.</div>
                <div className="text-xs text-gray-500 flex items-center gap-1">
                  <div className="w-2 h-2 bg-green-600 rounded-full"></div>
                  Kl. {maxPriceData?.hour.toString().padStart(2, '0')}-{(maxPriceData?.hour + 1).toString().padStart(2, '0')}
                </div>
              </div>
              <div>
                <div className="text-sm text-gray-600">Laveste pris</div>
                <div className="text-lg font-bold">{minPriceData?.totalPrice.toFixed(2)} kr.</div>
                <div className="text-xs text-gray-500 flex items-center gap-1">
                  <div className="w-2 h-2 bg-green-600 rounded-full"></div>
                  Kl. {minPriceData?.hour.toString().padStart(2, '0')}-{(minPriceData?.hour + 1).toString().padStart(2, '0')}
                </div>
              </div>
              <div>
                <div className="text-sm text-gray-600">Gennemsnit</div>
                <div className="text-lg font-bold">{averagePrice.toFixed(2)} kr.</div>
                <div className="text-xs text-gray-500 flex items-center gap-1">
                  <div className="w-2 h-2 bg-green-600 rounded-full"></div>
                  {selectedDate.toLocaleDateString('da-DK')}
                </div>
              </div>
            </div>
          </div>

          {/* Date Controls Section */}
          <div className="flex justify-between items-center mb-6">
            <div className="flex items-center gap-4">
              <h2 className="text-xl font-bold flex items-center gap-2">
                <CalendarDays size={20} />
                {isToday ? "I dag" : "Dato"} - {selectedDate.toLocaleDateString('da-DK')}
              </h2>
              <Button variant="outline" size="sm" onClick={() => handleDateChange(1)} className="text-xs">
                i morgen
              </Button>
            </div>
            <div className="flex items-center gap-2">
              <div className="text-sm text-green-600 font-medium">+ 18,96 kr. / md</div>
              <div className="relative" ref={popoverRef}>
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={() => setIsPopoverOpen(!isPopoverOpen)} 
                  className="flex items-center gap-1 text-green-600"
                >
                  <Settings2 size={14} />
                  Afgifter
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
                            <Switch 
                              id={key} 
                              checked={fee.enabled} 
                              onCheckedChange={() => handleFeeToggle(key as keyof typeof fees)} 
                            />
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}
              </div>
              <div className="text-sm text-gray-600">{block.apiRegion}</div>
            </div>
          </div>

          {/* Chart Section */}
          <div className="relative bg-gray-50 rounded-lg p-4">
            {hoveredHour && (
              <div className="absolute -top-12 left-1/2 transform -translate-x-1/2 bg-gray-800 text-white text-xs px-2 py-1 rounded z-10 whitespace-nowrap">
                Kl. {new Date(hoveredHour.HourDK).getHours().toString().padStart(2, '0')}:00 - {hoveredHour.TotalPriceKWh.toFixed(2)} kr.
              </div>
            )}
            
            {/* Navigation Arrows */}
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={() => handleDateChange(-1)}
              className="absolute left-2 top-1/2 transform -translate-y-1/2 z-10"
            >
              <ChevronLeft size={20} />
            </Button>
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={() => handleDateChange(1)}
              className="absolute right-2 top-1/2 transform -translate-y-1/2 z-10"
            >
              <ChevronRight size={20} />
            </Button>

            {/* Chart Area */}
            <div className="flex justify-between items-end h-64 px-8" onMouseLeave={() => setHoveredHour(null)}>
              {Array.from({ length: 24 }).map((_, index) => {
                const hourData = processedData.find(d => d.hour === index);
                
                if (!hourData) {
                  return (
                    <div key={index} className="flex flex-col items-center flex-1">
                      <div className="w-full h-64 mb-2"></div>
                      <div className="text-xs text-gray-400 text-center">
                        <div>kl. {index.toString().padStart(2, '0')}</div>
                        <div>- kr.</div>
                      </div>
                    </div>
                  );
                }

                const barHeight = Math.max((hourData.totalPrice / maxPrice) * 240, 2); // Use pixels, min 2px
                const spotHeight = Math.max((hourData.spotPrice / maxPrice) * 240, 1); // Use pixels, min 1px
                
                return (
                  <div 
                    key={index} 
                    className="flex flex-col items-center flex-1 group cursor-pointer"
                    onMouseEnter={() => setHoveredHour(hourData)}
                  >
                    <div className="w-full flex flex-col justify-end h-64 mb-2">
                      <div className="mx-auto w-6 flex flex-col justify-end" style={{ height: `${barHeight}px` }}>
                        <div 
                          className="relative bg-gray-300 group-hover:bg-gray-400 transition-colors w-full"
                          style={{ height: `${barHeight}px` }}
                        >
                          <div 
                            style={{ height: `${spotHeight}px` }} 
                            className="absolute bottom-0 left-0 right-0 bg-green-500 group-hover:bg-green-600 transition-colors"
                          />
                        </div>
                      </div>
                    </div>
                    <div className="text-xs text-gray-600 text-center">
                      <div>kl. {index.toString().padStart(2, '0')}</div>
                      <div>{hourData.totalPrice.toFixed(2)} kr.</div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Legend */}
          <div className="flex justify-center items-center gap-6 mt-4 text-sm">
            <div className="flex items-center gap-2">
              <div className="w-4 h-3 bg-gray-300 relative">
                <div className="absolute inset-0 bg-gradient-to-b from-transparent from-20% to-green-500 to-20%"></div>
              </div>
              <span>Afgifter</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-3 bg-transparent border border-dashed border-gray-400"></div>
              <span>Lige nu</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-3 bg-green-500"></div>
              <span>Lav pris</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-3 bg-yellow-500"></div>
              <span>Mellem pris</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-3 bg-red-500"></div>
              <span>Høj pris</span>
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default LivePriceGraphComponent;
