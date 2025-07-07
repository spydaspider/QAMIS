import styles from './signup.module.css';
import { Link } from 'react-router-dom';
import { useState } from 'react';
import { useLogin } from '../hooks/useLogin';
import { useNavigate } from 'react-router-dom';
import AuthError from './authError';
 import Discover from './discover';
import Spinner from './spinner';
/* import Loading from './loading';
 */const Login =()=>{
 
  const [email, setEmail] = useState('');
   const [password, setPassword] = useState('');
   const navigate = useNavigate();
     
    const { login,error,isLoading} = useLogin();
      const message = "Collaborative QA Experiment";
     
  
  const handleSubmit = async (e) =>{
    e.preventDefault();

      await login(email, password);
    /*   switch (role) {
        case "student":
          navigate("/studentDashboard");
          break;
        case "instructor":
          navigate("/instructorDashboard");
          break;
        default:
      }   */
    
  }
    return(
        <div className={styles.background}>
         {isLoading && <Spinner/>}

        <div className={styles.container}>
        
            <Discover message = {message}/>
            
            
            <div className={styles.right}>
                <div className={styles.topRight}>
                <p>I don't have an account?</p>
                <Link to="/register">Sign up</Link>
                </div>
                <form onSubmit={handleSubmit} className={styles.form}>
                    <h2 className={styles.center}>Login</h2>
                    <input className = {styles.registerInput} type ="email" value = {email} onChange={(e)=>setEmail(e.target.value)} placeholder="email address"/>
                    
                    <input className={styles.registerInput} type="password" value = {password} onChange = {(e)=>setPassword(e.target.value)} placeholder="password"/>
                   
                    <button className={styles.signIn}>login</button>
                     {error && <AuthError message = {error}/>}
 
                  

                </form>
            </div>

        </div>
        </div>
    )
}
export default Login;