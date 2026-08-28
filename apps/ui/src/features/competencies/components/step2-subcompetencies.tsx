import { useState } from 'react';
import styles from '../../css/shared.module.css';

export function Step2SubCompetencies({ list, onAdd, onNext, onPrev }: any) {
  const [title, setTitle] = useState('');
  const [weight, setWeight] = useState('');
  const [input, setInput] = useState('');
  const [output, setOutput] = useState('');
  const [action, setAction] = useState('');
  const [threshold, setThreshold] = useState('');

  function handleAdd(e: React.FormEvent) {
    e.preventDefault();
    onAdd({ title, weight, input, output, action, threshold });
    setTitle('');
    setWeight('');
    setInput('');
    setOutput('');
    setAction('');
    setThreshold('');
  }

  return (
    <div className={styles.page}>
      <div className={`${styles.card} ${styles.cardLarge}`}>
        <h2 className={styles.title}>Aggiungi Sottocompetenze</h2>

        {/* LISTA DELLE SOTTOCOMPETENZE GIA' AGGIUNTE */}
        <div style={{ marginBottom: '2rem' }}>
          <h4>Sottocompetenze attuali ({list.length}):</h4>
          <ul>
            {list.map((item: any, index: number) => (
              <li key={index}>
                {item.title} ( Peso: {item.weight}, Input: {item.input}
                Output: {item.output}
                Azione: {item.action}
                Soglia: {item.threshold})
              </li>
            ))}
          </ul>
        </div>

        {/* FORM PER AGGIUNGERNE UNA NUOVA */}
        <form onSubmit={handleAdd} className={styles.form}>
          {/* TUO COMPITO: Incolla qui i 3 <div className={styles.field}> per Titolo, Peso e Soglia.
                   (Usa setTitle, setWeight, ecc. negli onChange) */}
          <div className={styles.field}>
            <label>
              Titolo <span className={styles.requiredAsterisk}>*</span>
            </label>
            <input
              type="text"
              required
              className={styles.input}
              value={title}
              onChange={(e) => setTitle(e.target.value)}
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
              value={weight}
              onChange={(e) => setWeight(e.target.value)}
            />
          </div>

          <div className={styles.field}>
            <label>Input</label>
            <input
              type="text"
              className={styles.input}
              value={input}
              onChange={(e) => setInput(e.target.value)}
            />
          </div>

          <div className={styles.field}>
            <label>Output</label>
            <input
              type="text"
              className={styles.input}
              value={output}
              onChange={(e) => setOutput(e.target.value)}
            />
          </div>

          <div className={styles.field}>
            <label>Azione</label>
            <input
              type="text"
              className={styles.input}
              value={action}
              onChange={(e) => setAction(e.target.value)}
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
              value={threshold}
              onChange={(e) => setThreshold(e.target.value)}
            />
          </div>

          <button type="submit" className={styles.button}>
            + Aggiungi alla lista
          </button>
        </form>

        <hr style={{ margin: '2rem 0' }} />

        {/* TASTI DI NAVIGAZIONE WIZARD */}
        <div style={{ display: 'flex', justifyContent: 'space-between' }}>
          <button
            type="button"
            className={styles.button}
            onClick={onPrev}
            style={{ backgroundColor: 'gray' }}
          >
            Indietro
          </button>

          <button
            type="button"
            className={styles.button}
            onClick={onNext}
            disabled={list.length === 0} // Blocca "Avanti" se la lista è vuota!
          >
            Avanti
          </button>
        </div>
      </div>
    </div>
  );
}
