import React, { useState, useCallback } from 'react';
import { useMapConsumptionData, useConsumptionCategories } from '../hooks/useConsumptionData';
import { 
  formatConsumption, 
  translateHousingCategory, 
  translateHeatingCategory,
  getTopConsumingMunicipalities,
  getConsumptionColor
} from '../lib/consumptionUtils';
import { AggregatedConsumption } from '../types/sanity';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Badge } from './ui/badge';
import { Skeleton } from './ui/skeleton';
import { Alert, AlertDescription } from './ui/alert';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { CalendarDays, MapPin, Zap, Filter, TrendingUp, Info } from 'lucide-react';

interface ConsumptionMapComponentProps {
  className?: string;
}

interface TimeRange {
  start: string;
  end: string;
}

interface ConsumptionFilters {
  housing: string;
  heating: string;
}

/**
 * Interactive Denmark consumption map component with comprehensive UI/UX
 * Features responsive design, advanced filtering, and intuitive data visualization
 */
export function ConsumptionMapComponent({ className }: ConsumptionMapComponentProps) {
  // State management
  const [timeRange, setTimeRange] = useState<TimeRange>({
    start: '2024-01-01',
    end: '2024-01-31'
  });
  
  const [filters, setFilters] = useState<ConsumptionFilters>({
    housing: '',
    heating: ''
  });
  
  const [selectedMunicipality, setSelectedMunicipality] = useState<AggregatedConsumption | null>(null);
  const [viewMode, setViewMode] = useState<'map' | 'list' | 'stats'>('map');

  // Data fetching
  const { data, isLoading, error } = useMapConsumptionData({
    start: timeRange.start,
    end: timeRange.end,
    housing: filters.housing || undefined,
    heating: filters.heating || undefined,
  });

  const { housingCategories, heatingCategories } = useConsumptionCategories();

  // Data processing
  const consumptionData = data?.data as AggregatedConsumption[] || [];
  const topMunicipalities = getTopConsumingMunicipalities(consumptionData, 10);
  
  const consumptionValues = consumptionData.map(d => d.totalConsumption);
  const minConsumption = Math.min(...consumptionValues);
  const maxConsumption = Math.max(...consumptionValues);
  const totalConsumption = consumptionData.reduce((sum, d) => sum + d.totalConsumption, 0);
  const averageConsumption = totalConsumption / consumptionData.length;

  // Event handlers
  const handleFilterChange = useCallback((key: keyof ConsumptionFilters, value: string) => {
    setFilters(prev => ({ ...prev, [key]: value }));
  }, []);

  const handleTimeRangeChange = useCallback((key: keyof TimeRange, value: string) => {
    setTimeRange(prev => ({ ...prev, [key]: value }));
  }, []);

  const resetFilters = useCallback(() => {
    setFilters({ housing: '', heating: '' });
  }, []);

  // Loading state
  if (isLoading) {
    return (
      <div className={`space-y-6 ${className}`}>
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <Skeleton className="h-8 w-64" />
              <div className="flex space-x-2">
                <Skeleton className="h-10 w-20" />
                <Skeleton className="h-10 w-20" />
                <Skeleton className="h-10 w-20" />
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
              {[...Array(4)].map((_, i) => (
                <Skeleton key={i} className="h-12 w-full" />
              ))}
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
              {[...Array(3)].map((_, i) => (
                <Skeleton key={i} className="h-20 w-full" />
              ))}
            </div>
            <Skeleton className="h-96 w-full" />
          </CardContent>
        </Card>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className={className}>
        <Alert variant="destructive">
          <Info className="h-4 w-4" />
          <AlertDescription>
            Error loading consumption data: {error.message}
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  return (
    <div className={`space-y-6 ${className}`}>
      <Card>
        <CardHeader>
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <CardTitle className="text-2xl font-bold text-gray-900">
                Electricity Consumption Map
              </CardTitle>
              <p className="text-sm text-gray-600 mt-1">
                Interactive visualization of electricity consumption across Danish municipalities
              </p>
            </div>
            
            {/* View Mode Toggle */}
            <div className="flex items-center space-x-2">
              <Button
                variant={viewMode === 'map' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setViewMode('map')}
              >
                <MapPin className="h-4 w-4" />
                <span className="hidden sm:inline ml-2">Map</span>
              </Button>
              <Button
                variant={viewMode === 'list' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setViewMode('list')}
              >
                <TrendingUp className="h-4 w-4" />
                <span className="hidden sm:inline ml-2">List</span>
              </Button>
              <Button
                variant={viewMode === 'stats' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setViewMode('stats')}
              >
                <Zap className="h-4 w-4" />
                <span className="hidden sm:inline ml-2">Stats</span>
              </Button>
            </div>
          </div>
        </CardHeader>
        
        <CardContent>
          {/* Filter Controls */}
          <div className="mb-8 p-4 bg-gray-50 rounded-lg">
            <div className="flex items-center gap-2 mb-4">
              <Filter className="h-5 w-5 text-gray-600" />
              <h3 className="text-lg font-semibold text-gray-900">Filters & Time Range</h3>
              <Button
                variant="ghost"
                size="sm"
                onClick={resetFilters}
                className="ml-auto"
              >
                Reset Filters
              </Button>
            </div>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {/* Time Range Controls */}
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700 flex items-center gap-2">
                  <CalendarDays className="h-4 w-4" />
                  Start Date
                </label>
                <input
                  type="date"
                  value={timeRange.start}
                  onChange={(e) => handleTimeRangeChange('start', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
              
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700 flex items-center gap-2">
                  <CalendarDays className="h-4 w-4" />
                  End Date
                </label>
                <input
                  type="date"
                  value={timeRange.end}
                  onChange={(e) => handleTimeRangeChange('end', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
              
              {/* Housing Type Filter */}
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700">Housing Type</label>
                <Select value={filters.housing} onValueChange={(value) => handleFilterChange('housing', value)}>
                  <SelectTrigger>
                    <SelectValue placeholder="All Housing Types" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="">All Housing Types</SelectItem>
                    {housingCategories.map(category => (
                      <SelectItem key={category} value={category}>
                        {translateHousingCategory(category)}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              
              {/* Heating Type Filter */}
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700">Heating Type</label>
                <Select value={filters.heating} onValueChange={(value) => handleFilterChange('heating', value)}>
                  <SelectTrigger>
                    <SelectValue placeholder="All Heating Types" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="">All Heating Types</SelectItem>
                    {heatingCategories.map(category => (
                      <SelectItem key={category} value={category}>
                        {translateHeatingCategory(category)}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>

          {/* Summary Statistics */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
            <Card className="bg-blue-50 border-blue-200">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-blue-800">Total Consumption</p>
                    <p className="text-2xl font-bold text-blue-900">
                      {formatConsumption(totalConsumption)}
                    </p>
                  </div>
                  <Zap className="h-8 w-8 text-blue-600" />
                </div>
              </CardContent>
            </Card>
            
            <Card className="bg-green-50 border-green-200">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-green-800">Average per Municipality</p>
                    <p className="text-2xl font-bold text-green-900">
                      {formatConsumption(averageConsumption)}
                    </p>
                  </div>
                  <TrendingUp className="h-8 w-8 text-green-600" />
                </div>
              </CardContent>
            </Card>
            
            <Card className="bg-purple-50 border-purple-200">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-purple-800">Municipalities</p>
                    <p className="text-2xl font-bold text-purple-900">
                      {consumptionData.length}
                    </p>
                  </div>
                  <MapPin className="h-8 w-8 text-purple-600" />
                </div>
              </CardContent>
            </Card>
            
            <Card className="bg-orange-50 border-orange-200">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-orange-800">Peak Municipality</p>
                    <p className="text-lg font-bold text-orange-900">
                      {topMunicipalities[0]?.municipalityName || 'N/A'}
                    </p>
                    <p className="text-sm text-orange-700">
                      {topMunicipalities[0] && formatConsumption(topMunicipalities[0].totalConsumption)}
                    </p>
                  </div>
                  <div className="h-8 w-8 bg-orange-600 rounded-full flex items-center justify-center">
                    <span className="text-white font-bold text-sm">1</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Main Content Area */}
          <Tabs value={viewMode} onValueChange={(value) => setViewMode(value as 'map' | 'list' | 'stats')}>
            <TabsList className="hidden" />
            
            {/* Map View */}
            <TabsContent value="map" className="space-y-6">
              <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
                {/* Municipality Grid (Interactive Map) */}
                <div className="lg:col-span-3 space-y-4">
                  <div className="flex items-center justify-between">
                    <h3 className="text-lg font-semibold text-gray-900">Municipality Consumption Map</h3>
                    <Badge variant="outline" className="text-sm">
                      {consumptionData.length} municipalities
                    </Badge>
                  </div>
                  
                  <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 lg:grid-cols-8 gap-2 p-4 bg-gray-50 rounded-lg">
                    {consumptionData.map((municipality) => {
                      const color = getConsumptionColor(
                        municipality.totalConsumption,
                        minConsumption,
                        maxConsumption,
                        'blue'
                      );
                      
                      const isSelected = selectedMunicipality?.municipalityNo === municipality.municipalityNo;
                      
                      return (
                        <div
                          key={municipality.municipalityNo}
                          className={`p-2 rounded-lg text-center cursor-pointer transition-all duration-200 hover:shadow-md hover:scale-105 ${
                            isSelected ? 'ring-2 ring-blue-500 ring-offset-2' : ''
                          }`}
                          style={{ backgroundColor: color }}
                          onClick={() => setSelectedMunicipality(municipality)}
                        >
                          <div className="text-xs font-medium text-gray-800 truncate" title={municipality.municipalityName}>
                            {municipality.municipalityName}
                          </div>
                          <div className="text-xs text-gray-600">
                            {formatConsumption(municipality.totalConsumption)}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                  
                  {/* Map Legend */}
                  <div className="flex flex-wrap items-center gap-4 p-4 bg-white border rounded-lg">
                    <span className="text-sm font-medium text-gray-700">Consumption Level:</span>
                    <div className="flex items-center gap-2">
                      <div className="w-4 h-4 bg-blue-100 rounded border"></div>
                      <span className="text-xs text-gray-600">Low</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="w-4 h-4 bg-blue-300 rounded border"></div>
                      <span className="text-xs text-gray-600">Medium</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="w-4 h-4 bg-blue-500 rounded border"></div>
                      <span className="text-xs text-gray-600">High</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="w-4 h-4 bg-blue-700 rounded border"></div>
                      <span className="text-xs text-gray-600">Very High</span>
                    </div>
                  </div>
                </div>
                
                {/* Municipality Details Panel */}
                <div className="lg:col-span-1">
                  <Card className="sticky top-4">
                    <CardHeader>
                      <CardTitle className="text-lg">Municipality Details</CardTitle>
                    </CardHeader>
                    <CardContent>
                      {selectedMunicipality ? (
                        <div className="space-y-4">
                          <div>
                            <h4 className="font-semibold text-gray-900">
                              {selectedMunicipality.municipalityName}
                            </h4>
                            <p className="text-sm text-gray-600">
                              Municipality #{selectedMunicipality.municipalityNo}
                            </p>
                          </div>
                          
                          <div className="space-y-3">
                            <div className="flex justify-between items-center">
                              <span className="text-sm text-gray-600">Total Consumption</span>
                              <span className="font-semibold">
                                {formatConsumption(selectedMunicipality.totalConsumption)}
                              </span>
                            </div>
                            <div className="flex justify-between items-center">
                              <span className="text-sm text-gray-600">Average</span>
                              <span className="font-semibold">
                                {formatConsumption(selectedMunicipality.averageConsumption)}
                              </span>
                            </div>
                            <div className="flex justify-between items-center">
                              <span className="text-sm text-gray-600">Records</span>
                              <span className="font-semibold">
                                {selectedMunicipality.recordCount}
                              </span>
                            </div>
                          </div>
                          
                          <div className="pt-3 border-t">
                            <div className="text-xs text-gray-500 space-y-1">
                              <p>Click on municipalities in the map to view details</p>
                            </div>
                          </div>
                        </div>
                      ) : (
                        <div className="text-center text-gray-500 py-8">
                          <MapPin className="h-12 w-12 mx-auto mb-3 text-gray-400" />
                          <p className="text-sm">Click on a municipality to view details</p>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                </div>
              </div>
            </TabsContent>
            
            {/* List View */}
            <TabsContent value="list">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <TrendingUp className="h-5 w-5" />
                    Top Consuming Municipalities
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {topMunicipalities.map((municipality, index) => (
                      <div 
                        key={municipality.municipalityNo}
                        className="flex items-center justify-between p-4 bg-gray-50 hover:bg-gray-100 rounded-lg transition-colors cursor-pointer"
                        onClick={() => setSelectedMunicipality(municipality)}
                      >
                        <div className="flex items-center space-x-4">
                          <div className="w-10 h-10 bg-blue-500 text-white rounded-full flex items-center justify-center font-bold">
                            {index + 1}
                          </div>
                          <div>
                            <div className="font-semibold text-gray-900">
                              {municipality.municipalityName}
                            </div>
                            <div className="text-sm text-gray-600">
                              {municipality.recordCount} records
                            </div>
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="font-semibold text-gray-900">
                            {formatConsumption(municipality.totalConsumption)}
                          </div>
                          <div className="text-sm text-gray-600">
                            Avg: {formatConsumption(municipality.averageConsumption)}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
            
            {/* Stats View */}
            <TabsContent value="stats">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <Card>
                  <CardHeader>
                    <CardTitle>Data Overview</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div className="grid grid-cols-2 gap-4">
                        <div className="text-center p-4 bg-blue-50 rounded-lg">
                          <div className="text-2xl font-bold text-blue-900">
                            {formatConsumption(minConsumption)}
                          </div>
                          <div className="text-sm text-blue-700">Minimum</div>
                        </div>
                        <div className="text-center p-4 bg-red-50 rounded-lg">
                          <div className="text-2xl font-bold text-red-900">
                            {formatConsumption(maxConsumption)}
                          </div>
                          <div className="text-sm text-red-700">Maximum</div>
                        </div>
                      </div>
                      
                      <div className="text-center p-4 bg-green-50 rounded-lg">
                        <div className="text-2xl font-bold text-green-900">
                          {formatConsumption(averageConsumption)}
                        </div>
                        <div className="text-sm text-green-700">Average</div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
                
                <Card>
                  <CardHeader>
                    <CardTitle>API Information</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3 text-sm">
                      <div className="flex justify-between">
                        <span className="text-gray-600">Total Records:</span>
                        <span className="font-semibold">{data?.totalRecords}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Aggregation Type:</span>
                        <span className="font-semibold">{data?.aggregationType}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Period:</span>
                        <span className="font-semibold">
                          {data?.period.start} to {data?.period.end}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Housing Categories:</span>
                        <span className="font-semibold">
                          {data?.availableCategories.housing.length}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Heating Categories:</span>
                        <span className="font-semibold">
                          {data?.availableCategories.heating.length}
                        </span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
}

export default ConsumptionMapComponent;