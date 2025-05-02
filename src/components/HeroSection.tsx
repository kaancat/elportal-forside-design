
import React from 'react';
import { ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';

const HeroSection = () => {
  return (
    <section className="relative h-[600px] overflow-hidden">
      {/* Background overlay with windmill image */}
      <div 
        className="absolute inset-0 bg-cover bg-center"
        style={{ backgroundImage: "url('/lovable-uploads/e68808e9-f324-4925-93ed-3433c3de4cd9.png')" }}
      >
        <div className="absolute inset-0 bg-brand-dark bg-opacity-70"></div>
      </div>
      
      <div className="container mx-auto px-4 h-full flex items-center relative z-10">
        <div className="md:w-1/2 text-white">
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-6">
            Elpriser - Find og <span className="text-brand-green">sammenlign</span> elpriser
          </h1>
          <p className="text-xl mb-8">
            Sammenlign elpriser og se, om du kan finde en bedre elpris ud fra dit estimerede forbrug.
          </p>
          
          <div className="flex flex-wrap gap-8 mb-10">
            <div className="text-center">
              <p className="text-3xl lg:text-4xl font-bold text-brand-green">10.000+</p>
              <p className="text-sm lg:text-base">Brugere dagligt</p>
            </div>
            <div className="text-center">
              <p className="text-3xl lg:text-4xl font-bold text-brand-green">30+</p>
              <p className="text-sm lg:text-base">Elaftaler</p>
            </div>
            <div className="text-center">
              <p className="text-3xl lg:text-4xl font-bold text-brand-green">2 ud af 3</p>
              <p className="text-sm lg:text-base">Kan spare ved at skifte</p>
            </div>
          </div>
          
          <Button size="lg" className="bg-brand-green hover:bg-opacity-90 text-white rounded-md px-8 py-6 text-lg font-medium">
            Begynd <ArrowRight className="ml-2 h-5 w-5" />
          </Button>
        </div>
      </div>
    </section>
  );
};

export default HeroSection;
