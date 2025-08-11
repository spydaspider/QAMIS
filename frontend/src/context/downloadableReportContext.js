import { createContext, useReducer } from 'react';

export const QAReportContext = createContext();

const qaReportReducer = (state, action) => {
  switch (action.type) {
    case 'SET_REPORT':
      return { ...state, report: action.payload };
    case 'SET_LOADING':
      return { ...state, loading: action.payload };
    case 'SET_ERROR':
      return { ...state, error: action.payload };
    default:
      return state;
  }
};

export const QAReportProvider = ({ children }) => {
  const [state, dispatch] = useReducer(qaReportReducer, {
    report: null,
    loading: false,
    error: null
  });

  return (
    <QAReportContext.Provider value={{ ...state, dispatch }}>
      {children}
    </QAReportContext.Provider>
  );
};
