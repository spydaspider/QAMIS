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
        if (!res.ok) throw new Error(data.message || 'Failed to load bugs');
        setBugs(data || []);
      } catch (err) {
        setError(err.message);
      }
    })();
  }, [user]);

  if (!user) return <p>Please log in to view bugs.</p>;

  // Filter by title or description
  const filtered = bugs.filter(b =>
    b.title.toLowerCase().includes(filter.toLowerCase()) ||
    b.description.toLowerCase().includes(filter.toLowerCase())
  );

  return (
    <div className={styles.container}>
      {error && <div className={styles.error}>{error}</div>}

      {/* Search box for bugs */}
      <div className={styles.searchWrapper}>
        <input
          type="text"
          placeholder="Search bugs..."
          className={styles.search}
          value={filter}
          onChange={e => setFilter(e.target.value)}
        />
      </div>

      {filtered.map(bug => (
        <article key={bug._id} className={styles.postCard}>
          <header className={styles.postHeader}>
            <h3 className={styles.title}>{bug.title}</h3>
            <p className={styles.reporter}>
              Reported by <strong>{bug.reporter?.username || 'Unknown'}</strong>
            </p>
          </header>

          <section className={styles.postContent}>
            <p>{bug.description}</p>
          </section>

          <footer className={styles.postFooter}>
            <button
              className={styles.toggleBtn}
              onClick={() => setOpenBugId(openBugId === bug._id ? null : bug._id)}
            >
              {openBugId === bug._id ? 'Hide Discussion' : 'Open Discussion'}
            </button>
          </footer>

          {openBugId === bug._id && (
            <div className={styles.threadWrapper}>
              <DiscussionThread parentType="Bug" parentId={bug._id} />
            </div>
          )}
        </article>
      ))}
    </div>
  );
}
