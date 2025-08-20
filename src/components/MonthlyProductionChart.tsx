'use client'

import React, { useState, useEffect, useMemo } from 'react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { cn } from "@/lib/utils";

// --- TYPES VERIFIED FROM YOUR HTML FILE ---
interface ProductionRecord {
  HourUTC: string;
  CentralPowerMWh: number;
  LocalPowerMWh: number;
  OffshoreWindGe100MW_MWh: number;
  OffshoreWindLt100MW_MWh: number;
  OnshoreWindGe50kW_MWh: number;
  OnshoreWindLt50kW_MWh: number;
  SolarPowerGe40kW_MWh: number;
  SolarPowerGe10Lt40kW_MWh: number;
  SolarPowerLt10kW_MWh: number;
  SolarPowerSelfConMWh: number;
}
interface ProcessedMonthData { month: string; Sol: number; Landvind: number; Havvind: number; Decentrale: number; Centrale: number; }
interface MonthlyProductionChartProps { 
  block: { 
    _type: 'monthlyProductionChart'; 
    title: string; 
    leadingText?: string; 
    description?: string; 
    headerAlignment?: 'left' | 'center' | 'right';
  }; 
}

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
                            <span className="font-mono">{Math.round(entry.value).toLocaleString('da-DK')} MWh</span>
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
        const monthKey = record.HourUTC.substring(0, 7); // Group by YYYY-MM
        if (!acc[monthKey]) {
            acc[monthKey] = { Sol: 0, Landvind: 0, Havvind: 0, Decentrale: 0, Centrale: 0 };
        }
        
        acc[monthKey].Sol += (record.SolarPowerGe40kW_MWh || 0) + (record.SolarPowerGe10Lt40kW_MWh || 0) + (record.SolarPowerLt10kW_MWh || 0) + (record.SolarPowerSelfConMWh || 0);
        acc[monthKey].Landvind += (record.OnshoreWindGe50kW_MWh || 0) + (record.OnshoreWindLt50kW_MWh || 0);
        acc[monthKey].Havvind += (record.OffshoreWindGe100MW_MWh || 0) + (record.OffshoreWindLt100MW_MWh || 0);
        acc[monthKey].Decentrale += record.LocalPowerMWh || 0;
        acc[monthKey].Centrale += record.CentralPowerMWh || 0;
        
        return acc;
    }, {} as Record<string, Omit<ProcessedMonthData, 'month'>>);
    
    return Object.entries(groupedByMonth)
      .map(([month, values]) => ({
          month: new Date(month + '-02').toLocaleString('da-DK', { month: 'short', year: 'numeric' }),
          ...values,
      }))
      .sort((a, b) => new Date(a.month.split(".").reverse().join("-")).getTime() - new Date(b.month.split(".").reverse().join("-")).getTime());
  }, [data]);
      
  const chartColors = { sol: '#facc15', landvind: '#4ade80', havvind: '#2dd4bf', decentrale: '#60a5fa', centrale: '#0f766e' };

  return (
    <section className="bg-white py-16 lg:py-24">
      <div className="container mx-auto px-4">
        {/* Header section with alignment */}
        <div className={cn(
          "mb-12",
          block.headerAlignment === 'left' && "text-left",
          block.headerAlignment === 'center' && "text-center",
          block.headerAlignment === 'right' && "text-right",
          !block.headerAlignment && "text-center" // default to center
        )}>
          {block.title && (
            <h2 className={cn(
              "text-3xl lg:text-4xl font-display font-bold text-gray-900 mb-4",
              block.headerAlignment === 'center' && "mx-auto"
            )}>
              {block.title}
            </h2>
          )}
          {block.leadingText && (
            <p className={cn(
              "text-lg text-gray-600",
              block.headerAlignment === 'center' && "max-w-3xl mx-auto"
            )}>
              {block.leadingText}
            </p>
          )}
        </div>
        
        <div className="w-full h-[500px] bg-white p-4 rounded-lg">
          {loading ? <div className="flex items-center justify-center h-full">Indlæser data...</div> : 
           error ? <div className="flex items-center justify-center h-full text-red-600">{error}</div> :
           (
            <div className="relative h-full">
              {/* Y-axis label positioned absolute for mobile */}
              <div className="md:hidden absolute top-10 left-2 z-10 text-xs text-gray-600 bg-white/90 px-2 py-1 rounded">
                MWh
              </div>
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={processedData} margin={{ top: 10, right: 30, left: 30, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} />
                  <XAxis dataKey="month" tick={{ fontSize: 12 }} />
                  <YAxis tickFormatter={(tick) => tick.toLocaleString('da-DK')} tick={{ fontSize: 12 }} label={{ value: 'MWh', angle: -90, position: 'insideLeft', offset: -20, style: { fill: '#6b7280' }, className: 'hidden md:block' }} />
                <Tooltip content={<CustomTooltip />} />
                <Area dataKey="Sol" name="Sol" stackId="1" stroke={chartColors.sol} fill={chartColors.sol} color={chartColors.sol} />
                <Area dataKey="Landvind" name="Landvind" stackId="1" stroke={chartColors.landvind} fill={chartColors.landvind} color={chartColors.landvind} />
                <Area dataKey="Havvind" name="Havvind" stackId="1" stroke={chartColors.havvind} fill={chartColors.havvind} color={chartColors.havvind} />
                <Area dataKey="Decentrale" name="Decentrale værker" stackId="1" stroke={chartColors.decentrale} fill={chartColors.decentrale} color={chartColors.decentrale} />
                <Area dataKey="Centrale" name="Centrale værker" stackId="1" stroke={chartColors.centrale} fill={chartColors.centrale} color={chartColors.centrale} />
              </AreaChart>
            </ResponsiveContainer>
            </div>
          )}
        </div>

        {/* --- ADD THIS LEGEND --- */}
        <div className="flex justify-center items-center gap-x-6 gap-y-2 flex-wrap mt-8">
            <div className="flex items-center gap-2 text-sm"><div className="w-4 h-4 rounded" style={{backgroundColor: chartColors.sol}}></div><span>Sol</span></div>
            <div className="flex items-center gap-2 text-sm"><div className="w-4 h-4 rounded" style={{backgroundColor: chartColors.landvind}}></div><span>Landvind</span></div>
            <div className="flex items-center gap-2 text-sm"><div className="w-4 h-4 rounded" style={{backgroundColor: chartColors.havvind}}></div><span>Havvind</span></div>
            <div className="flex items-center gap-2 text-sm"><div className="w-4 h-4 rounded" style={{backgroundColor: chartColors.decentrale}}></div><span>Decentrale værker</span></div>
            <div className="flex items-center gap-2 text-sm"><div className="w-4 h-4 rounded" style={{backgroundColor: chartColors.centrale}}></div><span>Centrale værker</span></div>
        </div>
        
        {block.description && (
          <p className={cn(
            "text-sm text-gray-500 mt-8",
            block.headerAlignment === 'left' && "text-left",
            block.headerAlignment === 'center' && "text-center",
            block.headerAlignment === 'right' && "text-right",
            !block.headerAlignment && "text-center"
          )}>
            {block.description}
          </p>
        )}
      </div>
    </section>
  );
};

export default MonthlyProductionChart; 