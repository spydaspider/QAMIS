// src/components/TestCaseExecution.jsx
import { useState, useEffect } from 'react';
import { useAuthContext } from '../hooks/useAuthContext';
import { useTestCasesContext } from '../hooks/useTestCasesContext';
import styles from './testCaseExecution.module.css';
import Loader from './loader';

const TestCaseExecution = () => {
  const { testCases, dispatch } = useTestCasesContext();
  const { user } = useAuthContext();

  // Fallback: parse from localStorage in case user is not in context
  const localUser = user || JSON.parse(localStorage.getItem('user'));

  const [selectedTeam, setSelectedTeam] = useState(null);
  const [error, setError] = useState(null);
  const [execForm, setExecForm] = useState({ status: 'not run', actualResult: '', comments: '' });
  const [editingExec, setEditingExec] = useState({ caseId: null, idx: null });
  const [loading, setLoading] = useState(true);
  const [studentNoTeam, setStudentNoTeam] = useState(false);

  // Fetch teams the user belongs to and auto-select
  useEffect(() => {
    if (!localUser) return;
    (async () => {
      try {
        const res = await fetch('/api/teams', { headers: { Authorization: `Bearer ${localUser.token}` } });
        const json = await res.json();

        if (res.ok && Array.isArray(json.data) && json.data.length) {
          let foundTeam = false;
          for (const team of json.data) {
            if (team.students.some(s => s._id === localUser.userId)) {
              setSelectedTeam(team._id);
              foundTeam = true;
              break;
            }
          }
          if (!foundTeam) {
            setStudentNoTeam(true);
          }
        }
      } catch {
        setError('Failed to fetch teams');
      } finally {
        setLoading(false);
      }
    })();
  }, [localUser]);

  // Fetch test cases for the selected team
  useEffect(() => {
    if (!localUser || !selectedTeam) return;
    setError(null);

    (async () => {
      try {
        const res = await fetch(`/api/testCases/team/${selectedTeam}`, {
          headers: { Authorization: `Bearer ${localUser.token}` }
        });
        const json = await res.json();
        if (res.ok) {
          dispatch({ type: 'SET_TESTCASES', payload: json });
        } else {
          setError(json.error);
        }
      } catch {
        setError('Failed to load test cases');
      } finally {
        setLoading(false);
      }
    })();
  }, [localUser, selectedTeam, dispatch]);

  const handleExecFormChange = e => {
    const { name, value } = e.target;
    setExecForm(prev => ({ ...prev, [name]: value }));
  };

  const submitExecution = async (tcId, idx = null) => {
    setError(null);
    try {
      let res, json;
      if (idx === null) {
        // New execution
        res = await fetch(`/api/testCases/${tcId}/executions`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${localUser.token}`
          },
          body: JSON.stringify({
            team: selectedTeam,
            executedBy: localUser.userId,
            ...execForm
          })
        });
      } else {
        // Update existing execution
        const targetCase = testCases.find(tc => tc._id === tcId);
        const updatedExecs = [...targetCase.executions];
        updatedExecs[idx] = { ...updatedExecs[idx], ...execForm, executedAt: new Date() };

        res = await fetch(`/api/testCases/${tcId}`, {
          method: 'PATCH',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${localUser.token}`
          },
          body: JSON.stringify({ executions: updatedExecs })
        });
      }

      json = await res.json();
      if (!res.ok) throw new Error(json.error);

      // Refresh list
      const refresh = await fetch(`/api/testCases/team/${selectedTeam}`, {
        headers: { Authorization: `Bearer ${localUser.token}` }
      });
      const refreshed = await refresh.json();
      dispatch({ type: 'SET_TESTCASES', payload: refreshed });

      setExecForm({ status: 'not run', actualResult: '', comments: '' });
      setEditingExec({ caseId: null, idx: null });
    } catch (err) {
      setError(err.message);
    }
  };

  const deleteExecution = async (tcId, idx) => {
    setError(null);
    try {
      const res = await fetch(`/api/testCases/${tcId}/executions/${idx}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${localUser.token}` }
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error);

      // Refresh list
      const refresh = await fetch(`/api/testCases/team/${selectedTeam}`, {
        headers: { Authorization: `Bearer ${localUser.token}` }
      });
      const refreshed = await refresh.json();
      dispatch({ type: 'SET_TESTCASES', payload: refreshed });
    } catch (err) {
      setError(err.message);
    }
  };

  const startEditExec = (tcId, idx) => {
    const exec = testCases.find(tc => tc._id === tcId).executions[idx];
    setExecForm({ status: exec.status, actualResult: exec.actualResult, comments: exec.comments });
    setEditingExec({ caseId: tcId, idx });
  };

  if (loading) return <Loader />;
  if (studentNoTeam) return <h1 className={styles.gridText}>You are not assigned to any group, speak to instructor.</h1>;

  return (
    <div className={styles.container}>
      {error && <div className={styles.error}>{error}</div>}
      <h2 className={styles.title}>Your Team’s Test Cases</h2>

      <div className={styles.listArea}>
        {testCases.map(tc => (
          <div key={tc._id} className={styles.card}>
            <h3 className={styles.caseTitle}>{tc.title}</h3>
            <p className={styles.caseDesc}>{tc.description}</p>

            {/* Show test case steps */}
            {tc.steps && tc.steps.length > 0 && (
              <div className={styles.stepsContainer}>
                <h4 className={styles.stepsTitle}>Steps:</h4>
                <ol className={styles.stepsList}>
                  {tc.steps.map((step, idx) => (
                    <li key={idx} className={styles.stepItem}>
                      <strong>Step {step.stepNumber || idx + 1}:</strong> {step.action}
                      <br />
                      <em>Expected:</em> {step.expectedResult}
                    </li>
                  ))}
                </ol>
              </div>
            )}

            {/* Show executions */}
            <ul className={styles.execList}>
              {tc.executions.map((ex, i) => (
                <li key={i} className={styles.execItem}>
                  <span>{ex.executedAt && new Date(ex.executedAt).toLocaleString()}</span>
                  <span>{ex.status.toUpperCase()}</span>
                  <span>{ex.actualResult}</span>
                  <span>
{/*                     {ex.executedBy?.name || localUser?.name || 'Unknown user'}
 */}                    {ex.team?.name ? ` (${ex.team.name})` : ''}
                  </span>
                  <button onClick={() => deleteExecution(tc._id, i)}>Remove</button>
                  <button onClick={() => startEditExec(tc._id, i)}>Edit</button>
                </li>
              ))}
            </ul>

            {/* Execution form */}
            <div className={styles.execForm}>
              <h4>{editingExec.caseId === tc._id ? 'Update' : 'Add'} Execution</h4>
              <select name="status" value={execForm.status} onChange={handleExecFormChange}>
                {['pass', 'fail', 'blocked', 'not run'].map(s => (
                  <option key={s} value={s}>{s}</option>
                ))}
              </select>
              <input
                name="actualResult"
                placeholder="Actual Result"
                value={execForm.actualResult}
                onChange={handleExecFormChange}
              />
              <input
                name="comments"
                placeholder="Comments"
                value={execForm.comments}
                onChange={handleExecFormChange}
              />
              <button
                onClick={() => submitExecution(tc._id, editingExec.caseId === tc._id ? editingExec.idx : null)}
              >
                {editingExec.caseId === tc._id ? 'Update' : 'Add'}
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default TestCaseExecution;
