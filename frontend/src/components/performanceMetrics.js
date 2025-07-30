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

  // local state for the two teams & their metrics
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
        console.log(teamsResp.data.data);
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

  if (loading) return <Loader/>
  if (error)   return <p className={styles.pmError}>{error}</p>;

  return (
    <div className={styles.pmContainer}>
      {metricsList.map(({ team, metrics }) => {
        const data = [
          { name: 'Bugs Logged',        value: metrics.bugsLogged },
          { name: 'Bugs Resolved',      value: metrics.bugsResolvedCount },
          { 
            name: 'Avg Resolution (h)',
            value: Number(metrics.avgResolutionTimeHours.toFixed(2))
          },
          { name: 'Test Exec',          value: metrics.testCasesExecuted },
          { 
            name: 'Pass Rate (%)',
            value: Number((metrics.testPassRate * 100).toFixed(1))
          }
        ];

        return (
          <section key={team._id} className={styles.teamPanel}>
            <h2 className={styles.teamTitle}>{team.name} Metrics</h2>
            <ResponsiveContainer width="100%" height={250}>
              <BarChart
                data={data}
                margin={{ top: 10, right: 20, left: 0, bottom: 0 }}
              >
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Bar dataKey="value" fill="#0055ff" />
              </BarChart>
            </ResponsiveContainer>
          </section>
        );
      })}
    </div>
  );
};

export default ManagePerformanceMetrics;
