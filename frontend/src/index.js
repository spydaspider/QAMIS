import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import App from './App';
import { AuthContextProvider } from './context/authContext';
import { GroupsContextProvider } from './context/groupsContext';
import { ExperimentsContextProvider } from './context/experimentContext';
import { TestCasesContextProvider } from './context/TestCasesContext';
import { BugsContextProvider } from './context/logBugContext';

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  
     <React.StrictMode>
    <AuthContextProvider>
      <GroupsContextProvider>
        <ExperimentsContextProvider>
          <TestCasesContextProvider>
            <BugsContextProvider>
        <App/>
        </BugsContextProvider>
        </TestCasesContextProvider>
        </ExperimentsContextProvider>
        </GroupsContextProvider>
      </AuthContextProvider>
  </React.StrictMode>
  
);

