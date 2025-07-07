import styles from './authError.module.css';
const AuthError = (props) =>{
    
   return(
    <div className={styles.errorContainer}>
        <p>{props.message}</p>
    </div>
   )
}
export default AuthError;