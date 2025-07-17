// src/hooks/useSprintContext.js
import { useContext } from 'react';
import { SprintContext } from '../context/sprintContext';

export const useSprintContext = () => {
  const context = useContext(SprintContext);
  if (!context) {
    throw new Error('useSprintContext must be used within a SprintContextProvider');
  }
  return context;
};
