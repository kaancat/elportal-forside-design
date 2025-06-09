import React, { useState, useEffect, useMemo } from 'react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

// --- TYPES VERIFIED FROM YOUR REPORT ---
interface ProductionRecord {
  Month: string;
  CentralPowerMWhDK1: number; CentralPowerMWhDK2: number;
  LocalPowerMWhDK1: number; LocalPowerMWhDK2: number;
  OffshoreWindGe100MW_MWhDK1: number; OffshoreWindGe100MW_MWhDK2: number;
  OffshoreWindLt100MW_MWhDK1: number; OffshoreWindLt100MW_MWhDK2: number;
  OnshoreWindGe50kW_MWhDK1: number; OnshoreWindGe50kW_MWhDK2: number;
  OnshoreWindLt50kW_MWhDK1: number; OnshoreWindLt50kW_MWhDK2: number;
  SolarPowerGe10Lt40kW_MWhDK1: number; SolarPowerGe10Lt40kW_MWhDK2: number;
  SolarPowerGe40kW_MWhDK1: number; SolarPowerGe40kW_MWhDK2: number;
  SolarPowerLt10kW_MWhDK1: number; SolarPowerLt10kW_MWhDK2: number;
  SolarPowerSelfConMWhDK1: number; SolarPowerSelfConMWhDK2: number;
}
interface ProcessedMonthData { month: string; Sol: number; Landvind: number; Havvind: number; Decentrale: number; Centrale: number; }
interface MonthlyProductionChartProps { block: { _type: 'monthlyProductionChart'; title: string; leadingText?: string; description?: string; }; }

const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
        return (
            <div className="bg-gray-800 text-white p-4 rounded-lg shadow-lg border border-gray-700 min-w-[220px]">
                <p className="font-bold text-base mb-2">{label}</p>
                <div className="text-sm space-y-1">
                    {payload.slice().reverse().map((entry: any) => (
                        <div key={entry.dataKey} className="flex justify-between items-center gap-4">
                            <div className="flex items-center">
                                <span className="inline-block w-2.5 h-2.5 rounded-full mr-2" style={{ backgroundColor: entry.color }}></span>
                                {entry.name}:
                            </div>
                            <span className="font-mono">{(entry.value / 1000000).toFixed(1)} TWh</span>
                        </div>
                    ))}
                </div>
            </div>
        );
    }
    return null;
};

const MonthlyProductionChart: React.FC<MonthlyProductionChartProps> = ({ block }) => {
  const [data, setData] = useState<ProductionRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true); setError(null);
      try {
        const response = await fetch('/api/monthly-production');
        if (!response.ok) throw new Error('Kunne ikke hente månedsdata fra serveren.');
        const result = await response.json();
        setData(result.records || []);
      } catch (err: any) { setError(err.message); } finally { setLoading(false); }
    };
    fetchData();
  }, []);

  const processedData = useMemo<ProcessedMonthData[]>(() => {
    if (!data || data.length === 0) return [];
    
    return data.map(record => ({
      month: new Date(record.Month).toLocaleString('da-DK', { month: 'short', year: 'numeric' }),
      Sol: (record.SolarPowerGe40kW_MWhDK1 || 0) + (record.SolarPowerGe40kW_MWhDK2 || 0) + 
           (record.SolarPowerGe10Lt40kW_MWhDK1 || 0) + (record.SolarPowerGe10Lt40kW_MWhDK2 || 0) + 
           (record.SolarPowerLt10kW_MWhDK1 || 0) + (record.SolarPowerLt10kW_MWhDK2 || 0) +
           (record.SolarPowerSelfConMWhDK1 || 0) + (record.SolarPowerSelfConMWhDK2 || 0),
      Landvind: (record.OnshoreWindGe50kW_MWhDK1 || 0) + (record.OnshoreWindGe50kW_MWhDK2 || 0) + 
                (record.OnshoreWindLt50kW_MWhDK1 || 0) + (record.OnshoreWindLt50kW_MWhDK2 || 0),
      Havvind: (record.OffshoreWindGe100MW_MWhDK1 || 0) + (record.OffshoreWindGe100MW_MWhDK2 || 0) + 
               (record.OffshoreWindLt100MW_MWhDK1 || 0) + (record.OffshoreWindLt100MW_MWhDK2 || 0),
      Decentrale: (record.LocalPowerMWhDK1 || 0) + (record.LocalPowerMWhDK2 || 0),
      Centrale: (record.CentralPowerMWhDK1 || 0) + (record.CentralPowerMWhDK2 || 0),
    }));
  }, [data]);
      
  const chartColors = { sol: '#facc15', landvind: '#4ade80', havvind: '#2dd4bf', decentrale: '#60a5fa', centrale: '#0f766e' };

  return (
    <section className="bg-white py-16 lg:py-24">
      <div className="container mx-auto px-4">
        {block.title && <h2 className="text-3xl lg:text-4xl font-bold text-gray-900 text-center mb-4">{block.title}</h2>}
        {block.leadingText && <p className="text-lg text-gray-600 text-center mb-12 max-w-3xl mx-auto">{block.leadingText}</p>}
        
        <div className="w-full h-[500px] bg-white p-4 rounded-lg">
          {loading ? <div className="flex items-center justify-center h-full">Indlæser data...</div> : 
           error ? <div className="flex items-center justify-center h-full text-red-600">{error}</div> :
           (
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={processedData} margin={{ top: 10, right: 30, left: 30, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                <XAxis dataKey="month" tick={{ fontSize: 12 }} />
                <YAxis tickFormatter={(tick) => `${(tick / 1000000).toFixed(1)} TWh`} tick={{ fontSize: 12 }} />
                <Tooltip content={<CustomTooltip />} />
                <Area dataKey="Sol" name="Sol" stackId="1" stroke={chartColors.sol} fill={chartColors.sol} color={chartColors.sol} />
                <Area dataKey="Landvind" name="Landvind" stackId="1" stroke={chartColors.landvind} fill={chartColors.landvind} color={chartColors.landvind} />
                <Area dataKey="Havvind" name="Havvind" stackId="1" stroke={chartColors.havvind} fill={chartColors.havvind} color={chartColors.havvind} />
                <Area dataKey="Decentrale" name="Decentrale værker" stackId="1" stroke={chartColors.decentrale} fill={chartColors.decentrale} color={chartColors.decentrale} />
                <Area dataKey="Centrale" name="Centrale værker" stackId="1" stroke={chartColors.centrale} fill={chartColors.centrale} color={chartColors.centrale} />
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