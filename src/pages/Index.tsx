
import React from 'react';
import Navigation from '@/components/Navigation';
import HeroSection from '@/components/HeroSection';
import Calculator from '@/components/Calculator';
import ProviderList from '@/components/ProviderList';
import InfoSection from '@/components/InfoSection';
import Footer from '@/components/Footer';

const Index = () => {
  return (
    <div className="min-h-screen bg-white">
      <Navigation />
      <main>
        <HeroSection />
        <Calculator />
        <ProviderList />
        <InfoSection />
      </main>
      <Footer />
    </div>
  );
};

export default Index;
