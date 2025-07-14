// src/hooks/useTestCasesContext.js
import { useContext } from 'react';
import { TestCasesContext } from '../context/TestCasesContext';

export const useTestCasesContext = () => {
  const context = useContext(TestCasesContext);
  if (!context) {
    throw new Error('useTestCasesContext must be used within a TestCasesContextProvider');
  }
  return context;
};
