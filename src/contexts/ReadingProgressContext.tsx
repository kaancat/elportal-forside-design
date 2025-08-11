import React, { createContext, useContext, useState, useCallback } from 'react';

interface ReadingProgressContextType {
  showReadingProgress: boolean;
  setShowReadingProgress: (show: boolean) => void;
}

const ReadingProgressContext = createContext<ReadingProgressContextType | undefined>(undefined);

export const ReadingProgressProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [showReadingProgress, setShowReadingProgressState] = useState(false);

  const setShowReadingProgress = useCallback((show: boolean) => {
    setShowReadingProgressState(show);
  }, []);

  return (
    <ReadingProgressContext.Provider value={{ showReadingProgress, setShowReadingProgress }}>
      {children}
    </ReadingProgressContext.Provider>
  );
};

export const useReadingProgress = () => {
  const context = useContext(ReadingProgressContext);
  if (!context) {
    throw new Error('useReadingProgress must be used within a ReadingProgressProvider');
  }
  return context;
};