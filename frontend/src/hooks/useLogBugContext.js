// src/hooks/useTestCasesContext.js
import { useContext } from 'react';
import { BugsContext } from '../context/logBugContext';

export const useLogBugContext = () => {
  const context = useContext(BugsContext);
  if (!context) {
    throw new Error('useBugContext must be used within a useBugContextProvider');
  }
  return context;
};
