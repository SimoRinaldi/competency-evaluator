import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { createCompetency } from './competencies.api';
import styles from '../css/shared.module.css';

export function CreateCompetencyPage() {
  const [title, setTitle] = useState('');
  const [weight, setWeight] = useState('');
  const [threshold, setThreshold] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const navigate = useNavigate();

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      await createCompetency(title, Number(weight), Number(threshold));
      navigate('/');
    } catch (err: any) {
      setError(err.message || 'Errore durante la creazione');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className={styles.page}>
      <div className={`${styles.card} ${styles.cardSmall}`}>
        <h2 className={styles.title}>Nuova Competenza</h2>

        {error && <div className={styles.error}>{error}</div>}

        <form onSubmit={handleSubmit} className={styles.form}>
          <div className={styles.field}>
            <label>Titolo</label>
            <input
              type="text"
              required
              className={styles.input}
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="es. Definire l'idea progettuale"
            />
          </div>

          <div className={styles.field}>
            <label>Peso (1-5)</label>
            <input
              type="number"
              min="1"
              max="5"
              required
              className={styles.input}
              value={weight}
              onChange={(e) => setWeight(e.target.value)}
            />
          </div>

          <div className={styles.field}>
            <label>Soglia</label>
            <input
              type="number"
              min="1"
              required
              className={styles.input}
              value={threshold}
              onChange={(e) => setThreshold(e.target.value)}
            />
          </div>

          <button type="submit" className={styles.button} disabled={loading}>
            {loading ? 'Salvataggio...' : 'Avanti'}
          </button>
        </form>
      </div>
    </div>
  );
}
