import {
  Field,
  FieldContent,
  FieldDescription,
  FieldLabel,
  FieldTitle,
} from "@/components/ui/field"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Button } from "@/components/ui/button"

export function CreateRubricForm({ 
  onSave, 
  onCancel,
  isBinary,
  setIsBinary,
  levels,
  setLevels
}: any) {

  function handleLevelChange(index: number, value: string) {
    const newLevels = [...levels];
    newLevels[index].description = value;
    setLevels(newLevels);
  }

  function handleSaveClick() {
    const binaryMode = isBinary === 'true';
    const levelsToSave = binaryMode 
      ? [
          { description: levels[0].description, rank: 1 },
          { description: levels[1].description, rank: 5 }
        ]
      : levels;

    if (levelsToSave.some((l) => l.description.trim() === '')) {
      alert('Compila tutti i livelli della rubrica prima di salvare!');
      return;
    }

    onSave({ yesNo: binaryMode, levels: levelsToSave });
  }

  const visibleLevels = isBinary === 'true' ? 2 : 5;

  return (
    <div className="space-y-6">
      <div className="space-y-4">
        <label className="text-sm font-semibold text-slate-800">Tipo di scala</label>
        <RadioGroup value={isBinary} onValueChange={setIsBinary} className="grid grid-cols-1 gap-2">
          <FieldLabel htmlFor="standard-plan">
            <Field orientation="horizontal" className="border rounded-md p-3 hover:bg-slate-50 transition-colors cursor-pointer">
              <FieldContent>
                <FieldTitle>Standard</FieldTitle>
                <FieldDescription>Definisci i livelli da 1 a 5</FieldDescription>
              </FieldContent>
              <RadioGroupItem value="false" id="standard-plan" />
            </Field>
          </FieldLabel>
          <FieldLabel htmlFor="binary-plan">
            <Field orientation="horizontal" className="border rounded-md p-3 hover:bg-slate-50 transition-colors cursor-pointer">
              <FieldContent>
                <FieldTitle>Binario</FieldTitle>
                <FieldDescription>Sì/No. Indicato per competenze nette.</FieldDescription>
              </FieldContent>
              <RadioGroupItem value="true" id="binary-plan" />
            </Field>
          </FieldLabel>
        </RadioGroup>
      </div>

      <div className="space-y-4">
        <label className="text-sm font-semibold text-slate-800">Definisci i livelli:</label>
        {levels.slice(0, visibleLevels).map((level: any, index: number) => {
          const displayRank = (isBinary === 'true' && index === 1) ? 5 : level.rank;
          return (
            <div key={index} className="flex gap-4 items-center">
              <span className="font-bold w-6 text-slate-700">{displayRank}.</span>
              <input
                type="text"
                placeholder={`Descrizione livello ${displayRank}`}
                value={level.description}
                onChange={(e) => handleLevelChange(index, e.target.value)}
                className="flex h-10 w-full rounded-md border border-gray-300 bg-transparent px-3 py-2 text-sm placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          );
        })}
      </div>

      <div className="flex justify-end gap-2 pt-4">
        {onCancel && (
          <Button variant="outline" onClick={onCancel}>
            Annulla
          </Button>
        )}
        <Button onClick={handleSaveClick}>
          Salva Rubrica
        </Button>
      </div>
    </div>
  );
}
