import { useState, useEffect } from 'react';
import { useLogBugContext } from '../hooks/useLogBugContext';
import { useAuthContext } from '../hooks/useAuthContext';
import styles from './logBug.module.css';
import Loader from './loader';

const LogBug = () => {
  const { bugs = [], dispatch } = useLogBugContext();
  const { user } = useAuthContext();

  const [form, setForm] = useState({
    title: '',
    description: '',
    severity: 'medium',
    reproductionSteps: []
  });

  const [screenshots, setScreenshots] = useState([]);
  const [previews, setPreviews] = useState([]);

  const [editingId, setEditingId] = useState(null);
  const [error, setError] = useState(null);
  const [teamId, setTeamId] = useState('');
  const [teamName, setTeamName] = useState('');
  const [loading, setLoading] = useState(true);
  const [studentNoTeam, setStudentNoTeam] = useState(false);
  const [reporterName, setReporterName] = useState(null);

 
  useEffect(() => {
    if (!user) return;

    const userId = user.userId;
    let studentHasTeamCounter = 0;

    fetch('/api/teams', {
      headers: { Authorization: `Bearer ${user.token}` }
    })
      .then(res => res.json())
      .then(data => {
        const teams = data.data || [];
        const team = teams.find(
          t => t.students?.some(s => s._id === userId)
        );

        if (team) {
          setTeamId(team._id);
          setTeamName(team.name);
        }

        teams.forEach(t =>
          t.students?.forEach(s => {
            if (s._id === userId) studentHasTeamCounter = 1;
          })
        );

        if (!studentHasTeamCounter) setStudentNoTeam(true);
      })
      .catch(() => {})
      .finally(() => setLoading(false));

    fetch('/api/logBug', {
      headers: { Authorization: `Bearer ${user.token}` }
    })
      .then(res => res.json())
      .then(data => {
        const allBugs = Array.isArray(data) ? data : data.data;
        dispatch({
          type: 'SET_BUGS',
          payload: allBugs.filter(b => b.reporter._id === userId)
        });
      })
      .catch(() => dispatch({ type: 'SET_BUGS', payload: [] }));
  }, [user, dispatch]);

  const handleChange = e => {
    const { name, value } = e.target;
    setForm(prev => ({ ...prev, [name]: value }));
  };

  const handleAddStep = () => {
    setForm(prev => ({
      ...prev,
      reproductionSteps: [
        ...prev.reproductionSteps,
        { stepNumber: prev.reproductionSteps.length + 1, action: '' }
      ]
    }));
  };

  const handleStepChange = (idx, val) => {
    setForm(prev => ({
      ...prev,
      reproductionSteps: prev.reproductionSteps.map((s, i) =>
        i === idx ? { ...s, action: val } : s
      )
    }));
  };

  const handleRemoveStep = idx => {
    setForm(prev => ({
      ...prev,
      reproductionSteps: prev.reproductionSteps
        .filter((_, i) => i !== idx)
        .map((s, i) => ({ ...s, stepNumber: i + 1 }))
    }));
  };

  /* --------------------------------------------------- */
  /* SCREENSHOTS                                        */
  /* --------------------------------------------------- */

  const handleFileChange = e => {
    const files = Array.from(e.target.files);
    setScreenshots(files);
    setPreviews(files.map(file => URL.createObjectURL(file)));
  };

  useEffect(() => {
    return () => previews.forEach(URL.revokeObjectURL);
  }, [previews]);

  /* --------------------------------------------------- */
  /* SUBMIT                                             */
  /* --------------------------------------------------- */

  const handleSubmit = async e => {
    e.preventDefault();
    setError(null);

    if (!teamId) return setError('Team not found.');
    if (!form.reproductionSteps.length) return setError('Add reproduction steps.');

    const formData = new FormData();
    formData.append('title', form.title);
    formData.append('description', form.description);
    formData.append('severity', form.severity);
    formData.append('team', teamId);
    formData.append(
      'reproductionSteps',
      JSON.stringify(form.reproductionSteps)
    );

    screenshots.forEach(file =>
      formData.append('screenshots', file)
    );

    try {
      const url = editingId ? `/api/logBug/${editingId}` : '/api/logBug';
      const method = editingId ? 'PUT' : 'POST';

      const res = await fetch(url, {
        method,
        headers: { Authorization: `Bearer ${user.token}` },
        body: formData
      });

      const json = await res.json();
      if (!res.ok) throw new Error(json.error);

      setReporterName(json.reporter.username);

      dispatch({
        type: editingId ? 'UPDATE_BUG' : 'CREATE_BUG',
        payload: {
          ...json,
          reporter: {
            ...json.reporter,
            _id: user.userId,
            username: user.username
          }
        }
      });

      setForm({ title: '', description: '', severity: 'medium', reproductionSteps: [] });
      setScreenshots([]);
      setPreviews([]);
      setEditingId(null);
    } catch (err) {
      setError(err.message);
    }
  };

  /* --------------------------------------------------- */
  /* ACTIONS                                            */
  /* --------------------------------------------------- */

  const handleEdit = bug => {
    setEditingId(bug._id);
    setForm({
      title: bug.title,
      description: bug.description,
      severity: bug.severity,
      reproductionSteps: bug.reproductionSteps
    });
    setPreviews(bug.screenshots?.map(s => s.imageUrl) || []);
  };

  const handleDelete = async id => {
    try {
      await fetch(`/api/logBug/${id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${user.token}` }
      });
      dispatch({ type: 'DELETE_BUG', payload: id });
      if (editingId === id) setEditingId(null);
    } catch {}
  };

  const handleStatusChange = async (id, status) => {
    const res = await fetch(`/api/logBug/${id}/status`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${user.token}`
      },
      body: JSON.stringify({ status })
    });
    dispatch({ type: 'UPDATE_BUG', payload: await res.json() });
  };

  /* --------------------------------------------------- */
  /* RENDER                                             */
  /* --------------------------------------------------- */

  if (studentNoTeam)
    return <h1>You are not assigned to a team yet.</h1>;
  if (loading) return <Loader />;

  return (
    <div className={styles.container}>
      {error && <div className={styles.error}>{error}</div>}

      <form onSubmit={handleSubmit} className={styles.controls}>
        <input name="title" value={form.title} onChange={handleChange} placeholder="Title" required />
        <input name="description" value={form.description} onChange={handleChange} placeholder="Description" required />
        <select name="severity" value={form.severity} onChange={handleChange}>
          <option value="low">Low</option>
          <option value="medium">Medium</option>
          <option value="high">High</option>
          <option value="critical">Critical</option>
        </select>

        <input type="file" multiple accept="image/*" onChange={handleFileChange} />

        {previews.length > 0 && (
          <div className={styles.screenshotGrid}>
            {previews.map((src, i) => (
              <img key={i} src={src} className={styles.screenshot} />
            ))}
          </div>
        )}

        {form.reproductionSteps.map((step, i) => (
          <input
            key={i}
            value={step.action}
            onChange={e => handleStepChange(i, e.target.value)}
            placeholder={`Step ${i + 1}`}
          />
        ))}

        <button type="button" onClick={handleAddStep}>Add Step</button>
        <button type="submit">{editingId ? 'Update Bug' : 'Log Bug'}</button>
      </form>

      {bugs.map(bug => (
        <div key={bug._id} className={styles.groupCard}>
          <h3>{bug.title}</h3>
          <p>{bug.description}</p>

          {bug.screenshots?.length > 0 && (
            <div className={styles.screenshotGrid}>
              {bug.screenshots.map((s, i) => (
                <img key={i} src={s.imageUrl} className={styles.screenshot} />
              ))}
            </div>
          )}

          <select
            value={bug.currentStatus}
            onChange={e => handleStatusChange(bug._id, e.target.value)}
          >
            <option value="open">Open</option>
            <option value="in review">In Review</option>
            <option value="resolved">Resolved</option>
            <option value="closed">Closed</option>
          </select>

          <button onClick={() => handleEdit(bug)}>Edit</button>
          <button onClick={() => handleDelete(bug._id)}>Delete</button>
        </div>
      ))}
    </div>
  );
};

export default LogBug;
