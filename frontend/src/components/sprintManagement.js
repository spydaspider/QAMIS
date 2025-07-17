// src/components/ManageSprints.js
import { useState, useEffect } from 'react';
import { useAuthContext } from '../hooks/useAuthContext';
import { useSprintContext } from '../hooks/useSprintContext';
import styles from './sprintManagement.module.css';

const ManageSprints = () => {
  const { sprints = [], dispatch } = useSprintContext();
  const { user } = useAuthContext();
  const [form, setForm] = useState({ name: '', periodStart: '', periodEnd: '', codeSizeKloc: '' });
  const [editingId, setEditingId] = useState(null);
  const [error, setError] = useState(null);
  const [teamId, setTeamId] = useState('');

  useEffect(() => {
    if (!user) return;
    const { userId } = JSON.parse(localStorage.getItem('user'));

    // determine team from user token/profile
    fetch('/api/teams', { headers: { Authorization: `Bearer ${user.token}` } })
      .then(res => res.json())
      .then(data => {
        const teams = data.data || [];
        const team = teams.find(t => Array.isArray(t.students) && t.students.some(s => s._id === userId));
        if (team) setTeamId(team._id);
      })
      .catch(() => {});

    // load sprints for team
    if (teamId) {
      fetch(`/api/sprints?team=${teamId}`, { headers: { Authorization: `Bearer ${user.token}` } })
        .then(res => res.json())
        .then(data => dispatch({ type: 'SET_SPRINTS', payload: data }))
        .catch(err => setError(err.message));
    }
  }, [user, teamId, dispatch]);

  const handleChange = e => {
    const { name, value } = e.target;
    setForm(prev => ({ ...prev, [name]: value }));
  };

  const resetForm = () => {
    setForm({ name: '', periodStart: '', periodEnd: '', codeSizeKloc: '' });
    setEditingId(null);
    setError(null);
  };

  const handleSubmit = async e => {
    e.preventDefault();
    setError(null);
    if (!teamId) return setError('Team not determined.');
    const payload = { ...form, team: teamId };
    try {
      const url = editingId ? `/api/sprints/${editingId}` : '/api/sprints';
      const method = editingId ? 'PUT' : 'POST';
      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${user.token}` },
        body: JSON.stringify(payload)
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error || 'Failed');
      dispatch({ type: editingId ? 'UPDATE_SPRINT' : 'CREATE_SPRINT', payload: json });
      resetForm();
    } catch (err) {
      setError(err.message);
    }
  };

  const handleEdit = sprint => {
    setEditingId(sprint._id);
    setForm({ name: sprint.name, periodStart: sprint.periodStart.slice(0,10), periodEnd: sprint.periodEnd.slice(0,10), codeSizeKloc: sprint.codeSizeKloc });
  };

  const handleDelete = async id => {
    setError(null);
    try {
      const res = await fetch(`/api/sprints/${id}`, { method: 'DELETE', headers: { Authorization: `Bearer ${user.token}` } });
      if (res.status !== 204) {
        const json = await res.json(); throw new Error(json.error);
      }
      dispatch({ type: 'DELETE_SPRINT', payload: id });
      if (editingId === id) resetForm();
    } catch (err) {
      setError(err.message);
    }
  };

  return (
    <div className={styles.container}>
      {error && <div className={styles.error}>{error}</div>}
      <h2 className={styles.title}>{editingId ? 'Update Sprint' : 'New Sprint'}</h2>
      <div className={styles.listArea}>
        {sprints.map(s => (
          <div key={s._id} className={styles.groupCard}>
            <div className={styles.header}>
              <h3 className={styles.groupName}>{s.name}</h3>
              <button className={styles.removeBtn} onClick={() => handleDelete(s._id)}>×</button>
              <button className={styles.addBtn} onClick={() => handleEdit(s)}>Edit</button>
            </div>
            <p>Period: {new Date(s.periodStart).toLocaleDateString()} - {new Date(s.periodEnd).toLocaleDateString()}</p>
            <small>Size: {s.codeSizeKloc} KLOC</small>
          </div>
        ))}
      </div>
      <div className={styles.formArea}>
        <form className={styles.controls} onSubmit={handleSubmit}>
          <input className={styles.input} name="name" placeholder="Sprint Name" value={form.name} onChange={handleChange} required />
          <input className={styles.input} type="date" name="periodStart" value={form.periodStart} onChange={handleChange} required />
          <input className={styles.input} type="date" name="periodEnd" value={form.periodEnd} onChange={handleChange} required />
          <input className={styles.input} type="number" name="codeSizeKloc" placeholder="Code Size (KLOC)" value={form.codeSizeKloc} onChange={handleChange} required />
          <button className={styles.button} type="submit">{editingId ? 'Update' : 'Create'}</button>
        </form>
      </div>
    </div>
  );
};

export default ManageSprints;
