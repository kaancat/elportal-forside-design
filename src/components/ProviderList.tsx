
import React from 'react';
import ProviderCard from './ProviderCard';
import { useProducts } from '@/hooks/useProducts';

const ProviderList = () => {
  const { data: productsResponse, isLoading, error } = useProducts();

  if (isLoading) {
    return (
      <section className="py-12 bg-gray-50">
        <div className="container mx-auto px-4">
          <div className="mb-8">
            <h2 className="text-3xl font-bold text-center mb-2">Sammenlign eludbydere</h2>
            <p className="text-center text-gray-600 mb-8">
              Find den bedste elpris for dig baseret på dit forbrug
            </p>
          </div>
          <div className="space-y-4">
            <div className="text-center">Indlæser elpriser...</div>
          </div>
        </div>
      </section>
    );
  }

  if (error) {
    return (
      <section className="py-12 bg-gray-50">
        <div className="container mx-auto px-4">
          <div className="mb-8">
            <h2 className="text-3xl font-bold text-center mb-2">Sammenlign eludbydere</h2>
            <p className="text-center text-gray-600 mb-8">
              Find den bedste elpris for dig baseret på dit forbrug
            </p>
          </div>
          <div className="space-y-4">
            <div className="text-center text-red-500">Der opstod en fejl ved indlæsning af elpriser.</div>
          </div>
        </div>
      </section>
    );
  }

  const products = productsResponse?.products || [];

  return (
    <section className="py-12 bg-gray-50">
      <div className="container mx-auto px-4">
        <div className="mb-8">
          <h2 className="text-3xl font-bold text-center mb-2">Sammenlign eludbydere</h2>
          <p className="text-center text-gray-600 mb-8">
            Find den bedste elpris for dig baseret på dit forbrug
          </p>
        </div>
        
        <div className="space-y-4">
          {products.map(product => (
            <ProviderCard 
              key={product.id} 
              product={product}
            />
          ))}
        </div>
      </div>
    </section>
  );
};

export default ProviderList;
