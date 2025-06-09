import React, { useState, useEffect, useMemo } from 'react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

// --- FINAL, VERIFIED TYPES ---
// These match the exact column names from the ProductionAndConsumptionSettlement API
interface ProductionRecord {
  Month: string;
  CentralPower_MWh: number;
  LocalPower_MWh: number;
  OffshoreWindGe100MW_MWh: number;
  OffshoreWindLt100MW_MWh: number;
  OnshoreWindGe50kW_MWh: number;
  OnshoreWindLt50kW_MWh: number;
  SolarPowerGe40kW_MWh: number;
  SolarPower10To40kW_MWh: number;
  SolarPower0To10kW_MWh: number;
}

interface ProcessedMonthData { 
  month: string; 
  Sol: number; 
  Landvind: number; 
  Havvind: number; 
  Lokal: number; 
  Central: number; 
}

interface MonthlyProductionChartProps { 
  block: { 
    _type: 'monthlyProductionChart'; 
    title: string; 
    leadingText?: string; 
    description?: string; 
  }; 
}

// --- CUSTOM TOOLTIP ---
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
                            <span className="font-mono">{Math.round(entry.value / 1000).toLocaleString('da-DK')} GWh</span>
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
      setLoading(true); 
      setError(null);
      try {
        const response = await fetch('/api/monthly-production');
        if (!response.ok) {
          const errorText = await response.text();
          throw new Error(`API Error: ${response.status} - ${errorText}`);
        }
        const result = await response.json();
        setData(result.records || []);
      } catch (err: any) { 
        setError(err.message); 
      } finally { 
        setLoading(false); 
      }
    };
    fetchData();
  }, []);

  // --- FINAL, VERIFIED DATA PROCESSING LOGIC ---
  const processedData = useMemo<ProcessedMonthData[]>(() => {
    if (!data || data.length === 0) return [];
    
    const groupedByMonth = data.reduce((acc, record) => {
        const monthKey = record.Month;
        if (!acc[monthKey]) {
            acc[monthKey] = { Sol: 0, Landvind: 0, Havvind: 0, Lokal: 0, Central: 0 };
        }
        
        // Aggregate all solar power categories
        acc[monthKey].Sol += (record.SolarPowerGe40kW_MWh || 0) + 
                             (record.SolarPower10To40kW_MWh || 0) + 
                             (record.SolarPower0To10kW_MWh || 0);
        
        // Aggregate all onshore wind categories
        acc[monthKey].Landvind += (record.OnshoreWindGe50kW_MWh || 0) + 
                                  (record.OnshoreWindLt50kW_MWh || 0);
        
        // Aggregate all offshore wind categories
        acc[monthKey].Havvind += (record.OffshoreWindGe100MW_MWh || 0) + 
                                 (record.OffshoreWindLt100MW_MWh || 0);
        
        // Central and Local power
        acc[monthKey].Central += record.CentralPower_MWh || 0;
        acc[monthKey].Lokal += record.LocalPower_MWh || 0;
        return acc;
    }, {} as Record<string, Omit<ProcessedMonthData, 'month'>>);
    
    return Object.entries(groupedByMonth)
      .map(([month, values]) => ({
          month: new Date(month).toLocaleString('da-DK', { month: 'short', year: '2-digit' }),
          ...values,
      }))
      .sort((a, b) => new Date(a.month).getTime() - new Date(b.month).getTime());
  }, [data]);
      
  const chartColors = { 
    sol: '#facc15', 
    landvind: '#4ade80', 
    havvind: '#2dd4bf', 
    lokal: '#60a5fa', 
    central: '#0f766e' 
  };

  return (
    <section className="bg-white py-16 lg:py-24">
      <div className="container mx-auto px-4">
        {block.title && <h2 className="text-3xl lg:text-4xl font-bold text-gray-900 text-center mb-4">{block.title}</h2>}
        {block.leadingText && <p className="text-lg text-gray-600 text-center mb-12 max-w-3xl mx-auto">{block.leadingText}</p>}
        
        <div className="w-full h-[500px] bg-white p-4 rounded-lg">
          {loading ? (
            <div className="flex items-center justify-center h-full">Indlæser data...</div>
          ) : error ? (
            <div className="flex items-center justify-center h-full text-red-600">
              <div className="text-center">
                <p className="font-semibold mb-2">Fejl ved indlæsning af data</p>
                <p className="text-sm">{error}</p>
              </div>
            </div>
          ) : (
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={processedData} margin={{ top: 10, right: 30, left: 30, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                <XAxis dataKey="month" tick={{ fontSize: 12, fill: '#6b7280' }} />
                <YAxis 
                  tickFormatter={(tick) => (tick / 1000).toLocaleString('da-DK') + ' GWh'} 
                  tick={{ fontSize: 12, fill: '#6b7280' }} 
                  label={{ 
                    value: 'Produktion', 
                    angle: -90, 
                    position: 'insideLeft', 
                    offset: -20, 
                    style: { fill: '#6b7280' } 
                  }} 
                />
                <Tooltip content={<CustomTooltip />} />
                
                <Area type="monotone" dataKey="Sol" name="Sol" stackId="1" stroke={chartColors.sol} fill={chartColors.sol} />
                <Area type="monotone" dataKey="Landvind" name="Landvind" stackId="1" stroke={chartColors.landvind} fill={chartColors.landvind} />
                <Area type="monotone" dataKey="Havvind" name="Havvind" stackId="1" stroke={chartColors.havvind} fill={chartColors.havvind} />
                <Area type="monotone" dataKey="Lokal" name="Lokal kraft" stackId="1" stroke={chartColors.lokal} fill={chartColors.lokal} />
                <Area type="monotone" dataKey="Central" name="Central kraft" stackId="1" stroke={chartColors.central} fill={chartColors.central} />
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