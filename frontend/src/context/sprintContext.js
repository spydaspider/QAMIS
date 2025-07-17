import React, { createContext, useReducer, useContext } from 'react';

export const SprintContext = createContext();

const sprintReducer = (state, action) => {
  switch (action.type) {
    case 'SET_SPRINTS':
      return { ...state, sprints: action.payload };
    case 'CREATE_SPRINT':
      return { ...state, sprints: [action.payload, ...state.sprints] };
    case 'UPDATE_SPRINT':
      return {
        ...state,
        sprints: state.sprints.map(s => s._id === action.payload._id ? action.payload : s)
      };
    case 'DELETE_SPRINT':
      return { ...state, sprints: state.sprints.filter(s => s._id !== action.payload) };
    default:
      return state;
  }
};

export const SprintContextProvider = ({ children }) => {
  const [state, dispatch] = useReducer(sprintReducer, { sprints: [] });
  return (
    <SprintContext.Provider value={{ ...state, dispatch }}>
      {children}
    </SprintContext.Provider>
  );
};

