import { useState, useEffect, useContext } from 'react';
import { useAuthContext } from '../hooks/useAuthContext';
import { DiscussionContext } from '../context/discussionThreadContext.js';
import DiscussionThread from './discussionThread.js';
import styles from './myBugs.module.css';
import Loader from './loader.js';

export default function BugList() {
  const { user } = useAuthContext();
  const { threads, dispatch } = useContext(DiscussionContext);

  const [bugs, setBugs] = useState([]);
  const [error, setError] = useState(null);
  const [visible, setVisible] = useState({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;

    (async () => {
      try {
        // Fetch bugs
        const bRes = await fetch('/api/logBug', {
          headers: { Authorization: `Bearer ${user.token}` }
        });

        const bData = await bRes.json();
        if (!bRes.ok) throw new Error(bData.message || 'Failed to load bugs');
        setBugs(bData);

        // Fetch discussion threads
        const tRes = await fetch(
          '/api/discussionThread?parentType=Bug',
          { headers: { Authorization: `Bearer ${user.token}` } }
        );

        const tData = await tRes.json();
        if (!tRes.ok) throw new Error(tData.message || 'Failed to load threads');

        tData.threads.forEach(thread => {
          dispatch({
            type: 'SET_THREAD',
            parentId: thread.parentId,
            payload: thread
          });
        });
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    })();
  }, [user, dispatch]);

  const toggleDiscussion = id => {
    setVisible(v => ({ ...v, [id]: !v[id] }));
  };

  if (!user) return <p>Please log in to view bugs.</p>;
  if (loading) return <Loader />;

  return (
    <div className={styles.feed}>
      {error && <div className={styles.error}>{error}</div>}

      {bugs.map(bug => (
        <div key={bug._id} className={styles.bugCard}>
          {/* Header */}
          <div className={styles.header}>
            <h3 className={styles.title}>{bug.title}</h3>
            <p className={styles.meta}>
              Reported by{' '}
              <strong>{bug.reporter?.username || 'Unknown'}</strong>
              {' • '}
              Team: <em>{bug.team?.name || 'N/A'}</em>
            </p>
          </div>

          {/* Description */}
          <p className={styles.description}>{bug.description}</p>

          {/* Screenshot (social-media style) */}
          {bug.screenshots?.length > 0 && (
            <div className={styles.imageWrapper}>
              <img
                src={bug.screenshots[0].imageUrl}
                alt="Bug screenshot"
                className={styles.bugImage}
                loading="lazy"
              />
            </div>
          )}

          {/* Discussion toggle */}
          <button
            onClick={() => toggleDiscussion(bug._id)}
            className={styles.toggleBtn}
          >
            {visible[bug._id] ? 'Hide Discussion' : 'Show Discussion'}
          </button>

          {/* Discussion thread */}
          {visible[bug._id] && (
            <div className={styles.threadWrapper}>
              <DiscussionThread
                parentType="Bug"
                parentId={bug._id}
              />
            </div>
          )}
        </div>
      ))}
    </div>
  );
}
