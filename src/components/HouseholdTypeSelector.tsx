
import React from 'react';
import { Pencil, Building, House, Home, Mountain } from 'lucide-react';

interface HouseholdType {
  id: string;
  label: string;
  icon: React.ReactNode;
  kWh: number;
  description: string;
}

interface HouseholdTypeSelectorProps {
  selectedType: string | null;
  onTypeSelect: (type: HouseholdType | null) => void;
  currentConsumption: number;
  variant?: 'default' | 'compact';
}

const householdTypes: HouseholdType[] = [
  {
    id: 'custom',
    label: 'Juster selv',
    icon: <Pencil className="h-6 w-6" />,
    kWh: 4000,
    description: 'Dit forbrug'
  },
  {
    id: 'small-apartment',
    label: 'Lille Lejlighed',
    icon: <Building className="h-6 w-6" />,
    kWh: 2000,
    description: 'Op til 80 kvm'
  },
  {
    id: 'large-apartment',
    label: 'Stor Lejlighed',
    icon: <Building className="h-6 w-6" />,
    kWh: 3000,
    description: 'Over 80 kvm'
  },
  {
    id: 'small-house',
    label: 'Mindre Hus',
    icon: <House className="h-6 w-6" />,
    kWh: 4000,
    description: 'Op til 130 kvm'
  },
  {
    id: 'large-house',
    label: 'Stort Hus',
    icon: <Home className="h-6 w-6" />,
    kWh: 6000,
    description: 'Over 130 kvm'
  },
  {
    id: 'summer-house',
    label: 'Sommerhus',
    icon: <Mountain className="h-6 w-6" />,
    kWh: 2000,
    description: 'Feriebolig'
  }
];

const HouseholdTypeSelector: React.FC<HouseholdTypeSelectorProps> = ({
  selectedType,
  onTypeSelect,
  currentConsumption,
  variant = 'default'
}) => {
  const handleTypeClick = (type: HouseholdType) => {
    if (type.id === 'custom') {
      onTypeSelect(null); // Allow manual slider use
    } else {
      onTypeSelect(type);
    }
  };

  // Determine which type should appear active
  const getActiveType = () => {
    // If a type is explicitly selected, use that
    if (selectedType) {
      return selectedType;
    }
    
    // If no type is selected but consumption matches a preset exactly, 
    // we can optionally auto-highlight that preset (but this might be confusing)
    // For now, let's not auto-select to avoid confusion
    return null;
  };

  const activeType = getActiveType();

  return (
    <div className="mb-6">
      <h3 className={`${variant === 'compact' ? 'text-xs mb-3' : 'text-sm mb-4'} font-medium text-brand-dark text-center`}>
        Vælg din boligtype for at få et hurtigt estimat:
      </h3>
      
      <div className={variant === 'compact'
        ? 'flex gap-2 overflow-x-auto pb-1 -mx-1 px-1'
        : 'grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3'}>
        {householdTypes.map((type) => {
          const isActive = activeType === type.id;
          
          return (
            <button
              key={type.id}
              onClick={() => handleTypeClick(type)}
              aria-label={`Vælg ${type.label}${type.id !== 'custom' ? ` - ${type.kWh} kWh` : ''}`}
              aria-pressed={isActive}
              className={`
                flex flex-col items-center ${variant === 'compact' ? 'p-3 min-w-[110px]' : 'p-4'} rounded-lg border-2 transition-all duration-200 hover:shadow-md
                ${isActive 
                  ? 'border-brand-green bg-brand-green/5 shadow-sm' 
                  : 'border-gray-200 bg-white hover:border-gray-300'
                }
              `}
            >
              <div className={`
                mb-2 transition-colors duration-200
                ${isActive ? 'text-brand-green' : 'text-gray-600'}
              `}>
                {type.icon}
              </div>
              
              <div className="text-center">
                <div className={`
                  ${variant === 'compact' ? 'text-[11px]' : 'text-xs'} font-medium transition-colors duration-200
                  ${isActive ? 'text-brand-green' : 'text-brand-dark'}
                `}>
                  {type.label}
                </div>
                <div className={`${variant === 'compact' ? 'text-[11px]' : 'text-xs'} text-gray-500 mt-1`}>
                  {type.description}
                </div>
                {type.id !== 'custom' && (
                  <div className={`
                    ${variant === 'compact' ? 'text-[11px]' : 'text-xs'} font-semibold mt-1 transition-colors duration-200
                    ${isActive ? 'text-brand-green' : 'text-gray-600'}
                  `}>
                    {type.kWh.toLocaleString('da-DK')} kWh
                  </div>
                )}
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
};

export default HouseholdTypeSelector;
export { householdTypes };
export type { HouseholdType };
