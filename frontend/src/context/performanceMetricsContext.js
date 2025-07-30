import React, { createContext, useReducer } from 'react';

export const PerformanceMetricsContext = createContext();

const initialState = {
  teams: [],
  // component manages metrics itself, so no fetchers here
};

const metricsReducer = (state, action) => {
  switch (action.type) {
    case 'SET_TEAMS':
      return { ...state, teams: action.payload };
    default:
      return state;
  }
};

export const PerformanceMetricsProvider = ({ children }) => {
  const [state, dispatch] = useReducer(metricsReducer, initialState);

  return (
    <PerformanceMetricsContext.Provider value={{ ...state, dispatch }}>
      {children}
    </PerformanceMetricsContext.Provider>
  );
};
