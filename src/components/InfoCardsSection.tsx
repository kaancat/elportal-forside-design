import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Info } from 'lucide-react';
import { Icon, hasValidIcon } from './Icon';
import { PortableText } from '@portabletext/react';
import { cn } from '@/lib/utils';
import { getPortableTextComponents } from '@/lib/portableTextConfig';

import type { InfoCardsSectionBlock } from '@/types/sanity';

interface InfoCardsSectionProps {
  block: InfoCardsSectionBlock;
}

const InfoCardsSection: React.FC<InfoCardsSectionProps> = ({ block }) => {
  // Get shared PortableText components with link handling
  const portableTextComponents = getPortableTextComponents();

  const {
    title = 'Vigtig information',
    subtitle,
    headerAlignment = 'center',
    leadingText,
    cards = [],
    columns = 4
  } = block;

  const getGridCols = (cols: number) => {
    switch (cols) {
      case 1: return 'md:grid-cols-1';
      case 2: return 'md:grid-cols-2';
      case 3: return 'md:grid-cols-3';
      case 4: return 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-4';
      default: return 'md:grid-cols-3';
    }
  };

  // Early return if no cards
  if (!cards || cards.length === 0) {
    return null;
  }

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
                    ...portableTextComponents,
                    block: {
                      normal: ({ children }) => <p className="mb-4 last:mb-0">{children}</p>
                    }
                  }}
                />
              </div>
            </div>
          )}
        </div>

        {/* Enhanced Cards Grid */}
        <div className={cn("grid gap-6 lg:gap-8", getGridCols(columns))}>
          {cards.map((card, index) => {
            // Determine icon color based on background color
            const getIconColor = (bgColor?: string): string => {
              if (!bgColor) return '#6b7280'; // gray-600

              if (bgColor.includes('blue')) return '#2563eb'; // blue-600
              if (bgColor.includes('green')) return '#16a34a'; // green-600
              if (bgColor.includes('yellow')) return '#ca8a04'; // yellow-600
              if (bgColor.includes('orange')) return '#ea580c'; // orange-600
              if (bgColor.includes('red')) return '#dc2626'; // red-600
              if (bgColor.includes('purple')) return '#9333ea'; // purple-600
              if (bgColor.includes('pink')) return '#db2777'; // pink-600

              return '#6b7280'; // gray-600 fallback
            };

            const iconColor = getIconColor(card.bgColor);

            return (
              <Card
                key={index}
                className="group relative overflow-hidden hover:shadow-xl transition-all duration-300 h-full border-0 shadow-lg hover:scale-105"
              >
                {/* Background gradient */}
                <div className="absolute inset-0 bg-gradient-to-br from-white to-gray-50 group-hover:from-gray-50 group-hover:to-gray-100 transition-all duration-300" />

                {/* Top accent border */}
                <div className={cn(
                  "absolute top-0 left-0 right-0 h-1 transition-all duration-300",
                  card.bgColor?.includes('blue') ? "bg-blue-500" :
                    card.bgColor?.includes('green') ? "bg-green-500" :
                      card.bgColor?.includes('yellow') ? "bg-yellow-500" :
                        card.bgColor?.includes('orange') ? "bg-orange-500" :
                          "bg-gray-400"
                )} />

                <CardHeader className="relative z-10 pb-4">
                  <div className="flex items-start gap-4">
                    <div className={cn(
                      "w-14 h-14 rounded-xl flex items-center justify-center flex-shrink-0 shadow-md transition-all duration-300 group-hover:scale-110",
                      card.bgColor || "bg-gray-100"
                    )}>
                      {hasValidIcon(card.icon) ? (
                        <Icon
                          icon={card.icon}
                          size={28}
                          color={iconColor}
                          className="transition-all duration-300"
                        />
                      ) : (
                        <>
                          {/* Development warning for string icons */}
                          {process.env.NODE_ENV === 'development' && typeof card.icon === 'string' && (
                            console.warn(
                              '[InfoCardsSection] String icon detected:',
                              card.icon,
                              'in card:',
                              card.title,
                              '- Run icon migration script to fix'
                            )
                          )}
                          <Info
                            className="w-7 h-7 transition-all duration-300"
                            style={{ color: iconColor }}
                          />
                        </>
                      )}
                    </div>
                    <div className="flex-1">
                      <CardTitle className="text-xl font-bold text-gray-900 mb-2 group-hover:text-gray-700 transition-colors">
                        {card.title}
                      </CardTitle>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="relative z-10 pt-0">
                  {card.description && card.description.length > 0 && (
                    <div className="text-gray-700 leading-relaxed">
                      <PortableText
                        value={card.description}
                        components={{
                          ...portableTextComponents,
                          block: {
                            normal: ({ children }) => <p className="mb-3 last:mb-0 text-sm leading-relaxed">{children}</p>
                          }
                        }}
                      />
                    </div>
                  )}
                </CardContent>

                {/* Subtle bottom glow effect */}
                <div className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-gray-200 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
              </Card>
            );
          })}
        </div>
      </div>
    </section>
  );
};

export default InfoCardsSection;