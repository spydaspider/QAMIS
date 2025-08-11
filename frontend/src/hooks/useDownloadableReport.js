import { useContext } from 'react';
import { QAReportContext } from '../context/downloadableReportContext.js';
export const useDownloadableReport = () => {
  const ctx = useContext(QAReportContext);
  if (!ctx) throw new Error('downloadableReportContext must be inside QAReportProvider');
  return ctx;
};
