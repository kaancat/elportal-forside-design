
import React from 'react';
import { Pencil, Building, House, Home, Cabin } from 'lucide-react';

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
}

const householdTypes: HouseholdType[] = [
  {
    id: 'custom',
    label: 'Indtast selv',
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
    icon: <Cabin className="h-6 w-6" />,
    kWh: 2000,
    description: 'Feriebolig'
  }
];

const HouseholdTypeSelector: React.FC<HouseholdTypeSelectorProps> = ({
  selectedType,
  onTypeSelect,
  currentConsumption
}) => {
  const handleTypeClick = (type: HouseholdType) => {
    if (type.id === 'custom') {
      onTypeSelect(null); // Allow manual slider use
    } else {
      onTypeSelect(type);
    }
  };

  // Determine if current consumption matches any preset (for auto-selection)
  const getActiveType = () => {
    if (selectedType) return selectedType;
    
    // Check if current consumption matches any preset
    const matchingType = householdTypes.find(type => type.kWh === currentConsumption);
    return matchingType?.id || 'custom';
  };

  const activeType = getActiveType();

  return (
    <div className="mb-6">
      <h3 className="text-sm font-medium text-brand-dark mb-4 text-center">
        Vælg din boligtype for at få et hurtigt estimat:
      </h3>
      
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
        {householdTypes.map((type) => {
          const isActive = activeType === type.id;
          
          return (
            <button
              key={type.id}
              onClick={() => handleTypeClick(type)}
              className={`
                flex flex-col items-center p-4 rounded-lg border-2 transition-all duration-200 hover:shadow-md
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
                  text-xs font-medium transition-colors duration-200
                  ${isActive ? 'text-brand-green' : 'text-brand-dark'}
                `}>
                  {type.label}
                </div>
                <div className="text-xs text-gray-500 mt-1">
                  {type.description}
                </div>
                {type.id !== 'custom' && (
                  <div className={`
                    text-xs font-semibold mt-1 transition-colors duration-200
                    ${isActive ? 'text-brand-green' : 'text-gray-600'}
                  `}>
                    {type.kWh.toLocaleString()} kWh
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
