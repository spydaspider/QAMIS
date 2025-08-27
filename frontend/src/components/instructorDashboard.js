import styles from './instructorDashboard.module.css';
import { useState } from 'react';
import dashboardIcon from '../assets/icons/Dashboard.png';
import reportsIcon from '../assets/icons/reports.png';
import groupsIcon from '../assets/icons/groups.png';
import leaderBoardIcon from '../assets/icons/leaderboard.png';
import submissionsIcon from '../assets/icons/submissions.png';
import alertsIcon from '../assets/icons/Alerts.png';
import milestonesIcon from '../assets/icons/milestones.png';
import resourcesIcon from '../assets/icons/resources.png';
import testCaseIcon from '../assets/icons/testcase.png';
import InstructorControlPanel from './instructorDashboardSummary.js';
import InstructorGroups from './instructorGroups';
import ExperimentManagement from './experiments';
import ManageTestCases from './testCase';
import PerformanceMetrics from './performanceMetrics';
import DownloadQAReport from './downloadableReport';
import BugList from './myBugs.js';
import TestCaseList from './myTestCases.js';


const InstructorDashboard = () =>{
   
  //add images to the badges
const badges = [
  { name: 'Dashboard',             icon: dashboardIcon },
   { name: 'Experiments',             icon: testCaseIcon },
  { name: 'Groups',                icon: groupsIcon    },
  { name: 'Test Case',              icon: testCaseIcon   },
    { name: 'Performance Metrics',           icon: submissionsIcon},

/*   { name: 'LeaderBoard',           icon: leaderBoardIcon },
 */  {name: 'Bugs Discussion', icon: groupsIcon},
  {name: 'Test Case Discussion', icon: groupsIcon},
    { name: 'QAReports',             icon: reportsIcon        },

/*   { name: 'Alerts & Notifications', icon: alertsIcon    },
 *//*   { name: 'Milestones',            icon: milestonesIcon },
 */ 
/*  { name: 'Resources',             icon: resourcesIcon  },
 */  
];
    const message = "Instructor Dashboard";
    const [selectedBadge, setSelectedBadge] = useState("Dashboard");
    const [showInstructorMetricsView, setShowInstructorMetricsView] = useState(true);
    const [showInstructorGroups, setShowInstructorGroups] = useState(false);
    const [showExperimentManagement, setShowExperimentManagement] = useState(false);
    const [showManageTestCase, setShowManageTestCase] = useState(false);
    const [showPerformanceMetrics, setShowPerformanceMetrics] = useState(false);
    const [showQAReports, setShowQAReports] = useState(false);
    const [showBugsDiscussion, setShowBugsDiscussion] = useState(false);
    const [showTestCaseDiscussion, setShowTestCaseDiscussion] = useState(false);
   

  // Handle button click to update the selected state
  const handleBadgeClick = (badge) => {
    setSelectedBadge(badge);
       if(badge === 'Dashboard')
      {
        setShowInstructorMetricsView(true);
        setShowInstructorGroups(false);
        setShowExperimentManagement(false);
        setShowManageTestCase(false);
        setShowPerformanceMetrics(false);
        setShowQAReports(false);
        setShowBugsDiscussion(false);
        setShowTestCaseDiscussion(false);



      }
      else if(badge === 'Experiments')
      {
         setShowInstructorMetricsView(false);
        setShowInstructorGroups(false);
        setShowExperimentManagement(true);
        setShowManageTestCase(false);
        setShowPerformanceMetrics(false);
        setShowQAReports(false);
        setShowBugsDiscussion(false);
        setShowTestCaseDiscussion(false);




      }
      else if(badge === 'Groups')
      {
        setShowInstructorMetricsView(false);
        setShowInstructorGroups(true);
        setShowExperimentManagement(false);
        setShowManageTestCase(false);
        setShowPerformanceMetrics(false);
        setShowQAReports(false);
        setShowBugsDiscussion(false);
        setShowTestCaseDiscussion(false);




      }
      else if(badge === 'Test Case')
      {
        setShowInstructorMetricsView(false);
        setShowInstructorGroups(false);
        setShowExperimentManagement(false);
        setShowManageTestCase(true);
        setShowPerformanceMetrics(false);
        setShowQAReports(false);
        setShowBugsDiscussion(false);
        setShowTestCaseDiscussion(false);




        
      }
      else if(badge === 'Performance Metrics')
      {
        setShowInstructorMetricsView(false);
        setShowInstructorGroups(false);
        setShowExperimentManagement(false);
        setShowManageTestCase(false);
        setShowPerformanceMetrics(true);
        setShowQAReports(false);
        setShowBugsDiscussion(false);
        setShowTestCaseDiscussion(false);



      }
      else if(badge === 'QAReports')
      {
        setShowInstructorMetricsView(false);
        setShowInstructorGroups(false);
        setShowExperimentManagement(false);
        setShowManageTestCase(false);
        setShowPerformanceMetrics(false);
        setShowQAReports(true);
        setShowBugsDiscussion(false);
        setShowTestCaseDiscussion(false);



      }
      else if(badge === 'Bugs Discussion')
      {
        setShowInstructorMetricsView(false);
        setShowInstructorGroups(false);
        setShowExperimentManagement(false);
        setShowManageTestCase(false);
        setShowPerformanceMetrics(false);
        setShowQAReports(false);
        setShowBugsDiscussion(true);
        setShowTestCaseDiscussion(false);

      }
      else if(badge === 'Test Case Discussion')
      {
        setShowInstructorMetricsView(false);
        setShowInstructorGroups(false);
        setShowExperimentManagement(false);
        setShowManageTestCase(false);
        setShowPerformanceMetrics(false);
        setShowQAReports(false);
        setShowBugsDiscussion(false);
        setShowTestCaseDiscussion(true);

      }
    
  };

     return(
        <div className={styles.container}>
        
            <div className={styles.middle}>
            <div className={styles.left}>
                <div className={styles.top}>
                {badges.map(({name,icon}) => (
               <button
              key={name}
              className={`${styles.badge} ${selectedBadge === name ? styles.selected : ''}`}
              onClick={() => handleBadgeClick(name)}
            >
               <img src={icon} alt="" className={styles.badgeIcon} />
              <span>{name}</span>
              </button>
            ))}
                </div>
                
              </div>
                {showInstructorMetricsView && <InstructorControlPanel/>}
              {showInstructorGroups && <InstructorGroups/>}
               {showExperimentManagement && <ExperimentManagement/>}
               {showManageTestCase && <ManageTestCases/>}
               {showPerformanceMetrics && <PerformanceMetrics/>}
               {showQAReports && <DownloadQAReport/>}
               {showBugsDiscussion && <BugList/>}
               {showTestCaseDiscussion && <TestCaseList/>}
             {/*} {showRestaurants && <RestaurantsAndBars restaurants ={restaurants} handleRefetchData = {handleRefetchData }  />}
              {showReviews && <AdminReviews reviews={reviews}  handleRefetchData = {handleRefetchData } />}
              {showUsers && <AdminUsers  users = {users} handleRefetchData = {handleRefetchData } />}
              */}
              
            </div>
            
        </div>
    
     )
}
export default InstructorDashboard;