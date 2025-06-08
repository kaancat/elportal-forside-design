
import React, { useState, useEffect } from 'react';
import { Settings } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Switch } from '@/components/ui/switch';

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

interface FeeToggles {
  elafgift: boolean;
  netselskab: boolean;
  forsyningstilsynet: boolean;
  moms: boolean;
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
  const [feeToggles, setFeeToggles] = useState<FeeToggles>({
    elafgift: true,
    netselskab: true,
    forsyningstilsynet: true,
    moms: true,
  });

  useEffect(() => {
    console.log('--- EXECUTING LATEST VERSION OF fetchPriceData ---');
    
    const fetchData = async () => {
      setLoading(true);
      setError(null);
      try {
        const yesterday = new Date();
        yesterday.setDate(yesterday.getDate() - 1);
        
        const year = yesterday.getFullYear();
        const month = String(yesterday.getMonth() + 1).padStart(2, '0');
        const day = String(yesterday.getDate()).padStart(2, '0');
        const dateStringForAPI = `${year}-${month}-${day}`;

        const baseUrl = 'https://api.energidataservice.dk/dataset/Elspotpriser';
        const filter = encodeURIComponent(`{"PriceArea":["${block.apiRegion}"]}`);
        const apiUrl = `${baseUrl}?start=${dateStringForAPI}T00:00&end=${dateStringForAPI}T23:59&filter=${filter}`;

        console.log('Final API URL to be fetched:', apiUrl);
        
        const response = await fetch(apiUrl);
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        const result = await response.json();
        
        // Transform the data to match our interface
        const transformedData = result.records.map((record: any) => ({
          HourDK: record.HourDK,
          SpotPriceKWh: record.SpotPriceDKK / 1000, // Convert from DKK/MWh to DKK/kWh
          TotalPriceKWh: record.SpotPriceDKK / 1000 + 2.5, // Add estimated fees
        }));
        
        setData(transformedData);
      } catch (err: any) {
        console.error('Error fetching data:', err);
        setError(err.message || 'En ukendt fejl opstod.');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [block.apiRegion]);

  const handleToggleChange = (feeType: keyof FeeToggles) => {
    setFeeToggles(prev => ({
      ...prev,
      [feeType]: !prev[feeType]
    }));
  };

  // Calculate dynamic fees based on toggle states
  const calculateDynamicFees = (baseFees: number) => {
    let dynamicFees = 0;
    
    // Approximate fee breakdown (these would typically come from your data)
    const feeBreakdown = {
      elafgift: 0.8,
      netselskab: 0.9,
      forsyningstilsynet: 0.1,
      moms: 0.7
    };

    Object.entries(feeToggles).forEach(([feeType, isEnabled]) => {
      if (isEnabled) {
        dynamicFees += feeBreakdown[feeType as keyof typeof feeBreakdown];
      }
    });

    return dynamicFees;
  };

  if (loading) return <LoadingSpinner />;
  if (error) return <ErrorMessage message={error} />;
  
  // Prepare data for the chart with dynamic fee calculation
  const chartData = data.map(d => {
    const baseFees = d.TotalPriceKWh - d.SpotPriceKWh;
    const dynamicFees = calculateDynamicFees(baseFees);
    
    return {
      hour: new Date(d.HourDK).getHours().toString().padStart(2, '0'),
      spotPrice: d.SpotPriceKWh,
      fees: dynamicFees,
      total: d.SpotPriceKWh + dynamicFees,
    };
  });

  // Find max total price for scaling
  const maxPrice = Math.max(...chartData.map(d => d.total));
  const chartHeight = 300;

  return (
    <section className="container mx-auto px-4 py-8">
      <div className="max-w-4xl mx-auto">
        <h2 className="text-2xl font-bold text-gray-900 mb-2">{block.title}</h2>
        {block.subtitle && <p className="text-gray-600 mb-6">{block.subtitle}</p>}
        
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          {/* Legend and Afgifter Button */}
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-6 text-sm">
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 bg-green-500 rounded"></div>
                <span>Spotpris</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 bg-gray-400 rounded"></div>
                <span>Afgifter & Moms</span>
              </div>
            </div>
            
            <Popover>
              <PopoverTrigger asChild>
                <Button variant="outline" size="sm" className="flex items-center gap-2">
                  <Settings size={16} />
                  Afgifter
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-64" align="end">
                <div className="space-y-4">
                  <h4 className="font-medium text-sm">Vælg afgifter</h4>
                  
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <label htmlFor="elafgift" className="text-sm">Elafgift</label>
                      <Switch
                        id="elafgift"
                        checked={feeToggles.elafgift}
                        onCheckedChange={() => handleToggleChange('elafgift')}
                      />
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <label htmlFor="netselskab" className="text-sm">Netselskab</label>
                      <Switch
                        id="netselskab"
                        checked={feeToggles.netselskab}
                        onCheckedChange={() => handleToggleChange('netselskab')}
                      />
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <label htmlFor="forsyningstilsynet" className="text-sm">Forsyningstilsynet</label>
                      <Switch
                        id="forsyningstilsynet"
                        checked={feeToggles.forsyningstilsynet}
                        onCheckedChange={() => handleToggleChange('forsyningstilsynet')}
                      />
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <label htmlFor="moms" className="text-sm">Moms</label>
                      <Switch
                        id="moms"
                        checked={feeToggles.moms}
                        onCheckedChange={() => handleToggleChange('moms')}
                      />
                    </div>
                  </div>
                </div>
              </PopoverContent>
            </Popover>
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
