
import React from 'react';

const Footer = () => {
  return (
    <footer className="bg-brand-dark text-white py-12">
      <div className="container mx-auto px-4">
        <div className="flex flex-col md:flex-row justify-between">
          <div className="mb-8 md:mb-0">
            <img 
              src="/lovable-uploads/97984f7d-d542-490c-9e04-5a0744d1b6a2.png" 
              alt="ElPortal.dk Logo" 
              className="h-10 mb-4"
            />
            <p className="max-w-xs text-gray-300 text-sm">
              ElPortal.dk er Danmarks førende sammenligningstjeneste for elpriser.
              Vi hjælper dig med at finde den bedste elpris og spare penge på din elregning.
            </p>
          </div>
          
          <div className="grid grid-cols-2 md:grid-cols-3 gap-8">
            <div>
              <h3 className="font-bold mb-4 text-lg">Links</h3>
              <ul className="space-y-2">
                <li><a href="#" className="text-gray-300 hover:text-brand-green transition-colors">Elpriser</a></li>
                <li><a href="#" className="text-gray-300 hover:text-brand-green transition-colors">Elselskaber</a></li>
                <li><a href="#" className="text-gray-300 hover:text-brand-green transition-colors">Ladeboks</a></li>
                <li><a href="#" className="text-gray-300 hover:text-brand-green transition-colors">Prisberegner</a></li>
              </ul>
            </div>
            
            <div>
              <h3 className="font-bold mb-4 text-lg">Bliv klogere på</h3>
              <ul className="space-y-2">
                <li><a href="#" className="text-gray-300 hover:text-brand-green transition-colors">Elpris guide</a></li>
                <li><a href="#" className="text-gray-300 hover:text-brand-green transition-colors">Variable vs. faste priser</a></li>
                <li><a href="#" className="text-gray-300 hover:text-brand-green transition-colors">Strømforbrug</a></li>
                <li><a href="#" className="text-gray-300 hover:text-brand-green transition-colors">Spar på elregningen</a></li>
              </ul>
            </div>
            
            <div>
              <h3 className="font-bold mb-4 text-lg">Om ElPortal</h3>
              <ul className="space-y-2">
                <li><a href="#" className="text-gray-300 hover:text-brand-green transition-colors">Om os</a></li>
                <li><a href="#" className="text-gray-300 hover:text-brand-green transition-colors">Kontakt</a></li>
                <li><a href="#" className="text-gray-300 hover:text-brand-green transition-colors">Privatlivspolitik</a></li>
                <li><a href="#" className="text-gray-300 hover:text-brand-green transition-colors">Cookies</a></li>
              </ul>
            </div>
          </div>
        </div>
        
        <div className="mt-12 pt-6 border-t border-gray-700 text-sm text-gray-400">
          <p>© {new Date().getFullYear()} ElPortal.dk - Alle rettigheder forbeholdes</p>
          <p className="mt-1">Priserne er senest opdateret: 2. maj 2025</p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
