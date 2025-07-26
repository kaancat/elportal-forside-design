import React from 'react';

interface DebugWrapperProps {
  componentName: string;
  block: any;
  children: React.ReactNode;
}

export const DebugWrapper: React.FC<DebugWrapperProps> = ({ componentName, block, children }) => {
  // Log component mounting
  React.useEffect(() => {
    console.log(`[${componentName}] Mounted with block:`, block);
    console.log(`[${componentName}] Block type:`, block?._type);
    console.log(`[${componentName}] Block keys:`, Object.keys(block || {}));
  }, [componentName, block]);

  try {
    return <>{children}</>;
  } catch (error) {
    console.error(`[${componentName}] Render error:`, error);
    return (
      <div className="border-2 border-red-500 p-4 m-4 bg-red-50">
        <h3 className="text-red-700 font-bold">Component Error: {componentName}</h3>
        <p className="text-red-600">{String(error)}</p>
        <details className="mt-2">
          <summary className="cursor-pointer text-red-600">Block Data</summary>
          <pre className="text-xs mt-2 overflow-auto">{JSON.stringify(block, null, 2)}</pre>
        </details>
      </div>
    );
  }
};