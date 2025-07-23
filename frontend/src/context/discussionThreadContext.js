// Context: DiscussionContext.js
import { createContext, useReducer } from 'react';

export const DiscussionContext = createContext();

const discussionReducer = (state, action) => {
  switch (action.type) {
    case 'SET_THREAD':
      return { ...state, thread: action.payload };

    case 'ADD_COMMENT':
      return { ...state, thread: { ...state.thread, comments: [...state.thread.comments, action.payload] } };

    case 'UPDATE_COMMENT':
      return {
        ...state,
        thread: {
          ...state.thread,
          comments: state.thread.comments.map(c =>
            c._id === action.payload._id ? action.payload : c
          )
        }
      };

    case 'DELETE_COMMENT':
      return {
        ...state,
        thread: {
          ...state.thread,
          comments: state.thread.comments.filter(c => c._id !== action.payload)
        }
      };

    default:
      return state;
  }
};

export const DiscussionProvider = ({ children }) => {
  const [state, dispatch] = useReducer(discussionReducer, { thread: null });
  return (
    <DiscussionContext.Provider value={{ ...state, dispatch }}>
      {children}
    </DiscussionContext.Provider>
  );
};