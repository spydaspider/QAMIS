
import { createContext, useReducer } from 'react';

export const ExperimentsContext = createContext();

const experimentsReducer = (state, action) => {
  switch (action.type) {
    case 'SET_EXPERIMENTS':
      return { ...state, experiments: action.payload };
    case 'CREATE_EXPERIMENT':
      return { ...state, experiments: [...state.experiments, action.payload] };
    case 'UPDATE_EXPERIMENT':
      return {
        ...state,
        experiments: state.experiments.map(exp =>
          exp._id === action.payload._id ? action.payload : exp
        )
      };
    case 'DELETE_EXPERIMENT':
      return {
        ...state,
        experiments: state.experiments.filter(exp => exp._id !== action.payload)
      };
    default:
      return state;
  }
};
export const ExperimentsContextProvider = ({ children }) => {
  const [state, dispatch] = useReducer(experimentsReducer, { experiments: [] });
  return (
    <ExperimentsContext.Provider value={{ ...state, dispatch }}>
      {children}
    </ExperimentsContext.Provider>
  );
};