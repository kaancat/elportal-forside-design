import React, { useState } from 'react';
import { useMapConsumptionData, useConsumptionCategories } from '../hooks/useConsumptionData';
import { 
  formatConsumption, 
  translateHousingCategory, 
  translateHeatingCategory,
  getTopConsumingMunicipalities,
  getConsumptionColor
} from '../lib/consumptionUtils';
import { AggregatedConsumption } from '../types/sanity';

/**
 * Example component demonstrating the Private Industry Consumption API usage
 * This component shows how to integrate the API for map visualization
 */
export function ConsumptionMapExample() {
  const [selectedHousing, setSelectedHousing] = useState<string>('');
  const [selectedHeating, setSelectedHeating] = useState<string>('');
  const [dateRange, setDateRange] = useState({
    start: '2024-01-01',
    end: '2024-01-31'
  });

  // Fetch consumption data with current filters
  const { data, isLoading, error } = useMapConsumptionData({
    start: dateRange.start,
    end: dateRange.end,
    housing: selectedHousing || undefined,
    heating: selectedHeating || undefined,
  });

  // Fetch available categories for dropdowns
  const { housingCategories, heatingCategories } = useConsumptionCategories();

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-lg">Loading consumption data...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-4">
        <h3 className="text-red-800 font-medium">Error loading data</h3>
        <p className="text-red-600">{error.message}</p>
      </div>
    );
  }

  const consumptionData = data?.data as AggregatedConsumption[] || [];
  const topMunicipalities = getTopConsumingMunicipalities(consumptionData, 10);
  
  // Calculate min/max for color scaling
  const consumptionValues = consumptionData.map(d => d.totalConsumption);
  const minConsumption = Math.min(...consumptionValues);
  const maxConsumption = Math.max(...consumptionValues);

  const totalConsumption = consumptionData.reduce((sum, d) => sum + d.totalConsumption, 0);
  const averageConsumption = totalConsumption / consumptionData.length;

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-lg shadow-sm border p-6">
        <h2 className="text-2xl font-bold mb-6">Municipality Consumption Analysis</h2>
        
        {/* Filters */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <div>
            <label className="block text-sm font-medium mb-2">Start Date</label>
            <input
              type="date"
              value={dateRange.start}
              onChange={(e) => setDateRange(prev => ({ ...prev, start: e.target.value }))}
              className="w-full px-3 py-2 border border-gray-300 rounded-md"
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-2">End Date</label>
            <input
              type="date"
              value={dateRange.end}
              onChange={(e) => setDateRange(prev => ({ ...prev, end: e.target.value }))}
              className="w-full px-3 py-2 border border-gray-300 rounded-md"
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-2">Housing Type</label>
            <select
              value={selectedHousing}
              onChange={(e) => setSelectedHousing(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md"
            >
              <option value="">All Housing Types</option>
              {housingCategories.map(category => (
                <option key={category} value={category}>
                  {translateHousingCategory(category)}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium mb-2">Heating Type</label>
            <select
              value={selectedHeating}
              onChange={(e) => setSelectedHeating(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md"
            >
              <option value="">All Heating Types</option>
              {heatingCategories.map(category => (
                <option key={category} value={category}>
                  {translateHeatingCategory(category)}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Summary Statistics */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <div className="bg-blue-50 rounded-lg p-4">
            <h3 className="text-sm font-medium text-blue-800">Total Consumption</h3>
            <p className="text-2xl font-bold text-blue-900">
              {formatConsumption(totalConsumption)}
            </p>
          </div>
          <div className="bg-green-50 rounded-lg p-4">
            <h3 className="text-sm font-medium text-green-800">Average per Municipality</h3>
            <p className="text-2xl font-bold text-green-900">
              {formatConsumption(averageConsumption)}
            </p>
          </div>
          <div className="bg-purple-50 rounded-lg p-4">
            <h3 className="text-sm font-medium text-purple-800">Municipalities</h3>
            <p className="text-2xl font-bold text-purple-900">
              {consumptionData.length}
            </p>
          </div>
        </div>

        {/* Top Municipalities */}
        <div className="mb-6">
          <h3 className="text-lg font-semibold mb-4">Top 10 Consuming Municipalities</h3>
          <div className="space-y-2">
            {topMunicipalities.map((municipality, index) => (
              <div 
                key={municipality.municipalityNo} 
                className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
              >
                <div className="flex items-center space-x-3">
                  <div className="w-8 h-8 bg-blue-500 text-white rounded-full flex items-center justify-center text-sm font-medium">
                    {index + 1}
                  </div>
                  <div>
                    <div className="font-medium">{municipality.municipalityName}</div>
                    <div className="text-sm text-gray-500">
                      {municipality.recordCount} records
                    </div>
                  </div>
                </div>
                <div className="text-right">
                  <div className="font-semibold">
                    {formatConsumption(municipality.totalConsumption)}
                  </div>
                  <div className="text-sm text-gray-500">
                    Avg: {formatConsumption(municipality.averageConsumption)}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Municipality Grid (Simulated Map) */}
        <div>
          <h3 className="text-lg font-semibold mb-4">Municipality Consumption Map</h3>
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-2">
            {consumptionData.map((municipality) => {
              const color = getConsumptionColor(
                municipality.totalConsumption,
                minConsumption,
                maxConsumption,
                'blue'
              );
              
              return (
                <div
                  key={municipality.municipalityNo}
                  className="p-3 rounded-lg text-center cursor-pointer hover:shadow-md transition-shadow"
                  style={{ backgroundColor: color }}
                  title={`${municipality.municipalityName}: ${formatConsumption(municipality.totalConsumption)}`}
                >
                  <div className="text-xs font-medium text-gray-800">
                    {municipality.municipalityName}
                  </div>
                  <div className="text-xs text-gray-600">
                    {formatConsumption(municipality.totalConsumption)}
                  </div>
                </div>
              );
            })}
          </div>
          
          {/* Legend */}
          <div className="mt-4 flex items-center space-x-4">
            <span className="text-sm text-gray-600">Consumption:</span>
            <div className="flex items-center space-x-2">
              <div className="w-4 h-4 bg-blue-100 rounded"></div>
              <span className="text-xs">Low</span>
            </div>
            <div className="flex items-center space-x-2">
              <div className="w-4 h-4 bg-blue-500 rounded"></div>
              <span className="text-xs">Medium</span>
            </div>
            <div className="flex items-center space-x-2">
              <div className="w-4 h-4 bg-blue-900 rounded"></div>
              <span className="text-xs">High</span>
            </div>
          </div>
        </div>

        {/* API Info */}
        <div className="mt-6 p-4 bg-gray-50 rounded-lg">
          <h4 className="font-medium mb-2">API Response Info</h4>
          <div className="text-sm text-gray-600 space-y-1">
            <p>Total records: {data?.totalRecords}</p>
            <p>Aggregation: {data?.aggregationType}</p>
            <p>Period: {data?.period.start} to {data?.period.end}</p>
            <p>Available housing categories: {data?.availableCategories.housing.length}</p>
            <p>Available heating categories: {data?.availableCategories.heating.length}</p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default ConsumptionMapExample;