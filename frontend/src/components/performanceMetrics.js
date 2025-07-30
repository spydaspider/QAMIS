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

  useEffect(() => {
    const loadAll = async () => {
      setLoading(true);
      setError(null);

      try {
        // 1) Fetch teams and push into context
        const teamsResp = await axios.get('/api/teams');
        const teams     = teamsResp.data.data; 
        dispatch({ type: 'SET_TEAMS', payload: teams });

        // 2) Fetch each team’s latest metrics
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

    loadAll();
  }, [dispatch]);

  if (loading) return <Loader />;
  if (error)   return <p className={styles.pmError}>{error}</p>;

  return (
    <div className={styles.pmContainer}>
      {metricsList.map(({ team, metrics }) => {
        const data = [
          { name: 'Bugs Logged',         value: metrics.bugsLogged },
          { name: 'Bugs Resolved',       value: metrics.bugsResolvedCount },
          { 
            name: 'Avg Resolution (h)',  
            value: Number(metrics.avgResolutionTimeHours.toFixed(2))
          },
          { name: 'Test Exec',           value: metrics.testCasesExecuted },
          { 
            name: 'Pass Rate (%)',      
            value: Number((metrics.testPassRate * 100).toFixed(1))
          }
        ];

        return (
          <section key={team._id} className={styles.teamPanel}>
            <h2 className={styles.teamTitle}>{team.name} Metrics</h2>
            <div style={{ width: '100%', overflow: 'hidden' }}>
              <ResponsiveContainer width={700} height={400}>
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
