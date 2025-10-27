import React from 'react';
import { Info, Star, Filter, Check, List } from 'lucide-react';

const InfoSection = () => {
  return (
    <section className="py-16 bg-white">
      <div className="container mx-auto px-4">
        <div className="max-w-4xl mx-auto">
          <h3 className="text-2xl lg:text-3xl font-display font-bold mb-12 text-center">Sådan fungerer DinElportal.dk</h3>

          <div className="grid md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="bg-brand-green bg-opacity-10 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                <List className="h-8 w-8 text-brand-green" />
              </div>
              <h4 className="font-display font-bold text-xl mb-2">1. Indtast dine oplysninger</h4>
              <p className="text-gray-600">
                Udfyld vores enkle formular med info om dit elforbrug eller lad os beregne det for dig.
              </p>
            </div>

            <div className="text-center">
              <div className="bg-brand-green bg-opacity-10 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                <Filter className="h-8 w-8 text-brand-green" />
              </div>
              <h4 className="font-display font-bold text-xl mb-2">2. Sammenlign tilbud</h4>
              <p className="text-gray-600">
                Se en oversigt over de bedste elaftaler baseret på dine behov og sortér efter pris eller andre kriterier.
              </p>
            </div>

            <div className="text-center">
              <div className="bg-brand-green bg-opacity-10 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                <Check className="h-8 w-8 text-brand-green" />
              </div>
              <h4 className="font-display font-bold text-xl mb-2">3. Vælg og skift nemt</h4>
              <p className="text-gray-600">
                Vælg den bedste aftale og skift elselskab med få klik. Vi klarer alt det praktiske for dig.
              </p>
            </div>
          </div>

          <div className="mt-16 bg-gray-50 p-8 rounded-xl">
            <div className="flex items-start">
              <Info className="h-6 w-6 text-brand-green mr-4 flex-shrink-0 mt-1" />
              <div>
                <h4 className="font-display font-bold text-xl mb-2">Hvorfor bruge DinElportal.dk?</h4>
                <ul className="space-y-3">
                  <li className="flex items-start">
                    <Check className="h-5 w-5 text-brand-green mr-2 flex-shrink-0 mt-0.5" />
                    <span>100% uafhængig og gratis tjeneste</span>
                  </li>
                  <li className="flex items-start">
                    <Check className="h-5 w-5 text-brand-green mr-2 flex-shrink-0 mt-0.5" />
                    <span>Sammenlign tilbud fra over 30 forskellige elselskaber</span>
                  </li>
                  <li className="flex items-start">
                    <Check className="h-5 w-5 text-brand-green mr-2 flex-shrink-0 mt-0.5" />
                    <span>Spar i gennemsnit 2.300 kr. om året på din elregning</span>
                  </li>
                  <li className="flex items-start">
                    <Check className="h-5 w-5 text-brand-green mr-2 flex-shrink-0 mt-0.5" />
                    <span>Opdaterede priser og verificerede udbydere</span>
                  </li>
                  <li className="flex items-start">
                    <Check className="h-5 w-5 text-brand-green mr-2 flex-shrink-0 mt-0.5" />
                    <span>Over 10.000 danskere bruger dagligt DinElportal.dk</span>
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default InfoSection;
