import React,{ Fragment } from 'react';
import { NavLink } from 'react-router-dom';
import styles from './navbar.module.css';
import { useNavigate } from 'react-router-dom';
import { useLogout } from '../hooks/useLogout';
import { useAuthContext } from '../hooks/useAuthContext';
/* import homeIcon from '../assets/icons/home.png';
 */const Navbar = () =>{
      const { user } = useAuthContext();

    
    const navigate = useNavigate();
    const {logout} = useLogout();
     const handleLogout = () =>{
        logout();
        navigate('/');

    }
     
    return(
        <header>
            <div className={styles.navContainer}>
                <NavLink to="/" className={styles.chowRate}>
                    <div>QAMIS1.0</div>
                    
                </NavLink>

                <nav className={styles.mainNav}>
                 {/*  <NavLink className={({isActive}) =>(isActive ? styles.activeLink: styles.white)} to ="/"><img alt ="icon"/></NavLink>
                  <NavLink className={({isActive})=>(isActive ? styles.activeLink : styles.white)} to ="/studentDashBoard">StudentDash</NavLink>
                  <NavLink className={({isActive})=>(isActive ? styles.activeLink: styles.white)} to = "/contact">Contact Us</NavLink>

 */}
                  

                </nav>
               
               
                {user ? <button className={styles.logout}onClick={handleLogout}>logout</button>:<Fragment><NavLink to="/register">Signup</NavLink><NavLink to="/login">login</NavLink></Fragment>}
                
                
            </div>
        </header>
    )
}
export default Navbar;