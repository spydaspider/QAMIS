import { useContext } from 'react';
import { PerformanceMetricsContext } from '../context/performanceMetricsContext';
export const usePerformanceMetricsContext = () => {
  const ctx = useContext(PerformanceMetricsContext);
  if (!ctx) throw new Error('usePerformanceMetricContext must be inside PerformanceMetricsProvider');
  return ctx;
};
