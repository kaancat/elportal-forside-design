// Centralized type fixes for package compatibility issues

declare module 'react-denmark-map/dist/esm/index.js' {
  export interface MunicipalityType {
    id: string;
    name: string;
    asciiName?: string;
    displayName?: string;
    code?: string;
    region?: any;
    [key: string]: any;
  }

  export interface MunicipalityComponentProps {
    customTooltip?: React.ComponentType<any>;
    customizeAreas?: (municipality: MunicipalityType) => any;
    onClick?: (municipality: MunicipalityType) => void;
    showTooltip?: boolean;
    zoomable?: boolean;
    className?: string;
    style?: React.CSSProperties;
    [key: string]: any;
  }

  export const Municipalities: React.FC<MunicipalityComponentProps>;
  export const Regions: React.FC<any>;
  export const Constituencies: React.FC<any>;
  export const Islands: React.FC<any>;
  export const Denmark: React.FC<any>;
}

// Global type augmentations for Next.js + React 19
declare global {
  namespace JSX {
    interface IntrinsicElements {
      // Ensure proper JSX element typing for dynamic components
      [elemName: string]: any;
    }
  }
}

export {};