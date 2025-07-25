import { useState, useEffect, useContext } from 'react';
import { useAuthContext } from '../hooks/useAuthContext';
import { DiscussionContext } from '../context/discussionThreadContext.js';
import DiscussionThread from './discussionThread.js';
import styles from './myBugs.module.css';

export default function BugList() {
  const { user }         = useAuthContext();
  const { threads, dispatch } = useContext(DiscussionContext);
  const [bugs, setBugs]    = useState([]);
  const [error, setError]  = useState(null);
  const [visible, setVisible] = useState({});

  useEffect(() => {
    console.log(user);
    if (!user) return;
    (async () => {
      try {
        // 1) fetch all bugs
        const bRes = await fetch('/api/logBug', {
          headers: { Authorization: `Bearer ${user.token}` }
        });
        const bData = await bRes.json();
        
        if (!bRes.ok) throw new Error(bData.message || 'Failed to load bugs');
        setBugs(bData);

        // 2) fetch all Bug‐threads in one go
        const tRes = await fetch(
          '/api/discussionThread?parentType=Bug',
          { headers: { Authorization: `Bearer ${user.token}` } }
        );
        const tData = await tRes.json();
        if (!tRes.ok) throw new Error(tData.message || 'Failed to load threads');

        // Key each thread by its parentId
        tData.threads.forEach(thread => {
          dispatch({
            type: 'SET_THREAD',
            parentId: thread.parentId,
            payload: thread
          });
        });
      } catch (err) {
        setError(err.message);
      }
    })();
  }, [user, dispatch]);

  const toggle = id => setVisible(v => ({ ...v, [id]: !v[id] }));

  if (!user) return <p>Please log in to view bugs.</p>;

  return (
    <div className={styles.feed}>
      {error && <div className={styles.error}>{error}</div>}
      {bugs.map(bug => (
        <div key={bug._id} className={styles.bugCard}>
          <div className={styles.header}>
            <h3 className={styles.title}>{bug.title}</h3>
            <p className={styles.meta}>
              Reported by <strong>{bug.reporter?.username || 'Unknown'}</strong>
              &nbsp;• Team: <em>{bug.team?.name || 'N/A'}</em>
            </p>
          </div>
          <p className={styles.description}>{bug.description}</p>

          <button
            onClick={() => toggle(bug._id)}
            className={styles.toggleBtn}
          >
            {visible[bug._id] ? 'Hide Discussion' : 'Show Discussion'}
          </button>

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
