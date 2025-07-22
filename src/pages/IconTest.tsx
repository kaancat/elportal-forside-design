import React from 'react';
import { Icon } from '@/components/Icon';
import { IconManager } from '@/types/sanity';
import { HelpCircle, Check, X } from 'lucide-react';

const IconTest = () => {
  // Test various icon configurations
  const testIcons: { label: string; icon?: IconManager }[] = [
    {
      label: "Null icon",
      icon: undefined
    },
    {
      label: "Empty metadata",
      icon: {
        _type: 'icon.manager',
        icon: 'test',
        metadata: {}
      } as IconManager
    },
    {
      label: "Only URL",
      icon: {
        _type: 'icon.manager',
        icon: 'material-symbols:check',
        metadata: {
          url: 'https://api.iconify.design/material-symbols/check.svg',
          iconName: 'material-symbols:check'
        }
      }
    },
    {
      label: "Iconify URL with color",
      icon: {
        _type: 'icon.manager',
        icon: 'mdi:home',
        metadata: {
          url: 'https://api.iconify.design/mdi/home.svg',
          iconName: 'mdi:home'
        }
      }
    },
    {
      label: "Inline SVG test",
      icon: {
        _type: 'icon.manager',
        icon: 'custom',
        metadata: {
          inlineSvg: '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"></circle><line x1="12" y1="8" x2="12" y2="16"></line><line x1="8" y1="12" x2="16" y2="12"></line></svg>',
          iconName: 'plus-circle'
        }
      }
    }
  ];

  return (
    <div className="container mx-auto py-12 px-4">
      <h1 className="text-3xl font-bold mb-8">Icon Test Page</h1>
      
      <div className="space-y-8">
        <div>
          <h2 className="text-xl font-semibold mb-4">Static Lucide Icons (Control)</h2>
          <div className="flex gap-4">
            <div className="text-center">
              <HelpCircle className="w-8 h-8 text-blue-500 mx-auto" />
              <p className="text-sm mt-2">HelpCircle</p>
            </div>
            <div className="text-center">
              <Check className="w-8 h-8 text-green-500 mx-auto" />
              <p className="text-sm mt-2">Check</p>
            </div>
            <div className="text-center">
              <X className="w-8 h-8 text-red-500 mx-auto" />
              <p className="text-sm mt-2">X</p>
            </div>
          </div>
        </div>

        <div>
          <h2 className="text-xl font-semibold mb-4">DynamicIcon Tests</h2>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-6">
            {testIcons.map((test, index) => (
              <div key={index} className="border rounded-lg p-4">
                <h3 className="font-medium mb-2">{test.label}</h3>
                <div className="flex items-center justify-center h-16 bg-gray-100 rounded">
                  <Icon 
                    icon={test.icon} 
                    size={32}
                  />
                </div>
                <details className="mt-2">
                  <summary className="text-sm text-gray-600 cursor-pointer">Icon data</summary>
                  <pre className="text-xs bg-gray-50 p-2 rounded mt-1 overflow-auto">
                    {JSON.stringify(test.icon, null, 2)}
                  </pre>
                </details>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-yellow-50 border border-yellow-300 rounded-lg p-4">
          <h3 className="font-semibold text-yellow-800">Debug Info</h3>
          <p className="text-sm text-yellow-700 mt-2">
            Check the browser console for detailed icon loading logs. Each icon attempt should log its data structure and any errors.
          </p>
        </div>
      </div>
    </div>
  );
};

export default IconTest;