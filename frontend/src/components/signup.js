import styles from './signup.module.css';
import { Link } from 'react-router-dom';
import { useState } from 'react';
import { useSignup } from '../hooks/useSignup';
import { useNavigate } from 'react-router-dom';
import AuthError from './authError';
 import Discover from './discover';
import Spinner from './spinner';
/* import Loading from './loading';
 */const Register =()=>{
 const [role, setRole] = useState("");
  const [email, setEmail] = useState('');
   const [firstName, setFirstName] = useState('');
   const [lastName, setLastName] = useState('');
   const [password, setPassword] = useState('');
   const navigate = useNavigate();
     const [confirmPassword, setConfirmPassword] = useState('');
    const { signup,error,isLoading} = useSignup();
      const message = "Collaborative QA Experiment";
     const handleRoleChange = (event) =>{
        setRole(event.target.value)
     }
  
  const handleSubmit = async (e) =>{
    e.preventDefault();
    const username = firstName+" "+lastName;
    if (!role) {
        return;
      }
      await signup(username, email, password, confirmPassword, role);
      switch (role) {
        case "student":
          navigate("/studentDashboard");
          break;
        case "instructor":
          navigate("/instructorDashboard");
          break;
        default:
      }  
    
  }
    return(
        <div className={styles.background}>
         {isLoading && <Spinner/>}

        <div className={styles.container}>
        
            <Discover message = {message}/>
            
            
            <div className={styles.right}>
                <div className={styles.topRight}>
                <p>I Already have an account?</p>
                <Link to="/login">Sign in</Link>
                </div>
                <form onSubmit={handleSubmit} className={styles.form}>
                    <h2 className={styles.center}>Register</h2>
                    <input className = {styles.registerInput} type ="email" value = {email} onChange={(e)=>setEmail(e.target.value)} placeholder="email address"/>
                    <div className = {styles.names}>
                        <input className={styles.flexRegisterInput} type="text" value = {firstName} onChange = {(e)=>setFirstName(e.target.value)} placeholder="First name"/>
                        <input className={styles.flexRegisterInput} type="text" value = {lastName} onChange = {(e)=>setLastName(e.target.value)} placeholder="Last name"/>
                    </div>
                    <input className={styles.registerInput} type="password" value = {password} onChange = {(e)=>setPassword(e.target.value)} placeholder="password"/>
                    <input className={styles.registerInput} type="password" value = {confirmPassword} onChange = {(e)=>setConfirmPassword(e.target.value)} placeholder="confirm password"/>
                    <label htmlFor="role" className={styles.label}>
        Select Your Role:
      </label>
      <select
        id="role"
        value={role}
        onChange={handleRoleChange}
        className={styles.select}
        required
      >
        <option value="" disabled>
          -- Select a Role --
        </option>
        <option value="student">student</option>
        <option value="instructor">instructor</option>
        
      </select>
                    <button className={styles.signIn}>register</button>
                     {error && <AuthError message = {error}/>}
 
                  

                </form>
            </div>

        </div>
        </div>
    )
}
export default Register;