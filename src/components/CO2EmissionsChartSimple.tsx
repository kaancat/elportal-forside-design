import React from 'react';

import { cn } from '@/lib/utils';

interface CO2EmissionsChartSimpleProps {
  block: {
    _type: 'co2EmissionsChart';
    _key: string;
    title?: string;
    subtitle?: string;
    headerAlignment?: 'left' | 'center' | 'right';
    showGauge?: boolean;
  };
}

const CO2EmissionsChartSimple: React.FC<CO2EmissionsChartSimpleProps> = ({ block }) => {
  const title = block.title || 'CO₂-udledning fra elforbrug';
  const subtitle = block.subtitle || 'Realtids CO₂-intensitet målt i gram per kWh';
  const showGauge = block.showGauge !== undefined ? block.showGauge : true;

  return (
    <section className="bg-white py-16 lg:py-24">
      <div className="container mx-auto px-4">
        <h3 className={cn(
          "text-2xl lg:text-3xl font-display font-bold text-gray-900 mb-4",
          block.headerAlignment === 'left' && "text-left",
          block.headerAlignment === 'center' && "text-center",
          block.headerAlignment === 'right' && "text-right",
          !block.headerAlignment && "text-center" // default to center
        )}>
          {title}
        </h3>
        <p className={cn(
          "text-lg text-gray-600 mb-12",
          block.headerAlignment === 'center' || !block.headerAlignment ? "max-w-3xl mx-auto text-center" : "",
          block.headerAlignment === 'left' && "text-left",
          block.headerAlignment === 'right' && "text-right"
        )}>
          {subtitle}
        </p>

        <div className="bg-gray-50 p-8 rounded-lg text-center">
          <div className="text-6xl mb-4">🌱</div>
          <h3 className="text-2xl font-bold text-gray-900 mb-2">CO₂ Emissions Chart</h3>
          <p className="text-gray-600 mb-4">Component loaded successfully!</p>
          <div className="text-sm text-gray-500">
            <p>Show Gauge: {showGauge ? 'Yes' : 'No'}</p>
            <p>Block Key: {block._key}</p>
          </div>
        </div>
      </div>
    </section>
  );
};

export default CO2EmissionsChartSimple;