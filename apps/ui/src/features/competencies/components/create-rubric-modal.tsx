import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

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
    const levelsToSave = isBinary ? levels.slice(0, 2) : levels;

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
        <Label>Tipo di Rubrica</Label>
        <Select 
          value={isBinary ? 'true' : 'false'} 
          onValueChange={(val) => setIsBinary(val === 'true')}
        >
          <SelectTrigger>
            <SelectValue placeholder="Seleziona..." />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="false">Standard (5 Livelli)</SelectItem>
            <SelectItem value="true">Binaria (2 Livelli)</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-4">
        <Label>Definisci i livelli:</Label>
        {levels.slice(0, visibleLevels).map((level, index) => (
          <div key={index} className="flex gap-4 items-center">
            <span className="font-bold w-6 text-slate-700">{level.rank}.</span>
            <Input
              type="text"
              placeholder={`Descrizione livello ${level.rank}`}
              value={level.description}
              onChange={(e) => handleLevelChange(index, e.target.value)}
            />
          </div>
        ))}
      </div>

      <div className="flex justify-end pt-4">
        <Button onClick={handleSaveClick} className="bg-emerald-600 hover:bg-emerald-700">
          ✔ Conferma
        </Button>
      </div>
    </div>
  );
}
