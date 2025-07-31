// src/components/ManagePerformanceMetrics.jsx
import React, { useState, useEffect, useContext } from 'react';
import axios from 'axios';
import { PerformanceMetricsContext } from '../context/performanceMetricsContext';
import styles from './performanceMetrics.module.css';
import Loader from './loader';

import {
  BarChart,
  Bar,
  XAxis, 
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer
} from 'recharts';

const ManagePerformanceMetrics = () => {
  const { dispatch } = useContext(PerformanceMetricsContext);

  const [metricsList, setMetricsList] = useState([]);
  const [loading, setLoading]         = useState(true);
  const [error, setError]             = useState(null);
  const [recalcLoading, setRecalcLoading] = useState(false);

  // Load teams & metrics
  const loadAll = async () => {
    setLoading(true);
    setError(null);
    try {
      const teamsResp = await axios.get('/api/teams');
      const teams     = teamsResp.data.data;
      dispatch({ type: 'SET_TEAMS', payload: teams });

      const metricsPromises = teams.map(team =>
        axios
          .get(`/api/teams/${team._id}/metrics/latest`)
          .then(r => ({ team, metrics: r.data.metrics }))
      );
      const results = await Promise.all(metricsPromises);
      setMetricsList(results);
    } catch (err) {
      console.error(err);
      setError('Failed to load teams or metrics');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAll();
  }, [dispatch]);

  // Recalculate all
  const handleRecalculateAll = async () => {
    setRecalcLoading(true);
    setError(null);
    try {
      // POST to recalc for each team
      await Promise.all(
        metricsList.map(({ team }) =>
          axios.post(`api/teams/${team._id}/metrics`)
        )
      );
      // then reload
      await loadAll();
    } catch (err) {
      console.error(err);
      setError('Failed to recalculate metrics');
    } finally {
      setRecalcLoading(false);
    }
  };

  if (loading) return <Loader />;
  if (error)   return <p className={styles.pmError}>{error}</p>;

  return (
    <div className={styles.pmContainer}>
      <div className={styles.pmHeader} style={{ marginBottom: '1.5rem' }}>
        <h1>Team Performance Metrics</h1>
        <button
          className={styles.pmButton}
          onClick={handleRecalculateAll}
          disabled={recalcLoading}
        >
          {recalcLoading ? 'Recalculating…' : 'Recalculate All'}
        </button>
      </div>

      {metricsList.map(({ team, metrics }) => {
        const data = [
          { name: 'Bugs Logged',      value: metrics.bugsLogged },
          { name: 'Bugs Resolved',    value: metrics.bugsResolvedCount },
          { name: 'Defect Density',   value: Number(metrics.defectDensity.toFixed(2)) },
          { name: 'Avg Resolution (h)', value: Number(metrics.avgResolutionTimeHours.toFixed(2)) },
          { name: 'Test Exec',        value: metrics.testCasesExecuted },
          { name: 'Pass Rate (%)',    value: Number((metrics.testPassRate * 100).toFixed(1)) }
        ];

        return (
          <section key={team._id} className={styles.teamPanel}>
            <h2 className={styles.teamTitle}>{team.name} Metrics</h2>
            <div style={{ width: '100%', overflow: 'hidden' }}>
              <ResponsiveContainer width={900} height={400}>
                <BarChart
                  data={data}
                  margin={{ top: 10, right: 20, left: 0, bottom: 0 }}
                >
                  <defs>
                    <linearGradient id="teamBarGradient" x1="0" y1="0" x2="1" y2="0">
                      <stop offset="0%" stopColor="#1E3C72" />
                      <stop offset="100%" stopColor="#2A5298" />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Bar dataKey="value" fill="url(#teamBarGradient)" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </section>
        );
      })}
    </div>
  );
};

export default ManagePerformanceMetrics;
