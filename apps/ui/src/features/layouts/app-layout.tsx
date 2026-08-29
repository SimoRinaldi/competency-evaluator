import { Outlet, useNavigate, Link } from 'react-router-dom';
import styles from '../css/shared.module.css';

export function AppLayout() {
  const navigate = useNavigate();

  function handleLogout() {
    localStorage.removeItem('access_token');
    navigate('/login');
  }

  return (
    <>
      <nav className={styles.navbar}>
        <div className={styles.navBrand} onClick={() => navigate('/')}>
          Competency Evaluator
        </div>

        <div className={styles.navLinks}>
          <button onClick={() => navigate('/')}>Dashboard</button>
          
          <div className={styles.userSection}>
            <button className={styles.dangerButton} onClick={handleLogout}>
              Esci
            </button>
          </div>
        </div>
      </nav>

      <main className={styles.page}>
        <Outlet />
      </main>
    </>
  );
}
