// src/components/BugList.js
import { useState, useEffect } from 'react';
import { useAuthContext } from '../hooks/useAuthContext';
import DiscussionThread from './discussionThread';
import styles from './myBugs.module.css';

export default function BugList() {
  const { user } = useAuthContext();
  const [bugs, setBugs] = useState([]);
  const [error, setError] = useState(null);
  const [openBugId, setOpenBugId] = useState(null);
  const [filter, setFilter] = useState('');

  // Fetch all bugs
  useEffect(() => {
    if (!user) return;
    (async () => {
      try {
        const res = await fetch('/api/logBug', {
          headers: { Authorization: `Bearer ${user.token}` }
        });
        const data = await res.json();
        console.log(data);
        if (!res.ok) throw new Error(data.message || 'Failed to load bugs');
        setBugs(data || []);
      } catch (err) {
        setError(err.message);
      }
    })();
  }, [user]);

  if (!user) return <p>Please log in to view bugs.</p>;

  // Filter by title or description (case insensitive)
  const filtered = bugs.filter(b =>
    b.title.toLowerCase().includes(filter.toLowerCase()) ||
    b.description.toLowerCase().includes(filter.toLowerCase())
  );

  return (
    <div className={styles.container}>
      {error && <div className={styles.error}>{error}</div>}

      {/* Search box */}
      <input
        type="text"
        placeholder="Search bugs..."
        className={styles.search}
        value={filter}
        onChange={e => setFilter(e.target.value)}
      />

      {filtered.length === 0 && (
        <p className={styles.noResults}>
          {filter ? 'No bugs match your search.' : 'No bugs reported yet.'}
        </p>
      )}

      {filtered.map(bug => (
        <div key={bug._id} className={styles.card}>
          <h3 className={styles.title}>{bug.title}</h3>
          <p className={styles.reporter}>
            Reported by: <strong>{bug.reporter?.username || 'Unknown'}</strong>
          </p>
          <p className={styles.description}>{bug.description}</p>
          <button
            className={styles.toggleBtn}
            onClick={() =>
              setOpenBugId(openBugId === bug._id ? null : bug._id)
            }
          >
            {openBugId === bug._id ? 'Hide Discussion' : 'Open Discussion'}
          </button>
          {openBugId === bug._id && (
            <DiscussionThread parentType="Bug" parentId={bug._id} />
          )}
        </div>
      ))}
    </div>
  );
}
