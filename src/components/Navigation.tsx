
import React from 'react';
import { ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';

const Navigation = () => {
  return <header className="sticky top-0 z-50 w-full bg-brand-dark">
      <div className="container mx-auto px-4 flex items-center justify-between h-16">
        <div className="flex items-center">
          <a href="/" className="flex items-center">
            <img src="/lovable-uploads/97984f7d-d542-490c-9e04-5a0744d1b6a2.png" alt="ElPortal.dk Logo" className="h-8 sm:h-10" />
          </a>
        </div>
        
        <nav className="hidden md:flex items-center space-x-8">
          <a href="/elpriser" className="text-white hover:text-brand-green font-medium">Elpriser</a>
          <a href="/elselskaber" className="text-white hover:text-brand-green font-medium">Elselskaber</a>
          <a href="/ladeboks" className="text-white hover:text-brand-green font-medium">Ladeboks</a>
          <div className="relative group">
            <a href="/bliv-klogere" className="text-white hover:text-brand-green font-medium flex items-center">
              Bliv klogere på
              <svg className="w-4 h-4 ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path>
              </svg>
            </a>
          </div>
        </nav>
        
        <div>
          <Button className="bg-yellow-400 hover:bg-yellow-500 text-brand-dark font-medium rounded-full px-6">
            Sammenlign elpriser
          </Button>
        </div>
      </div>
    </header>;
};

export default Navigation;
