// src/context/BugsContext.js
import { createContext, useReducer } from 'react';

export const BugsContext = createContext();

const initialState = { bugs: [] };

const bugsReducer = (state = initialState, action) => {
  const currentBugs = Array.isArray(state.bugs)
    ? state.bugs.filter(b => b && b._id)
    : [];

  switch (action.type) {
    case 'SET_BUGS':
      return {
        ...state,
        bugs: Array.isArray(action.payload)
          ? action.payload.filter(b => b && b._id)
          : []
      };
    case 'CREATE_BUG':
      return {
        ...state,
        bugs: [...currentBugs, action.payload]
      };
    case 'UPDATE_BUG':
      return {
        ...state,
        bugs: currentBugs.map(b => b._id === action.payload._id ? { ...b, ...action.payload } : b)
      };
    case 'DELETE_BUG':
      return {
        ...state,
        bugs: currentBugs.filter(b => b._id !== action.payload)
      };
    default:
      return state;
  }
};
export const BugsContextProvider = ({ children }) => {
  const [state, dispatch] = useReducer(bugsReducer, initialState);
  return (
    <BugsContext.Provider value={{ bugs: state.bugs, dispatch }}>
      {children}
    </BugsContext.Provider>
  );
};
