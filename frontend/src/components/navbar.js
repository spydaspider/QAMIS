import React,{ Fragment } from 'react';
import { NavLink } from 'react-router-dom';
import styles from './navbar.module.css';
import { useNavigate } from 'react-router-dom';
import homeIcon from '../assets/icons/home.png';
const Navbar = () =>{
    
    const navigate = useNavigate();
   /*  const handleLogout = () =>{
        logout();
        navigate('/login');

    }
     */
    return(
        <header>
            <div className={styles.navContainer}>
                <NavLink to="/" className={styles.chowRate}>
                    <div>QAExperimenta</div>
                    
                </NavLink>

                <nav className={styles.mainNav}>
                  <NavLink className={({isActive}) =>(isActive ? styles.activeLink: styles.white)} to ="/"><img src={homeIcon}/></NavLink>
                  <NavLink className={({isActive})=>(isActive ? styles.activeLink : styles.white)} to ="/studentDashBoard">StudentDash</NavLink>
                  <NavLink className={({isActive})=>(isActive ? styles.activeLink: styles.white)} to = "/contact">Contact Us</NavLink>


                  

                </nav>
                <div className={styles.restaurantList}>
{/*                 <NavLink className={({isActive})=>(isActive ? styles.activeLink: styles.white)} to = "/restaurants">List Your Restaurant</NavLink>
 */}

                </div>

               
{/*                 {user ? <button className={styles.logout}onClick={handleLogout}>logout</button>:<Fragment><NavLink to="/register">Signup</NavLink><NavLink to="/login">login</NavLink></Fragment>}
 */}                
                
            </div>
        </header>
    )
}
export default Navbar;