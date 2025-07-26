import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { LucideIcon, TrendingUp, Shield, Calculator, Clock, Zap, Info } from 'lucide-react';
import { PortableText } from '@portabletext/react';
import { cn } from '@/lib/utils';

import type { InfoCardsSectionBlock } from '@/types/sanity';

interface InfoCardsSectionProps {
  block: InfoCardsSectionBlock;
}

const iconMap: Record<string, LucideIcon> = {
  'trending-up': TrendingUp,
  'shield': Shield,
  'calculator': Calculator,
  'clock': Clock,
  'zap': Zap,
  'info': Info
};

const InfoCardsSection: React.FC<InfoCardsSectionProps> = ({ block }) => {
  const {
    title = 'Vigtig information',
    subtitle,
    headerAlignment = 'center',
    leadingText,
    cards = [
      {
        title: 'Prisstigninger',
        description: [{
          _type: 'block',
          children: [{ _type: 'span', text: 'Elprisen kan stige kraftigt i perioder med høj efterspørgsel eller lav produktion fra vedvarende energi.' }],
          markDefs: [],
          style: 'normal'
        }],
        icon: 'trending-up',
        iconColor: 'text-red-600',
        bgColor: 'bg-red-50'
      },
      {
        title: 'Prisfald',
        description: [{
          _type: 'block',
          children: [{ _type: 'span', text: 'Ved høj vindproduktion kan priserne falde markant - nogle gange helt til 0 kr/kWh.' }],
          markDefs: [],
          style: 'normal'
        }],
        icon: 'shield',
        iconColor: 'text-green-600',
        bgColor: 'bg-green-50'
      },
      {
        title: 'Gennemsnitspriser',
        description: [{
          _type: 'block',
          children: [{ _type: 'span', text: 'Historiske data viser typiske prismønstre, men fremtidige priser kan variere betydeligt.' }],
          markDefs: [],
          style: 'normal'
        }],
        icon: 'calculator',
        iconColor: 'text-blue-600',
        bgColor: 'bg-blue-50'
      }
    ],
    columns = 3
  } = block;

  const getGridCols = (cols: number) => {
    switch (cols) {
      case 2: return 'md:grid-cols-2';
      case 3: return 'md:grid-cols-3';
      case 4: return 'md:grid-cols-4';
      default: return 'md:grid-cols-3';
    }
  };

  return (
    <section className="py-16 lg:py-24 bg-white">
      <div className="container mx-auto px-4">
        {/* Header */}
        <div className={cn(
          "mb-12",
          headerAlignment === 'left' && "text-left",
          headerAlignment === 'center' && "text-center",
          headerAlignment === 'right' && "text-right"
        )}>
          {title && (
            <h2 className={cn(
              "text-3xl lg:text-4xl font-display font-bold text-gray-900 mb-4",
              headerAlignment === 'center' && "mx-auto"
            )}>
              {title}
            </h2>
          )}
          {subtitle && (
            <p className={cn(
              "text-lg text-gray-600 mb-8",
              headerAlignment === 'center' && "max-w-3xl mx-auto"
            )}>
              {subtitle}
            </p>
          )}
          {leadingText && leadingText.length > 0 && (
            <div className={cn(
              "text-base text-gray-700",
              headerAlignment === 'center' && "max-w-4xl mx-auto"
            )}>
              <div className="prose prose-lg max-w-none">
                <PortableText 
                  value={leadingText} 
                  components={{
                    block: {
                      normal: ({ children }) => <p className="mb-4 last:mb-0">{children}</p>
                    }
                  }}
                />
              </div>
            </div>
          )}
        </div>

        {/* Cards Grid */}
        <div className={cn("grid gap-6", getGridCols(columns))}>
          {cards.map((card, index) => {
            const Icon = card.icon ? iconMap[card.icon] || Info : Info;
            
            return (
              <Card key={index} className="hover:shadow-lg transition-shadow h-full">
                <CardHeader>
                  <div className="flex items-start gap-4">
                    <div className={cn(
                      "w-12 h-12 rounded-lg flex items-center justify-center flex-shrink-0",
                      card.bgColor || "bg-gray-100"
                    )}>
                      <Icon className={cn("w-6 h-6", card.iconColor || "text-gray-600")} />
                    </div>
                    <CardTitle className="text-xl font-bold text-gray-900">
                      {card.title}
                    </CardTitle>
                  </div>
                </CardHeader>
                <CardContent>
                  {card.description && card.description.length > 0 && (
                    <div className="text-gray-700">
                      <PortableText 
                        value={card.description}
                        components={{
                          block: {
                            normal: ({ children }) => <p className="mb-2 last:mb-0">{children}</p>
                          }
                        }}
                      />
                    </div>
                  )}
                </CardContent>
              </Card>
            );
          })}
        </div>
      </div>
    </section>
  );
};

export default InfoCardsSection;