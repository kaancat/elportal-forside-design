import React from 'react';
import { Icon } from './src/components/Icon';

// Test data matching our API response
const testIconData = {
  _type: 'icon.manager' as const,
  icon: 'solar:chart-bold',
  svg: '<svg width="32" height="32" viewBox="0 0 32 32" fill="#10b981"><!-- Placeholder SVG --></svg>',
  metadata: {
    url: 'https://api.iconify.design/solar:chart-bold.svg?width=20&height=20&color=%2384db41',
    iconName: 'chart-bold',
    inlineSvg: '', // Empty string or null
    downloadUrl: '',
    collectionId: 'solar',
    collectionName: 'Solar',
    size: { width: 20, height: 20 }
  }
};

// Simple test component
const IconTest: React.FC = () => {
  console.log('🧪 IconTest component rendering with data:', testIconData);
  
  return (
    <div style={{ padding: '20px', backgroundColor: '#f5f5f5' }}>
      <h1>Icon Component Test</h1>
      
      <div style={{ 
        display: 'flex', 
        alignItems: 'center', 
        justifyContent: 'center',
        width: '80px',
        height: '80px',
        backgroundColor: 'rgba(132, 219, 65, 0.1)',
        borderRadius: '50%',
        margin: '20px'
      }}>
        <Icon
          icon={testIconData}
          size={48}
          className="test-icon"
        />
      </div>
      
      <p>Expected: Chart icon should display</p>
      <p>URL: {testIconData.metadata.url}</p>
    </div>
  );
};

export default IconTest;