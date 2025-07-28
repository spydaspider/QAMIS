import { useState, useEffect } from 'react';
import { useTestCasesContext } from '../hooks/useTestCasesContext';
import { useAuthContext } from '../hooks/useAuthContext';
import styles from './testCase.module.css';
import Loader from './loader';

const ManageTestCases = () => {
  const { testCases = [], dispatch } = useTestCasesContext();
  const { user } = useAuthContext();

  const [teamsList, setTeamsList] = useState([]);
  const [form, setForm] = useState({
    title: '',
    description: '',
    assignedTeams: [],
    steps: []
  });
  const [editingId, setEditingId] = useState(null);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(true);

  // Fetch existing test cases
  useEffect(() => {
    if (!user) return;
    (async () => {
      try {
        const res = await fetch('/api/testCases', {
          headers: { Authorization: `Bearer ${user.token}` }
        });
        const json = await res.json();
        if (res.ok) dispatch({ type: 'SET_TESTCASES', payload: json });
        else setError(json.error);
      } catch {
        setError('Failed to fetch test cases');
      }
      finally{
        setLoading(false);
      }
    })();
  }, [user, dispatch]);

  // Fetch available teams
  useEffect(() => {
    if (!user) return;
    (async () => {
      try {
        const res = await fetch('/api/teams', {
          headers: { Authorization: `Bearer ${user.token}` }
        });
        const json = await res.json();
        if (res.ok) setTeamsList(json.data);
      } catch {
        // ignore
      }
    })();
  }, [user]);

  const handleChange = e => {
    const { name, value } = e.target;
    setForm(prev => ({ ...prev, [name]: value }));
  };

  const handleTeamSelect = e => {
    const selected = Array.from(e.target.selectedOptions).map(o => o.value);
    setForm(prev => ({ ...prev, assignedTeams: selected }));
  };

  const handleAddStep = () => {
    setForm(prev => ({
      ...prev,
      steps: [...prev.steps, { stepNumber: prev.steps.length + 1, action: '', expectedResult: '' }]
    }));
  };

  const handleStepChange = (idx, field, val) => {
    setForm(prev => ({
      ...prev,
      steps: prev.steps.map((s, i) => (i === idx ? { ...s, [field]: val } : s))
    }));
  };

  const handleRemoveStep = idx => {
    setForm(prev => ({
      ...prev,
      steps: prev.steps.filter((_, i) => i !== idx).map((s, i) => ({ ...s, stepNumber: i + 1 }))
    }));
  };

  const handleSubmit = async e => {
    e.preventDefault();
    setError(null);
    const { userId } = JSON.parse(localStorage.getItem('user'));
    const payload = { ...form, author: userId };

    try {
      const url = editingId ? `/api/testCases/${editingId}` : '/api/testCases';
      const method = editingId ? 'PATCH' : 'POST';
      const res = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${user.token}`
        },
        body: JSON.stringify(payload)
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error);

      let updatedCase = json;
      if (editingId) {
        updatedCase.assignedTeams = teamsList.filter(team => form.assignedTeams.includes(team._id));
        updatedCase.steps = form.steps;
      }
      dispatch({ type: editingId ? 'UPDATE_TESTCASE' : 'CREATE_TESTCASE', payload: updatedCase });
      setForm({ title: '', description: '', assignedTeams: [], steps: [] });
      setEditingId(null);
    } catch (err) {
      setError(err.message || 'Failed to submit test case');
    }
  };

  const handleEdit = tc => {
    setEditingId(tc._id);
    setForm({
      title: tc.title,
      description: tc.description,
      assignedTeams: tc.assignedTeams.map(t => t._id),
      steps: tc.steps
    });
    setError(null);
  };

  const handleDelete = async id => {
    setError(null);
    try {
      const res = await fetch(`/api/testCases/${id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${user.token}` }
      });
      if (!res.ok) {
        const json = await res.json();
        throw new Error(json.error || 'Delete failed');
      }
      dispatch({ type: 'DELETE_TESTCASE', payload: id });
      if (editingId === id) {
        setEditingId(null);
        setForm({ title: '', description: '', assignedTeams: [], steps: [] });
      }
    } catch (err) {
      setError(err.message);
    }
  };

  const handleCancel = () => {
    setEditingId(null);
    setForm({ title: '', description: '', assignedTeams: [], steps: [] });
    setError(null);
  };
  if(loading) return <Loader/>
  return (
    <div className={styles.container}>
      {error && <div className={styles.error}>{error}</div>}
      <h2 className={styles.title}>Test Case Management</h2>
      <div className={styles.listArea}>
        {testCases.length > 0 ? (
          testCases.map(tc => (
            <div key={tc._id} className={styles.groupCard}>
              <div className={styles.header}>
                <h3 className={styles.groupName}>{tc.title}</h3>
                <button className={styles.removeBtn} onClick={() => handleDelete(tc._id)}>×</button>
                <button className={styles.button} onClick={() => handleEdit(tc)}>Edit</button>
              </div>
              <p>{tc.description}</p>
              <small>Teams: {tc.assignedTeams.map(team => team.name).join(', ')}</small>
              {tc.steps.length > 0 && (
                <ul>
                  {tc.steps.map(s => (
                    <li key={s.stepNumber}>{`${s.stepNumber}. ${s.action} → ${s.expectedResult}`}</li>
                  ))}
                </ul>
              )}
            </div>
          ))
        ) : (
          <div className={styles.emptyMessage}>No test cases available.</div>
        )}
      </div>
      <div className={styles.formArea}>
        <form className={styles.controls} onSubmit={handleSubmit}>
          <input className={styles.input} name="title" placeholder="Title" value={form.title} onChange={handleChange} required />
          <input className={styles.input} name="description" placeholder="Description" value={form.description} onChange={handleChange} required />
          <select multiple className={styles.select} value={form.assignedTeams} onChange={handleTeamSelect}>
            {teamsList.map(team => <option key={team._id} value={team._id}>{team.name}</option>)}
          </select>
          <div className={styles.stepList}>
            {form.steps.map((step, idx) => (
              <div key={idx} className={styles.stepItem}>
                <input className={styles.stepInput} placeholder="Action" value={step.action} onChange={e => handleStepChange(idx, 'action', e.target.value)} required />
                <input className={styles.stepInput} placeholder="Expected Result" value={step.expectedResult} onChange={e => handleStepChange(idx, 'expectedResult', e.target.value)} required />
                <button type="button" className={styles.removeBtn} onClick={() => handleRemoveStep(idx)}>−</button>
              </div>
            ))}
            <button type="button" className={styles.addStepBtn} onClick={handleAddStep}>Add Step</button>
          </div>
          <button className={styles.button} type="submit">{editingId ? 'Update' : 'Create'} Test Case</button>
          {editingId && <button type="button" className={styles.button} onClick={handleCancel}>Cancel</button>}
        </form>
      </div>
    </div>
  );
};

export default ManageTestCases;
