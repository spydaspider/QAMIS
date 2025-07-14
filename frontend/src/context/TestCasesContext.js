import { createContext, useReducer } from 'react';

export const TestCasesContext = createContext();

// Initial state shape
const initialState = { testCases: [] };

// Reducer with defaulted state parameter and guards
const testCasesReducer = (state = initialState, action) => {
  // Always ensure we have an array
  const currentTestCases = Array.isArray(state.testCases) ? state.testCases : [];

  switch (action.type) {
    case 'SET_TESTCASES': {
      // Sanitize payload: must be an array of objects
      const payloadArray = Array.isArray(action.payload) ? action.payload : [];
      return {
        ...state,
        testCases: payloadArray.filter(item => item && typeof item === 'object')
      };
    }
    case 'CREATE_TESTCASE': {
      // Only append valid object
      const newItem = action.payload && typeof action.payload === 'object' ? action.payload : null;
      return {
        ...state,
        testCases: newItem ? [...currentTestCases, newItem] : currentTestCases
      };
    }
    case 'UPDATE_TESTCASE':
      return {
        ...state,
        testCases: currentTestCases.map(tc =>
          tc && tc._id === action.payload._id ? action.payload : tc
        )
      };
    case 'DELETE_TESTCASE':
      return {
        ...state,
        testCases: currentTestCases.filter(tc => tc && tc._id !== action.payload)
      };
    default:
      return state;
  }
};

export const TestCasesContextProvider = ({ children }) => {
  const [state, dispatch] = useReducer(testCasesReducer, initialState);

  return (
    <TestCasesContext.Provider value={{ testCases: state.testCases, dispatch }}>
      {children}
    </TestCasesContext.Provider>
  );
};
