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

  const [teams, setTeams]             = useState([]);
  const [selectedTeam, setSelectedTeam] = useState('');
  const [metrics, setMetrics]         = useState(null);
  const [loading, setLoading]         = useState(true);
  const [error, setError]             = useState(null);
  const [calcLoading, setCalcLoading] = useState(false);

  // Load all teams
  const loadTeams = async () => {
    setLoading(true);
    try {
      const teamsResp = await axios.get('/api/teams');
      const teamsData = teamsResp.data.data;
      setTeams(teamsData);
      dispatch({ type: 'SET_TEAMS', payload: teamsData });
    } catch (err) {
      console.error(err);
      setError('Failed to load teams');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadTeams();
  }, [dispatch]);

  // Load metrics for selected team
  const loadMetrics = async (teamId) => {
    if (!teamId) {
      setMetrics(null);
      return;
    }
    setLoading(true);
    try {
      const resp = await axios.get(`/api/teams/${teamId}/metrics/latest`);
      setMetrics(resp.data.metrics);
    } catch (err) {
      if (err.response?.status === 404) {
        setMetrics(null);
      } else {
        console.error(err);
        setError('Failed to load metrics for selected team');
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (selectedTeam) {
      loadMetrics(selectedTeam);
    }
  }, [selectedTeam]);

  // Calculate metrics for all teams
  const handleCalculateAll = async () => {
    setCalcLoading(true);
    setError(null);
    try {
      await Promise.all(
        teams.map(team =>
          axios.post(`/api/teams/${team._id}/metrics`)
        )
      );
      // Reload metrics for the selected team if one is chosen
      if (selectedTeam) {
        await loadMetrics(selectedTeam);
      }
    } catch (err) {
      console.error(err);
      setError('Failed to calculate metrics for all teams');
    } finally {
      setCalcLoading(false);
    }
  };

  if (loading) return <Loader />;
  if (error)   return <p className={styles.pmError}>{error}</p>;

  const chartData = metrics ? [
    { name: 'Bugs Logged',      value: metrics.bugsLogged },
    { name: 'Bugs Resolved',    value: metrics.bugsResolvedCount },
    { name: 'Defect Density',   value: Number(metrics.defectDensity?.toFixed(2)) },
    { name: 'Avg Resolution (h)', value: Number(metrics.avgResolutionTimeHours?.toFixed(2)) },
    { name: 'Test Exec',        value: metrics.testCasesExecuted },
    { name: 'Pass Rate (%)',    value: Number((metrics.testPassRate * 100).toFixed(1)) }
  ] : [];

  return (
    <div className={styles.pmContainer}>
      <div className={styles.pmHeader}>
        <h1>Team Performance Metrics</h1>
        <div className={styles.pmControls}>
          <select
            value={selectedTeam}
            onChange={e => setSelectedTeam(e.target.value)}
            className={styles.pmSelect}
          >
            <option value="">Select a team</option>
            {teams.map(team => (
              <option key={team._id} value={team._id}>
                {team.name}
              </option>
            ))}
          </select>
          <button
            className={styles.pmButton}
            onClick={handleCalculateAll}
            disabled={calcLoading}
          >
            {calcLoading ? 'Calculating…' : 'Calculate All Metrics'}
          </button>
        </div>
      </div>

      {metrics && (
        <section className={styles.teamPanel}>
          <h2 className={styles.teamTitle}>
            {teams.find(t => t._id === selectedTeam)?.name} Metrics
          </h2>
          <div style={{ width: '100%', overflow: 'hidden' }}>
            <ResponsiveContainer width={900} height={400}>
              <BarChart
                data={chartData}
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
      )}
    </div>
  );
};

export default ManagePerformanceMetrics;
