import React, { useState, useEffect } from 'react';

interface LivePriceGraphProps {
  block: {
    title: string;
    subtitle?: string;
    apiRegion: 'DK1' | 'DK2';
  };
}

// Updated interface to reflect the data from our enhanced API
interface PriceData {
  HourDK: string;
  SpotPriceKWh: number;
  TotalPriceKWh: number;
}

const LoadingSpinner = () => (
  <div className="flex justify-center items-center h-64">
    <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-green-500"></div>
  </div>
);

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
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);

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
        setData(result.records);
      } catch (err: any) {
        setError(err.message || 'En ukendt fejl opstod.');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [block.apiRegion]);

  if (loading) return <LoadingSpinner />;
  if (error) return <ErrorMessage message={error} />;
  
  // Prepare data for the chart
  const chartData = data.map(d => ({
    hour: new Date(d.HourDK).getHours().toString().padStart(2, '0'),
    spotPrice: d.SpotPriceKWh,
    fees: d.TotalPriceKWh > d.SpotPriceKWh ? d.TotalPriceKWh - d.SpotPriceKWh : 0,
    total: d.TotalPriceKWh,
  }));

  // Find max total price for scaling
  const maxPrice = Math.max(...chartData.map(d => d.total));
  const chartHeight = 300;

  return (
    <section className="container mx-auto px-4 py-8">
      <div className="max-w-4xl mx-auto">
        <h2 className="text-2xl font-bold text-gray-900 mb-2">{block.title}</h2>
        {block.subtitle && <p className="text-gray-600 mb-6">{block.subtitle}</p>}
        
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          {/* Legend */}
          <div className="flex items-center gap-6 mb-6 text-sm">
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 bg-green-500 rounded"></div>
              <span>Spotpris</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 bg-gray-400 rounded"></div>
              <span>Afgifter & Moms</span>
            </div>
          </div>

          {/* Chart Container */}
          <div className="relative">
            {/* Y-axis labels */}
            <div className="absolute left-0 top-4 bottom-12 flex flex-col justify-between text-xs text-gray-500">
              <span>{maxPrice.toFixed(2)} kr</span>
              <span>{(maxPrice * 0.75).toFixed(2)} kr</span>
              <span>{(maxPrice * 0.5).toFixed(2)} kr</span>
              <span>{(maxPrice * 0.25).toFixed(2)} kr</span>
              <span>0.00 kr</span>
            </div>

            {/* Chart Area */}
            <div className="ml-16 mr-4">
              <div className="flex items-end justify-between gap-1" style={{ height: `${chartHeight}px` }}>
                {chartData.map((item, index) => {
                  const spotPriceHeight = (item.spotPrice / maxPrice) * chartHeight;
                  const feesHeight = (item.fees / maxPrice) * chartHeight;
                  
                  return (
                    <div
                      key={index}
                      className="relative flex-1 flex flex-col justify-end cursor-pointer transition-opacity hover:opacity-80"
                      onMouseEnter={() => setHoveredIndex(index)}
                      onMouseLeave={() => setHoveredIndex(null)}
                    >
                      {/* Tooltip */}
                      {hoveredIndex === index && (
                        <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 z-10">
                          <div className="bg-white border border-gray-300 rounded-lg shadow-lg p-3 text-sm whitespace-nowrap">
                            <p className="font-bold text-gray-800 mb-1">{`Kl. ${item.hour}:00`}</p>
                            <p className="text-green-600">{`Spotpris: ${item.spotPrice.toFixed(2)} kr.`}</p>
                            <p className="text-gray-600">{`Afgifter & Moms: ${item.fees.toFixed(2)} kr.`}</p>
                            <hr className="my-1 border-gray-200" />
                            <p className="font-bold text-gray-900">{`Total: ${item.total.toFixed(2)} kr./kWh`}</p>
                            {/* Tooltip arrow */}
                            <div className="absolute top-full left-1/2 transform -translate-x-1/2 border-4 border-transparent border-t-white"></div>
                          </div>
                        </div>
                      )}
                      
                      {/* Fees bar (top) */}
                      <div 
                        className="w-full bg-gray-400 rounded-t"
                        style={{ height: `${feesHeight}px` }}
                      ></div>
                      
                      {/* Spot price bar (bottom) */}
                      <div 
                        className="w-full bg-green-500"
                        style={{ height: `${spotPriceHeight}px` }}
                      ></div>
                      
                      {/* Hour label */}
                      <div className="text-xs text-gray-600 text-center mt-2">
                        {item.hour}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* X-axis label */}
            <div className="text-center text-sm text-gray-600 mt-4">Timer (24-timers format)</div>
          </div>

          <div className="mt-4 text-sm text-gray-500 text-center">
            Priser for {block.apiRegion === 'DK1' ? 'Vest-Danmark' : 'Øst-Danmark'}
          </div>
        </div>
      </div>
    </section>
  );
};

export default LivePriceGraphComponent;