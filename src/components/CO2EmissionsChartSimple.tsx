import React from 'react';

interface CO2EmissionsChartSimpleProps {
  block: {
    _type: 'co2EmissionsChart';
    _key: string;
    title?: string;
    subtitle?: string;
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
        <h2 className="text-3xl lg:text-4xl font-display font-bold text-gray-900 text-center mb-4">
          {title}
        </h2>
        <p className="text-lg text-gray-600 text-center mb-12 max-w-3xl mx-auto">
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