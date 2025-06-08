import React, { useState, useEffect, useRef } from 'react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts';
import { Settings2, CalendarDays, ChevronLeft, ChevronRight } from 'lucide-react';
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Button } from '@/components/ui/button';

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

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      setError(null);
      const dateString = formatDate(selectedDate);
      try {
        const response = await fetch(`/api/electricity-prices?region=${block.apiRegion}&date=${dateString}`);
        if (!response.ok) throw new Error('Kunne ikke hente data for den valgte dato.');
        const result = await response.json();
        if (result.records.length === 0) {
            setError('Priser for den valgte dato er endnu ikke tilgængelige.');
        }
        setData(result.records);
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
  
  const chartData = data.map(d => {
    const spotPrice = d.SpotPriceKWh;
    
    let feesOnChart = 0;
    if (fees.transport.enabled) feesOnChart += fees.transport.value;
    if (fees.system.enabled) feesOnChart += fees.system.value;
    if (fees.elafgift.enabled) feesOnChart += fees.elafgift.value;
    
    let totalWithFees = spotPrice + feesOnChart;
    if (fees.moms.enabled) {
      totalWithFees *= fees.moms.value;
    }

    return {
      name: new Date(d.HourDK).getHours().toString().padStart(2, '0'),
      'Spotpris': spotPrice,
      'Afgifter & Moms': totalWithFees - spotPrice,
      'Total': totalWithFees,
    };
  });

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      const total = payload[0].payload.Total;
      return (
        <div className="p-3 bg-white border rounded-lg shadow-lg text-sm">
          <p className="font-bold mb-2">{`Kl. ${label}:00`}</p>
          <p className="font-bold">{`Total: ${total.toFixed(2)} kr./kWh`}</p>
        </div>
      );
    }
    return null;
  };
  
  const isToday = formatDate(selectedDate) === formatDate(new Date());

  return (
    <div className="p-4 md:p-6 bg-gray-50 rounded-lg shadow-md my-8">
      <div className="flex flex-wrap justify-between items-center gap-4 mb-4">
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
      
      {loading ? <div className="text-center py-16">Indlæser graf...</div> : error ? <div className="text-center py-16 text-red-600">{error}</div> : (
        <div style={{ width: '100%', height: 350 }}>
          <ResponsiveContainer>
            <BarChart data={chartData} margin={{ top: 5, right: 10, left: -20, bottom: 20 }}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} />
              <XAxis dataKey="name" tick={{ fontSize: 12 }} label={{ value: "Timer (24-timers format)", position: 'insideBottom', dy: 20 }} />
              <YAxis tick={{ fontSize: 12 }} unit=" kr" tickFormatter={(value) => value.toFixed(2)} domain={[0, 'dataMax + 0.2']} />
              <Tooltip content={<CustomTooltip />} cursor={{ fill: 'rgba(236, 253, 245, 0.5)' }} />
              <Bar dataKey="Spotpris" stackId="a" fill="#22c55e" name="Spotpris" />
              <Bar dataKey="Afgifter & Moms" stackId="a" fill="#a1a1aa" name="Afgifter & Moms" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      )}
    </div>
  );
};

export default LivePriceGraphComponent;
