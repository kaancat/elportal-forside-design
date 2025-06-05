
import React from 'react';
import ProviderCard from './ProviderCard';
import { useProducts } from '@/hooks/useProducts';

const ProviderList = () => {
  const { data: productsResponse, isLoading, error } = useProducts();

  console.log('ProviderList render - isLoading:', isLoading);
  console.log('ProviderList render - error:', error);
  console.log('ProviderList render - productsResponse:', productsResponse);

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
    console.error('Error loading products:', error);
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
            <div className="text-center text-red-500">
              Der opstod en fejl ved indlæsning af elpriser.
              <br />
              <small>Fejl: {error?.message || 'Ukendt fejl'}</small>
            </div>
          </div>
        </div>
      </section>
    );
  }

  const products = productsResponse?.products || [];
  console.log('Products to render:', products);

  if (products.length === 0) {
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
            <div className="text-center">Ingen produkter tilgængelige i øjeblikket.</div>
          </div>
        </div>
      </section>
    );
  }

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
          {products.map(product => {
            console.log('Rendering product:', product);
            if (!product || !product.id) {
              console.warn('Invalid product data:', product);
              return null;
            }
            return (
              <ProviderCard 
                key={product.id} 
                product={product}
              />
            );
          })}
        </div>
      </div>
    </section>
  );
};

export default ProviderList;
