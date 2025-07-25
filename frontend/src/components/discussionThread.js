import { useState, useEffect } from 'react';
import { useAuthContext } from '../hooks/useAuthContext.js';
import { useDiscussionContext } from '../hooks/useDiscussionThreadContext.js';
import styles from './discussionThread.module.css';

// Now accepts an optional initialThreadId prop
const DiscussionThread = ({ parentType, parentId, initialThreadId }) => {
  const { thread, dispatch } = useDiscussionContext();
  const { user } = useAuthContext();
  const [formContent, setFormContent] = useState('');
  const [replyTo, setReplyTo] = useState(null);
  const [editingId, setEditingId] = useState(null);
  const [error, setError] = useState(null);

  // Load existing thread by ID or by parent reference if initialThreadId not provided
  useEffect(() => {
    const fetchThread = async () => {
      try {
        let url = `/api/discussionThread/${initialThreadId || thread?._id}`;
        if (!initialThreadId && !thread?._id) {
          // If no existing thread, skip
          return;
        }
        const res = await fetch(url, {
          headers: user
            ? { Authorization: `Bearer ${user.token}` }
            : {}
        });
        const data = await res.json();
        if (res.ok && data.success) {
          dispatch({ type: 'SET_THREAD', payload: data.thread });
        }
      } catch {
        // ignore fetch errors
      }
    };
    fetchThread();
  }, [initialThreadId, thread?._id, user, dispatch]);

  const createThread = async () => {
    setError(null);
    try {
      const res = await fetch('/api/discussionThread', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${user.token}`
        },
        body: JSON.stringify({ parentType, parentId })
      });
      const data = await res.json();
      if (!res.ok || !data.success) throw new Error(data.message);
      dispatch({ type: 'SET_THREAD', payload: data.thread });
    } catch (err) {
      setError(err.message);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formContent.trim()) return setError('Content cannot be empty');
    if (!thread?._id) return;
    setError(null);

    try {
      let url = `/api/discussionThread/${thread._id}/comments`;
      const method = replyTo ? 'POST' : 'POST';
      let endpoint = url;
      if (replyTo) {
        endpoint += `/${replyTo}/reply`;
      }
      const res = await fetch(endpoint, {
        method,
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${user.token}`
        },
        body: JSON.stringify({ content: formContent })
      });

      const data = await res.json();
      if (!res.ok || !data.success) throw new Error(data.message);

      if (replyTo) {
        dispatch({ type: 'ADD_REPLY', payload: { parentCommentId: replyTo, reply: data.reply } });
      } else {
        dispatch({ type: 'ADD_COMMENT', payload: data.comment });
      }

      setFormContent('');
      setReplyTo(null);
    } catch (err) {
      setError(err.message);
    }
  };

  const startReply = (id) => {
    setReplyTo(id);
    setEditingId(null);
    setError(null);
  };

  // Optionally implement editing when backend supports it

  // Delete the entire thread
  const handleDeleteThread = async () => {
    if (!thread?._id) return;
    try {
      const res = await fetch(
        `/api/discussionThread/${thread._id}`,
        {
          method: 'DELETE',
          headers: { Authorization: `Bearer ${user.token}` }
        }
      );
      if (res.status === 204) {
        dispatch({ type: 'CLEAR_THREAD' });
      } else {
        const data = await res.json();
        throw new Error(data.message);
      }
    } catch (err) {
      setError(err.message);
    }
  };

  if (!user) return <p>Please log in to view discussions.</p>;

  if (!thread) {
    return (
      <div className={styles.container}>
        {error && <div className={styles.error}>{error}</div>}
        <button onClick={createThread} className={styles.button}>
          Start Discussion
        </button>
      </div>
    );
  }

  const renderComments = (comments = [], level = 0) =>
    comments.map((c) => (
      <div
        key={c._id}
        className={styles.commentCard}
        style={{ marginLeft: level * 20 }}
      >
        <div className={styles.header}>
          <strong>{c.author?.name || 'Unknown'}</strong>
          <button onClick={() => startReply(c._id)} className={styles.smallBtn}>
            Reply
          </button>
        </div>
        <p>{c.content}</p>
        <small>{new Date(c.createdAt).toLocaleString()}</small>
        {renderComments(c.replies, level + 1)}
      </div>
    ));

  return (
    <div className={styles.container}>
      {error && <div className={styles.error}>{error}</div>}
      <div className={styles.headerBar}>
        <h2 className={styles.title}>Discussion</h2>
        <button onClick={handleDeleteThread} className={styles.smallBtn}>
          Delete Thread
        </button>
      </div>
      <div className={styles.threadArea}>{renderComments(thread.comments)}</div>

      <form className={styles.formArea} onSubmit={handleSubmit}>
        <textarea
          className={styles.textarea}
          value={formContent}
          placeholder={
            replyTo
              ? 'Write your reply…'
              : 'Write a comment…'
          }
          onChange={(e) => setFormContent(e.target.value)}
        />
        <button type="submit" className={styles.button}>
          {replyTo ? 'Reply' : 'Post'}
        </button>
      </form>
    </div>
  );
};

export default DiscussionThread;
