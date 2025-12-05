import React, { createContext, useContext, useState, ReactNode } from 'react';

export type AppMode = 'clinic' | 'glass' | 'countertop';

interface AppModeContextType {
  mode: AppMode;
  setMode: (mode: AppMode) => void;
}

const AppModeContext = createContext<AppModeContextType | undefined>(undefined);

export const AppModeProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [mode, setModeState] = useState<AppMode>(() => {
    const saved = localStorage.getItem('app-mode');
    return (saved as AppMode) || 'glass';
  });

  const setMode = (newMode: AppMode) => {
    setModeState(newMode);
    localStorage.setItem('app-mode', newMode);
  };

  return (
    <AppModeContext.Provider value={{ mode, setMode }}>
      {children}
    </AppModeContext.Provider>
  );
};

export const useAppMode = () => {
  const context = useContext(AppModeContext);
  if (!context) {
    throw new Error('useAppMode must be used within AppModeProvider');
  }
  return context;
};