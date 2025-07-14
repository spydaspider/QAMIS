import { createContext, useReducer } from 'react';

export const TestCasesContext = createContext();

// Initial state shape
const initialState = { testCases: [] };

// Reducer with defaulted state parameter and simplified guards
const testCasesReducer = (state = initialState, action) => {
  // Normalize to a clean array of valid test cases
  const currentTestCases = Array.isArray(state.testCases)
    ? state.testCases.filter(tc => tc && tc._id)
    : [];

  switch (action.type) {
    case 'SET_TESTCASES': {
      const payloadArray = Array.isArray(action.payload) ? action.payload : [];
      return {
        ...state,
        testCases: payloadArray.filter(tc => tc && tc._id)
      };
    }
    case 'CREATE_TESTCASE': {
      const newItem = action.payload && action.payload._id ? action.payload : null;
      return {
        ...state,
        testCases: newItem ? [...currentTestCases, newItem] : currentTestCases
      };
    }
    case 'UPDATE_TESTCASE': {
      const updated = action.payload;
      const updatedId = updated && updated._id ? updated._id.toString() : null;
      // Map and merge, using string comparison
      return {
        ...state,
        testCases: currentTestCases.map(tc => {
          const tcId = tc && tc._id ? tc._id.toString() : null;
          return tcId === updatedId ? { ...tc, ...updated } : tc;
        })
      };
    }
    case 'DELETE_TESTCASE':
      return {
        ...state,
        testCases: currentTestCases.filter(tc => tc._id !== action.payload)
      };
    default:
      return state;
  }
};

// Context provider wrapping your app's components
export const TestCasesContextProvider = ({ children }) => {
  const [state, dispatch] = useReducer(testCasesReducer, initialState);

  return (
    <TestCasesContext.Provider value={{ testCases: state.testCases, dispatch }}>
      {children}
    </TestCasesContext.Provider>
  );
};
