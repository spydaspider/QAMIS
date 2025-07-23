import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import App from './App';
import { AuthContextProvider } from './context/authContext';
import { GroupsContextProvider } from './context/groupsContext';
import { ExperimentsContextProvider } from './context/experimentContext';
import { TestCasesContextProvider } from './context/TestCasesContext';
import { BugsContextProvider } from './context/logBugContext';
import { SprintContextProvider } from './context/sprintContext';
import { DiscussionProvider } from './context/discussionThreadContext';
const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  
     <React.StrictMode>
    <AuthContextProvider>
      <GroupsContextProvider>
        <ExperimentsContextProvider>
          <TestCasesContextProvider>
            <BugsContextProvider>
              <SprintContextProvider>
                <DiscussionProvider>
                  <App/>
                </DiscussionProvider>
              </SprintContextProvider>
        </BugsContextProvider>
        </TestCasesContextProvider>
        </ExperimentsContextProvider>
        </GroupsContextProvider>
      </AuthContextProvider>
  </React.StrictMode>
  
);

