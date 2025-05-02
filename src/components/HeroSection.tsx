
import React from 'react';
import { ArrowRight, Check } from 'lucide-react';
import { Button } from '@/components/ui/button';
import CalcProgress from './CalcProgress';

const HeroSection = () => {
  return (
    <section className="relative overflow-hidden bg-brand-dark">
      {/* Background overlay with windmill image */}
      <div className="absolute inset-0 bg-cover bg-center" style={{
        backgroundImage: "url('/lovable-uploads/e68808e9-f324-4925-93ed-3433c3de4cd9.png')"
      }}>
        <div className="absolute inset-0 bg-brand-dark bg-opacity-70"></div>
      </div>
      
      <div className="container mx-auto px-4 relative z-10 py-16">
        <div className="flex flex-col lg:flex-row items-center gap-8">
          {/* Left column with hero content */}
          <div className="lg:w-1/2 text-white">
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
          
          {/* Right column with calculator */}
          <div className="lg:w-1/2">
            <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
              <CalcProgress currentStep="welcome" />
              
              <div className="p-6">
                <div className="text-center mb-6">
                  <h2 className="text-xl font-bold text-brand-dark mb-1">
                    Se om du kan spare penge
                  </h2>
                  <p className="text-2xl font-bold mb-3">Prøv vores beregner</p>
                  <p className="text-gray-600 text-sm mb-4">
                    Få estimerede og tilpassede priser på elaftaler, som tager udgangspunkt i dit forbrug.
                  </p>
                </div>
                
                <div className="space-y-3 mb-6">
                  <div className="flex items-start">
                    <div className="mr-3 mt-1">
                      <Check className="h-4 w-4 text-brand-green" />
                    </div>
                    <div>
                      <p className="font-medium text-sm">Beregn dit forbrug</p>
                    </div>
                  </div>
                  
                  <div className="flex items-start">
                    <div className="mr-3 mt-1">
                      <Check className="h-4 w-4 text-brand-green" />
                    </div>
                    <div>
                      <p className="font-medium text-sm">Sammenlign elselskaber</p>
                    </div>
                  </div>
                  
                  <div className="flex items-start">
                    <div className="mr-3 mt-1">
                      <Check className="h-4 w-4 text-brand-green" />
                    </div>
                    <div>
                      <p className="font-medium text-sm">Gratis og uforpligtende</p>
                    </div>
                  </div>
                </div>
                
                <Button className="w-full py-4 bg-brand-green hover:bg-opacity-90 text-white font-medium rounded-md">
                  Begynd <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default HeroSection;
