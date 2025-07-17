import styles from './instructorDashboard.module.css';
import { useState } from 'react';
import dashboardIcon from '../assets/icons/Dashboard.png';
import logBugsIcon from '../assets/icons/logBugs.png';
import myBugsIcon from '../assets/icons/myBugs.png';
import leaderBoardIcon from '../assets/icons/leaderboard.png';
import discussionIcon from '../assets/icons/discussion.png';
import LogBug from "../components/logBug.js";
import ManageSprints from './sprintManagement.js';


const StudentDashboard = () =>{
   
  //add images to the badges
const badges = [
  { name: 'Dashboard',             icon: dashboardIcon },
  { name: 'Log a Bug',                icon: logBugsIcon    },
  {name: 'Sprints',                  icon: logBugsIcon},
  { name: 'My Bugs',             icon: myBugsIcon       },
  { name: 'Test Cases',           icon: leaderBoardIcon },
  { name: 'Discussion',           icon: discussionIcon},
 
];
    const message = "Instructor Dashboard";
    const [selectedBadge, setSelectedBadge] = useState("Dashboard");
    const [showLogBug, setShowLogBug] = useState(false);
    const [showSprints, setShowSprints] = useState(false);
  // Handle button click to update the selected state
  const handleBadgeClick = (badge) => {
    setSelectedBadge(badge);
       if(badge === 'Log a Bug')
      {
        setShowLogBug(true);
        setShowSprints(false);
       
      }
      else if(badge === 'Sprints')
      {
       setShowLogBug(false);
       setShowSprints(true);
      }
      /*else if(badge === 'Reviews')
      {
        setShowDashBoard(false);
        setShowRestaurants(false);
        setShowReviews(true);
        setShowUsers(false);
      }
      else{
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
              
            </div>
            
        </div>
    
     )
}
export default StudentDashboard;