import { useState } from 'react';

export function CreateRubricModal({ onSave }: any) {
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
    const levelsToSave = isBinary 
      ? [
          { description: levels[0].description, rank: 1 },
          { description: levels[1].description, rank: 5 }
        ]
      : levels;

    if (levelsToSave.some((l) => l.description.trim() === '')) {
      alert('Compila tutti i livelli della rubrica prima di salvare!');
      return;
    }

    onSave({ yesNo: isBinary, levels: levelsToSave });
  }

  const visibleLevels = isBinary ? 2 : 5;

  return (
    <div className="space-y-6 py-4">
      <div className="space-y-2">
        <label className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">Tipo di Rubrica</label>
        <select
          value={isBinary ? 'true' : 'false'}
          onChange={(e) => setIsBinary(e.target.value === 'true')}
          className="flex h-10 w-full rounded-md border border-gray-300 bg-transparent px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:cursor-not-allowed disabled:opacity-50"
        >
          <option value="false">Standard (5 Livelli)</option>
          <option value="true">Binaria (2 Livelli)</option>
        </select>
      </div>

      <div className="space-y-4">
        <label className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">Definisci i livelli:</label>
        {levels.slice(0, visibleLevels).map((level, index) => (
          <div key={index} className="flex gap-4 items-center">
            <span className="font-bold w-6 text-slate-700">{level.rank}.</span>
            <input
              type="text"
              placeholder={`Descrizione livello ${level.rank}`}
              value={level.description}
              onChange={(e) => handleLevelChange(index, e.target.value)}
              className="flex h-10 w-full rounded-md border border-gray-300 bg-transparent px-3 py-2 text-sm placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:cursor-not-allowed disabled:opacity-50"
            />
          </div>
        ))}
      </div>

      <div className="flex justify-end pt-4">
        <button 
          onClick={handleSaveClick} 
          className="inline-flex items-center justify-center rounded-md bg-emerald-600 px-4 py-2 text-sm font-medium text-white hover:bg-emerald-700 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:ring-offset-2 disabled:pointer-events-none disabled:opacity-50"
        >
          ✔ Conferma
        </button>
      </div>
    </div>
  );
}
