


// Component: DiscussionThread.js
import { useState, useEffect } from 'react';
import { useAuthContext } from '../hooks/useAuthContext';
import { useDiscussionContext } from '../hooks/useDiscussionThreadContext';
import styles from './studentDiscussion.module.css';

const DiscussionThread = ({ threadId }) => {
  const { thread, dispatch } = useDiscussionContext();
  const { user } = useAuthContext();
  const [formContent, setFormContent] = useState('');
  const [editingId, setEditingId] = useState(null);
  const [error, setError] = useState(null);

  // Fetch thread
  useEffect(() => {
    if (!user || !threadId) return;
    const fetchThread = async () => {
      try {
        const res = await fetch(`/api/threads/${threadId}`, {
          headers: { Authorization: `Bearer ${user.token}` }
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.message || 'Failed to load thread');
        dispatch({ type: 'SET_THREAD', payload: data.thread });
      } catch (err) {
        setError(err.message);
      }
    };
    fetchThread();
  }, [user, threadId, dispatch]);

  const resetForm = () => {
    setFormContent('');
    setEditingId(null);
    setError(null);
  };

  const handleSubmit = async e => {
    e.preventDefault();
    setError(null);
    if (!formContent) return setError('Content cannot be empty');
    try {
      let res, data;
      if (editingId) {
        // Update comment: backend lacking update endpoint so simulate via delete+add or PATCH if exists
        res = await fetch(`/api/threads/${threadId}/comments/${editingId}`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${user.token}`
          },
          body: JSON.stringify({ content: formContent })
        });
        data = await res.json();
        if (!res.ok) throw new Error(data.message || 'Update failed');
        dispatch({ type: 'UPDATE_COMMENT', payload: data.comment });
      } else {
        res = await fetch(`/api/threads/${threadId}/comments`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${user.token}`
          },
          body: JSON.stringify({ author: user.userId, content: formContent })
        });
        data = await res.json();
        if (!res.ok) throw new Error(data.message || 'Create failed');
        dispatch({ type: 'ADD_COMMENT', payload: data.thread.comments.slice(-1)[0] });
      }
      resetForm();
    } catch (err) {
      setError(err.message);
    }
  };

  const handleEdit = comment => {
    setEditingId(comment._id);
    setFormContent(comment.content);
    setError(null);
  };

  const handleDelete = async id => {
    setError(null);
    try {
      const res = await fetch(`/api/threads/${threadId}/comments/${id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${user.token}` }
      });
      if (res.status !== 204) {
        const data = await res.json();
        throw new Error(data.message || 'Delete failed');
      }
      dispatch({ type: 'DELETE_COMMENT', payload: id });
      if (editingId === id) resetForm();
    } catch (err) {
      setError(err.message);
    }
  };

  if (!thread) return <p>Loading...</p>;

  return (
    <div className={styles.container}>
      {error && <div className={styles.error}>{error}</div>}
      <h2 className={styles.title}>Discussion</h2>

      <div className={styles.listArea}>
        {thread.comments.map(c => (
          <div key={c._id} className={styles.commentCard}>
            <div className={styles.header}>
              <strong>{c.author.name}</strong>
              <div>
                <button className={styles.editBtn} onClick={() => handleEdit(c)}>Edit</button>
                <button className={styles.removeBtn} onClick={() => handleDelete(c._id)}>×</button>
              </div>
            </div>
            <p>{c.content}</p>
            <small>{new Date(c.createdAt).toLocaleString()}</small>
          </div>
        ))}
      </div>

      <div className={styles.formArea}>
        <form className={styles.controls} onSubmit={handleSubmit}>
          <textarea
            className={styles.textarea}
            name="content"
            placeholder="Write a comment..."
            value={formContent}
            onChange={e => setFormContent(e.target.value)}
            required
          />
          <button className={styles.button} type="submit">
            {editingId ? 'Update Comment' : 'Post Comment'}
          </button>
        </form>
      </div>
    </div>
  );
};

export default DiscussionThread;
