import styles from './instructorDashboard.module.css';
import { useState } from 'react';
import dashboardIcon from '../assets/icons/Dashboard.png';
import logBugsIcon from '../assets/icons/logBugs.png';
import myBugsIcon from '../assets/icons/myBugs.png';
import leaderBoardIcon from '../assets/icons/leaderboard.png';
import discussionIcon from '../assets/icons/discussion.png';
import LogBug from "../components/logBug.js";
import ManageSprints from './sprintManagement.js';
import TestCaseExecution from './testCaseExecution.js';
import BugList from './myBugs.js';


const StudentDashboard = () =>{
   
  //add images to the badges
const badges = [
  { name: 'Dashboard',             icon: dashboardIcon },
  { name: 'Log a Bug',                icon: logBugsIcon    },
  {name: 'Defect Data',                  icon: logBugsIcon},
  { name: 'My Bugs',             icon: myBugsIcon       },
  { name: 'Test Case Execution',           icon: leaderBoardIcon },
  { name: 'Discussion',           icon: discussionIcon},
 
];
    const message = "Instructor Dashboard";
    const [selectedBadge, setSelectedBadge] = useState("Dashboard");
    const [showLogBug, setShowLogBug] = useState(false);
    const [showSprints, setShowSprints] = useState(false);
    const [showTestCaseExecution, setShowTestCaseExecution] = useState(false);
    const [showMyBugs, setShowMyBugs] = useState(false);
  // Handle button click to update the selected state
  const handleBadgeClick = (badge) => {
    setSelectedBadge(badge);
       if(badge === 'Log a Bug')
      {
        setShowLogBug(true);
        setShowSprints(false);
        setShowTestCaseExecution(false);
        setShowMyBugs(false);
      }
      else if(badge === 'Defect Data')
      {
       setShowLogBug(false);
       setShowSprints(true);
       setShowTestCaseExecution(false);
       setShowMyBugs(false);
      }
      else if(badge === 'Test Case Execution')
      {
        setShowLogBug(false);
       setShowSprints(false);
       setShowTestCaseExecution(true);
       setShowMyBugs(false);
       
      }
      else if(badge === 'My Bugs')
      {
       setShowLogBug(false);
       setShowSprints(false);
       setShowTestCaseExecution(false);
       setShowMyBugs(true);

      }
      /*else{
        setShowDashBoard(false);
        setShowRestaurants(false);
        setShowReviews(false);
        setShowUsers(true);
      } */
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
                <div className={styles.down}>
                     <button>Logout</button>
                </div>

              </div>
              {/* {showDashBoard && <Dashboard  users={users} reviews={reviews} restaurants ={restaurants} />}
              {showRestaurants && <RestaurantsAndBars restaurants ={restaurants} handleRefetchData = {handleRefetchData }  />}
              {showReviews && <AdminReviews reviews={reviews}  handleRefetchData = {handleRefetchData } />}
              {showUsers && <AdminUsers  users = {users} handleRefetchData = {handleRefetchData } />}
              */}
              {showLogBug && <LogBug/>}
              {showSprints && <ManageSprints/>}
              {showTestCaseExecution && <TestCaseExecution/>}
              {showMyBugs && <BugList/>}
              
            </div>
            
        </div>
    
     )
}
export default StudentDashboard;