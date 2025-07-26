import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ReferenceLine, Area, AreaChart } from 'recharts';
import { Sun, Moon, Sunrise, Sunset, AlertCircle } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { PortableText } from '@portabletext/react';
import { cn } from '@/lib/utils';

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

const DailyPriceTimeline: React.FC<DailyPriceTimelineProps> = ({ block }) => {
  const {
    title = 'Døgnets prisvariationer',
    subtitle = 'Sådan svinger elprisen gennem døgnet',
    headerAlignment = 'center',
    leadingText,
    showTimeZones = true,
    showAveragePrice = true,
    highlightPeakHours = true
  } = block;

  const [data, setData] = useState<PriceData[]>([]);
  const [loading, setLoading] = useState(true);
  const [averagePrice, setAveragePrice] = useState(0);

  // Mock data for demonstration - in production, this would fetch real data
  useEffect(() => {
    const mockData: PriceData[] = [
      { hour: '00:00', price: 0.8, timeOfDay: 'night', isPeak: false },
      { hour: '01:00', price: 0.75, timeOfDay: 'night', isPeak: false },
      { hour: '02:00', price: 0.7, timeOfDay: 'night', isPeak: false },
      { hour: '03:00', price: 0.65, timeOfDay: 'night', isPeak: false },
      { hour: '04:00', price: 0.7, timeOfDay: 'night', isPeak: false },
      { hour: '05:00', price: 0.9, timeOfDay: 'morning', isPeak: false },
      { hour: '06:00', price: 1.2, timeOfDay: 'morning', isPeak: false },
      { hour: '07:00', price: 1.8, timeOfDay: 'morning', isPeak: true },
      { hour: '08:00', price: 2.1, timeOfDay: 'morning', isPeak: true },
      { hour: '09:00', price: 1.9, timeOfDay: 'day', isPeak: true },
      { hour: '10:00', price: 1.6, timeOfDay: 'day', isPeak: false },
      { hour: '11:00', price: 1.4, timeOfDay: 'day', isPeak: false },
      { hour: '12:00', price: 1.3, timeOfDay: 'day', isPeak: false },
      { hour: '13:00', price: 1.2, timeOfDay: 'day', isPeak: false },
      { hour: '14:00', price: 1.3, timeOfDay: 'day', isPeak: false },
      { hour: '15:00', price: 1.5, timeOfDay: 'day', isPeak: false },
      { hour: '16:00', price: 1.8, timeOfDay: 'evening', isPeak: true },
      { hour: '17:00', price: 2.3, timeOfDay: 'evening', isPeak: true },
      { hour: '18:00', price: 2.5, timeOfDay: 'evening', isPeak: true },
      { hour: '19:00', price: 2.2, timeOfDay: 'evening', isPeak: true },
      { hour: '20:00', price: 1.8, timeOfDay: 'evening', isPeak: false },
      { hour: '21:00', price: 1.4, timeOfDay: 'evening', isPeak: false },
      { hour: '22:00', price: 1.1, timeOfDay: 'night', isPeak: false },
      { hour: '23:00', price: 0.9, timeOfDay: 'night', isPeak: false }
    ];

    setData(mockData);
    const avg = mockData.reduce((sum, item) => sum + item.price, 0) / mockData.length;
    setAveragePrice(avg);
    setLoading(false);
  }, []);

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

        {/* Main Chart */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="text-xl font-bold text-gray-900">Prisudvikling gennem døgnet</CardTitle>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="flex items-center justify-center h-[400px]">
                <div className="text-gray-500">Indlæser prisdata...</div>
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
                      label={{ value: "Gennemsnit", position: "right" }}
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