
import React from 'react';
import { Check } from 'lucide-react';

const steps = [
  { id: 'welcome', label: 'Velkommen' },
  { id: 'info', label: 'Dit forbrug' },
  { id: 'result', label: 'Resultat' },
];

interface CalcProgressProps {
  currentStep: string;
}

const CalcProgress: React.FC<CalcProgressProps> = ({ currentStep }) => {
  const currentIndex = steps.findIndex(step => step.id === currentStep);
  
  return (
    <div className="py-6 px-4 bg-white rounded-xl shadow-sm">
      <div className="flex items-center justify-between">
        {steps.map((step, index) => (
          <React.Fragment key={step.id}>
            <div className="flex flex-col items-center">
              <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                index <= currentIndex 
                  ? 'bg-brand-green text-white' 
                  : 'bg-gray-100 text-gray-400'
              }`}>
                {index < currentIndex ? (
                  <Check className="w-4 h-4" />
                ) : (
                  <span>{index + 1}</span>
                )}
              </div>
              <span className={`text-xs mt-1 ${
                index <= currentIndex ? 'text-brand-dark font-medium' : 'text-gray-400'
              }`}>
                {step.label}
              </span>
            </div>
            
            {index < steps.length - 1 && (
              <div className={`flex-1 h-0.5 ${
                index < currentIndex ? 'bg-brand-green' : 'bg-gray-200'
              }`}></div>
            )}
          </React.Fragment>
        ))}
      </div>
    </div>
  );
};

export default CalcProgress;
