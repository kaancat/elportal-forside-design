import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ReferenceLine, Area, AreaChart } from 'recharts';
import { Sun, Moon, Sunrise, Sunset, AlertCircle, Calendar, MapPin } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { PortableText } from '@portabletext/react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

import type { DailyPriceTimelineBlock } from '@/types/sanity';

interface DailyPriceTimelineProps {
  block: DailyPriceTimelineBlock;
}

interface PriceData {
  hour: string;
  price: number;
  timeOfDay: 'night' | 'morning' | 'day' | 'evening';
  isPeak: boolean;
}

interface ApiPriceData {
  HourDK: string;
  SpotPriceKWh: number;
  TotalPriceKWh: number;
}

const DailyPriceTimeline: React.FC<DailyPriceTimelineProps> = ({ block }) => {
  const {
    title = 'Døgnets prisvariationer',
    subtitle = 'Sådan svinger elprisen gennem døgnet',
    headerAlignment = 'center',
    leadingText,
    showTimeZones = true,
    showAveragePrice = true,
    highlightPeakHours = true,
    apiRegion = 'DK2'
  } = block;

  const [data, setData] = useState<PriceData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [averagePrice, setAveragePrice] = useState(0);
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [selectedRegion, setSelectedRegion] = useState<'DK1' | 'DK2'>(apiRegion as 'DK1' | 'DK2');

  // Helper functions
  const formatDate = (date: Date) => date.toISOString().split('T')[0];
  
  const getTimeOfDay = (hour: number): 'night' | 'morning' | 'day' | 'evening' => {
    if (hour >= 0 && hour < 6) return 'night';
    if (hour >= 6 && hour < 9) return 'morning'; 
    if (hour >= 9 && hour < 17) return 'day';
    return 'evening';
  };

  const isPeakHour = (hour: number, price: number, averagePrice: number): boolean => {
    // Peak hours are typically morning (7-9) and evening (17-20) when price is above average
    const isPeakTimeframe = (hour >= 7 && hour <= 9) || (hour >= 17 && hour <= 20);
    return isPeakTimeframe && price > averagePrice;
  };

  const transformApiData = (apiData: ApiPriceData[]): PriceData[] => {
    if (!apiData || apiData.length === 0) return [];
    
    // Calculate average first for peak detection
    const avgPrice = apiData.reduce((sum, item) => sum + item.TotalPriceKWh, 0) / apiData.length;
    
    return apiData.map(item => {
      const date = new Date(item.HourDK);
      const hour = date.getHours();
      const timeOfDay = getTimeOfDay(hour);
      const isPeak = isPeakHour(hour, item.TotalPriceKWh, avgPrice);
      
      return {
        hour: `${hour.toString().padStart(2, '0')}:00`,
        price: item.TotalPriceKWh,
        timeOfDay,
        isPeak
      };
    });
  };

  // Fetch real electricity prices
  useEffect(() => {
    const fetchPriceData = async () => {
      setLoading(true);
      setError(null);
      
      const dateString = formatDate(selectedDate);
      
      try {
        const response = await fetch(`/api/electricity-prices?region=${selectedRegion}&date=${dateString}`);
        
        if (!response.ok) {
          throw new Error('Kunne ikke hente prisdata');
        }
        
        const result = await response.json();
        
        if (!result.records || result.records.length === 0) {
          setError('Prisdata for den valgte dato er ikke tilgængelig endnu');
          setData([]);
          setAveragePrice(0);
        } else {
          const transformedData = transformApiData(result.records);
          setData(transformedData);
          
          const avg = transformedData.reduce((sum, item) => sum + item.price, 0) / transformedData.length;
          setAveragePrice(avg);
        }
      } catch (err: any) {
        console.error('Error fetching price data:', err);
        setError(err.message || 'Der opstod en fejl ved indlæsning af prisdata');
        setData([]);
        setAveragePrice(0);
      } finally {
        setLoading(false);
      }
    };

    fetchPriceData();
  }, [selectedRegion, selectedDate]);

  const timeZones = [
    { id: 'night', label: 'Nat', icon: Moon, color: 'bg-blue-900', hours: '23:00 - 05:00' },
    { id: 'morning', label: 'Morgen', icon: Sunrise, color: 'bg-orange-500', hours: '05:00 - 09:00' },
    { id: 'day', label: 'Dag', icon: Sun, color: 'bg-yellow-500', hours: '09:00 - 17:00' },
    { id: 'evening', label: 'Aften', icon: Sunset, color: 'bg-purple-600', hours: '17:00 - 23:00' }
  ];

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <div className="bg-white p-4 rounded-lg shadow-lg border">
          <p className="font-semibold text-gray-900">{label}</p>
          <p className="text-lg font-mono">{data.price.toFixed(2)} kr/kWh</p>
          {data.isPeak && (
            <Badge className="mt-2 bg-red-50 text-red-700 border-red-200">Spidsbelastning</Badge>
          )}
        </div>
      );
    }
    return null;
  };

  return (
    <section className="py-16 lg:py-24 bg-gray-50">
      <div className="container mx-auto px-4">
        {/* Header */}
        <div className={cn(
          "mb-12",
          headerAlignment === 'left' && "text-left",
          headerAlignment === 'center' && "text-center",
          headerAlignment === 'right' && "text-right"
        )}>
          {title && (
            <h2 className={cn(
              "text-3xl lg:text-4xl font-display font-bold text-gray-900 mb-4",
              headerAlignment === 'center' && "mx-auto"
            )}>
              {title}
            </h2>
          )}
          {subtitle && (
            <p className={cn(
              "text-lg text-gray-600 mb-8",
              headerAlignment === 'center' && "max-w-3xl mx-auto"
            )}>
              {subtitle}
            </p>
          )}
          {leadingText && leadingText.length > 0 && (
            <div className={cn(
              "text-base text-gray-700",
              headerAlignment === 'center' && "max-w-4xl mx-auto"
            )}>
              <div className="prose prose-lg max-w-none">
                <PortableText 
                  value={leadingText} 
                  components={{
                    block: {
                      normal: ({ children }) => <p className="mb-4 last:mb-0">{children}</p>
                    }
                  }}
                />
              </div>
            </div>
          )}
        </div>

        {/* Time Zones */}
        {showTimeZones && (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
            {timeZones.map((zone) => {
              const Icon = zone.icon;
              return (
                <Card key={zone.id} className="text-center">
                  <CardContent className="pt-6">
                    <div className={cn("w-12 h-12 rounded-full mx-auto mb-3 flex items-center justify-center", zone.color)}>
                      <Icon className="w-6 h-6 text-white" />
                    </div>
                    <h3 className="font-semibold text-gray-900">{zone.label}</h3>
                    <p className="text-sm text-gray-600">{zone.hours}</p>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        )}

        {/* Date and Region Controls */}
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between mb-6 gap-4">
          <div className="flex items-center gap-2">
            <Calendar className="w-5 h-5 text-gray-600" />
            <span className="text-sm text-gray-600">
              Viser priser for: {selectedDate.toLocaleDateString('da-DK', { 
                day: 'numeric', 
                month: 'long', 
                year: 'numeric' 
              })}
            </span>
          </div>
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2">
              <MapPin className="w-5 h-5 text-gray-600" />
              <span className="text-sm text-gray-600">Vælg region:</span>
            </div>
            <Select value={selectedRegion} onValueChange={(value) => setSelectedRegion(value as 'DK1' | 'DK2')}>
              <SelectTrigger className="w-[200px]">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="DK1">
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full bg-blue-500" />
                    <span>DK1 - Vestdanmark</span>
                  </div>
                </SelectItem>
                <SelectItem value="DK2">
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full bg-purple-500" />
                    <span>DK2 - Østdanmark</span>
                  </div>
                </SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Main Chart */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="text-xl font-bold text-gray-900">
              Prisudvikling gennem døgnet
              {error && (
                <Badge variant="destructive" className="ml-2">
                  Data ikke tilgængelig
                </Badge>
              )}
            </CardTitle>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="flex items-center justify-center h-[400px]">
                <div className="text-gray-500">Indlæser reelle prisdata fra energinet.dk...</div>
              </div>
            ) : error ? (
              <div className="flex flex-col items-center justify-center h-[400px] text-center">
                <AlertCircle className="w-12 h-12 text-red-500 mb-4" />
                <p className="text-red-600 font-semibold mb-2">{error}</p>
                <p className="text-gray-500 text-sm">
                  Prøv igen senere eller vælg en anden dato
                </p>
              </div>
            ) : data.length === 0 ? (
              <div className="flex items-center justify-center h-[400px]">
                <div className="text-gray-500">Ingen prisdata tilgængelig for denne dato</div>
              </div>
            ) : (
              <ResponsiveContainer width="100%" height={400}>
                <AreaChart data={data} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                  <defs>
                    <linearGradient id="colorPrice" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.8}/>
                      <stop offset="95%" stopColor="#3b82f6" stopOpacity={0.1}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e0e0e0" />
                  <XAxis 
                    dataKey="hour" 
                    tick={{ fontSize: 12, fill: '#6b7280' }}
                    interval={2}
                  />
                  <YAxis 
                    tick={{ fontSize: 12, fill: '#6b7280' }}
                    label={{ 
                      value: 'Pris (kr/kWh)', 
                      angle: -90, 
                      position: 'insideLeft',
                      style: { fill: '#6b7280' }
                    }}
                  />
                  <Tooltip content={<CustomTooltip />} />
                  
                  {showAveragePrice && (
                    <ReferenceLine 
                      y={averagePrice} 
                      stroke="#ef4444" 
                      strokeDasharray="5 5"
                      label={{ 
                        value: "Gennemsnit", 
                        position: "insideTopRight",
                        offset: 10,
                        style: { fontSize: 12, fill: '#ef4444' }
                      }}
                    />
                  )}
                  
                  {highlightPeakHours && data.map((item, index) => (
                    item.isPeak && (
                      <ReferenceLine 
                        key={index}
                        x={item.hour} 
                        stroke="#fbbf24" 
                        strokeWidth={2}
                        opacity={0.3}
                      />
                    )
                  ))}
                  
                  <Area 
                    type="monotone" 
                    dataKey="price" 
                    stroke="#3b82f6" 
                    fill="url(#colorPrice)"
                    strokeWidth={2}
                  />
                </AreaChart>
              </ResponsiveContainer>
            )}
          </CardContent>
        </Card>

        {/* Peak Hours Info */}
        {highlightPeakHours && (
          <div className="grid md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg font-bold text-gray-900 flex items-center gap-2">
                  <AlertCircle className="w-5 h-5 text-red-600" />
                  Spidsbelastningstimer
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-700 mb-4">
                  Elprisen er typisk højest i disse perioder:
                </p>
                <div className="space-y-2">
                  <div className="flex items-center justify-between p-3 bg-red-50 rounded-lg">
                    <span className="font-semibold">Morgen</span>
                    <span className="text-sm text-gray-600">07:00 - 09:00</span>
                  </div>
                  <div className="flex items-center justify-between p-3 bg-red-50 rounded-lg">
                    <span className="font-semibold">Aften</span>
                    <span className="text-sm text-gray-600">17:00 - 20:00</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-lg font-bold text-gray-900 flex items-center gap-2">
                  <Moon className="w-5 h-5 text-blue-600" />
                  Billige timer
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-700 mb-4">
                  Elprisen er typisk lavest om natten:
                </p>
                <div className="space-y-2">
                  <div className="flex items-center justify-between p-3 bg-blue-50 rounded-lg">
                    <span className="font-semibold">Nat</span>
                    <span className="text-sm text-gray-600">00:00 - 05:00</span>
                  </div>
                  <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg">
                    <span className="font-semibold">Middag</span>
                    <span className="text-sm text-gray-600">12:00 - 15:00</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        )}
      </div>
    </section>
  );
};

export default DailyPriceTimeline;