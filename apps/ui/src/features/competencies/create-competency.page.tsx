import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { createCompetency } from './competencies.api';
import styles from '../css/shared.module.css';

export function CreateCompetencyPage() {
  const navigate = useNavigate();

  const [step, setStep] = useState(1);

  const [competencyData, setCompetencyData] = useState({
    title: '',
    weight: '',
    threshold: '',
  });

  return (
    <div className={styles.page}>
      <div className={`${styles.card} ${styles.cardLarge}`}>
        <h2 className={styles.title}>Creazione Competenza</h2>

        {/* Indicatore visivo dello step */}
        <div
          style={{
            textAlign: 'center',
            marginBottom: '2rem',
            color: '#6b7280',
          }}
        >
          Step {step} di 4
        </div>

        {/* LOGICA DEGLI STEP */}
        {step === 1 && (
          <Step1Competency
            data={competencyData}
            onChange={setCompetencyData}
            onNext={() => setStep(2)}
          />
        )}

        {step === 2 && (
          <div>
            <h3>Step 2: Aggiungi Sottocompetenze</h3>
            <p>Qui metteremo il prossimo form...</p>
            {/* Bottone di undo */}
            <button className={styles.button} onClick={() => setStep(1)}>
              Indietro
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

function Step1Competency({ data, onChange, onNext }: any) {
  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    onNext();
  }

  return (
    <form onSubmit={handleSubmit} className={styles.form}>
      <div className={styles.field}>
        <label>
          Titolo <span className={styles.requiredAsterisk}>*</span>
        </label>
        <input
          type="text"
          required
          className={styles.input}
          value={data.title}
          onChange={(e) => onChange({ ...data, title: e.target.value })}
          placeholder="es. Definire l'idea progettuale"
        />
      </div>

      <div className={styles.field}>
        <label>
          Peso (1-5) <span className={styles.requiredAsterisk}>*</span>
        </label>
        <input
          type="number"
          min="1"
          max="5"
          required
          className={styles.input}
          value={data.weight}
          onChange={(e) => onChange({ ...data, weight: e.target.value })}
        />
      </div>

      <div className={styles.field}>
        <label>
          Soglia <span className={styles.requiredAsterisk}>*</span>
        </label>
        <input
          type="number"
          min="1"
          required
          className={styles.input}
          value={data.threshold}
          onChange={(e) => onChange({ ...data, threshold: e.target.value })}
        />
      </div>

      <button type="submit" className={styles.button}>
        Avanti
      </button>
    </form>
  );
}

/*async function handleSubmit(e: React.FormEvent) {
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
}*/
