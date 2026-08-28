import styles from '../../css/shared.module.css';

export function Step1Competency({ data, onChange, onNext }: any) {
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
