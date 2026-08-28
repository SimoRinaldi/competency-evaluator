import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { login } from './auth.api';
import styles from '../css/shared.module.css';

export function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError('');

    try {
      await login(email, password);
      // Se il login va a buon fine, passa alla dashboard
      navigate('/');
    } catch (err: any) {
      setError(err.message || 'Errore durante il login');
    }
  }

  return (
    <div className={styles.page}>
      <div className={`${styles.card} ${styles.cardSmall}`}>
        <h2 className={styles.title}>Accedi</h2>

        {error && <div className={styles.error}>{error}</div>}

        <form onSubmit={handleSubmit} className={styles.form}>
          <div className={styles.field}>
            <label>
              Email <span className={styles.requiredAsterisk}>*</span>
            </label>
            <input
              type="email"
              required
              className={styles.input}
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>
          <div className={styles.field}>
            <label>
              Password <span className={styles.requiredAsterisk}>*</span>
            </label>
            <input
              type="password"
              required
              className={styles.input}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>
          <button type="submit" className={styles.button}>
            Entra
          </button>
        </form>

        <div className={styles.message} style={{ marginTop: '1rem' }}>
          Non hai un account? <Link to="/register">Registrati qui</Link>
        </div>
      </div>
    </div>
  );
}
