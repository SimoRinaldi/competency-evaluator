import { useState } from 'react';
import styles from '../../css/shared.module.css';

export function CreateRubricInline({ onSave }: any) {
  const [isBinary, setIsBinary] = useState(false);

  const [levels, setLevels] = useState([
    { description: '', rank: 1 },
    { description: '', rank: 2 },
    { description: '', rank: 3 },
    { description: '', rank: 4 },
    { description: '', rank: 5 },
  ]);

  function handleLevelChange(index: number, value: string) {
    const newLevels = [...levels];
    newLevels[index].description = value;
    setLevels(newLevels);
  }

  function handleSaveClick() {
    const levelsToSave = isBinary ? levels.slice(0, 2) : levels;

    if (levelsToSave.some((l) => l.description.trim() === '')) {
      alert('Compila tutti i livelli della rubrica prima di salvare!');
      return;
    }

    onSave({ yesNo: isBinary, levels: levelsToSave });
  }

  const visibleLevels = isBinary ? 2 : 5;

  return (
    <div
      style={{
        marginTop: '1rem',
        padding: '1rem',
        border: '2px dashed #9ca3af',
        borderRadius: '8px',
        backgroundColor: '#f9fafb',
      }}
    >
      <h4 style={{ marginTop: 0 }}>Configura Nuova Rubrica</h4>

      <div className={styles.field}>
        <label>Tipo di Rubrica:</label>
        <select
          className={styles.input}
          value={isBinary ? 'true' : 'false'}
          onChange={(e) => setIsBinary(e.target.value === 'true')}
        >
          <option value="false">5 Livelli</option>
          <option value="true">2 Livelli</option>
        </select>
      </div>

      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          gap: '10px',
          marginTop: '1rem',
        }}
      >
        <label>Definisci i livelli:</label>

        {levels.slice(0, visibleLevels).map((level, index) => (
          <div
            key={index}
            style={{ display: 'flex', gap: '10px', alignItems: 'center' }}
          >
            <span style={{ fontWeight: 'bold', width: '20px' }}>
              {level.rank}.
            </span>
            <input
              type="text"
              className={styles.input}
              placeholder={`Descrizione livello ${level.rank}`}
              value={level.description}
              onChange={(e) => handleLevelChange(index, e.target.value)}
            />
          </div>
        ))}
      </div>

      <button
        type="button"
        className={styles.button}
        style={{ marginTop: '1.5rem', backgroundColor: '#10b981' }}
        onClick={handleSaveClick}
      >
        ✔ Conferma e Usa questa Rubrica
      </button>
    </div>
  );
}
