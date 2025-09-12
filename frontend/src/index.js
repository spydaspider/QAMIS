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
import { PerformanceMetricsProvider } from './context/performanceMetricsContext';
import { QAReportProvider } from './context/downloadableReportContext';
import { DashboardProvider } from './context/instructorDashboardSummaryContext';
import { TeamDashboardProvider } from './context/teamDashboardSummaryContext';
import { MyTeamPerformanceMetricsProvider } from './context/myTeamPerformanceMetricsContext';
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
                  <PerformanceMetricsProvider>
                    <QAReportProvider>
                      <DashboardProvider>
                        <TeamDashboardProvider>
                          <MyTeamPerformanceMetricsProvider>
                        
                              <App/>
                            
                            </MyTeamPerformanceMetricsProvider>
                              

                        </TeamDashboardProvider>

                      </DashboardProvider>

                    </QAReportProvider>
                  </PerformanceMetricsProvider>
                </DiscussionProvider>
              </SprintContextProvider>
        </BugsContextProvider>
        </TestCasesContextProvider>
        </ExperimentsContextProvider>
        </GroupsContextProvider>
      </AuthContextProvider>
  </React.StrictMode>
  
);

