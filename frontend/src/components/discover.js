import styles from './discover.module.css';
/* import chowRate from '../assets/chowrate.png';
 */const Discover =(props)=>{
    return(
    
        <div className={styles.leftBar}>
                <div className = {styles.leftTitle}>
                <div className={styles.mobileLeftTitleDiv}>ChowRate</div>
{/*                 <img src={chowRate} alt="chowrate "/>
 */}                </div>
                <h2 className={styles.center}>{props.message}</h2>
            </div>
    )
}
export default Discover;