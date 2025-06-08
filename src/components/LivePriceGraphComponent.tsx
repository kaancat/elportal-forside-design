import React, { useState, useEffect } from 'react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, Legend, ResponsiveContainer, CartesianGrid } from 'recharts';

interface LivePriceGraphProps {
  block: {
    title: string;
    subtitle?: string;
    apiRegion: 'DK1' | 'DK2';
  };
}

interface PriceData {
  HourUTC: string;
  HourDK: string;
  PriceArea: string;
  SpotPriceDKK: number | null;
  SpotPriceEUR: number;
}

// A simple loading spinner component
const LoadingSpinner = () => (
  <div className="flex justify-center items-center h-64">
    <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-green-500"></div>
  </div>
);

// A simple error message component
const ErrorMessage = ({ message }: { message: string }) => (
  <div className="text-center p-8 bg-red-100 text-red-700 rounded-lg">
    <p className="font-bold">Der opstod en fejl</p>
    <p>{message}</p>
  </div>
);

const LivePriceGraphComponent: React.FC<LivePriceGraphProps> = ({ block }) => {
  const [data, setData] = useState<PriceData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      setError(null);
      try {
        const response = await fetch(`/api/electricity-prices?region=${block.apiRegion}`);
        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.error || 'Kunne ikke hente data fra serveren.');
        }
        const result = await response.json();
        // Ensure SpotPriceDKK is never null for the chart
        const formattedData = result.records.map((record: PriceData) => ({
          ...record,
          SpotPriceDKK: record.SpotPriceDKK ?? 0,
        }));
        setData(formattedData);
      } catch (err: any) {
        setError(err.message || 'En ukendt fejl opstod.');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [block.apiRegion]);

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="p-2 bg-white border border-gray-300 rounded-md shadow-md">
          <p className="font-bold">{`Kl. ${label}`}</p>
          <p className="text-green-600">{`Pris: ${payload[0].value.toFixed(2)} kr./kWh`}</p>
        </div>
      );
    }
    return null;
  };

  if (loading) return <LoadingSpinner />;
  if (error) return <ErrorMessage message={error} />;

  const chartData = data.map(d => ({
    name: new Date(d.HourDK).getHours().toString().padStart(2, '0'),
    Pris: d.SpotPriceDKK ? d.SpotPriceDKK / 1000 : 0, // Convert from MWh to kWh
  }));

  return (
    <div className="p-4 md:p-6 bg-white rounded-lg shadow-lg">
      <h3 className="text-2xl font-bold text-gray-800">{block.title}</h3>
      {block.subtitle && <p className="text-gray-600 mb-4">{block.subtitle}</p>}
      
      <div style={{ width: '100%', height: 400 }}>
        <ResponsiveContainer>
          <BarChart data={chartData} margin={{ top: 5, right: 20, left: -10, bottom: 5 }}>
            <CartesianGrid strokeDasharray="3 3" vertical={false} />
            <XAxis dataKey="name" tick={{ fontSize: 12 }} />
            <YAxis tick={{ fontSize: 12 }} unit=" kr" />
            <Tooltip content={<CustomTooltip />} cursor={{ fill: 'rgba(236, 253, 245, 0.5)' }} />
            <Legend wrapperStyle={{ fontSize: '14px', paddingTop: '20px' }} />
            <Bar dataKey="Pris" fill="#22c55e" name="Pris pr. kWh" />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

export default LivePriceGraphComponent;