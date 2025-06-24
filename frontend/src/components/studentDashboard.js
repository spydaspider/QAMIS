import styles from './instructorDashboard.module.css';
import { useState } from 'react';
import dashboardIcon from '../assets/icons/Dashboard.png';
import logBugsIcon from '../assets/icons/logBugs.png';
import myBugsIcon from '../assets/icons/myBugs.png';
import leaderBoardIcon from '../assets/icons/leaderboard.png';
import discussionIcon from '../assets/icons/discussion.png';


const StudentDashboard = () =>{
   
  //add images to the badges
const badges = [
  { name: 'Dashboard',             icon: dashboardIcon },
  { name: 'Log a Bug',                icon: logBugsIcon    },
  { name: 'My Bugs',             icon: myBugsIcon       },
  { name: 'Test Cases',           icon: leaderBoardIcon },
  { name: 'Discussion',           icon: discussionIcon},
 
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
export default StudentDashboard;