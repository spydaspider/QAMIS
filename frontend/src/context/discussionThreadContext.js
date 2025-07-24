import { createContext, useReducer} from 'react';

export const DiscussionContext = createContext();

const discussionReducer = (state, action) => {
  switch (action.type) {
    case 'SET_THREAD':
      return { ...state, thread: action.payload };
    case 'ADD_COMMENT':
      // top‐level
      return {
        ...state,
        thread: {
          ...state.thread,
          comments: [...state.thread.comments, action.payload]
        }
      };
    case 'ADD_REPLY':
      // nested reply
      return {
        ...state,
        thread: {
          ...state.thread,
          comments: state.thread.comments.map(c =>
            c._id === action.payload.parentCommentId
              ? { ...c, replies: [...(c.replies||[]), action.payload.reply] }
              : c
          )
        }
      };
    case 'UPDATE_COMMENT':
      // update anywhere
      const updateList = list =>
        list.map(item =>
          item._id === action.payload._id
            ? action.payload
            : { 
                ...item,
                replies: item.replies ? updateList(item.replies) : []
              }
        );
      return {
        ...state,
        thread: { ...state.thread, comments: updateList(state.thread.comments) }
      };
    case 'DELETE_COMMENT':
      // delete anywhere
      const deleteFrom = list =>
        list
          .filter(item => item._id !== action.payload)
          .map(item => ({
            ...item,
            replies: item.replies ? deleteFrom(item.replies) : []
          }));
      return {
        ...state,
        thread: { ...state.thread, comments: deleteFrom(state.thread.comments) }
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

