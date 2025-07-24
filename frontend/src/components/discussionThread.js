import { useState, useEffect } from 'react';
import { useAuthContext } from '../hooks/useAuthContext.js';
import { useDiscussionContext } from '../hooks/useDiscussionThreadContext.js';
import styles from './discussionThread.module.css';

const DiscussionThread = ({ parentType, parentId }) => {
  const { thread, dispatch } = useDiscussionContext();
  const { user } = useAuthContext();
  const [newThreadTitle, setNewThreadTitle] = useState('');
  const [formContent, setFormContent] = useState('');
  const [replyTo, setReplyTo] = useState(null);
  const [editingId, setEditingId] = useState(null);
  const [error, setError] = useState(null);

  // Create or load thread
  useEffect(() => {
    (async () => {
      try {
        // Attempt to fetch existing thread
        const res = await fetch(
          `/api/discussionThread?parentType=${parentType}&parentId=${parentId}`,
          { headers: user && { Authorization: `Bearer ${user.token}` } }
        );
        const data = await res.json();
        if (res.ok && data.thread) {
          dispatch({ type: 'SET_THREAD', payload: data.thread });
        }
      } catch { /* ignore */ }
    })();
  }, [parentType, parentId, user, dispatch]);

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
      if (!res.ok) throw new Error(data.message);
      dispatch({ type: 'SET_THREAD', payload: data.thread });
    } catch (err) {
      setError(err.message);
    }
  };

  const handleSubmit = async e => {
    e.preventDefault();
    if (!formContent.trim()) return setError('Content cannot be empty');
    setError(null);

    try {
      let url, method = 'POST', body = { author: user.userId, content: formContent };
      if (!thread) return; // no thread
      if (editingId) {
        url = `/api/discussionThread/${thread._id}/comments/${editingId}`;
        method = 'PUT';
      } else if (replyTo) {
        url = `/api/discussionThread/${thread._id}/comments/${replyTo}`;
        method = 'POST';
      } else {
        url = `/api/discussionThread/${thread._id}/comments`;
      }

      const res = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${user.token}`
        },
        body: JSON.stringify(body)
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.message);

      if (editingId) {
        dispatch({ type: 'UPDATE_COMMENT', payload: data.comment });
      } else if (replyTo) {
        dispatch({
          type: 'ADD_REPLY',
          payload: { parentCommentId: replyTo, reply: data.reply }
        });
      } else {
        dispatch({ type: 'ADD_COMMENT', payload: data.comment });
      }

      // reset form
      setFormContent('');
      setReplyTo(null);
      setEditingId(null);
    } catch (err) {
      setError(err.message);
    }
  };

  const startReply = id => {
    setReplyTo(id);
    setEditingId(null);
    setError(null);
  };

  const startEdit = c => {
    setEditingId(c._id);
    setReplyTo(null);
    setFormContent(c.content);
    setError(null);
  };

  const handleDelete = async id => {
    try {
      const res = await fetch(
        `/api/discussionThread/${thread._id}/comments/${id}`,
        {
          method: 'DELETE',
          headers: { Authorization: `Bearer ${user.token}` }
        }
      );
      if (res.status !== 204) {
        const data = await res.json();
        throw new Error(data.message);
      }
      dispatch({ type: 'DELETE_COMMENT', payload: id });
    } catch (err) {
      setError(err.message);
    }
  };

  if (!user) return <p>Please log in to view discussions.</p>;
  if (!thread)
    return (
      <div className={styles.container}>
        {error && <div className={styles.error}>{error}</div>}
        <button onClick={createThread} className={styles.button}>
          Start Discussion
        </button>
      </div>
    );

  const renderComments = (comments, level = 0) =>
    comments.map(c => (
      <div
        key={c._id}
        className={styles.commentCard}
        style={{ marginLeft: level * 20 }}
      >
        <div className={styles.header}>
          <strong>{c.author.name}</strong>
          <div>
            <button onClick={() => startReply(c._id)} className={styles.smallBtn}>
              Reply
            </button>
            <button onClick={() => startEdit(c)} className={styles.smallBtn}>
              Edit
            </button>
            <button onClick={() => handleDelete(c._id)} className={styles.smallBtn}>
              Delete
            </button>
          </div>
        </div>
        <p>{c.content}</p>
        <small>{new Date(c.createdAt).toLocaleString()}</small>
        {c.replies && renderComments(c.replies, level + 1)}
      </div>
    ));

  return (
    <div className={styles.container}>
      {error && <div className={styles.error}>{error}</div>}
      <h2 className={styles.title}>Discussion</h2>
      <div className={styles.threadArea}>{renderComments(thread.comments)}</div>

      <form className={styles.formArea} onSubmit={handleSubmit}>
        <textarea
          className={styles.textarea}
          value={formContent}
          placeholder={
            editingId
              ? 'Edit your comment…'
              : replyTo
              ? 'Write your reply…'
              : 'Write a comment…'
          }
          onChange={e => setFormContent(e.target.value)}
        />
        <button type="submit" className={styles.button}>
          {editingId ? 'Update' : 'Post'}
        </button>
      </form>
    </div>
  );
};

export default DiscussionThread;
