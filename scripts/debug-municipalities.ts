import React from 'react';
import ReactDOM from 'react-dom/client';
import { Municipalities } from 'react-denmark-map';
import { getMunicipalityRegion } from '../src/utils/denmarkRegions';

// Temporary component to log all municipality names from react-denmark-map
const DebugComponent = () => {
  const seenMunicipalities = new Set<string>();
  const unmappedMunicipalities: string[] = [];
  
  const customizeMunicipalities = (municipality: any) => {
    const name = municipality.name;
    
    if (!seenMunicipalities.has(name)) {
      seenMunicipalities.add(name);
      console.log(`Municipality from map: "${name}"`);
      
      const region = getMunicipalityRegion(name);
      if (!region) {
        unmappedMunicipalities.push(name);
        console.log(`  ❌ NOT MAPPED to a region`);
      } else {
        console.log(`  ✅ Mapped to ${region}`);
      }
    }
    
    return {
      style: {
        fill: '#ccc'
      }
    };
  };
  
  React.useEffect(() => {
    setTimeout(() => {
      console.log('\n=== SUMMARY ===');
      console.log(`Total municipalities: ${seenMunicipalities.size}`);
      console.log(`Unmapped municipalities: ${unmappedMunicipalities.length}`);
      if (unmappedMunicipalities.length > 0) {
        console.log('\nUnmapped municipalities list:');
        unmappedMunicipalities.forEach(name => console.log(`- "${name}"`));
      }
    }, 1000);
  }, []);
  
  return (
    <div style={{ width: '100vw', height: '100vh' }}>
      <Municipalities 
        customizeAreas={customizeMunicipalities}
        showTooltip={false}
        zoomable={false}
        draggable={false}
      />
    </div>
  );
};

// Create a temporary div and render the component
const container = document.createElement('div');
document.body.appendChild(container);
const root = ReactDOM.createRoot(container);
root.render(React.createElement(DebugComponent));