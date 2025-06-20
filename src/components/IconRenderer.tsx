import React, { useState, useEffect, Suspense } from 'react';
import { IconPicker } from '@/types/sanity';

interface IconRendererProps {
  iconData?: IconPicker;
  className?: string;
}

const IconRenderer: React.FC<IconRendererProps> = ({ iconData, className }) => {
  const [IconComponent, setIconComponent] = useState<React.ComponentType<any> | null>(null);

  useEffect(() => {
    if (!iconData?.provider || !iconData?.name) {
      return;
    }

    // The react-icons library splits icons by provider code (e.g., 'fa', 'md', 'fi')
    // We need to map the provider from Sanity to the correct path.
    const providerMap: { [key: string]: string } = {
      fa: 'fa', // FontAwesome
      f7: 'f7', // Framework7
      fi: 'fi', // Feather
      hi: 'hi', // Heroicons
      mdi: 'md',// Material Design Icons
      sa: 'si', // Simple Icons - Note: provider code 'sa' might map to 'si' in react-icons
      // Add other mappings here as needed
    };

    const providerPath = providerMap[iconData.provider];
    if (!providerPath) {
      console.warn(`Unknown icon provider: ${iconData.provider}`);
      return;
    }

    // PascalCase the icon name (e.g., "chart-upward" -> "ChartUpward")
    const iconName = iconData.name.replace(/(^\w|-\w)/g, (text) => text.replace(/-/, "").toUpperCase());

    const importIcon = async () => {
      try {
        const library = await import(`react-icons/${providerPath}/index.js`);
        if (library[iconName]) {
          setIconComponent(() => library[iconName]);
        } else {
          console.warn(`Icon not found: ${iconName} in provider ${providerPath}`);
        }
      } catch (err) {
        console.error(`Failed to load icon library for provider: ${providerPath}`, err);
      }
    };

    importIcon();
  }, [iconData]);

  if (!IconComponent) {
    // Return a placeholder or null while loading or if not found
    return <span className={className} style={{ display: 'inline-block' }} />;
  }

  return (
    <Suspense fallback={<span className={className} />}>
      <IconComponent className={className} />
    </Suspense>
  );
};

export default IconRenderer; 