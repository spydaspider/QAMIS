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

const InstructorDashboard = () =>{
   
  //add images to the badges
const badges = [
  { name: 'Dashboard',             icon: dashboardIcon },
  { name: 'Groups',                icon: groupsIcon    },
  { name: 'QAReports',             icon: reportsIcon        },
  { name: 'LeaderBoard',           icon: leaderBoardIcon },
  { name: 'Submissions',           icon: submissionsIcon},
  { name: 'Alerts & Notifications', icon: alertsIcon    },
  { name: 'Milestones',            icon: milestonesIcon },
  { name: 'Resources',             icon: resourcesIcon  },
  { name: 'TestCase',              icon: testCaseIcon   },
];
    const message = "Instructor Dashboard";
    const [selectedBadge, setSelectedBadge] = useState("Dashboard");
   /*  const [showDashBoard, setShowDashBoard] = useState(true);
    const [showRestaurants, setShowRestaurants] = useState(false);
    const [showReviews,setShowReviews] = useState(false);
    const [showUsers, setShowUsers] = useState(false);
 */

  // Handle button click to update the selected state
  const handleBadgeClick = (badge) => {
    setSelectedBadge(badge);
    /*   if(badge === 'Dashboard')
      {
        setShowDashBoard(true);
        setShowRestaurants(false);
        setShowReviews(false);
        setShowUsers(false);
      }
      else if(badge === 'Restaurants')
      {
        setShowDashBoard(false);
        setShowRestaurants(true);
        setShowReviews(false);
        setShowUsers(false);
      }
      else if(badge === 'Reviews')
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
              
            </div>
            
        </div>
    
     )
}
export default InstructorDashboard;