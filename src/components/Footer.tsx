'use client'

import React from 'react';
import { Link } from 'react-router-dom';
import { useFooterData } from '@/hooks/useFooterData';
import { resolveLink } from '@/utils/linkResolver';
import { Skeleton } from '@/components/ui/skeleton';
import { FALLBACK_LOGO, FALLBACK_ALT } from '@/constants/branding';

const Footer = () => {
  const { data: settings, isLoading } = useFooterData();
  const footer = settings?.footer;

  // Format today's date in Danish
  const formatDate = () => {
    const today = new Date();
    return today.toLocaleDateString('da-DK', {
      day: 'numeric',
      month: 'long', 
      year: 'numeric'
    });
  };

  // Replace {date} placeholder in secondary copyright text
  const getSecondaryText = () => {
    if (!footer?.secondaryCopyrightText) {
      return `Priserne er senest opdateret: ${formatDate()}`;
    }
    return footer.secondaryCopyrightText.replace('{date}', formatDate());
  };

  if (isLoading) {
    return (
      <footer className="bg-brand-dark text-white py-12">
        <div className="container mx-auto px-4">
          <div className="flex flex-col md:flex-row justify-between">
            <div className="mb-8 md:mb-0">
              <Skeleton className="h-10 w-40 mb-4 bg-gray-700" />
              <Skeleton className="h-20 w-80 bg-gray-700" />
            </div>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-8">
              {[1, 2, 3].map((i) => (
                <div key={i}>
                  <Skeleton className="h-6 w-24 mb-4 bg-gray-700" />
                  <div className="space-y-2">
                    {[1, 2, 3, 4].map((j) => (
                      <Skeleton key={j} className="h-4 w-32 bg-gray-700" />
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </footer>
    );
  }

  // Use dynamic content from Sanity if available
  if (footer && footer.linkGroups && footer.linkGroups.length > 0) {
    return (
      <footer className="bg-brand-dark text-white py-12">
        <div className="container mx-auto px-4">
          <div className="flex flex-col md:flex-row justify-between">
            <div className="mb-8 md:mb-0">
              {footer.footerLogo ? (
                <img 
                  src={footer.footerLogo.asset?._ref ? 
                    `https://cdn.sanity.io/images/yxesi03x/production/${footer.footerLogo.asset._ref.replace('image-', '').replace('-png', '.png').replace('-jpg', '.jpg')}` :
                    FALLBACK_LOGO
                  }
                  alt={FALLBACK_ALT} 
                  className="h-10 mb-4"
                  onError={(e) => {
                    console.error('Footer logo failed to load');
                    e.currentTarget.style.display = 'none';
                  }}
                />
              ) : (
                <img 
                  src={FALLBACK_LOGO} 
                  alt={FALLBACK_ALT} 
                  className="h-10 mb-4"
                  onError={(e) => {
                    console.error('Footer fallback logo failed to load');
                    e.currentTarget.style.display = 'none';
                  }}
                />
              )}
              <p className="max-w-xs text-gray-300 text-sm">
                {footer.footerDescription || 
                  "DinElportal.dk er Danmarks sammenligningstjeneste for elpriser. Vi hjælper dig med at finde den bedste elpris og spare penge på din elregning."
                }
              </p>
            </div>
            
            <div className="grid grid-cols-2 md:grid-cols-3 gap-8">
              {footer.linkGroups.map((group, index) => (
                <div key={group._key || index}>
                  <h3 className="font-bold mb-4 text-lg">{group.title}</h3>
                  <ul className="space-y-2">
                    {group.links?.map((link, linkIndex) => {
                      const href = resolveLink(link, 'Footer');
                      const isInternal = link.linkType === 'internal';
                      
                      return (
                        <li key={link._key || linkIndex}>
                          {isInternal ? (
                            <Link 
                              to={href}
                              className="text-gray-300 hover:text-brand-green transition-colors"
                            >
                              {link.title}
                            </Link>
                          ) : (
                            <a 
                              href={href}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-gray-300 hover:text-brand-green transition-colors"
                            >
                              {link.title}
                            </a>
                          )}
                        </li>
                      );
                    })}
                  </ul>
                </div>
              ))}
            </div>
          </div>
          
          <div className="mt-12 pt-6 border-t border-gray-700 text-sm text-gray-400">
            <p>{footer.copyrightText || `© ${new Date().getFullYear()} DinElportal.dk - Alle rettigheder forbeholdes`}</p>
            <p className="mt-1">{getSecondaryText()}</p>
          </div>
        </div>
      </footer>
    );
  }

  // Fallback to hardcoded content if no data from Sanity
  return (
    <footer className="bg-brand-dark text-white py-12">
      <div className="container mx-auto px-4">
        <div className="flex flex-col md:flex-row justify-between">
          <div className="mb-8 md:mb-0">
            <img 
              src={FALLBACK_LOGO} 
              alt={FALLBACK_ALT} 
              className="h-10 mb-4"
              onError={(e) => {
                console.error('Footer skeleton logo failed to load');
                e.currentTarget.style.display = 'none';
              }}
            />
            <p className="max-w-xs text-gray-300 text-sm">
              DinElportal.dk er Danmarks sammenligningstjeneste for elpriser.
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
              <h3 className="font-bold mb-4 text-lg">Om DinElportal</h3>
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
          <p>© {new Date().getFullYear()} DinElportal.dk - Alle rettigheder forbeholdes</p>
          <p className="mt-1">Priserne er senest opdateret: {formatDate()}</p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;