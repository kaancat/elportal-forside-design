
import React from 'react';
import { ArrowRight, Check } from 'lucide-react';
import { Button } from '@/components/ui/button';
import CalcProgress from './CalcProgress';

const Calculator = () => {
  return (
    <section className="bg-gray-50 py-12">
      <div className="container mx-auto px-4">
        <div className="max-w-4xl mx-auto bg-white rounded-2xl shadow-lg overflow-hidden">
          <CalcProgress currentStep="welcome" />
          
          <div className="p-8">
            <div className="text-center mb-8">
              <h2 className="text-2xl font-bold text-brand-dark mb-2">
                Se om du kan spare penge
              </h2>
              <p className="text-3xl font-bold mb-6">Prøv vores beregner</p>
              <p className="text-gray-600 mb-6">
                Få estimerede priser på elaftaler baseret på dit forbrug - enkelt og hurtigt.
              </p>
            </div>
            
            <div className="space-y-4 mb-8">
              <div className="flex items-start">
                <div className="mr-3 mt-1">
                  <Check className="h-5 w-5 text-brand-green" />
                </div>
                <div>
                  <p className="font-medium">Hurtigt overblik over elpriser</p>
                </div>
              </div>
              
              <div className="flex items-start">
                <div className="mr-3 mt-1">
                  <Check className="h-5 w-5 text-brand-green" />
                </div>
                <div>
                  <p className="font-medium">Gratis og uforpligtende</p>
                </div>
              </div>
            </div>
            
            <Button className="w-full py-6 bg-brand-green hover:bg-opacity-90 text-white text-lg font-medium rounded-md">
              Begynd <ArrowRight className="ml-2 h-5 w-5" />
            </Button>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Calculator;
