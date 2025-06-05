
import { useQuery } from '@tanstack/react-query';
import { ProductService } from '@/services/productService';

export const useProducts = () => {
  return useQuery({
    queryKey: ['products'],
    queryFn: ProductService.getAllProducts,
    staleTime: 5 * 60 * 1000, // 5 minutes
    cacheTime: 10 * 60 * 1000, // 10 minutes
  });
};

export const useVindstoedProducts = () => {
  return useQuery({
    queryKey: ['products', 'vindstoed'],
    queryFn: ProductService.getVindstoedProducts,
    staleTime: 5 * 60 * 1000,
    cacheTime: 10 * 60 * 1000,
  });
};

export const useCompetitorProducts = () => {
  return useQuery({
    queryKey: ['products', 'competitors'],
    queryFn: ProductService.getCompetitorProducts,
    staleTime: 5 * 60 * 1000,
    cacheTime: 10 * 60 * 1000,
  });
};
