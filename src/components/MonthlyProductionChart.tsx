import React, { useState, useEffect, useMemo } from 'react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

// --- TYPES ---
interface ProductionRecord { Month: string; PriceArea: string; OffshoreWindLt100MW_MWh: number; OnshoreWind_MWh: number; SolarCell_MWh: number; CentralProd_MWh: number; LocalProd_MWh: number; }
interface ProcessedMonthData { month: string; Sol: number; Landvind: number; Havvind: number; Decentrale: number; Centrale: number; }
interface MonthlyProductionChartProps { block: { _type: 'monthlyProductionChart'; title: string; leadingText?: string; description?: string; }; }

// --- CUSTOM TOOLTIP ---
const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-gray-800 text-white p-4 rounded-lg shadow-lg border border-gray-700">
        <p className="font-bold text-base mb-2">{label}</p>
        <div className="text-sm space-y-1">
          {payload.slice().reverse().map((entry: any) => (
            <div key={entry.dataKey} className="flex justify-between items-center gap-4">
              <div className="flex items-center"><span className="inline-block w-2.5 h-2.5 rounded-full mr-2" style={{ backgroundColor: entry.color }}></span>{entry.name}:</div>
              <span className="font-mono">{Math.round(entry.value).toLocaleString('da-DK')} MWh</span>
            </div>
          ))}
        </div>
      </div>
    );
  }
  return null;
};

// --- MAIN COMPONENT ---
const MonthlyProductionChart: React.FC<MonthlyProductionChartProps> = ({ block }) => {
  const [data, setData] = useState<ProductionRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true); setError(null);
      try {
        const response = await fetch('/api/monthly-production');
        if (!response.ok) throw new Error('Kunne ikke hente månedsdata.');
        const result = await response.json();
        setData(result.records || []);
      } catch (err: any) { setError(err.message); } finally { setLoading(false); }
    };
    fetchData();
  }, []);

  const processedData = useMemo<ProcessedMonthData[]>(() => {
    if (!data || data.length === 0) return [];
    const groupedByMonth = data.reduce((acc, record) => {
      const monthKey = new Date(record.Month).toLocaleString('da-DK', { month: 'short', year: 'numeric' });
      if (!acc[monthKey]) acc[monthKey] = { Sol: 0, Landvind: 0, Havvind: 0, Decentrale: 0, Centrale: 0 };
      
      acc[monthKey].Sol += record.SolarCell_MWh || 0;
      acc[monthKey].Landvind += record.OnshoreWind_MWh || 0;
      acc[monthKey].Havvind += record.OffshoreWindLt100MW_MWh || 0;
      acc[monthKey].Decentrale += record.LocalProd_MWh || 0;
      acc[monthKey].Centrale += record.CentralProd_MWh || 0;
      return acc;
    }, {} as Record<string, Omit<ProcessedMonthData, 'month'>>);
    
    return Object.entries(groupedByMonth).map(([month, values]) => ({ month, ...values }));
  }, [data]);
  
  const chartColors = { sol: '#facc15', landvind: '#4ade80', havvind: '#2dd4bf', decentrale: '#60a5fa', centrale: '#0f766e' };

  return (
    <section className="bg-white py-16 lg:py-24">
      <div className="container mx-auto px-4">
        {block.title && <h2 className="text-3xl lg:text-4xl font-bold text-gray-900 text-center mb-4">{block.title}</h2>}
        {block.leadingText && <p className="text-lg text-gray-600 text-center mb-12 max-w-3xl mx-auto">{block.leadingText}</p>}
        
        <div className="w-full h-[500px] bg-white p-4 rounded-lg">
          {loading ? <div className="flex items-center justify-center h-full">Indlæser data...</div> :
           (
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={processedData} margin={{ top: 10, right: 30, left: 30, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                <XAxis dataKey="month" tick={{ fontSize: 12, fill: '#6b7280' }} />
                <YAxis tickFormatter={(tick) => tick.toLocaleString('da-DK')} tick={{ fontSize: 12, fill: '#6b7280' }} label={{ value: 'MWh', angle: -90, position: 'insideLeft', offset: -20, style: { fill: '#6b7280' } }} />
                <Tooltip content={<CustomTooltip />} />
                
                <Area type="monotone" dataKey="Sol" name="Sol" stackId="1" stroke={chartColors.sol} fill={chartColors.sol} color={chartColors.sol} />
                <Area type="monotone" dataKey="Landvind" name="Landvind" stackId="1" stroke={chartColors.landvind} fill={chartColors.landvind} color={chartColors.landvind} />
                <Area type="monotone" dataKey="Havvind" name="Havvind" stackId="1" stroke={chartColors.havvind} fill={chartColors.havvind} color={chartColors.havvind} />
                <Area type="monotone" dataKey="Decentrale" name="Decentrale værker" stackId="1" stroke={chartColors.decentrale} fill={chartColors.decentrale} color={chartColors.decentrale} />
                <Area type="monotone" dataKey="Centrale" name="Centrale værker" stackId="1" stroke={chartColors.centrale} fill={chartColors.centrale} color={chartColors.centrale} />
              </AreaChart>
            </ResponsiveContainer>
          )}
        </div>
        
        {block.description && <p className="text-center text-sm text-gray-500 mt-8">{block.description}</p>}
      </div>
    </section>
  );
};

export default MonthlyProductionChart; 