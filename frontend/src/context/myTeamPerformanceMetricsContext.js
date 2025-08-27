// src/context/myTeamPerformanceMetricsContext.js
import React, { createContext, useReducer, useEffect } from 'react';

export const MyTeamPerformanceMetricsContext = createContext();

const initialState = {
  myTeam: JSON.parse(localStorage.getItem('myTeam')) || null,
  myMetrics: JSON.parse(localStorage.getItem('myMetrics')) || null,
};

const myTeamMetricsReducer = (state, action) => {
  switch (action.type) {
    case 'SET_MY_TEAM':
      localStorage.setItem('myTeam', JSON.stringify(action.payload));
      return { ...state, myTeam: action.payload };
    case 'SET_MY_METRICS':
      localStorage.setItem('myMetrics', JSON.stringify(action.payload));
      return { ...state, myMetrics: action.payload };
    case 'CLEAR_MY_TEAM':
      localStorage.removeItem('myTeam');
      localStorage.removeItem('myMetrics');
      return { ...state, myTeam: null, myMetrics: null };
    default:
      return state;
  }
};

export const MyTeamPerformanceMetricsProvider = ({ children }) => {
  const [state, dispatch] = useReducer(myTeamMetricsReducer, initialState);

  // Sync state with localStorage on change
  useEffect(() => {
    if (state.myTeam) {
      localStorage.setItem('myTeam', JSON.stringify(state.myTeam));
    }
    if (state.myMetrics) {
      localStorage.setItem('myMetrics', JSON.stringify(state.myMetrics));
    }
  }, [state.myTeam, state.myMetrics]);

  return (
    <MyTeamPerformanceMetricsContext.Provider value={{ ...state, dispatch }}>
      {children}
    </MyTeamPerformanceMetricsContext.Provider>
  );
};
