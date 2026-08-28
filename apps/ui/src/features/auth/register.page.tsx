import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { register, UserRole } from './auth.api';
import styles from '../css/shared.module.css';

export function RegisterPage() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState<UserRole>('USER');
  const [error, setError] = useState('');
  const navigate = useNavigate();

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError('');

    try {
      await register(name, email, password, role);
      navigate('/login');
    } catch (err: any) {
      setError(err.message || 'Errore durante la registrazione');
    }
  }

  return (
    <div className={styles.page}>
      <div className={`${styles.card} ${styles.cardSmall}`}>
        <h2 className={styles.title}>Crea un Account</h2>

        {error && (
          <div className={styles.error}>
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className={styles.form}>
          <div className={styles.field}>
            <label>Nome Completo</label>
            <input
              type="text"
              required
              className={styles.input}
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
          </div>

          <div className={styles.field}>
            <label>Email</label>
            <input
              type="email"
              required
              className={styles.input}
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>

          <div className={styles.field}>
            <label>Password</label>
            <input
              type="password"
              required
              className={styles.input}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>

          <div className={styles.field}>
            <label>Ruolo</label>
            <select
              className={styles.input}
              value={role}
              onChange={(e) => setRole(e.target.value as UserRole)}
            >
              <option value={'USER'}>Utente</option>
              <option value={'ADMIN'}>Amministratore</option>
              <option value={'TEST_DESIGNER'}>Test designer</option>
              <option value={'EVALUATOR'}>Valutatore</option>
            </select>
          </div>

          <button type="submit" className={styles.button}>
            Registrati
          </button>
        </form>

        <div className={styles.message} style={{ marginTop: '1rem' }}>
          Hai già un account?{' '}
          <Link to="/login">Accedi qui</Link>
        </div>
      </div>
    </div>
  );
}
