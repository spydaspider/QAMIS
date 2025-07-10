// useGroupsContext and provider fix:
// GroupsContextProvider.js
import { createContext, useReducer } from 'react';
export const GroupsContext = createContext();
const groupsReducer = (state, action) => {
  switch (action.type) {
    case 'SET_GROUPS':
      return { ...state, groups: action.payload };
    case 'CREATE_GROUPS':
      return { ...state, groups: [...state.groups, action.payload] };
    case 'UPDATE_GROUPS':
      return {
        ...state,
        groups: state.groups.map(g => g._id === action.payload._id ? action.payload : g)
      };
    case 'DELETE_GROUPS':
      return { ...state, groups: state.groups.filter(g => g._id !== action.payload) };
    default:
      return state;
  }
};
export const GroupsContextProvider = ({ children }) => {
  const [state, dispatch] = useReducer(groupsReducer, { groups: [] });
  return (
    <GroupsContext.Provider value={{ ...state, dispatch }}>
      {children}
    </GroupsContext.Provider>
  );
};
