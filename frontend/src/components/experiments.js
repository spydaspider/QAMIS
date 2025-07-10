import { useState, useEffect } from 'react';
import styles from './experiments.module.css';
import { useExperimentsContext } from '../hooks/useExperimentsContext';
import { useAuthContext } from '../hooks/useAuthContext';

const ManageExperiments = () => {
  const { experiments, dispatch } = useExperimentsContext();
  const { user } = useAuthContext();

  const [form, setForm] = useState({
    title: '',
    description: '',
    methodology: '',
    startDate: '',
    endDate: ''
  });
  const [editingId, setEditingId] = useState(null);
  const [error, setError] = useState(null);

  // Helper to render “July 1, 2025” style
  const formatDate = iso => 
    new Date(iso).toLocaleDateString('en-GB', {
      day:   'numeric',
      month: 'long',
      year:  'numeric'
    });

  // fetch experiments
  useEffect(() => {
    const fetchExperiments = async () => {
      try {
        const res = await fetch('/api/experiments', {
          headers: { 'Authorization': `Bearer ${user.token}` }
        });
        const json = await res.json();
        if (res.ok) {
          dispatch({ type: 'SET_EXPERIMENTS', payload: json.data });
        } else {
          setError(json.error);
        }
      } catch {
        setError('Failed to fetch experiments');
      }
    };
    if (user) fetchExperiments();
  }, [user, dispatch]);

  const handleChange = e => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async e => {
    e.preventDefault();
    setError(null);

    const payload = {
      title: form.title,
      description: form.description,
      methodology: form.methodology,
      startDate: new Date(form.startDate).toISOString(),
      endDate: new Date(form.endDate).toISOString()
    };

    try {
      const res = await fetch(
        editingId ? `/api/experiments/${editingId}` : '/api/experiments',
        {
          method: editingId ? 'PATCH' : 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${user.token}`
          },
          body: JSON.stringify(payload)
        }
      );
      const json = await res.json();
      if (res.ok) {
        if (editingId) {
          dispatch({ type: 'UPDATE_EXPERIMENT', payload: json.data });
        } else {
          dispatch({ type: 'CREATE_EXPERIMENT', payload: json.data });
        }
        setForm({ title: '', description: '', methodology: '', startDate: '', endDate: '' });
        setEditingId(null);
      } else {
        setError(json.error);
      }
    } catch {
      setError('Failed to submit experiment');
    }
  };

  const handleEdit = exp => {
    setEditingId(exp._id);
    setForm({
      title: exp.title,
      description: exp.description,
      methodology: exp.methodology,
      startDate: exp.startDate.slice(0, 10),
      endDate: exp.endDate.slice(0, 10)
    });
  };

  const handleDelete = async id => {
    try {
      const res = await fetch(`/api/experiments/${id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${user.token}` }
      });
      if (res.ok) {
        dispatch({ type: 'DELETE_EXPERIMENT', payload: id });
        if (editingId === id) {
          setEditingId(null);
          setForm({ title: '', description: '', methodology: '', startDate: '', endDate: '' });
        }
      } else {
        const err = await res.json();
        setError(err.error || 'Delete failed');
      }
    } catch {
      setError('Failed to delete experiment');
    }
  };

  const handleCancel = () => {
    setEditingId(null);
    setForm({ title: '', description: '', methodology: '', startDate: '', endDate: '' });
    setError(null);
  };

  return (
    <div className={styles.container}>
      {error && <div className={styles.error}>{error}</div>}

      <h2 className={styles.title}>Experiment Management</h2>

      {/* LEFT COLUMN: Experiment List */}
      <div className={styles.listArea}>
        {experiments.map(exp => (
          <div key={exp._id} className={styles.groupCard}>
            <div className={styles.header}>
              <h3 className={styles.groupName}>{exp.title}</h3>
              <span className={styles.methodology}>{exp.methodology}</span>
              <button
                className={styles.removeBtn}
                onClick={() => handleDelete(exp._id)}
              >
                ×
              </button>
              <button className={styles.button} onClick={() => handleEdit(exp)}>
                Edit
              </button>
            </div>
            <p>{exp.description}</p>
            <small>
              {formatDate(exp.startDate)} – {formatDate(exp.endDate)}
            </small>
          </div>
        ))}
      </div>

      {/* RIGHT COLUMN: Search + Form */}
      <div className={styles.formArea}>
        <div className={styles.searchBox}>
          <input
            className={styles.input}
            placeholder="Search experiments by title"
            onChange={e => {
              const term = e.target.value.toLowerCase();
              dispatch({
                type: 'SET_EXPERIMENTS',
                payload: experiments.filter(exp =>
                  exp.title.toLowerCase().includes(term)
                )
              });
            }}
          />
        </div>

        <form className={styles.controls} onSubmit={handleSubmit}>
          <input
            className={styles.input}
            name="title"
            placeholder="Title"
            value={form.title}
            onChange={handleChange}
            required
          />
          <input
            className={styles.input}
            name="description"
            placeholder="Description"
            value={form.description}
            onChange={handleChange}
            required
          />
          <input
            className={styles.input}
            name="methodology"
            placeholder="Methodology"
            value={form.methodology}
            onChange={handleChange}
            required
          />
          <input
            className={styles.input}
            type="date"
            name="startDate"
            value={form.startDate}
            onChange={handleChange}
            required
          />
          <input
            className={styles.input}
            type="date"
            name="endDate"
            value={form.endDate}
            onChange={handleChange}
            required
          />

          <button className={styles.button} type="submit">
            {editingId ? 'Update' : 'Add'} Experiment
          </button>

          {editingId && (
            <button
              type="button"
              className={styles.button}
              onClick={handleCancel}
              style={{ backgroundColor: '#ccc', marginLeft: '8px', color: '#000' }}
            >
              Cancel
            </button>
          )}
        </form>
      </div>
    </div>
  );
};

export default ManageExperiments;
