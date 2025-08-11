import React, { useState, useContext } from 'react';
import axios from 'axios';
import { QAReportContext } from '../context/downloadableReportContext';
import styles from './downloadableReport.module.css';
import Loader from './loader';
import { FaDownload } from 'react-icons/fa';

const DownloadQAReport = () => {
  const { dispatch, loading, error } = useContext(QAReportContext);
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');

  const handleDownload = async () => {
    if (!startDate || !endDate) {
      dispatch({ type: 'SET_ERROR', payload: 'Please select both start and end dates' });
      return;
    }

    try {
      dispatch({ type: 'SET_LOADING', payload: true });
      dispatch({ type: 'SET_ERROR', payload: null });

      const response = await axios.post(
        '/api/report/general',
        { periodStart: startDate, periodEnd: endDate },
        { responseType: 'blob' }
      );

      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', 'general_report.csv');
      document.body.appendChild(link);
      link.click();
      link.remove();
    } catch (err) {
      console.error(err);
      dispatch({ type: 'SET_ERROR', payload: 'Failed to download report' });
    } finally {
      dispatch({ type: 'SET_LOADING', payload: false });
    }
  };

  return (
    <div className={styles.qaContainer}>
      <h1 className={styles.qaHeader}>Download QA Report</h1>

      <div className={styles.qaForm}>
        <div className={styles.qaDateGroup}>
          <label>Start Date:</label>
          <input
            type="date"
            value={startDate}
            onChange={(e) => setStartDate(e.target.value)}
            className={styles.qaDate}
          />
        </div>

        <div className={styles.qaDateGroup}>
          <label>End Date:</label>
          <input
            type="date"
            value={endDate}
            onChange={(e) => setEndDate(e.target.value)}
            className={styles.qaDate}
          />
        </div>

        <button
          onClick={handleDownload}
          className={styles.qaButton}
          disabled={loading}
        >
          {loading ? 'Generating…' : <><FaDownload /> Download CSV</>}
        </button>
      </div>

      {loading && <Loader />}
      {error && <p className={styles.qaError}>{error}</p>}
    </div>
  );
};

export default DownloadQAReport;
