import { useQuery } from '@tanstack/react-query';
import { ConsumptionResponse } from '../types/sanity';

interface UseConsumptionDataProps {
  municipality?: string;
  start?: string;
  end?: string;
  housing?: string;
  heating?: string;
  aggregate?: 'daily' | 'monthly' | 'municipality';
  limit?: number;
  offset?: number;
  enabled?: boolean;
}

/**
 * React hook for fetching private industry consumption data
 * Optimized for real-time map updates with appropriate caching
 */
export function useConsumptionData({
  municipality,
  start,
  end,
  housing,
  heating,
  aggregate = 'municipality',
  limit = 1000,
  offset = 0,
  enabled = true,
}: UseConsumptionDataProps = {}) {
  const buildApiUrl = () => {
    const params = new URLSearchParams();
    
    if (municipality) params.append('municipality', municipality);
    if (start) params.append('start', start);
    if (end) params.append('end', end);
    if (housing) params.append('housing', housing);
    if (heating) params.append('heating', heating);
    if (aggregate) params.append('aggregate', aggregate);
    if (limit) params.append('limit', limit.toString());
    if (offset) params.append('offset', offset.toString());
    
    return `/api/private-industry-consumption?${params.toString()}`;
  };

  const fetchConsumptionData = async (): Promise<ConsumptionResponse> => {
    const response = await fetch(buildApiUrl());
    
    if (!response.ok) {
      throw new Error(`API Error: ${response.status} - ${response.statusText}`);
    }
    
    return response.json();
  };

  const queryKey = [
    'consumption-data',
    municipality,
    start,
    end,
    housing,
    heating,
    aggregate,
    limit,
    offset,
  ];

  // Determine stale time based on aggregation type
  const getStaleTime = () => {
    switch (aggregate) {
      case 'municipality':
        return 30 * 60 * 1000; // 30 minutes for map data
      case 'daily':
      case 'monthly':
        return 60 * 60 * 1000; // 1 hour for aggregated data
      default:
        return 15 * 60 * 1000; // 15 minutes for raw data
    }
  };

  return useQuery({
    queryKey,
    queryFn: fetchConsumptionData,
    enabled,
    staleTime: getStaleTime(),
    gcTime: 5 * 60 * 1000, // 5 minutes garbage collection time
    refetchOnWindowFocus: false,
    refetchOnMount: false,
    retry: 2,
    retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
  });
}

/**
 * Hook for fetching available categories (housing and heating types)
 * This is useful for building filter dropdowns
 */
export function useConsumptionCategories() {
  const { data } = useConsumptionData({
    limit: 100,
    aggregate: 'municipality',
  });

  return {
    housingCategories: data?.availableCategories.housing || [],
    heatingCategories: data?.availableCategories.heating || [],
  };
}

/**
 * Hook for fetching municipality-specific consumption data
 * Optimized for individual municipality views
 */
export function useMunicipalityConsumption(
  municipalityNo: string,
  options: Omit<UseConsumptionDataProps, 'municipality'> = {}
) {
  return useConsumptionData({
    municipality: municipalityNo,
    aggregate: 'daily',
    ...options,
  });
}

/**
 * Hook for fetching all municipalities consumption data for map visualization
 * Optimized for real-time updates
 */
export function useMapConsumptionData(
  filters: Pick<UseConsumptionDataProps, 'start' | 'end' | 'housing' | 'heating'> = {}
) {
  return useConsumptionData({
    aggregate: 'municipality',
    limit: 1000,
    ...filters,
  });
}