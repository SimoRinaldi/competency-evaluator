import { Outlet, useNavigate } from 'react-router-dom';
import { useAuth } from '../auth/auth-context';
import styles from '../css/shared.module.css';

export function AppLayout() {
  const navigate = useNavigate();
  const { user, logout } = useAuth();

  function handleLogout() {
    logout();
    navigate('/login');
  }

  return (
    <>
      <nav className={styles.navbar}>
        <div
          className={styles.navBrand}
          onClick={() => navigate('/')}
          style={{ cursor: 'pointer' }}
        >
          Competency Evaluator
        </div>

        <div className={styles.navLinks}>
          <button onClick={() => navigate('/')}>Dashboard</button>
          
          <div className={styles.userSection}>
            {user && (
              <span className="text-sm text-gray-600 mr-2 font-medium">
                {user.name} ({user.role})
              </span>
            )}
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
