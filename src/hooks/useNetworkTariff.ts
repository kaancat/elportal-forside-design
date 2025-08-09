/**
 * React Query hook for fetching network tariffs
 */

import { useQuery } from '@tanstack/react-query';
import { datahubPricelistService, FALLBACK_TARIFFS } from '@/services/datahubPricelistService';
import { TariffData, TariffPeriods } from '@/types/datahub';
import type { GridProvider } from '@/data/gridProviders';

interface UseNetworkTariffOptions {
  enabled?: boolean;
  refetchInterval?: number;
  useFallback?: boolean;
}

interface UseNetworkTariffResult {
  tariff: TariffData | null;
  currentRate: number;
  averageRate: number;
  periods: TariffPeriods | null;
  isLoading: boolean;
  isError: boolean;
  error: Error | null;
  isFallback: boolean;
}

/**
 * Hook to fetch and use network tariff data
 * @param gridProvider - The grid provider object
 * @param options - Query options
 * @returns Tariff data and utilities
 */
export function useNetworkTariff(
  gridProvider: GridProvider | null,
  options: UseNetworkTariffOptions = {}
): UseNetworkTariffResult {
  const {
    enabled = true,
    refetchInterval = 60 * 60 * 1000, // Refetch every hour
    useFallback = true,
  } = options;

  const queryKey = ['network-tariff', gridProvider?.gln];

  const { data, isLoading, isError, error } = useQuery({
    queryKey,
    queryFn: async () => {
      if (!gridProvider?.gln) {
        throw new Error('No grid provider GLN');
      }

      // Try to fetch from API
      const tariff = await datahubPricelistService.getCurrentTariff(
        gridProvider.gln,
        gridProvider.chargeCode
      );

      // If API fails and fallback is enabled, use static data
      if (!tariff && useFallback) {
        const fallbackRate = FALLBACK_TARIFFS[gridProvider.gln] || gridProvider.networkTariff;
        
        // Create a synthetic tariff data object
        const syntheticTariff: TariffData = {
          gln: gridProvider.gln,
          provider: gridProvider.name,
          validFrom: new Date(),
          validTo: null,
          hourlyRates: new Array(24).fill(fallbackRate),
          averageRate: fallbackRate,
          tariffType: 'flat',
          season: 'year-round',
        };
        
        return { tariff: syntheticTariff, isFallback: true };
      }

      return { tariff, isFallback: false };
    },
    enabled: enabled && !!gridProvider,
    refetchInterval,
    staleTime: 5 * 60 * 1000, // Consider data stale after 5 minutes
    gcTime: 24 * 60 * 60 * 1000, // Keep in cache for 24 hours
  });

  // Extract tariff data
  const tariff = data?.tariff || null;
  const isFallback = data?.isFallback || false;

  // Calculate current rate based on time of day
  const currentRate = tariff
    ? datahubPricelistService.getCurrentHourlyRate(tariff)
    : gridProvider?.networkTariff || 0;

  // Get average rate
  const averageRate = tariff?.averageRate || gridProvider?.networkTariff || 0;

  // Get tariff periods if available
  const periods = tariff && tariff.tariffType === 'time-of-use'
    ? datahubPricelistService.getTariffPeriods(tariff)
    : null;

  return {
    tariff,
    currentRate,
    averageRate,
    periods,
    isLoading,
    isError,
    error: error as Error | null,
    isFallback,
  };
}

/**
 * Hook to prefetch tariffs for major providers
 */
export function usePrefetchMajorProviders() {
  return useQuery({
    queryKey: ['prefetch-major-providers'],
    queryFn: () => datahubPricelistService.prefetchMajorProviders(),
    staleTime: Infinity, // Only run once
    gcTime: Infinity,
  });
}

/**
 * Get current tariff period name based on hour
 */
export function getCurrentPeriodName(hour?: number): 'low' | 'high' | 'peak' {
  const currentHour = hour ?? new Date().getHours();
  
  if (currentHour >= 0 && currentHour < 6) {
    return 'low';
  } else if (currentHour >= 17 && currentHour < 21) {
    return 'peak';
  } else {
    return 'high';
  }
}

/**
 * Format tariff period name for display
 */
export function formatPeriodName(period: 'low' | 'high' | 'peak'): string {
  const names = {
    low: 'Lavlast (nat)',
    high: 'Højlast (dag)',
    peak: 'Spidslast (aften)',
  };
  return names[period];
}