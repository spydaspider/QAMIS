import { createContext, useReducer } from 'react';

export const DiscussionContext = createContext();

const discussionReducer = (state, action) => {
  switch (action.type) {
    case 'SET_THREAD':
      return { ...state, [action.parentId]: action.payload };
    case 'ADD_COMMENT':
      return {
        ...state,
        [action.parentId]: {
          ...state[action.parentId],
          comments: [...state[action.parentId].comments, action.payload]
        }
      };
    case 'ADD_REPLY':
      const updateReplies = (comments, parentCommentId, reply) =>
        comments.map(c => {
          if (c._id === parentCommentId) {
            return { ...c, replies: [...(c.replies || []), reply] };
          }
          return {
            ...c,
            replies: updateReplies(c.replies || [], parentCommentId, reply)
          };
        });
      return {
        ...state,
        [action.parentId]: {
          ...state[action.parentId],
          comments: updateReplies(
            state[action.parentId].comments,
            action.payload.parentCommentId,
            action.payload.reply
          )
        }
      };
    default:
      return state;
  }
};

export const DiscussionProvider = ({ children }) => {
  const [state, dispatch] = useReducer(discussionReducer, {});
  return (
    <DiscussionContext.Provider value={{ threads: state, dispatch }}>
      {children}
    </DiscussionContext.Provider>
  );
};
