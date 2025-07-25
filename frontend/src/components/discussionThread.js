import { useState, useEffect, useContext } from 'react';
import { useAuthContext } from '../hooks/useAuthContext';
import { DiscussionContext } from '../context/discussionThreadContext';
import styles from './discussionThread.module.css';

const DiscussionThread = ({ parentType, parentId }) => {
  const { user } = useAuthContext();
  const { threads, dispatch } = useContext(DiscussionContext);
  const thread = threads[parentId];
  const [content, setContent] = useState('');
  const [replyTo, setReplyTo] = useState(null);
  const [replyContent, setReplyContent] = useState('');
  const [error, setError] = useState(null);

  // Load discussion thread on mount
  useEffect(() => {
    if (!user || thread) return;
    (async () => {
      try {
        const res = await fetch(
          `/api/discussionThread?parentType=${parentType}&parentId=${parentId}`,
          {
            headers: {
              Authorization: `Bearer ${user.token}`,
            },
          }
        );
        const data = await res.json();
        if (res.ok && data.thread) {
          console.log("Loaded data",data.thread);
          dispatch({ type: 'SET_THREAD', parentId, payload: data.thread });
        }
      } catch {}
    })();
  }, [user, thread, parentType, parentId, dispatch]);

  const createThread = async () => {
    try {
      const res = await fetch('/api/discussionThread', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${user.token}`,
        },
        body: JSON.stringify({ parentType, parentId }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message);
      dispatch({ type: 'SET_THREAD', parentId, payload: data.thread });
    } catch (err) {
      setError(err.message);
    }
  };

  const submit = async (e, isReply = false, targetId = null) => {
    e.preventDefault();
    const text = isReply ? replyContent.trim() : content.trim();
    if (!text) return setError('Content cannot be empty');
    if (!thread?._id) return;

    try {
      const url = `/api/discussionThread/${thread._id}/comments${
        isReply ? `/${targetId}/reply` : ''
      }`;
      const res = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${user.token}`,
        },
        body: JSON.stringify({ content: text }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message);

      if (isReply) {
        dispatch({
          type: 'ADD_REPLY',
          parentId,
          payload: { parentCommentId: targetId, reply: data.reply },
        });
        setReplyContent('');
        setReplyTo(null);
      } else {
        dispatch({ type: 'ADD_COMMENT', parentId, payload: data.comment });
        setContent('');
      }
      setError(null);
    } catch (err) {
      setError(err.message);
    }
  };

  const flattenReplies = (replies, depth = 1) => {
    const result = [];
    replies.forEach(reply => {
      result.push({ ...reply, __depth: depth });
      if (reply.replies && reply.replies.length > 0) {
        result.push(...flattenReplies(reply.replies, depth + 1));
      }
    });
    return result;
  };

  const renderFlat = () => {
    const elements = [];

    thread.comments.forEach(comment => {
      // Top-level comment
      elements.push(
        <div key={comment._id} className={styles.commentCard}>
          <div className={styles.commentHeader}>
            <strong className={styles.author}>{comment.author.email}</strong>
            <span className={styles.date}>
              {new Date(comment.createdAt).toLocaleString()}
            </span>
            <button
              className={styles.replyBtn}
              onClick={() => setReplyTo(comment._id)}
            >
              Reply
            </button>
          </div>
          <p className={styles.commentBody}>{comment.content}</p>

          {replyTo === comment._id && (
            <form
              onSubmit={e => submit(e, true, comment._id)}
              className={styles.inlineForm}
            >
              <textarea
                className={styles.textarea}
                value={replyContent}
                onChange={e => setReplyContent(e.target.value)}
                placeholder="Write your reply…"
              />
              <button type="submit" className={styles.buttonSmall}>
                Post Reply
              </button>
            </form>
          )}
        </div>
      );

      // Flatten and render all nested replies
      const flatReplies = flattenReplies(comment.replies || []);
      flatReplies.forEach(reply => {
        elements.push(
          <div
            key={reply._id}
            className={`${styles.commentCard} ${styles.replyCard}`}
            style={{ marginLeft: `${reply.__depth * 16}px` }}
          >
            <div className={styles.commentHeader}>
              <strong className={styles.author}>{reply.author.email}</strong>
              <span className={styles.date}>
                {new Date(reply.createdAt).toLocaleString()}
              </span>
              <button
                className={styles.replyBtn}
                onClick={() => setReplyTo(reply._id)}
              >
                Reply
              </button>
            </div>
            <p className={styles.commentBody}>{reply.content}</p>

            {replyTo === reply._id && (
              <form
                onSubmit={e => submit(e, true, reply._id)}
                className={styles.inlineForm}
              >
                <textarea
                  className={styles.textarea}
                  value={replyContent}
                  onChange={e => setReplyContent(e.target.value)}
                  placeholder="Write your reply…"
                />
                <button type="submit" className={styles.buttonSmall}>
                  Post Reply
                </button>
              </form>
            )}
          </div>
        );
      });
    });

    return elements;
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

  return (
    <div className={styles.container}>
      {error && <div className={styles.error}>{error}</div>}
      <div className={styles.threadArea}>
        {thread.comments.length > 0 ? renderFlat() : <p>No comments yet.</p>}
      </div>

      <form onSubmit={e => submit(e, false)} className={styles.formArea}>
        <textarea
          className={styles.textarea}
          value={content}
          onChange={e => setContent(e.target.value)}
          placeholder="Write a comment…"
        />
        <button type="submit" className={styles.button}>
          Post Comment
        </button>
      </form>
    </div>
  );
};

export default DiscussionThread;
