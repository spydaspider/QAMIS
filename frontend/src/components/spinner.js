import styles from './spinner.module.css';
const Spinner = () => {
  return (
    <div className={styles.overlay}>
      <div className={styles.spinner} />
    </div>
  );
};

export default Spinner;