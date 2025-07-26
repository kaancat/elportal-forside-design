import React from 'react';
import { Municipalities } from 'react-denmark-map';
import { getMunicipalityRegion } from '../src/utils/denmarkRegions';

// This script will help us identify which municipality names are being passed
// by react-denmark-map that we're not handling

const TestMunicipalities = () => {
  const unmappedMunicipalities = new Set<string>();
  
  const customizeMunicipalities = (municipality: any) => {
    const region = getMunicipalityRegion(municipality.name);
    
    if (!region) {
      unmappedMunicipalities.add(municipality.name);
      console.log(`Unmapped municipality: "${municipality.name}"`);
    }
    
    const color = region === 'DK1' ? '#60a5fa' : region === 'DK2' ? '#a78bfa' : '#e5e7eb';
    
    return {
      style: {
        fill: color,
        stroke: '#666',
        strokeWidth: 0.5
      }
    };
  };
  
  return (
    <div>
      <Municipalities 
        customizeAreas={customizeMunicipalities}
        showTooltip={true}
        zoomable={false}
        draggable={false}
      />
      <div>
        <h3>Unmapped Municipalities:</h3>
        {Array.from(unmappedMunicipalities).map(name => (
          <div key={name}>{name}</div>
        ))}
      </div>
    </div>
  );
};

export default TestMunicipalities;