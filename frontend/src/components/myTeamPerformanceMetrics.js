// src/components/MyTeamPerformanceMetrics.jsx
import React, { useState, useEffect, useContext } from 'react';
import axios from 'axios';
import { MyTeamPerformanceMetricsContext } from '../context/myTeamPerformanceMetricsContext';
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

const MyTeamPerformanceMetrics = () => {
  const { myTeam, myMetrics, dispatch } = useContext(MyTeamPerformanceMetricsContext);

  const [loading, setLoading]         = useState(true);
  const [error, setError]             = useState(null);
  const [calcLoading, setCalcLoading] = useState(false);

  // Load all teams and find the logged-in user's team
  const loadUserTeam = async (userId) => {
    setLoading(true);
    try {
      const resp = await axios.get('/api/teams'); // fetch all teams
      const teams = resp.data.data || resp.data; // adjust if your API wraps with .data
      let teamFound = "";

       for(let i = 0; i < teams.length; i++)
      {
        for(let j = 0; j < teams[i].students.length; j++)
        {
        
            if(teams[i].students[j]._id === userId)
           {
              teamFound = teams[i];
           }
          
        }
      } 
      
       
      // Find team containing this user (matching userId in members)
     /*  const foundTeam = teams.find(team =>
        team.members?.some(member => member.userId === userId)
      ); */

      if (teamFound) {
        dispatch({ type: 'SET_MY_TEAM', payload: teamFound });
      } else {
        setError('You are not assigned to any team');
      }
    } catch (err) {
      console.error(err);
      setError('Failed to load teams');
    } finally {
      setLoading(false);
    }
  };

  // Load metrics for the user's team
  const loadMetrics = async (teamId) => {
    if (!teamId) return;
    setLoading(true);
    try {
      const resp = await axios.get(`/api/teams/${teamId}/metrics/latest`);
      dispatch({ type: 'SET_MY_METRICS', payload: resp.data.metrics });
    } catch (err) {
      if (err.response?.status === 404) {
        dispatch({ type: 'SET_MY_METRICS', payload: null });
      } else {
        console.error(err);
        setError('Failed to load team metrics');
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const user = JSON.parse(localStorage.getItem('user'));
    if (user?.userId) {
      loadUserTeam(user.userId); // <-- FIX: use user.userId, not _id
    } else {
      setError('No logged-in user found');
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (myTeam?._id) {
      loadMetrics(myTeam._id);
    }
  }, [myTeam]);

  // Calculate metrics for the user's team
  const handleCalculate = async () => {
    if (!myTeam?._id) return;
    setCalcLoading(true);
    setError(null);
    try {
      await axios.post(`/api/teams/${myTeam._id}/metrics`);
      await loadMetrics(myTeam._id);
    } catch (err) {
      console.error(err);
      setError('Failed to calculate metrics');
    } finally {
      setCalcLoading(false);
    }
  };

  if (loading) return <Loader />;
  if (error)   return <p className={styles.pmError}>{error}</p>;

  const chartData = myMetrics ? [
    { name: 'Bugs Logged',       value: myMetrics.bugsLogged },
    { name: 'Bugs Resolved',     value: myMetrics.bugsResolvedCount },
    { name: 'Defect Density',    value: Number(myMetrics.defectDensity?.toFixed(2)) },
    { name: 'Avg Resolution (h)', value: Number(myMetrics.avgResolutionTimeHours?.toFixed(2)) },
    { name: 'Test Exec',         value: myMetrics.testCasesExecuted },
    { name: 'Pass Rate (%)',     value: Number((myMetrics.testPassRate * 100).toFixed(1)) }
  ] : [];

  return (
    <div className={styles.pmContainer}>
      <div className={styles.pmHeader}>
        <h1>My Team Performance Metrics</h1>
        <div className={styles.pmControls}>
          <button
            className={styles.pmButton}
            onClick={handleCalculate}
            disabled={calcLoading}
          >
            {calcLoading ? 'Calculating…' : 'Calculate Metrics'}
          </button>
        </div>
      </div>

      {myTeam && myMetrics && (
        <section className={styles.teamPanel}>
          <h2 className={styles.teamTitle}>{myTeam.name} Metrics</h2>
          <div style={{ width: '100%', overflow: 'hidden' }}>
            <ResponsiveContainer width={900} height={400}>
              <BarChart
                data={chartData}
                margin={{ top: 10, right: 20, left: 0, bottom: 0 }}
              >
                <defs>
                  <linearGradient id="myTeamBarGradient" x1="0" y1="0" x2="1" y2="0">
                    <stop offset="0%" stopColor="#009245" />
                    <stop offset="100%" stopColor="#FCEE21" />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Bar dataKey="value" fill="url(#myTeamBarGradient)" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </section>
      )}
    </div>
  );
};

export default MyTeamPerformanceMetrics;
