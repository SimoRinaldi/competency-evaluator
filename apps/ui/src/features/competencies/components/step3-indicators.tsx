import { useState, useEffect } from 'react';
import { fetchRubrics } from '../competencies.api';
import { CreateRubricInline } from './create-rubric-inline';
import styles from '../../css/shared.module.css';

export function Step3Indicators({
  subCompetencies,
  indicators,
  onAdd,
  onNext,
  onPrev,
  newRubrics,
  onAddRubric,
}: any) {
  const [selectedSubIndex, setSelectedSubIndex] = useState('');
  const [description, setDescription] = useState('');
  const [weight, setWeight] = useState('');
  const [rubricId, setRubricId] = useState('');

  const [dbRubrics, setDbRubrics] = useState<any[]>([]);
  const [showRubricForm, setShowRubricForm] = useState(false);

  // all'apertura del form scarica le rubriche dal server
  useEffect(() => {
    fetchRubrics()
      .then((data) => setDbRubrics(data))
      .catch((err) => console.error('Errore rubriche:', err));
  }, []);

  function handleAdd(e: React.FormEvent) {
    e.preventDefault();

    onAdd({
      subIndex: Number(selectedSubIndex),
      description,
      weight,
      rubricId,
    });

    setDescription('');
    setWeight('');
    setRubricId('');
  }

  // variabile di controllo per abilitare il pulsante 'AVANTI'
  const canGoNext = subCompetencies.every((sub: any, index: number) => {
    const hasAtLeastOneIndicator = indicators.some(
      (ind: any) => ind.subIndex === index
    );
    return hasAtLeastOneIndicator;
  });

  return (
    <>
      <h2 className={styles.title}>
        Aggiungi Indicatori agli Oggetti di osservazione
      </h2>

      {/* RIEPILOGO DEGLI INDICATORI GIA' INSERITI */}
      <div style={{ marginBottom: '2rem', marginTop: '1rem' }}>
        <h4>Indicatori creati ({indicators.length}):</h4>

        {/* TUO COMPITO: Mappa l'array 'indicators' e stampa una <ul> con le info dell'indicatore */}
        <ul>
          {indicators.map((item: any, index: number) => {
            // recupera il titolo della sotto-competenza a cui appartiene
            const parentSub = subCompetencies[item.subIndex];

            return (
              <li key={index} style={{ marginBottom: '1rem' }}>
                <strong>{item.description}</strong> (Peso: {item.weight},
                RubricId: {item.rubricId}) <br />
                <span style={{ color: 'gray', fontSize: '0.9em' }}>
                  Collegamento a: {parentSub ? parentSub.title : 'Sconosciuto'}
                </span>
              </li>
            );
          })}
        </ul>
      </div>

      <form onSubmit={handleAdd} className={styles.form}>
        {/* Tendina per scegliere l'Oggetto di osservazione/Sottocompetenza */}
        <div className={styles.field}>
          <label>
            Collega alla Sottocompetenza
            <span className={styles.requiredAsterisk}>*</span>
          </label>
          <select
            required
            className={styles.input}
            value={selectedSubIndex}
            onChange={(e) => setSelectedSubIndex(e.target.value)}
          >
            <option value="">-- Scegli Sottocompetenza --</option>
            {subCompetencies.map((sub: any, index: number) => (
              <option key={index} value={index}>
                {sub.title} (Oggetto di osservazione: {sub.obsDescription})
              </option>
            ))}
          </select>
        </div>

        {/* Campo Descrizione */}
        <div className={styles.field}>
          <label>
            Descrizione Indicatore
            <span className={styles.requiredAsterisk}>*</span>
          </label>
          <input
            type="text"
            required
            className={styles.input}
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="es. Lo studente usa il vocabolario corretto"
          />
        </div>

        {/* Campo Peso */}
        <div className={styles.field}>
          <label>
            Peso Indicatore
            <span className={styles.requiredAsterisk}>*</span>
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

        {/* Campo RubricId a tendina */}
        <div className={styles.field}>
          <label>
            Rubrica di Valutazione
            <span className={styles.requiredAsterisk}>*</span>
          </label>
          <div style={{ display: 'flex', gap: '10px' }}>
            <select
              required={!showRubricForm} // Se si sta creando una nuova rubrica, non è obbligatorio scegliere dalla tendina
              className={styles.input}
              value={rubricId}
              onChange={(e) => setRubricId(e.target.value)}
              disabled={showRubricForm}
            >
              <option value="">-- Seleziona una Rubrica --</option>

              <optgroup label="Rubriche nel Database">
                {dbRubrics.map((r: any) => (
                  <option key={`db_${r.id}`} value={r.id}>
                    Rubrica DB #{r.id} ({r.yes_no ? 'Binaria' : 'Standard'})
                  </option>
                ))}
              </optgroup>

              {newRubrics.length > 0 && (
                <optgroup label="Nuove rubriche">
                  {newRubrics.map((r: any, idx: number) => (
                    <option key={`temp_${idx}`} value={`temp_${idx}`}>
                      Nuova Rubrica #{idx + 1} (
                      {r.yesNo ? 'Binaria' : 'Standard'})
                    </option>
                  ))}
                </optgroup>
              )}
            </select>

            <button
              type="button"
              className={styles.button}
              style={{
                width: 'auto',
                whiteSpace: 'nowrap',
                backgroundColor: showRubricForm ? 'gray' : '#3b82f6',
              }}
              onClick={() => setShowRubricForm(!showRubricForm)}
            >
              {showRubricForm ? 'Annulla' : '+ Crea Nuova'}
            </button>
          </div>
        </div>

        {/* Form a comparsa per creare la rubrica */}
        {showRubricForm && (
          <CreateRubricInline
            onSave={(rubricData: any) => {
              onAddRubric(rubricData); // salva la rubrica nella memoria del wizard
              setRubricId(`temp_${newRubrics.length}`);
              setShowRubricForm(false);
            }}
          />
        )}

        <button type="submit" className={styles.button}>
          + Aggiungi Indicatore
        </button>
      </form>

      <hr style={{ margin: '2rem 0' }} />

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
          disabled={!canGoNext}
        >
          Avanti
        </button>
      </div>
    </>
  );
}
