import React from 'react';
import { Lightbulb, Home, Thermometer, Zap, Shield, Smartphone } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

// Category configuration for SEO
const categoryConfig = {
  daily_habits: { label: 'Daglige vaner', icon: Home },
  heating: { label: 'Opvarmning', icon: Thermometer },
  lighting: { label: 'Belysning', icon: Lightbulb },
  appliances: { label: 'Apparater', icon: Zap },
  insulation: { label: 'Isolering', icon: Shield },
  smart_tech: { label: 'Smart teknologi', icon: Smartphone },
};

// SEO-optimized static tips
const staticTips = [
  {
    title: 'Udskift til LED-pærer',
    description: 'LED-pærer bruger op til 85% mindre strøm end traditionelle glødepærer og holder meget længere.',
    category: 'lighting',
    icon: Lightbulb,
    savings: 'Høj'
  },
  {
    title: 'Installer smart termostat',
    description: 'En smart termostat kan reducere dit varmeforbrug med op til 20% ved intelligent styring.',
    category: 'smart_tech',
    icon: Thermometer,
    savings: 'Høj'
  },
  {
    title: 'Sluk standby-apparater',
    description: 'Standby-forbrug kan udgøre op til 10% af din elregning. Sluk apparater helt når de ikke bruges.',
    category: 'daily_habits',
    icon: Zap,
    savings: 'Medium'
  },
  {
    title: 'Optimér køleskab og fryser',
    description: 'Hold køleskabet ved 5°C og fryseren ved -18°C. Rengør kondensatoren regelmæssigt.',
    category: 'appliances',
    icon: Home,
    savings: 'Medium'
  },
  {
    title: 'Forbedre isolering',
    description: 'God isolering reducerer varmetabet og kan spare op til 30% på opvarmningsregningen.',
    category: 'insulation',
    icon: Shield,
    savings: 'Høj'
  },
  {
    title: 'Brug vaskemaskine effektivt',
    description: 'Vask ved lavere temperaturer og kun med fulde maskiner for at spare strøm og vand.',
    category: 'daily_habits',
    icon: Home,
    savings: 'Medium'
  }
];

interface EnergyTipsSectionShellProps {
  block: {
    _type: 'energyTipsSection';
    title?: string;
    subtitle?: string;
    headerAlignment?: 'left' | 'center' | 'right';
  };
}

/**
 * SSR Shell for EnergyTipsSection component
 * Provides SEO-optimized static content while client component hydrates
 */
const EnergyTipsSectionShell: React.FC<EnergyTipsSectionShellProps> = ({ block }) => {
  return (
    <section className="py-16 bg-gray-50">
      <div className="container mx-auto px-4">
        {/* Header */}
        <div className={`mb-12 ${
          block.headerAlignment === 'center' ? 'text-center' : 
          block.headerAlignment === 'right' ? 'text-right' : 
          'text-left'
        }`}>
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
            {block.title || 'Praktiske energispare tips'}
          </h2>
          <p className={`text-lg text-gray-600 ${
            block.headerAlignment === 'center' ? 'max-w-2xl mx-auto' : ''
          }`}>
            {block.subtitle || 'Følg disse simple råd for at reducere dit energiforbrug og spare penge hver måned.'}
          </p>
        </div>

        {/* Static Tips Grid for SEO */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {staticTips.map((tip, index) => (
            <Card key={index} className="p-6 h-full hover:shadow-lg transition-shadow duration-300">
              <div className="flex items-start justify-between mb-4">
                <div className="p-3 bg-brand-green/10 rounded-lg">
                  <tip.icon className="h-6 w-6 text-brand-green" />
                </div>
                <Badge variant="outline" className="text-xs bg-green-50 text-green-700 border-green-200">
                  {tip.savings}
                </Badge>
              </div>
              
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                {tip.title}
              </h3>
              
              <p className="text-gray-600 text-sm leading-relaxed">
                {tip.description}
              </p>
            </Card>
          ))}
        </div>

        {/* SEO Text Content */}
        <div className="mt-12 prose prose-lg max-w-4xl mx-auto text-gray-700">
          <h3 className="text-2xl font-bold text-gray-900 mb-4">Hvorfor spare på strøm?</h3>
          <p className="mb-4">
            At spare på strøm er ikke kun godt for din økonomi - det er også godt for miljøet. 
            Med de rette energisparetips kan du reducere dit elforbrug med op til 30% uden at gå på kompromis med komfort.
          </p>
          
          <h4 className="text-xl font-semibold text-gray-900 mb-3">De mest effektive energisparetips:</h4>
          <ul className="list-disc pl-6 mb-6 space-y-2">
            <li><strong>LED-belysning:</strong> Udskift alle glødepærer med LED for op til 85% mindre forbrug</li>
            <li><strong>Smart styring:</strong> Brug smarte termostater og timere til at optimere forbruget</li>
            <li><strong>Isolering:</strong> God isolering kan spare op til 30% på opvarmningsregningen</li>
            <li><strong>Standby-forbrug:</strong> Sluk apparater helt - standby kan koste dig tusindvis om året</li>
            <li><strong>Effektive apparater:</strong> Vælg apparater med høj energimærkning</li>
            <li><strong>Daglige vaner:</strong> Small ændringer i hverdagen kan give store besparelser</li>
          </ul>
          
          <p className="mb-4">
            Start med de nemme tiltag som LED-pærer og at slukke for standby-forbrug. 
            Disse investeringer betaler sig selv tilbage på kort tid og giver vedvarende besparelser.
          </p>
        </div>
      </div>
    </section>
  );
};

export default EnergyTipsSectionShell;