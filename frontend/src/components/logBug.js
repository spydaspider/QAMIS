// src/components/LogBug.js
import { useState, useEffect } from 'react';
import { useLogBugContext } from '../hooks/useLogBugContext';
import { useAuthContext } from '../hooks/useAuthContext';
import styles from './logBug.module.css';

const LogBug = () => {
  const { bugs = [], dispatch } = useLogBugContext();
  const { user } = useAuthContext();

  const [form, setForm] = useState({
    title: '',
    description: '',
    severity: 'medium',
    reproductionSteps: [],
    screenshots: []
  });
  const [editingId, setEditingId] = useState(null);
  const [error, setError] = useState(null);
  const [teamId, setTeamId] = useState('');
  const [teamName, setTeamName] = useState('');

  useEffect(() => {
    if (!user) return;
    const userId = JSON.parse(localStorage.getItem('user')).userId;

    // fetch all teams and find the one containing this student
    fetch('/api/teams', { headers: { Authorization: `Bearer ${user.token}` } })
      .then(res => res.json())
      .then(data => {
        const teams = data.data || [];
        const team = teams.find(t => Array.isArray(t.students) && t.students.some(s => s._id === userId));
        if (team) {
          setTeamId(team._id);
          setTeamName(team.name);
        }
      })
      .catch(() => {});

    // fetch bugs for this user
    fetch('/api/logBug', { headers: { Authorization: `Bearer ${user.token}` } })
      .then(res => res.json())
      .then(data => {
        const allBugs = Array.isArray(data) ? data : data.data;
        const bugsList = allBugs.filter(bug => bug?.reporter?._id === userId);
        dispatch({ type: 'SET_BUGS', payload: bugsList });
      })
      .catch(() => dispatch({ type: 'SET_BUGS', payload: [] }));
  }, [user, dispatch]);

  const handleChange = e => {
    const { name, value } = e.target;
    setForm(prev => ({ ...prev, [name]: value }));
  };

  const handleFiles = e => setForm(prev => ({ ...prev, screenshots: Array.from(e.target.files) }));

  const handleAddStep = () => {
    setForm(prev => ({
      ...prev,
      reproductionSteps: [...prev.reproductionSteps, { stepNumber: prev.reproductionSteps.length + 1, action: '' }]
    }));
  };

  const handleStepChange = (idx, val) => {
    setForm(prev => ({
      ...prev,
      reproductionSteps: prev.reproductionSteps.map((s, i) => (i === idx ? { ...s, action: val } : s))
    }));
  };

  const handleRemoveStep = idx => {
    setForm(prev => ({
      ...prev,
      reproductionSteps: prev.reproductionSteps.filter((_, i) => i !== idx).map((s, i) => ({ ...s, stepNumber: i + 1 }))
    }));
  };

  const handleSubmit = async e => {
    e.preventDefault();
    setError(null);
    const userId = JSON.parse(localStorage.getItem('user')).userId;

    if (!teamId) {
      setError('Cannot determine your team. Please contact your instructor.');
      return;
    }
    if (form.reproductionSteps.length === 0) {
      setError('Please add at least one reproduction step.');
      return;
    }
    for (const step of form.reproductionSteps) {
      if (!step.action.trim()) {
        setError('All reproduction steps must have an action description.');
        return;
      }
    }

    const payload = {
      title: form.title,
      description: form.description,
      severity: form.severity,
      reporter: userId,
      team: teamId,
      reproductionSteps: form.reproductionSteps,
      screenshots: form.screenshots
    };

    try {
      const url = editingId ? `/api/logBug/${editingId}` : '/api/logBug';
      const res = await fetch(url, {
        method: editingId ? 'PATCH' : 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${user.token}` },
        body: JSON.stringify(payload)
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error || 'Failed to save bug');
      dispatch({ type: editingId ? 'UPDATE_BUG' : 'CREATE_BUG', payload: json });
      setForm({ title: '', description: '', severity: 'medium', reproductionSteps: [], screenshots: [] });
      setEditingId(null);
    } catch (err) {
      setError(err.message);
    }
  };

  const handleStatusChange = async (bugId, newStatus) => {
    setError(null);
    try {
      const res = await fetch(`/api/logBug/${bugId}/status`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${user.token}` },
        body: JSON.stringify({ status: newStatus, comment: '' })
      });
      const updated = await res.json();
      if (!res.ok) throw new Error(updated.error || 'Status update failed');
      dispatch({ type: 'UPDATE_BUG', payload: updated });
    } catch (err) {
      setError(err.message);
    }
  };

  const handleDelete = async id => {
    setError(null);
    try {
      const res = await fetch(`/api/logBug/${id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${user.token}` }
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error || 'Delete failed');
      dispatch({ type: 'DELETE_BUG', payload: id });
      if (editingId === id) setEditingId(null);
    } catch (err) {
      setError(err.message);
    }
  };

  const handleEdit = bug => {
    setEditingId(bug._id);
    setForm({
      title: bug.title,
      description: bug.description,
      severity: bug.severity,
      reproductionSteps: bug.reproductionSteps,
      screenshots: bug.screenshots || []
    });
    setError(null);
  };

  return (
    <div className={styles.container}>
      {error && <div className={styles.error}>{error}</div>}
      <h2 className={styles.title}>{editingId ? 'Update Bug' : 'Log Bug'}</h2>
      {teamId ? (
        <div style={{ marginBottom: '8px', color: '#333' }}><strong>Team:</strong> {teamName} (ID: {teamId})</div>
      ) : (
        <div style={{ marginBottom: '8px', color: '#cc0000' }}><em>Team not yet determined</em></div>
      )}

      <div className={styles.listArea}>
        {bugs.length === 0 ? (
          <div className={styles.message}>No bugs found.</div>
        ) : (
          bugs.map(bug => (
            <div key={bug._id} className={styles.groupCard}>
              <div className={styles.header}>
                <h3 className={styles.groupName}>{bug.title}</h3>
                <select className={styles.statusSelect} value={bug.currentStatus} onChange={e => handleStatusChange(bug._id, e.target.value)}>
                  <option value="open">Open</option>
                  <option value="in-progress">In Progress</option>
                  <option value="resolved">Resolved</option>
                  <option value="closed">Closed</option>
                </select>
                <button className={styles.removeBtn} onClick={() => handleDelete(bug._id)}>×</button>
                <button className={styles.addStepBtn} onClick={() => handleEdit(bug)}>Edit</button>
              </div>
              <p>{bug.description}</p>
              <small>Severity: {bug.severity}</small>
              {bug.reproductionSteps.length > 0 && (
                <ul>
                  {bug.reproductionSteps.map(s => <li key={s.stepNumber}>{`${s.stepNumber}. ${s.action}`}</li>)}
                </ul>
              )}
              {bug.screenshots?.length > 0 && (
                <div className={styles.previewArea}>
                  {bug.screenshots.map((url, i) => <img key={i} src={url} alt={`screenshot-${i}`} className={styles.previewImg} />)}
                </div>
              )}
            </div>
          ))
        )}
      </div>

      <div className={styles.formArea}>
        <form className={styles.controls} onSubmit={handleSubmit}>
          <input className={styles.input} name="title" placeholder="Title" value={form.title} onChange={handleChange} required />
          <input className={styles.input} name="description" placeholder="Description" value={form.description} onChange={handleChange} required />
          <select className={styles.input} name="severity" value={form.severity} onChange={handleChange}>
            <option value="low">Low</option>
            <option value="medium">Medium</option>
            <option value="high">High</option>
            <option value="critical">Critical</option>
          </select>
          <div>
            <label>Upload Screenshots:</label>
            <input type="file" multiple className={styles.fileInput} onChange={handleFiles} />
          </div>
          <div className={styles.stepList}>
            {form.reproductionSteps.map((step, idx) => (
              <div key={idx} className={styles.stepItem}>
                <input className={styles.stepInput} placeholder="Action" value={step.action} onChange={e => handleStepChange(idx, e.target.value)} required />
                <button type="button" className={styles.removeBtn} onClick={() => handleRemoveStep(idx)}>−</button>
              </div>
            ))}
            <button type="button" className={styles.addStepBtn} onClick={handleAddStep}>Add Step</button>
          </div>
          <button className={styles.submitBtn} type="submit">{editingId ? 'Update Bug' : 'Log Bug'}</button>
        </form>
      </div>
    </div>
  );
};

export default LogBug;
